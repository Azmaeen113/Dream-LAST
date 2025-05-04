
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

// Mock projects data (using the same data from Projects.tsx)
const projects = [
  {
    id: "1",
    title: "Agricultural Investment",
    description: "Investment in rice farming in Rangpur district with expected 15% returns. The project involves partnering with local farmers to provide capital for seeds, fertilizers, and modern farming equipment.",
    status: "ongoing" as const,
    progress: 65,
    budget: 500000,
    raised: 325000,
    startDate: "2023-12-15",
    endDate: "2024-06-30",
    participants: 12,
    leader: "Abdul Karim",
    leaderPhoto: "https://i.pravatar.cc/150?img=12",
    location: "Rangpur District, Bangladesh",
    updates: [
      { date: "2024-04-02", content: "Completed irrigation system setup" },
      { date: "2024-03-10", content: "Purchased seeds and fertilizers" },
      { date: "2024-01-20", content: "Land preparation completed" },
    ],
    members: [
      { id: "2", name: "Abdul Karim", photoUrl: "https://i.pravatar.cc/150?img=12" },
      { id: "3", name: "Nasreen Ahmed", photoUrl: "https://i.pravatar.cc/150?img=23" },
      { id: "5", name: "Layla Rahman", photoUrl: "https://i.pravatar.cc/150?img=45" },
      // Additional members would be listed here
    ]
  },
  {
    id: "2",
    title: "Community Center Construction",
    description: "Building a community center for group gatherings and events. The center will have meeting spaces, a kitchen, and multimedia facilities for educational programs.",
    status: "upcoming" as const,
    budget: 1200000,
    raised: 450000,
    startDate: "2024-07-01",
    endDate: "2025-01-15",
    participants: 18,
    leader: "Nasreen Ahmed",
    leaderPhoto: "https://i.pravatar.cc/150?img=23",
    location: "Dhaka District, Bangladesh",
    updates: [
      { date: "2024-04-15", content: "Architectural plans finalized" },
      { date: "2024-03-22", content: "Land purchased for construction" },
    ],
    members: [
      { id: "3", name: "Nasreen Ahmed", photoUrl: "https://i.pravatar.cc/150?img=23" },
      { id: "5", name: "Layla Rahman", photoUrl: "https://i.pravatar.cc/150?img=45" },
      { id: "7", name: "Tasnim Akter", photoUrl: "https://i.pravatar.cc/150?img=18" },
      // Additional members would be listed here
    ]
  },
  {
    id: "3",
    title: "Tech Skill Workshop",
    description: "Organizing workshops to teach digital skills to group members. Workshops will cover topics like basic computer skills, smartphone applications, digital marketing, and simple website creation.",
    status: "ongoing" as const,
    progress: 30,
    budget: 150000,
    raised: 150000,
    startDate: "2024-02-01",
    endDate: "2024-05-30",
    participants: 15,
    leader: "Farhan Khan",
    leaderPhoto: "https://i.pravatar.cc/150?img=67",
    location: "Chittagong District, Bangladesh",
    updates: [
      { date: "2024-04-10", content: "Completed second workshop on digital marketing" },
      { date: "2024-03-15", content: "Purchased computers and equipment" },
      { date: "2024-02-05", content: "First workshop successfully conducted" },
    ],
    members: [
      { id: "4", name: "Farhan Khan", photoUrl: "https://i.pravatar.cc/150?img=67" },
      { id: "6", name: "Mominul Haque", photoUrl: "https://i.pravatar.cc/150?img=54" },
      { id: "8", name: "Zahir Uddin", photoUrl: "https://i.pravatar.cc/150?img=71" },
      // Additional members would be listed here
    ]
  },
  {
    id: "4",
    title: "Livestock Investment",
    description: "Group investment in cattle farming for the upcoming Eid. The project aims to purchase calves, raise them for 6-8 months, and sell them before Eid ul-Adha for profit.",
    status: "upcoming" as const,
    budget: 800000,
    raised: 350000,
    startDate: "2024-08-01",
    endDate: "2025-03-15",
    participants: 14,
    leader: "Mominul Haque",
    leaderPhoto: "https://i.pravatar.cc/150?img=54",
    location: "Khulna District, Bangladesh",
    updates: [
      { date: "2024-04-05", content: "Identified land for cattle rearing" },
      { date: "2024-03-10", content: "Made contacts with suppliers" },
    ],
    members: [
      { id: "6", name: "Mominul Haque", photoUrl: "https://i.pravatar.cc/150?img=54" },
      { id: "2", name: "Abdul Karim", photoUrl: "https://i.pravatar.cc/150?img=12" },
      { id: "8", name: "Zahir Uddin", photoUrl: "https://i.pravatar.cc/150?img=71" },
      // Additional members would be listed here
    ]
  },
];

