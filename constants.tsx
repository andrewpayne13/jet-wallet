import React from 'react';
import { Coin, CoinID, Wallet } from './types';

const BtcIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg fill="#f7931a" height="24px" width="24px" viewBox="0 0 32 32" {...props}>
    <path d="M21.6,15.11a5.47,5.47,0,0,0-1.5-.73l.63-2.53L18,11.12,17.4,13.6a5,5,0,0,0-1.11-.2V9.89l-2.71,0V13.3a4.2,4.2,0,0,0-1,.2l.62-2.5L9.54,10.27l-1.5,6a.3.3,0,0,0,0,.12,5.2,5.2,0,0,0-1.2.35l.8,3.21,2.71,0-.63,2.52a4.8,4.8,0,0,0,1,.21v3.51l2.71,0V22.69a6.81,6.81,0,0,0,1.11-.2l-.63,2.52,2.71,0,1.5-6a.31.31,0,0,0,0-.12,4.73,4.73,0,0,0,1.19-.34l-.8-3.21-2.71,0Zm-3.89,4.21,0,0-.38,1.51-1.11.27v-2Zm.77-3.21.38-1.51,1.11.27,0,0Z" />
  </svg>
);

const EthIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" {...props}>
    <path d="M12 1.75l-7.5 10.5 7.5 4 7.5-4L12 1.75z" fill="#627eea"/>
    <path d="M12 1.75l-7.5 10.5 7.5 4V1.75z" fill="#46569a"/>
    <path d="M12 17.25l-7.5-4.5 7.5 9V17.25z" fill="#627eea"/>
    <path d="M12 17.25l7.5-4.5-7.5 9V17.25z" fill="#46569a"/>
    <path d="M4.5 12.25l7.5 4 7.5-4-7.5-3-7.5 3z" fill="#627eea"/>
    <path d="M4.5 12.25l7.5 4V9.25l-7.5 3z" fill="#46569a"/>
  </svg>
);

const XrpIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
 <svg fill="#23292f" width="24" height="24" viewBox="0 0 32 32" {...props}>
   <path d="M16 32C7.163 32 0 24.837 0 16S7.163 0 16 0s16 7.163 16 16-7.163 16-16 16zm-5.11-15.304l-2.484 2.484L13.88 24.65l2.483-2.483-5.473-5.47zm10.22 0l-5.472 5.47L17.52 24.65l5.473-5.472-2.484-2.484zM8.404 13.88L5.92 11.398l5.47-5.47L13.875 8.41l-5.47 5.47zm10.22 0l-2.484-2.484 5.472-5.47L24.08 8.41l-5.472 5.47z"/>
 </svg>
);

const UsdtIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg fill="#26a17b" width="24" height="24" viewBox="0 0 32 32" {...props}>
    <path d="M16 32C7.163 32 0 24.837 0 16S7.163 0 16 0s16 7.163 16 16-7.163 16-16 16zM22.39 17.81h-5.83v5.82h-3.12v-5.82H7.61v-2.8h5.83V9.18h3.12v5.83h5.83v2.8z"/>
  </svg>
);

const SolIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" {...props}>
    <path d="M4 12.55C4 11.23 4.88 10.08 6.07 9.62L17.93 4.38C19.12 3.92 20.5 4.81 20.5 6.13V11.45C20.5 12.77 19.62 13.92 18.43 14.38L6.57 19.62C5.38 20.08 4 19.19 4 17.87V12.55Z" fill="#9945FF"/>
  </svg>
);

const DogeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg width="24" height="24" viewBox="0 0 32 32" fill="#C3A634" {...props}>
    <path d="M16 32C7.163 32 0 24.837 0 16S7.163 0 16 0s16 7.163 16 16-7.163 16-16 16zM15.12 12.87c-1.57-.1-3.04.1-4.5.76-.32.13-.6.48-.48.83l.8 2.05c.1.3.43.43.7.32 1.3-.5 2.62-.7 3.96-.5.9.1 1.75.46 2.42 1.1.5.48.9 1.13 1.1 1.8.1.55.2 1.1.1 1.66-.1.7-.32 1.3-.7 1.9-.9 1.3-2.3 2-3.8 2.3-1.6.3-3.2.1-4.7-.5-.3-.1-.6 0-.8.3l-1.3 1.8c-.2.2-.1.6.1.8.8.4 1.6.7 2.5.9 1.8.4 3.6.4 5.4-.1 1.9-.5 3.6-1.6 4.7-3.2 1.1-1.6 1.6-3.4 1.4-5.3-.2-1.9-.9-3.7-2.2-5.1-1.3-1.4-3-2.3-4.9-2.6-1.1-.1-2.1-.1-3.2.1zm-4.22 13.63c-.3 0-.5-.1-.7-.3l-1.8-1.5c-.2-.2-.2-.6 0-.8l1.8-1.5c.3-.2.7-.2.9 0l1.8 1.5c.2.2.2.6 0 .8l-1.8 1.5c-.1.1-.2.3-.2.3z"/>
  </svg>
);

export const COINS: Record<CoinID, Coin> = {
  [CoinID.BTC]: { id: CoinID.BTC, name: 'Bitcoin', icon: BtcIcon, usdPrice: 68000.50, address: 'bc1qjetwalletxxxxxxxxxxxxxxxxxxxxxxxyyyyyy', stakingApy: undefined },
  [CoinID.ETH]: { id: CoinID.ETH, name: 'Ethereum', icon: EthIcon, usdPrice: 3500.75, address: '0xJETWALLETxxxxxxxxxxxxxxxxxxxxxxxxxYYYYYY', stakingApy: 3.5 },
  [CoinID.XRP]: { id: CoinID.XRP, name: 'XRP', icon: XrpIcon, usdPrice: 0.48, address: 'rJETWALLETxxxxxxxxxxxxxxxxxxxxxYYYYYY', stakingApy: undefined },
  [CoinID.USDT]: { id: CoinID.USDT, name: 'Tether', icon: UsdtIcon, usdPrice: 1.00, address: '0xJETWALLETtetherxxxxxxxxxxxxxxxxxxxYYYYYY', stakingApy: 1.5 },
  [CoinID.SOL]: { id: CoinID.SOL, name: 'Solana', icon: SolIcon, usdPrice: 150.25, address: 'SoLJETWALLETxxxxxxxxxxxxxxxxxxxxxxxxxYYYYY', stakingApy: 6.8 },
  [CoinID.DOGE]: { id: CoinID.DOGE, name: 'Dogecoin', icon: DogeIcon, usdPrice: 0.15, address: 'DJETWALLETxxxxxxxxxxxxxxxxxxxxxYYYYYY', stakingApy: undefined },
};

export const INITIAL_WALLETS: Wallet[] = [
  { coinId: CoinID.BTC, balance: 0.5 },
  { coinId: CoinID.ETH, balance: 10 },
  { coinId: CoinID.USDT, balance: 5000 },
  { coinId: CoinID.SOL, balance: 100 },
  { coinId: CoinID.XRP, balance: 10000 },
  { coinId: CoinID.DOGE, balance: 50000 },
];

export const SEED_PHRASE_WORDS = [
  'apple', 'banana', 'orange', 'grape', 'lemon', 'lime', 'melon', 'cherry', 'peach', 'plum',
  'rocket', 'planet', 'star', 'galaxy', 'comet', 'orbit', 'lunar', 'solar', 'nebula', 'cosmos',
  'wallet', 'crypto', 'token', 'block', 'chain', 'asset', 'secure', 'shield', 'vault', 'key',
  'ocean', 'river', 'mountain', 'forest', 'desert', 'island', 'valley', 'canyon', 'glacier', 'reef',
  'journey', 'quest', 'voyage', 'explore', 'discover', 'path', 'map', 'compass', 'horizon', 'odyssey'
];
