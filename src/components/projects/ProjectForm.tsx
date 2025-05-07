import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { uploadProjectPhoto } from "@/lib/storage";
import { getCurrentUser } from "@/lib/auth";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ProjectFormProps {
  projectId?: string; // If provided, we're editing an existing project
}

const ProjectForm: React.FC<ProjectFormProps> = ({ projectId }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    budget: "",
    startDate: "",
    endDate: "",
    status: "upcoming",
    location: "",
    projectPhoto: null as File | null,
  });

  useEffect(() => {
    // If projectId is provided, fetch the project data
    if (projectId) {
      fetchProjectData();
    }
  }, [projectId]);

  const fetchProjectData = async () => {
    try {
      setIsLoading(true);
      
      const { data: project, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();
      
      if (error) throw error;
      
      if (project) {
        setFormData({
          title: project.title || "",
          description: project.description || "",
          budget: project.budget?.toString() || "",
          startDate: project.start_date || "",
          endDate: project.end_date || "",
          status: project.status || "upcoming",
          location: project.location || "",
          projectPhoto: null,
        });
        
        // Set image preview if photo_url exists
        if (project.photo_url) {
          setImagePreview(project.photo_url);
        }
      }
    } catch (error) {
      console.error("Error fetching project:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load project information",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData({
        ...formData,
        projectPhoto: file,
      });

      // Create preview URL
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      
      const user = await getCurrentUser();
      if (!user) {
        throw new Error("User not authenticated. Please sign in again.");
      }

      console.log("User authenticated:", user.id);
      
      // Prepare project data
      const projectData: any = {
        title: formData.title,
        description: formData.description,
        budget: parseFloat(formData.budget) || 0,
        start_date: formData.startDate,
        end_date: formData.endDate,
        status: formData.status,
        created_by: user.id,
        updated_at: new Date().toISOString(),
      };
      
      // If editing, don't change the created_by field
      if (projectId) {
        delete projectData.created_by;
      } else {
        projectData.created_at = new Date().toISOString();
        projectData.progress = 0;
      }
      
      let newProjectId = projectId;
      
      // Insert or update the project
      if (projectId) {
        // Update existing project
        const { error } = await supabase
          .from('projects')
          .update(projectData)
          .eq('id', projectId);
        
        if (error) {
          console.error("Error updating project:", error);
          throw error;
        }
      } else {
        // Create new project
        console.log("Creating new project with data:", projectData);
        const { data, error } = await supabase
          .from('projects')
          .insert(projectData)
          .select();
        
        if (error) {
          console.error("Error creating project:", error);
          throw error;
        }
        
        if (!data || data.length === 0) {
          throw new Error("Failed to create project: No data returned");
        }
        
        newProjectId = data[0].id;
        console.log("Project created with ID:", newProjectId);
      }
      
      // Handle photo upload if we have a new photo
      if (formData.projectPhoto && newProjectId) {
        console.log("Uploading project photo...");
        const photoUrl = await uploadProjectPhoto(newProjectId, formData.projectPhoto);
        
        if (photoUrl) {
          console.log("Photo uploaded successfully:", photoUrl);
          // Update the project with the photo URL
          const { error } = await supabase
            .from('projects')
            .update({ photo_url: photoUrl })
            .eq('id', newProjectId);
          
          if (error) {
            console.error("Error updating project with photo URL:", error);
            // Continue anyway
          }
        } else {
          console.warn("Failed to upload project photo");
        }
      }
      
      toast({
        title: projectId ? "Project Updated" : "Project Created",
        description: projectId 
          ? "Your project has been updated successfully." 
          : "Your project has been created successfully.",
      });
      
      // Navigate to the project detail page
      navigate(`/projects/${newProjectId}`);
      
    } catch (error: any) {
      console.error("Error saving project:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to save project. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-dreamland-surface border-dreamland-accent/20">
      <CardHeader>
        <CardTitle>{projectId ? "Edit Project" : "Create New Project"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Project Image Upload */}
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div 
                className="w-full h-48 bg-dreamland-background rounded-md flex items-center justify-center overflow-hidden border border-dreamland-accent/20"
              >
                {imagePreview ? (
                  <img 
                    src={imagePreview} 
                    alt="Project preview" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center p-4">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      width="48" 
                      height="48" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="1" 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      className="mx-auto mb-2 text-gray-400"
                    >
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                      <circle cx="12" cy="13" r="4"></circle>
                    </svg>
                    <p className="text-gray-400">Upload project image</p>
                  </div>
                )}
              </div>
              <label
                htmlFor="projectPhoto"
                className="absolute bottom-2 right-2 p-2 rounded-full bg-dreamland-secondary text-dreamland-surface cursor-pointer"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="20" 
                  height="20" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                  <circle cx="12" cy="13" r="4"></circle>
                </svg>
                <Input
                  id="projectPhoto"
                  name="projectPhoto"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </label>
            </div>
          </div>

          {/* Project Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Project Title</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              className="bg-dreamland-background"
            />
          </div>

          {/* Project Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              className="bg-dreamland-background min-h-[100px]"
            />
          </div>

          {/* Project Budget */}
          <div className="space-y-2">
            <Label htmlFor="budget">Budget (৳)</Label>
            <Input
              id="budget"
              name="budget"
              type="number"
              value={formData.budget}
              onChange={handleInputChange}
              required
              className="bg-dreamland-background"
            />
          </div>

          {/* Project Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                name="startDate"
                type="date"
                value={formData.startDate}
                onChange={handleInputChange}
                required
                className="bg-dreamland-background"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                name="endDate"
                type="date"
                value={formData.endDate}
                onChange={handleInputChange}
                required
                className="bg-dreamland-background"
              />
            </div>
          </div>

          {/* Project Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select 
              value={formData.status} 
              onValueChange={(value) => handleSelectChange("status", value)}
            >
              <SelectTrigger className="bg-dreamland-background">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="ongoing">Ongoing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Project Location */}
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              className="bg-dreamland-background"
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              className="border-gray-600 text-gray-400"
              onClick={() => navigate('/projects')}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-dreamland-primary hover:bg-dreamland-primary/90"
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : (projectId ? "Update Project" : "Create Project")}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProjectForm;
