
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { checkSubscription } from '../subscriptionService';
import { supabase } from '@/lib/supabase';
import { User } from '@/types';

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
    },
    functions: {
      invoke: vi.fn(),
    },
  },
}));

describe('subscriptionService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('checkSubscription', () => {
    const mockUser: User = {
      id: '123',
      email: 'test@example.com',
      isAdmin: false,
      isSubscribed: false,
      subscriptionTier: null,
      subscriptionEnd: null,
      subscriptionEndDate: null,
      displayName: 'Test User',
      name: 'Test User',
    };

    const setUser = vi.fn();

    it('should update user subscription status when session exists', async () => {
      vi.mocked(supabase.auth.getSession).mockResolvedValueOnce({
        data: { 
          session: { 
            user: { id: '123' } 
          } 
        },
        error: null,
      } as any);

      vi.mocked(supabase.functions.invoke).mockResolvedValueOnce({
        data: {
          subscribed: true,
          subscription_tier: 'premium',
          subscription_end: '2025-12-31',
        },
        error: null,
      } as any);

      await checkSubscription(mockUser, setUser);

      expect(setUser).toHaveBeenCalledWith(expect.objectContaining({
        isSubscribed: true,
        subscriptionTier: 'premium',
        subscriptionEnd: '2025-12-31',
      }));
    });

    it('should handle no active session', async () => {
      vi.mocked(supabase.auth.getSession).mockResolvedValueOnce({
        data: { session: null },
        error: null,
      } as any);

      await checkSubscription(mockUser, setUser);

      expect(setUser).not.toHaveBeenCalled();
    });
  });
});
