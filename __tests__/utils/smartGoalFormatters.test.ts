import {
  TIMEFRAME_MAPPER,
  TIMEFRAME_OPTIONS,
  formatTimeframeForAiResponse,
  getServerTimeframe,
  validateGoalData,
  type TimeframeOption
} from '../../utils/smartGoalFormatters';

describe('smartGoalFormatters', () => {
  describe('TIMEFRAME_OPTIONS', () => {
    it('should have the correct structure for each option', () => {
      TIMEFRAME_OPTIONS.forEach((option: TimeframeOption) => {
        expect(option).toHaveProperty('label');
        expect(option).toHaveProperty('value');
        expect(option).toHaveProperty('serverValue');
        expect(typeof option.label).toBe('string');
        expect(typeof option.value).toBe('string');
        expect(typeof option.serverValue).toBe('string');
      });
    });

    it('should have 3 timeframe options', () => {
      expect(TIMEFRAME_OPTIONS).toHaveLength(3);
    });

    it('should include all expected timeframes', () => {
      const values = TIMEFRAME_OPTIONS.map(opt => opt.value);
      expect(values).toContain('1 month');
      expect(values).toContain('3 months');
      expect(values).toContain('6 months');
    });
  });

  describe('TIMEFRAME_MAPPER', () => {
    it('should map user-friendly timeframes to AI response keys', () => {
      expect(TIMEFRAME_MAPPER['1 month']).toBe('one_month');
      expect(TIMEFRAME_MAPPER['3 months']).toBe('three_month');
      expect(TIMEFRAME_MAPPER['6 months']).toBe('six_month');
    });
  });

  describe('formatTimeframeForAiResponse', () => {
    const mockAiResponse = {
      response: {
        one_month: {
          specific: 'Specific goal for 1 month',
          measurable: 'Measurable goal for 1 month',
          achievable: 'Achievable goal for 1 month',
          relevant: 'Relevant goal for 1 month',
          time_bound: 'Time bound goal for 1 month'
        },
        three_month: {
          specific: 'Specific goal for 3 months',
          measurable: 'Measurable goal for 3 months',
          achievable: 'Achievable goal for 3 months',
          relevant: 'Relevant goal for 3 months',
          time_bound: 'Time bound goal for 3 months'
        }
      }
    };

    it('should format AI response for 1 month timeframe', () => {
      const result = formatTimeframeForAiResponse('1 month', mockAiResponse);
      
      expect(result).toEqual({
        specific: 'Specific goal for 1 month',
        measurable: 'Measurable goal for 1 month',
        achievable: 'Achievable goal for 1 month',
        relevant: 'Relevant goal for 1 month',
        time_bound: 'Time bound goal for 1 month'
      });
    });

    it('should format AI response for 3 months timeframe', () => {
      const result = formatTimeframeForAiResponse('3 months', mockAiResponse);
      
      expect(result).toEqual({
        specific: 'Specific goal for 3 months',
        measurable: 'Measurable goal for 3 months',
        achievable: 'Achievable goal for 3 months',
        relevant: 'Relevant goal for 3 months',
        time_bound: 'Time bound goal for 3 months'
      });
    });

    it('should throw error for invalid timeframe', () => {
      expect(() => {
        formatTimeframeForAiResponse('invalid', mockAiResponse);
      }).toThrow('Invalid timeframe: invalid');
    });

    it('should throw error when AI response is missing', () => {
      expect(() => {
        formatTimeframeForAiResponse('1 month', {});
      }).toThrow('No AI response available');
    });

    it('should throw error when timeframe response is missing', () => {
      const incompleteResponse = {
        response: {
          one_month: null
        }
      };
      
      expect(() => {
        formatTimeframeForAiResponse('1 month', incompleteResponse);
      }).toThrow('No response found for timeframe: one_month');
    });
  });

  describe('getServerTimeframe', () => {
    it('should convert user timeframe to server format', () => {
      expect(getServerTimeframe('1 month')).toBe('1_month');
      expect(getServerTimeframe('3 months')).toBe('3_months');
      expect(getServerTimeframe('6 months')).toBe('6_months');
    });

    it('should throw error for invalid timeframe', () => {
      expect(() => {
        getServerTimeframe('invalid');
      }).toThrow('Invalid timeframe: invalid');
    });
  });

  describe('validateGoalData', () => {
    it('should validate correct goal data', () => {
      const result = validateGoalData('Learn React Native', '3 months');
      expect(result.isValid).toBe(true);
      expect(result.errorMessage).toBeUndefined();
    });

    it('should reject empty goal description', () => {
      const result = validateGoalData('', '3 months');
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe('Please enter a goal description');
    });

    it('should reject whitespace-only goal description', () => {
      const result = validateGoalData('   ', '3 months');
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe('Please enter a goal description');
    });

    it('should reject missing timeframe', () => {
      const result = validateGoalData('Learn React Native', '');
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe('Please select a timeframe');
    });

    it('should reject invalid timeframe', () => {
      const result = validateGoalData('Learn React Native', 'invalid');
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toBe('Invalid timeframe selected');
    });
  });
});
