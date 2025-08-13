
import React, { useMemo } from 'react';
import PortfolioChart from '../components/PortfolioChart';
import { useWallet } from '../hooks/useWallet';
import { COINS } from '../constants';
import { usePrices } from '../hooks/usePrices';
import CoinLogo from '../components/CoinLogo';

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
    <div className={`bg-slate-800 rounded-xl shadow-lg p-6 ${className}`}>{children}</div>
);

const Portfolio: React.FC = () => {
    const { state } = useWallet();
    const { wallets } = state;
    const { getPrice } = usePrices();

    const portfolioData = useMemo(() => 
        wallets.map(wallet => {
            const coin = COINS[wallet.coinId];
            const price = getPrice(wallet.coinId);
            const usdValue = wallet.balance * price;
            return {
                ...coin,
                balance: wallet.balance,
                usdValue,
                usdPrice: price,
            };
        }).sort((a,b) => b.usdValue - a.usdValue), 
    [wallets, getPrice]);

    const totalUSDValue = useMemo(() => portfolioData.reduce((sum, asset) => sum + asset.usdValue, 0), [portfolioData]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
                <Card>
                    <h2 className="text-2xl font-bold text-white mb-4">Asset Allocation</h2>
                    <PortfolioChart />
                </Card>
            </div>
            <div className="lg:col-span-1 space-y-6">
                <Card>
                    <h2 className="text-xl font-bold text-white">Portfolio Value</h2>
                    <p className="text-3xl font-light text-blue-400 mt-2">${totalUSDValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </Card>
                <Card>
                    <h2 className="text-xl font-bold text-white mb-4">Your Assets</h2>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                        {portfolioData.map(asset => (
                            <div key={asset.id} className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <CoinLogo coinId={asset.id} className="h-8 w-8" size={32} />
                                    <div className="ml-3">
                                        <p className="font-semibold text-white">{asset.name}</p>
                                        <p className="text-sm text-slate-400">{asset.balance.toFixed(4)} {asset.id}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold text-white">${asset.usdValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                    <p className="text-sm text-slate-400">${asset.usdPrice.toLocaleString()}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Portfolio;
