import { io, type Socket } from "socket.io-client";

let socket: Socket | null = null;

export async function getSocket(auth?: { token?: string; visitorSessionId?: string }) {
  if (socket) return socket;

  // ensure server is initialized
  await fetch("/api/socket");

  socket = io({
    path: "/api/socket",
    addTrailingSlash: false,
    auth: auth || {},
  });

  return socket;
}

export function resetSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

