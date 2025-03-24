"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { toast } from "sonner";

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [userName, setUserName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function checkAuth() {
      if (status === "loading") return;

      try {
        if (!session) {
          router.push("/login");
          return;
        }
        
        if (session?.user?.name && isMounted) {
          setUserName(session.user.name);
        }
      } catch (error) {
        console.error("Authentication error:", error);
        toast.error("Authentication failed. Please log in again.");
        router.push("/login");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, [router, session, status]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-8">Health Tracker Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        <Card>
          <CardHeader>
            <CardTitle>Welcome</CardTitle>
            <CardDescription>
              {userName ? `Hello, ${userName}!` : 'Hello!'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Here you can track and monitor your health metrics.</p>
            <Link href="/dashboard/profile">
              <Button className="mt-4" variant="outline">My Profile</Button>
            </Link>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Health Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Record and track your health metrics like weight, heart rate, and more.</p>
            <Link href="/dashboard/health-metrics">
              <Button className="mt-4" variant="outline">Health Metrics</Button>
            </Link>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Diet Log</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Track your meals and nutritional intake.</p>
            <Link href="/dashboard/diet-log">
              <Button className="mt-4" variant="outline">Diet Log</Button>
            </Link>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Workout Log</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Record your workout sessions and physical activities.</p>
            <Link href="/dashboard/workout-log">
              <Button className="mt-4" variant="outline">Workout Log</Button>
            </Link>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Progress & Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <p>View your health progress and statistics over time.</p>
            <Button className="mt-4" variant="outline" disabled>Coming Soon</Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Health Suggestions</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Get personalized health suggestions based on your data.</p>
            <Link href="/dashboard/health-suggestions">
              <Button className="mt-4" variant="outline">Health Suggestions</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 