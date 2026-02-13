import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { connectDB } from "@/lib/db/mongoose";
import { config } from "@/lib/config";
import { User } from "@/models/User";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const token = await getToken({ req: req as any, secret: config.NEXTAUTH_SECRET });
    
    if (!token || (token as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Get active clients (logged in within last 24 hours)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const clients = await User.find({
      role: "client",
      $or: [
        { lastLogin: { $gte: twentyFourHoursAgo } },
        { createdAt: { $gte: twentyFourHoursAgo } },
      ],
    })
      .select("email fullName lastLogin role")
      .sort({ lastLogin: -1 })
      .limit(100)
      .lean();

    return NextResponse.json(clients);
  } catch (error) {
    console.error("Error fetching clients:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
