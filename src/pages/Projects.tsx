
import React from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

// Mock projects data
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
    updates: [
      { date: "2024-04-02", content: "Completed irrigation system setup" },
      { date: "2024-03-10", content: "Purchased seeds and fertilizers" },
      { date: "2024-01-20", content: "Land preparation completed" },
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
    updates: [
      { date: "2024-04-15", content: "Architectural plans finalized" },
      { date: "2024-03-22", content: "Land purchased for construction" },
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
    updates: [
      { date: "2024-04-10", content: "Completed second workshop on digital marketing" },
      { date: "2024-03-15", content: "Purchased computers and equipment" },
      { date: "2024-02-05", content: "First workshop successfully conducted" },
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
    updates: [
      { date: "2024-04-05", content: "Identified land for cattle rearing" },
      { date: "2024-03-10", content: "Made contacts with suppliers" },
    ]
  },
  {
    id: "5",
    title: "Textile Business Expansion",
    description: "Expanding the community-owned textile business to include export capabilities. This includes upgrading machinery, training artisans, and developing new product lines.",
    status: "completed" as const,
    progress: 100,
    budget: 650000,
    raised: 650000,
    startDate: "2023-06-15",
    endDate: "2023-12-15",
    participants: 10,
    leader: "Layla Rahman",
    updates: [
      { date: "2023-12-10", content: "First export order delivered successfully" },
      { date: "2023-10-25", content: "Training of artisans completed" },
      { date: "2023-08-15", content: "New machinery installed and operational" },
    ]
  },
];

const Projects = () => {
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Projects</h1>
        
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="w-full bg-dreamland-surface mb-4">
            <TabsTrigger value="all" className="flex-1">All Projects</TabsTrigger>
            <TabsTrigger value="ongoing" className="flex-1">Ongoing</TabsTrigger>
            <TabsTrigger value="upcoming" className="flex-1">Upcoming</TabsTrigger>
            <TabsTrigger value="completed" className="flex-1">Completed</TabsTrigger>
          </TabsList>
          
          {["all", "ongoing", "upcoming", "completed"].map((tab) => (
            <TabsContent key={tab} value={tab}>
              <div className="space-y-4">
                {projects
                  .filter((project) => tab === "all" || project.status === tab)
                  .map((project) => (
                    <Card 
                      key={project.id}
                      className="bg-dreamland-surface border-dreamland-accent/20 card-hover"
                      onClick={() => navigate(`/projects/${project.id}`)}
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-lg font-semibold">{project.title}</h3>
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
                        
                        <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                          {project.description}
                        </p>
                        
                        {project.status !== "upcoming" && project.progress !== undefined && (
                          <div className="mb-3">
                            <div className="flex justify-between text-xs text-gray-400 mb-1">
                              <span>Progress</span>
                              <span>{project.progress}%</span>
                            </div>
                            <Progress 
                              value={project.progress} 
                              className="h-1.5 bg-gray-700" 
                            />
                          </div>
                        )}
                        
                        <div className="flex justify-between items-center text-sm">
                          <div>
                            <div className="flex items-center space-x-1">
                              <span className="text-xs text-gray-400">Budget:</span>
                              <span className="font-medium text-dreamland-secondary">
                                ৳{project.budget.toLocaleString()}
                              </span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <span className="text-xs text-gray-400">Raised:</span>
                              <span className="font-medium text-dreamland-accent">
                                ৳{project.raised.toLocaleString()}
                              </span>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="text-xs text-gray-400">
                              {project.status === "completed" ? "Completed" : "Deadline"}:
                            </div>
                            <div className="text-sm">
                              {new Date(project.endDate).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-3 pt-3 border-t border-dreamland-accent/10 flex justify-between items-center">
                          <div className="text-xs text-gray-400">
                            Led by: <span className="text-white">{project.leader}</span>
                          </div>
                          <div className="text-xs text-gray-400">
                            {project.participants} participants
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Projects;
