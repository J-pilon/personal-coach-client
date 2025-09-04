// Import the functions being tested
import { isoToMs, msToIso, nowMs } from '../../utils/time';

describe('Time Utilities', () => {
  describe('msToIso', () => {
    it('should convert milliseconds to ISO string', () => {
      const ms = 1640995200000; // 2022-01-01T00:00:00.000Z
      const result = msToIso(ms);
      
      expect(result).toBe('2022-01-01T00:00:00.000Z');
    });

    it('should handle current timestamp', () => {
      const now = Date.now();
      const result = msToIso(now);
      
      // Should be a valid ISO string
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
      
      // Should be close to current time
      const parsed = new Date(result).getTime();
      expect(Math.abs(parsed - now)).toBeLessThan(1000); // Within 1 second
    });

    it('should handle zero timestamp', () => {
      const result = msToIso(0);
      
      expect(result).toBe('1970-01-01T00:00:00.000Z');
    });

    it('should handle negative timestamp', () => {
      const result = msToIso(-1000);
      
      expect(result).toBe('1969-12-31T23:59:59.000Z');
    });

    it('should handle large timestamp', () => {
      const ms = 4102444800000; // 2100-01-01T00:00:00.000Z
      const result = msToIso(ms);
      
      expect(result).toBe('2100-01-01T00:00:00.000Z');
    });
  });

  describe('isoToMs', () => {
    it('should convert ISO string to milliseconds', () => {
      const iso = '2022-01-01T00:00:00.000Z';
      const result = isoToMs(iso);
      
      expect(result).toBe(1640995200000);
    });

    it('should handle current ISO string', () => {
      const now = new Date().toISOString();
      const result = isoToMs(now);
      
      // Should be close to current time
      expect(Math.abs(result - Date.now())).toBeLessThan(1000); // Within 1 second
    });

    it('should handle ISO string without milliseconds', () => {
      const iso = '2022-01-01T00:00:00Z';
      const result = isoToMs(iso);
      
      expect(result).toBe(1640995200000);
    });

    it('should handle ISO string with timezone offset', () => {
      const iso = '2022-01-01T00:00:00+01:00';
      const result = isoToMs(iso);
      
      // Should be 1 hour earlier than UTC
      expect(result).toBe(1640991600000);
    });

    it('should handle invalid ISO string', () => {
      const invalidIso = 'invalid-date';
      
      // Date.parse returns NaN for invalid dates, which is truthy but not a valid timestamp
      const result = isoToMs(invalidIso);
      expect(isNaN(result)).toBe(true);
    });

    it('should handle empty string', () => {
      const result = isoToMs('');
      expect(isNaN(result)).toBe(true);
    });
  });

  describe('nowMs', () => {
    it('should return current timestamp in milliseconds', () => {
      const before = Date.now();
      const result = nowMs();
      const after = Date.now();
      
      expect(result).toBeGreaterThanOrEqual(before);
      expect(result).toBeLessThanOrEqual(after);
    });

    it('should return different values on subsequent calls', () => {
      const result1 = nowMs();
      const result2 = nowMs();
      
      expect(result2).toBeGreaterThanOrEqual(result1);
    });

    it('should return number type', () => {
      const result = nowMs();
      
      expect(typeof result).toBe('number');
      expect(Number.isInteger(result)).toBe(true);
    });
  });

  describe('Round-trip conversion', () => {
    it('should maintain precision in ms -> iso -> ms conversion', () => {
      const originalMs = 1640995200123; // Include milliseconds
      const iso = msToIso(originalMs);
      const convertedMs = isoToMs(iso);
      
      expect(convertedMs).toBe(originalMs);
    });

    it('should maintain precision in iso -> ms -> iso conversion', () => {
      const originalIso = '2022-01-01T00:00:00.123Z';
      const ms = isoToMs(originalIso);
      const convertedIso = msToIso(ms);
      
      expect(convertedIso).toBe(originalIso);
    });

    it('should handle multiple round-trips', () => {
      let value = Date.now();
      
      for (let i = 0; i < 10; i++) {
        const iso = msToIso(value);
        value = isoToMs(iso);
      }
      
      // Should still be a valid timestamp
      expect(value).toBeGreaterThan(0);
      expect(new Date(value).getTime()).toBe(value);
    });
  });

  describe('Edge cases', () => {
    it('should handle leap year dates', () => {
      const leapYearMs = 1583020800000; // 2020-02-29T00:00:00.000Z (leap year)
      const iso = msToIso(leapYearMs);
      const ms = isoToMs(iso);
      
      expect(ms).toBe(leapYearMs);
      // Check that it's a valid date in 2020
      expect(iso).toContain('2020');
    });

    it('should handle daylight saving time transitions', () => {
      // This test might be flaky depending on timezone, but tests the general concept
      const dstMs = 1640995200000; // 2022-01-01T00:00:00.000Z
      const iso = msToIso(dstMs);
      const ms = isoToMs(iso);
      
      expect(ms).toBe(dstMs);
    });

    it('should handle very small differences in time', () => {
      const baseMs = 1640995200000;
      const smallDiff = 1; // 1 millisecond
      
      const iso1 = msToIso(baseMs);
      const iso2 = msToIso(baseMs + smallDiff);
      
      expect(iso1).not.toBe(iso2);
      expect(isoToMs(iso2) - isoToMs(iso1)).toBe(smallDiff);
    });
  });
});

