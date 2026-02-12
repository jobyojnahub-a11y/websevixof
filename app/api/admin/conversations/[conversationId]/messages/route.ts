import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { connectDB } from "@/lib/db/mongoose";
import { config } from "@/lib/config";
import { Conversation } from "@/models/Conversation";
import { Message } from "@/models/Message";

export async function GET(
  req: Request,
  { params }: { params: { conversationId: string } }
) {
  try {
    const token = await getToken({ req: req as any, secret: config.NEXTAUTH_SECRET });
    
    if (!token || (token as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Find conversation first
    const conversation = await Conversation.findOne({ conversationId: params.conversationId });
    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    const messages = await Message.find({ 
      conversationKey: params.conversationId 
    })
      .sort({ timestamp: 1 })
      .lean();

    // Transform messages to match frontend format
    const transformedMessages = messages.map((msg: any) => ({
      _id: msg._id,
      role: msg.senderRole === "admin" ? "admin" : msg.senderRole === "client" ? "user" : "user",
      content: msg.message,
      timestamp: msg.timestamp,
    }));

    return NextResponse.json(transformedMessages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: { conversationId: string } }
) {
  try {
    const token = await getToken({ req: req as any, secret: config.NEXTAUTH_SECRET });
    
    if (!token || (token as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { content } = await req.json();
    if (!content || !content.trim()) {
      return NextResponse.json({ error: "Message content required" }, { status: 400 });
    }

    await connectDB();

    // Find conversation
    const conversation = await Conversation.findOne({ conversationId: params.conversationId });
    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    // Create admin message
    const message = new Message({
      conversationId: conversation._id,
      conversationKey: params.conversationId,
      senderRole: "admin",
      senderName: (token as any).name || "Admin",
      senderId: (token as any).uid ? (token as any).uid : undefined,
      messageType: "text",
      message: content.trim(),
      timestamp: new Date(),
      read: false,
    });

    await message.save();

    // Update conversation
    await Conversation.findOneAndUpdate(
      { conversationId: params.conversationId },
      {
        lastMessageAt: new Date(),
        $inc: { unreadCountClient: 1 },
        adminId: (token as any).uid,
      }
    );

    return NextResponse.json({ success: true, message });
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
