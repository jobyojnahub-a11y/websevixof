import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { signSocketToken } from "@/lib/auth/socketToken";
import { connectDB } from "@/lib/db/mongoose";
import { User } from "@/models/User";
import { config } from "@/lib/config";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    console.log("Socket token request received");
    
    // Use getToken which works reliably in App Router API routes
    const token = await getToken({ 
      req: req as any, 
      secret: config.NEXTAUTH_SECRET 
    });

    if (!token) {
      console.error("No token found - user not authenticated");
      return NextResponse.json({ ok: false, error: "Unauthorized - Please login first" }, { status: 401 });
    }

    console.log("Token found, keys:", Object.keys(token));

    const userEmail = token.email;
    if (!userEmail) {
      console.error("Token exists but email is missing. Token:", JSON.stringify(token, null, 2));
      return NextResponse.json({ ok: false, error: "Invalid token - email missing" }, { status: 400 });
    }

    console.log("User email from token:", userEmail);

    // Fetch user from database using email (ALWAYS - most reliable)
    console.log("Connecting to database...");
    await connectDB();
    
    console.log("Searching for user with email:", userEmail);
    const user = await User.findOne({ email: userEmail.toLowerCase().trim() })
      .select("_id fullName role email")
      .lean();

    if (!user) {
      console.error("User not found in database for email:", userEmail);
      return NextResponse.json({ ok: false, error: "User not found in database" }, { status: 404 });
    }

    console.log("User found in database:", { id: user._id, role: user.role, name: user.fullName });

    // Extract all required fields from database
    const sub = user._id.toString();
    const role = user.role as "client" | "admin";
    const name = user.fullName || token.name || "User";

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

