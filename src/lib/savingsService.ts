import { supabase } from '@/integrations/supabase/client';
import { getCurrentUser } from './auth';
import { isCurrentUserAdmin } from './admin';

/**
 * Interface for group savings data
 */
export interface GroupSavings {
  id: string;
  total_amount: number;
  goal_amount?: number;  // Make optional since it might not exist in the table
  note?: string;
  last_updated_at?: string;  // Make optional since it might be named differently
  last_updated?: string;     // Alternative name that might be used
  updated_by?: string;
  created_at?: string;
}

/**
 * Get the current group savings amount
 * @returns The current savings amount
 */
export const getSavings = async (): Promise<number> => {
  try {
    console.log('Fetching savings amount...');

    // First try to get all records to see what's available
    const { data: allRecords, error: allError } = await supabase
      .from('group_savings')
      .select('*')
      .order('id', { ascending: false })  // Get the most recent record first
      .limit(10);  // Get multiple records to see what's available

    if (allError) {
      console.error('Error fetching all group savings records:', allError);
      return 0;
    }

    console.log('All group_savings records:', allRecords);

    if (!allRecords || allRecords.length === 0) {
      console.log('No savings records found, returning 0');
      return 0;
    }

    // Use the first record (most recent)
    const record = allRecords[0];
    console.log('Using record:', record);

    // Check if total_amount exists and is a number
    if (typeof record.total_amount === 'number') {
      console.log('Found total_amount:', record.total_amount);
      return record.total_amount;
    } else if (record.total_amount) {
      // Try to convert to number
      const amount = Number(record.total_amount);
      if (!isNaN(amount)) {
        console.log('Converted total_amount to number:', amount);
        return amount;
      }
    }

    console.log('Could not find valid total_amount, returning 0');
    return 0;
  } catch (error) {
    console.error('Unexpected error in getSavings:', error);
    return 0;
  }
};

/**
 * Get the full group savings record
 * @returns The group savings record
 */
export const getGroupSavingsRecord = async (): Promise<GroupSavings | null> => {
  try {
    console.log('Fetching group savings record...');

    // Get all records to see what's available
    const { data: allRecords, error: allError } = await supabase
      .from('group_savings')
      .select('*')
      .order('id', { ascending: false })  // Get the most recent record first
      .limit(10);

    if (allError) {
      console.error('Error fetching all group savings records:', allError);
      return null;
    }

    console.log('All group_savings records:', allRecords);

    if (!allRecords || allRecords.length === 0) {
      console.log('No savings records found, returning null');
      return null;
    }

    // Use the first record (most recent)
    const record = allRecords[0];
    console.log('Using record:', record);

    // Create a standardized GroupSavings object
    const groupSavings: GroupSavings = {
      id: record.id,
      total_amount: typeof record.total_amount === 'number' ? record.total_amount : 0
    };

    // Add goal_amount if it exists
    if (record.goal_amount !== undefined) {
      groupSavings.goal_amount = typeof record.goal_amount === 'number'
        ? record.goal_amount
        : Number(record.goal_amount) || 2000000;
    } else {
      // Default goal amount
      groupSavings.goal_amount = 2000000;
    }

    // Add last_updated_at or last_updated
    if (record.last_updated_at) {
      groupSavings.last_updated_at = record.last_updated_at;
    } else if (record.last_updated) {
      groupSavings.last_updated = record.last_updated;
      groupSavings.last_updated_at = record.last_updated; // Copy for compatibility
    } else {
      // Default to current time
      const now = new Date().toISOString();
      groupSavings.last_updated_at = now;
    }

    // Add other fields if they exist
    if (record.note) groupSavings.note = record.note;
    if (record.updated_by) groupSavings.updated_by = record.updated_by;
    if (record.created_at) groupSavings.created_at = record.created_at;

    console.log('Standardized group savings record:', groupSavings);
    return groupSavings;
  } catch (error) {
    console.error('Unexpected error in getGroupSavingsRecord:', error);
    return null;
  }
};

/**
 * Update the group savings amount (admin only)
 * @param newAmount The new total amount
 * @param goalAmount Optional new goal amount
 * @param note Optional note about the update
 * @returns Boolean indicating if the operation was successful
 */
