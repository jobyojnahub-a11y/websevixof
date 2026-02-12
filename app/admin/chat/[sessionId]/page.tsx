"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { getSocket } from "@/lib/socket/client";

interface Message {
  from: "admin" | "visitor";
  text: string;
  timestamp: number;
}

export default function VisitorChatPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const sessionId = (params?.sessionId as string) || "";
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [connected, setConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<any>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin/auth");
    } else if (status === "authenticated" && (session?.user as any)?.role !== "admin") {
      router.push("/client/dashboard");
    } else if (status === "authenticated" && sessionId) {
      initializeChat();
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [status, session, router, sessionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const initializeChat = async () => {
    try {
      // Get socket token
      const tokenRes = await fetch("/api/socket/token");
      if (!tokenRes.ok) throw new Error("Failed to get socket token");
      const { token } = await tokenRes.json();

      // Connect socket
      const socket = await getSocket({ token });
      socketRef.current = socket;

      // Join visitor room
      socket.emit("join_visitor_chat", { visitorSessionId: sessionId });

      // Listen for messages
      socket.on("receive_message", (data: any) => {
        if (data.visitorSessionId === sessionId) {
          setMessages((prev) => [
            ...prev,
            {
              from: data.senderRole === "admin" ? "admin" : "visitor",
              text: data.message,
              timestamp: Date.now(),
            },
          ]);
        }
      });

      setConnected(true);
      setLoading(false);
    } catch (error) {
      console.error("Error initializing chat:", error);
      setLoading(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending || !socketRef.current) return;

    const messageText = newMessage.trim();
    setSending(true);

    try {
      // Send message via socket (direct visitor chat, no conversation model)
      socketRef.current.emit("send_visitor_message", {
        visitorSessionId: sessionId,
        message: messageText,
        senderRole: "admin",
        senderName: (session?.user as any)?.name || "Admin",
      });

      // Add to local messages
      setMessages((prev) => [
        ...prev,
        {
          from: "admin",
          text: messageText,
          timestamp: Date.now(),
        },
      ]);

      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSending(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950">
        <div className="text-white">Connecting...</div>
      </div>
    );
  }

  if (!session || (session.user as any)?.role !== "admin") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 flex flex-col">
      <div className="border-b border-white/10 p-4 bg-white/5">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-white">Chat with Visitor</h1>
            <p className="text-xs text-white/60">Session: {sessionId.slice(0, 8)}...</p>
            {connected && <span className="text-xs text-green-400">🟢 Connected</span>}
          </div>
          <Button variant="outline" size="sm" onClick={() => window.close()}>
            Close
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-white/70">No messages yet. Start the conversation!</p>
              </CardContent>
            </Card>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.from === "admin" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg p-3 ${
                    msg.from === "admin"
                      ? "bg-blue-600 text-white"
                      : "bg-white/10 text-white"
                  }`}
                >
                  <div className="text-sm font-medium mb-1">
                    {msg.from === "admin" ? "You (Admin)" : "Visitor"}
                  </div>
                  <div className="text-sm whitespace-pre-wrap">{msg.text}</div>
                  <div className="text-xs opacity-70 mt-1">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="border-t border-white/10 p-4 bg-white/5">
        <form onSubmit={sendMessage} className="max-w-4xl mx-auto flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            disabled={sending || !connected}
            className="flex-1"
          />
          <Button type="submit" disabled={sending || !newMessage.trim() || !connected}>
            {sending ? "Sending..." : "Send"}
          </Button>
        </form>
      </div>
    </div>
  );
}
