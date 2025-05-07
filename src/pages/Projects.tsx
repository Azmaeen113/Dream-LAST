import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { isCurrentUserAdmin } from "@/lib/admin";
import { useToast } from "@/components/ui/use-toast";

interface Project {
  id: string;
  title: string;
  description: string;
  status: "upcoming" | "ongoing" | "completed";
  progress?: number;
  budget: number;
  raised?: number;
  start_date: string;
  end_date: string;
  photo_url?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

const Projects = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const { toast } = useToast();

  useEffect(() => {
    fetchProjects();
    checkAdminStatus();

    // Check for filter parameter in URL
    const params = new URLSearchParams(location.search);
    const filterParam = params.get('filter');
    if (filterParam && ["all", "ongoing", "upcoming", "completed"].includes(filterParam)) {
      setActiveTab(filterParam);
    }
  }, [location.search]);

  const checkAdminStatus = async () => {
    try {
      const adminStatus = await isCurrentUserAdmin();
      setIsAdmin(adminStatus);
    } catch (error) {
      console.error('Error checking admin status:', error);
    }
  };

  const fetchProjects = async () => {
    try {
      setIsLoading(true);

      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch projects. Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProjectClick = () => {
    if (isAdmin) {
      navigate('/create-project');
    } else {
      toast({
        variant: "destructive",
        title: "Permission Denied",
        description: "Only administrators can create new projects.",
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Projects</h1>
          <Button
            className={`${isAdmin ? 'bg-dreamland-primary hover:bg-dreamland-primary/90' : 'bg-gray-500 hover:bg-gray-600'}`}
            onClick={handleCreateProjectClick}
          >
            Create Project
            {!isAdmin && (
              <span className="ml-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </span>
            )}
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full bg-dreamland-surface mb-4">
            <TabsTrigger value="all" className="flex-1">All Projects</TabsTrigger>
            <TabsTrigger value="ongoing" className="flex-1">Ongoing</TabsTrigger>
            <TabsTrigger value="upcoming" className="flex-1">Upcoming</TabsTrigger>
            <TabsTrigger value="completed" className="flex-1">Completed</TabsTrigger>
          </TabsList>

          {["all", "ongoing", "upcoming", "completed"].map((tab) => (
            <TabsContent key={tab} value={tab}>
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dreamland-primary"></div>
                </div>
              ) : projects.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  No projects found
                </div>
              ) : (
                <div className="space-y-4">
                  {projects
                    .filter((project) => tab === "all" || project.status === tab)
                    .map((project) => (
                      <Card
                        key={project.id}
                        className="bg-dreamland-surface border-dreamland-accent/20 card-hover overflow-hidden"
                        onClick={() => navigate(`/projects/${project.id}`)}
                      >
                        <div className="flex flex-col md:flex-row">
                          {project.photo_url && (
                            <div className="w-full md:w-1/4 h-48 md:h-auto">
                              <img
                                src={project.photo_url}
                                alt={project.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <CardContent className={`p-4 ${project.photo_url ? 'md:w-3/4' : 'w-full'}`}>
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
                                {project.raised && (
                                  <div className="flex items-center space-x-1">
                                    <span className="text-xs text-gray-400">Raised:</span>
                                    <span className="font-medium text-dreamland-accent">
                                      ৳{project.raised.toLocaleString()}
                                    </span>
                                  </div>
                                )}
                              </div>

                              <div className="text-right">
                                <div className="text-xs text-gray-400">
                                  {project.status === "completed" ? "Completed" : "Deadline"}:
                                </div>
                                <div className="text-sm">
                                  {new Date(project.end_date).toLocaleDateString()}
                                </div>
                              </div>
                            </div>

                            <div className="mt-3 pt-3 border-t border-dreamland-accent/10 flex justify-between items-center">
                              <div className="text-xs text-gray-400">
                                Created: {new Date(project.created_at).toLocaleDateString()}
                              </div>
                            </div>
                          </CardContent>
                        </div>
                      </Card>
                    ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Projects;
