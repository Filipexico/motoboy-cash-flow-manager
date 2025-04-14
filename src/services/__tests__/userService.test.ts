
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setupNewUserData } from '../userService';
import { supabase } from '@/lib/supabase';

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockReturnThis(),
  },
}));

describe('userService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('setupNewUserData', () => {
    it('should create subscriber record and default categories', async () => {
      // Setup mocks for subscriber creation
      const mockFromSubscribers = vi.fn().mockReturnValue({
        insert: vi.fn().mockResolvedValue({ error: null }),
      });
      
      // Setup mocks for categories creation
      const mockFromCategories = vi.fn().mockReturnValue({
        insert: vi.fn().mockResolvedValue({ error: null }),
      });
      
      // Mock the supabase.from method to return different responses based on table name
      vi.mocked(supabase.from).mockImplementation((tableName) => {
        if (tableName === 'subscribers') {
          return mockFromSubscribers() as any;
        } else if (tableName === 'expense_categories') {
          return mockFromCategories() as any;
        }
        return {} as any;
      });

      await setupNewUserData('user-123', 'test@example.com');

      // Check if subscribers table was called with correct data
      expect(mockFromSubscribers).toHaveBeenCalled();
      expect(mockFromCategories).toHaveBeenCalled();
    });

    it('should handle errors during setup', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      // Mock subscriber error
      const mockFromSubscribers = vi.fn().mockReturnValue({
        insert: vi.fn().mockResolvedValue({ error: { message: 'Subscriber error' } }),
      });
      
      vi.mocked(supabase.from).mockImplementation((tableName) => {
        if (tableName === 'subscribers') {
          return mockFromSubscribers() as any;
        }
        return {} as any;
      });

      await setupNewUserData('user-123', 'test@example.com');

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Erro ao criar registro de assinante:',
        { message: 'Subscriber error' }
      );
      
      consoleErrorSpy.mockRestore();
    });
  });
});
