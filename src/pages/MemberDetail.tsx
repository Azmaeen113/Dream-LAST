import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getMemberById, type Member } from "@/lib/members";
import { useToast } from "@/components/ui/use-toast";
import { isCurrentUserAdmin, isUserAdmin, removeMember } from "@/lib/admin";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { getUserPayments, type Payment } from "@/lib/payments";

const MemberDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [member, setMember] = useState<Member | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCurrentAdmin, setIsCurrentAdmin] = useState(false);
  const [isMemberAdmin, setIsMemberAdmin] = useState(false);
  const [isRemoveMemberLoading, setIsRemoveMemberLoading] = useState(false);
  const [payments, setPayments] = useState<Payment[]>([]);

  useEffect(() => {
    const fetchMemberDetails = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        const memberData = await getMemberById(id);
        setMember(memberData);

        // Check if the current user is an admin
        const adminStatus = await isCurrentUserAdmin();
        setIsCurrentAdmin(adminStatus);

        // Check if the member being viewed is an admin
        if (memberData) {
          const memberAdminStatus = await isUserAdmin(memberData.id);
          setIsMemberAdmin(memberAdminStatus);

          // Fetch member's payment history
          const paymentData = await getUserPayments(memberData.id);
          setPayments(paymentData);
        }
      } catch (error) {
        console.error("Error fetching member details:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load member information",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchMemberDetails();
  }, [id, toast]);

  const handleRemoveMember = async () => {
    if (!member || !id) return;

    setIsRemoveMemberLoading(true);
    try {
      console.log(`Attempting to remove member with ID: ${id}`);
      const success = await removeMember(id);

      if (success) {
        // Clear the member data from state
        setMember(null);
        
        toast({
          title: "Member Removed",
          description: `${member.name} has been removed from the system`,
        });
        
        // Navigate back to members list with state to force refresh
        navigate('/members', { 
          replace: true,
          state: { refresh: true } // Add state to trigger refresh
        });
      } else {
        console.error("Member removal returned false");
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to remove member. Check console for details.",
        });
      }
    } catch (error) {
      console.error("Exception when removing member:", error);
      let errorMessage = "Failed to remove member";

      if (error instanceof Error) {
        errorMessage += `: ${error.message}`;
      }

      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    } finally {
      setIsRemoveMemberLoading(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-4 flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dreamland-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!member) {
    return (
      <DashboardLayout>
        <div className="p-4 text-center">
          <h1 className="text-2xl font-bold mb-4">Member Not Found</h1>
          <p className="mb-4">The member you are looking for does not exist.</p>
          <Button onClick={() => navigate('/members')}>
            View All Members
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-4">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center">
            <Button
              variant="outline"
              className="border-dreamland-accent/20 mr-2"
              onClick={() => navigate('/members')}
            >
              ← Back
            </Button>
            <h1 className="text-2xl font-bold">Member Details</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Member Profile Card */}
          <Card className="bg-dreamland-surface border-dreamland-accent/20 md:col-span-1">
            <CardHeader className="px-6 pt-6 pb-4">
              <CardTitle className="text-lg">Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <div className="flex flex-col items-center mb-6">
                <Avatar className="w-24 h-24 border-2 border-dreamland-accent mb-4">
                  <AvatarImage src={member.photoUrl || ""} />
                  <AvatarFallback className="bg-dreamland-primary/20 text-2xl">
                    {member.name?.[0]?.toUpperCase() || "?"}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-semibold">{member.name}</h2>
                <Badge
                  variant={member.isPaid ? "default" : "destructive"}
                  className={`mt-2 ${member.isPaid ? "bg-green-600" : ""}`}
                >
                  {member.isPaid ? "Payment Complete" : "Payment Due"}
                </Badge>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm text-gray-400 mb-1">Mobile Number</h3>
                  {member.mobile ? (
                    <a
                      href={`tel:${member.mobile}`}
                      className="flex items-center text-md text-dreamland-primary hover:underline"
                    >
                      <span>{member.mobile}</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 ml-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                    </a>
                  ) : (
                    <p className="text-md">Not provided</p>
                  )}
                </div>

                <div>
                  <h3 className="text-sm text-gray-400 mb-1">Address</h3>
                  <p className="text-md">{member.address || "Not provided"}</p>
                </div>

                <div>
                  <h3 className="text-sm text-gray-400 mb-1">Joined Date</h3>
                  <p className="text-md">
                    {member.joinedDate
                      ? new Date(member.joinedDate).toLocaleDateString()
                      : "Unknown"}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm text-gray-400 mb-1">Total Contribution</h3>
                  <p className="text-md font-medium text-dreamland-secondary">
                    ৳{(member.contributions || 0).toLocaleString()}
                  </p>
                </div>

                {member.mobile && (
                  <div className="mt-6 space-y-3">
                    <a
                      href={`tel:${member.mobile}`}
                      className="w-full flex items-center justify-center gap-2 bg-dreamland-primary hover:bg-dreamland-primary/90 text-white py-2 px-4 rounded-md transition-colors"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                      Call {member.name.split(' ')[0]}
                    </a>

                    <a
                      href={`sms:${member.mobile}`}
                      className="w-full flex items-center justify-center gap-2 bg-dreamland-secondary hover:bg-dreamland-secondary/90 text-white py-2 px-4 rounded-md transition-colors"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                        />
                      </svg>
                      Message {member.name.split(' ')[0]}
                    </a>
                  </div>
                )}

                {/* Admin Controls - Only visible to admins */}
                {isCurrentAdmin && (
                  <div className="mt-6">
                    <Separator className="bg-dreamland-accent/10 mb-4" />
                    <h3 className="text-sm text-gray-400 mb-3">Admin Controls</h3>
                    <div className="text-xs text-gray-400 text-center">
                      {isMemberAdmin ? (
                        <div className="flex items-center justify-center gap-1">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                          <span>This member has admin privileges</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-1">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                          <span>This member is a regular user</span>
                        </div>
                      )}
                    </div>

                    {/* Remove Member Button */}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          className="w-full mt-4"
                          disabled={isRemoveMemberLoading}
                        >
                          {isRemoveMemberLoading ? "Processing..." : "Remove Member"}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-dreamland-surface border-dreamland-accent/20">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remove Member</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to remove {member.name} from the system?
                            This action will permanently delete all their information and cannot be undone.
                            The email address used for this account will be available for new registrations.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="bg-transparent border-gray-600 text-gray-400">Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleRemoveMember}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Remove
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Transaction History Card */}
          <Card className="bg-dreamland-surface border-dreamland-accent/20 md:col-span-2">
            <CardHeader className="px-6 pt-6 pb-4">
              <CardTitle className="text-lg">Transaction History</CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              {payments.length > 0 ? (
                <div className="space-y-4">
                  {payments.map((payment) => (
                    <div
                      key={payment.id}
                      className="flex justify-between items-center p-3 rounded-lg bg-dreamland-background"
                    >
                      <div>
                        <p className="font-medium">{payment.month}</p>
                        <p className="text-sm text-gray-400">
                          {new Date(payment.due_date).toLocaleDateString()}
                        </p>
                        {payment.payment_date && (
                          <p className="text-sm text-gray-400">
                            Paid: {new Date(payment.payment_date).toLocaleDateString()} via {payment.payment_method}
                          </p>
                        )}
                        {payment.notes && (
                          <p className="text-sm text-gray-400">
                            {payment.notes}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-dreamland-secondary">
                          ৳{payment.amount.toLocaleString()}
                        </p>
                        <Badge
                          variant="outline"
                          className={`${
                            payment.status === 'completed'
                              ? 'bg-green-600/10 text-green-600 border-green-600/20'
                              : 'bg-yellow-600/10 text-yellow-600 border-yellow-600/20'
                          }`}
                        >
                          {payment.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-400">No transaction history available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MemberDetail;
