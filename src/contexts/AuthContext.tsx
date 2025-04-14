
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, AuthState } from '@/types';
import { findUserByEmail, createUser } from '@/lib/data/users';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, name: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  // Check for saved session on mount
  useEffect(() => {
    const checkAuth = () => {
      const savedUser = localStorage.getItem('motocontrole-user');
      if (savedUser) {
        try {
          const user = JSON.parse(savedUser) as User;
          setAuthState({
            user,
            isLoading: false,
            isAuthenticated: true,
          });
        } catch (error) {
          console.error('Error parsing saved user:', error);
          localStorage.removeItem('motocontrole-user');
          setAuthState({
            user: null,
            isLoading: false,
            isAuthenticated: false,
          });
        }
      } else {
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
        });
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // In a real app, this would be an API call
      // For demo purposes, we're just checking if the user exists
      const user = findUserByEmail(email);
      
      if (!user) {
        toast({
          title: 'Erro no login',
          description: 'Usuário não encontrado.',
          variant: 'destructive',
        });
        return false;
      }

      // In a real app, we would validate the password here
      // For demo purposes, we're accepting any password

      // Save user to localStorage for persistence
      localStorage.setItem('motocontrole-user', JSON.stringify(user));
      
      setAuthState({
        user,
        isLoading: false,
        isAuthenticated: true,
      });
      
      toast({
        title: 'Login realizado',
        description: `Bem-vindo de volta, ${user.name}!`,
      });
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: 'Erro no login',
        description: 'Ocorreu um erro durante o login.',
        variant: 'destructive',
      });
      return false;
    }
  };

  const register = async (email: string, name: string, password: string): Promise<boolean> => {
    try {
      // Check if user already exists
      const existingUser = findUserByEmail(email);
      if (existingUser) {
        toast({
          title: 'Erro no cadastro',
          description: 'Este email já está em uso.',
          variant: 'destructive',
        });
        return false;
      }

      // Create new user
      // In a real app, this would be an API call
      const newUser = createUser(email, name);
      
      // Save user to localStorage for persistence
      localStorage.setItem('motocontrole-user', JSON.stringify(newUser));
      
      setAuthState({
        user: newUser,
        isLoading: false,
        isAuthenticated: true,
      });
      
      toast({
        title: 'Cadastro realizado',
        description: `Bem-vindo, ${name}!`,
      });
      
      return true;
    } catch (error) {
      console.error('Register error:', error);
      toast({
        title: 'Erro no cadastro',
        description: 'Ocorreu um erro durante o cadastro.',
        variant: 'destructive',
      });
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('motocontrole-user');
    setAuthState({
      user: null,
      isLoading: false,
      isAuthenticated: false,
    });
    navigate('/login');
    toast({
      title: 'Logout realizado',
      description: 'Você foi desconectado com sucesso.',
    });
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
