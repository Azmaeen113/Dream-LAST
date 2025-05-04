
import React from "react";
import SignUpForm from "@/components/auth/SignUpForm";

const SignUp = () => {
  return (
    <div className="min-h-screen bg-dreamland-background flex flex-col justify-center p-4">
      <div className="mb-6 text-center animate-fade-in">
        <h1 className="text-3xl font-bold text-dreamland-accent mb-2">DreamLand Group</h1>
        <p className="text-gray-400">Join our savings community</p>
      </div>
      <div className="animate-fade-in">
        <SignUpForm />
      </div>
    </div>
  );
};

export default SignUp;
