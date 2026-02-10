"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminAuthPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onLogin = async () => {
    setLoading(true);
    setError(null);
    const res = await signIn("credentials", {
      redirect: true,
      email,
      password,
      role: "admin",
      callbackUrl: "/admin/dashboard",
    });
    setLoading(false);
    if ((res as any)?.error) setError("Invalid admin credentials");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Admin Login</CardTitle>
          <CardDescription>Manage visitors, chats, and orders.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input placeholder="Admin email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          {error && <div className="text-sm text-red-300">{error}</div>}
          <Button className="w-full" disabled={loading} onClick={onLogin}>
            {loading ? "Logging in..." : "Login as Admin"}
          </Button>
          <div className="text-xs text-white/50 text-center">
            Client? <Link className="underline" href="/client/auth">Go to client login</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

