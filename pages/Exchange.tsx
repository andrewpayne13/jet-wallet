
import React, { useState, useEffect, useMemo } from 'react';
import { useWallet } from '../hooks/useWallet';
import { COINS } from '../constants';
import { usePrices } from '../hooks/usePrices';
import { CoinID, TransactionType } from '../types';

const Spinner: React.FC = () => (
    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
);

const Exchange: React.FC = () => {
    const { state, dispatch } = useWallet();
    const { wallets } = state;
    const { getPrice } = usePrices();
    
    const [fromCoinId, setFromCoinId] = useState<CoinID>(CoinID.BTC);
    const [toCoinId, setToCoinId] = useState<CoinID>(CoinID.ETH);
    const [fromAmount, setFromAmount] = useState('');
    const [toAmount, setToAmount] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [resultMessage, setResultMessage] = useState('');

    const fromWallet = useMemo(() => wallets.find(w => w.coinId === fromCoinId), [wallets, fromCoinId]);

    useEffect(() => {
        if (fromCoinId === toCoinId) {
            const otherCoin = Object.values(COINS).find(c => c.id !== fromCoinId);
            if(otherCoin) setToCoinId(otherCoin.id);
        }
    }, [fromCoinId, toCoinId]);

    useEffect(() => {
        if (fromAmount) {
            const rate = getPrice(fromCoinId) / getPrice(toCoinId);
            const calculatedToAmount = parseFloat(fromAmount) * rate;
            setToAmount(calculatedToAmount.toFixed(8));
        } else {
            setToAmount('');
        }
    }, [fromAmount, fromCoinId, toCoinId, getPrice]);

    const handleSwap = (e: React.FormEvent) => {
        e.preventDefault();
        if (!fromAmount || !toAmount || !fromWallet) return;
        
        const fromAmountNum = parseFloat(fromAmount);
        const toAmountNum = parseFloat(toAmount);
        if (fromWallet.balance < fromAmountNum) {
            setResultMessage('Error: Insufficient funds.');
            setTimeout(() => setResultMessage(''), 3000);
            return;
        }

        setIsProcessing(true);
        setResultMessage('');
        setTimeout(() => {
            dispatch({
                type: 'SIMULATE_TRANSACTION',
                payload: {
                    type: TransactionType.SWAP,
                    // The reducer handles the split into two transactions
                    from: { coinId: fromCoinId, amount: fromAmountNum, usdValue: fromAmountNum * getPrice(fromCoinId) },
                    to: { coinId: toCoinId, amount: toAmountNum, usdValue: toAmountNum * getPrice(toCoinId) },
                    // These are placeholders for the reducer
                    coinId: fromCoinId,
                    amount: fromAmountNum,
                    usdValue: fromAmountNum * getPrice(fromCoinId)
                }
            });
            setIsProcessing(false);
            setResultMessage('Swap successful!');
            setFromAmount('');
            setToAmount('');
            setTimeout(() => setResultMessage(''), 3000);
        }, 2000);
    };

    const swapCoins = () => {
        setFromCoinId(toCoinId);
        setToCoinId(fromCoinId);
    };

    const CoinSelector: React.FC<{ selected: CoinID, onChange: (id: CoinID) => void, exclude?: CoinID }> = ({ selected, onChange, exclude }) => (
        <select value={selected} onChange={(e) => onChange(e.target.value as CoinID)} className="bg-slate-700 border-none rounded-r-md p-3 text-white focus:ring-2 focus:ring-blue-500">
            {Object.values(COINS).filter(c => c.id !== exclude).map(coin => (
                <option key={coin.id} value={coin.id}>{coin.id}</option>
            ))}
        </select>
    );

    return (
        <div className="max-w-xl mx-auto">
            <div className="bg-slate-800 rounded-xl shadow-lg p-6 md:p-8">
                <h2 className="text-2xl font-bold text-white text-center mb-6">Crypto Swap</h2>
                <form onSubmit={handleSwap} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">From</label>
                        <div className="flex">
                            <input
                                type="number"
                                step="any"
                                value={fromAmount}
                                onChange={e => setFromAmount(e.target.value)}
                                placeholder="0.00"
                                className="w-full bg-slate-700 border-none rounded-l-md p-3 text-white focus:ring-2 focus:ring-blue-500 z-10"
                            />
                            <CoinSelector selected={fromCoinId} onChange={setFromCoinId} exclude={toCoinId} />
                        </div>
                         <p className="text-xs text-slate-400 mt-1 pl-1">Balance: {fromWallet?.balance.toFixed(6) ?? '0.00'} {fromCoinId}</p>
                    </div>

                    <div className="flex justify-center items-center">
                        <div className="w-full h-px bg-slate-600"></div>
                        <button type="button" onClick={swapCoins} className="p-2 rounded-full bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white transition-transform duration-300 hover:rotate-180 mx-4">
                            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v18m7-15L5 21m0-18l14 14"/></svg>
                        </button>
                        <div className="w-full h-px bg-slate-600"></div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">To</label>
                        <div className="flex">
                             <input
                                type="number"
                                value={toAmount}
                                readOnly
                                placeholder="0.00"
                                className="w-full bg-slate-900 border-none rounded-l-md p-3 text-white cursor-not-allowed"
                            />
                            <CoinSelector selected={toCoinId} onChange={setToCoinId} exclude={fromCoinId} />
                        </div>
                    </div>
                    
                    <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-lg flex justify-center items-center mt-6 transition" disabled={isProcessing || !fromAmount || !toAmount}>
                        {isProcessing ? <Spinner /> : 'Swap'}
                    </button>
                </form>
                {resultMessage && (
                    <div className={`mt-4 text-center p-2 rounded-md ${resultMessage.includes('Error') ? 'bg-red-500/20 text-red-300' : 'bg-green-500/20 text-green-300'}`}>
                        {resultMessage}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Exchange;
