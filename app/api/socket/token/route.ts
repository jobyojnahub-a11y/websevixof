import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { signSocketToken } from "@/lib/auth/socketToken";
import { connectDB } from "@/lib/db/mongoose";
import { User } from "@/models/User";
import { authOptions } from "@/lib/auth/options";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    // DIRECT APPROACH: Use getServerSession directly (most reliable)
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      console.error("No session found - user not authenticated");
      return NextResponse.json({ ok: false, error: "Unauthorized - Please login first" }, { status: 401 });
    }

    const userEmail = session.user.email;
    if (!userEmail) {
      console.error("Session exists but email is missing");
      return NextResponse.json({ ok: false, error: "Invalid session - email missing" }, { status: 400 });
    }

    // Fetch user from database using email (ALWAYS - most reliable)
    await connectDB();
    const user = await User.findOne({ email: userEmail.toLowerCase().trim() })
      .select("_id fullName role email")
      .lean();

    if (!user) {
      console.error("User not found in database for email:", userEmail);
      return NextResponse.json({ ok: false, error: "User not found in database" }, { status: 404 });
    }

    // Extract all required fields from database
    const sub = user._id.toString();
    const role = user.role as "client" | "admin";
    const name = user.fullName || session.user.name || "User";

    console.log("Socket token generation:", { sub, role, name, email: userEmail });

    // Generate socket token
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

