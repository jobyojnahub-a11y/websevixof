import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { connectDB } from "@/lib/db/mongoose";
import { config } from "@/lib/config";
import { VisitorSession } from "@/models/VisitorSession";
import { Conversation } from "@/models/Conversation";

export async function POST(req: Request) {
  try {
    const token = await getToken({ req: req as any, secret: config.NEXTAUTH_SECRET });
    
    if (!token || (token as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { visitorSessionId } = await req.json();
    if (!visitorSessionId) {
      return NextResponse.json({ error: "Visitor session ID required" }, { status: 400 });
    }

    await connectDB();

    // Find visitor session
    const visitorSession = await VisitorSession.findOne({ sessionId: visitorSessionId });
    if (!visitorSession) {
      return NextResponse.json({ error: "Visitor session not found" }, { status: 404 });
    }

    // Check if conversation already exists
    let conversation = await Conversation.findOne({ visitorSessionId });

    if (!conversation) {
      // Create new conversation
      const conversationId = `VISITOR-${visitorSessionId}`;
      conversation = new Conversation({
        conversationId,
        participantType: "visitor",
        visitorSessionId,
        adminId: (token as any).uid,
        status: "active",
        priority: "medium",
        unreadCountAdmin: 0,
        unreadCountClient: 0,
        tags: [],
        convertedToOrder: false,
      });

      await conversation.save();

      // Update visitor session
      visitorSession.conversationId = conversation._id;
      visitorSession.connectedWithAdmin = true;
      visitorSession.adminConnectionOffered = true;
      visitorSession.adminConnectionResponse = "accepted";
      await visitorSession.save();
    } else {
      // Update existing conversation
      conversation.adminId = (token as any).uid;
      conversation.status = "active";
      await conversation.save();
    }

    // TODO: Send socket event to visitor to open chat
    // This would require socket.io server integration

    return NextResponse.json({
      success: true,
      conversationId: conversation.conversationId,
      message: "Connected with visitor successfully",
    });
  } catch (error) {
    console.error("Error connecting with visitor:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
