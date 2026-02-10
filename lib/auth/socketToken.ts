import jwt from "jsonwebtoken";

type SocketRole = "visitor" | "client" | "admin";

export type SocketTokenPayload = {
  sub: string; // userId or sessionId
  role: SocketRole;
  name?: string;
};

export function signSocketToken(payload: SocketTokenPayload) {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) throw new Error("NEXTAUTH_SECRET missing");
  return jwt.sign(payload, secret, { expiresIn: "12h" });
}

export function verifySocketToken(token: string): SocketTokenPayload {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) throw new Error("NEXTAUTH_SECRET missing");
  return jwt.verify(token, secret) as SocketTokenPayload;
}