export const updateSavings = async (
  newAmount: number,
  goalAmount?: number,
  note?: string
): Promise<boolean> => {
  try {
    console.log('Starting updateSavings with amount:', newAmount);

    // Get the current user first
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      console.error('Failed to get current user - user is not logged in');
      return false;
    }

    console.log('Current user:', currentUser.id, currentUser.email);

    // Check if the current user is an admin
    const isAdmin = await isCurrentUserAdmin();
    console.log('Is user admin?', isAdmin);

    if (!isAdmin) {
      console.error('Only admins can update group savings');
      return false;
    }

    // Get the current savings record
    const currentSavings = await getGroupSavingsRecord();

    // Prepare update data - only include total_amount which we know exists
    const updateData: any = {
      total_amount: newAmount
    };

    // Check if the current record has last_updated_at or last_updated
    if (currentSavings?.last_updated_at !== undefined) {
      updateData.last_updated_at = new Date().toISOString();
    } else if (currentSavings?.last_updated !== undefined) {
      updateData.last_updated = new Date().toISOString();
    }

    // Add updated_by if the column exists
    if (currentSavings?.updated_by !== undefined) {
      updateData.updated_by = currentUser.id;
    }

    // Add goal amount if provided and if the column exists
    if (goalAmount !== undefined && currentSavings?.goal_amount !== undefined) {
      updateData.goal_amount = goalAmount;
    }

    // Add note if provided and if the column exists
    if (note && currentSavings?.note !== undefined) {
      updateData.note = note;
    }

    console.log('Current savings record:', currentSavings);
    console.log('Update data:', updateData);

    let result;

    // First, check if the table exists and has the right structure
    console.log('Checking table structure...');

    try {
      // Try to get the table structure
      const { data: columns, error: columnsError } = await supabase
        .from('information_schema.columns')
        .select('column_name')
        .eq('table_name', 'group_savings')
        .eq('table_schema', 'public');

      if (columnsError) {
        console.error('Error checking table structure:', columnsError);
      } else {
        console.log('Table columns:', columns);

        // Check if we have the necessary columns
        const columnNames = columns.map(col => col.column_name);
        const hasGoalAmount = columnNames.includes('goal_amount');
        const hasLastUpdatedAt = columnNames.includes('last_updated_at');

        if (!hasGoalAmount || !hasLastUpdatedAt) {
          console.log('Missing columns, attempting to fix table structure...');

          // Create a more complete insert/update data
          if (!hasGoalAmount && goalAmount !== undefined) {
            console.log('Adding goal_amount to data');
            updateData.goal_amount = goalAmount;
          }

          if (!hasLastUpdatedAt) {
            console.log('Adding last_updated_at to data');
            updateData.last_updated_at = new Date().toISOString();
          }
        }
      }
    } catch (structureError) {
      console.error('Error checking table structure:', structureError);
    }

    if (!currentSavings) {
      // If no savings record exists, create one with more complete data
      console.log('No existing savings record found, creating new one');

      // Create a more complete insert data
      const insertData: any = {
        total_amount: newAmount,
        goal_amount: goalAmount || 2000000,
        last_updated_at: new Date().toISOString()
      };

      if (note) {
        insertData.note = note;
      }

      if (currentUser?.id) {
        insertData.updated_by = currentUser.id;
      }

      console.log('Insert data:', insertData);

      result = await supabase
        .from('group_savings')
        .insert(insertData)
        .select();

      console.log('Insert result:', result);

      // If insert failed, try with minimal data
      if (result.error) {
        console.log('Insert failed, trying with minimal data');

        const minimalData = {
          total_amount: newAmount
        };

        result = await supabase
          .from('group_savings')
          .insert(minimalData)
          .select();

        console.log('Minimal insert result:', result);
      }
    } else {
      // Update existing record
      console.log('Updating existing savings record with ID:', currentSavings.id);

      result = await supabase
        .from('group_savings')
        .update(updateData)
        .eq('id', currentSavings.id)
        .select();

      console.log('Update result:', result);

      // If update failed, try with minimal data
      if (result.error) {
        console.log('Update failed, trying with minimal data');

        const minimalData = {
          total_amount: newAmount
        };

        result = await supabase
          .from('group_savings')
          .update(minimalData)
          .eq('id', currentSavings.id)
          .select();

        console.log('Minimal update result:', result);
      }
    }

    if (result.error) {
      console.error('Error updating group savings:', result.error);
      console.error('Error details:', result.error.message, result.error.details);
      return false;
    }

    console.log('Successfully updated group savings');

    // Try to record the transaction in payment history
    try {
      if (note) {
        console.log('Attempting to record payment history');

        // Check if payment_history table exists
        const { data: tables, error: tablesError } = await supabase
          .from('information_schema.tables')
          .select('table_name')
          .eq('table_name', 'payment_history')
          .eq('table_schema', 'public');

        if (tablesError) {
          console.error('Error checking for payment_history table:', tablesError);
        } else if (tables && tables.length > 0) {
          // Table exists, try to insert
          const { error: historyError } = await supabase
            .from('payment_history')
            .insert({
              user_id: currentUser.id,
              type: newAmount > (currentSavings?.total_amount || 0) ? 'deposit' : 'withdrawal',
              amount: Math.abs(newAmount - (currentSavings?.total_amount || 0)),
              note: note
            });

          if (historyError) {
            console.error('Error recording payment history:', historyError);
          } else {
            console.log('Successfully recorded payment history');
          }
        } else {
          console.log('payment_history table does not exist, skipping record');
        }
      }
    } catch (historyError) {
      console.error('Error in payment history recording:', historyError);
      // We still return true because the savings was updated successfully
    }

    return true;
  } catch (error) {
    console.error('Unexpected error in updateSavings:', error);
    return false;
  }
};
