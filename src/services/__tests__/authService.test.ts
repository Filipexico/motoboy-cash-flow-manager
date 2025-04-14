
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loginUser, registerUser, logoutUser } from '../authService';
import { supabase } from '@/lib/supabase';

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
      const mockSession = { user: mockUser };
      const mockResponse = { data: { user: mockUser, session: mockSession }, error: null };
      
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValueOnce(mockResponse);
      
      const result = await loginUser('test@example.com', 'password123');
      
      expect(result).toEqual(mockResponse.data);
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    it('should throw error on login failure', async () => {
      const mockError = { message: 'Invalid credentials', code: 'invalid_credentials', status: 401, __isAuthError: true };
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValueOnce({ 
        data: { user: null, session: null }, 
        error: mockError 
      });
      
      await expect(loginUser('test@example.com', 'wrong-password')).rejects.toEqual(mockError);
    });
  });

  describe('registerUser', () => {
    it('should successfully register a new user', async () => {
      const mockUser = { id: '123', email: 'new@example.com' };
      const mockSession = { user: mockUser };
      const mockResponse = { data: { user: mockUser, session: mockSession }, error: null };
      
      vi.mocked(supabase.auth.signUp).mockResolvedValueOnce(mockResponse);
      
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
    });

    it('should throw error on registration failure', async () => {
      const mockError = { message: 'Email already exists', code: 'email_taken', status: 400, __isAuthError: true };
      vi.mocked(supabase.auth.signUp).mockResolvedValueOnce({ 
        data: { user: null, session: null }, 
        error: mockError 
      });
      
      await expect(registerUser('existing@example.com', 'password123')).rejects.toEqual(mockError);
    });
  });
});
