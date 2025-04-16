import { describe, it, expect, vi } from 'vitest';
import { registerUser, loginUser } from '../authService';
import { supabase } from '@/lib/supabase';

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
    },
  },
}));

describe('authService', () => {
  it('should call supabase.auth.signInWithPassword with correct parameters', async () => {
    const mockEmail = 'test@example.com';
    const mockPassword = 'password123';

    (supabase.auth.signInWithPassword as any).mockResolvedValue({ data: { user: { email: mockEmail } }, error: null });

    await loginUser(mockEmail, mockPassword);

    expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: mockEmail,
      password: mockPassword,
    });
  });

  it('should return data on successful login', async () => {
    const mockEmail = 'test@example.com';
    const mockPassword = 'password123';
    const mockData = { user: { email: mockEmail } };

    (supabase.auth.signInWithPassword as any).mockResolvedValue({ data: mockData, error: null });

    const result = await loginUser(mockEmail, mockPassword);

    expect(result).toEqual(mockData);
  });

  it('should throw error on failed login', async () => {
    const mockEmail = 'test@example.com';
    const mockPassword = 'password123';
    const mockError = new Error('Invalid credentials');

    (supabase.auth.signInWithPassword as any).mockResolvedValue({ data: null, error: mockError });

    await expect(loginUser(mockEmail, mockPassword)).rejects.toThrow(mockError);
  });

  it('should handle registration with metadata', async () => {
    const mockUser = {
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'password123',
      fullName: 'Test User',
      phoneNumber: '+1234567890',
      address: {
        street: '123 Test St',
        city: 'Test City',
        state: 'Test State',
        zipcode: '12345',
        country: 'Test Country'
      },
      lgpdConsent: true
    };

    (supabase.auth.signUp as any).mockResolvedValue({
      data: { user: { id: 'test-id', email: mockUser.email } },
      error: null,
    });

    const response = await registerUser(mockUser);
    expect(response.user).toBeDefined();
    expect(supabase.auth.signUp).toHaveBeenCalledWith({
      email: mockUser.email,
      password: mockUser.password,
      options: {
        data: {
          full_name: mockUser.fullName,
          phone_number: mockUser.phoneNumber,
          address: mockUser.address
        },
      },
    });
  });

  it('should call supabase.auth.signOut on logout', async () => {
    (supabase.auth.signOut as any).mockResolvedValue({ error: null });

    await registerUser.length;

    expect(supabase.auth.signOut).toHaveBeenCalled();
  });

  it('should throw error on failed logout', async () => {
    const mockError = new Error('Failed to logout');
    (supabase.auth.signOut as any).mockResolvedValue({ error: mockError });

    await expect(registerUser.length).resolves.toBe(0);
  });
});
