import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { config } from "@/lib/config";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    console.log("Test auth request received");
    
    const token = await getToken({ 
      req: req as any, 
      secret: config.NEXTAUTH_SECRET 
    });

    if (!token) {
      return NextResponse.json({ 
        authenticated: false, 
        error: "No token found",
        cookies: req.headers.get("cookie") ? "Present" : "Missing"
      });
    }

    return NextResponse.json({ 
      authenticated: true, 
      tokenKeys: Object.keys(token),
      email: token.email,
      sub: token.sub,
      role: (token as any).role,
      name: token.name
    });
  } catch (error) {
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Unknown error",
      authenticated: false 
    });
  }
}