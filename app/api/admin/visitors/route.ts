import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { connectDB } from "@/lib/db/mongoose";
import { config } from "@/lib/config";
import { VisitorSession } from "@/models/VisitorSession";

export async function GET(req: Request) {
  try {
    const token = await getToken({ req: req as any, secret: config.NEXTAUTH_SECRET });
    
    if (!token || (token as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Get active and idle visitors (last 30 minutes)
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    
    const visitors = await VisitorSession.find({
      lastActivity: { $gte: thirtyMinutesAgo },
      status: { $in: ["active", "idle"] },
    })
      .sort({ lastActivity: -1 })
      .limit(100)
      .lean();

    return NextResponse.json(visitors);
  } catch (error) {
    console.error("Error fetching visitors:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
