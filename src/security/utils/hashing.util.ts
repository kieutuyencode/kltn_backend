import argon2 from 'argon2';

export const hash = async (password: string) => {
  return await argon2.hash(password);
};

export const verifyHash = async (hash: string, password: string) => {
  return await argon2.verify(hash, password);
};
