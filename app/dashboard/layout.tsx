"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { signOut as authSignOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Show a welcome toast when the dashboard is first loaded
  useEffect(() => {
    if (pathname === "/dashboard") {
      toast.success("Welcome to your Health Tracker dashboard!");
    }
  }, [pathname]);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      toast.info("Logging out...");
      await authSignOut();
      router.push("/");
    } catch (error) {
      console.error("Error during logout:", error);
      toast.error("Logout failed. Please try again.");
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold">Health Tracker</h2>
        </div>
        <nav className="mt-6 flex-grow">
          <ul>
            <li className="mb-2">
              <Link
                href="/dashboard"
                className={`block px-4 py-2 text-sm ${
                  pathname === "/dashboard"
                    ? "bg-blue-100 text-blue-700 font-medium"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                Dashboard
              </Link>
            </li>
            <li className="mb-2">
              <Link
                href="/dashboard/profile"
                className={`block px-4 py-2 text-sm ${
                  pathname === "/dashboard/profile"
                    ? "bg-blue-100 text-blue-700 font-medium"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                Profile
              </Link>
            </li>
            <li className="mb-2">
              <div className={`block px-4 py-2 text-sm text-gray-700 font-medium`}>
                Health Logs
              </div>
              <ul className="ml-4">
                <li className="mb-1">
                  <Link
                    href="/dashboard/health-metrics"
                    className={`block px-4 py-2 text-sm ${
                      pathname === "/dashboard/health-metrics"
                        ? "bg-blue-100 text-blue-700 font-medium"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    Health Metrics
                  </Link>
                </li>
                <li className="mb-1">
                  <Link
                    href="/dashboard/diet-log"
                    className={`block px-4 py-2 text-sm ${
                      pathname === "/dashboard/diet-log"
                        ? "bg-blue-100 text-blue-700 font-medium"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    Diet Log
                  </Link>
                </li>
                <li className="mb-1">
                  <Link
                    href="/dashboard/workout-log"
                    className={`block px-4 py-2 text-sm ${
                      pathname === "/dashboard/workout-log"
                        ? "bg-blue-100 text-blue-700 font-medium"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    Workout Log
                  </Link>
                </li>
              </ul>
            </li>
          </ul>
        </nav>
        <div className="p-4 border-t flex items-center">
          <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white font-bold mr-2">
            N
          </div>
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="w-full text-left justify-start"
            disabled={isLoggingOut}
          >
            {isLoggingOut ? "Logging out..." : "Log out"}
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto p-4">{children}</div>
    </div>
  );
} 