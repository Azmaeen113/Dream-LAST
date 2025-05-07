
import React from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface MemberAccountProps {
  user: {
    name: string;
    photoUrl: string;
    isPaid: boolean;
  };
}

const MemberAccount: React.FC<MemberAccountProps> = ({ user }) => {
  const navigate = useNavigate();

  const handleProfileClick = () => {
    navigate('/profile');
  };

  return (
    <Card
      className="section-card-purple card-hover cursor-pointer h-full"
      onClick={handleProfileClick}
    >
      <CardContent className="p-2 sm:p-3 md:p-4 h-full">
        <div className="flex flex-col items-center text-center h-full justify-center">
          <Avatar className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 border-2 border-white/30 mb-2 sm:mb-3">
            <AvatarImage src={user.photoUrl} />
            <AvatarFallback className="bg-white/20 text-sm sm:text-lg md:text-xl">
              {user.name[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-center">
            <h3 className="font-semibold text-sm sm:text-base md:text-lg text-white mb-1 sm:mb-2 break-words text-center w-full">
              {user.name}
            </h3>
            <Badge
              variant={user.isPaid ? "default" : "destructive"}
              className={`${user.isPaid ? "bg-green-600" : ""} text-[10px] sm:text-xs`}
            >
              {user.isPaid ? "Payment Complete" : "Payment Due"}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MemberAccount;
