
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
          subscribed: false,
          role: 'user'
        });
      
      if (subscriberError) {
        console.error('Error creating subscriber record:', subscriberError);
      } else {
        console.log('Subscriber record created successfully');
      }
    }
    
    // 2. Tente obter os metadados do usuário para o perfil
    const { data: userData, error: userError } = await supabase.auth.getUser(userId);
    
    if (userError) {
      console.error('Error fetching user data:', userError);
    }
    
    const userMetadata = userData?.user?.user_metadata || {};
    console.log('User metadata for profile creation:', userMetadata);
    
    // 3. Create a user profile if it doesn't exist
    const { data: existingProfile } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (!existingProfile) {
      try {
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            user_id: userId,
            full_name: userMetadata.full_name || email.split('@')[0],
            phone_number: userMetadata.phone_number || null,
            address: userMetadata.address || null
          });
        
        if (profileError) {
          console.error('Error creating user profile:', profileError);
        } else {
          console.log('User profile created successfully');
        }
      } catch (error) {
        console.error('Error setting up user profile:', error);
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
