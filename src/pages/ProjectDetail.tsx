import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { isCurrentUserAdmin } from "@/lib/admin";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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
  location?: string;
  photo_url?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

interface ProjectUpdate {
  id: string;
  project_id: string;
  content: string;
  created_at: string;
}

interface ProjectMember {
  id: string;
  name: string;
  photo_url?: string;
}

// Mock updates and members until we implement these features
const mockUpdates = [
  { date: "2024-04-02", content: "Completed irrigation system setup" },
  { date: "2024-03-10", content: "Purchased seeds and fertilizers" },
  { date: "2024-01-20", content: "Land preparation completed" },
];

// Mock members for future implementation
const mockMembers = [
  { id: "2", name: "Abdul Karim", photoUrl: "https://i.pravatar.cc/150?img=12" },
  { id: "3", name: "Nasreen Ahmed", photoUrl: "https://i.pravatar.cc/150?img=23" },
  { id: "5", name: "Layla Rahman", photoUrl: "https://i.pravatar.cc/150?img=45" },
];

// This was part of the old mock data structure that's no longer needed
// Keeping the comment as a reference for future implementation
/*
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
*/

const ProjectDetail = () => {
  const { id } = useParams<{id: string}>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [projectCreator, setProjectCreator] = useState<{ name: string, photo_url?: string } | null>(null);

  useEffect(() => {
    if (id) {
      fetchProjectDetails(id);
      checkAdminStatus();
    }
  }, [id]);

  const checkAdminStatus = async () => {
    try {
      const adminStatus = await isCurrentUserAdmin();
      setIsAdmin(adminStatus);
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    }
  };

  const fetchProjectDetails = async (projectId: string) => {
    try {
      setIsLoading(true);

      // Fetch project details
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (projectError) throw projectError;

      if (projectData) {
        setProject(projectData);

        // Fetch project creator details
        if (projectData.created_by) {
          const { data: creatorData, error: creatorError } = await supabase
            .from('profiles')
            .select('name, photo_url')
            .eq('id', projectData.created_by)
            .single();

          if (!creatorError && creatorData) {
            setProjectCreator(creatorData);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching project details:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load project details",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!id) return;

    try {
      setIsLoading(true);

      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Project Deleted",
        description: "The project has been successfully deleted.",
      });

      navigate('/projects');
    } catch (error) {
      console.error('Error deleting project:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete project. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-4 flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dreamland-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

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
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center">
            <Button
              variant="outline"
              className="border-dreamland-accent/20 mr-2"
              onClick={() => navigate('/projects')}
            >
              ← Back
            </Button>
            <h1 className="text-2xl font-bold">Project Details</h1>
          </div>
          {isAdmin && (
            <Button
              variant="outline"
              className="border-dreamland-secondary text-dreamland-secondary"
              onClick={() => navigate(`/edit-project/${project.id}`)}
            >
              Edit Project
            </Button>
          )}
        </div>

        <Card className="bg-dreamland-surface border-dreamland-accent/20 mb-4">
          {project.photo_url && (
            <div className="w-full h-64 overflow-hidden">
              <img
                src={project.photo_url}
                alt={project.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
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
                <p className="font-medium">{new Date(project.start_date).toLocaleDateString()}</p>
              </div>

              <div>
                <h4 className="text-sm text-gray-400 mb-1">End Date</h4>
                <p className="font-medium">{new Date(project.end_date).toLocaleDateString()}</p>
              </div>

              <div>
                <h4 className="text-sm text-gray-400 mb-1">Budget</h4>
                <p className="font-medium text-dreamland-secondary">৳{project.budget.toLocaleString()}</p>
              </div>

              {project.raised && (
                <div>
                  <h4 className="text-sm text-gray-400 mb-1">Raised</h4>
                  <p className="font-medium text-dreamland-accent">৳{project.raised.toLocaleString()}</p>
                </div>
              )}
            </div>

            {project.location && (
              <div>
                <h4 className="text-sm text-gray-400 mb-1">Location</h4>
                <p className="font-medium">{project.location}</p>
              </div>
            )}

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

            {projectCreator && (
              <div>
                <h4 className="text-sm text-gray-400 mb-2">Project Creator</h4>
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src={projectCreator.photo_url} />
                    <AvatarFallback className="bg-dreamland-primary/20">
                      {projectCreator.name[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{projectCreator.name}</span>
                </div>
              </div>
            )}

            <Separator className="bg-dreamland-accent/10" />

            <div>
              <h4 className="text-md font-medium mb-3">Project Updates</h4>
              <div className="space-y-3">
                {mockUpdates.map((update, index) => (
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
                {/* We'll implement this feature later */}
                <div className="text-sm text-gray-400">
                  No team members yet
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center space-x-4">
          {project.status === "upcoming" && (
            <Button
              className="bg-dreamland-primary hover:bg-dreamland-primary/90"
              onClick={() => navigate(`/projects/${id}/join`)}
            >
              Join This Project
            </Button>
          )}

          <Button
            variant="outline"
            className="border-dreamland-accent/20"
            onClick={() => navigate('/projects')}
          >
            View All Projects
          </Button>
        </div>

        {isAdmin && (
          <div className="flex justify-center space-x-4">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={isLoading}>
                  Delete Project
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the project
                    and remove all associated data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteProject}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ProjectDetail;
