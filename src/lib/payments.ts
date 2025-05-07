import { supabase } from '@/integrations/supabase/client';
import { supabaseAdmin } from '@/integrations/supabase/client';
import { getCurrentUser } from './auth';
import { isCurrentUserAdmin } from './admin';
import type { Database } from '@/integrations/supabase/types';

export type Payment = Database['public']['Tables']['payments']['Row'];
export type GroupSavings = Database['public']['Tables']['group_savings']['Row'];
export type PaymentHistory = Database['public']['Tables']['payment_history']['Row'];
export type Group = Database['public']['Tables']['groups']['Row'];

/**
 * Get group savings for a specific group
 * @param groupId Optional group ID. If not provided, uses the current user's group
 * @returns The group savings record or null if not found
 */
export const getGroupSavings = async (groupId?: string): Promise<GroupSavings | null> => {
  try {
    // Get the current user's group if no groupId is provided
    if (!groupId) {
      const currentUser = await getCurrentUser();
      if (!currentUser) return null;

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('group_id')
        .eq('id', currentUser.id)
        .single();

      if (profileError || !profile || !profile.group_id) {
        console.error('Error fetching user profile or user has no group:', profileError);
        return null;
      }

      groupId = profile.group_id;
    }

    const { data, error } = await supabase
      .from('group_savings')
      .select('*')
      .eq('group_id', groupId)
      .single();

    if (error) {
      console.error('Error fetching group savings:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Unexpected error in getGroupSavings:', error);
    return null;
  }
};

/**
 * Update group savings
 * @param newAmount The new total amount
 * @param newGoalAmount Optional new goal amount
 * @param note Optional note about the update
 * @param groupId Optional group ID. If not provided, uses the current user's group
 * @returns Boolean indicating if the operation was successful
 */
export const updateGroupSavings = async (
  newAmount: number,
  newGoalAmount?: number,
  note?: string,
  groupId?: string
): Promise<boolean> => {
  try {
    // Ensure the current user is an admin
    const isAdmin = await isCurrentUserAdmin();
    if (!isAdmin) {
      console.error('Only admins can update group savings');
      return false;
    }

    // Get the current user for updated_by
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      console.error('Failed to get current user');
      return false;
    }

    // Use the database function to update group savings
    const { data, error } = await supabaseAdmin
      .rpc('update_group_savings', {
        new_amount: newAmount,
        new_goal_amount: newGoalAmount,
        update_note: note
      });

    if (error) {
      console.error('Error updating group savings:', error);
      return false;
    }

    // Record the transaction in payment history if there's a note
    if (note) {
      try {
        const currentSavings = await getGroupSavings(groupId);
        if (currentSavings) {
          const amountDifference = newAmount - (currentSavings.total_amount || 0);
          if (amountDifference !== 0) {
            const transactionType = amountDifference >= 0 ? 'deposit' : 'withdrawal';
            const transactionAmount = Math.abs(amountDifference);
            
            await recordPaymentHistory(
              groupId || currentSavings.group_id,
              currentUser.id,
              transactionType,
              transactionAmount,
              note
            );
          }
        }
      } catch (e) {
        console.error('Error recording payment history:', e);
        // Don't throw here, as the savings was updated successfully
      }
    }

    return true;
  } catch (error) {
    console.error('Unexpected error in updateGroupSavings:', error);
    return false;
  }
};

/**
 * Get payments for a specific user
 * @param userId The ID of the user to get payments for
 * @returns Array of payment records
 */
