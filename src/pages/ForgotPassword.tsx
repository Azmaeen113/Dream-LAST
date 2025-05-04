
import React from "react";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";

const ForgotPassword = () => {
  return (
    <div className="min-h-screen bg-dreamland-background flex flex-col justify-center p-4">
      <div className="mb-8 text-center animate-fade-in">
        <h1 className="text-3xl font-bold text-dreamland-accent mb-2">DreamLand Group</h1>
        <p className="text-gray-400">Reset your password</p>
      </div>
      <div className="animate-fade-in">
        <ForgotPasswordForm />
      </div>
    </div>
  );
};

export default ForgotPassword;
