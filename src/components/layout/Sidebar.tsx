"use client";

import {
  LayoutDashboard,
  Monitor,
  Image,
  Palette,
  Users,
  Bell,
  Settings,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: Monitor, label: "Displays", href: "/displays" },
  { icon: Image, label: "Media Library", href: "/media" },
  // { icon: Palette, label: "Templates", href: "/templates" },
  { icon: Users, label: "Locations", href: "/locations" },
];

const bottomItems = [
  { icon: Bell, label: "Notifications", href: "/notifications" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await fetch("/api/auth/me");
      if (response.ok) {
        const data = await response.json();
        console.log("User data received:", data); // Debug log
        // The API returns { success: true, user: {...} }
        setUserData(data.user);
      } else {
        // Token invalid or expired, redirect to login
        console.log("Auth check failed, redirecting to login");
        router.push("/login");
      }
    } catch (error) {
      console.error("Failed to fetch user data:", error);
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (response.ok) {
        router.push("/login");
        router.refresh(); // Force refresh to clear any cached data
      }
    } catch (error) {
      console.error("Logout failed:", error);
      // Redirect anyway
      router.push("/login");
    }
  };

  // Get user initials for fallback avatar
  const getInitials = (name) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <nav className="fixed left-0 top-0 h-screen w-20 bg-gray-900 flex flex-col items-center py-8 z-50">
        <div className="animate-pulse w-12 h-12 bg-gray-800 rounded-lg mb-8" />
      </nav>
    );
  }

  return (
    <nav className="fixed left-0 top-0 h-screen w-20 bg-gray-900 flex flex-col items-center py-8 overflow-y-auto scrollbar-hide z-50">
      <Link
        href="/"
        className="mb-8 flex-shrink-0 hover:opacity-80 transition-opacity"
      >
        <div className="border-pink-300 rounded-lg">
          <img
            src="/logo.png"
            alt="Display Manager Logo"
            className="w-12 h-12 object-contain"
            onError={(e) => {
              e.currentTarget.src =
                "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 24 24' fill='none' stroke='%23ec4899' stroke-width='2'%3E%3Crect x='2' y='3' width='20' height='14' rx='2'/%3E%3Cpath d='M8 21h8'/%3E%3Cpath d='M12 17v4'/%3E%3C/svg%3E";
            }}
          />
        </div>
      </Link>

      <div className="flex flex-col items-center space-y-6 flex-1 min-h-0 overflow-y-auto scrollbar-hide">
        <div className="flex flex-col items-center space-y-6">
          {navItems.map(({ icon: Icon, label, href }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={label}
                href={href}
                className={`w-12 h-12 flex items-center justify-center rounded-xl transition-colors flex-shrink-0 ${
                  isActive
                    ? "bg-pink-300 text-gray-900"
                    : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                }`}
                title={label}
              >
                <Icon size={20} strokeWidth={1.5} />
              </Link>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col items-center space-y-6 mb-4 flex-shrink-0">
        {bottomItems.map(({ icon: Icon, label, href }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={label}
              href={href}
              className={`w-12 h-12 flex items-center justify-center rounded-xl transition-colors ${
                isActive
                  ? "bg-pink-300 text-gray-900"
                  : "text-gray-400 hover:text-white hover:bg-gray-800/50"
              }`}
              title={label}
            >
              <Icon size={20} strokeWidth={1.5} />
            </Link>
          );
        })}

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-12 h-12 flex items-center justify-center rounded-xl transition-colors text-gray-400 hover:text-white hover:bg-red-500/20"
          title="Logout"
        >
          <LogOut size={20} strokeWidth={1.5} />
        </button>
      </div>

      <Link
        href="/profile"
        className="relative w-16 h-16 rounded-full border-2 border-pink-300 flex-shrink-0 overflow-hidden bg-gray-800 hover:border-pink-200 transition-colors"
      >
        <img
          src="https://hebbkx1sfanhila5yf.public.blob.vercel-storage.com/photo-1494790108377-be9c29b29330-0ITDG9UYNBJygMOGBGIv4aR4Qj9VKY.jpeg"
          alt="User Profile"
          className="w-full h-full object-cover rounded-full"
          onError={(e) => {
            // Fallback if image fails to load
            e.currentTarget.style.display = "none";
            e.currentTarget.parentElement!.innerHTML =
              '<div class="w-full h-full bg-gray-700 rounded-full flex items-center justify-center text-white text-sm font-medium">SK</div>';
          }}
        />
      </Link>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </nav>
  );
}
