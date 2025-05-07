import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";

const SignUpForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    address: "",
    password: "",
    confirmPassword: "",
    profilePhoto: null as File | null,
  });

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
      setFormData({
        ...formData,
        profilePhoto: file,
      });

      // Create preview URL
      const reader = new FileReader();
      reader.onload = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast({
        variant: "destructive",
        title: "Passwords don't match",
        description: "Please make sure your passwords match",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Register with Supabase Auth - include all profile data in the metadata
      // This approach relies on a database trigger to create the profile
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.name,
            name: formData.name,
            address: formData.address,
            mobile_number: formData.mobile,
            email: formData.email,
            is_admin: false
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (authError) throw authError;

      if (!authData.user) {
        throw new Error("User creation failed");
      }

      // If we have a profile photo, upload it
      if (formData.profilePhoto && authData.user) {
        try {
          const fileExt = formData.profilePhoto.name.split('.').pop();
          const fileName = `${authData.user.id}/${authData.user.id}.jpg`;

          const { error: uploadError } = await supabase.storage
            .from('profile_photos')
            .upload(fileName, formData.profilePhoto);

          if (uploadError) throw uploadError;

          // Get the public URL for the uploaded photo
          const { data: urlData } = supabase.storage
            .from('profile_photos')
            .getPublicUrl(fileName);

          // We'll update the user metadata with the photo URL
          // This will be picked up by the trigger when the user confirms their email
          if (urlData) {
            const { error: updateError } = await supabase.auth.updateUser({
              data: {
                photo_url: urlData.publicUrl
              }
            });

            if (updateError) {
              console.error("Failed to update user with photo URL:", updateError);
              // Continue anyway
            }
          }
        } catch (uploadError) {
          console.error("Profile photo upload failed:", uploadError);
          // Continue with signup even if photo upload fails
        }
      }

      toast({
        title: "Account created",
        description: "You have successfully created your account. Please check your email to confirm your account.",
      });

      navigate("/sign-in");
    } catch (error: any) {
      console.error("Signup error:", error);
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: error.message || "An error occurred during registration",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-dreamland-surface border-dreamland-accent/20">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Create an Account</CardTitle>
        <CardDescription className="text-center">
          Join DreamLand Group to start saving together
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Avatar className="w-24 h-24 border-2 border-dreamland-accent">
                <AvatarImage src={avatarPreview || ""} />
                <AvatarFallback className="bg-dreamland-primary/20 text-lg">
                  {formData.name ? formData.name[0].toUpperCase() : "U"}
                </AvatarFallback>
              </Avatar>
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
                />
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="John Doe"
                required
                value={formData.name}
                onChange={handleInputChange}
                className="bg-dreamland-background"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mobile">Mobile Number</Label>
              <Input
                id="mobile"
                name="mobile"
                placeholder="+880"
                required
                value={formData.mobile}
                onChange={handleInputChange}
                className="bg-dreamland-background"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="your@email.com"
              required
              value={formData.email}
              onChange={handleInputChange}
              className="bg-dreamland-background"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              name="address"
              placeholder="Your address"
              required
              value={formData.address}
              onChange={handleInputChange}
              className="bg-dreamland-background min-h-[80px]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleInputChange}
                className="bg-dreamland-background"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="bg-dreamland-background"
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-dreamland-primary hover:bg-dreamland-primary/90"
            disabled={isLoading}
          >
            {isLoading ? "Creating account..." : "Sign Up"}
          </Button>
        </form>
      </CardContent>
      <CardFooter>
        <div className="text-center w-full text-sm">
          Already have an account?{" "}
          <Button
            variant="link"
            className="p-0 h-auto text-dreamland-secondary"
            onClick={() => navigate("/sign-in")}
          >
            Sign in
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default SignUpForm;
