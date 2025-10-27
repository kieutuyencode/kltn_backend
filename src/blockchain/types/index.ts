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

export type TReleaseAsset = {
  fromWalletContract: ethers.Contract;
  toAddress: string;
  tokenAddress?: string;
  amount: Decimal;
  sourceChain: number;
  txId: string;
};

export type TVerifyTokenTransfer = {
  txhash: string;
  fromAddress: string;
  toAddress: string;
  amount: Decimal;
  network: ethers.Provider;
  contractAddress: string;
  abi: ethers.InterfaceAbi;
};
