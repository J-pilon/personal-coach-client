import {
  TIMEFRAME_MAPPER,
  TIMEFRAME_OPTIONS,
  formatTimeframeForAiResponse,
  getGoalDueStatus,
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

  describe('getGoalDueStatus', () => {
    const TODAY = new Date('2026-05-25T12:00:00');

    const dateAtOffset = (days: number): string => {
      const d = new Date('2026-05-25');
      d.setDate(d.getDate() + days);
      return d.toISOString().split('T')[0];
    };

    it('returns "none" for missing target date', () => {
      const result = getGoalDueStatus(undefined, false, TODAY);
      expect(result.kind).toBe('none');
    });

    it('returns "none" for invalid target date', () => {
      const result = getGoalDueStatus('not-a-date', false, TODAY);
      expect(result.kind).toBe('none');
    });

    it('returns formatted date for dayDiff > 30 (31 days away)', () => {
      const result = getGoalDueStatus(dateAtOffset(31), false, TODAY);
      expect(result.kind).toBe('date');
      expect(result.variant).toBe('neutral');
      expect(result.label).toMatch(/\d{4}/);
    });

    it('returns "30 days until due" for dayDiff === 30', () => {
      const result = getGoalDueStatus(dateAtOffset(30), false, TODAY);
      expect(result.kind).toBe('due_soon');
      expect(result.variant).toBe('warning');
      expect(result.label).toBe('30 days until due');
    });

    it('returns "2 days until due" for dayDiff === 2', () => {
      const result = getGoalDueStatus(dateAtOffset(2), false, TODAY);
      expect(result.kind).toBe('due_soon');
      expect(result.label).toBe('2 days until due');
    });

    it('returns "1 day until due" (singular) for dayDiff === 1', () => {
      const result = getGoalDueStatus(dateAtOffset(1), false, TODAY);
      expect(result.kind).toBe('due_soon');
      expect(result.label).toBe('1 day until due');
    });

    it('returns "Due today" for dayDiff === 0', () => {
      const result = getGoalDueStatus(dateAtOffset(0), false, TODAY);
      expect(result.kind).toBe('due_today');
      expect(result.variant).toBe('warning');
      expect(result.label).toBe('Due today');
    });

    it('returns "Due today" even when completed (today is not past)', () => {
      const result = getGoalDueStatus(dateAtOffset(0), true, TODAY);
      expect(result.kind).toBe('due_today');
      expect(result.label).toBe('Due today');
    });

    it('returns "Due yesterday" for dayDiff === -1 and not completed', () => {
      const result = getGoalDueStatus(dateAtOffset(-1), false, TODAY);
      expect(result.kind).toBe('due_yesterday');
      expect(result.variant).toBe('danger');
      expect(result.label).toBe('Due yesterday');
    });

    it('returns "none" for dayDiff === -1 and completed', () => {
      const result = getGoalDueStatus(dateAtOffset(-1), true, TODAY);
      expect(result.kind).toBe('none');
    });

    it('returns "2 days past due" for dayDiff === -2 and not completed', () => {
      const result = getGoalDueStatus(dateAtOffset(-2), false, TODAY);
      expect(result.kind).toBe('past_due');
      expect(result.variant).toBe('danger');
      expect(result.label).toBe('2 days past due');
    });

    it('returns "10 days past due" for dayDiff === -10 and not completed', () => {
      const result = getGoalDueStatus(dateAtOffset(-10), false, TODAY);
      expect(result.kind).toBe('past_due');
      expect(result.label).toBe('10 days past due');
    });

    it('returns "1 day past due" (singular) for dayDiff === -1... wait this is tested above', () => {
      // dayDiff === -1 shows "Due yesterday" (not "1 day past due")
      const result = getGoalDueStatus(dateAtOffset(-1), false, TODAY);
      expect(result.label).toBe('Due yesterday');
    });

    it('returns "none" for dayDiff === -10 and completed (hide badge for completed past-due)', () => {
      const result = getGoalDueStatus(dateAtOffset(-10), true, TODAY);
      expect(result.kind).toBe('none');
    });

    it('returns formatted date for dayDiff > 30 even when completed', () => {
      const result = getGoalDueStatus(dateAtOffset(60), true, TODAY);
      expect(result.kind).toBe('date');
      expect(result.variant).toBe('neutral');
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
