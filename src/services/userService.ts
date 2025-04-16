
import { supabase } from '@/lib/supabase';

export const setupNewUserData = async (userId: string, email: string) => {
  try {
    console.log(`Setting up default data for user: ${email} (${userId})`);
    
    // 1. Check if subscriber record exists
    const { data: existingSubscriber } = await supabase
      .from('subscribers')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (!existingSubscriber) {
      // Create subscriber record
      const { error: subscriberError } = await supabase
        .from('subscribers')
        .insert({
          user_id: userId,
          email: email,
          subscribed: false
        });
      
      if (subscriberError) {
        console.error('Error creating subscriber record:', subscriberError);
      } else {
        console.log('Subscriber record created successfully');
      }
    }
    
    // 2. Check if user profile exists
    const { data: existingProfile } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (!existingProfile) {
      // Create empty profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          user_id: userId,
          full_name: email.split('@')[0]
        });
      
      if (profileError) {
        console.error('Error creating user profile:', profileError);
      } else {
        console.log('User profile created successfully');
      }
    }
    
    // 3. Create default expense categories
    const { data: existingCategories } = await supabase
      .from('expense_categories')
      .select('id')
      .eq('user_id', userId)
      .limit(1);
    
    if (!existingCategories || existingCategories.length === 0) {
      const defaultCategories = [
        { name: 'Combustível', user_id: userId },
        { name: 'Manutenção', user_id: userId },
        { name: 'Seguro', user_id: userId },
        { name: 'Impostos', user_id: userId },
        { name: 'Limpeza', user_id: userId },
        { name: 'Outros', user_id: userId }
      ];
      
      const { error: categoriesError } = await supabase
        .from('expense_categories')
        .insert(defaultCategories);
      
      if (categoriesError) {
        console.error('Error creating default categories:', categoriesError);
      } else {
        console.log('Default categories created successfully');
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error setting up default data:', error);
    throw error;
  }
};

export const getUserProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
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
    const { data, error } = await supabase
      .from('user_profiles')
      .update(profileData)
      .eq('user_id', userId)
      .select()
      .maybeSingle();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};
