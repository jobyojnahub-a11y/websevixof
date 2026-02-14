import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { getServerSession } from "next-auth";
import { signSocketToken } from "@/lib/auth/socketToken";
import { config } from "@/lib/config";
import { connectDB } from "@/lib/db/mongoose";
import { User } from "@/models/User";
import { authOptions } from "@/lib/auth/options";

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
      // If token exists but email is missing, try to get from session
      if (!token.email && !(token as any).email) {
        console.log("Token missing email, trying getServerSession...");
        const session = await getServerSession(authOptions);
        if (session?.user?.email) {
          token.email = session.user.email;
          console.log("Email fetched from session:", token.email);
        }
      }
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
    let role = (token as any).role as "client" | "admin";
    let email = (token as any).email || token.email;
    let name = (token as any).name || token.name;
    let sub = (token as any).uid || (token as any).id || token.sub;

    console.log("Initial extracted values:", { role, email, name, sub });

    // CRITICAL: If ANY field is missing, fetch from database using email
    // Email is the most reliable identifier in NextAuth tokens
    if (email) {
      try {
        await connectDB();
        const user = await User.findOne({ email: email.toLowerCase().trim() })
          .select("_id fullName role email")
          .lean();
        
        if (user) {
          // Always use database values if they exist (more reliable)
          if (user._id) {
            sub = user._id.toString();
            console.log("User ID fetched from DB:", sub);
          }
          if (user.role) {
            role = user.role as "client" | "admin";
            console.log("Role fetched from DB:", role);
          }
          if (user.fullName) {
            name = user.fullName;
            console.log("Name fetched from DB:", name);
          }
          // Ensure email is set
          if (!email && user.email) {
            email = user.email;
          }
        } else {
          console.error("User not found in database for email:", email);
        }
      } catch (dbError) {
        console.error("Database error:", dbError);
      }
    } else {
      console.error("CRITICAL: No email found in token! Cannot fetch user from database.");
    }

    // Final validation
    if (!sub) {
      console.error("CRITICAL: No user ID found. Token:", JSON.stringify(token, null, 2));
      return NextResponse.json({ 
        ok: false, 
        error: "Invalid token - missing user ID. Please logout and login again.",
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

    if (!role) {
      console.error("CRITICAL: No role found. Token:", JSON.stringify(token, null, 2));
      return NextResponse.json({ 
        ok: false, 
        error: "Invalid token - missing role. Please logout and login again.",
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

    console.log("Final values before token generation:", { role, sub, name, email });

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

