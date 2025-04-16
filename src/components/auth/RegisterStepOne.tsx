
import React from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import { z } from 'zod';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

interface RegisterStepOneProps {
  form: UseFormReturn<z.infer<typeof registerSchema>>;
  showPassword: boolean;
  showConfirmPassword: boolean;
  setShowPassword: (show: boolean) => void;
  setShowConfirmPassword: (show: boolean) => void;
}

export const registerSchema = z.object({
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
  lgpdConsent: z.boolean().refine(value => value === true, {
    message: 'Você precisa aceitar os termos da LGPD para continuar',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
});

const RegisterStepOne: React.FC<RegisterStepOneProps> = ({
  form,
  showPassword,
  showConfirmPassword,
  setShowPassword,
  setShowConfirmPassword,
}) => {
  return (
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
            <FormLabel>Confirme sua senha</FormLabel>
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
    </>
  );
};

export default RegisterStepOne;
