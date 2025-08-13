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
  paymentMethods?: PaymentMethodDetails[];
  
  // Security features
  twoFactorEnabled?: boolean;
  twoFactorSecret?: string;
  lastLoginAt?: number;
  loginAttempts?: number;
  accountLocked?: boolean;
  
  // User preferences
  priceAlerts?: PriceAlert[];
  theme?: 'light' | 'dark';
  notifications?: NotificationSettings;
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
  DEPOSIT = 'DEPOSIT',
  WITHDRAW = 'WITHDRAW',
}

export enum TransactionStatus {
    PENDING = 'PENDING',
    COMPLETED = 'COMPLETED',
    FAILED = 'FAILED',
}

export enum PaymentMethod {
  DEBIT_CARD = 'DEBIT_CARD',
  CREDIT_CARD = 'CREDIT_CARD',
  BANK_TRANSFER = 'BANK_TRANSFER',
  SWIFT_TRANSFER = 'SWIFT_TRANSFER',
  UK_FASTER_PAYMENTS = 'UK_FASTER_PAYMENTS',
}

export enum CardType {
  VISA = 'VISA',
  MASTERCARD = 'MASTERCARD',
  AMEX = 'AMEX',
}

export interface PaymentMethodDetails {
  id: string;
  type: PaymentMethod;
  name: string;
  // Card details
  cardType?: CardType;
  cardNumber?: string;
  expiryDate?: string;
  cvv?: string;
  cardHolderName?: string;
  // Bank details
  bankName?: string;
  accountNumber?: string;
  routingNumber?: string;
  sortCode?: string;
  iban?: string;
  swiftCode?: string;
  accountHolderName?: string;
  isDefault?: boolean;
  createdAt?: string;
}

export interface DepositRequest {
  amount: number;
  fiatId: FiatID;
  paymentMethodId: string;
  paymentMethod: PaymentMethod;
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

// New types for better error handling and API responses
export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}

export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
  loading?: boolean;
}

// Type guards for runtime type checking
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidCoinID = (value: any): value is CoinID => {
  return Object.values(CoinID).includes(value);
};

export const isValidTransactionType = (value: any): value is TransactionType => {
  return Object.values(TransactionType).includes(value);
};

// Utility types for better component props
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface LoadingState {
  isLoading: boolean;
  error?: string | null;
}

// Price Alert System
export interface PriceAlert {
  id: string;
  coinId: CoinID;
  targetPrice: number;
  condition: 'above' | 'below';
  isActive: boolean;
  createdAt: string;
  triggeredAt?: string;
  notificationSent?: boolean;
}

// Notification Settings
export interface NotificationSettings {
  email: boolean;
  push: boolean;
  priceAlerts: boolean;
  transactionUpdates: boolean;
  securityAlerts: boolean;
  marketNews: boolean;
}

// Security and Admin Types
export interface LoginAttempt {
  timestamp: number;
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
}

export interface SecurityEvent {
  id: string;
  userId: string;
  type: 'login' | 'failed_login' | 'password_change' | '2fa_enabled' | '2fa_disabled' | 'suspicious_activity';
  timestamp: number;
  details?: any;
  ipAddress?: string;
}
