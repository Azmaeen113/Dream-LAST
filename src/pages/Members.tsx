
import React from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

// Mock data
const members = [
  { id: "1", name: "Rafiqul Islam", photoUrl: "https://i.pravatar.cc/150?img=32", isPaid: false, mobile: "+8801712345678", email: "rafiqul@example.com", joinedDate: "2023-05-12", contributions: 45000 },
  { id: "2", name: "Abdul Karim", photoUrl: "https://i.pravatar.cc/150?img=12", isPaid: true, mobile: "+8801812345678", email: "abdul@example.com", joinedDate: "2023-05-18", contributions: 50000 },
  { id: "3", name: "Nasreen Ahmed", photoUrl: "https://i.pravatar.cc/150?img=23", isPaid: true, mobile: "+8801912345678", email: "nasreen@example.com", joinedDate: "2023-06-02", contributions: 50000 },
  { id: "4", name: "Farhan Khan", photoUrl: "https://i.pravatar.cc/150?img=67", isPaid: false, mobile: "+8801612345678", email: "farhan@example.com", joinedDate: "2023-06-10", contributions: 40000 },
  { id: "5", name: "Layla Rahman", photoUrl: "https://i.pravatar.cc/150?img=45", isPaid: true, mobile: "+8801512345678", email: "layla@example.com", joinedDate: "2023-07-05", contributions: 50000 },
  { id: "6", name: "Mominul Haque", photoUrl: "https://i.pravatar.cc/150?img=54", isPaid: false, mobile: "+8801312345678", email: "mominul@example.com", joinedDate: "2023-07-22", contributions: 35000 },
  { id: "7", name: "Tasnim Akter", photoUrl: "https://i.pravatar.cc/150?img=18", isPaid: true, mobile: "+8801412345678", email: "tasnim@example.com", joinedDate: "2023-08-08", contributions: 50000 },
  { id: "8", name: "Zahir Uddin", photoUrl: "https://i.pravatar.cc/150?img=71", isPaid: true, mobile: "+8801212345678", email: "zahir@example.com", joinedDate: "2023-08-15", contributions: 50000 },
];

const Members = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = React.useState("");

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
        
        <div className="space-y-3">
          {filteredMembers.map((member) => (
            <div
              key={member.id}
              className="bg-dreamland-surface rounded-lg p-4 flex items-center space-x-4 cursor-pointer card-hover"
              onClick={() => navigate(`/members/${member.id}`)}
            >
              <Avatar className="w-16 h-16 border-2 border-dreamland-accent/50">
                <AvatarImage src={member.photoUrl} />
                <AvatarFallback className="bg-dreamland-primary/20 text-lg">
                  {member.name[0].toUpperCase()}
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
                  <p>{member.mobile}</p>
                  <p className="truncate">{member.email}</p>
                </div>
                
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-gray-500">
                    Joined: {new Date(member.joinedDate).toLocaleDateString()}
                  </span>
                  <span className="text-sm font-medium text-dreamland-secondary">
                    ৳{member.contributions.toLocaleString()} contributed
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Members;
