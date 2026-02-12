"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getConsent } from "@/components/tracking/CookieConsent";
import { getSocket } from "@/lib/socket/client";

type ChatMsg = { from: "admin" | "visitor"; text: string; ts: number };

const SESSION_KEY = "websevix_visitor_session_id_v1";

export function FloatingChatWidget() {
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [typing, setTyping] = useState(false);
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<ChatMsg[]>([]);
  const listRef = useRef<HTMLDivElement>(null);

  const sessionId = useMemo(() => {
    if (typeof window === "undefined") return "";
    return window.localStorage.getItem(SESSION_KEY) || "";
  }, []);

  useEffect(() => {
    const consent = getConsent();
    if (consent === "reject" || !consent) return;
    if (!sessionId) return;

    (async () => {
      const socket = await getSocket({ visitorSessionId: sessionId });

      socket.on("connection_request", (data: any) => {
        // Show proper popup to visitor
        const message = data?.message || "Our admin wants to connect with you. Do you need any help?";
        
        // Create a better popup UI
        const popup = document.createElement("div");
        popup.style.cssText = `
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
          border: 2px solid rgba(59, 130, 246, 0.5);
          border-radius: 16px;
          padding: 24px;
          z-index: 10000;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
          max-width: 400px;
          text-align: center;
          color: white;
          font-family: system-ui, -apple-system, sans-serif;
        `;
        
        popup.innerHTML = `
          <div style="font-size: 48px; margin-bottom: 16px;">👋</div>
          <h3 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 600;">Admin Connection Request</h3>
          <p style="margin: 0 0 24px 0; color: rgba(255, 255, 255, 0.8); line-height: 1.5;">${message}</p>
          <div style="display: flex; gap: 12px; justify-content: center;">
            <button id="accept-btn" style="
              background: #3b82f6;
              color: white;
              border: none;
              padding: 12px 24px;
              border-radius: 8px;
              font-weight: 600;
              cursor: pointer;
              font-size: 14px;
            ">✅ Accept</button>
            <button id="decline-btn" style="
              background: rgba(255, 255, 255, 0.1);
              color: white;
              border: 1px solid rgba(255, 255, 255, 0.2);
              padding: 12px 24px;
              border-radius: 8px;
              font-weight: 600;
              cursor: pointer;
              font-size: 14px;
            ">❌ Decline</button>
          </div>
        `;
        
        document.body.appendChild(popup);
        
        const acceptBtn = popup.querySelector("#accept-btn");
        const declineBtn = popup.querySelector("#decline-btn");
        
        acceptBtn?.addEventListener("click", () => {
          document.body.removeChild(popup);
          setOpen(true);
          setMsgs((prev) => [
            ...prev,
            { from: "admin", text: "You are now connected with admin. How can we help you?", ts: Date.now() },
          ]);
          socket.emit("connection_response", { visitorSessionId: sessionId, accepted: true });
          socket.emit("join_visitor_chat", { visitorSessionId: sessionId });
        });
        
        declineBtn?.addEventListener("click", () => {
          document.body.removeChild(popup);
          socket.emit("connection_response", { visitorSessionId: sessionId, accepted: false });
        });
      });

      socket.on("chat_open", () => setOpen(true));

      socket.on("typing", () => setTyping(true));
      socket.on("stop_typing", () => setTyping(false));

      socket.on("receive_message", (m: any) => {
        // Check if message is for this visitor session
        if (m?.visitorSessionId && m.visitorSessionId !== sessionId) return;
        
        const text = String(m?.message || "");
        const from: "admin" | "visitor" = m?.senderRole === "admin" ? "admin" : "visitor";
        setMsgs((prev) => [...prev, { from, text, ts: Date.now() }]);
        if (!open && from === "admin") setUnread((u) => u + 1);
      });
    })();
  }, [sessionId, open]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs, open]);

  const send = async () => {
    const consent = getConsent();
    if (consent === "reject" || !consent) return;
    if (!sessionId) return;
    const text = input.trim();
    if (!text) return;

    setMsgs((prev) => [...prev, { from: "visitor", text, ts: Date.now() }]);
    setInput("");

    const socket = await getSocket({ visitorSessionId: sessionId });
    
    // Send message directly via visitor chat (no conversation model)
    socket.emit("send_visitor_message", {
      visitorSessionId: sessionId,
      senderRole: "visitor",
      senderName: "Visitor",
      message: text,
    });
    
    // Also track visitor action
    socket.emit("visitor_action", { sessionId, action: "chat_message_sent" });
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {!open ? (
        <button
          onClick={() => {
            setOpen(true);
            setUnread(0);
          }}
          className="relative rounded-full border border-white/10 bg-blue-600 hover:bg-blue-700 px-4 py-2 text-sm font-semibold shadow-lg"
        >
          💬 Chat
          {unread > 0 && (
            <span className="absolute -top-2 -right-2 h-5 min-w-5 rounded-full bg-red-600 text-xs grid place-items-center px-1">
              {unread}
            </span>
          )}
        </button>
      ) : (
        <div className="w-[340px] max-w-[92vw] overflow-hidden rounded-2xl border border-white/10 bg-slate-900/95 backdrop-blur shadow-2xl">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <div>
              <div className="font-semibold">💬 Chat with Us</div>
              <div className="text-xs text-white/60">Typically replies in minutes</div>
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" onClick={() => setOpen(false)} aria-label="Minimize">
                −
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setOpen(false);
                  setMsgs([]);
                }}
                aria-label="Close"
              >
                ×
              </Button>
            </div>
          </div>

          <div ref={listRef} className="h-[320px] overflow-y-auto p-3 space-y-2">
            {msgs.length === 0 ? (
              <div className="text-sm text-white/70">
                Hi! Tell us what you need. You can also:
                <div className="mt-3 flex flex-wrap gap-2">
                  <a className="text-blue-300 underline" href="/order">
                    📦 Start New Project
                  </a>
                  <a className="text-blue-300 underline" href="/pricing">
                    💰 View Pricing
                  </a>
                </div>
              </div>
            ) : (
              msgs.map((m, idx) => (
                <div
                  key={idx}
                  className={[
                    "rounded-xl px-3 py-2 text-sm",
                    m.from === "visitor" ? "bg-blue-600 text-white ml-10" : "bg-white/5 text-white/90 mr-10",
                  ].join(" ")}
                >
                  {m.text}
                </div>
              ))
            )}
            {typing && <div className="text-xs text-white/60">Admin is typing...</div>}
          </div>

          <div className="p-3 border-t border-white/10 flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              onKeyDown={(e) => {
                if (e.key === "Enter") send();
              }}
            />
            <Button onClick={send}>Send</Button>
          </div>
        </div>
      )}
    </div>
  );
}

