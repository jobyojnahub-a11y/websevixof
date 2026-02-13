import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { connectDB } from "@/lib/db/mongoose";
import { config } from "@/lib/config";
import { Conversation } from "@/models/Conversation";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const token = await getToken({ req: req as any, secret: config.NEXTAUTH_SECRET });
    
    if (!token || (token as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const conversations = await Conversation.find()
      .sort({ lastMessageAt: -1, createdAt: -1 })
      .limit(100)
      .lean();

    return NextResponse.json(conversations);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
