import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import ProjectForm from "@/components/projects/ProjectForm";
import { isCurrentUserAdmin } from "@/lib/admin";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";

const CreateProject = () => {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const adminStatus = await isCurrentUserAdmin();
        setIsAdmin(adminStatus);

        if (!adminStatus) {
          toast({
            variant: "destructive",
            title: "Permission Denied",
            description: "Only administrators can create new projects.",
          });
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      }
    };

    checkAdminStatus();
  }, [toast]);

  if (isAdmin === null) {
    // Loading state
    return (
      <DashboardLayout>
        <div className="p-4 flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dreamland-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (isAdmin === false) {
    // Not authorized
    return (
      <DashboardLayout>
        <div className="p-4 text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="mb-6">You do not have permission to create projects. Only administrators can create new projects.</p>
          <Button
            onClick={() => navigate('/projects')}
            className="bg-dreamland-primary hover:bg-dreamland-primary/90"
          >
            Back to Projects
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Create New Project</h1>
        <ProjectForm />
      </div>
    </DashboardLayout>
  );
};

export default CreateProject;
