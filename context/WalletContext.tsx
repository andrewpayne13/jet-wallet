import React, { createContext, useReducer, ReactNode, useEffect, useRef, useCallback } from 'react';
import { Wallet, Transaction, Staked, WalletState, CoinID, TransactionType, TransactionStatus, isValidCoinID, isValidTransactionType } from '../types';
import { COINS } from '../constants';

// --- Action Types ---
type Action =
  | { type: 'SIMULATE_TRANSACTION'; payload: TransactionPayload }
  | { type: 'STAKE'; payload: { coinId: CoinID; amount: number } }
  | { type: 'UNSTAKE'; payload: { coinId: CoinID; amount: number } };

// --- Helper Types ---
type TransactionPayload = Omit<Transaction, 'id' | 'date' | 'hash' | 'status' | 'currency' | 'price'> & {
  from?: { coinId: CoinID; amount: number; usdValue: number };
  to?: { coinId: CoinID; amount: number; usdValue: number };
  coinId: CoinID;
  amount: number;
  usdValue: number;
  type: TransactionType;
};

// --- Utility Functions ---
const generateHash = () => `0x${[...Array(64)].map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`;

const createTransaction = (
    payload: Partial<TransactionPayload> & { coinId: CoinID; amount: number; usdValue: number; type: TransactionType, status?: TransactionStatus }
): Transaction => ({
    id: `tx_${Date.now()}_${Math.random()}`,
    date: new Date().toISOString(),
    hash: generateHash(),
    status: TransactionStatus.COMPLETED,
    currency: payload.coinId,
    // Use the price implied by the caller's usdValue/amount so we capture live price at time of tx.
    price: payload.amount ? payload.usdValue / payload.amount : 0,
    ...payload,
});

// --- Reducer Logic ---
const handleTransaction = (state: WalletState, payload: TransactionPayload): WalletState => {
    const { type, coinId, amount, from, to } = payload;
    let newWallets = [...state.wallets];
    let newTransactions = [...state.transactions];

    if (type === TransactionType.BUY || type === TransactionType.RECEIVE) {
        const walletIndex = newWallets.findIndex(w => w.coinId === coinId);
        if (walletIndex > -1) {
            newWallets = newWallets.map((w, i) => i === walletIndex ? { ...w, balance: w.balance + amount } : w);
        } else {
            newWallets.push({ coinId, balance: amount });
        }
        newTransactions.unshift(createTransaction(payload));
    } else if (type === TransactionType.SELL || type === TransactionType.SEND) {
        const walletIndex = newWallets.findIndex(w => w.coinId === coinId);
        if (walletIndex > -1) {
            newWallets = newWallets.map((w, i) => i === walletIndex ? { ...w, balance: w.balance - amount } : w);
        }
        newTransactions.unshift(createTransaction(payload));
    } else if (type === TransactionType.SWAP && from && to) {
        const fromWalletIndex = newWallets.findIndex(w => w.coinId === from.coinId);
        const toWalletIndex = newWallets.findIndex(w => w.coinId === to.coinId);

        if (fromWalletIndex > -1) {
            newWallets = newWallets.map((w, i) => i === fromWalletIndex ? { ...w, balance: w.balance - from.amount } : w);
        }
        if (toWalletIndex > -1) {
            newWallets = newWallets.map((w, i) => i === toWalletIndex ? { ...w, balance: w.balance + to.amount } : w);
        } else {
            newWallets.push({ coinId: to.coinId, balance: to.amount });
        }

        const swapOutTx = createTransaction({ ...payload, type: TransactionType.SWAP, coinId: from.coinId, amount: from.amount, usdValue: from.usdValue, from: 'Self', to: 'Exchange' });
        const swapInTx = createTransaction({ ...payload, type: TransactionType.SWAP, coinId: to.coinId, amount: to.amount, usdValue: to.usdValue, from: 'Exchange', to: 'Self' });
        newTransactions.unshift(swapInTx, swapOutTx);
    }

    return { ...state, wallets: newWallets, transactions: newTransactions };
};

