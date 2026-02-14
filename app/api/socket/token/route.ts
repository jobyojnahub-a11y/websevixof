import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { getServerSession } from "next-auth";
import { signSocketToken } from "@/lib/auth/socketToken";
import { config } from "@/lib/config";
import { connectDB } from "@/lib/db/mongoose";
import { User } from "@/models/User";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    // Log request headers for debugging
    const cookieHeader = req.headers.get("cookie");
    console.log("Socket token request - Cookie header present:", !!cookieHeader);

    // Try getToken first (works better in API routes)
    let token = await getToken({ 
      req: req as any, 
      secret: config.NEXTAUTH_SECRET
    });

    // If token is null, try getServerSession as fallback
    if (!token) {
      console.log("getToken returned null, trying getServerSession...");
      const session = await getServerSession(authOptions);
      if (session) {
        console.log("Session found via getServerSession");
        token = {
          sub: (session.user as any).sub || (session.user as any).id,
          email: session.user.email || null,
          name: session.user.name || null,
          role: (session.user as any).role,
          uid: (session.user as any).id || (session.user as any).sub,
          id: (session.user as any).id || (session.user as any).sub,
        } as any;
      }
    } else {
      console.log("Token found via getToken");
    }

    if (!token) {
      console.error("No token found - user not authenticated");
      console.error("Request URL:", req.url);
      console.error("Cookie header:", cookieHeader ? "Present" : "Missing");
      return NextResponse.json({ ok: false, error: "Unauthorized - No session found" }, { status: 401 });
    }

    // Log full token structure for debugging
    console.log("Token retrieved successfully. Full token:", JSON.stringify({
      keys: Object.keys(token),
      sub: token.sub,
      email: token.email,
      name: token.name,
      uid: (token as any).uid,
      id: (token as any).id,
      role: (token as any).role,
    }, null, 2));

    // Extract fields from token
    const role = (token as any).role as "client" | "admin";
    const email = (token as any).email || token.email;
    const name = (token as any).name || token.name;

    // Try multiple ways to get user ID - check all possible fields
    let sub = (token as any).uid || (token as any).id || token.sub;
    
    console.log("Extracted values:", { role, email, name, sub });

    // Log token structure for debugging (only in development or when sub is missing)
    if (!sub) {
      console.log("Token structure (missing sub):", {
        uid: (token as any).uid,
        id: (token as any).id,
        sub: token.sub,
        email: email,
        role: role,
        name: name,
        allKeys: Object.keys(token),
      });
    }

    // If still no ID, get it from database using email
    if (!sub && email) {
      try {
        await connectDB();
        const user = await User.findOne({ email: email.toLowerCase().trim() }).select("_id").lean();
        if (user && user._id) {
          sub = user._id.toString();
          console.log("User ID fetched from DB using email:", sub);
        }
      } catch (dbError) {
        console.error("Database error while fetching user:", dbError);
      }
    }

    // Final check - if still no sub, return error
    if (!sub) {
      console.error("Failed to get user ID. Full token structure:", JSON.stringify(token, null, 2));
      return NextResponse.json({ 
        ok: false, 
        error: "Invalid token - missing user ID",
        debug: {
          hasUid: !!(token as any).uid,
          hasId: !!(token as any).id,
          hasSub: !!token.sub,
          hasEmail: !!email,
          hasRole: !!role,
          tokenKeys: Object.keys(token),
        }
      }, { status: 400 });
    }

    // Check if role exists
    if (!role) {
      console.error("Token missing role. Token structure:", JSON.stringify(token, null, 2));
      return NextResponse.json({ 
        ok: false, 
        error: "Invalid token - missing role",
        debug: {
          hasUid: !!(token as any).uid,
          hasId: !!(token as any).id,
          hasSub: !!token.sub,
          hasEmail: !!email,
          hasRole: !!role,
          hasName: !!name,
          tokenKeys: Object.keys(token),
        }
      }, { status: 400 });
    }

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

