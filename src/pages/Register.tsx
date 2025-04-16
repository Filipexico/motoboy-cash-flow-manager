
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ChevronRight } from 'lucide-react';
import { RegisterFormValues } from '@/types/userProfile';
import RegisterLayout from '@/components/auth/RegisterLayout';
import RegisterStepOne, { registerSchema } from '@/components/auth/RegisterStepOne';
import RegisterStepTwo from '@/components/auth/RegisterStepTwo';

const Register = () => {
  const { register: registerUser, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [registrationStep, setRegistrationStep] = useState<1 | 2>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
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
        street: '',
        city: '',
        state: '',
        zipcode: '',
        country: 'Brasil',
      },
      lgpdConsent: false,
    },
  });

  const onSubmit = async (data: z.infer<typeof registerSchema>) => {
    if (registrationStep === 1) {
      setRegistrationStep(2);
      return;
    }
    
    try {
      setRegisterError(null);
      setIsSubmitting(true);
      
      const formValues: RegisterFormValues = {
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
        fullName: data.fullName,
        phoneNumber: data.phoneNumber,
        address: {
          street: data.address.street,
          city: data.address.city,
          state: data.address.state,
          zipcode: data.address.zipcode,
          country: data.address.country,
        },
        lgpdConsent: data.lgpdConsent
      };
      
      await registerUser(formValues);
      
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
      
      if (registrationStep === 2) {
        setRegistrationStep(1);
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
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
    <RegisterLayout step={registrationStep} error={registerError}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {registrationStep === 1 ? (
            <RegisterStepOne
              form={form}
              showPassword={showPassword}
              showConfirmPassword={showConfirmPassword}
              setShowPassword={setShowPassword}
              setShowConfirmPassword={setShowConfirmPassword}
            />
          ) : (
            <RegisterStepTwo form={form} />
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
              ) : registrationStep === 1 ? (
                <>
                  Continuar
                  <ChevronRight className="ml-2 h-4 w-4" />
                </>
              ) : 'Finalizar Cadastro'}
            </Button>
          </div>
        </form>
      </Form>
    </RegisterLayout>
  );
};

export default Register;
