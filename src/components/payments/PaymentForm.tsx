import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllMembers, Member } from "@/lib/members";
import { recordPayment } from "@/lib/payments";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";

const PaymentForm: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedMember, setSelectedMember] = useState<string>("");
  const [paymentMonth, setPaymentMonth] = useState<string>("");
  const [paymentAmount, setPaymentAmount] = useState<string>("500");
  const [paymentDate, setPaymentDate] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("cash");
  const [transactionId, setTransactionId] = useState<string>("");
  const [dueDate, setDueDate] = useState<string>("");

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const membersData = await getAllMembers();
        setMembers(membersData);
      } catch (error) {
        console.error("Error fetching members:", error);
        setError("Failed to load members. Please try again.");
      }
    };

    fetchMembers();
  }, []);

  const validateForm = (): boolean => {
    if (!selectedMember) {
      setError("Please select a member");
      return false;
    }

    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      setError("Please enter a valid payment amount");
      return false;
    }

    if (!paymentMonth) {
      setError("Please enter a payment month");
      return false;
    }

    if (!dueDate) {
      setError("Please enter a due date for the payment");
      return false;
    }

    // Validate payment date if provided
    if (paymentDate) {
      const due = new Date(dueDate);
      const payment = new Date(paymentDate);
      if (payment < due) {
        setError("Payment date cannot be earlier than the due date");
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const paymentData = {
        user_id: selectedMember,
        amount: parseFloat(paymentAmount),
        month: paymentMonth,
        due_date: new Date(dueDate).toISOString(),
        payment_date: paymentDate ? new Date(paymentDate).toISOString() : null,
        payment_method: paymentMethod,
        transaction_id: transactionId || `MANUAL-${Date.now()}`,
        status: paymentDate ? "completed" : "pending",
        is_paid: Boolean(paymentDate)
      };

      console.log('Submitting payment data:', paymentData);
      const result = await recordPayment(paymentData);
      
      if (result) {
        toast({
          title: "Payment Recorded",
          description: "The payment has been successfully recorded.",
        });
        navigate('/admin/payments');
      } else {
        throw new Error('Failed to record payment');
      }
    } catch (error) {
      console.error("Error recording payment:", error);
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred. Please try again.";
      setError(errorMessage);
      
      if (errorMessage.includes("already exists")) {
        toast({
          variant: "destructive",
          title: "Duplicate Payment",
          description: "A payment for this month already exists for this member.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Recording Failed",
          description: errorMessage,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 p-4 bg-dreamland-surface rounded-md">
      {error && (
        <Alert variant="destructive" className="bg-red-500/10 border-red-500/20">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-2">
        <Label htmlFor="member">Select Member</Label>
        <Select value={selectedMember} onValueChange={setSelectedMember}>
          <SelectTrigger className="bg-dreamland-background border-dreamland-accent/20">
            <SelectValue placeholder="Select a member" />
          </SelectTrigger>
          <SelectContent className="bg-dreamland-background border-dreamland-accent/20">
            {members.map(member => (
              <SelectItem key={member.id} value={member.id}>
                {member.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 gap-2">
        <Label htmlFor="month">Month</Label>
        <Input
          id="month"
          value={paymentMonth}
          onChange={e => setPaymentMonth(e.target.value)}
          placeholder="e.g. April 2024"
          className="bg-dreamland-background border-dreamland-accent/20"
          required
        />
      </div>

      <div className="grid grid-cols-1 gap-2">
        <Label htmlFor="amount">Amount (৳)</Label>
        <Input
          id="amount"
          type="number"
          value={paymentAmount}
          onChange={e => setPaymentAmount(e.target.value)}
          className="bg-dreamland-background border-dreamland-accent/20"
          min="0"
          step="0.01"
          required
        />
      </div>

      <div className="grid grid-cols-1 gap-2">
        <Label htmlFor="dueDate">Due Date</Label>
        <Input
          id="dueDate"
          type="date"
          value={dueDate}
          onChange={e => setDueDate(e.target.value)}
          className="bg-dreamland-background border-dreamland-accent/20"
          required
        />
      </div>

      <div className="grid grid-cols-1 gap-2">
        <Label htmlFor="paymentDate">Payment Date (optional)</Label>
        <Input
          id="paymentDate"
          type="date"
          value={paymentDate}
          onChange={e => setPaymentDate(e.target.value)}
          className="bg-dreamland-background border-dreamland-accent/20"
        />
      </div>

      <div className="grid grid-cols-1 gap-2">
        <Label htmlFor="paymentMethod">Payment Method</Label>
        <Select value={paymentMethod} onValueChange={setPaymentMethod}>
          <SelectTrigger className="bg-dreamland-background border-dreamland-accent/20">
            <SelectValue placeholder="Select payment method" />
          </SelectTrigger>
          <SelectContent className="bg-dreamland-background border-dreamland-accent/20">
            <SelectItem value="cash">Cash</SelectItem>
            <SelectItem value="bKash">bKash</SelectItem>
            <SelectItem value="Nagad">Nagad</SelectItem>
            <SelectItem value="Rocket">Rocket</SelectItem>
            <SelectItem value="bank">Bank Transfer</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 gap-2">
        <Label htmlFor="transactionId">Transaction ID (optional)</Label>
        <Input
          id="transactionId"
          value={transactionId}
          onChange={e => setTransactionId(e.target.value)}
          className="bg-dreamland-background border-dreamland-accent/20"
        />
      </div>

      <div className="flex gap-2 justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate('/admin/payments')}
          disabled={loading}
          className="border-dreamland-accent/20"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="bg-dreamland-primary hover:bg-dreamland-primary/90"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Recording...
            </>
          ) : (
            "Record Payment"
          )}
        </Button>
      </div>
    </form>
  );
};

export default PaymentForm; 