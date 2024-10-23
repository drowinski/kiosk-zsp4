import crypto from 'node:crypto';

const SALT_SIZE = 16;
const KEY_SIZE = 64;

export async function hashPassword(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(SALT_SIZE).toString('hex');
    crypto.scrypt(password, salt, KEY_SIZE, (err, derivedKey) => {
      if (err) {
        reject(err);
      }
      resolve(salt + derivedKey.toString('hex'));
    });
  });
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const salt = hash.slice(0, SALT_SIZE * 2);
    const key = hash.slice(SALT_SIZE * 2);
    crypto.scrypt(password, salt, KEY_SIZE, (err, derivedKey) => {
      if (err) {
        reject(err);
      }
      resolve(key === derivedKey.toString('hex'));
    });
  });
}
