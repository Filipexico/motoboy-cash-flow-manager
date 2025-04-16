
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
  FormMessage,
  FormDescription
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { RegisterFormValues } from '@/types/userProfile';

// Comprehensive registration schema with all the required fields
const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string()
    .min(8, 'A senha deve ter pelo menos 8 caracteres')
    .regex(/[A-Z]/, 'A senha deve conter pelo menos uma letra maiúscula')
    .regex(/[a-z]/, 'A senha deve conter pelo menos uma letra minúscula')
    .regex(/[0-9]/, 'A senha deve conter pelo menos um número'),
  confirmPassword: z.string().min(1, 'Por favor, confirme sua senha'),
  fullName: z.string().min(3, 'Nome completo é obrigatório'),
  phoneNumber: z.string().min(10, 'Número de telefone deve ter pelo menos 10 dígitos'),
  address: z.object({
    street: z.string().min(1, 'Endereço é obrigatório'),
    city: z.string().min(1, 'Cidade é obrigatória'),
    state: z.string().min(1, 'Estado é obrigatório'),
    zipcode: z.string().min(1, 'CEP é obrigatório'),
    country: z.string().min(1, 'País é obrigatório'),
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
});

const Register = () => {
  const { register: registerUser, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [registrationStep, setRegistrationStep] = useState<1 | 2>(1);
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);
  
  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      fullName: '',
      phoneNumber: '',
      address: {
        street: '', // Initialize with empty string instead of undefined
        city: '', // Initialize with empty string instead of undefined
        state: '', // Initialize with empty string instead of undefined
        zipcode: '', // Initialize with empty string instead of undefined
        country: 'Brasil', // This was already properly initialized
      },
    },
  });
  
  const onSubmit = async (data: z.infer<typeof registerSchema>) => {
    if (registrationStep === 1) {
      // Move to step 2 if password validation passes
      setRegistrationStep(2);
      return;
    }
    
    try {
      setRegisterError(null);
      setIsSubmitting(true);
      console.log("Registering user:", data.email);
      
      const formValues: RegisterFormValues = {
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
        fullName: data.fullName,
        phoneNumber: data.phoneNumber,
        address: data.address,
      };
      
      await registerUser(formValues);
      
      // Navigation will happen automatically via the useEffect when isAuthenticated changes
      toast({
        title: "Cadastro realizado com sucesso!",
        description: "Bem-vindo ao MotoControle. Você será redirecionado em instantes.",
      });
      
    } catch (error: any) {
      console.error('Registration error:', error);
      let errorMessage = 'Não foi possível completar o registro. Tente novamente.';
      
      if (error.message?.includes('email already taken') || error.message?.includes('User already registered')) {
        errorMessage = 'Este email já está cadastrado.';
      } else if (error.message?.includes('invalid email')) {
        errorMessage = 'O endereço de email fornecido é inválido.';
      } else if (error.message?.includes('weak password')) {
        errorMessage = 'A senha fornecida é muito fraca. Use pelo menos 8 caracteres com letras maiúsculas, minúsculas e números.';
      }
      
      setRegisterError(errorMessage);
      toast({
        title: "Erro no registro",
        description: errorMessage,
        variant: "destructive",
      });
      
      // If there's an error in step 2, go back to step 1
      if (registrationStep === 2) {
        setRegistrationStep(1);
      }
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
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 p-4">
      <div className="w-full max-w-xl p-8 space-y-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-blue-700">Moto<span className="text-blue-500">Controle</span></h1>
          <p className="mt-2 text-gray-600">Crie sua conta</p>
          
          <div className="flex items-center justify-center mt-4 space-x-2">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${registrationStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
              1
            </div>
            <div className="h-1 w-16 bg-gray-200">
              <div className={`h-full ${registrationStep >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`} style={{ width: registrationStep >= 2 ? '100%' : '0%' }}></div>
            </div>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${registrationStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
              2
            </div>
          </div>
          
          <p className="mt-2 text-sm text-gray-600">
            {registrationStep === 1 ? 'Informações de Acesso' : 'Dados Pessoais'}
          </p>
        </div>
        
        {registerError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erro no cadastro</AlertTitle>
            <AlertDescription>
              {registerError}
            </AlertDescription>
          </Alert>
        )}
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {registrationStep === 1 ? (
              <>
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
                          placeholder="********" 
                          type="password" 
                          autoComplete="new-password"
                          {...field} 
                        />
                      </FormControl>
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
                      <FormLabel>Confirme sua senha</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="********" 
                          type="password" 
                          autoComplete="new-password"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            ) : (
              <>
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Completo</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Seu nome completo" 
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
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="(00) 00000-0000" 
                          type="tel"
                          autoComplete="tel"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="space-y-3 border border-gray-200 rounded-md p-4">
                  <h3 className="font-medium">Endereço</h3>
                  
                  <FormField
                    control={form.control}
                    name="address.street"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rua e Número</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Rua, número, complemento" 
                            autoComplete="street-address"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name="address.city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cidade</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Sua cidade" 
                              autoComplete="address-level2"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="address.state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estado</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="UF" 
                              autoComplete="address-level1"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name="address.zipcode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CEP</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="00000-000" 
                              autoComplete="postal-code"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="address.country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>País</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="País" 
                              autoComplete="country-name"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </>
            )}
            
            <div className="flex justify-between">
              {registrationStep === 2 && (
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setRegistrationStep(1)}
                  disabled={isSubmitting}
                >
                  Voltar
                </Button>
              )}
              
              <Button 
                type="submit" 
                className={registrationStep === 2 ? "ml-auto" : "w-full"}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processando...
                  </>
                ) : registrationStep === 1 ? 'Continuar' : 'Finalizar Cadastro'}
              </Button>
            </div>
          </form>
        </Form>
        
        <div className="text-center mt-4">
          <p className="text-gray-600">
            Já tem uma conta?{' '}
            <Link to="/login" className="text-blue-600 hover:underline">
              Faça login
            </Link>
          </p>
        </div>
      </div>
      
      <div className="mt-8 text-center text-sm text-gray-500 max-w-xl">
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3 flex items-start mb-4">
          <CheckCircle2 className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
          <div className="text-left">
            <p className="text-blue-800 font-medium">Sobre o MotoControle</p>
            <p className="text-blue-700 text-xs mt-1">O MotoControle é uma plataforma completa para controle financeiro e gerenciamento dos seus veículos. Após o cadastro, você terá acesso a todas as funcionalidades e poderá começar a usar o sistema imediatamente.</p>
          </div>
        </div>
        
        <p>• Todos os dados são armazenados com segurança</p>
        <p>• Seu endereço e telefone são usados apenas para contato</p>
        <p>• Não compartilhamos suas informações com terceiros</p>
      </div>
    </div>
  );
};

export default Register;
