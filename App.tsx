
import React, { useCallback } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import { WalletProvider } from './context/WalletContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Wallets from './pages/Wallets';
import Portfolio from './pages/Portfolio';
import BuySell from './pages/BuySell';
import Exchange from './pages/Exchange';
import Earn from './pages/Earn';
import Transactions from './pages/Transactions';
import Deposit from './pages/Deposit';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Register from './pages/Register';
import Admin from './pages/Admin';
import ProtectedRoute from './components/ProtectedRoute';
import { PricesProvider } from './context/PricesContext';
import { WalletState, CoinID } from './types';
import { usePrices } from './hooks/usePrices';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <PricesProvider>
        <div className="bg-slate-900 text-slate-200 font-sans">
          <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin" element={
            <ProtectedRoute adminOnly={true}>
              <Admin />
            </ProtectedRoute>
          } />
          <Route path="/*" element={
            <ProtectedRoute>
              <MainAppLayout />
            </ProtectedRoute>
          } />
        </Routes>
        </div>
      </PricesProvider>
    </AuthProvider>
  );
};

const MainAppLayout: React.FC = () => {
  const { currentUser, updateCurrentUserFinancials } = useAuth();
  const { getPrice } = usePrices();

  const handleStateChange = useCallback((newState: WalletState) => {
    if (currentUser) {
      updateCurrentUserFinancials(currentUser.id, newState);
    }
  }, [currentUser, updateCurrentUserFinancials]);

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  // Fix transactions with missing USD values using current live prices
  const fixedTransactions = currentUser.transactions.map(tx => {
    if (tx.usdValue && tx.usdValue > 0) {
      // If transaction already has a valid USD value, keep it
      return tx;
    }
    
    // Get the coin ID from either coinId field or currency field
    const coinId = tx.coinId || tx.currency;
    
    // Only calculate for valid crypto coins, not fiat currencies
    if (!coinId || !Object.values(CoinID).includes(coinId as CoinID)) {
      return {
        ...tx,
        usdValue: tx.usdValue || 0
      };
    }
    
    // Calculate USD value using current live prices
    const currentPrice = getPrice(coinId as CoinID);
    const calculatedUsdValue = tx.amount * currentPrice;
    
    return {
      ...tx,
      usdValue: calculatedUsdValue,
      price: currentPrice, // Update price to current price for consistency
      coinId: coinId as CoinID // Ensure coinId is set
    };
  });

  return (
    <WalletProvider
      key={currentUser.id}
      initialState={{
        wallets: currentUser.wallets,
        cash: currentUser.cash ?? [],
        transactions: fixedTransactions,
        staked: currentUser.staked
      }}
      onStateChange={handleStateChange}
    >
      <div className="flex h-screen bg-slate-900 text-slate-200 font-sans">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
            <Routes>
              <Route path="/" element={<Navigate to="/wallets" replace />} />
              <Route path="/wallets" element={<Wallets />} />
              <Route path="/portfolio" element={<Portfolio />} />
              <Route path="/buy-sell" element={<BuySell />} />
              <Route path="/exchange" element={<Exchange />} />
              <Route path="/earn" element={<Earn />} />
              <Route path="/deposit" element={<Deposit />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/history" element={<Transactions />} />
              <Route path="*" element={<Navigate to="/wallets" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </WalletProvider>
  );
};


export default App;
