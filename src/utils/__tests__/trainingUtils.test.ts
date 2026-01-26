import { getLevelColor, getLevelName, calculateCompletionRate } from '../trainingUtils';

describe('trainingUtils', () => {
  describe('getLevelColor', () => {
    it('returns correct color for L1 level', () => {
      const color = getLevelColor('L1');
      expect(color).toContain('bg-green-100');
      expect(color).toContain('text-green-800');
    });

    it('returns correct color for L2 level', () => {
      const color = getLevelColor('L2');
      expect(color).toContain('bg-yellow-100');
      expect(color).toContain('text-yellow-800');
    });

    it('returns correct color for L3 level', () => {
      const color = getLevelColor('L3');
      expect(color).toContain('bg-red-100');
      expect(color).toContain('text-red-800');
    });

    it('returns default color for unknown level', () => {
      const color = getLevelColor('L4');
      expect(color).toContain('bg-gray-100');
      expect(color).toContain('text-gray-800');
    });
  });

  describe('getLevelName', () => {
    it('returns Beginner for L1', () => {
      expect(getLevelName('L1')).toBe('Beginner');
    });

    it('returns Intermediate for L2', () => {
      expect(getLevelName('L2')).toBe('Intermediate');
    });

    it('returns Advanced for L3', () => {
      expect(getLevelName('L3')).toBe('Advanced');
    });

    it('returns Unknown for invalid level', () => {
      expect(getLevelName('L999')).toBe('Unknown');
      expect(getLevelName('')).toBe('Unknown');
      expect(getLevelName('invalid')).toBe('Unknown');
    });
  });

  describe('calculateCompletionRate', () => {
    it('calculates completion rate correctly', () => {
      const rate = calculateCompletionRate(6, 4);
      expect(rate).toBe(40); // 4 / (6 + 4) * 100 = 40
    });

    it('returns 100 when all completed', () => {
      const rate = calculateCompletionRate(0, 10);
      expect(rate).toBe(100);
    });

    it('returns 0 when none completed', () => {
      const rate = calculateCompletionRate(10, 0);
      expect(rate).toBe(0);
    });

    it('returns 0 when both enrolled and completed are 0', () => {
      const rate = calculateCompletionRate(0, 0);
      expect(rate).toBe(0);
    });

    it('handles decimal results correctly', () => {
      const rate = calculateCompletionRate(6, 3);
      expect(rate).toBeCloseTo(33.33, 1);
    });

    it('calculates rate with equal enrolled and completed', () => {
      const rate = calculateCompletionRate(5, 5);
      expect(rate).toBe(50);
    });

    it('handles large numbers correctly', () => {
      const rate = calculateCompletionRate(1000, 500);
      expect(rate).toBeCloseTo(33.33, 1);
    });
  });
});
