
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface MonthlyPaymentProps {
  amount: number;
  dueDate: string;
  isPaid: boolean;
}

const MonthlyPayment: React.FC<MonthlyPaymentProps> = ({
  amount,
  dueDate,
  isPaid,
}) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);

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
        description: `Your payment of ৳${amount} via ${selectedMethod} was successful!`,
      });
    }, 1500);
  };

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

  // Calculate days remaining until due date
  const daysRemaining = () => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const days = daysRemaining();

  return (
    <>
      <Card className="section-card card-hover">
        <CardHeader className="px-4 pt-4 pb-2">
          <CardTitle className="text-lg">Payment for this Month</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="flex justify-between items-baseline mb-4">
            <h3 className="text-2xl font-bold text-dreamland-accent">
              ৳{amount.toLocaleString()}
            </h3>
            <span className="text-xs text-gray-400">
              Due: {new Date(dueDate).toLocaleDateString()}
            </span>
          </div>

          {isPaid ? (
            <div className="bg-green-600/20 text-green-500 p-3 rounded-md text-center">
              Payment completed for this month
            </div>
          ) : (
            <>
              <div
                className={`mb-4 p-3 rounded-md text-center ${
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

              <Button 
                onClick={() => setIsOpen(true)} 
                className="w-full bg-dreamland-primary hover:bg-dreamland-primary/90"
              >
                Pay Now
              </Button>
            </>
          )}
        </CardContent>
      </Card>

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
                <span className="font-semibold">৳{amount.toLocaleString()}</span>
              </div>
              <Button onClick={handlePay} className="w-full">
                Continue to Payment
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MonthlyPayment;
