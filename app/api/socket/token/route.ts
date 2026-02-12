import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { signSocketToken } from "@/lib/auth/socketToken";
import { config } from "@/lib/config";

export async function GET(req: Request) {
  try {
    const token = await getToken({ req: req as any, secret: config.NEXTAUTH_SECRET });
    if (!token) {
      return NextResponse.json({ ok: false, error: "Unauthorized - No session found" }, { status: 401 });
    }

    const role = (token as any).role as "client" | "admin";
    const sub = (token as any).uid || (token as any).id || token.sub;
    const name = (token as any).name as string | undefined;

    if (!sub) {
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

