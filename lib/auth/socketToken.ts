import jwt from "jsonwebtoken";
import { config } from "@/lib/config";

type SocketRole = "visitor" | "client" | "admin";

export type SocketTokenPayload = {
  sub: string; // userId or sessionId
  role: SocketRole;
  name?: string;
};

export function signSocketToken(payload: SocketTokenPayload) {
  const secret = config.NEXTAUTH_SECRET;
  if (!secret) throw new Error("NEXTAUTH_SECRET missing. Set it in lib/config.ts");
  return jwt.sign(payload, secret, { expiresIn: "12h" });
}

export function verifySocketToken(token: string): SocketTokenPayload {
  const secret = config.NEXTAUTH_SECRET;
  if (!secret) throw new Error("NEXTAUTH_SECRET missing. Set it in lib/config.ts");
  return jwt.verify(token, secret) as SocketTokenPayload;
}

