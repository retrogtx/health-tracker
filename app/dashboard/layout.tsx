"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { signOut as authSignOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader,
  SheetTitle,
  SheetTrigger 
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { 
  LayoutDashboard, 
  UserCircle, 
  LineChart, 
  Salad, 
  Dumbbell, 
  ChevronRight, 
  Heart, 
  Bell, 
  Menu, 
  Settings, 
  LogOut
} from "lucide-react";
import { ModeToggle } from "@/components/ui/toggle";

interface BaseNavItem {
  name: string;
  icon?: React.ReactNode;
}

interface NavItemWithChildren extends BaseNavItem {
  children: NavItem[];
  href?: never;
}

interface NavItemWithHref extends BaseNavItem {
  href: string;
  children?: never;
}

type NavItem = NavItemWithChildren | NavItemWithHref;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  
  useEffect(() => {
    console.log("Session data:", session);
  }, [session]);

  // Show a welcome toast when the dashboard is first loaded
  useEffect(() => {
    if (pathname === "/dashboard") {
      toast.success("Welcome to your Health Tracker dashboard!");
    }
  }, [pathname]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

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

  const navItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: <LayoutDashboard className="size-4" />,
    },
    {
      name: "Profile",
      href: "/dashboard/profile",
      icon: <UserCircle className="size-4" />,
    },
    {
      name: "Health Logs",
      children: [
        {
          name: "Health Metrics",
          href: "/dashboard/health-metrics",
          icon: <LineChart className="size-4" />,
        },
        {
          name: "Diet Log",
          href: "/dashboard/diet-log",
          icon: <Salad className="size-4" />,
        },
        {
          name: "Workout Log",
          href: "/dashboard/workout-log",
          icon: <Dumbbell className="size-4" />,
        },
      ],
    },
    {
      name: "Health Suggestions",
      href: "/dashboard/health-suggestions",
      icon: <Heart className="size-4" />,
    },
  ];

  const renderNavItems = (items: NavItem[], level = 0) => {
    return items.map((item, index) => {
      if (item.children) {
        return (
          <div key={index} className="space-y-1">
            <div className={`px-3 py-2 text-sm font-medium ${level === 0 ? 'text-muted-foreground' : 'text-muted-foreground/80'}`}>
              {item.name}
            </div>
            <div className="pl-4">
              {renderNavItems(item.children, level + 1)}
            </div>
          </div>
        );
      }

      const isActive = pathname === item.href;
      
      return (
        <Link
          key={index}
          href={item.href}
          className={`flex items-center gap-x-2 px-3 py-2 rounded-md text-sm ${
            isActive
              ? "bg-accent text-accent-foreground font-medium"
              : "text-foreground hover:bg-accent/50"
          }`}
          onClick={() => setIsMobileOpen(false)}
        >
          {item.icon}
          <span>{item.name}</span>
          {isActive && (
            <div className="ml-auto">
              <Badge variant="secondary" className="rounded-sm px-1 py-0">Active</Badge>
            </div>
          )}
        </Link>
      );
    });
  };


  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex flex-col flex-grow bg-background border-r">
          <div className="flex items-center h-16 px-4 border-b flex-shrink-0">
            <div className="flex items-center gap-2 flex-1">
              <div className="bg-primary text-primary-foreground p-1 rounded">
                <Heart className="size-5" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">Health Tracker</h2>
            </div>
            <ModeToggle />
          </div>
          
          <ScrollArea className="flex-1 py-4">
            <nav className="space-y-1 px-2">
              {renderNavItems(navItems)}
            </nav>
          </ScrollArea>
          
          <div className="p-4 border-t">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full flex items-center justify-start gap-2 px-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/images/avatar-placeholder.svg" alt={session?.user?.name || "User"} />
                    <AvatarFallback className="bg-primary" />
                  </Avatar>
                  <div className="flex flex-col items-start text-sm">
                    <p className="font-medium text-foreground">{session?.user?.name || "Loading..."}</p>
                    <p className="text-muted-foreground text-xs">{session?.user?.email || session?.user?.username || "Loading..."}</p>
                  </div>
                  <ChevronRight className="ml-auto h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/profile" className="flex items-center">
                    <UserCircle className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/profile" className="flex items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} disabled={isLoggingOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{isLoggingOut ? "Logging out..." : "Log out"}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div className="md:hidden flex items-center h-16 px-4 border-b bg-background sticky top-0 z-10">
        <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="mr-2">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <SheetHeader className="h-16 px-4 border-b flex items-center">
              <div className="flex items-center justify-between w-full">
                <SheetTitle className="flex items-center gap-2">
                  <div className="bg-primary text-primary-foreground p-1 rounded">
                    <Heart className="size-5" />
                  </div>
                  <span>Health Tracker</span>
                </SheetTitle>
                <ModeToggle />
              </div>
            </SheetHeader>
            <ScrollArea className="h-[calc(100vh-8rem)]">
              <div className="py-4">
                <nav className="space-y-1 px-2">
                  {renderNavItems(navItems)}
                </nav>
              </div>
            </ScrollArea>
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-background">
              <Button
                onClick={handleLogout} 
                variant="ghost" 
                className="w-full justify-start gap-2 px-2"
                disabled={isLoggingOut}
              >
                <LogOut className="h-4 w-4" />
                <span>{isLoggingOut ? "Logging out..." : "Log out"}</span>
              </Button>
            </div>
          </SheetContent>
        </Sheet>
        
        <div className="flex items-center gap-2 flex-1">
          <div className="bg-primary text-primary-foreground p-1 rounded">
            <Heart className="size-5" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">Health Tracker</h2>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-destructive ring-2 ring-background" />
          </Button>
          <Avatar className="h-8 w-8">
            <AvatarImage src="/images/avatar-placeholder.svg" alt={session?.user?.name || "User"} />
            <AvatarFallback className="bg-primary" />
          </Avatar>
        </div>
      </div>

      {/* Main content */}
      <div className="md:pl-64 flex flex-col flex-1">
        <main className="flex-1 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
} 