const handleStake = (state: WalletState, payload: { coinId: CoinID; amount: number; currentPrice?: number }): WalletState => {
    const { coinId, amount, currentPrice = 0 } = payload;
    const newWallets = state.wallets.map(w => w.coinId === coinId ? { ...w, balance: w.balance - amount } : w);
    
    const newStaked = [...state.staked];
    const stakeIndex = newStaked.findIndex(s => s.coinId === coinId);
    if (stakeIndex > -1) {
        newStaked[stakeIndex] = { ...newStaked[stakeIndex], amount: newStaked[stakeIndex].amount + amount };
    } else {
        newStaked.push({ coinId, amount });
    }

    const transaction = createTransaction({
        type: TransactionType.STAKE,
        coinId,
        amount,
        usdValue: currentPrice * amount,
    });

    return { ...state, wallets: newWallets, staked: newStaked, transactions: [transaction, ...state.transactions] };
};

const handleUnstake = (state: WalletState, payload: { coinId: CoinID; amount: number; currentPrice?: number }): WalletState => {
    const { coinId, amount, currentPrice = 0 } = payload;
    const newWallets = state.wallets.map(w => w.coinId === coinId ? { ...w, balance: w.balance + amount } : w);
    const newStaked = state.staked.map(s => s.coinId === coinId ? { ...s, amount: s.amount - amount } : s).filter(s => s.amount > 0);
    
    const transaction = createTransaction({
        type: TransactionType.UNSTAKE,
        coinId,
        amount,
        usdValue: currentPrice * amount,
    });

    return { ...state, wallets: newWallets, staked: newStaked, transactions: [transaction, ...state.transactions] };
};

const walletReducer = (state: WalletState, action: Action): WalletState => {
  try {
    switch (action.type) {
      case 'SIMULATE_TRANSACTION': {
        const { payload } = action;
        
        // Validate transaction payload
        if (!isValidCoinID(payload.coinId) || !isValidTransactionType(payload.type)) {
          console.error('Invalid transaction payload:', payload);
          return state;
        }
        
        if (payload.amount <= 0 || payload.usdValue <= 0) {
          console.error('Invalid transaction amounts:', payload);
          return state;
        }
        
        // Check if user has sufficient balance for sell/send operations
        if (payload.type === TransactionType.SELL || payload.type === TransactionType.SEND) {
          const wallet = state.wallets.find(w => w.coinId === payload.coinId);
          if (!wallet || wallet.balance < payload.amount) {
            console.error('Insufficient balance for transaction:', payload);
            return state;
          }
        }
        
        return handleTransaction(state, payload);
      }
      
      case 'STAKE': {
        const { coinId, amount } = action.payload;
        
        if (!isValidCoinID(coinId) || amount <= 0) {
          console.error('Invalid stake payload:', action.payload);
          return state;
        }
        
        const wallet = state.wallets.find(w => w.coinId === coinId);
        if (!wallet || wallet.balance < amount) {
          console.error('Insufficient balance for staking:', action.payload);
          return state;
        }
        
        return handleStake(state, action.payload);
      }
      
      case 'UNSTAKE': {
        const { coinId, amount } = action.payload;
        
        if (!isValidCoinID(coinId) || amount <= 0) {
          console.error('Invalid unstake payload:', action.payload);
          return state;
        }
        
        const staked = state.staked.find(s => s.coinId === coinId);
        if (!staked || staked.amount < amount) {
          console.error('Insufficient staked amount for unstaking:', action.payload);
          return state;
        }
        
        return handleUnstake(state, action.payload);
      }
      
      default:
        return state;
    }
  } catch (error) {
    console.error('Error in wallet reducer:', error);
    return state;
  }
};

// --- Context and Provider ---
interface WalletContextType {
    state: WalletState;
    dispatch: React.Dispatch<Action>;
}

export const WalletContext = createContext<WalletContextType>({
  state: { wallets: [], cash: [], transactions: [], staked: [] },
  dispatch: () => null,
});

interface WalletProviderProps {
    children: ReactNode;
    initialState: WalletState;
    onStateChange: (newState: WalletState) => void;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children, initialState, onStateChange }) => {
  const [state, dispatch] = useReducer(walletReducer, initialState);

  // Avoid infinite update loops: keep a stable ref to onStateChange and trigger only on state changes.
  const onStateChangeRef = useRef(onStateChange);
  useEffect(() => {
    onStateChangeRef.current = onStateChange;
  }, [onStateChange]);

  useEffect(() => {
    onStateChangeRef.current(state);
  }, [state]);

  return (
    <WalletContext.Provider value={{ state, dispatch }}>
      {children}
    </WalletContext.Provider>
  );
};
