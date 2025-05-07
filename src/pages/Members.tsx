import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getAllMembers, type Member } from "@/lib/members";
import { useToast } from "@/components/ui/use-toast";

const Members = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Fetch members on component mount and when location state changes
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setIsLoading(true);
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
        setIsLoading(false);
      }
    };

    fetchMembers();
  }, [toast, location.state?.refresh]); // Add location.state.refresh to dependencies

  const filteredMembers = members.filter((member) =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Members</h1>

        <div className="mb-5">
          <Input
            className="bg-dreamland-surface border-dreamland-accent/20"
            placeholder="Search members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dreamland-primary"></div>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500">No members found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredMembers.map((member) => (
              <div
                key={member.id}
                className="bg-dreamland-surface rounded-lg p-4 flex items-center space-x-4 cursor-pointer card-hover"
                onClick={() => navigate(`/members/${member.id}`)}
              >
                <Avatar className="w-16 h-16 border-2 border-dreamland-accent/50">
                  <AvatarImage src={member.photoUrl || ""} />
                  <AvatarFallback className="bg-dreamland-primary/20 text-lg">
                    {member.name?.[0]?.toUpperCase() || "?"}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-lg">{member.name}</h3>
                    <Badge
                      variant={member.isPaid ? "default" : "destructive"}
                      className={member.isPaid ? "bg-green-600" : ""}
                    >
                      {member.isPaid ? "Paid" : "Due"}
                    </Badge>
                  </div>

                  <div className="text-sm text-gray-400 mt-1">
                    <p>{member.mobile || "No mobile"}</p>
                  </div>

                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-gray-500">
                      Joined: {member.joinedDate ? new Date(member.joinedDate).toLocaleDateString() : "Unknown"}
                    </span>
                    <span className="text-sm font-medium text-dreamland-secondary">
                      ৳{(member.contributions || 0).toLocaleString()} contributed
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Members;
