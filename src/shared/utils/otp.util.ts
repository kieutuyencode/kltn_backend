/**
 * Generates a random OTP (One-Time Password) code
 * @param length - The length of the OTP code (default: 6)
 * @returns A string containing the OTP code
 */
export const generateOtpCode = (length: number = 6): string => {
  if (length <= 0) {
    throw new Error('OTP length must be greater than 0');
  }

  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;

  const otp = Math.floor(Math.random() * (max - min + 1)) + min;

  return otp.toString().padStart(length, '0');
};
