
import React from "react";
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
  return (
    <Card className="section-card card-hover">
      <CardContent className="p-4">
        <div className="flex items-center space-x-4">
          <Avatar className="w-16 h-16 border-2 border-dreamland-accent">
            <AvatarImage src={user.photoUrl} />
            <AvatarFallback className="bg-dreamland-primary/20 text-lg">
              {user.name[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <h3 className="font-semibold text-lg">{user.name}</h3>
            <Badge
              variant={user.isPaid ? "default" : "destructive"}
              className={user.isPaid ? "bg-green-600" : ""}
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