const ProjectDetail = () => {
  const { id } = useParams<{id: string}>();
  const navigate = useNavigate();
  
  const project = projects.find((p) => p.id === id);
  
  if (!project) {
    return (
      <DashboardLayout>
        <div className="p-4 text-center">
          <h1 className="text-2xl font-bold mb-4">Project Not Found</h1>
          <p className="mb-4">The project you are looking for does not exist.</p>
          <Button onClick={() => navigate('/projects')}>
            View All Projects
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-4">
        <div className="mb-4 flex items-center">
          <Button 
            variant="outline" 
            className="border-dreamland-accent/20 mr-2"
            onClick={() => navigate('/projects')}
          >
            ← Back
          </Button>
          <h1 className="text-2xl font-bold">Project Details</h1>
        </div>
        
        <Card className="bg-dreamland-surface border-dreamland-accent/20 mb-4">
          <CardHeader className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl">{project.title}</CardTitle>
              <Badge
                className={cn(
                  project.status === "ongoing" ? "bg-green-600" :
                  project.status === "upcoming" ? "bg-dreamland-secondary" :
                  "bg-gray-500"
                )}
              >
                {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-300">{project.description}</p>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm text-gray-400 mb-1">Start Date</h4>
                <p className="font-medium">{new Date(project.startDate).toLocaleDateString()}</p>
              </div>
              
              <div>
                <h4 className="text-sm text-gray-400 mb-1">End Date</h4>
                <p className="font-medium">{new Date(project.endDate).toLocaleDateString()}</p>
              </div>
              
              <div>
                <h4 className="text-sm text-gray-400 mb-1">Budget</h4>
                <p className="font-medium text-dreamland-secondary">৳{project.budget.toLocaleString()}</p>
              </div>
              
              <div>
                <h4 className="text-sm text-gray-400 mb-1">Raised</h4>
                <p className="font-medium text-dreamland-accent">৳{project.raised.toLocaleString()}</p>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm text-gray-400 mb-1">Location</h4>
              <p className="font-medium">{project.location}</p>
            </div>
            
            {project.status !== "upcoming" && project.progress !== undefined && (
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <h4 className="text-gray-400">Project Progress</h4>
                  <span className="font-medium">{project.progress}%</span>
                </div>
                <Progress 
                  value={project.progress} 
                  className="h-2 bg-gray-700" 
                />
              </div>
            )}
            
            <div>
              <h4 className="text-sm text-gray-400 mb-2">Project Leader</h4>
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarImage src={project.leaderPhoto} />
                  <AvatarFallback className="bg-dreamland-primary/20">
                    {project.leader[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium">{project.leader}</span>
              </div>
            </div>
            
            <Separator className="bg-dreamland-accent/10" />
            
            <div>
              <h4 className="text-md font-medium mb-3">Project Updates</h4>
              <div className="space-y-3">
                {project.updates.map((update, index) => (
                  <div 
                    key={index} 
                    className="border-l-2 border-dreamland-accent pl-4 py-1"
                  >
                    <p className="text-sm">{update.content}</p>
                    <span className="text-xs text-gray-400">
                      {new Date(update.date).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            <Separator className="bg-dreamland-accent/10" />
            
            <div>
              <h4 className="text-md font-medium mb-3">Team Members</h4>
              <div className="flex flex-wrap gap-2">
                {project.members.map((member) => (
                  <div 
                    key={member.id} 
                    className="flex flex-col items-center cursor-pointer"
                    onClick={() => navigate(`/members/${member.id}`)}
                  >
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={member.photoUrl} />
                      <AvatarFallback className="bg-dreamland-primary/20">
                        {member.name[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs mt-1">{member.name.split(" ")[0]}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
        
        {project.status === "upcoming" && (
          <div className="flex justify-center">
            <Button 
              className="bg-dreamland-primary hover:bg-dreamland-primary/90 w-full max-w-xs"
              onClick={() => navigate(`/projects/${id}/join`)}
            >
              Join This Project
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ProjectDetail;
