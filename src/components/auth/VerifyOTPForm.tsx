import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { verifyResetOTP, sendPasswordResetOTP } from "@/lib/emailService";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, RefreshCw } from "lucide-react";

const VerifyOTPForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCount, setResendCount] = useState(0);
  const [countdown, setCountdown] = useState(0);

  // Get email from URL query params
  const email = new URLSearchParams(location.search).get("email");

  useEffect(() => {
    if (!email) {
      navigate("/forgot-password");
    }
  }, [email, navigate]);

  useEffect(() => {
    // Countdown timer for resend button
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  if (!email) {
    return null;
  }

  const handleResendOTP = async () => {
    setResendLoading(true);
    setError(null);

    try {
      const sent = await sendPasswordResetOTP(email);

      if (sent) {
        toast({
          title: "OTP Resent",
          description: "A new OTP has been sent to your email",
        });
        setResendCount(resendCount + 1);
        setCountdown(60); // 60 second cooldown
      } else {
        throw new Error("Failed to resend OTP");
      }
    } catch (error: any) {
      console.error("Error resending OTP:", error);
      toast({
        variant: "destructive",
        title: "Failed to resend OTP",
        description: error.message || "An error occurred. Please try again.",
      });
    } finally {
      setResendLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      console.log(`Attempting to verify OTP: ${otp} for email: ${email}`);

      // Check if using test OTP (for development)
      const isTestOtp = otp === '123456';
      if (isTestOtp) {
        console.log("Using test OTP bypass");
      }

      // Verify the OTP
      const isValid = await verifyResetOTP(email, otp);

      if (!isValid) {
        throw new Error("Invalid or expired OTP");
      }

      toast({
        title: "OTP verified",
        description: "You can now set your new password",
      });

      // Navigate to the reset password page
      navigate(`/reset-password?email=${encodeURIComponent(email)}`);
    } catch (error: any) {
      console.error("OTP verification error:", error);
      setError(error.message || "An error occurred. Please try again.");
      toast({
        variant: "destructive",
        title: "Verification failed",
        description: error.message || "An error occurred. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-dreamland-surface border-dreamland-accent/20">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Verify OTP</CardTitle>
        <CardDescription className="text-center">
          Enter the 6-digit OTP sent to {email}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {resendCount > 0 && (
          <Alert className="mb-4 bg-green-50 border-green-200">
            <AlertTitle>New OTP Sent</AlertTitle>
            <AlertDescription>
              A new OTP has been sent to your email. Please check your inbox (and spam folder).
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="otp">OTP</Label>
            <Input
              id="otp"
              name="otp"
              type="text"
              placeholder="Enter 6-digit OTP"
              required
              maxLength={6}
              pattern="[0-9]{6}"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              className="bg-dreamland-background text-center tracking-widest text-lg font-medium"
            />
            <p className="text-xs text-gray-500 mt-1">
              For testing, you can use the code: 123456
            </p>
          </div>
          <Button
            type="submit"
            className="w-full bg-dreamland-primary hover:bg-dreamland-primary/90"
            disabled={isLoading || otp.length !== 6}
          >
            {isLoading ? "Verifying..." : "Verify OTP"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <div className="text-center w-full text-sm">
          {countdown === 0 && !resendLoading && (
            <>
              Didn't receive the OTP?{" "}
              <Button
                variant="link"
                className="p-0 h-auto text-dreamland-secondary"
                onClick={handleResendOTP}
                disabled={resendLoading || countdown > 0}
              >
                Resend OTP
              </Button>
            </>
          )}
          {countdown > 0 && (
            <span>You can request another OTP in {countdown}s</span>
          )}
          {resendLoading && (
            <span>Sending OTP...</span>
          )}
        </div>
        <Button
          variant="outline"
          className="w-full mt-2"
          onClick={() => navigate("/forgot-password")}
        >
          Back to Forgot Password
        </Button>
      </CardFooter>
    </Card>
  );
};

export default VerifyOTPForm;