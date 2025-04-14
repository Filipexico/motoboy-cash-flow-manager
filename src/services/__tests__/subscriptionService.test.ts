
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
    };

    const setUser = vi.fn();

    it('should update user subscription status when session exists', async () => {
      vi.mocked(supabase.auth.getSession).mockResolvedValueOnce({
        data: { session: { user: { id: '123' } } },
        error: null,
      });

      vi.mocked(supabase.functions.invoke).mockResolvedValueOnce({
        data: {
          subscribed: true,
          subscription_tier: 'premium',
          subscription_end: '2025-12-31',
        },
        error: null,
      });

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
      });

      await checkSubscription(mockUser, setUser);

      expect(setUser).not.toHaveBeenCalled();
    });

    it('should handle subscription check error', async () => {
      vi.mocked(supabase.auth.getSession).mockResolvedValueOnce({
        data: { session: { user: { id: '123' } } },
        error: null,
      });

      vi.mocked(supabase.functions.invoke).mockResolvedValueOnce({
        data: null,
        error: new Error('Subscription check failed'),
      });

      const consoleErrorSpy = vi.spyOn(console, 'error');
      await checkSubscription(mockUser, setUser);

      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(setUser).not.toHaveBeenCalled();
    });
  });
});
