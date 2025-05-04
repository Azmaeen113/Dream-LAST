
import React, { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Mock data for the profile
const userProfile = {
  name: "Rafiqul Islam",
  email: "rafiqul@example.com",
  mobile: "+8801712345678",
  address: "123 Green Road, Dhaka, Bangladesh",
  photoUrl: "https://i.pravatar.cc/150?img=32",
  joinedDate: "2023-05-12",
  totalContribution: 45000,
};

// Mock data for transactions
const transactions = [
  { id: "1", date: "2024-04-07", amount: 5000, method: "bKash", status: "completed" },
  { id: "2", date: "2024-03-06", amount: 5000, method: "Nagad", status: "completed" },
  { id: "3", date: "2024-02-08", amount: 5000, method: "bKash", status: "completed" },
  { id: "4", date: "2024-01-07", amount: 5000, method: "bKash", status: "completed" },
  { id: "5", date: "2023-12-09", amount: 5000, method: "Rocket", status: "completed" },
  { id: "6", date: "2023-11-07", amount: 5000, method: "Nagad", status: "completed" },
  { id: "7", date: "2023-10-05", amount: 5000, method: "bKash", status: "completed" },
  { id: "8", date: "2023-09-07", amount: 5000, method: "bKash", status: "completed" },
  { id: "9", date: "2023-08-07", amount: 5000, method: "Rocket", status: "completed" },
];

const Profile = () => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: userProfile.name,
    email: userProfile.email,
    mobile: userProfile.mobile,
    address: userProfile.address,
  });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(userProfile.photoUrl);
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfilePhoto(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = () => {
    // Here we would normally update the profile via Supabase
    toast({
      title: "Profile updated",
      description: "Your profile has been successfully updated!",
    });
    setIsEditing(false);
  };

  const handleLogout = () => {
    // Here we would normally handle logout via Supabase
    // For now we'll just redirect to the sign-in page
    window.location.href = "/sign-in";
  };

  return (
    <DashboardLayout>
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">My Profile</h1>
        
        <Tabs defaultValue="info" className="w-full">
          <TabsList className="w-full bg-dreamland-surface mb-4">
            <TabsTrigger value="info" className="flex-1">Profile Info</TabsTrigger>
            <TabsTrigger value="transactions" className="flex-1">Transaction History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="info">
            <Card className="bg-dreamland-surface border-dreamland-accent/20">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Personal Information</CardTitle>
                {!isEditing ? (
                  <Button 
                    onClick={() => setIsEditing(true)}
                    variant="outline" 
                    className="border-dreamland-secondary text-dreamland-secondary"
                  >
                    Edit Profile
                  </Button>
                ) : (
                  <div className="space-x-2">
                    <Button 
                      onClick={() => setIsEditing(false)} 
                      variant="outline"
                      className="border-gray-600 text-gray-400"
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleSaveProfile}
                      className="bg-dreamland-primary hover:bg-dreamland-primary/90"
                    >
                      Save
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center mb-6">
                  <div className="relative mb-4">
                    <Avatar className="w-24 h-24 border-2 border-dreamland-accent">
                      <AvatarImage src={avatarPreview || ""} />
                      <AvatarFallback className="bg-dreamland-primary/20 text-lg">
                        {formData.name ? formData.name[0].toUpperCase() : "U"}
                      </AvatarFallback>
                    </Avatar>
                    {isEditing && (
                      <label 
                        htmlFor="profilePhoto"
                        className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-dreamland-secondary text-dreamland-surface cursor-pointer"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                          <circle cx="12" cy="13" r="4"></circle>
                        </svg>
                        <Input 
                          id="profilePhoto" 
                          name="profilePhoto" 
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleFileUpload}
                          disabled={!isEditing}
                        />
                      </label>
                    )}
                  </div>
                  
                  <div className="text-center">
                    <h2 className="text-xl font-bold mb-1">{userProfile.name}</h2>
                    <p className="text-sm text-gray-400">
                      Member since {new Date(userProfile.joinedDate).toLocaleDateString()}
                    </p>
                    <div className="mt-2">
                      <Badge className="bg-dreamland-secondary">
                        ৳{userProfile.totalContribution.toLocaleString()} Total Contribution
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="bg-dreamland-background"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="bg-dreamland-background"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="mobile">Mobile Number</Label>
                    <Input
                      id="mobile"
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="bg-dreamland-background"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Textarea
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="bg-dreamland-background min-h-[80px]"
                    />
                  </div>
                  
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    className="w-full mt-6 border-red-500 text-red-500 hover:bg-red-900/20"
                  >
                    Log Out
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="transactions">
            <Card className="bg-dreamland-surface border-dreamland-accent/20">
              <CardHeader>
                <CardTitle className="text-lg">Transaction History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {transactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="border border-dreamland-accent/10 rounded-md p-4"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-medium">Monthly Contribution</h3>
                          <p className="text-xs text-gray-400">
                            {new Date(transaction.date).toLocaleDateString()} via {transaction.method}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-dreamland-secondary">
                            ৳{transaction.amount.toLocaleString()}
                          </p>
                          <Badge
                            variant="outline"
                            className="border-green-500 text-green-500"
                          >
                            {transaction.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
