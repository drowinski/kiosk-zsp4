import { describe, expect, it } from 'vitest';
import { getYYYYMMDD } from '@/utils/dates';

describe('dates', () => {
  describe(getYYYYMMDD.name, () => {
    it('should convert a Date object to a yyyy-mm-dd string', () => {
      const date = new Date(2024, 11, 25);
      const string = getYYYYMMDD(date);
      expect(string).toStrictEqual('2024-12-25');
    });
  });
});
