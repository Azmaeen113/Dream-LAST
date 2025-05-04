
import React from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import MemberAccount from "@/components/dashboard/MemberAccount";
import MembersGrid from "@/components/dashboard/MembersGrid";
import GroupSavings from "@/components/dashboard/GroupSavings";
import ProjectsList from "@/components/dashboard/ProjectsList";
import MonthlyPayment from "@/components/dashboard/MonthlyPayment";

// Mock data
const currentUser = {
  name: "Rafiqul Islam",
  photoUrl: "https://i.pravatar.cc/150?img=32",
  isPaid: false,
};

const members = [
  { id: "1", name: "Rafiqul Islam", photoUrl: "https://i.pravatar.cc/150?img=32", isPaid: false },
  { id: "2", name: "Abdul Karim", photoUrl: "https://i.pravatar.cc/150?img=12", isPaid: true },
  { id: "3", name: "Nasreen Ahmed", photoUrl: "https://i.pravatar.cc/150?img=23", isPaid: true },
  { id: "4", name: "Farhan Khan", photoUrl: "https://i.pravatar.cc/150?img=67", isPaid: false },
  { id: "5", name: "Layla Rahman", photoUrl: "https://i.pravatar.cc/150?img=45", isPaid: true },
  { id: "6", name: "Mominul Haque", photoUrl: "https://i.pravatar.cc/150?img=54", isPaid: false },
  { id: "7", name: "Tasnim Akter", photoUrl: "https://i.pravatar.cc/150?img=18", isPaid: true },
  { id: "8", name: "Zahir Uddin", photoUrl: "https://i.pravatar.cc/150?img=71", isPaid: true },
];

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
  return (
    <DashboardLayout>
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-6">DreamLand Group</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Member Account Section */}
          <MemberAccount user={currentUser} />
          
          {/* Members Grid Section */}
          <MembersGrid members={members} />
          
          {/* Group Savings Section */}
          <GroupSavings totalSavings={1250000} goal={2000000} growthRate={12} />
          
          {/* Upcoming Projects Section */}
          <ProjectsList projects={projects} type="upcoming" />
          
          {/* Ongoing Projects Section */}
          <ProjectsList projects={projects} type="ongoing" />
          
          {/* Monthly Payment Section */}
          <MonthlyPayment 
            amount={5000} 
            dueDate="2024-05-07" 
            isPaid={false} 
          />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
