
import React, { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// Mock data for payment history
const paymentHistory = [
  { id: "1", date: "2024-04-07", amount: 5000, method: "bKash", status: "completed", transactionId: "BK2404071245" },
  { id: "2", date: "2024-03-06", amount: 5000, method: "Nagad", status: "completed", transactionId: "NG2403061134" },
  { id: "3", date: "2024-02-08", amount: 5000, method: "bKash", status: "completed", transactionId: "BK2402080945" },
  { id: "4", date: "2024-01-07", amount: 5000, method: "bKash", status: "completed", transactionId: "BK2401071530" },
  { id: "5", date: "2023-12-09", amount: 5000, method: "Rocket", status: "completed", transactionId: "RC2312091025" },
  { id: "6", date: "2023-11-07", amount: 5000, method: "Nagad", status: "completed", transactionId: "NG2311071420" },
];

// Mock data for upcoming payments
const upcomingPayment = {
  amount: 5000,
  dueDate: "2024-05-07",
  isPaid: false,
};

const Payments = () => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);

  const paymentMethods = [
    {
      id: "bkash",
      name: "bKash",
      icon: "https://www.bkash.com/sites/all/themes/bkash/logo.png",
    },
    {
      id: "nagad",
      name: "Nagad",
      icon: "https://www.nagad.com.bd/wp-content/themes/nagad/images/nagad-logo-inverse.svg",
    },
    {
      id: "rocket",
      name: "Rocket",
      icon: "https://www.dutchbanglabank.com/img/1549440486.png",
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

    // Simulate payment processing
    toast({
      title: "Processing payment",
      description: "Please wait...",
    });

    // Close dialog and show success after a delay
    setTimeout(() => {
      setIsOpen(false);
      toast({
        title: "Payment successful",
        description: `Your payment of ৳${upcomingPayment.amount} via ${selectedMethod} was successful!`,
      });
    }, 1500);
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
        
        <Tabs defaultValue="upcoming" className="w-full">
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
                        Please make your monthly contribution of ৳5,000 by the 7th of May to maintain your good standing in the group.
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
                <div className="space-y-4">
                  {paymentHistory.map((payment) => (
                    <div
                      key={payment.id}
                      className="border border-dreamland-accent/10 rounded-md p-4"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-medium">Monthly Contribution</h3>
                          <p className="text-xs text-gray-400">
                            {new Date(payment.date).toLocaleDateString()} via {payment.method}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Transaction ID: {payment.transactionId}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-dreamland-secondary">
                            ৳{payment.amount.toLocaleString()}
                          </p>
                          <Badge
                            variant="outline"
                            className="border-green-500 text-green-500"
                          >
                            {payment.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
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
                      className="max-w-[28px] max-h-[28px]"
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
