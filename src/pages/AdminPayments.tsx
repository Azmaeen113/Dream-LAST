import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { isCurrentUserAdmin } from "@/lib/admin";
import { getAllMembers, type Member } from "@/lib/members";
import {
  getAllPayments,
  recordPayment,
  updatePayment,
  getGroupPaymentHistory,
  type Payment,
  type PaymentHistory,
  deletePayment
} from "@/lib/payments";

const AdminPayments = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Admin check state
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Payments state
  const [payments, setPayments] = useState<Payment[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [isPaymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<string>("");
  const [paymentAmount, setPaymentAmount] = useState("500");
  const [paymentMonth, setPaymentMonth] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [transactionId, setTransactionId] = useState("");
  const [paymentNotes, setPaymentNotes] = useState("");
  const [paymentDate, setPaymentDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [paymentType, setPaymentType] = useState<"contribution" | "expenditure">("contribution");

  // Payment history state
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([]);
  const [isPaymentHistoryLoading, setIsPaymentHistoryLoading] = useState(false);

  // Deletion state
  const [isDeleting, setIsDeleting] = useState(false);

  // Check if user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const adminStatus = await isCurrentUserAdmin();
        setIsAdmin(adminStatus);

        if (!adminStatus) {
          toast({
            variant: "destructive",
            title: "Permission Denied",
            description: "Only administrators can access this page.",
          });
          navigate("/dashboard");
        } else {
          // Load data if user is admin
          await Promise.all([
            fetchPayments(),
            fetchMembers(),
            fetchPaymentHistory()
          ]);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
        navigate("/dashboard");
      }
    };

    checkAdminStatus();
  }, [toast, navigate]);

  // Fetch payment history
  const fetchPaymentHistory = async () => {
    try {
      setIsPaymentHistoryLoading(true);
      const historyData = await getGroupPaymentHistory();
      setPaymentHistory(historyData);
    } catch (error) {
      console.error('Error fetching payment history:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load payment history",
      });
    } finally {
      setIsPaymentHistoryLoading(false);
    }
  };

  // Fetch all payments
  const fetchPayments = async () => {
    const paymentsData = await getAllPayments();
    setPayments(paymentsData);
  };

  // Fetch all members
  const fetchMembers = async () => {
    const membersData = await getAllMembers();
    setMembers(membersData);
  };

  // Handle payment recording
  const handleRecordPayment = async () => {
    if (!selectedMember) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a member",
      });
      return;
    }

    if (!paymentAmount || isNaN(parseFloat(paymentAmount)) || parseFloat(paymentAmount) <= 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a valid payment amount",
      });
      return;
    }

    if (!paymentMonth) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a payment month",
      });
      return;
    }

    if (!dueDate) {
      toast({
        variant: "destructive",
        title: "Due Date required",
        description: "Please enter a due date for the payment.",
      });
      return;
    }

    const amount = parseFloat(paymentAmount);
    const isPaid = paymentDate !== "";
    const dueDateTime = new Date(dueDate).toISOString();

    const loadingToast = toast({
      title: "Recording payment...",
      description: "Please wait while we record the payment.",
    });

    try {
      const paymentData = {
        user_id: selectedMember,
        amount,
        month: paymentMonth,
        due_date: dueDateTime,
        payment_date: paymentDate ? new Date(paymentDate).toISOString() : null,
        payment_method: paymentMethod,
        transaction_id: transactionId || `MANUAL-${Date.now()}`,
        status: isPaid ? "completed" : "pending",
        is_paid: isPaid,
        notes: paymentNotes
      };

      const result = await recordPayment(paymentData);

      if (result) {
        toast({
          title: "Payment Recorded",
          description: "The member contribution has been successfully recorded.",
        });
        setPaymentDialogOpen(false);
        resetPaymentForm();
        await Promise.all([
          fetchPayments(),
          fetchPaymentHistory()
        ]);
      } else {
        toast({
          variant: "destructive",
          title: "Recording Failed",
          description: "Failed to record payment. Please try again.",
        });
      }
    } catch (error) {
      console.error('Error recording payment:', error);
      toast({
        variant: "destructive",
        title: "Recording Failed",
        description: "An unexpected error occurred. Please try again.",
      });
    }
  };

  // Reset payment form
  const resetPaymentForm = () => {
    setSelectedMember("");
    setPaymentAmount("500");
    setPaymentMonth("");
    setPaymentMethod("cash");
    setTransactionId("");
    setPaymentNotes("");
    setPaymentDate("");
    setDueDate("");
    setPaymentType("contribution");
  };

  // Get member name by ID
  const getMemberName = (userId: string) => {
    const member = members.find(m => m.id === userId);
    return member ? member.name : "Unknown Member";
  };

  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  // Set current month and due date when opening payment dialog
  const handleOpenPaymentDialog = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    // Set current month in format "April 2024"
    const monthName = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(now);
    setPaymentMonth(`${monthName} ${year}`);

    // Set default due date to the 7th of current month
    const defaultDue = new Date(now.getFullYear(), now.getMonth(), 7).toISOString().split('T')[0];
    setDueDate(defaultDue);

    // Set payment amount to 500
    setPaymentAmount("500");

    // Set payment type to contribution by default
    setPaymentType("contribution");

    setPaymentDialogOpen(true);
  };

  // Handle payment deletion
  const handleDeletePayment = async (paymentId: string) => {
    if (!window.confirm('Are you sure you want to delete this payment record? This action cannot be undone.')) {
      return;
    }

    try {
      setIsDeleting(true);
      const success = await deletePayment(paymentId);

      if (success) {
        toast({
          title: "Payment Deleted",
          description: "The payment record has been successfully deleted.",
        });
        // Refresh the payments list
        await Promise.all([
          fetchPayments(),
          fetchPaymentHistory()
        ]);
      } else {
        toast({
          variant: "destructive",
          title: "Deletion Failed",
          description: "Failed to delete payment record. Please try again.",
        });
      }
    } catch (error) {
      console.error('Error deleting payment:', error);
      toast({
        variant: "destructive",
        title: "Deletion Failed",
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading || isAdmin === null) {
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
        <div className="p-4">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p>You do not have permission to access this page.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Payment Management</h1>

        <Tabs defaultValue="payments" className="w-full">
          <TabsList className="w-full bg-dreamland-surface mb-4">
            <TabsTrigger value="payments" className="flex-1">Member Payments</TabsTrigger>
            <TabsTrigger value="history" className="flex-1">Payment History</TabsTrigger>
          </TabsList>

          {/* Member Payments Tab */}
          <TabsContent value="payments">
            <Card className="bg-dreamland-surface border-dreamland-accent/20">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Member Payments</CardTitle>
                <Button
                  onClick={handleOpenPaymentDialog}
                  className="bg-dreamland-primary hover:bg-dreamland-primary/90"
                >
                  Record Payment
                </Button>
              </CardHeader>
              <CardContent>
                {payments.length > 0 ? (
                  <div className="space-y-4">
                    {payments.map((payment) => (
                      <div
                        key={payment.id}
                        className="border border-dreamland-accent/10 rounded-md p-4"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">{getMemberName(payment.user_id)}</h3>
                            <p className="text-xs text-gray-400">
                              {payment.month} - Due: {formatDate(payment.due_date)}
                            </p>
                            {payment.payment_date && (
                              <p className="text-xs text-gray-400">
                                Paid: {formatDate(payment.payment_date)} via {payment.payment_method}
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
                          <div className="text-right flex flex-col items-end gap-2">
                            <p className="font-semibold text-dreamland-secondary">
                              ৳{payment.amount.toLocaleString()}
                            </p>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              payment.status === 'completed'
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-yellow-500/20 text-yellow-400'
                            }`}>
                              {payment.status}
                            </span>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeletePayment(payment.id);
                              }}
                              disabled={isDeleting}
                              className="mt-2"
                            >
                              {isDeleting ? "Deleting..." : "Delete"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-400">No payment records found</p>
                    <Button
                      onClick={handleOpenPaymentDialog}
                      className="mt-4 bg-dreamland-primary hover:bg-dreamland-primary/90"
                    >
                      Record First Payment
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payment History Tab */}
          <TabsContent value="history">
            <Card className="bg-dreamland-surface border-dreamland-accent/20">
              <CardHeader>
                <CardTitle className="text-lg">Payment History</CardTitle>
              </CardHeader>
              <CardContent>
                {isPaymentHistoryLoading ? (
                  <div className="flex justify-center items-center h-24">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dreamland-primary"></div>
                  </div>
                ) : paymentHistory.length > 0 ? (
                  <div className="space-y-4">
                    {paymentHistory.map((entry) => (
                      <div
                        key={entry.id}
                        className="border border-dreamland-accent/10 rounded-md p-4"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">
                              {entry.type === 'deposit' ? 'Deposit' : 'Withdrawal'}
                              {entry.user?.name && ` - ${entry.user.name}`}
                            </h3>
                            <p className="text-xs text-gray-400">
                              {new Date(entry.created_at || '').toLocaleString()}
                            </p>
                            {entry.note && (
                              <p className="text-xs text-gray-500 mt-1">
                                Note: {entry.note}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className={`font-semibold ${
                              entry.type === 'deposit'
                                ? 'text-green-400'
                                : 'text-red-400'
                            }`}>
                              {entry.type === 'deposit' ? '+' : '-'}৳{entry.amount.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-400">No payment history records found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Record Payment Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent className="bg-dreamland-surface text-white border-dreamland-accent/20 sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="member">Select Member</Label>
              <Select value={selectedMember} onValueChange={setSelectedMember}>
                <SelectTrigger className="bg-dreamland-background border-dreamland-accent/20">
                  <SelectValue placeholder="Select a member" />
                </SelectTrigger>
                <SelectContent className="bg-dreamland-background border-dreamland-accent/20">
                  {members.map((member) => (
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
                onChange={(e) => setPaymentMonth(e.target.value)}
                placeholder="e.g. April 2024"
                className="bg-dreamland-background border-dreamland-accent/20"
              />
            </div>

            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="amount">Amount (৳)</Label>
              <Input
                id="amount"
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                className="bg-dreamland-background border-dreamland-accent/20"
              />
            </div>

            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="bg-dreamland-background border-dreamland-accent/20"
              />
            </div>

            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="paymentDate">Payment Date (leave empty if not paid yet)</Label>
              <Input
                id="paymentDate"
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
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
                onChange={(e) => setTransactionId(e.target.value)}
                className="bg-dreamland-background border-dreamland-accent/20"
              />
            </div>

            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
                className="bg-dreamland-background border-dreamland-accent/20"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPaymentDialogOpen(false)}
              className="border-dreamland-accent/20"
            >
              Cancel
            </Button>
            <Button
              onClick={handleRecordPayment}
              className="bg-dreamland-primary hover:bg-dreamland-primary/90"
            >
              Record Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default AdminPayments;
