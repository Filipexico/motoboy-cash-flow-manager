
import { useState, useCallback } from 'react';
import { User } from '@/types';

export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const updateUserData = useCallback(async (sessionUser: any, userProfile?: any) => {
    if (!sessionUser) {
      setUser(null);
      return null;
    }

    // Create a new user object with the updated data
    const updatedUser: User = {
      id: sessionUser.id,
      email: sessionUser.email || '',
      isAdmin: sessionUser.app_metadata?.role === 'admin',
      isSubscribed: userProfile?.subscribed || false,
      subscriptionTier: userProfile?.subscription_tier || null,
      subscriptionEnd: userProfile?.subscription_end || null,
      subscriptionEndDate: userProfile?.subscription_end || null,
      displayName: sessionUser.user_metadata?.display_name || sessionUser.email,
      name: sessionUser.user_metadata?.display_name || sessionUser.email,
    };

    // Set the updated user
    setUser(updatedUser);
    return updatedUser;
  }, []);

  return {
    user,
    setUser,
    isLoading,
    setIsLoading,
    updateUserData,
  };
};
