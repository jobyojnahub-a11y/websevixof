"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getSocket } from "@/lib/socket/client";

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
  device?: string;
  browser?: string;
  country?: string;
  city?: string;
}

interface Client {
  _id: string;
  email: string;
  fullName: string;
  lastLogin?: string;
  role: string;
}

export default function VisitorsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin/auth");
    } else if (status === "authenticated" && (session?.user as any)?.role !== "admin") {
      router.push("/client/dashboard");
    } else if (status === "authenticated") {
      fetchData();
      // Refresh every 3 seconds for live updates
      const interval = setInterval(fetchData, 3000);
      return () => clearInterval(interval);
    }
  }, [status, session, router]);

  const fetchData = async () => {
    try {
      const [visitorsRes, clientsRes] = await Promise.all([
        fetch("/api/admin/visitors"),
        fetch("/api/admin/clients"),
      ]);

      if (visitorsRes.ok) {
        const visitorsData = await visitorsRes.json();
        setVisitors(visitorsData);
      }

      if (clientsRes.ok) {
        const clientsData = await clientsRes.json();
        setClients(clientsData);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const connectWithVisitor = async (visitorSessionId: string) => {
    if (connecting) return;
    setConnecting(visitorSessionId);

    try {
      // Get socket token for admin
      const tokenRes = await fetch("/api/socket/token");
      if (!tokenRes.ok) throw new Error("Failed to get socket token");

      const { token } = await tokenRes.ok ? await tokenRes.json() : { token: null };
      if (!token) throw new Error("No socket token");

      // Connect via socket.io
      const socket = await getSocket({ token });
      
      // Send connection request to visitor
      socket.emit("admin_connect_request", {
        visitorSessionId,
        message: "Have any problem? Admin wants to connect with you.",
      });

      // Listen for response
      socket.on("visitor_connection_response", (data: any) => {
        if (data.sessionId === visitorSessionId && data.accepted) {
          alert("Visitor accepted! You can now chat with them.");
          // Open chat interface
          openChatWindow(visitorSessionId);
        } else if (data.sessionId === visitorSessionId && !data.accepted) {
          alert("Visitor declined the connection request.");
        }
        setConnecting(null);
      });

      // Timeout after 30 seconds
      setTimeout(() => {
        setConnecting(null);
      }, 30000);

    } catch (error) {
      console.error("Error connecting with visitor:", error);
      alert("Failed to connect with visitor");
      setConnecting(null);
    }
  };

  const openChatWindow = (visitorSessionId: string) => {
    // Open chat interface in a modal or new window
    // For now, we'll use a simple approach
    const chatWindow = window.open(
      `/admin/chat/${visitorSessionId}`,
      "ChatWindow",
      "width=500,height=700"
    );
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
  const activeClients = clients.filter((c) => c.role === "client");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Active Visitors & Clients</h1>
            <p className="text-white/70 mt-1">Live view of all active users on your website</p>
          </div>
          <Link href="/admin/dashboard">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Active Visitors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{activeVisitors.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Active Clients</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{activeClients.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Total Active</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{activeVisitors.length + activeClients.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Active Visitors */}
        {activeVisitors.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4">🟢 Active Visitors ({activeVisitors.length})</h2>
            <div className="space-y-4">
              {activeVisitors.map((visitor) => (
                <Card key={visitor._id} className="hover:bg-white/10 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-white">👤 Visitor</h3>
                          <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded">
                            🟢 Active Now
                          </span>
                          {visitor.connectedWithAdmin && (
                            <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded">
                              💬 Connected
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-white/60">Current Page:</span>
                            <span className="text-white ml-2 font-medium">{visitor.currentPage}</span>
                          </div>
                          <div>
                            <span className="text-white/60">Time on Site:</span>
                            <span className="text-white ml-2 font-medium">{Math.floor(visitor.timeOnSite / 60)} min</span>
                          </div>
                          {visitor.device && (
                            <div>
                              <span className="text-white/60">Device:</span>
                              <span className="text-white ml-2">{visitor.device}</span>
                            </div>
                          )}
                          {visitor.country && (
                            <div>
                              <span className="text-white/60">Location:</span>
                              <span className="text-white ml-2">{visitor.city || visitor.country}</span>
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-white/50 mt-2">
                          Last Activity: {new Date(visitor.lastActivity).toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {visitor.connectedWithAdmin ? (
                          <Button
                            variant="default"
                            onClick={() => openChatWindow(visitor.sessionId)}
                          >
                            💬 Open Chat
                          </Button>
                        ) : (
                          <Button
                            variant="default"
                            onClick={() => connectWithVisitor(visitor.sessionId)}
                            disabled={connecting === visitor.sessionId}
                          >
                            {connecting === visitor.sessionId ? "Connecting..." : "🔗 Connect"}
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

        {/* Active Clients */}
        {activeClients.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-white mb-4">👔 Active Clients ({activeClients.length})</h2>
            <div className="space-y-4">
              {activeClients.map((client) => (
                <Card key={client._id} className="hover:bg-white/10 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-white">{client.fullName}</h3>
                          <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded">
                            👔 Client
                          </span>
                        </div>
                        <p className="text-sm text-white/60 mb-1">
                          Email: <span className="text-white/80">{client.email}</span>
                        </p>
                        {client.lastLogin && (
                          <p className="text-xs text-white/50">
                            Last Login: {new Date(client.lastLogin).toLocaleString()}
                          </p>
                        )}
                      </div>
                      <Link href={`/admin/conversations?clientId=${client._id}`}>
                        <Button variant="outline">View Conversations</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeVisitors.length === 0 && activeClients.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-white/70">No active visitors or clients at the moment.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
