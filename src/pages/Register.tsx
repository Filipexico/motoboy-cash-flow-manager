import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import RegisterStepOne from '@/components/auth/RegisterStepOne';
import RegisterStepTwo from '@/components/auth/RegisterStepTwo';
import RegisterLayout from '@/components/auth/RegisterLayout';
import { RegisterFormValues } from '@/types/userProfile';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema } from '@/components/auth/RegisterStepOne';
import { z } from 'zod';

const Register = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<RegisterFormValues>>({});
  const [registerTimer, setRegisterTimer] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { register, isLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      console.log("User is authenticated, redirecting to dashboard");
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleStepOneSubmit = (data: Partial<RegisterFormValues>) => {
    setFormData({ ...formData, ...data });
    setStep(2);
  };

  const handleStepTwoSubmit = async (data: Partial<RegisterFormValues>) => {
    const completeFormData = {
      ...formData,
      ...data,
    } as RegisterFormValues;

    console.log("Address object being sent: ", completeFormData.address);
    console.log("Address object type: ", typeof completeFormData.address);

    try {
      setError(null);
      await register(completeFormData);
      
      // Limpar qualquer timer existente
      if (registerTimer) {
        window.clearTimeout(registerTimer);
      }
      
      // Configurar novo timer de segurança para redirecionamento
      const timer = window.setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
      
      setRegisterTimer(timer as unknown as number);
      
      toast({
        title: "Cadastro realizado com sucesso!",
        description: "Você será redirecionado para o dashboard.",
      });
    } catch (error: any) {
      console.error('Registration error:', error);
      setError(error.message || "Ocorreu um erro ao tentar realizar o cadastro.");
      toast({
        title: "Erro no cadastro",
        description: error.message || "Ocorreu um erro ao tentar realizar o cadastro.",
        variant: "destructive",
      });
    }
  };

  // Limpar o timer quando o componente for desmontado
  useEffect(() => {
    return () => {
      if (registerTimer) {
        window.clearTimeout(registerTimer);
      }
    };
  }, [registerTimer]);

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
        country: '',
      },
      lgpdConsent: false,
    },
  });

  return (
    <RegisterLayout step={step as 1 | 2} error={error}>
      {step === 1 ? (
        <RegisterStepOne 
          form={form} 
          showPassword={showPassword}
          showConfirmPassword={showConfirmPassword}
          setShowPassword={setShowPassword}
          setShowConfirmPassword={setShowConfirmPassword}
        />
      ) : (
        <RegisterStepTwo 
          form={form}
        />
      )}
    </RegisterLayout>
  );
};

export default Register;
