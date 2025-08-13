
import React, { useState, useMemo } from 'react';
import { useWallet } from '../hooks/useWallet';
import { COINS } from '../constants';
import { Transaction, TransactionType, CoinID } from '../types';
import CoinLogo from '../components/CoinLogo';

const TypeBadge: React.FC<{ type: TransactionType }> = ({ type }) => {
    const colors = {
        [TransactionType.RECEIVE]: 'bg-green-500/20 text-green-300',
        [TransactionType.BUY]: 'bg-green-500/20 text-green-300',
        [TransactionType.SEND]: 'bg-red-500/20 text-red-300',
        [TransactionType.SELL]: 'bg-red-500/20 text-red-300',
        [TransactionType.SWAP]: 'bg-blue-500/20 text-blue-300',
        [TransactionType.STAKE]: 'bg-purple-500/20 text-purple-300',
        [TransactionType.UNSTAKE]: 'bg-yellow-500/20 text-yellow-300',
    };
    return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${colors[type]}`}>{type}</span>;
};


const Transactions: React.FC = () => {
    const { state } = useWallet();
    const [filterType, setFilterType] = useState<TransactionType | 'ALL'>('ALL');
    const [filterCoin, setFilterCoin] = useState<CoinID | 'ALL'>('ALL');

    const filteredTransactions = useMemo(() => {
        return state.transactions.filter(tx => {
            const typeMatch = filterType === 'ALL' || tx.type === filterType;
            const coinMatch = filterCoin === 'ALL' || tx.coinId === filterCoin;
            return typeMatch && coinMatch;
        });
    }, [state.transactions, filterType, filterCoin]);

    return (
        <div className="bg-slate-800 rounded-xl shadow-lg">
            <div className="p-6 border-b border-slate-700">
                <h2 className="text-2xl font-bold text-white mb-4">Transaction History</h2>
                <div className="flex flex-col md:flex-row gap-4">
                    <select value={filterType} onChange={e => setFilterType(e.target.value as any)} className="bg-slate-700 border border-slate-600 rounded-md p-2 text-white focus:ring-blue-500 focus:border-blue-500">
                        <option value="ALL">All Types</option>
                        {Object.values(TransactionType).map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <select value={filterCoin} onChange={e => setFilterCoin(e.target.value as any)} className="bg-slate-700 border border-slate-600 rounded-md p-2 text-white focus:ring-blue-500 focus:border-blue-500">
                        <option value="ALL">All Coins</option>
                        {Object.values(CoinID).map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-300">
                    <thead className="text-xs text-slate-400 uppercase bg-slate-700/50">
                        <tr>
                            <th scope="col" className="px-6 py-3">Date</th>
                            <th scope="col" className="px-6 py-3">Type</th>
                            <th scope="col" className="px-6 py-3">Asset</th>
                            <th scope="col" className="px-6 py-3 text-right">Amount</th>
                            <th scope="col" className="px-6 py-3 text-right">Value (USD)</th>
                            <th scope="col" className="px-6 py-3">Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTransactions.map(tx => {
                             const coin = COINS[tx.coinId];
                             const sign = tx.type === TransactionType.SEND || tx.type === TransactionType.SELL || (tx.type === TransactionType.SWAP && tx.from === 'Self') ? '-' : '+';
                             return (
                                <tr key={tx.id} className="bg-slate-800 border-b border-slate-700 hover:bg-slate-700/50">
                                    <td className="px-6 py-4 whitespace-nowrap">{new Date(tx.date).toLocaleString()}</td>
                                    <td className="px-6 py-4"><TypeBadge type={tx.type} /></td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <CoinLogo coinId={tx.coinId as CoinID} className="h-6 w-6 mr-2" size={24} />
                                            <span>{tx.coinId}</span>
                                        </div>
                                    </td>
                                    <td className={`px-6 py-4 text-right font-mono ${sign === '+' ? 'text-green-400' : 'text-red-400'}`}>
                                        {sign}{tx.amount.toFixed(8)}
                                    </td>
                                    <td className="px-6 py-4 text-right font-mono">${(tx.usdValue || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                                    <td className="px-6 py-4">
                                        <div className="max-w-xs truncate" title={tx.hash}>
                                            <span className="font-semibold text-slate-400">Hash: </span>{tx.hash}
                                        </div>
                                    </td>
                                </tr>
                             );
                        })}
                    </tbody>
                </table>
                 {filteredTransactions.length === 0 && (
                    <div className="text-center p-8 text-slate-500">
                        No transactions match your filters.
                    </div>
                )}
            </div>
        </div>
    );
};

export default Transactions;
