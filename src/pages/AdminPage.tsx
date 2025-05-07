import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import AdminSavings from "@/components/admin/AdminSavings";
import { isCurrentUserAdmin } from "@/lib/admin";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const AdminPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        setIsLoading(true);
        const adminStatus = await isCurrentUserAdmin();
        setIsAdmin(adminStatus);

        if (!adminStatus) {
          toast({
            variant: "destructive",
            title: "Access Denied",
            description: "You do not have permission to access this page.",
          });
          navigate("/dashboard");
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to verify admin status.",
        });
        navigate("/dashboard");
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminStatus();
  }, [navigate, toast]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-[calc(100vh-200px)]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dreamland-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!isAdmin) {
    return null; // Will redirect in useEffect
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
        
        <div className="grid grid-cols-1 gap-6">
          <AdminSavings />
          <Card className="bg-dreamland-surface border-dreamland-accent/20">
            <CardHeader className="flex justify-between items-center">
              <CardTitle className="text-lg">Payments Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-2">
                <Button onClick={() => navigate("/admin/payments")} className="bg-dreamland-primary hover:bg-dreamland-primary/90">
                  Manage Payments
                </Button>
                <Button onClick={() => navigate("/create-payment")} className="bg-dreamland-primary hover:bg-dreamland-primary/90">
                  Record New Payment
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminPage;
