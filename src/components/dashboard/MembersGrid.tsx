
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

  const handleCardClick = () => {
    navigate('/members');
  };

  return (
    <Card
      className="rounded-lg p-2 sm:p-3 md:p-4 shadow-lg transition-all duration-300 h-full flex flex-col cursor-pointer"
      style={{
        background: "linear-gradient(135deg, #2D1155 0%, #1A0A33 100%)"
      }}
      onClick={handleCardClick}
    >
      <CardHeader className="px-2 sm:px-3 pt-2 sm:pt-3 pb-1 sm:pb-2">
        <CardTitle className="text-sm sm:text-base md:text-lg text-white flex items-center">
          <span className="inline-block w-1.5 sm:w-2 h-3 sm:h-4 bg-violet-400 mr-1.5 sm:mr-2"></span>
          <img
            src="/images/members.png"
            alt="Members"
            className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2 object-contain"
          />
          <span className="truncate">Members of Group</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-2 sm:p-3 flex-grow">
        {members.length === 0 ? (
          <div className="text-center py-2 sm:py-3">
            <p className="text-white/70 text-xs sm:text-sm">No members found</p>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-1 sm:gap-2 h-full">
            {members.slice(0, 8).map((member) => (
              <div
                key={member.id}
                className="flex flex-col items-center cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/members/${member.id}`);
                }}
              >
              <div className="relative">
                <Avatar className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10">
                  <AvatarImage src={member.photoUrl || ""} />
                  <AvatarFallback className="bg-dreamland-primary/20 text-[8px] sm:text-xs">
                    {member.name?.[0]?.toUpperCase() || "?"}
                  </AvatarFallback>
                </Avatar>
                {member.isPaid ? (
                  <span className="absolute -bottom-1 -right-1 w-1.5 h-1.5 sm:w-2 sm:h-2 md:w-2.5 md:h-2.5 bg-green-500 rounded-full border-[1px] sm:border-[1.5px] border-dreamland-surface"></span>
                ) : (
                  <span className="absolute -bottom-1 -right-1 w-1.5 h-1.5 sm:w-2 sm:h-2 md:w-2.5 md:h-2.5 bg-red-500 rounded-full border-[1px] sm:border-[1.5px] border-dreamland-surface"></span>
                )}
              </div>
              <span className="text-[8px] sm:text-[10px] md:text-xs mt-1 truncate w-full text-center">
                {member.name?.split(" ")[0] || ""}
              </span>
            </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MembersGrid;
