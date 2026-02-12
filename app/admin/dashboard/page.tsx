"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin/auth");
    } else if (status === "authenticated" && (session?.user as any)?.role !== "admin") {
      router.push("/client/dashboard");
    }
  }, [session, status, router]);

  if (status === "loading") {
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
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-white/70 mt-1">Welcome, {(session.user as any)?.name || session.user?.email}</p>
          </div>
          <Button
            variant="outline"
            onClick={() => signOut({ callbackUrl: "/admin/auth" })}
          >
            Logout
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Total Visitors</CardTitle>
              <CardDescription>All time visitors</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">0</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Active Conversations</CardTitle>
              <CardDescription>Currently active chats</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">0</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Total Orders</CardTitle>
              <CardDescription>All orders</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">0</div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Manage your platform</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button variant="outline" className="w-full justify-start">
                View All Orders
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Manage Conversations
              </Button>
              <Button variant="outline" className="w-full justify-start">
                View Visitors
              </Button>
              <Button variant="outline" className="w-full justify-start">
                User Management
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
