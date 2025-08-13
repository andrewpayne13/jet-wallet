
import React from 'react';
import { useLocation } from 'react-router-dom';

const Header: React.FC = () => {
  const location = useLocation();

  const getTitle = () => {
    const path = location.pathname.split('/')[1];
    switch(path) {
      case 'wallets': return 'My Wallets';
      case 'portfolio': return 'Portfolio Overview';
      case 'buy-sell': return 'Buy & Sell Crypto';
      case 'exchange': return 'Crypto Exchange';
      case 'earn': return 'Earn Rewards';
      case 'history': return 'Transaction History';
      default: return 'Dashboard';
    }
  };

  return (
    <header className="flex-shrink-0 glass border-b border-white/10 px-4 md:px-6 lg:px-8">
      <div className="flex items-center h-16">
        <h1 className="text-xl md:text-2xl font-extrabold text-white/90 tracking-wide animate-fade-in">{getTitle()}</h1>
      </div>
    </header>
  );
};

export default Header;
