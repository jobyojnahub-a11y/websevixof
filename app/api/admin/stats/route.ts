import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { connectDB } from "@/lib/db/mongoose";
import { config } from "@/lib/config";
import { Order } from "@/models/Order";
import { Conversation } from "@/models/Conversation";
import { VisitorSession } from "@/models/VisitorSession";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const token = await getToken({ req: req as any, secret: config.NEXTAUTH_SECRET });
    
    if (!token || (token as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const [totalVisitors, activeConversations, totalOrders] = await Promise.all([
      VisitorSession.countDocuments(),
      Conversation.countDocuments({ status: "active" }),
      Order.countDocuments(),
    ]);

    return NextResponse.json({
      totalVisitors,
      activeConversations,
      totalOrders,
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
