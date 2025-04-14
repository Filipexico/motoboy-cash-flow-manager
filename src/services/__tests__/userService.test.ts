
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setupNewUserData } from '../userService';
import { supabase } from '@/lib/supabase';

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn().mockReturnThis(),
    insert: vi.fn(),
  },
}));

describe('userService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('setupNewUserData', () => {
    it('should setup default data for new user', async () => {
      const mockUserId = '123';
      const mockEmail = 'test@example.com';
      
      vi.mocked(supabase.from).mockImplementation((table) => ({
        insert: vi.fn().mockResolvedValue({ error: null }),
        from: vi.fn(),
      }));

      await setupNewUserData(mockUserId, mockEmail);

      expect(supabase.from).toHaveBeenCalledWith('subscribers');
      expect(supabase.from).toHaveBeenCalledWith('expense_categories');
    });

    it('should handle errors during setup', async () => {
      const mockError = new Error('Database error');
      vi.mocked(supabase.from).mockImplementation((table) => ({
        insert: vi.fn().mockResolvedValue({ error: mockError }),
        from: vi.fn(),
      }));

      const consoleErrorSpy = vi.spyOn(console, 'error');
      await setupNewUserData('123', 'test@example.com');

      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });
});