export const getUserPayments = async (userId: string): Promise<Payment[]> => {
  try {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('user_id', userId)
      .order('due_date', { ascending: false });

    if (error) {
      console.error('Error fetching user payments:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Unexpected error in getUserPayments:', error);
    return [];
  }
};

/**
 * Get all payments (admin only)
 * @returns Array of all payment records
 */
export const getAllPayments = async (): Promise<Payment[]> => {
  try {
    // Check if the current user is an admin
    const isAdmin = await isCurrentUserAdmin();
    if (!isAdmin) {
      console.error('Only admins can view all payments');
      return [];
    }

    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .order('due_date', { ascending: false });

    if (error) {
      console.error('Error fetching all payments:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Unexpected error in getAllPayments:', error);
    return [];
  }
};

/**
 * Record a new payment for a user (admin only)
 * @param payment The payment data to record
 * @returns The created payment record or null if failed
 */
export const recordPayment = async (
  payment: Omit<Payment, 'id'>
): Promise<Payment | null> => {
  try {
    // Ensure the current user is an admin
    const isAdmin = await isCurrentUserAdmin();
    if (!isAdmin) {
      console.error('Only admins can record payments');
      throw new Error('Only admins can record payments');
    }

    // Get the current user for recorded_by
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      console.error('Failed to get current user');
      throw new Error('Failed to get current user');
    }

    // Validate payment data
    if (!payment.user_id) {
      throw new Error('User ID is required');
    }
    if (!payment.amount || payment.amount <= 0) {
      throw new Error('Valid payment amount is required');
    }
    if (!payment.month) {
      throw new Error('Payment month is required');
    }
    if (!payment.due_date) {
      throw new Error('Due date is required');
    }

    // Get the user's profile using admin client
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', payment.user_id)
      .single();

    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      throw new Error('Failed to fetch user profile');
    }

    if (!profile) {
      throw new Error('User profile not found');
    }

    // Build the payment record with all required fields
    const paymentData = {
      user_id: payment.user_id,
      amount: payment.amount,
      month: payment.month,
      due_date: payment.due_date,
      payment_date: payment.payment_date || null,
      payment_method: payment.payment_method || 'cash',
      transaction_id: payment.transaction_id || `MANUAL-${Date.now()}`,
      status: payment.is_paid ? 'completed' : 'pending',
      is_paid: payment.is_paid || false,
      created_at: new Date().toISOString()
    };

    console.log('Attempting to record payment with data:', paymentData);

    // Try with admin client first
    const { data, error } = await supabaseAdmin
      .from('payments')
      .insert(paymentData)
      .select()
      .single();

    if (error) {
      console.error('Error recording payment:', error);
      throw new Error(error.message || 'Failed to record payment');
    }

    // If payment is marked as paid and user has a group, update group savings
    if (payment.is_paid && payment.status === 'completed' && profile.group_id) {
      try {
        const currentSavings = await getGroupSavings(profile.group_id);
        if (currentSavings) {
          const newAmount = (currentSavings.total_amount || 0) + payment.amount;
          await updateGroupSavings(
            newAmount,
            undefined,
            `Payment recorded for ${payment.month}`
          );
        } else {
          // Create new group savings record
          await updateGroupSavings(
            payment.amount,
            undefined,
            `Initial payment for ${payment.month}`,
            profile.group_id
          );
        }

        // Record payment history
        await recordPaymentHistory(
          profile.group_id,
          currentUser.id,
          'deposit',
          payment.amount,
          `Payment for ${payment.month}`
        );
      } catch (e) {
        console.error('Error updating group savings after payment:', e);
        // Don't throw here, as the payment was recorded successfully
      }
    }

    return data;
  } catch (err) {
    console.error('Unexpected error in recordPayment:', err);
    throw err; // Re-throw to handle in the UI
  }
};

/**
 * Update an existing payment record (admin only)
 * @param paymentId The ID of the payment to update
 * @param paymentData The updated payment data
 * @returns Boolean indicating if the operation was successful
 */
export const updatePayment = async (
  paymentId: string,
  paymentData: Partial<Omit<Payment, 'id' | 'created_at' | 'recorded_by'>>
): Promise<boolean> => {
  try {
    // Check if the current user is an admin
    const isAdmin = await isCurrentUserAdmin();
    if (!isAdmin) {
      console.error('Only admins can update payments');
      return false;
    }

    // Get the current payment record
    const { data: currentPayment, error: fetchError } = await supabase
      .from('payments')
      .select('*')
      .eq('id', paymentId)
      .single();

    if (fetchError || !currentPayment) {
      console.error('Error fetching payment to update:', fetchError);
      return false;
    }

    // Get the user's group
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('group_id')
      .eq('id', currentPayment.user_id)
      .single();

    if (profileError || !profile || !profile.group_id) {
      console.error('Error fetching user profile or user has no group:', profileError);
      return false;
    }

    const groupId = profile.group_id;

    // Prepare update data
    const updateData = {
      ...paymentData,
      updated_at: new Date().toISOString()
    };

    // Update the payment record
    const { error } = await supabase
      .from('payments')
      .update(updateData)
      .eq('id', paymentId);

    if (error) {
      console.error('Error updating payment:', error);
      return false;
    }

    // If payment status changed to paid/completed, update group savings
    if (
      (!currentPayment.is_paid || currentPayment.status !== 'completed') &&
      paymentData.is_paid === true &&
      paymentData.status === 'completed'
    ) {
      // Get current savings
      const currentSavings = await getGroupSavings(groupId);
      if (currentSavings) {
        // Update the group savings directly
        const newAmount = (currentSavings.total_amount || 0) + currentPayment.amount;
        await updateGroupSavings(
          newAmount,
          undefined,
          `Payment recorded for ${currentPayment.month}`,
          groupId
        );
      } else {
        // Create new group savings record
        await updateGroupSavings(
          currentPayment.amount,
          undefined,
          `Initial payment for ${currentPayment.month}`,
          groupId
        );
      }
    }

    return true;
  } catch (error) {
    console.error('Unexpected error in updatePayment:', error);
    return false;
  }
};

/**
 * Record a payment history entry
 * @param groupId The group ID
 * @param userId The user ID who made the change
 * @param type The type of transaction ('deposit' or 'withdrawal')
 * @param amount The amount of the transaction
 * @param note Optional note about the transaction
 * @returns The created payment history record or null if failed
 */
