import type { NextApiRequest } from "next";
import type { NextApiResponseServerIO } from "@/types/socket";
import { Server as IOServer } from "socket.io";
import { connectDB } from "@/lib/db/mongoose";
import { verifySocketToken } from "@/lib/auth/socketToken";
import { VisitorSession } from "@/models/VisitorSession";
import { Conversation } from "@/models/Conversation";
import { Message } from "@/models/Message";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponseServerIO) {
  if (!res.socket.server.io) {
    const io = new IOServer(res.socket.server, {
      path: "/api/socket",
      addTrailingSlash: false,
    });

    res.socket.server.io = io;

    io.on("connection", async (socket) => {
      const token = socket.handshake.auth?.token as string | undefined;
      const visitorSessionId = socket.handshake.auth?.visitorSessionId as string | undefined;

      let identity: { role: "visitor" | "client" | "admin"; sub: string; name?: string } | null = null;

      if (token) {
        try {
          const payload = verifySocketToken(token);
          identity = { role: payload.role, sub: payload.sub, name: payload.name };
        } catch {
          // ignore; treat as visitor
        }
      }

      if (!identity) {
        identity = { role: "visitor", sub: visitorSessionId || socket.id, name: "Visitor" };
      }

      socket.data.identity = identity;

      // rooms
      socket.join(`identity:${identity.role}:${identity.sub}`);
      if (identity.role === "admin") socket.join("admin-room");

      socket.on("visitor_connected", async (data) => {
        try {
          await connectDB();
          if (identity?.role !== "visitor") return;

          const { sessionId, visitorId, landingPage, currentPage, referrer, device, browser, os, ipAddress, country, city } =
            data || {};

          if (!sessionId || !visitorId || !landingPage || !currentPage) return;

          const now = new Date();
          const doc = await VisitorSession.findOneAndUpdate(
            { sessionId },
            {
              $setOnInsert: {
                sessionId,
                visitorId,
                landingPage,
                sessionStart: now,
              },
              $set: {
                currentPage,
                referrer,
                device,
                browser,
                os,
                ipAddress,
                country,
                city,
                status: "active",
                lastActivity: now,
              },
              $push: {
                pagesVisited: { page: currentPage, timestamp: now },
              },
            },
            { upsert: true, new: true }
          );

          io.to("admin-room").emit("new_visitor", doc);
          io.to("admin-room").emit("visitor_update", doc);
        } catch (e) {
          console.error("visitor_connected error", e);
        }
      });

      socket.on("page_change", async (data) => {
        try {
          await connectDB();
          const { sessionId, newPage, timeOnPreviousPage } = data || {};
          if (!sessionId || !newPage) return;
          const now = new Date();

          const doc = await VisitorSession.findOneAndUpdate(
            { sessionId },
            {
              $set: {
                currentPage: newPage,
                lastActivity: now,
                status: "active",
              },
              $inc: {
                timeOnSite: typeof timeOnPreviousPage === "number" ? Math.max(0, timeOnPreviousPage) : 0,
              },
              $push: {
                pagesVisited: { page: newPage, timestamp: now, timeSpent: timeOnPreviousPage },
              },
            },
            { new: true }
          );

          if (doc) io.to("admin-room").emit("visitor_update", doc);
        } catch (e) {
          console.error("page_change error", e);
        }
      });

      socket.on("visitor_action", async (data) => {
        try {
          await connectDB();
          const { sessionId, action, element } = data || {};
          if (!sessionId || !action) return;
          const now = new Date();

          const doc = await VisitorSession.findOneAndUpdate(
            { sessionId },
            {
              $set: { lastActivity: now, status: "active" },
              $push: { actions: { action, element, timestamp: now } },
            },
            { new: true }
          );
          if (doc) io.to("admin-room").emit("visitor_update", doc);
        } catch (e) {
          console.error("visitor_action error", e);
        }
      });

      socket.on("visitor_idle", async (data) => {
        try {
          await connectDB();
          const { sessionId } = data || {};
          if (!sessionId) return;
          const doc = await VisitorSession.findOneAndUpdate({ sessionId }, { $set: { status: "idle" } }, { new: true });
          if (doc) io.to("admin-room").emit("visitor_update", doc);
        } catch (e) {
          console.error("visitor_idle error", e);
        }
      });

      socket.on("visitor_left", async (data) => {
        try {
          await connectDB();
          const { sessionId } = data || {};
          if (!sessionId) return;
          const doc = await VisitorSession.findOneAndUpdate(
            { sessionId },
            { $set: { status: "left", lastActivity: new Date() } },
            { new: true }
          );
          if (doc) io.to("admin-room").emit("visitor_left", { sessionId });
        } catch (e) {
          console.error("visitor_left error", e);
        }
      });

      socket.on("admin_connect_request", async (data) => {
        try {
          await connectDB();
          if (identity?.role !== "admin") return;
          const { visitorSessionId: sid, message } = data || {};
          if (!sid) return;

          await VisitorSession.findOneAndUpdate(
            { sessionId: sid },
            { $set: { adminConnectionOffered: true, adminConnectionResponse: "pending" } }
          );

          io.to(`identity:visitor:${sid}`).emit("connection_request", {
            visitorSessionId: sid,
            message: message || "Hi! Need any help?",
          });
          io.to("admin-room").emit("visitor_connection_offered", { sessionId: sid });
        } catch (e) {
          console.error("admin_connect_request error", e);
        }
      });

      socket.on("connection_response", async (data) => {
        try {
          await connectDB();
          const { visitorSessionId: sid, accepted } = data || {};
          if (!sid) return;

          await VisitorSession.findOneAndUpdate(
            { sessionId: sid },
            {
              $set: {
                connectedWithAdmin: !!accepted,
                adminConnectionResponse: accepted ? "accepted" : "declined",
              },
            }
          );

          io.to("admin-room").emit("visitor_connection_response", { sessionId: sid, accepted: !!accepted });
          if (accepted) {
            io.to(`identity:visitor:${sid}`).emit("chat_open", { visitorSessionId: sid });
          }
        } catch (e) {
          console.error("connection_response error", e);
        }
      });

      socket.on("typing", (data) => {
        const { conversationId, sender } = data || {};
        if (!conversationId) return;
        socket.to(`conv:${conversationId}`).emit("typing", { conversationId, sender });
      });

      socket.on("stop_typing", (data) => {
        const { conversationId, sender } = data || {};
        if (!conversationId) return;
        socket.to(`conv:${conversationId}`).emit("stop_typing", { conversationId, sender });
      });

      socket.on("join_conversation", (data) => {
        const { conversationId } = data || {};
        if (!conversationId) return;
        socket.join(`conv:${conversationId}`);
      });

      socket.on("send_message", async (data) => {
        try {
          await connectDB();
          const { conversationId, senderRole, senderName, message, fileUrl, fileName } = data || {};
          if (!conversationId || !senderRole || !senderName || !message) return;

          let conv = await Conversation.findOne({ conversationId });
          if (!conv) {
            // Auto-create conversation for visitor pre-order chat
            const isVisitorConv = String(conversationId).startsWith("VISITOR-");
            const sid = isVisitorConv ? String(conversationId).replace("VISITOR-", "") : undefined;
            conv = await Conversation.create({
              conversationId,
              participantType: isVisitorConv ? "visitor" : "client",
              visitorSessionId: sid,
              status: "active",
              priority: "medium",
              unreadCountAdmin: 0,
              unreadCountClient: 0,
              tags: [],
            });
            if (sid) {
              await VisitorSession.updateOne(
                { sessionId: sid },
                { $set: { chatInitiated: true, conversationId: conv._id } }
              );
            }
          }

          const msg = await Message.create({
            conversationId: conv._id,
            conversationKey: conversationId,
            senderRole,
            senderName,
            messageType: fileUrl ? "file" : "text",
            message,
            fileUrl,
            fileName,
            timestamp: new Date(),
            read: false,
          });

          await Conversation.updateOne(
            { _id: conv._id },
            {
              $set: { lastMessageAt: msg.timestamp },
              $inc: {
                unreadCountAdmin: senderRole === "admin" ? 0 : 1,
                unreadCountClient: senderRole === "admin" ? 1 : 0,
              },
            }
          );

          io.to(`conv:${conversationId}`).emit("receive_message", msg);
        } catch (e) {
          console.error("send_message error", e);
        }
      });

      socket.on("disconnect", () => {
        // no-op; client sends visitor_left explicitly
      });
    });
  }

  res.end();
}

