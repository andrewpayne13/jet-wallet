
import React, { useState, useMemo } from 'react';
import { useWallet } from '../hooks/useWallet';
import { COINS } from '../constants';
import { usePrices } from '../hooks/usePrices';
import { CoinID } from '../types';
import CoinLogo from '../components/CoinLogo';

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
    <div className={`bg-slate-800 rounded-xl shadow-lg p-6 ${className}`}>{children}</div>
);

const Spinner: React.FC = () => (
    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
);

const Earn: React.FC = () => {
    const { state, dispatch } = useWallet();
    const { wallets, staked } = state;
    const { getPrice } = usePrices();

    const [amount, setAmount] = useState('');
    const [selectedCoinId, setSelectedCoinId] = useState<CoinID | null>(null);
    const [actionType, setActionType] = useState<'stake' | 'unstake'>('stake');
    const [isProcessing, setIsProcessing] = useState(false);
    
    const stakingCoins = useMemo(() => Object.values(COINS).filter(c => c.stakingApy), []);
    
    const selectedWallet = useMemo(() => wallets.find(w => w.coinId === selectedCoinId), [wallets, selectedCoinId]);
    const selectedStaked = useMemo(() => staked.find(s => s.coinId === selectedCoinId), [staked, selectedCoinId]);
    
    const handleAction = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCoinId || !amount) return;
        
        const numAmount = parseFloat(amount);
        if (actionType === 'stake' && selectedWallet && selectedWallet.balance < numAmount) {
            alert("Insufficient funds to stake.");
            return;
        }
        if (actionType === 'unstake' && selectedStaked && selectedStaked.amount < numAmount) {
            alert("Amount exceeds staked balance.");
            return;
        }

        setIsProcessing(true);
        setTimeout(() => {
            dispatch({
                type: actionType === 'stake' ? 'STAKE' : 'UNSTAKE',
                payload: { coinId: selectedCoinId, amount: numAmount }
            });
            setIsProcessing(false);
            setAmount('');
            setSelectedCoinId(null);
        }, 1500);
    };
    
    const openModal = (coinId: CoinID, type: 'stake' | 'unstake') => {
        setSelectedCoinId(coinId);
        setActionType(type);
    };

    const closeModal = () => {
        setSelectedCoinId(null);
        setAmount('');
    };

    const totalStakedValue = staked.reduce((acc, s) => acc + s.amount * getPrice(s.coinId), 0);

    return (
        <div className="space-y-6">
            <Card>
                <h2 className="text-2xl font-bold text-white">Total Staked Value</h2>
                <p className="text-4xl font-light text-green-400 mt-2">${totalStakedValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                <p className="text-slate-400 mt-1">Estimated annual earnings: <span className="text-green-400 font-semibold">~$...</span> (simulation)</p>
            </Card>

            <h3 className="text-xl font-bold text-white pt-4">Staking Opportunities</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stakingCoins.map(coin => {
                    const wallet = wallets.find(w => w.coinId === coin.id);
                    const stakedAsset = staked.find(s => s.coinId === coin.id);
                    
                    return (
                        <Card key={coin.id}>
                            <div className="flex items-center mb-4">
                                <CoinLogo coinId={coin.id} className="h-10 w-10" size={40} />
                                <div className="ml-4">
                                    <h4 className="text-xl font-bold text-white">{coin.name}</h4>
                                    <p className="text-green-400 font-semibold">APY: {coin.stakingApy}%</p>
                                </div>
                            </div>
                            <div className="space-y-2 text-sm">
                                <p><span className="font-semibold text-slate-300">Available:</span> {wallet?.balance.toFixed(4) || '0.0000'} {coin.id}</p>
                                <p><span className="font-semibold text-slate-300">Staked:</span> {stakedAsset?.amount.toFixed(4) || '0.0000'} {coin.id}</p>
                            </div>
                            <div className="mt-6 flex space-x-4">
                                <button onClick={() => openModal(coin.id, 'stake')} className="w-full px-4 py-2 rounded-md font-semibold text-white bg-green-600 hover:bg-green-500 transition-colors">Stake</button>
                                {stakedAsset && stakedAsset.amount > 0 && 
                                    <button onClick={() => openModal(coin.id, 'unstake')} className="w-full px-4 py-2 rounded-md font-semibold text-white bg-slate-600 hover:bg-slate-500 transition-colors">Unstake</button>
                                }
                            </div>
                        </Card>
                    );
                })}
            </div>

            {selectedCoinId && (
                 <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
                    <div className="bg-slate-800 rounded-lg shadow-xl w-full max-w-md m-4">
                        <div className="flex justify-between items-center p-4 border-b border-slate-700">
                             <h3 className="text-lg font-bold text-white capitalize">{actionType} {selectedCoinId}</h3>
                            <button onClick={closeModal} className="text-slate-400 hover:text-white">&times;</button>
                        </div>
                        <form onSubmit={handleAction} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Amount to {actionType}</label>
                                <input
                                    type="number"
                                    step="any"
                                    value={amount}
                                    onChange={e => setAmount(e.target.value)}
                                    placeholder="0.00"
                                    className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-white focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                                 <p className="text-xs text-slate-400 mt-1 pl-1">
                                    {actionType === 'stake' ? `Available: ${selectedWallet?.balance.toFixed(6) ?? '0'}` : `Staked: ${selectedStaked?.amount.toFixed(6) ?? '0'}`}
                                 </p>
                            </div>
                            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-lg flex justify-center items-center transition" disabled={isProcessing || !amount}>
                                {isProcessing ? <Spinner /> : `Confirm ${actionType}`}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Earn;
