
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loginUser, registerUser, logoutUser } from '../authService';
import { supabase } from '@/lib/supabase';
import { AuthError } from '@supabase/supabase-js';
import { setupNewUserData } from '../userService';

// Mock the userService
vi.mock('../userService', () => ({
  setupNewUserData: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
    },
  },
}));

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('loginUser', () => {
    it('should successfully login a user', async () => {
      const mockUser = { email: 'test@example.com' };
      const mockResponse = {
        data: {
          user: mockUser,
          session: { user: mockUser },
        },
        error: null,
      };
      
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValueOnce(mockResponse as any);
      
      const result = await loginUser('test@example.com', 'password123');
      
      expect(result).toEqual(mockResponse.data);
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    it('should throw error on login failure', async () => {
      // Create a partial AuthError that TypeScript will accept
      const mockError = new Error('Invalid credentials') as Partial<AuthError>;
      mockError.name = 'AuthApiError';
      mockError.message = 'Invalid credentials';
      mockError.status = 401;
      // Avoid setting protected properties directly
      
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValueOnce({ 
        data: { user: null, session: null }, 
        error: mockError as AuthError
      } as any);
      
      await expect(loginUser('test@example.com', 'wrong-password')).rejects.toEqual(mockError);
    });
  });

  describe('registerUser', () => {
    it('should successfully register a new user', async () => {
      const mockUser = { id: '123', email: 'new@example.com' };
      const mockResponse = {
        data: {
          user: mockUser,
          session: { user: mockUser },
        },
        error: null,
      };
      
      vi.mocked(supabase.auth.signUp).mockResolvedValueOnce(mockResponse as any);
      
      const result = await registerUser('new@example.com', 'password123', 'Test User');
      
      expect(result).toEqual(mockResponse.data);
      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'new@example.com',
        password: 'password123',
        options: {
          data: {
            display_name: 'Test User',
          },
        },
      });
      expect(setupNewUserData).toHaveBeenCalledWith('123', 'new@example.com');
    });

    it('should throw error on registration failure', async () => {
      // Create a partial AuthError that TypeScript will accept
      const mockError = new Error('Email already exists') as Partial<AuthError>;
      mockError.name = 'AuthApiError';
      mockError.message = 'Email already exists';
      mockError.status = 400;
      // Avoid setting protected properties directly
      
      vi.mocked(supabase.auth.signUp).mockResolvedValueOnce({ 
        data: { user: null, session: null }, 
        error: mockError as AuthError 
      } as any);
      
      await expect(registerUser('existing@example.com', 'password123')).rejects.toEqual(mockError);
    });
  });

  describe('logoutUser', () => {
    it('should successfully log out a user', async () => {
      vi.mocked(supabase.auth.signOut).mockResolvedValueOnce({ error: null } as any);
      
      await expect(logoutUser()).resolves.not.toThrow();
      expect(supabase.auth.signOut).toHaveBeenCalled();
    });

    it('should throw error on logout failure', async () => {
      const mockError = new Error('Logout failed') as Partial<AuthError>;
      mockError.message = 'Logout failed';
      
      vi.mocked(supabase.auth.signOut).mockResolvedValueOnce({ error: mockError as AuthError } as any);
      
      await expect(logoutUser()).rejects.toEqual(mockError);
    });
  });
});
