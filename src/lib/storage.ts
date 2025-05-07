import { supabase } from '@/integrations/supabase/client';

/**
 * Uploads a file to Supabase Storage
 * @param bucket The storage bucket name ('profile_photos' or 'project_photos')
 * @param path The path within the bucket where the file should be stored
 * @param file The file to upload
 * @returns The public URL of the uploaded file, or null if upload failed
 */
export const uploadFile = async (
  bucket: 'profile_photos' | 'project_photos',
  path: string,
  file: File
): Promise<string | null> => {
  try {
    console.log(`Uploading file to ${bucket}/${path}...`, {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type
    });

    // Upload the file
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(path, file, { 
        upsert: true,
        cacheControl: '3600',
        contentType: file.type
      });

    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      return null;
    }

    console.log('File uploaded successfully, getting public URL...');

    // Get the public URL
    const { data, error: urlError } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);

    if (urlError) {
      console.error('Error getting public URL:', urlError);
      return null;
    }

    if (!data || !data.publicUrl) {
      console.error('No public URL returned:', data);
      return null;
    }

    console.log('Public URL generated:', data.publicUrl);
    return data.publicUrl;
  } catch (error) {
    console.error('Error in uploadFile:', error);
    return null;
  }
};

/**
 * Uploads a profile photo for a user
 * @param userId The user's ID
 * @param file The profile photo file
 * @returns The public URL of the uploaded photo, or null if upload failed
 */
export const uploadProfilePhoto = async (
  userId: string,
  file: File
): Promise<string | null> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}.${fileExt}`;
  
  return await uploadFile('profile_photos', fileName, file);
};

/**
 * Uploads a project photo
 * @param projectId The project's ID
 * @param file The project photo file
 * @returns The public URL of the uploaded photo, or null if upload failed
 */
export const uploadProjectPhoto = async (
  projectId: string,
  file: File
): Promise<string | null> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${projectId}.${fileExt}`;
  
  return await uploadFile('project_photos', fileName, file);
};

/**
 * Deletes a file from Supabase Storage
 * @param bucket The storage bucket name
 * @param path The path of the file to delete
 * @returns true if deletion was successful, false otherwise
 */
export const deleteFile = async (
  bucket: 'profile_photos' | 'project_photos',
  path: string
): Promise<boolean> => {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);
    
    if (error) {
      console.error('Error deleting file:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in deleteFile:', error);
    return false;
  }
};

/**
 * Gets the public URL for a file in Supabase Storage
 * @param bucket The storage bucket name
 * @param path The path of the file
 * @returns The public URL of the file
 */
export const getPublicUrl = (
  bucket: 'profile_photos' | 'project_photos',
  path: string
): string => {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);
  
  return data.publicUrl;
};
