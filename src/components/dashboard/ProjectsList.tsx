
import React from "react";
import { useNavigate } from "react-router-dom";
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
  startDate?: string;
  endDate?: string;
}

interface ProjectsListProps {
  projects: Project[];
  type: "upcoming" | "ongoing";
}

const ProjectsList: React.FC<ProjectsListProps> = ({ projects, type }) => {
  const navigate = useNavigate();
  const filteredProjects = projects.filter((project) => project.status === type);

  return (
    <Card className="section-card">
      <CardHeader className="px-4 pt-4 pb-2">
        <CardTitle className="text-lg">
          {type === "upcoming" ? "Upcoming" : "Ongoing"} Projects
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {filteredProjects.length === 0 ? (
          <div className="text-center py-2 text-gray-400 text-sm">
            No {type} projects
          </div>
        ) : (
          <div className="space-y-3">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="border border-dreamland-accent/10 rounded-md p-3 cursor-pointer card-hover"
                onClick={() => navigate(`/projects/${project.id}`)}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium">{project.title}</h3>
                  <Badge
                    className={cn(
                      type === "upcoming" ? "bg-dreamland-secondary" : "bg-green-600"
                    )}
                  >
                    {type === "upcoming" ? "Upcoming" : "Ongoing"}
                  </Badge>
                </div>
                <p className="text-xs text-gray-400 line-clamp-1 mb-2">
                  {project.description}
                </p>
                
                {type === "ongoing" && project.progress !== undefined && (
                  <>
                    <div className="flex justify-between items-center text-xs text-gray-400 mb-1">
                      <span>Progress</span>
                      <span>{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} className="h-1.5 bg-gray-700" />
                  </>
                )}

                <div className="flex justify-between items-center text-xs mt-2">
                  <span className="text-dreamland-secondary">
                    ৳{project.budget.toLocaleString()}
                  </span>
                  <span className="text-gray-400">
                    {type === "upcoming" && project.startDate 
                      ? `Start: ${new Date(project.startDate).toLocaleDateString()}` 
                      : project.endDate 
                        ? `End: ${new Date(project.endDate).toLocaleDateString()}`
                        : ""}
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
