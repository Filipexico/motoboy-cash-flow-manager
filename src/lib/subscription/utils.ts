
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import type { SubscriptionData } from './types';

export const checkSubscriptionDatabase = async (
  userId: string, 
  setSubscription: (data: SubscriptionData) => void
) => {
  try {
    const { data, error } = await supabase
      .from('subscribers')
      .select('*')
      .eq('user_id', userId)
      .single();
      
    if (error) {
      console.error('Fallback subscription check error:', error);
      setSubscription({
        subscribed: false,
        subscription_tier: null,
        subscription_end: null
      });
      return;
    }
    
    if (data) {
      setSubscription({
        subscribed: data.subscribed || false,
        subscription_tier: data.subscription_tier,
        subscription_end: data.subscription_end
      });
    } else {
      setSubscription({
        subscribed: false,
        subscription_tier: null,
        subscription_end: null
      });
    }
  } catch (error) {
    console.error('Fallback subscription check error:', error);
    setSubscription({
      subscribed: false,
      subscription_tier: null,
      subscription_end: null
    });
  }
};

export const simulateTestSubscription = async (userId: string, plan: 'premium' | 'enterprise') => {
  if (!userId) return;
  
  try {
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);
    
    const { error } = await supabase.from('subscribers').upsert({
      user_id: userId,
      subscribed: true,
      subscription_tier: plan,
      subscription_end: endDate.toISOString(),
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' });
    
    if (error) {
      console.error('Error simulating subscription:', error);
      throw error;
    }
    
    return {
      subscribed: true,
      subscription_tier: plan,
      subscription_end: endDate.toISOString()
    };
  } catch (error) {
    console.error('Error simulating subscription:', error);
    throw error;
  }
};
