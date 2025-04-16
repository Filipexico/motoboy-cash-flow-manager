
-- Verifica se o usuário já existe
DO $$
DECLARE
  admin_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM auth.users WHERE email = 'admin@motocontrole.com'
  ) INTO admin_exists;

  -- Se o usuário não existir, cria-o
  IF NOT admin_exists THEN
    -- Inserir diretamente na tabela auth.users
    INSERT INTO auth.users (
      id,
      email,
      raw_app_meta_data,
      raw_user_meta_data,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      confirmation_token,
      recovery_token
    ) VALUES (
      gen_random_uuid(),
      'admin@motocontrole.com',
      '{"role": "admin"}'::jsonb,
      '{"full_name": "Administrador do Sistema"}'::jsonb,
      crypt('Admin@123', gen_salt('bf')),
      now(),
      now(),
      now(),
      '',
      ''
    );
    
    -- Obter o ID do usuário recém-criado
    WITH new_user AS (
      SELECT id FROM auth.users WHERE email = 'admin@motocontrole.com'
    )
    -- Inserir no perfil do usuário
    INSERT INTO public.user_profiles (user_id, full_name)
    SELECT id, 'Administrador do Sistema' FROM new_user;
    
    -- Inserir como assinante
    WITH new_user AS (
      SELECT id FROM auth.users WHERE email = 'admin@motocontrole.com'
    )
    INSERT INTO public.subscribers (user_id, email, role, subscribed)
    SELECT id, 'admin@motocontrole.com', 'admin', true FROM new_user;
    
    RAISE NOTICE 'Usuário administrador criado com sucesso.';
  ELSE
    -- Se o usuário já existe, atualizar suas permissões para admin
    UPDATE auth.users SET 
      raw_app_meta_data = '{"role": "admin"}'::jsonb,
      email_confirmed_at = now()
    WHERE email = 'admin@motocontrole.com';
    
    -- Verificar se existe na tabela de assinantes, e se não, inserir
    WITH new_user AS (
      SELECT id FROM auth.users WHERE email = 'admin@motocontrole.com'
    )
    INSERT INTO public.subscribers (user_id, email, role, subscribed)
    SELECT id, 'admin@motocontrole.com', 'admin', true FROM new_user
    ON CONFLICT (user_id) DO UPDATE SET role = 'admin', subscribed = true;
    
    RAISE NOTICE 'Usuário administrador atualizado com sucesso.';
  END IF;
END $$;

-- Atualizar confirmação de email para todos os usuários existentes
UPDATE auth.users SET email_confirmed_at = now() WHERE email_confirmed_at IS NULL;
