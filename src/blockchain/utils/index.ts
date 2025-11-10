import { parseUnits, formatUnits, BigNumberish, ethers } from 'ethers';
import Decimal from 'decimal.js';
import { TKey, TTransactionOptions, TTransferCoin } from '../types';
import { SiweMessage } from 'siwe';
import { BadRequestException } from '@nestjs/common';

export const fromUnits = (value: BigNumberish, decimals: number = 18) =>
  new Decimal(formatUnits(value, decimals));

export const toUnits = (value: Decimal, decimals: number = 18) =>
  parseUnits(new Decimal(value).toFixed(decimals), decimals);

export const createWallet = () => {
  return ethers.Wallet.createRandom();
};

export const getWallet = (
  key: TKey,
  provider?: ethers.Provider,
): ethers.Wallet | ethers.HDNodeWallet => {
  let wallet: ethers.Wallet | ethers.HDNodeWallet;
  if (typeof key !== 'string') key = key.join(' ');
  if (key.includes(' ')) {
    wallet = ethers.Wallet.fromPhrase(key, provider);
  } else {
    wallet = new ethers.Wallet(key, provider);
  }

  return wallet;
};

export const transferCoin = async (
  { fromWallet, toAddress, amount }: TTransferCoin,
  { waitForReceipt, decimals }: TTransactionOptions = {},
) => {
  const tx = await fromWallet.sendTransaction({
    to: toAddress,
    value: toUnits(amount, decimals),
  });

  if (waitForReceipt) {
    await tx.wait();
  }

  return tx;
};

export const verifySignature = async ({
  message,
  signature,
}: {
  message: string;
  signature: string;
}) => {
  try {
    const SiweObject = new SiweMessage(message);
    const { data, success } = await SiweObject.verify({ signature });

    if (!success) {
      throw new BadRequestException();
    }

    return { address: data.address, nonce: data.nonce };
  } catch (error) {
    throw new BadRequestException();
  }
};
