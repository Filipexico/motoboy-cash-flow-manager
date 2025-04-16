
import { supabase } from '@/lib/supabase';
import { formatAddressToJSON } from '@/lib/utils';

export const setupNewUserData = async (userId: string, email: string) => {
  try {
    console.log(`Setting up default data for user: ${email} (${userId})`);
    
    // 1. Verificar se o registro de assinante já existe
    const { data: existingSubscriber } = await supabase
      .from('subscribers')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (!existingSubscriber) {
      // Criar registro de assinante
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
    
    // 2. Obter os metadados do usuário para o perfil
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('Error fetching user data:', userError);
      return false;
    }
    
    const userMetadata = userData?.user?.user_metadata || {};
    console.log('User metadata for profile creation:', userMetadata);
    
    // Formatar o endereço corretamente e converter para string JSON
    const addressData = formatAddressToJSON(userMetadata.address || {});
    console.log('Formatted address for profile:', addressData);
    
    // 3. Verificar se o perfil já existe
    const { data: existingProfile } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (!existingProfile) {
      try {
        // Converter endereço para string JSON para satisfazer o tipo no banco de dados
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            user_id: userId,
            full_name: userMetadata.full_name || email.split('@')[0],
            phone_number: userMetadata.phone_number || null,
            // Usar o endereço já formatado como JSON
            address: addressData
          });
        
        if (profileError) {
          console.error('Error creating user profile:', profileError);
          return false;
        } else {
          console.log('User profile created successfully');
        }
      } catch (error) {
        console.error('Error setting up user profile:', error);
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error setting up default data:', error);
    return false;
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
    // Garantir que o endereço seja um objeto JSON válido se fornecido
    if (profileData.address) {
      profileData.address = formatAddressToJSON(profileData.address);
    }
    
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
