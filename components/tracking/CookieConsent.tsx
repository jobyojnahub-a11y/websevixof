"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const KEY = "websevix_cookie_consent_v1";
export type ConsentValue = "reject" | "necessary" | "all";

export function getConsent(): ConsentValue | null {
  if (typeof window === "undefined") return null;
  return (window.localStorage.getItem(KEY) as ConsentValue | null) || null;
}

export function CookieConsent() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const v = getConsent();
    if (!v) setOpen(true);
  }, []);

  if (!open) return null;

  const setConsent = (v: ConsentValue) => {
    window.localStorage.setItem(KEY, v);
    setOpen(false);
    window.location.reload();
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-6 md:right-auto md:w-[520px] rounded-2xl border border-white/10 bg-slate-900/90 backdrop-blur p-5">
      <div className="font-semibold">🍪 This website uses cookies</div>
      <div className="text-sm text-white/70 mt-2">
        We use cookies to track visitors and improve your experience. You can control tracking preferences anytime.
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button variant="outline" onClick={() => setConsent("reject")}>
          Reject All
        </Button>
        <Button variant="outline" onClick={() => setConsent("necessary")}>
          Accept Necessary
        </Button>
        <Button onClick={() => setConsent("all")}>Accept All</Button>
      </div>
    </div>
  );
}

