"use client";

import { useEffect, useRef } from "react";
import { getConsent } from "./CookieConsent";
import { getSocket } from "@/lib/socket/client";

function safeId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

const SESSION_KEY = "websevix_visitor_session_id_v1";
const VISITOR_KEY = "websevix_visitor_id_v1";

export function VisitorTracker() {
  const startedRef = useRef(false);
  const lastPageRef = useRef<string>("");
  const lastTsRef = useRef<number>(Date.now());

  useEffect(() => {
    const consent = getConsent();
    if (consent === "reject" || !consent) return;

    if (startedRef.current) return;
    startedRef.current = true;

    const sessionId = window.localStorage.getItem(SESSION_KEY) || safeId("ses");
    const visitorId = window.localStorage.getItem(VISITOR_KEY) || safeId("vis");
    window.localStorage.setItem(SESSION_KEY, sessionId);
    window.localStorage.setItem(VISITOR_KEY, visitorId);

    const device = /Mobi|Android/i.test(navigator.userAgent) ? "Mobile" : "Desktop";
    const browser = navigator.userAgent;
    const os = navigator.platform;
    const landingPage = window.location.pathname;

    lastPageRef.current = landingPage;
    lastTsRef.current = Date.now();

    (async () => {
      const socket = await getSocket({ visitorSessionId: sessionId });
      socket.emit("visitor_connected", {
        sessionId,
        visitorId,
        landingPage,
        currentPage: landingPage,
        referrer: document.referrer || "direct",
        device,
        browser,
        os,
      });
    })();

    const onVisibility = async () => {
      const socket = await getSocket({ visitorSessionId: sessionId });
      if (document.visibilityState === "hidden") {
        socket.emit("visitor_idle", { sessionId });
      } else {
        socket.emit("visitor_action", { sessionId, action: "tab_active" });
      }
    };

    const onBeforeUnload = async () => {
      try {
        const socket = await getSocket({ visitorSessionId: sessionId });
        socket.emit("visitor_left", { sessionId });
      } catch {}
    };

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("beforeunload", onBeforeUnload);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("beforeunload", onBeforeUnload);
    };
  }, []);

  return null;
}

