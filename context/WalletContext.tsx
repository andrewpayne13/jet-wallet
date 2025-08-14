import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { Wallet, Transaction, Staked, WalletState, CoinID, TransactionType, TransactionStatus, isValidCoinID, isValidTransactionType, FiatID } from '../types';
import { COINS } from '../constants';
import { db } from '../firebase';
import { doc, updateDoc, onSnapshot, arrayUnion } from 'firebase/firestore';
import { useAuth } from '../hooks/useAuth';

// --- Action Types ---
type Action =
  | { type: 'SIMULATE_TRANSACTION'; payload: TransactionPayload }
  | { type: 'STAKE'; payload: { coinId: CoinID; amount: number; currentPrice?: number } }
  | { type: 'UNSTAKE'; payload: { coinId: CoinID; amount: number; currentPrice?: number } }
  | { type: 'WITHDRAW'; payload: { type: 'crypto' | 'fiat'; coinId?: CoinID; fiatId?: FiatID; amount: number; address?: string; paymentMethodId?: string; usdValue?: number } };

// --- Helper Types ---
type TransactionPayload = Omit<Transaction, 'id' | 'date' | 'hash' | 'status' | 'price'> & {
  from?: { coinId: CoinID; amount: number; usdValue: number };
  to?: { coinId: CoinID; amount: number; usdValue: number };
  coinId: CoinID;
  currency: string;
  amount: number;
  usdValue: number;
  type: TransactionType;
};

// --- Utility Functions ---
const generateHash = () => `0x${[...Array(64)].map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`;

const createTransaction = (
  payload: { coinId?: CoinID | FiatID; amount: number; usdValue: number; type: TransactionType; status?: TransactionStatus; to?: string; currency?: string }
): Transaction => ({
  id: `tx_${Date.now()}_${Math.random()}`,
  date: new Date().toISOString(),
  hash: generateHash(),
  status: payload.status || TransactionStatus.COMPLETED,
  currency: payload.currency ?? (payload.coinId ? payload.coinId : FiatID.USD),
  amount: payload.amount,
  price: payload.amount ? payload.usdValue / payload.amount : 0,
  usdValue: payload.usdValue,
  type: payload.type,
  to: payload.to,
});

// --- Context and Provider ---
interface WalletContextType {
  state: WalletState;
  dispatch: (action: Action) => Promise<void>;
}

export const WalletContext = createContext<WalletContextType>({
  state: { wallets: [], cash: [], transactions: [], staked: [] },
  dispatch: async () => {},
});

