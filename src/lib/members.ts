import { supabase } from '@/integrations/supabase/client';

/**
 * Interface for member data
 */
export interface Member {
  id: string;
  name: string;
  photoUrl: string | null;
  isPaid: boolean;
  mobile?: string;
  email?: string;
  address?: string;
  joinedDate?: string;
  contributions?: number;
}

/**
 * Fetch all registered members from the database
 * @returns Array of members with their profile information
 */
export const getAllMembers = async (): Promise<Member[]> => {
  try {
    // Fetch all profiles from the database
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching members:', error);
      return [];
    }

    // Transform profiles into the expected Member format
    const members: Member[] = profiles.map(profile => ({
      id: profile.id,
      name: profile.name,
      photoUrl: profile.photo_url,
      isPaid: false, // This would need to be determined from a payments table in a real app
      mobile: profile.mobile_number,
      email: profile.email,
      address: profile.address,
      joinedDate: profile.created_at,
      contributions: 0, // This would need to be calculated from a contributions table in a real app
    }));

    return members;
  } catch (error) {
    console.error('Unexpected error in getAllMembers:', error);
    return [];
  }
};

/**
 * Get a single member by ID
 * @param memberId The ID of the member to fetch
 * @returns The member data or null if not found
 */
export const getMemberById = async (memberId: string): Promise<Member | null> => {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', memberId)
      .single();

    if (error) {
      console.error('Error fetching member:', error);
      return null;
    }

    if (!profile) {
      return null;
    }

    // Transform profile into the expected Member format
    const member: Member = {
      id: profile.id,
      name: profile.name,
      photoUrl: profile.photo_url,
      isPaid: false, // This would need to be determined from a payments table in a real app
      mobile: profile.mobile_number,
      email: profile.email,
      address: profile.address,
      joinedDate: profile.created_at,
      contributions: 0, // This would need to be calculated from a contributions table in a real app
    };

    return member;
  } catch (error) {
    console.error('Unexpected error in getMemberById:', error);
    return null;
  }
};
