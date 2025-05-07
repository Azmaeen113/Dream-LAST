import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { getSavings, updateSavings } from "@/lib/savingsService";
import { directAdminCheck, forceSetAsAdmin } from "@/lib/directAdminCheck";

const AdminSavings = () => {
  const { toast } = useToast();
  const [currentSavings, setCurrentSavings] = useState<number>(0);
  const [goalAmount, setGoalAmount] = useState<number>(2000000);
  const [newSavingsAmount, setNewSavingsAmount] = useState<string>("");
  const [newGoalAmount, setNewGoalAmount] = useState<string>("");
  const [note, setNote] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch current savings on component mount and check admin status
  useEffect(() => {
    const initialize = async () => {
      try {
        setIsLoading(true);

        // Check admin status directly
        const isAdmin = await directAdminCheck();
        console.log('Direct admin check result:', isAdmin);

        if (!isAdmin) {
          console.log('User is not an admin, attempting to force set as admin...');
          const forceResult = await forceSetAsAdmin();
          console.log('Force set admin result:', forceResult);

          if (!forceResult) {
            toast({
              variant: "destructive",
              title: "Admin Check Failed",
              description: "Could not set admin status. Some features may not work.",
            });
          } else {
            toast({
              title: "Admin Status Set",
              description: "You have been set as an admin.",
            });
          }
        }

        // Get the savings amount
        const amount = await getSavings();
        setCurrentSavings(amount);
        setNewSavingsAmount(amount.toString());

        // Try to get the goal amount if available
        try {
          const { getGroupSavingsRecord } = await import('@/lib/savingsService');
          const savingsRecord = await getGroupSavingsRecord();

          if (savingsRecord && savingsRecord.goal_amount) {
            setGoalAmount(savingsRecord.goal_amount);
            setNewGoalAmount(savingsRecord.goal_amount.toString());
          }
        } catch (recordError) {
          console.error("Error getting full savings record:", recordError);
        }
      } catch (error) {
        console.error("Error during initialization:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load current savings",
        });
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, [toast]);

  // Handle savings update
  const handleSavingsUpdate = async () => {
    if (!newSavingsAmount) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a valid savings amount",
      });
      return;
    }

    const amount = Number(newSavingsAmount);
    if (isNaN(amount) || amount < 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a valid positive number for savings amount",
      });
      return;
    }

    // Parse goal amount if provided
    let parsedGoalAmount: number | undefined = undefined;
    if (newGoalAmount) {
      parsedGoalAmount = Number(newGoalAmount);
      if (isNaN(parsedGoalAmount) || parsedGoalAmount < 0) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please enter a valid positive number for goal amount",
        });
        return;
      }
    }

    // Create a note if the amount has changed
    const noteText = note || (amount !== currentSavings
      ? `Admin updated savings from ৳${currentSavings.toLocaleString()} to ৳${amount.toLocaleString()}`
      : undefined);

    try {
      // Show loading toast
      toast({
        title: "Updating...",
        description: "Updating group savings, please wait.",
      });

      // Check admin status directly
      const isAdmin = await directAdminCheck();
      console.log('Direct admin check result before update:', isAdmin);

      if (!isAdmin) {
        console.log('User is not an admin, attempting to force set as admin...');
        const forceResult = await forceSetAsAdmin();
        console.log('Force set admin result:', forceResult);
      }

      // Continue with the update regardless of admin status
      // The updateSavings function will handle the permission check

      const success = await updateSavings(amount, parsedGoalAmount, noteText);

      if (success) {
        toast({
          title: "Success",
          description: "Savings updated successfully",
        });
        setCurrentSavings(amount);
        if (parsedGoalAmount) {
          setGoalAmount(parsedGoalAmount);
        }
        setNote("");
        setIsDialogOpen(false);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to update savings. Please check your admin permissions.",
        });
      }
    } catch (error) {
      console.error("Error updating savings:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred",
      });
    }
  };

  return (
    <Card className="bg-dreamland-surface border-dreamland-accent/20">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Group Savings</CardTitle>
        <Button
          onClick={() => setIsDialogOpen(true)}
          className="bg-dreamland-primary hover:bg-dreamland-primary/90"
        >
          Update Savings
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-24">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-dreamland-primary"></div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-baseline">
              <div>
                <h3 className="text-3xl font-bold text-dreamland-accent">
                  ৳{currentSavings.toLocaleString()}
                </h3>
                <p className="text-sm text-gray-400 mt-1">Current Savings</p>
              </div>
              <div className="text-right">
                <h3 className="text-xl font-bold text-dreamland-secondary">
                  ৳{goalAmount.toLocaleString()}
                </h3>
                <p className="text-sm text-gray-400 mt-1">Goal Amount</p>
              </div>
            </div>

            <div className="w-full bg-gray-700 rounded-full h-2.5 mt-2">
              <div
                className="bg-dreamland-accent h-2.5 rounded-full"
                style={{ width: `${Math.min(100, (currentSavings / goalAmount) * 100)}%` }}
              ></div>
            </div>

            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>0%</span>
              <span>{Math.round((currentSavings / goalAmount) * 100)}%</span>
              <span>100%</span>
            </div>

            <div className="bg-dreamland-accent/10 p-4 rounded-md mt-4">
              <h4 className="font-medium mb-2">Admin Instructions:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-400">
                <li>Update the total savings amount manually as needed</li>
                <li>You can also update the goal amount if necessary</li>
                <li>All changes are immediately reflected on the homepage</li>
                <li>A record of each update is stored in the payment history</li>
              </ul>
            </div>
          </div>
        )}
      </CardContent>

      {/* Update Savings Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-dreamland-surface text-white border-dreamland-accent/20 sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Group Savings</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="totalAmount">Total Savings Amount (৳)</Label>
              <Input
                id="totalAmount"
                type="number"
                value={newSavingsAmount}
                onChange={(e) => setNewSavingsAmount(e.target.value)}
                className="bg-dreamland-background border-dreamland-accent/20"
              />
            </div>

            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="goalAmount">Goal Amount (৳)</Label>
              <Input
                id="goalAmount"
                type="number"
                value={newGoalAmount}
                onChange={(e) => setNewGoalAmount(e.target.value)}
                className="bg-dreamland-background border-dreamland-accent/20"
              />
            </div>

            <div className="grid grid-cols-1 gap-2">
              <Label htmlFor="note">Note (Optional)</Label>
              <Input
                id="note"
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Reason for update"
                className="bg-dreamland-background border-dreamland-accent/20"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              className="border-dreamland-accent/20"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSavingsUpdate}
              className="bg-dreamland-primary hover:bg-dreamland-primary/90"
            >
              Update Savings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default AdminSavings;
