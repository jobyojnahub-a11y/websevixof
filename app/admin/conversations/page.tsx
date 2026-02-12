"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface Conversation {
  _id: string;
  conversationId: string;
  participantType: string;
  status: string;
  priority: string;
  createdAt: string;
  lastMessageAt?: string;
  unreadCountAdmin: number;
  visitorSessionId?: string;
  clientId?: string;
  orderId?: string;
}

export default function ConversationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin/auth");
    } else if (status === "authenticated" && (session?.user as any)?.role !== "admin") {
      router.push("/client/dashboard");
    } else if (status === "authenticated") {
      fetchConversations();
    }
  }, [status, session, router]);

  const fetchConversations = async () => {
    try {
      const res = await fetch("/api/admin/conversations");
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setLoading(false);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Manage Conversations</h1>
            <p className="text-white/70 mt-1">View and interact with all visitor conversations</p>
          </div>
          <Link href="/admin/dashboard">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>

        {conversations.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-white/70">No conversations yet. Visitors will appear here when they start chatting.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {conversations.map((conv) => (
              <Card key={conv._id} className="cursor-pointer hover:bg-white/10 transition-colors">
                <Link href={`/admin/conversations/${conv.conversationId}`}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-white">
                            {conv.participantType === "visitor" ? "👤 Visitor" : 
                             conv.participantType === "client" ? "👔 Client" : 
                             "📦 Order"}
                          </h3>
                          {conv.unreadCountAdmin > 0 && (
                            <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                              {conv.unreadCountAdmin} new
                            </span>
                          )}
                          <span className={`text-xs px-2 py-1 rounded ${
                            conv.priority === "urgent" ? "bg-red-500/20 text-red-300" :
                            conv.priority === "high" ? "bg-orange-500/20 text-orange-300" :
                            conv.priority === "medium" ? "bg-yellow-500/20 text-yellow-300" :
                            "bg-blue-500/20 text-blue-300"
                          }`}>
                            {conv.priority}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded ${
                            conv.status === "active" ? "bg-green-500/20 text-green-300" :
                            conv.status === "resolved" ? "bg-gray-500/20 text-gray-300" :
                            "bg-gray-500/20 text-gray-300"
                          }`}>
                            {conv.status}
                          </span>
                        </div>
                        <p className="text-sm text-white/60">
                          ID: {conv.conversationId}
                        </p>
                        {conv.lastMessageAt && (
                          <p className="text-xs text-white/50 mt-1">
                            Last message: {new Date(conv.lastMessageAt).toLocaleString()}
                          </p>
                        )}
                      </div>
                      <Button variant="outline" size="sm">
                        Open Chat
                      </Button>
                    </div>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
