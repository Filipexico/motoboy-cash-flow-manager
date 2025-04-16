
import React, { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { CreateUserFormValues } from '@/types/userProfile';
import { supabase } from '@/lib/supabase';

const createUserSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string()
    .min(8, 'A senha deve ter pelo menos 8 caracteres')
    .regex(/[A-Z]/, 'A senha deve conter pelo menos uma letra maiúscula')
    .regex(/[a-z]/, 'A senha deve conter pelo menos uma letra minúscula')
    .regex(/[0-9]/, 'A senha deve conter pelo menos um número'),
  confirmPassword: z.string().min(1, 'Por favor, confirme sua senha'),
  fullName: z.string().min(3, 'Nome completo é obrigatório'),
  isAdmin: z.boolean().default(false),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
});

interface CreateUserFormProps {
  onSuccess: () => void;
}

const CreateUserForm = ({ onSuccess }: CreateUserFormProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const form = useForm<z.infer<typeof createUserSchema>>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      fullName: '',
      isAdmin: false,
    },
  });

  const onSubmit = async (data: z.infer<typeof createUserSchema>) => {
    try {
      setIsSubmitting(true);
      
      // Create user in Supabase Auth
      const { data: userData, error: signUpError } = await supabase.auth.admin.createUser({
        email: data.email,
        password: data.password,
        email_confirm: true,
        user_metadata: {
          display_name: data.fullName,
          is_admin: data.isAdmin,
        },
      });
      
      if (signUpError) throw signUpError;
      
      // Create user profile in subscribers table
      if (userData?.user) {
        const { error: profileError } = await supabase
          .from('subscribers')
          .insert({
            user_id: userData.user.id,
            email: data.email,
            role: data.isAdmin ? 'admin' : 'user',
          });
        
        if (profileError) throw profileError;
        
        // Set admin status if needed
        if (data.isAdmin) {
          const { error: adminError } = await supabase.rpc('set_user_admin_status', {
            user_id_param: userData.user.id,
            is_admin_param: true
          });
          
          if (adminError) throw adminError;
        }
      }
      
      toast({
        title: "Usuário criado com sucesso",
        description: `${data.fullName} foi adicionado ao sistema.`,
      });
      
      form.reset();
      onSuccess();
      
    } catch (error: any) {
      console.error('Error creating user:', error);
      let errorMessage = 'Não foi possível criar o usuário. Tente novamente.';
      
      if (error.message?.includes('email already taken') || error.message?.includes('User already registered')) {
        errorMessage = 'Este email já está cadastrado.';
      }
      
      toast({
        title: "Erro ao criar usuário",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input 
                  placeholder="exemplo@email.com" 
                  type="email" 
                  autoComplete="email"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome Completo</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Nome completo do usuário" 
                  autoComplete="name"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Senha</FormLabel>
              <div className="relative">
                <FormControl>
                  <Input 
                    placeholder="********" 
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    {...field} 
                  />
                </FormControl>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <FormDescription className="text-xs">
                A senha deve conter pelo menos 8 caracteres, incluindo letras maiúsculas, minúsculas e números.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirme a senha</FormLabel>
              <div className="relative">
                <FormControl>
                  <Input 
                    placeholder="********" 
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    {...field} 
                  />
                </FormControl>
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="isAdmin"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  Administrador
                </FormLabel>
                <FormDescription>
                  Concede permissões de administrador ao usuário. Administradores podem gerenciar outros usuários e acessar todas as funcionalidades do sistema.
                </FormDescription>
              </div>
            </FormItem>
          )}
        />
        
        <Button 
          type="submit" 
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processando...
            </>
          ) : 'Criar Usuário'}
        </Button>
      </form>
    </Form>
  );
};

export default CreateUserForm;
