import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getCurrentUser } from "@/lib/auth";
import { getUserPayments, type Payment } from "@/lib/payments";

interface MonthlyPaymentProps {
  amount?: number;
  dueDate?: string;
  isPaid?: boolean;
}

const MonthlyPayment: React.FC<MonthlyPaymentProps> = ({
  amount: defaultAmount = 500,
  dueDate: defaultDueDate = new Date(new Date().getFullYear(), new Date().getMonth(), 7).toISOString(),
  isPaid: defaultIsPaid = false,
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [paymentData, setPaymentData] = useState({
    amount: defaultAmount,
    dueDate: defaultDueDate,
    isPaid: defaultIsPaid,
  });

  const handleCardClick = () => {
    navigate('/payments?tab=history');
  };

  // Fetch payment data
  useEffect(() => {
    const fetchPaymentData = async () => {
      try {
        setIsLoading(true);
        const user = await getCurrentUser();

        if (!user) return;

        const userPayments = await getUserPayments(user.id);

        // Check if there's a current month payment
        const currentDate = new Date();
        const currentMonth = currentDate.toLocaleString('default', { month: 'long' });
        const currentYear = currentDate.getFullYear();
        const currentMonthPayment = userPayments.find(
          p => p.month === `${currentMonth} ${currentYear}`
        );

        if (currentMonthPayment) {
          setPaymentData({
            // Override with 500 regardless of what's in the database
            amount: 500,
            dueDate: currentMonthPayment.due_date,
            isPaid: currentMonthPayment.is_paid || false,
          });
        } else {
          // Ensure amount is 500 even when no payment record exists
          setPaymentData(prevData => ({
            ...prevData,
            amount: 500
          }));
        }
      } catch (error) {
        console.error("Error fetching payment data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPaymentData();
  }, []);

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

  // Calculate days remaining until due date
  const daysRemaining = () => {
    const today = new Date();
    const due = new Date(paymentData.dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const days = daysRemaining();

  return (
    <>
      <Card
        className="section-card-emerald card-hover cursor-pointer h-full"
        onClick={handleCardClick}
      >
        <CardHeader className="px-2 sm:px-3 md:px-4 pt-2 sm:pt-3 md:pt-4 pb-1 sm:pb-2">
          <CardTitle className="text-sm sm:text-base md:text-lg text-white flex items-center">
            <span className="inline-block w-1.5 sm:w-2 h-3 sm:h-4 bg-pink-300 mr-1.5 sm:mr-2"></span>
            <span>Payment for this Month</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2 sm:p-3 md:p-4 flex-grow">
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-white"></div>
            </div>
          ) : (
            <div className="flex flex-col h-full justify-between">
              <div>
                <div className="flex justify-between items-baseline mb-2 sm:mb-3">
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-pink-300">
                    ৳{paymentData.amount.toLocaleString()}
                  </h3>
                  <span className="text-[8px] sm:text-[10px] md:text-xs text-white/70">
                    Due: {new Date(paymentData.dueDate).toLocaleDateString()}
                  </span>
                </div>

                {paymentData.isPaid ? (
                  <div className="bg-white/20 text-white p-1.5 sm:p-2 md:p-3 rounded-md text-center text-[10px] sm:text-xs md:text-sm">
                    Payment completed for this month
                  </div>
                ) : (
                  <>
                    <div
                      className={`mb-2 sm:mb-3 p-1.5 sm:p-2 md:p-3 rounded-md text-center text-[10px] sm:text-xs md:text-sm ${
                        days <= 3
                          ? "bg-white/30 text-white"
                          : days <= 7
                          ? "bg-white/20 text-white"
                          : "bg-white/10 text-white"
                      }`}
                    >
                      {days < 0
                        ? "Payment overdue!"
                        : days === 0
                        ? "Payment due today!"
                        : `${days} days remaining to pay`}
                    </div>

                    <Button
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent card click event
                        setIsOpen(true);
                      }}
                      className="w-full bg-pink-300/30 hover:bg-pink-300/40 text-white border border-pink-300/50 text-[10px] sm:text-xs py-1 sm:py-1.5"
                    >
                      Pay Now
                    </Button>
                  </>
                )}
              </div>
            </div>
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
                <span className="font-semibold">৳500</span>
              </div>
              <Button onClick={handlePay} className="w-full bg-pink-300/30 hover:bg-pink-300/40 text-white border border-pink-300/50">
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
