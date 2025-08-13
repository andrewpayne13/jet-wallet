import { CoinID, TransactionType, isValidEmail, isValidCoinID, isValidTransactionType } from '../types';

// Number validation utilities
export const isValidAmount = (amount: number | string): boolean => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return !isNaN(num) && num > 0 && isFinite(num);
};

export const isValidPrice = (price: number | string): boolean => {
  const num = typeof price === 'string' ? parseFloat(price) : price;
  return !isNaN(num) && num >= 0 && isFinite(num);
};

// Format utilities
export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `$${amount.toFixed(2)}`;
  }
};

export const formatCrypto = (amount: number, decimals: number = 8): string => {
  if (amount === 0) return '0';
  
  // For very small amounts, show more decimals
  if (amount < 0.001) {
    return amount.toFixed(decimals);
  }
  
  // For larger amounts, show fewer decimals
  if (amount >= 1) {
    return amount.toFixed(Math.min(decimals, 6));
  }
  
  return amount.toFixed(decimals);
};

export const formatPercentage = (value: number): string => {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
};

// Date utilities
export const formatDate = (date: string | Date): string => {
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'Invalid Date';
  }
};

export const formatRelativeTime = (date: string | Date): string => {
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return formatDate(d);
  } catch {
    return 'Unknown';
  }
};

// Transaction validation
export const validateTransaction = (
  type: TransactionType,
  coinId: CoinID,
  amount: number,
  usdValue: number,
  availableBalance?: number
): { isValid: boolean; error?: string } => {
  if (!isValidTransactionType(type)) {
    return { isValid: false, error: 'Invalid transaction type' };
  }

  if (!isValidCoinID(coinId)) {
    return { isValid: false, error: 'Invalid cryptocurrency' };
  }

  if (!isValidAmount(amount)) {
    return { isValid: false, error: 'Invalid amount' };
  }

  if (!isValidPrice(usdValue)) {
    return { isValid: false, error: 'Invalid USD value' };
  }

  if (usdValue < 1) {
    return { isValid: false, error: 'Minimum transaction amount is $1.00' };
  }

  // Check balance for sell/send operations
  if ((type === TransactionType.SELL || type === TransactionType.SEND) && availableBalance !== undefined) {
    if (availableBalance < amount) {
      return { isValid: false, error: 'Insufficient balance' };
    }
  }

  return { isValid: true };
};

// Input sanitization
export const sanitizeNumericInput = (value: string): string => {
  // Remove any non-numeric characters except decimal point
  return value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
};

export const sanitizeEmailInput = (value: string): string => {
  // Basic email sanitization - remove spaces and convert to lowercase
  return value.trim().toLowerCase();
};

// Error handling utilities
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unexpected error occurred';
};

// Debounce utility for performance
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Local storage utilities with error handling
export const safeLocalStorage = {
  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.warn(`Failed to get item from localStorage: ${key}`, error);
      return null;
    }
  },

  setItem: (key: string, value: string): boolean => {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.warn(`Failed to set item in localStorage: ${key}`, error);
      return false;
    }
  },

  removeItem: (key: string): boolean => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.warn(`Failed to remove item from localStorage: ${key}`, error);
      return false;
    }
  },
};
