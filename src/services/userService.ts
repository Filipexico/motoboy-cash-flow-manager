
import { supabase } from '@/lib/supabase';
import { formatAddressToJSON } from '@/lib/utils';

export const setupNewUserData = async (userId: string, email: string) => {
  try {
    console.log(`Setting up default data for user: ${email} (${userId})`);
    
    // Note: User profiles, roles, and subscribers are now created automatically 
    // via the database trigger when a user signs up.
    // This function is kept for backward compatibility but isn't needed anymore.
    
    // 2. Obter os metadados do usuário para o perfil
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('Error fetching user data:', userError);
      return false;
    }
    
    const userMetadata = userData?.user?.user_metadata || {};
    console.log('User metadata for profile creation:', userMetadata);
    
    // Garantir que o endereço seja um objeto JSONB válido
    const addressData = formatAddressToJSON(userMetadata.address);
    
    console.log('Formatted address for profile:', addressData);
    
    // Profile creation is now handled by database trigger
    
    return true;
  } catch (error) {
    console.error('Error setting up default data:', error);
    return false;
  }
};

export const getUserProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

export const updateUserProfile = async (userId: string, profileData: any) => {
  try {
    // Garantir que o endereço seja um objeto JSON válido se fornecido
    if (profileData.address) {
      profileData.address = formatAddressToJSON(profileData.address);
    }
    
    const { data, error } = await supabase
      .from('profiles')
      .update(profileData)
      .eq('id', userId)
      .select()
      .maybeSingle();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};
