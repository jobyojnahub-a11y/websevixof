import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { signSocketToken } from "@/lib/auth/socketToken";

export async function GET(req: Request) {
  const token = await getToken({ req: req as any, secret: process.env.NEXTAUTH_SECRET });
  if (!token) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

  const role = (token as any).role as "client" | "admin";
  const sub = (token as any).uid as string;
  const name = (token as any).name as string | undefined;

  const socketToken = signSocketToken({ role, sub, name });
  return NextResponse.json({ ok: true, token: socketToken, role });
}

