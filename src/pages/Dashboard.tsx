
import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import MemberAccount from "@/components/dashboard/MemberAccount";
import MembersGrid from "@/components/dashboard/MembersGrid";
import GroupSavings from "@/components/dashboard/GroupSavings";
import ProjectsList from "@/components/dashboard/ProjectsList";
import MonthlyPayment from "@/components/dashboard/MonthlyPayment";
import { getCurrentUser, getUserProfile } from "@/lib/auth";
import { getAllMembers, type Member } from "@/lib/members";
import { useToast } from "@/components/ui/use-toast";

const projects = [
  {
    id: "1",
    title: "Agricultural Investment",
    description: "Investment in rice farming in Rangpur district with expected 15% returns.",
    status: "ongoing" as const,
    progress: 65,
    budget: 500000,
    startDate: "2023-12-15",
    endDate: "2024-06-30",
  },
  {
    id: "2",
    title: "Community Center Construction",
    description: "Building a community center for group gatherings and events.",
    status: "upcoming" as const,
    budget: 1200000,
    startDate: "2024-07-01",
    endDate: "2025-01-15",
  },
  {
    id: "3",
    title: "Tech Skill Workshop",
    description: "Organizing workshops to teach digital skills to group members.",
    status: "ongoing" as const,
    progress: 30,
    budget: 150000,
    startDate: "2024-02-01",
    endDate: "2024-05-30",
  },
  {
    id: "4",
    title: "Livestock Investment",
    description: "Group investment in cattle farming for the upcoming Eid.",
    status: "upcoming" as const,
    budget: 800000,
    startDate: "2024-08-01",
    endDate: "2025-03-15",
  },
];

const Dashboard = () => {
  const [currentUser, setCurrentUser] = useState({
    name: "",
    photoUrl: "",
    isPaid: false,
  });
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMembersLoading, setIsMembersLoading] = useState(true);
  const { toast } = useToast();

  // Fetch user profile on component mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setIsLoading(true);
        const user = await getCurrentUser();

        if (!user) {
          // Redirect to login if no user is found
          window.location.href = "/sign-in";
          return;
        }

        const { data: profile, error } = await getUserProfile(user.id);

        if (error) {
          throw error;
        }

        if (profile) {
          setCurrentUser({
            name: profile.name || "",
            photoUrl: profile.photo_url || "",
            isPaid: false, // This would come from a separate query in a real app
          });
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load profile information",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [toast]);

  // Fetch members for the MembersGrid
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setIsMembersLoading(true);
        const membersData = await getAllMembers();
        setMembers(membersData);
      } catch (error) {
        console.error("Error fetching members:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load members information",
        });
      } finally {
        setIsMembersLoading(false);
      }
    };

    fetchMembers();
  }, [toast]);

  return (
    <DashboardLayout>
      <div className="p-2 sm:p-4 flex flex-col">
        <h1 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 flex items-center">
          <img
            src="/images/logo.png"
            alt="DreamLand Logo"
            className="w-24 h-24 sm:w-30 sm:h-30 mr-3 object-contain"
          />
          DreamLand Group
        </h1>

        {/* Grid container with better responsive sizing */}
        <div className="dashboard-grid grid grid-cols-2 gap-3 sm:gap-4 md:gap-5">
          {/* Row 1, Column 1: Group Savings Section */}
          <div className="col-span-1 mb-3 sm:mb-4">
            <GroupSavings growthRate={12} />
          </div>

          {/* Row 1, Column 2: Member Account Section */}
          <div className="col-span-1 mb-3 sm:mb-4">
            {isLoading ? (
              <div className="flex justify-center items-center h-32 sm:h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dreamland-primary"></div>
              </div>
            ) : (
              <MemberAccount user={currentUser} />
            )}
          </div>

          {/* Row 2, Column 1: Members Grid Section */}
          <div className="col-span-1 mb-3 sm:mb-4">
            {isMembersLoading ? (
              <div className="flex justify-center items-center h-32 sm:h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dreamland-primary"></div>
              </div>
            ) : (
              <MembersGrid members={members} />
            )}
          </div>

          {/* Row 2, Column 2: Upcoming Projects Section */}
          <div className="col-span-1 mb-3 sm:mb-4">
            <ProjectsList projects={projects} type="upcoming" />
          </div>

          {/* Row 3, Column 1: Ongoing Projects Section */}
          <div className="col-span-1 mb-3 sm:mb-4">
            <ProjectsList projects={projects} type="ongoing" />
          </div>

          {/* Row 3, Column 2: Monthly Payment Section */}
          <div className="col-span-1 mb-3 sm:mb-4">
            <MonthlyPayment />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
