
import { useState, useCallback } from 'react';
import { User } from '@/types';
import { supabase } from '@/integrations/supabase/client';

export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const updateUserData = useCallback(async (sessionUser: any, userProfile?: any) => {
    if (!sessionUser) {
      setUser(null);
      return null;
    }

    try {
      // First, try to get user profile data from subscribers table
      const { data: subscriberData, error: subscriberError } = await supabase
        .from('subscribers')
        .select('*')
        .eq('user_id', sessionUser.id)
        .single();
      
      console.log("Subscriber data:", subscriberData);
      
      if (subscriberError && !subscriberError.message.includes('No rows found')) {
        console.error('Error fetching subscriber data:', subscriberError);
      }

      // Create a new user object with the updated data
      const updatedUser: User = {
        id: sessionUser.id,
        email: sessionUser.email || '',
        isAdmin: sessionUser.app_metadata?.role === 'admin',
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
        isAdmin: sessionUser.app_metadata?.role === 'admin',
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
