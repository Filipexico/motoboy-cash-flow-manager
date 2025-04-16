
import { supabase } from '@/lib/supabase';
import { User } from '@/types';

export const deleteUser = async (userId: string): Promise<boolean> => {
  try {
    // First delete the user from auth
    const { error: authError } = await supabase.auth.admin.deleteUser(userId);
    
    if (authError) {
      console.error('Error deleting user from auth:', authError);
      throw authError;
    }
    
    // The user_profiles record will be automatically deleted due to
    // the on delete cascade constraint in the database
    
    console.log(`User ${userId} deleted successfully`);
    return true;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

export const updateUserAdminStatus = async (userId: string, isAdmin: boolean): Promise<User | null> => {
  try {
    // Update user in Supabase
    const { data, error } = await supabase.rpc('set_user_admin_status', {
      user_id_param: userId,
      is_admin_param: isAdmin
    });
    
    if (error) {
      console.error('Error updating user admin status:', error);
      throw error;
    }
    
    // Also update the role in user_profiles 
    const { error: profileError } = await supabase
      .from('user_profiles')
      .update({ role: isAdmin ? 'admin' : 'user' })
      .eq('user_id', userId);
    
    if (profileError) {
      console.error('Error updating user profile role:', profileError);
    }
    
    // Get the updated user information
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId);
    
    if (userError) {
      throw userError;
    }
    
    return userData.user ? {
      id: userData.user.id,
      email: userData.user.email || '',
      isAdmin,
      isSubscribed: false, // We would need to fetch this from elsewhere
      subscriptionTier: null,
      subscriptionEnd: null,
      displayName: userData.user.user_metadata?.display_name || userData.user.email || '',
      name: userData.user.user_metadata?.display_name || userData.user.email || '',
    } : null;
  } catch (error) {
    console.error('Error updating user admin status:', error);
    throw error;
  }
};

export const getAllUsers = async (): Promise<User[]> => {
  try {
    // Get all users from auth
    const { data, error } = await supabase.auth.admin.listUsers();
    
    if (error) {
      console.error('Error listing users:', error);
      throw error;
    }
    
    // Map users to our User interface
    return data.users.map(user => ({
      id: user.id,
      email: user.email || '',
      isAdmin: user.app_metadata?.role === 'admin' || false,
      isSubscribed: false, // We would need to fetch this from elsewhere
      subscriptionTier: null,
      subscriptionEnd: null,
      displayName: user.user_metadata?.display_name || user.email || '',
      name: user.user_metadata?.display_name || user.email || '',
      createdAt: user.created_at,
    }));
  } catch (error) {
    console.error('Error fetching all users:', error);
    throw error;
  }
};
