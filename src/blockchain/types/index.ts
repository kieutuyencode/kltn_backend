import Decimal from 'decimal.js';
import { ethers } from 'ethers';

export type TKey = string | string[];

export type TTransactionOptions = {
  waitForReceipt?: boolean;
  decimals?: number;
};

export type TTransferCoin = {
  fromWallet: ethers.BaseWallet;
  toAddress: string;
  amount: Decimal;
};
