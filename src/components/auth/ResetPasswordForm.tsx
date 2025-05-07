import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { verifyResetToken } from "@/lib/emailService";

const ResetPasswordForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [passwordStrong, setPasswordStrong] = useState(true);

  const location = useLocation();
  const [tokenVerified, setTokenVerified] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const verifyToken = async () => {
      try {
        // Check if we have a hash fragment in the URL (from Supabase password reset email)
        const hash = window.location.hash;

        // Check if we have a token in the query params (from our custom email)
        const params = new URLSearchParams(location.search);
        const token = params.get('token');

        if (!hash && !token) {
          toast({
            variant: "destructive",
            title: "Invalid reset link",
            description: "Please use the link from your email to reset your password.",
          });
          setTimeout(() => navigate("/forgot-password"), 3000);
          return;
        }

        // If we have a token, verify it
        if (token) {
          const email = await verifyResetToken(token);
          if (email) {
            setUserEmail(email);
            setTokenVerified(true);
          } else {
            toast({
              variant: "destructive",
              title: "Invalid or expired token",
              description: "Please request a new password reset link.",
            });
            setTimeout(() => navigate("/forgot-password"), 3000);
          }
        } else {
          // If we have a hash but no token, we're using Supabase's built-in reset
          setTokenVerified(true);
        }
      } catch (error) {
        console.error("Error verifying token:", error);
        toast({
          variant: "destructive",
          title: "Error verifying token",
          description: "An error occurred while verifying your reset token.",
        });
        setTimeout(() => navigate("/forgot-password"), 3000);
      } finally {
        setIsVerifying(false);
      }
    };

    verifyToken();
  }, [navigate, toast, location]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Check if passwords match when either password field changes
    if (name === "password" || name === "confirmPassword") {
      if (name === "password") {
        setPasswordStrong(value.length >= 8);
      }
      if (formData.confirmPassword || name === "confirmPassword") {
        setPasswordsMatch(
          name === "password"
            ? value === formData.confirmPassword
            : formData.password === value
        );
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate passwords
    if (formData.password !== formData.confirmPassword) {
      setPasswordsMatch(false);
      toast({
        variant: "destructive",
        title: "Passwords don't match",
        description: "Please make sure your passwords match.",
      });
      return;
    }

    if (formData.password.length < 8) {
      setPasswordStrong(false);
      toast({
        variant: "destructive",
        title: "Password too weak",
        description: "Password must be at least 8 characters long.",
      });
      return;
    }

    if (!tokenVerified) {
      toast({
        variant: "destructive",
        title: "Invalid reset link",
        description: "Please use the link from your email to reset your password.",
      });
      setTimeout(() => navigate("/forgot-password"), 3000);
      return;
    }

    setIsLoading(true);

    try {
      // Update the user's password
      const { error } = await supabase.auth.updateUser({
        password: formData.password,
      });

      if (error) throw error;

      // If we have a custom token, mark it as used
      const params = new URLSearchParams(location.search);
      const token = params.get('token');

      if (token) {
        await supabase
          .from('password_reset_tokens')
          .update({ used: true })
          .eq('token', token);
      }

      toast({
        title: "Password updated",
        description: "Your password has been successfully reset.",
      });

      // Redirect to sign-in page after successful password reset
      setTimeout(() => navigate("/sign-in"), 2000);
    } catch (error: any) {
      console.error("Password reset error:", error);
      toast({
        variant: "destructive",
        title: "Password reset failed",
        description: error.message || "An error occurred. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isVerifying) {
    return (
      <Card className="w-full max-w-md mx-auto bg-dreamland-surface border-dreamland-accent/20">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Verifying Reset Link</CardTitle>
          <CardDescription className="text-center">
            Please wait while we verify your password reset link
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dreamland-primary mb-4"></div>
          <p className="text-center text-sm text-gray-500">
            This will only take a moment...
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto bg-dreamland-surface border-dreamland-accent/20">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Reset Your Password</CardTitle>
        <CardDescription className="text-center">
          {userEmail ? `Enter a new password for ${userEmail}` : 'Enter your new password below'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">New Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleInputChange}
              className={`bg-dreamland-background ${!passwordStrong && formData.password ? 'border-red-500' : ''}`}
            />
            {!passwordStrong && formData.password && (
              <p className="text-red-500 text-xs mt-1">
                Password must be at least 8 characters long
              </p>
            )}
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
              className={`bg-dreamland-background ${!passwordsMatch && formData.confirmPassword ? 'border-red-500' : ''}`}
            />
            {!passwordsMatch && formData.confirmPassword && (
              <p className="text-red-500 text-xs mt-1">
                Passwords do not match
              </p>
            )}
          </div>
          <Button
            type="submit"
            className="w-full bg-dreamland-primary hover:bg-dreamland-primary/90"
            disabled={isLoading}
          >
            {isLoading ? "Updating..." : "Reset Password"}
          </Button>
        </form>
      </CardContent>
      <CardFooter>
        <div className="text-center w-full text-sm">
          Remember your password?{" "}
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

export default ResetPasswordForm;
