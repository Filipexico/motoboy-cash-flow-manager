
import React, { useState, useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Por favor, insira sua senha'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const Login = () => {
  const { login, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);
  
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });
  
  const onSubmit = async (data: LoginFormValues) => {
    try {
      setLoginError(null);
      setIsSubmitting(true);
      console.log("Tentando login com:", data.email);
      await login(data.email, data.password);
      toast({
        title: "Login realizado com sucesso",
        description: "Bem-vindo de volta!",
      });
      // Navegação explícita após login bem-sucedido
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Login error:', error);
      setLoginError(
        error.message === 'invalid_credentials' ? 
        'Email ou senha incorretos.' : 
        'Ocorreu um erro durante o login. Por favor, tente novamente.'
      );
      toast({
        title: "Erro no login",
        description: "Email ou senha incorretos. Por favor, tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-blue-700">Moto<span className="text-blue-500">Controle</span></h1>
          <p className="mt-2 text-gray-600">Faça login para continuar</p>
        </div>
        
        {loginError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erro no login</AlertTitle>
            <AlertDescription>
              {loginError}
            </AlertDescription>
          </Alert>
        )}
        
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
                      placeholder="seu@email.com" 
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
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Senha</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="******" 
                      type="password" 
                      autoComplete="current-password"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
        </Form>
        
        <div className="text-center mt-4">
          <p className="text-gray-600">
            Não tem uma conta?{' '}
            <Link to="/register" className="text-blue-600 hover:underline">
              Cadastre-se
            </Link>
          </p>
        </div>
      </div>
      
      <div className="mt-8 text-center text-sm text-gray-500">
        <p>Dicas para testar:</p>
        <p>• Tentando criar uma conta? Use um email válido e uma senha de pelo menos 6 caracteres.</p>
        <p>• O servidor Supabase pode levar alguns momentos para processar seu registro.</p>
      </div>
    </div>
  );
};

export default Login;
