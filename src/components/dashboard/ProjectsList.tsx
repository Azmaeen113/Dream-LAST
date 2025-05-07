import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Project {
  id: string;
  title: string;
  description: string;
  status: "upcoming" | "ongoing" | "completed";
  progress?: number;
  budget: number;
  start_date: string;
  end_date: string;
  photo_url?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

interface ProjectsListProps {
  type: "upcoming" | "ongoing";
}

const ProjectsList: React.FC<ProjectsListProps> = ({ type }) => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('status', type)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSectionClick = () => {
    navigate(`/projects?filter=${type}`);
  };

  return (
    <Card
      className={`${type === "upcoming" ? "section-card-pink" : "section-card-blue"} cursor-pointer h-full`}
      onClick={handleSectionClick}
    >
      <CardHeader className="px-2 sm:px-3 md:px-4 pt-2 sm:pt-3 md:pt-4 pb-1 sm:pb-2">
        <CardTitle className="text-sm sm:text-base md:text-lg text-white flex items-center">
          {type === "upcoming" ? (
            <>
              <span className="inline-block w-1.5 sm:w-2 h-3 sm:h-4 bg-indigo-300 mr-1.5 sm:mr-2"></span>
              <span className="truncate">Upcoming Projects</span>
            </>
          ) : (
            <>
              <span className="inline-block w-1.5 sm:w-2 h-3 sm:h-4 bg-blue-300 mr-1.5 sm:mr-2"></span>
              <span className="truncate">Ongoing Projects</span>
            </>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-2 sm:p-3 md:p-4 flex-grow">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-white"></div>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-2 text-xs sm:text-sm text-white/70">
            No {type} projects
          </div>
        ) : (
          <div className="space-y-2 sm:space-y-3 h-full overflow-y-auto">
            {projects.slice(0, 2).map((project) => (
              <div
                key={project.id}
                className="border border-white/20 rounded-md p-2 sm:p-3 cursor-pointer card-hover bg-white/10"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/projects/${project.id}`);
                }}
              >
                <div className="flex justify-between items-start mb-1 sm:mb-2">
                  <h3 className="font-medium text-white text-xs sm:text-sm md:text-base truncate max-w-[80px] sm:max-w-[100px] md:max-w-[150px]">{project.title}</h3>
                  <Badge
                    className={cn(
                      type === "upcoming" ? "bg-[#1E1A3C]/90 text-white" : "bg-[#172A45]/90 text-white",
                      "text-[8px] sm:text-[10px] md:text-xs px-1 py-0.5 sm:px-1.5 sm:py-0.5"
                    )}
                  >
                    {type === "upcoming" ? "Upcoming" : "Ongoing"}
                  </Badge>
                </div>
                <p className="text-[8px] sm:text-[10px] md:text-xs text-white/70 line-clamp-1 mb-1 sm:mb-2">
                  {project.description}
                </p>

                {type === "ongoing" && project.progress !== undefined && (
                  <>
                    <div className="flex justify-between items-center text-[8px] sm:text-[10px] md:text-xs text-white/70 mb-1">
                      <span>Progress</span>
                      <span>{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} className="h-1 sm:h-1.5 bg-white/20" />
                  </>
                )}

                <div className="flex justify-between items-center text-[8px] sm:text-[10px] md:text-xs mt-1 sm:mt-2">
                  <span className="font-medium text-white">
                    ৳{project.budget.toLocaleString()}
                  </span>
                  <span className="text-white/70">
                    {type === "upcoming"
                      ? `Start: ${new Date(project.start_date).toLocaleDateString()}`
                      : `End: ${new Date(project.end_date).toLocaleDateString()}`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProjectsList;