export const WalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [state, setState] = useState<WalletState>({
    wallets: [],
    cash: [],
    transactions: [],
    staked: [],
  });

  useEffect(() => {
    if (currentUser) {
      const userRef = doc(db, 'users', currentUser.id);
      const unsubscribe = onSnapshot(userRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setState({
            wallets: data.wallets || [],
            cash: data.cash || [],
            transactions: data.transactions || [],
            staked: data.staked || [],
          });
        }
      });
      return () => unsubscribe();
    }
  }, [currentUser]);

  const dispatch = async (action: Action) => {
    if (!currentUser) return;

    const userRef = doc(db, 'users', currentUser.id);

    switch (action.type) {
      case 'SIMULATE_TRANSACTION': {
        const { payload } = action;
        if (!isValidCoinID(payload.coinId) || !isValidTransactionType(payload.type)) return;
        if (payload.amount <= 0 || payload.usdValue <= 0) return;

        if (payload.type === TransactionType.SELL || payload.type === TransactionType.SEND) {
          const wallet = state.wallets.find(w => w.coinId === payload.coinId);
          if (!wallet || wallet.balance < payload.amount) return;
        }

        const newTransaction = createTransaction({
          coinId: payload.coinId,
          amount: payload.amount,
          usdValue: payload.usdValue,
          type: payload.type,
          currency: payload.currency,
        });

        await updateDoc(userRef, {
          transactions: arrayUnion(newTransaction),
        });

        // Update balances
        if (payload.type === TransactionType.BUY || payload.type === TransactionType.RECEIVE) {
          const existingWallet = state.wallets.find(w => w.coinId === payload.coinId);
          let newWallets = [...state.wallets];
          if (existingWallet) {
            newWallets = newWallets.map(w => 
              w.coinId === payload.coinId 
                ? { ...w, balance: w.balance + payload.amount }
                : w
            );
          } else {
            newWallets.push({ coinId: payload.coinId, balance: payload.amount });
          }
          await updateDoc(userRef, { wallets: newWallets });
        } else if (payload.type === TransactionType.SELL || payload.type === TransactionType.SEND) {
          const newWallets = state.wallets.map(w => 
            w.coinId === payload.coinId 
              ? { ...w, balance: w.balance - payload.amount }
              : w
          ).filter(w => w.balance > 0);
          await updateDoc(userRef, { wallets: newWallets });
        } else if (payload.type === TransactionType.DEPOSIT) {
          const fiatId = payload.currency as FiatID;
          const existingCash = state.cash.find(c => c.fiatId === fiatId);
          let newCash = [...state.cash];
          if (existingCash) {
            newCash = newCash.map(c => 
              c.fiatId === fiatId 
                ? { ...c, balance: c.balance + payload.amount }
                : c
            );
          } else {
            newCash.push({ fiatId, balance: payload.amount });
          }
          await updateDoc(userRef, { cash: newCash });
        } else if (payload.type === TransactionType.SWAP && payload.from && payload.to) {
          let newWallets = [...state.wallets];
          const fromIndex = newWallets.findIndex(w => w.coinId === payload.from.coinId);
          if (fromIndex > -1) {
            newWallets[fromIndex].balance -= payload.from.amount;
            if (newWallets[fromIndex].balance <= 0) newWallets.splice(fromIndex, 1);
          }
          const toIndex = newWallets.findIndex(w => w.coinId === payload.to.coinId);
          if (toIndex > -1) {
            newWallets[toIndex].balance += payload.to.amount;
          } else {
            newWallets.push({ coinId: payload.to.coinId, balance: payload.to.amount });
          }
          await updateDoc(userRef, { wallets: newWallets });
        }
        break;
      }

      case 'STAKE': {
        const { coinId, amount, currentPrice = 0 } = action.payload;
        if (!isValidCoinID(coinId) || amount <= 0) return;
        const wallet = state.wallets.find(w => w.coinId === coinId);
        if (!wallet || wallet.balance < amount) return;

        const newTransaction = createTransaction({
          coinId,
          amount,
          usdValue: currentPrice * amount,
          type: TransactionType.STAKE,
        });

        const newWallets = state.wallets.map(w => 
          w.coinId === coinId ? { ...w, balance: w.balance - amount } : w
        ).filter(w => w.balance > 0);

        let newStaked = [...state.staked];
        const stakeIndex = newStaked.findIndex(s => s.coinId === coinId);
        if (stakeIndex > -1) {
          newStaked[stakeIndex].amount += amount;
        } else {
          newStaked.push({ coinId, amount });
        }

        await updateDoc(userRef, {
          transactions: arrayUnion(newTransaction),
          wallets: newWallets,
          staked: newStaked,
        });
        break;
      }

      case 'UNSTAKE': {
        const { coinId, amount, currentPrice = 0 } = action.payload;
        if (!isValidCoinID(coinId) || amount <= 0) return;
        const stakedAsset = state.staked.find(s => s.coinId === coinId);
        if (!stakedAsset || stakedAsset.amount < amount) return;

        const newTransaction = createTransaction({
          coinId,
          amount,
          usdValue: currentPrice * amount,
          type: TransactionType.UNSTAKE,
        });

        const newStaked = state.staked.map(s => 
          s.coinId === coinId ? { ...s, amount: s.amount - amount } : s
        ).filter(s => s.amount > 0);

        let newWallets = [...state.wallets];
        const walletIndex = newWallets.findIndex(w => w.coinId === coinId);
        if (walletIndex > -1) {
          newWallets[walletIndex].balance += amount;
        } else {
          newWallets.push({ coinId, balance: amount });
        }

        await updateDoc(userRef, {
          transactions: arrayUnion(newTransaction),
          staked: newStaked,
          wallets: newWallets,
        });
        break;
      }

      case 'WITHDRAW': {
        const { type: withdrawType, coinId, fiatId, amount, address, paymentMethodId, usdValue = 0 } = action.payload;
        if (amount <= 0) return;

        const newTransaction = createTransaction({
          coinId: coinId || fiatId,
          amount,
          usdValue,
          type: TransactionType.WITHDRAW,
          status: TransactionStatus.PENDING,
          to: address || paymentMethodId,
          currency: coinId ? coinId : fiatId,
        });

        await updateDoc(userRef, {
          transactions: arrayUnion(newTransaction),
        });

        // Deduct balance
        if (withdrawType === 'crypto' && coinId) {
          if (!isValidCoinID(coinId)) return;
          const wallet = state.wallets.find(w => w.coinId === coinId);
          if (!wallet || wallet.balance < amount) return;

          const newWallets = state.wallets.map(w => 
            w.coinId === coinId ? { ...w, balance: w.balance - amount } : w
          ).filter(w => w.balance > 0);
          await updateDoc(userRef, { wallets: newWallets });
        } else if (withdrawType === 'fiat' && fiatId) {
          const cash = state.cash.find(c => c.fiatId === fiatId);
          if (!cash || cash.balance < amount) return;

          const newCash = state.cash.map(c => 
            c.fiatId === fiatId ? { ...c, balance: c.balance - amount } : c
          ).filter(c => c.balance > 0);
          await updateDoc(userRef, { cash: newCash });
        }
        break;
      }
    }
  };

  return (
    <WalletContext.Provider value={{ state, dispatch }}>
      {children}
    </WalletContext.Provider>
  );
};
