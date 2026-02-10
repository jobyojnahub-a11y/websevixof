"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ClientAuthPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onLogin = async () => {
    setLoading(true);
    setError(null);
    const res = await signIn("credentials", {
      redirect: true,
      email,
      password,
      role: "client",
      callbackUrl: "/client/dashboard",
    });
    setLoading(false);
    if ((res as any)?.error) setError("Invalid credentials");
  };

  const onSignup = async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, phone, email, password }),
      });
      const j = await r.json();
      if (!j.ok) throw new Error(j.error || "Signup failed");
      await onLogin();
    } catch (e: any) {
      setError(e?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{mode === "login" ? "Client Login" : "Create Client Account"}</CardTitle>
          <CardDescription>
            {mode === "login" ? "Access your dashboard and orders." : "Sign up to track your project end-to-end."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {mode === "signup" && (
            <>
              <Input placeholder="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
              <Input placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </>
          )}
          <Input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />

          {error && <div className="text-sm text-red-300">{error}</div>}

          {mode === "login" ? (
            <Button className="w-full" disabled={loading} onClick={onLogin}>
              {loading ? "Logging in..." : "Login"}
            </Button>
          ) : (
            <Button className="w-full" disabled={loading} onClick={onSignup}>
              {loading ? "Creating..." : "Create Account"}
            </Button>
          )}

          <div className="text-sm text-white/70 text-center">
            {mode === "login" ? (
              <>
                New here?{" "}
                <button className="text-blue-300 underline" onClick={() => setMode("signup")}>
                  Signup
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button className="text-blue-300 underline" onClick={() => setMode("login")}>
                  Login
                </button>
              </>
            )}
          </div>

          <div className="text-xs text-white/50 text-center">
            Admin? <Link className="underline" href="/admin/auth">Login here</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

