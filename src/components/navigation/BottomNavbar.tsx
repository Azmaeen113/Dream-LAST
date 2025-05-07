
import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { isCurrentUserAdmin } from "@/lib/admin";
import { signOut } from "@/lib/auth";
import { useToast } from "@/components/ui/use-toast";

const BottomNavbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      const adminStatus = await isCurrentUserAdmin();
      setIsAdmin(adminStatus);
    };

    checkAdminStatus();
  }, []);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      const { error } = await signOut();

      if (error) {
        throw error;
      }

      // Redirect to sign-in page
      window.location.href = "/sign-in";
    } catch (error: any) {
      console.error("Error signing out:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to sign out",
      });
      setIsLoggingOut(false);
    }
  };

  // Base navigation items for all users
  const baseNavItems = [
    {
      name: "Home",
      path: "/dashboard",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
      ),
    },
    {
      name: "Members",
      path: "/members",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
      ),
    },
    {
      name: "Projects",
      path: "/projects",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="18" height="18" x="3" y="3" rx="2"></rect>
          <path d="M3 9h18"></path>
          <path d="M9 21V9"></path>
        </svg>
      ),
    },
    {
      name: "Payments",
      path: "/payments",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="20" height="14" x="2" y="5" rx="2"></rect>
          <line x1="2" x2="22" y1="10" y2="10"></line>
        </svg>
      ),
    },
    {
      name: "Profile",
      path: "/profile",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="8" r="5"></circle>
          <path d="M20 21a8 8 0 1 0-16 0"></path>
        </svg>
      ),
    },
  ];

  // Admin-specific navigation items
  const adminNavItems = [
    {
      name: "Admin",
      path: "/admin",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2v6.5"></path>
          <path d="M8.2 4.2c-1.4 1.4-2.2 3.3-2.2 5.3 0 4.1 3.4 7.5 7.5 7.5s7.5-3.4 7.5-7.5c0-2-.8-3.9-2.2-5.3"></path>
          <path d="M17 18h.5a2 2 0 0 1 2 2v1a1 1 0 0 1-1 1h-13a1 1 0 0 1-1-1v-1a2 2 0 0 1 2-2H7"></path>
        </svg>
      ),
    },
  ];

  // Create log out item
  const logoutItem = {
    name: "Log Out",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
        <polyline points="16 17 21 12 16 7"></polyline>
        <line x1="21" y1="12" x2="9" y2="12"></line>
      </svg>
    ),
  };

  // Combine navigation items based on admin status
  const navItems = isAdmin
    ? [...baseNavItems.slice(0, 3), adminNavItems[0], baseNavItems[4]]
    : [...baseNavItems.slice(0, 4), baseNavItems[4]];

  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 bg-dreamland-surface border-t border-dreamland-accent/20 flex justify-around items-center px-2 z-50">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.name}
            to={item.path}
            className={cn(
              "flex flex-col items-center justify-center w-full h-full transition-colors",
              isActive
                ? "text-dreamland-accent"
                : "text-gray-400 hover:text-dreamland-secondary"
            )}
          >
            <div className="mb-1">{item.icon}</div>
            <span className="text-xs font-medium">{item.name}</span>
          </Link>
        );
      })}

      {/* Log Out Button */}
      <button
        onClick={handleLogout}
        disabled={isLoggingOut}
        className="flex flex-col items-center justify-center w-full h-full transition-colors text-gray-400 hover:text-red-500"
      >
        <div className="mb-1">{logoutItem.icon}</div>
        <span className="text-xs font-medium">{isLoggingOut ? "..." : logoutItem.name}</span>
      </button>
    </div>
  );
};

export default BottomNavbar;
