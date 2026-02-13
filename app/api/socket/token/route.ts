import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { signSocketToken } from "@/lib/auth/socketToken";
import { config } from "@/lib/config";
import { connectDB } from "@/lib/db/mongoose";
import { User } from "@/models/User";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const token = await getToken({ req: req as any, secret: config.NEXTAUTH_SECRET });
    if (!token) {
      return NextResponse.json({ ok: false, error: "Unauthorized - No session found" }, { status: 401 });
    }

    const role = (token as any).role as "client" | "admin";
    const email = (token as any).email || token.email;
    const name = (token as any).name as string | undefined;

    // Try to get user ID from token
    let sub = (token as any).uid || (token as any).id || token.sub || (token as any).sub;

    // If still no ID, get it from database using email
    if (!sub && email) {
      try {
        await connectDB();
        const user = await User.findOne({ email }).select("_id").lean();
        if (user) {
          sub = user._id.toString();
        }
      } catch (dbError) {
        console.error("Database error:", dbError);
      }
    }

    if (!sub) {
      console.error("Token structure:", {
        uid: (token as any).uid,
        id: (token as any).id,
        sub: token.sub,
        email: email,
        role: (token as any).role,
        allKeys: Object.keys(token),
      });
      return NextResponse.json({ ok: false, error: "Invalid token - missing user ID" }, { status: 400 });
    }

    const socketToken = signSocketToken({ role, sub, name });
    return NextResponse.json({ ok: true, token: socketToken, role });
  } catch (error) {
    console.error("Socket token error:", error);
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}

