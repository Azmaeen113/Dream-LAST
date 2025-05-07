
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { sendPasswordResetOTP } from "@/lib/emailService";

const ForgotPasswordForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log(`Sending OTP to ${email}...`);

      try {
        // Send OTP to the user's email
        const emailSent = await sendPasswordResetOTP(email);

        if (!emailSent) {
          throw new Error("Failed to send OTP. Please check your email address and try again.");
        }

        console.log(`OTP sent successfully to ${email}`);

        setSubmitted(true);
        toast({
          title: "OTP sent",
          description: "Check your email for the password reset OTP",
        });

        // Don't navigate automatically, let the user click the button
        // This gives them a chance to see the OTP in the console in development mode
      } catch (otpError: any) {
        console.error("OTP error:", otpError);
        throw otpError;
      }
    } catch (error: any) {
      console.error("Password reset error:", error);
      toast({
        variant: "destructive",
        title: "Reset request failed",
        description: error.message || "An error occurred. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (submitted) {
    return (
      <Card className="w-full max-w-md mx-auto bg-dreamland-surface border-dreamland-accent/20">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Check Your Email</CardTitle>
          <CardDescription className="text-center">
            We've sent a password reset OTP to {email}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <div className="my-6 p-4 rounded-full bg-dreamland-primary/10 text-dreamland-primary">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
              <polyline points="22,6 12,13 2,6"></polyline>
            </svg>
          </div>
          <p className="text-center text-sm mb-6">
            Didn't receive an OTP? Check your spam folder or try again with a different email.
          </p>
          <Button
            variant="outline"
            onClick={() => navigate(`/verify-otp?email=${encodeURIComponent(email)}`)}
            className="w-full mb-2"
          >
            Enter OTP
          </Button>
          <Button
            variant="outline"
            onClick={() => setSubmitted(false)}
            className="w-full mb-2"
          >
            Try again
          </Button>
          <Button
            variant="link"
            onClick={() => navigate("/sign-in")}
            className="text-dreamland-secondary"
          >
            Back to sign in
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto bg-dreamland-surface border-dreamland-accent/20">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Forgot Password</CardTitle>
        <CardDescription className="text-center">
          Enter your email address and we'll send you an OTP to reset your password
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="your@email.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-dreamland-background"
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-dreamland-primary hover:bg-dreamland-primary/90"
            disabled={isLoading}
          >
            {isLoading ? "Sending..." : "Send OTP"}
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

export default ForgotPasswordForm;
