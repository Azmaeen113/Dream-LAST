
import React, { ReactNode } from "react";
import BottomNavbar from "@/components/navigation/BottomNavbar";

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-dreamland-background text-white">
      <main className="flex-1 pb-20 overflow-y-auto w-full max-w-5xl mx-auto">
        {children}
      </main>
      <BottomNavbar />
    </div>
  );
};

export default DashboardLayout;
