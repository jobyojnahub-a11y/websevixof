"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface Visitor {
  _id: string;
  sessionId: string;
  visitorId: string;
  currentPage: string;
  status: string;
  lastActivity: string;
  timeOnSite: number;
  chatInitiated: boolean;
  connectedWithAdmin: boolean;
  conversationId?: string;
}

export default function VisitorsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin/auth");
    } else if (status === "authenticated" && (session?.user as any)?.role !== "admin") {
      router.push("/client/dashboard");
    } else if (status === "authenticated") {
      fetchVisitors();
      // Refresh every 5 seconds
      const interval = setInterval(fetchVisitors, 5000);
      return () => clearInterval(interval);
    }
  }, [status, session, router]);

  const fetchVisitors = async () => {
    try {
      const res = await fetch("/api/admin/visitors");
      if (res.ok) {
        const data = await res.json();
        setVisitors(data);
      }
    } catch (error) {
      console.error("Error fetching visitors:", error);
    } finally {
      setLoading(false);
    }
  };

  const connectWithVisitor = async (visitorSessionId: string) => {
    try {
      const res = await fetch("/api/admin/visitors/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visitorSessionId }),
      });

      if (res.ok) {
        const data = await res.json();
        // Redirect to conversation
        if (data.conversationId) {
          router.push(`/admin/conversations/${data.conversationId}`);
        }
      }
    } catch (error) {
      console.error("Error connecting with visitor:", error);
      alert("Failed to connect with visitor");
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!session || (session.user as any)?.role !== "admin") {
    return null;
  }

  const activeVisitors = visitors.filter((v) => v.status === "active");
  const idleVisitors = visitors.filter((v) => v.status === "idle");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Active Visitors</h1>
            <p className="text-white/70 mt-1">View and connect with visitors on your website</p>
          </div>
          <Link href="/admin/dashboard">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Active Now</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{activeVisitors.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Idle</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{idleVisitors.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{visitors.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Active Visitors */}
        {activeVisitors.length === 0 && idleVisitors.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-white/70">No active visitors at the moment.</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {activeVisitors.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-bold text-white mb-4">🟢 Active Visitors</h2>
                <div className="space-y-4">
                  {activeVisitors.map((visitor) => (
                    <Card key={visitor._id} className="hover:bg-white/10 transition-colors">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-white">Visitor: {visitor.visitorId.slice(0, 8)}...</h3>
                              <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded">
                                Active
                              </span>
                              {visitor.chatInitiated && (
                                <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded">
                                  Chat Started
                                </span>
                              )}
                              {visitor.connectedWithAdmin && (
                                <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded">
                                  Connected
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-white/60 mb-1">
                              Current Page: <span className="text-white/80">{visitor.currentPage}</span>
                            </p>
                            <p className="text-sm text-white/60 mb-1">
                              Time on Site: <span className="text-white/80">{Math.floor(visitor.timeOnSite / 60)} minutes</span>
                            </p>
                            <p className="text-xs text-white/50">
                              Last Activity: {new Date(visitor.lastActivity).toLocaleTimeString()}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            {visitor.conversationId ? (
                              <Link href={`/admin/conversations/${visitor.conversationId}`}>
                                <Button variant="default">Open Chat</Button>
                              </Link>
                            ) : (
                              <Button
                                variant="default"
                                onClick={() => connectWithVisitor(visitor.sessionId)}
                              >
                                Connect & Chat
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {idleVisitors.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-white mb-4">🟡 Idle Visitors</h2>
                <div className="space-y-4">
                  {idleVisitors.map((visitor) => (
                    <Card key={visitor._id} className="opacity-75">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-white">Visitor: {visitor.visitorId.slice(0, 8)}...</h3>
                              <span className="text-xs bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded">
                                Idle
                              </span>
                            </div>
                            <p className="text-sm text-white/60">
                              Last Activity: {new Date(visitor.lastActivity).toLocaleString()}
                            </p>
                          </div>
                          {visitor.conversationId && (
                            <Link href={`/admin/conversations/${visitor.conversationId}`}>
                              <Button variant="outline">View Chat</Button>
                            </Link>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
