import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getCurrentUser } from "@/lib/auth";
import { getUserPayments, type Payment } from "@/lib/payments";

const Payments = () => {
  const { toast } = useToast();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("upcoming");

  // Default upcoming payment data
  const [upcomingPayment, setUpcomingPayment] = useState({
    amount: 500,
    dueDate: new Date(new Date().getFullYear(), new Date().getMonth(), 7).toISOString(),
    isPaid: false,
  });

  // Check for tab parameter in URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    if (tabParam && ["upcoming", "history"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [location.search]);

  // Fetch user payments
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setIsLoading(true);
        const user = await getCurrentUser();

        if (!user) {
          // Redirect to login if no user is found
          window.location.href = "/sign-in";
          return;
        }

        const userPayments = await getUserPayments(user.id);
        setPayments(userPayments);

        // Check if there's a current month payment
        const currentDate = new Date();
        const currentMonth = currentDate.toLocaleString('default', { month: 'long' });
        const currentYear = currentDate.getFullYear();
        const currentMonthPayment = userPayments.find(
          p => p.month === `${currentMonth} ${currentYear}`
        );

        if (currentMonthPayment) {
          setUpcomingPayment({
            // Always set amount to 500 regardless of what's in the database
            amount: 500,
            dueDate: currentMonthPayment.due_date,
            isPaid: currentMonthPayment.is_paid || false,
          });
        }
      } catch (error) {
        console.error("Error fetching payments:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load payment information",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPayments();
  }, [toast]);

  const paymentMethods = [
    {
      id: "bkash",
      name: "bKash",
      icon: "/images/bkash.webp",
    },
    {
      id: "nagad",
      name: "Nagad",
      icon: "/images/nagad.webp",
    },
    {
      id: "rocket",
      name: "Rocket",
      icon: "/images/rocket.jpg",
    },
  ];

  const handlePay = () => {
    if (!selectedMethod) {
      toast({
        title: "Payment method required",
        description: "Please select a payment method",
        variant: "destructive",
      });
      return;
    }

    // Show coming soon message
    setIsOpen(false);
    toast({
      title: "Coming Soon",
      description: `Online payment via ${selectedMethod} will be available soon. Please contact admin for manual payment.`,
      duration: 5000,
    });
  };

  // Calculate days remaining until due date
  const daysRemaining = () => {
    const today = new Date();
    const due = new Date(upcomingPayment.dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const days = daysRemaining();

  return (
    <DashboardLayout>
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Payments</h1>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full bg-dreamland-surface mb-4">
            <TabsTrigger value="upcoming" className="flex-1">Upcoming Payment</TabsTrigger>
            <TabsTrigger value="history" className="flex-1">Payment History</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming">
            <Card className="bg-dreamland-surface border-dreamland-accent/20">
              <CardHeader>
                <CardTitle className="text-lg">Monthly Contribution</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center items-center h-24">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dreamland-primary"></div>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-baseline mb-6">
                      <h3 className="text-3xl font-bold text-dreamland-accent">
                        ৳{upcomingPayment.amount.toLocaleString()}
                      </h3>
                      <span className="text-sm text-gray-400">
                        Due: {new Date(upcomingPayment.dueDate).toLocaleDateString()}
                      </span>
                    </div>

                    {upcomingPayment.isPaid ? (
                      <div className="bg-green-600/20 text-green-500 p-4 rounded-md text-center">
                        Payment completed for this month
                      </div>
                    ) : (
                      <>
                        <div
                          className={`mb-6 p-4 rounded-md text-center ${
                            days <= 3
                              ? "bg-red-600/20 text-red-400"
                              : days <= 7
                              ? "bg-yellow-600/20 text-yellow-400"
                              : "bg-blue-600/20 text-blue-400"
                          }`}
                        >
                          {days < 0
                            ? "Payment overdue!"
                            : days === 0
                            ? "Payment due today!"
                            : `${days} days remaining to pay`}
                        </div>

                        <div className="space-y-3">
                          <p className="text-sm text-center">
                            Please make your monthly contribution of ৳{upcomingPayment.amount.toLocaleString()} by the {new Date(upcomingPayment.dueDate).getDate()} of {new Date(upcomingPayment.dueDate).toLocaleString('default', { month: 'long' })} to maintain your good standing in the group.
                          </p>

                          <Button
                            onClick={() => setIsOpen(true)}
                            className="w-full bg-dreamland-primary hover:bg-dreamland-primary/90"
                          >
                            Make Payment Now
                          </Button>
                        </div>
                      </>
                    )}
                  </>
                )}

                <div className="mt-8">
                  <h4 className="font-medium text-sm mb-3">Payment Instructions:</h4>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-gray-400">
                    <li>Select your preferred payment method.</li>
                    <li>You will be redirected to the payment gateway.</li>
                    <li>Enter your account details and confirm the payment.</li>
                    <li>Your contribution will be automatically added to the group savings.</li>
                    <li>A confirmation receipt will be sent to your email.</li>
                  </ol>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card className="bg-dreamland-surface border-dreamland-accent/20">
              <CardHeader>
                <CardTitle className="text-lg">Payment History</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
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
                            <h3 className="font-medium">{payment.month}</h3>
                            {payment.payment_date ? (
                              <p className="text-xs text-gray-400">
                                Paid: {new Date(payment.payment_date).toLocaleDateString()} via {payment.payment_method}
                              </p>
                            ) : (
                              <p className="text-xs text-gray-400">
                                Due: {new Date(payment.due_date).toLocaleDateString()}
                              </p>
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                              Transaction ID: {payment.transaction_id}
                            </p>
                            {payment.notes && (
                              <p className="text-xs text-gray-500 mt-1">
                                Notes: {payment.notes}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-dreamland-secondary">
                              ৳{payment.amount.toLocaleString()}
                            </p>
                            <Badge
                              variant="outline"
                              className={payment.status === 'completed'
                                ? "border-green-500 text-green-500"
                                : "border-yellow-500 text-yellow-500"}
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
                    <p className="text-gray-400">No payment history found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="bg-dreamland-surface text-white border-dreamland-accent/20 sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Select Payment Method</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 gap-3">
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  className={`p-3 flex items-center border rounded-md transition-colors ${
                    selectedMethod === method.id
                      ? "bg-dreamland-accent/20 border-dreamland-accent"
                      : "border-gray-700 hover:border-dreamland-secondary"
                  }`}
                  onClick={() => setSelectedMethod(method.id)}
                >
                  <div className="w-12 h-12 flex items-center justify-center bg-white rounded mr-3">
                    <img
                      src={method.icon}
                      alt={method.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span className="font-medium">{method.name}</span>
                </button>
              ))}
            </div>

            <div className="mt-1">
              <div className="flex justify-between mb-2 text-sm">
                <span>Payment amount:</span>
                <span className="font-semibold">৳{upcomingPayment.amount.toLocaleString()}</span>
              </div>
              <Button onClick={handlePay} className="w-full">
                Continue to Payment
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Payments;
