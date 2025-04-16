
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { z } from 'zod';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { registerSchema } from './RegisterStepOne';

interface RegisterStepTwoProps {
  form: UseFormReturn<z.infer<typeof registerSchema>>;
}

const RegisterStepTwo: React.FC<RegisterStepTwoProps> = ({ form }) => {
  return (
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
      
      <FormField
        control={form.control}
        name="lgpdConsent"
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
                Consentimento LGPD
              </FormLabel>
              <FormDescription>
                Concordo com a coleta e processamento dos meus dados pessoais de acordo com a Lei Geral de Proteção de Dados (LGPD). 
                Entendo que meus dados serão utilizados apenas para fins específicos relacionados ao serviço e que posso solicitar 
                acesso, correção ou exclusão dos meus dados a qualmomento.
              </FormDescription>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

export default RegisterStepTwo;
