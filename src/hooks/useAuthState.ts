
import { useState, useCallback } from 'react';
import { User } from '@/types';
import { supabase } from '@/lib/supabase';

export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const updateUserData = useCallback(async (sessionUser: any, userProfile?: any) => {
    if (!sessionUser) {
      setUser(null);
      return null;
    }

    try {
      console.log("Fetching user data for:", sessionUser.id);
      
      // Get subscriber data
      const { data: subscriberData, error: subscriberError } = await supabase
        .from('subscribers')
        .select('*')
        .eq('user_id', sessionUser.id)
        .maybeSingle();
      
      console.log("Subscriber data:", subscriberData);
      
      if (subscriberError && !subscriberError.message.includes('No rows found')) {
        console.error('Error fetching subscriber data:', subscriberError);
      }

      // Get role data from user_roles table
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', sessionUser.id)
        .eq('role', 'admin')
        .maybeSingle();
      
      console.log("Role data:", roleData);
      
      if (roleError && !roleError.message.includes('No rows found')) {
        console.error('Error fetching role data:', roleError);
      }

      // Create a new user object with the updated data
      const updatedUser: User = {
        id: sessionUser.id,
        email: sessionUser.email || '',
        isAdmin: roleData?.role === 'admin',
        isSubscribed: subscriberData?.subscribed || false,
        subscriptionTier: subscriberData?.subscription_tier || null,
        subscriptionEnd: subscriberData?.subscription_end || null,
        subscriptionEndDate: subscriberData?.subscription_end || null,
        displayName: sessionUser.user_metadata?.display_name || sessionUser.email,
        name: sessionUser.user_metadata?.display_name || sessionUser.email,
      };

      // Set the updated user
      setUser(updatedUser);
      return updatedUser;
    } catch (error) {
      console.error('Error in updateUserData:', error);
      
      // Fallback if there was an error
      const updatedUser: User = {
        id: sessionUser.id,
        email: sessionUser.email || '',
        isAdmin: false, // Default to false if we can't check the database
        isSubscribed: false,
        subscriptionTier: null,
        subscriptionEnd: null,
        subscriptionEndDate: null,
        displayName: sessionUser.user_metadata?.display_name || sessionUser.email,
        name: sessionUser.user_metadata?.display_name || sessionUser.email,
      };
      
      setUser(updatedUser);
      return updatedUser;
    }
  }, []);

  return {
    user,
    setUser,
    isLoading,
    setIsLoading,
    updateUserData,
  };
};