export const recordPaymentHistory = async (
  groupId: string,
  userId: string,
  type: 'deposit' | 'withdrawal',
  amount: number,
  note?: string
): Promise<PaymentHistory | null> => {
  try {
    // Check if the current user is an admin
    const isAdmin = await isCurrentUserAdmin();
    if (!isAdmin) {
      console.error('Only admins can record payment history');
      return null;
    }

    // Prepare payment history data
    const paymentHistoryData = {
      group_id: groupId,
      user_id: userId,
      type,
      amount,
      note,
      created_at: new Date().toISOString()
    };

    // Insert the payment history record
    const { data, error } = await supabase
      .from('payment_history')
      .insert(paymentHistoryData)
      .select()
      .single();

    if (error) {
      console.error('Error recording payment history:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Unexpected error in recordPaymentHistory:', error);
    return null;
  }
};

/**
 * Get payment history for a specific group
 * @param groupId The ID of the group to get payment history for
 * @returns Array of payment history records
 */
export const getGroupPaymentHistory = async (groupId?: string): Promise<PaymentHistory[]> => {
  try {
    // Get the current user's group if no groupId is provided
    if (!groupId) {
      const currentUser = await getCurrentUser();
      if (!currentUser) return [];

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('group_id')
        .eq('id', currentUser.id)
        .single();

      if (profileError || !profile || !profile.group_id) {
        console.error('Error fetching user profile or user has no group:', profileError);
        return [];
      }

      groupId = profile.group_id;
    }

    const { data, error } = await supabase
      .from('payment_history')
      .select(`
        *,
        user:user_id (
          name,
          email
        )
      `)
      .eq('group_id', groupId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching group payment history:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Unexpected error in getGroupPaymentHistory:', error);
    return [];
  }
};

/**
 * Create a new group
 * @param name The name of the group
 * @returns The created group or null if failed
 */
export const createGroup = async (name: string): Promise<Group | null> => {
  try {
    // Check if the current user is an admin
    const isAdmin = await isCurrentUserAdmin();
    if (!isAdmin) {
      console.error('Only admins can create groups');
      return null;
    }

    // Create the group
    const { data, error } = await supabase
      .from('groups')
      .insert({ name })
      .select()
      .single();

    if (error) {
      console.error('Error creating group:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Unexpected error in createGroup:', error);
    return null;
  }
};

/**
 * Get all groups
 * @returns Array of groups
 */
export const getAllGroups = async (): Promise<Group[]> => {
  try {
    const { data, error } = await supabase
      .from('groups')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching groups:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Unexpected error in getAllGroups:', error);
    return [];
  }
};

/**
 * Delete a payment record (admin only)
 * @param paymentId The ID of the payment to delete
 * @returns Boolean indicating if the operation was successful
 */
export const deletePayment = async (paymentId: string): Promise<boolean> => {
  try {
    // Check if the current user is an admin
    const isAdmin = await isCurrentUserAdmin();
    if (!isAdmin) {
      console.error('Only admins can delete payments');
      return false;
    }

    // Get the payment details before deleting using admin client
    const { data: payment, error: fetchError } = await supabaseAdmin
      .from('payments')
      .select('*')
      .eq('id', paymentId)
      .single();

    if (fetchError) {
      console.error('Error fetching payment details:', fetchError);
      return false;
    }

    if (!payment) {
      console.error('Payment not found');
      return false;
    }

    // Delete the payment record using admin client
    const { error: deleteError } = await supabaseAdmin
      .from('payments')
      .delete()
      .eq('id', paymentId);

    if (deleteError) {
      console.error('Error deleting payment:', deleteError);
      return false;
    }

    // If the payment was marked as paid, update group savings
    if (payment.is_paid && payment.status === 'completed') {
      try {
        // Get the user's profile to get their group_id using admin client
        const { data: profile, error: profileError } = await supabaseAdmin
          .from('profiles')
          .select('group_id')
          .eq('id', payment.user_id)
          .single();

        if (profileError) {
          console.error('Error fetching user profile:', profileError);
        } else if (profile?.group_id) {
          // Get current group savings
          const currentSavings = await getGroupSavings(profile.group_id);
          if (currentSavings) {
            // Subtract the payment amount from group savings
            const newAmount = (currentSavings.total_amount || 0) - payment.amount;
            await updateGroupSavings(
              newAmount,
              undefined,
              `Payment record deleted for ${payment.month}`
            );

            // Record the withdrawal in payment history
            await recordPaymentHistory(
              profile.group_id,
              payment.user_id,
              'withdrawal',
              payment.amount,
              `Payment record deleted for ${payment.month}`
            );
          }
        }
      } catch (e) {
        console.error('Error updating group savings after payment deletion:', e);
        // Continue anyway as the payment was deleted successfully
      }
    }

    return true;
  } catch (error) {
    console.error('Unexpected error in deletePayment:', error);
    return false;
  }
};
