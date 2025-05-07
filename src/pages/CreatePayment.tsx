import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PaymentForm from "@/components/payments/PaymentForm";
import { isCurrentUserAdmin } from "@/lib/admin";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";

const CreatePayment = () => {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const adminStatus = await isCurrentUserAdmin();
        setIsAdmin(adminStatus);
        if (!adminStatus) {
          toast({
            variant: "destructive",
            title: "Permission Denied",
            description: "Only administrators can record payments.",
          });
          navigate("/admin/payments");
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
        setIsAdmin(false);
      }
    };
    checkAdminStatus();
  }, [toast, navigate]);

  if (isAdmin === null) {
    return (
      <DashboardLayout>
        <div className="p-4 flex justify-center items-center h-[80vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dreamland-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (isAdmin === false) {
    return (
      <DashboardLayout>
        <div className="p-4 text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="mb-6">You do not have permission to record payments.</p>
          <Button
            onClick={() => navigate("/admin/payments")}
            className="bg-dreamland-primary hover:bg-dreamland-primary/90"
          >
            Back to Payments
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Record New Payment</h1>
        <PaymentForm />
      </div>
    </DashboardLayout>
  );
};

export default CreatePayment; 