
import React from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Member {
  id: string;
  name: string;
  photoUrl: string;
  isPaid: boolean;
}

interface MembersGridProps {
  members: Member[];
}

const MembersGrid: React.FC<MembersGridProps> = ({ members }) => {
  const navigate = useNavigate();
  
  return (
    <Card className="section-card">
      <CardHeader className="px-4 pt-4 pb-2">
        <CardTitle className="text-lg">Members of Group</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid grid-cols-4 gap-2">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex flex-col items-center cursor-pointer"
              onClick={() => navigate(`/members/${member.id}`)}
            >
              <div className="relative">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={member.photoUrl} />
                  <AvatarFallback className="bg-dreamland-primary/20">
                    {member.name[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {member.isPaid ? (
                  <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-dreamland-surface"></span>
                ) : (
                  <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-dreamland-surface"></span>
                )}
              </div>
              <span className="text-xs mt-1 truncate w-full text-center">
                {member.name.split(" ")[0]}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default MembersGrid;
