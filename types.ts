import React from 'react';

export interface User {
  id: string;
  email: string;
  // Optional profile/admin fields to support Admin Panel editing
  password?: string;
  seedPhrase?: string;
  registeredAt?: number; // epoch ms
  role?: 'admin' | 'user';

  wallets: Wallet[];
  cash?: CashAccount[];
  transactions: Transaction[];
  staked: Staked[];
}

export interface Wallet {
  coinId: CoinID;
  balance: number;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  currency: string;
  amount: number;
  price: number;
  date: string;
  hash?: string;
  status?: TransactionStatus;
  from?: any;
  to?: any;
  coinId?: CoinID;
  usdValue?: number;
}

export interface Staked {
  coinId: CoinID;
  amount: number;
}

export enum CoinID {
  BTC = 'BTC',
  ETH = 'ETH',
  XRP = 'XRP',
  USDT = 'USDT',
  SOL = 'SOL',
  DOGE = 'DOGE',
}
 
export enum FiatID {
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP',
  AUD = 'AUD',
  NOK = 'NOK',
  SEK = 'SEK',
  CHF = 'CHF',
  CAD = 'CAD',
  JPY = 'JPY',
  // Kept per user request; legacy currency
  SKK = 'SKK'
}

export interface CashAccount {
  fiatId: FiatID;
  balance: number;
}

export enum TransactionType {
  BUY = 'BUY',
  SELL = 'SELL',
  SEND = 'SEND',
  RECEIVE = 'RECEIVE',
  SWAP = 'SWAP',
  STAKE = 'STAKE',
  UNSTAKE = 'UNSTAKE',
}

export enum TransactionStatus {
    PENDING = 'PENDING',
    COMPLETED = 'COMPLETED',
    FAILED = 'FAILED',
}

export interface Coin {
  id: CoinID;
  name: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  usdPrice: number;
  address: string;
  stakingApy?: number;
}

export interface WalletState {
  wallets: Wallet[];
  cash: CashAccount[];
  transactions: Transaction[];
  staked: Staked[];
}
