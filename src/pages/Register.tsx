
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { AlertCircle, CheckCircle2, Eye, EyeOff, Search } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { PopoverContent, Popover, PopoverTrigger } from '@/components/ui/popover';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { registerSchema } from '@/components/auth/RegisterStepOne';
import RegisterStepOne from '@/components/auth/RegisterStepOne';
import RegisterStepTwo from '@/components/auth/RegisterStepTwo';

// Type for form values
export type RegisterFormValues = z.infer<typeof registerSchema>;

// Country codes for international phone numbers
const countryCodes = [
  { code: '+55', country: 'BR', name: 'Brasil' },
  { code: '+1', country: 'US', name: 'Estados Unidos' },
  { code: '+351', country: 'PT', name: 'Portugal' },
  { code: '+44', country: 'GB', name: 'Reino Unido' },
  { code: '+34', country: 'ES', name: 'Espanha' },
  { code: '+49', country: 'DE', name: 'Alemanha' },
  { code: '+33', country: 'FR', name: 'França' },
  { code: '+39', country: 'IT', name: 'Itália' },
];

const Register = () => {
  const { register: registerUser, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [selectedCountryCode, setSelectedCountryCode] = useState('+55');
  const [isLoadingCEP, setIsLoadingCEP] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Initialize the form
  const form = useForm<RegisterFormValues>({
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

  // Calculate password strength
  const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    
    if (password.length >= 8) strength += 20;
    if (password.match(/[A-Z]/)) strength += 20;
    if (password.match(/[a-z]/)) strength += 20;
    if (password.match(/[0-9]/)) strength += 20;
    if (password.match(/[^A-Za-z0-9]/)) strength += 20;
    
    setPasswordStrength(strength);
  };

  // Watch password field for strength calculation
  const password = form.watch('password');
  useEffect(() => {
    calculatePasswordStrength(password);
  }, [password]);

  // Lookup postal code (CEP)
  const lookupPostalCode = async (cep: string) => {
    if (!cep || cep.length !== 8) return;
    
    setIsLoadingCEP(true);
    try {
      const formattedCep = cep.replace(/\D/g, '');
      const response = await fetch(`https://viacep.com.br/ws/${formattedCep}/json/`);
      const data = await response.json();
      
      if (!data.erro) {
        form.setValue('address.street', `${data.logradouro}${data.complemento ? ', ' + data.complemento : ''}`);
        form.setValue('address.city', data.localidade);
        form.setValue('address.state', data.uf);
      } else {
        toast({
          title: "CEP não encontrado",
          description: "O CEP informado não foi encontrado. Por favor, verifique e tente novamente.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching CEP data:', error);
      toast({
        title: "Erro ao buscar CEP",
        description: "Não foi possível consultar o CEP. Por favor, preencha o endereço manualmente.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingCEP(false);
    }
  };

  // Handle form submission
  const onSubmit = async (data: RegisterFormValues) => {
    try {
      setIsSubmitting(true);
      setRegisterError(null);
      
      // Format phone number with country code
      const phoneWithCountryCode = `${selectedCountryCode} ${data.phoneNumber}`;
      
      // Register the user
      await registerUser({
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
        fullName: data.fullName,
        phoneNumber: phoneWithCountryCode,
        address: data.address,
        lgpdConsent: data.lgpdConsent
      });
      
      toast({
        title: "Cadastro realizado com sucesso!",
        description: "Bem-vindo ao MotoControle. Você será redirecionado em instantes.",
      });
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
      
    } catch (error: any) {
      console.error('Registration error:', error);
      let errorMessage = 'Não foi possível completar o registro. Tente novamente.';
      
      if (error.message?.includes('email already taken')) {
        errorMessage = 'Este email já está cadastrado.';
      } else if (error.message?.includes('Database error')) {
        errorMessage = 'Erro ao salvar dados no banco. Por favor, tente novamente.';
      }
      
      setRegisterError(errorMessage);
      toast({
        title: "Erro no registro",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // CEP input handler
  const handleCepBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const cep = e.target.value.replace(/\D/g, '');
    if (cep.length === 8) {
      lookupPostalCode(cep);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 p-4">
      <div className="w-full max-w-2xl p-8 space-y-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-blue-700">Moto<span className="text-blue-500">Controle</span></h1>
          <p className="mt-2 text-gray-600">Crie sua conta</p>
        </div>

        {registerError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erro no cadastro</AlertTitle>
            <AlertDescription>{registerError}</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Informações de acesso</h3>
              <Separator />
              
              <RegisterStepOne 
                form={form}
                showPassword={showPassword}
                showConfirmPassword={showConfirmPassword}
                setShowPassword={setShowPassword}
                setShowConfirmPassword={setShowConfirmPassword}
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Informações pessoais</h3>
              <Separator />
              
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome Completo</FormLabel>
                    <FormControl>
                      <Input placeholder="João da Silva" {...field} />
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
                    <div className="flex">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-[120px] justify-between flex items-center"
                            type="button"
                          >
                            <img 
                              src={`https://flagcdn.com/24x18/${countryCodes.find(c => c.code === selectedCountryCode)?.country.toLowerCase()}.png`} 
                              alt="Country flag" 
                              className="h-4 mr-2" 
                            />
                            {selectedCountryCode}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[250px] p-2">
                          <div className="grid gap-1">
                            <h4 className="font-medium mb-2">Selecione o país</h4>
                            <RadioGroup
                              value={selectedCountryCode}
                              onValueChange={setSelectedCountryCode}
                            >
                              {countryCodes.map((country) => (
                                <div key={country.code} className="flex items-center space-x-2 rounded-md px-2 py-1 hover:bg-gray-100">
                                  <RadioGroupItem value={country.code} id={country.code} />
                                  <img 
                                    src={`https://flagcdn.com/24x18/${country.country.toLowerCase()}.png`} 
                                    alt={country.name} 
                                    className="h-4 mr-2" 
                                  />
                                  <label htmlFor={country.code} className="text-sm flex-1 cursor-pointer">
                                    {country.name} ({country.code})
                                  </label>
                                </div>
                              ))}
                            </RadioGroup>
                          </div>
                        </PopoverContent>
                      </Popover>
                      <FormControl>
                        <Input className="flex-1" placeholder="(00) 00000-0000" {...field} />
                      </FormControl>
                    </div>
                    <FormDescription className="text-xs">
                      Selecione o código do país e digite apenas os números do telefone.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Endereço</h3>
              <Separator />
              
              <FormField
                control={form.control}
                name="address.zipcode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CEP</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input 
                          placeholder="00000-000" 
                          {...field} 
                          onBlur={handleCepBlur}
                        />
                      </FormControl>
                      {isLoadingCEP && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <div className="h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      )}
                      {!isLoadingCEP && (
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                          onClick={() => lookupPostalCode(field.value)}
                        >
                          <Search size={16} />
                        </button>
                      )}
                    </div>
                    <FormDescription className="text-xs">
                      Digite o CEP para preencher o endereço automaticamente
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address.street"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rua, Número e Complemento</FormLabel>
                    <FormControl>
                      <Input placeholder="Av. Brasil, 123, Apto 101" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="address.city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cidade</FormLabel>
                      <FormControl>
                        <Input placeholder="São Paulo" {...field} />
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
                        <Input placeholder="SP" {...field} />
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
                        <Input placeholder="Brasil" {...field} />
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
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 mt-6 p-4 border border-gray-200 rounded-md">
                  <FormControl>
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Concordo com os termos de uso e política de privacidade
                    </FormLabel>
                    <FormDescription className="text-xs">
                      Concordo com a coleta e processamento dos meus dados de acordo com a LGPD. 
                      Entendo que posso solicitar acesso, correção ou exclusão dos meus dados a qualquer momento.
                    </FormDescription>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Registrando...' : 'Criar Conta'}
            </Button>
          </form>
        </Form>

        <div className="text-center mt-6">
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
