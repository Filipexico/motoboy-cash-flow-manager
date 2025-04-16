
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
import { AlertCircle, Info, Loader2, Lock, Mail } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Por favor, insira sua senha'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const Login = () => {
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      console.log("User is authenticated, redirecting to dashboard");
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
      console.log("Attempting login with:", data.email);
      
      // Attempt login
      await login(data.email, data.password);
      
      // The navigation will happen automatically via the useEffect when isAuthenticated changes
      toast({
        title: "Login bem-sucedido!",
        description: "Bem-vindo de volta ao MotoControle.",
      });
    } catch (error: any) {
      console.error('Login error:', error);
      let errorMessage = 'Ocorreu um erro durante o login. Por favor, tente novamente.';
      
      // Handle specific error messages
      if (error.message?.includes('Invalid login credentials')) {
        errorMessage = 'Email ou senha incorretos.';
      } else if (error.message?.includes('Email not confirmed')) {
        errorMessage = 'Email não confirmado. Por favor, verifique sua caixa de entrada para confirmar seu email.';
      } else if (error.message?.includes('network')) {
        errorMessage = 'Erro de conexão. Verifique sua conexão com a internet.';
      }
      
      setLoginError(errorMessage);
      toast({
        title: "Erro no login",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Show loading indicator if auth is still initializing
  if (authLoading && !isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 p-4">
        <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500" />
          <p className="text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    );
  }
  
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
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input 
                        placeholder="seu@email.com" 
                        type="email" 
                        autoComplete="email"
                        className="pl-10"
                        {...field} 
                      />
                    </div>
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
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input 
                        placeholder="********" 
                        type="password" 
                        autoComplete="current-password"
                        className="pl-10"
                        {...field} 
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : 'Entrar'}
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
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-3 text-blue-700">
          <p className="font-medium">Bem-vindo ao MotoControle</p>
          <p className="text-xs mt-1">A plataforma completa para controle financeiro e gerenciamento de veículos</p>
        </div>
        
        <p>• Use um email válido e uma senha de pelo menos 8 caracteres</p>
        <p>• Se você não tem uma conta, crie uma na página de cadastro</p>
        <button 
          onClick={() => setShowDebugInfo(!showDebugInfo)}
          className="text-blue-500 hover:underline flex items-center mt-2 mx-auto"
        >
          <Info className="h-3 w-3 mr-1" /> {showDebugInfo ? 'Ocultar' : 'Mostrar'} informações de depuração
        </button>
        
        {showDebugInfo && (
          <div className="mt-4 text-left bg-gray-100 p-3 rounded text-xs overflow-auto max-h-40">
            <p>API URL: {window.location.origin}</p>
            <p>isAuthenticated: {String(isAuthenticated)}</p>
            <p>isLoading: {String(authLoading)}</p>
            <p>isSubmitting: {String(isSubmitting)}</p>
            <p>Supabase URL: {import.meta.env.VITE_SUPABASE_URL || 'https://qewlxnjqojxprkodfdqf.supabase.co'}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
