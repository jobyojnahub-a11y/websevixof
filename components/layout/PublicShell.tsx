"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CookieConsent } from "@/components/tracking/CookieConsent";
import { FloatingChatWidget } from "@/components/chat/FloatingChatWidget";
import { VisitorTracker } from "@/components/tracking/VisitorTracker";

export function PublicShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/70 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="font-extrabold tracking-tight text-xl">
            <span className="text-blue-400">Web</span>Sevix
          </Link>
          <nav className="hidden md:flex items-center gap-2 text-sm text-white/75">
            <Link className={pathname === "/pricing" ? "text-white" : "hover:text-white"} href="/pricing">
              Pricing
            </Link>
            <Link className={pathname === "/portfolio" ? "text-white" : "hover:text-white"} href="/portfolio">
              Portfolio
            </Link>
            <Link className={pathname === "/order" ? "text-white" : "hover:text-white"} href="/order">
              Order
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/client/auth">
              <Button variant="outline">Client Login</Button>
            </Link>
            <Link href="/admin/auth" className="hidden sm:block">
              <Button variant="ghost">Admin</Button>
            </Link>
          </div>
        </div>
      </header>

      <main>{children}</main>

      <footer className="border-t border-white/10 py-10">
        <div className="container mx-auto px-4 text-sm text-white/60 flex flex-col md:flex-row justify-between gap-3">
          <div>© {new Date().getFullYear()} WebSevix. All rights reserved.</div>
          <div className="flex gap-4">
            <Link className="hover:text-white" href="/privacy">
              Privacy
            </Link>
            <Link className="hover:text-white" href="/terms">
              Terms
            </Link>
            <a className="hover:text-white" href="mailto:support@websevix.com">
              support@websevix.com
            </a>
          </div>
        </div>
      </footer>

      <CookieConsent />
      <VisitorTracker />
      <FloatingChatWidget />
    </div>
  );
}

