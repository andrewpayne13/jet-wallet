
import React, { useState, useEffect, useCallback } from 'react';
import { useWallet } from '../hooks/useWallet';
import { COINS } from '../constants';
import { usePrices } from '../hooks/usePrices';
import { CoinID, TransactionType, isValidCoinID } from '../types';

const Spinner: React.FC = () => (
    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
);

const BuySell: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy');

    return (
        <div className="max-w-xl mx-auto">
            <div className="bg-slate-800 rounded-xl shadow-lg">
                <div className="flex border-b border-slate-700">
                    <button onClick={() => setActiveTab('buy')} className={`w-1/2 p-4 font-semibold transition-colors ${activeTab === 'buy' ? 'text-white bg-slate-700/50' : 'text-slate-400 hover:bg-slate-700/30'}`}>
                        Buy Crypto
                    </button>
                    <button onClick={() => setActiveTab('sell')} className={`w-1/2 p-4 font-semibold transition-colors ${activeTab === 'sell' ? 'text-white bg-slate-700/50' : 'text-slate-400 hover:bg-slate-700/30'}`}>
                        Sell Crypto
                    </button>
                </div>
                <div className="p-6 md:p-8">
                    {activeTab === 'buy' ? <TransactionForm type="buy" /> : <TransactionForm type="sell" />}
                </div>
            </div>
        </div>
    );
};

const TransactionForm: React.FC<{ type: 'buy' | 'sell' }> = ({ type }) => {
    const { state, dispatch } = useWallet();
    const { wallets } = state;
    const { getPrice } = usePrices();

    const [fiatAmount, setFiatAmount] = useState('');
    const [cryptoAmount, setCryptoAmount] = useState('');
    const [selectedCoinId, setSelectedCoinId] = useState<CoinID>(CoinID.BTC);
    const [isProcessing, setIsProcessing] = useState(false);
    const [resultMessage, setResultMessage] = useState('');

    const coin = COINS[selectedCoinId];
    const price = getPrice(selectedCoinId);
    const wallet = wallets.find(w => w.coinId === selectedCoinId);

    useEffect(() => {
        setFiatAmount('');
        setCryptoAmount('');
    }, [type, selectedCoinId]);

    const handleFiatChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setFiatAmount(value);
        if (value) {
            setCryptoAmount((parseFloat(value) / price).toFixed(8));
        } else {
            setCryptoAmount('');
        }
    };

    const handleCryptoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setCryptoAmount(value);
        if (value) {
            setFiatAmount((parseFloat(value) * price).toFixed(2));
        } else {
            setFiatAmount('');
        }
    };
    
    const handleSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        setResultMessage('');
        
        // Validation
        const amountNum = parseFloat(cryptoAmount);
        const fiatNum = parseFloat(fiatAmount);
        
        if (!amountNum || amountNum <= 0) {
            setResultMessage('Error: Please enter a valid amount.');
            setTimeout(() => setResultMessage(''), 3000);
            return;
        }
        
        if (!fiatNum || fiatNum <= 0) {
            setResultMessage('Error: Please enter a valid USD amount.');
            setTimeout(() => setResultMessage(''), 3000);
            return;
        }
        
        if (!isValidCoinID(selectedCoinId)) {
            setResultMessage('Error: Invalid cryptocurrency selected.');
            setTimeout(() => setResultMessage(''), 3000);
            return;
        }

        if (type === 'sell') {
            if (!wallet || wallet.balance < amountNum) {
                setResultMessage('Error: Insufficient funds to sell.');
                setTimeout(() => setResultMessage(''), 3000);
                return;
            }
        }

        // Minimum transaction limits
        if (fiatNum < 1) {
            setResultMessage('Error: Minimum transaction amount is $1.00.');
            setTimeout(() => setResultMessage(''), 3000);
            return;
        }

        setIsProcessing(true);
        
        // Simulate async transaction
        setTimeout(() => {
            try {
                dispatch({
                    type: 'SIMULATE_TRANSACTION',
                    payload: {
                        type: type === 'buy' ? TransactionType.BUY : TransactionType.SELL,
                        coinId: selectedCoinId,
                        amount: amountNum,
                        usdValue: fiatNum
                    }
                });
                setResultMessage(`${type === 'buy' ? 'Purchase' : 'Sale'} successful!`);
                setFiatAmount('');
                setCryptoAmount('');
                setTimeout(() => setResultMessage(''), 3000);
            } catch (error) {
                setResultMessage('Error: Transaction failed. Please try again.');
                setTimeout(() => setResultMessage(''), 3000);
            } finally {
                setIsProcessing(false);
            }
        }, 1500);
    }, [cryptoAmount, fiatAmount, selectedCoinId, type, wallet, dispatch]);

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">You {type === 'buy' ? 'spend' : 'sell'}</label>
                <div className="flex">
                    <input
                        type="number"
                        placeholder="0.00"
                        value={type === 'buy' ? fiatAmount : cryptoAmount}
                        onChange={type === 'buy' ? handleFiatChange : handleCryptoChange}
                        className="w-full bg-slate-700 border-none rounded-l-md p-3 text-white focus:ring-2 focus:ring-blue-500 z-10"
                    />
                    <div className="bg-slate-700 p-3 rounded-r-md text-white font-semibold">
                         {type === 'buy' ? 'USD' : selectedCoinId}
                    </div>
                </div>
                {type === 'sell' && <p className="text-xs text-slate-400 mt-1 pl-1">Balance: {wallet?.balance.toFixed(6) ?? '0.00'} {selectedCoinId}</p>}
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">You get</label>
                <div className="flex">
                     <input
                        type="number"
                        placeholder="0.00"
                        value={type === 'buy' ? cryptoAmount : fiatAmount}
                        onChange={type === 'buy' ? handleCryptoChange : handleFiatChange}
                        className="w-full bg-slate-700 border-none rounded-l-md p-3 text-white focus:ring-2 focus:ring-blue-500 z-10"
                    />
                     <div className="bg-slate-700 p-3 rounded-r-md text-white font-semibold">
                         {type === 'buy' ? (
                            <select value={selectedCoinId} onChange={e => setSelectedCoinId(e.target.value as CoinID)} className="bg-transparent border-none focus:ring-0">
                                {Object.values(COINS).map(c => <option key={c.id} value={c.id}>{c.id}</option>)}
                            </select>
                         ) : 'USD'}
                    </div>
                </div>
            </div>
            
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-lg flex justify-center items-center mt-6 transition" disabled={isProcessing || !cryptoAmount || !fiatAmount}>
                 {isProcessing ? <Spinner /> : (type === 'buy' ? 'Buy ' + selectedCoinId : 'Sell ' + selectedCoinId)}
            </button>
            {resultMessage && (
                    <div className={`mt-4 text-center p-2 rounded-md ${resultMessage.includes('Error') ? 'bg-red-500/20 text-red-300' : 'bg-green-500/20 text-green-300'}`}>
                        {resultMessage}
                    </div>
                )}
        </form>
    );
};

export default BuySell;
