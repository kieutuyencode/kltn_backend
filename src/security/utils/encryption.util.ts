import { createCipheriv, createDecipheriv, randomBytes, scrypt } from 'crypto';
import { promisify } from 'util';
import { decode, encode } from './encoding.util';

const scryptAsync = promisify(scrypt);

export const encrypt = async (value: string, password: string) => {
  const iv = randomBytes(16);
  const key = (await scryptAsync(password, 'salt', 32)) as Buffer;

  const cipher = createCipheriv('aes-256-ctr', key, iv);
  const encryptedBuffer = Buffer.concat([
    cipher.update(value, 'utf8'),
    cipher.final(),
  ]);

  return encode({
    encrypted: encryptedBuffer.toString('hex'),
    iv: iv.toString('hex'),
  });
};

export const decrypt = async (value: string, password: string) => {
  const decoded = JSON.parse(decode(value)) as {
    encrypted: string;
    iv: string;
  };
  const key = (await scryptAsync(password, 'salt', 32)) as Buffer;
  const iv = Buffer.from(decoded.iv, 'hex');
  const encryptedBuffer = Buffer.from(decoded.encrypted, 'hex');

  const decipher = createDecipheriv('aes-256-ctr', key, iv);
  const decryptedBuffer = Buffer.concat([
    decipher.update(encryptedBuffer),
    decipher.final(),
  ]);

  return decryptedBuffer.toString('utf8');
};
