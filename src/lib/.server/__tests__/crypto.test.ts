import { hashPassword, KEY_SIZE, SALT_SIZE, verifyPassword } from '@/lib/.server/crypto';
import { beforeAll, describe, expect, it } from 'vitest';

describe('crypto', () => {
  describe(hashPassword.name, () => {
    const stringToBeHashed = 'myPaSSword123$!@';
    let hashedString: string;

    beforeAll(async () => {
      hashedString = await hashPassword(stringToBeHashed);
    })

    it('should create a string different than the original string', async () => {
      expect(hashedString).not.toStrictEqual(stringToBeHashed);
    });

    it('should create a string representing a number in hexadecimal', async () => {
      expect(hashedString.match(/^[a-zA-Z0-9]+$/)).not.toBeNull();
    });

    it('should create a string of length (SALT_SIZE + KEY_SIZE) * 2', async () => {
      expect(hashedString.length).toStrictEqual((SALT_SIZE + KEY_SIZE) * 2);
    });
  });

  describe(verifyPassword.name, () => {
    const stringToBeHashed = 'myPaSSword123$!@';
    let hashedString: string;

    beforeAll(async () => {
      hashedString = await hashPassword(stringToBeHashed);
    });

    it('should return true for a string hashed by hashPassword', async () => {
      const verificationResult = await verifyPassword(stringToBeHashed, hashedString);
      expect(verificationResult).toStrictEqual(true);
    });

    it('should return false for any string other than the one initially hashed by hashPassword', async () => {
      const verificationResult = await verifyPassword('thisIsNotTheCorrectString', hashedString);
      expect(verificationResult).toStrictEqual(false);
    });
  });
});
