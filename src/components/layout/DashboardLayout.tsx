
import React, { ReactNode } from "react";
import BottomNavbar from "@/components/navigation/BottomNavbar";

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen h-screen bg-dreamland-background text-white">
      <main className="flex-1 pb-24 overflow-y-auto w-full max-w-5xl mx-auto px-2 relative">
        <div className="flex flex-col pb-4">
          {children}
        </div>
      </main>
      <BottomNavbar />
    </div>
  );
};

export default DashboardLayout;
