import React, { useState, useEffect } from "react";
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
import { supabase } from "@/integrations/supabase/client";
import { getCurrentUser, getUserProfile, updateUserProfile, signOut } from "@/lib/auth";
import { getUserPayments, type Payment } from "@/lib/payments";

// Default profile data
const defaultProfile = {
  name: "",
  email: "",
  mobile: "",
  address: "",
  photoUrl: "",
  joinedDate: new Date().toISOString().split('T')[0],
  totalContribution: 0,
};

const Profile = () => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(defaultProfile);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    address: "",
  });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isPaymentsLoading, setIsPaymentsLoading] = useState(true);

  // Fetch user profile and payments on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        const user = await getCurrentUser();

        if (!user) {
          // Redirect to login if no user is found
          window.location.href = "/sign-in";
          return;
        }

        const [profileResult, paymentsData] = await Promise.all([
          getUserProfile(user.id),
          getUserPayments(user.id)
        ]);

        if (profileResult.error) {
          throw profileResult.error;
        }

        if (profileResult.data) {
          const userData = {
            name: profileResult.data.name || "",
            email: profileResult.data.email || "",
            mobile: profileResult.data.mobile_number || "",
            address: profileResult.data.address || "",
            photoUrl: profileResult.data.photo_url || "",
            joinedDate: profileResult.data.created_at || new Date().toISOString(),
            totalContribution: paymentsData.reduce((sum, payment) => sum + payment.amount, 0),
          };

          setUserProfile(userData);
          setFormData({
            name: userData.name,
            email: userData.email,
            mobile: userData.mobile,
            address: userData.address,
          });
          setAvatarPreview(userData.photoUrl);
          setPayments(paymentsData);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load profile information",
        });
      } finally {
        setIsLoading(false);
        setIsPaymentsLoading(false);
      }
    };

    fetchUserData();
  }, [toast]);

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

  const handleSaveProfile = async () => {
    try {
      setIsLoading(true);
      const user = await getCurrentUser();

      if (!user) {
        throw new Error("User not authenticated");
      }

      // Process photo upload first if we have a new photo
      let photoUrl = userProfile.photoUrl;

      if (profilePhoto) {
        try {
          const fileExt = profilePhoto.name.split('.').pop();
          const fileName = `${user.id}/${user.id}.${fileExt}`;

          console.log("Starting photo upload...", {
            fileName,
            fileSize: profilePhoto.size,
            fileType: profilePhoto.type
          });

          // Upload the photo to storage
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('profile_photos')
            .upload(fileName, profilePhoto, { 
              upsert: true,
              cacheControl: '3600',
              contentType: profilePhoto.type
            });

          if (uploadError) {
            console.error("Upload error details:", uploadError);
            throw new Error(`Failed to upload profile photo: ${uploadError.message}`);
          }

          console.log("Upload successful, getting public URL...");

          // Get the public URL for the uploaded photo
          const { data: urlData, error: urlError } = supabase.storage
            .from('profile_photos')
            .getPublicUrl(fileName);

          if (urlError) {
            console.error("URL generation error:", urlError);
            throw new Error(`Failed to get public URL: ${urlError.message}`);
          }

          if (!urlData || !urlData.publicUrl) {
            console.error("No public URL returned:", urlData);
            throw new Error("Failed to get public URL for uploaded photo");
          }

          console.log("Public URL generated:", urlData.publicUrl);
          photoUrl = urlData.publicUrl;
        } catch (photoError) {
          console.error("Detailed photo processing error:", photoError);
          throw new Error(`Failed to process profile photo: ${photoError.message}`);
        }
      }

      // Update profile in Supabase with all data including photo URL
      const profileData = {
        name: formData.name,
        email: formData.email,
        mobile_number: formData.mobile,
        address: formData.address,
        photo_url: photoUrl,
        updated_at: new Date().toISOString(),
      };

      console.log("Updating profile with data:", profileData);

      const { error } = await updateUserProfile(user.id, profileData);

      if (error) {
        console.error("Profile update error details:", error);
        throw new Error(`Failed to update profile: ${error.message}`);
      }

      // Update local state
      setUserProfile({
        ...userProfile,
        name: formData.name,
        email: formData.email,
        mobile: formData.mobile,
        address: formData.address,
        photoUrl: photoUrl,
      });

      // Update avatar preview with the new URL
      setAvatarPreview(photoUrl);

      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated!",
      });

      setIsEditing(false);
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update profile",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      const { error } = await signOut();

      if (error) {
        throw error;
      }

      // Redirect to sign-in page
      window.location.href = "/sign-in";
    } catch (error: any) {
      console.error("Error signing out:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to sign out",
      });
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">My Profile</h1>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dreamland-primary"></div>
          </div>
        ) : (
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
                      disabled={isLoading}
                    >
                      Edit Profile
                    </Button>
                  ) : (
                    <div className="space-x-2">
                      <Button
                        onClick={() => setIsEditing(false)}
                        variant="outline"
                        className="border-gray-600 text-gray-400"
                        disabled={isLoading}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSaveProfile}
                        className="bg-dreamland-primary hover:bg-dreamland-primary/90"
                        disabled={isLoading}
                      >
                        {isLoading ? "Saving..." : "Save"}
                      </Button>
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center mb-6">
                    <div className="relative">
                      <Avatar className="w-24 h-24 border-2 border-dreamland-accent/10">
                        <AvatarImage src={avatarPreview || ""} />
                        <AvatarFallback className="text-2xl">
                          {userProfile.name[0]?.toUpperCase() || "?"}
                        </AvatarFallback>
                      </Avatar>
                      {isEditing && (
                        <div className="absolute bottom-0 right-0">
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="hidden"
                            id="photo-upload"
                          />
                          <Label
                            htmlFor="photo-upload"
                            className="cursor-pointer bg-dreamland-primary p-2 rounded-full hover:bg-dreamland-primary/90 transition-colors"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </Label>
                        </div>
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
                      disabled={isLoading}
                    >
                      {isLoading ? "Logging out..." : "Log Out"}
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
                  {isPaymentsLoading ? (
                    <div className="flex justify-center items-center h-24">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dreamland-primary"></div>
                    </div>
                  ) : payments.length > 0 ? (
                    <div className="space-y-4">
                      {payments.map((payment) => (
                        <div
                          key={payment.id}
                          className="border border-dreamland-accent/10 rounded-md p-4"
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <h3 className="font-medium">Monthly Contribution</h3>
                              <p className="text-xs text-gray-400">
                                {payment.month} - Due: {new Date(payment.due_date).toLocaleDateString()}
                              </p>
                              {payment.payment_date && (
                                <p className="text-xs text-gray-400">
                                  Paid: {new Date(payment.payment_date).toLocaleDateString()} via {payment.payment_method}
                                </p>
                              )}
                              {payment.notes && (
                                <p className="text-xs text-gray-400">
                                  Note: {payment.notes}
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-dreamland-secondary">
                                ৳{payment.amount.toLocaleString()}
                              </p>
                              <Badge
                                variant="outline"
                                className={`${
                                  payment.status === 'completed'
                                    ? 'border-green-500 text-green-500'
                                    : 'border-yellow-500 text-yellow-500'
                                }`}
                              >
                                {payment.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-400">No transaction history available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Profile;
