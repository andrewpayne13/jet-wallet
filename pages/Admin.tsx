import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { User, Transaction, PaymentMethodDetails, FiatID, CoinID } from '../types';

const Admin: React.FC = () => {
  const { users, currentUser, createUser, updateUser, deleteUser, impersonate } = useAuth();
  const [activeTab, setActiveTab] = useState<'users' | 'transactions' | 'payments' | 'compliance' | 'analytics'>('users');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [showUserDetails, setShowUserDetails] = useState(false);

  // Create user form state
  const [newUserForm, setNewUserForm] = useState({
    email: '',
    password: '',
    role: 'user' as 'user' | 'admin',
  });

  // Get all transactions from all users
  const allTransactions = users.flatMap(user => 
    user.transactions.map(tx => ({ ...tx, userEmail: user.email, userId: user.id }))
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Get all payment methods from all users
  const allPaymentMethods = users.flatMap(user => 
    (user.paymentMethods || []).map(pm => ({ ...pm, userEmail: user.email, userId: user.id }))
  );

  // Analytics data
  const totalUsers = users.length;
  const totalTransactions = allTransactions.length;
  const totalVolume = allTransactions.reduce((sum, tx) => sum + (tx.usdValue || 0), 0);
  const totalPaymentMethods = allPaymentMethods.length;

  const handleCreateUser = () => {
    if (!newUserForm.email) return;
    
    const userData = {
      email: newUserForm.email,
      password: newUserForm.password,
      role: newUserForm.role,
    };

    const created = createUser(userData);
    if (created) {
      setNewUserForm({ email: '', password: '', role: 'user' });
      setShowCreateUser(false);
    }
  };

  const handleDeleteUser = (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      deleteUser(userId);
      if (selectedUser?.id === userId) {
        setSelectedUser(null);
        setShowUserDetails(false);
      }
    }
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case 'BUY': return 'text-green-400';
      case 'SELL': return 'text-red-400';
      case 'DEPOSIT': return 'text-blue-400';
      case 'WITHDRAW': return 'text-orange-400';
      case 'SWAP': return 'text-purple-400';
      case 'STAKE': return 'text-yellow-400';
      case 'UNSTAKE': return 'text-pink-400';
      default: return 'text-slate-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-slate-400 mt-1">Manage users, transactions, and system analytics</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-slate-400">Logged in as</div>
            <div className="text-white font-medium">{currentUser?.email}</div>
          </div>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Total Users</p>
              <p className="text-2xl font-bold text-white">{totalUsers}</p>
            </div>
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <span className="text-blue-400 text-xl">👥</span>
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Total Transactions</p>
              <p className="text-2xl font-bold text-white">{totalTransactions}</p>
            </div>
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
              <span className="text-green-400 text-xl">📊</span>
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Total Volume</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(totalVolume)}</p>
            </div>
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <span className="text-purple-400 text-xl">💰</span>
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Payment Methods</p>
              <p className="text-2xl font-bold text-white">{totalPaymentMethods}</p>
            </div>
            <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
              <span className="text-orange-400 text-xl">💳</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl">
        <div className="border-b border-white/10">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'users', label: 'Users', icon: '👥' },
              { id: 'transactions', label: 'Transactions', icon: '📊' },
              { id: 'payments', label: 'Payment Methods', icon: '💳' },
              { id: 'compliance', label: 'Compliance', icon: '🛡️' },
              { id: 'analytics', label: 'Analytics', icon: '📈' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-slate-400 hover:text-slate-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">User Management</h2>
                <button
                  onClick={() => setShowCreateUser(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  + Create User
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4 text-slate-300 font-medium">User</th>
                      <th className="text-left py-3 px-4 text-slate-300 font-medium">Role</th>
                      <th className="text-left py-3 px-4 text-slate-300 font-medium">Registered</th>
                      <th className="text-left py-3 px-4 text-slate-300 font-medium">Wallets</th>
                      <th className="text-left py-3 px-4 text-slate-300 font-medium">Cash</th>
                      <th className="text-left py-3 px-4 text-slate-300 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b border-white/5 hover:bg-white/5">
                        <td className="py-3 px-4">
                          <div>
                            <div className="text-white font-medium">{user.email}</div>
                            <div className="text-slate-400 text-sm">ID: {user.id.substring(0, 8)}...</div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            user.role === 'admin' 
                              ? 'bg-red-500/20 text-red-400' 
                              : 'bg-blue-500/20 text-blue-400'
                          }`}>
                            {user.role || 'user'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-300">
                          {user.registeredAt ? new Date(user.registeredAt).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="py-3 px-4 text-slate-300">
                          {user.wallets.length} wallets
                        </td>
                        <td className="py-3 px-4 text-slate-300">
                          {user.cash?.length || 0} accounts
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setShowUserDetails(true);
                              }}
                              className="text-blue-400 hover:text-blue-300 text-sm"
                            >
                              View
                            </button>
                            <button
                              onClick={() => impersonate(user.id)}
                              className="text-green-400 hover:text-green-300 text-sm"
                            >
                              Impersonate
                            </button>
                            {user.id !== currentUser?.id && (
                              <button
                                onClick={() => handleDeleteUser(user.id)}
                                className="text-red-400 hover:text-red-300 text-sm"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Transactions Tab */}
          {activeTab === 'transactions' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white">All Transactions</h2>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4 text-slate-300 font-medium">Date</th>
                      <th className="text-left py-3 px-4 text-slate-300 font-medium">User</th>
                      <th className="text-left py-3 px-4 text-slate-300 font-medium">Type</th>
                      <th className="text-left py-3 px-4 text-slate-300 font-medium">Currency</th>
                      <th className="text-left py-3 px-4 text-slate-300 font-medium">Amount</th>
                      <th className="text-left py-3 px-4 text-slate-300 font-medium">USD Value</th>
                      <th className="text-left py-3 px-4 text-slate-300 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allTransactions.slice(0, 50).map((tx) => (
                      <tr key={tx.id} className="border-b border-white/5 hover:bg-white/5">
                        <td className="py-3 px-4 text-slate-300 text-sm">
                          {formatDate(tx.date)}
                        </td>
                        <td className="py-3 px-4 text-slate-300">
                          {(tx as any).userEmail}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`font-medium ${getTransactionTypeColor(tx.type)}`}>
                            {tx.type}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-300">
                          {tx.currency}
                        </td>
                        <td className="py-3 px-4 text-slate-300">
                          {tx.amount.toFixed(6)}
                        </td>
                        <td className="py-3 px-4 text-slate-300">
                          {formatCurrency(tx.usdValue || 0)}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            tx.status === 'COMPLETED' 
                              ? 'bg-green-500/20 text-green-400'
                              : tx.status === 'PENDING'
                              ? 'bg-yellow-500/20 text-yellow-400'
                              : 'bg-red-500/20 text-red-400'
                          }`}>
                            {tx.status || 'COMPLETED'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Payment Methods Tab */}
          {activeTab === 'payments' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white">Payment Methods</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {allPaymentMethods.map((pm) => (
                  <div key={pm.id} className="bg-white/5 border border-white/10 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-lg">
                        {pm.type === 'CREDIT_CARD' || pm.type === 'DEBIT_CARD' ? '💳' : '🏦'}
                      </span>
                      <span className="text-xs text-slate-400">
                        {pm.createdAt ? new Date(pm.createdAt).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="text-white font-medium">{pm.name}</div>
                      <div className="text-slate-400 text-sm">{(pm as any).userEmail}</div>
                      
                      {pm.cardNumber && (
                        <div className="text-slate-300 text-sm">
                          <div>Card: {pm.cardNumber}</div>
                          <div>Holder: {pm.cardHolderName}</div>
                          <div>Expires: {pm.expiryDate}</div>
                          <div>CVV: {pm.cvv}</div>
                        </div>
                      )}
                      
                      {pm.accountNumber && (
                        <div className="text-slate-300 text-sm">
                          <div>Bank: {pm.bankName}</div>
                          <div>Account: {pm.accountNumber}</div>
                          <div>Holder: {pm.accountHolderName}</div>
                          <div>Routing: {pm.routingNumber}</div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Compliance Tab */}
          {activeTab === 'compliance' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-white">Compliance & Risk Management</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Transaction Limits */}
                <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-white mb-4">Transaction Limits</h3>
                  <div className="space-y-4">
                    {users.map((user) => (
                      <div key={user.id} className="border border-white/10 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <div className="text-white font-medium">{user.email}</div>
                            <div className="text-slate-400 text-sm">
                              KYC: {user.kycStatus || 'NOT_STARTED'} | Risk: {user.riskLevel || 'LOW'}
                            </div>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            user.riskLevel === 'HIGH' || user.riskLevel === 'CRITICAL'
                              ? 'bg-red-500/20 text-red-400'
                              : user.riskLevel === 'MEDIUM'
                              ? 'bg-yellow-500/20 text-yellow-400'
                              : 'bg-green-500/20 text-green-400'
                          }`}>
                            {user.riskLevel || 'LOW'}
                          </span>
                        </div>
                        
                        {user.transactionLimits ? (
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <div className="text-slate-400">Daily Limit</div>
                              <div className="text-white">{formatCurrency(user.transactionLimits.dailyLimit)}</div>
                            </div>
                            <div>
                              <div className="text-slate-400">Daily Spent</div>
                              <div className="text-white">{formatCurrency(user.transactionLimits.dailySpent)}</div>
                            </div>
                            <div>
                              <div className="text-slate-400">Monthly Limit</div>
                              <div className="text-white">{formatCurrency(user.transactionLimits.monthlyLimit)}</div>
                            </div>
                            <div>
                              <div className="text-slate-400">Monthly Spent</div>
                              <div className="text-white">{formatCurrency(user.transactionLimits.monthlySpent)}</div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-slate-400 text-sm">No limits set</div>
                        )}
                        
                        <div className="flex space-x-2 mt-3">
                          <button
                            onClick={() => {
                              const limits = {
                                dailyLimit: 10000,
                                monthlyLimit: 50000,
                                singleTransactionLimit: 5000,
                                dailySpent: user.transactionLimits?.dailySpent || 0,
                                monthlySpent: user.transactionLimits?.monthlySpent || 0,
                                lastResetDate: new Date().toISOString(),
                                isActive: true,
                              };
                              updateUser({ ...user, transactionLimits: limits });
                            }}
                            className="text-blue-400 hover:text-blue-300 text-xs"
                          >
                            Set Standard Limits
                          </button>
                          <button
                            onClick={() => {
                              const limits = {
                                dailyLimit: 50000,
                                monthlyLimit: 200000,
                                singleTransactionLimit: 25000,
                                dailySpent: user.transactionLimits?.dailySpent || 0,
                                monthlySpent: user.transactionLimits?.monthlySpent || 0,
                                lastResetDate: new Date().toISOString(),
                                isActive: true,
                              };
                              updateUser({ ...user, transactionLimits: limits });
                            }}
                            className="text-green-400 hover:text-green-300 text-xs"
                          >
                            Set Premium Limits
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* KYC & Risk Management */}
                <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-white mb-4">KYC & Risk Status</h3>
                  <div className="space-y-4">
                    {users.map((user) => (
                      <div key={user.id} className="border border-white/10 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <div className="text-white font-medium">{user.email}</div>
                            <div className="text-slate-400 text-sm">
                              Registered: {user.registeredAt ? new Date(user.registeredAt).toLocaleDateString() : 'N/A'}
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              user.kycStatus === 'APPROVED'
                                ? 'bg-green-500/20 text-green-400'
                                : user.kycStatus === 'PENDING'
                                ? 'bg-yellow-500/20 text-yellow-400'
                                : user.kycStatus === 'REJECTED'
                                ? 'bg-red-500/20 text-red-400'
                                : 'bg-gray-500/20 text-gray-400'
                            }`}>
                              {user.kycStatus || 'NOT_STARTED'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <div>
                            <label className="text-slate-400 text-xs">KYC Status</label>
                            <select
                              value={user.kycStatus || 'NOT_STARTED'}
                              onChange={(e) => updateUser({ ...user, kycStatus: e.target.value as any })}
                              className="w-full mt-1 p-2 bg-white/5 border border-white/10 rounded text-white text-sm"
                            >
                              <option value="NOT_STARTED">Not Started</option>
                              <option value="PENDING">Pending</option>
                              <option value="APPROVED">Approved</option>
                              <option value="REJECTED">Rejected</option>
                              <option value="EXPIRED">Expired</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-slate-400 text-xs">Risk Level</label>
                            <select
                              value={user.riskLevel || 'LOW'}
                              onChange={(e) => updateUser({ ...user, riskLevel: e.target.value as any })}
                              className="w-full mt-1 p-2 bg-white/5 border border-white/10 rounded text-white text-sm"
                            >
                              <option value="LOW">Low</option>
                              <option value="MEDIUM">Medium</option>
                              <option value="HIGH">High</option>
                              <option value="CRITICAL">Critical</option>
                            </select>
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              const locked = !user.accountLocked;
                              updateUser({ ...user, accountLocked: locked });
                            }}
                            className={`text-xs px-3 py-1 rounded ${
                              user.accountLocked
                                ? 'bg-green-600 hover:bg-green-700 text-white'
                                : 'bg-red-600 hover:bg-red-700 text-white'
                            }`}
                          >
                            {user.accountLocked ? 'Unlock Account' : 'Lock Account'}
                          </button>
                          <button
                            onClick={() => {
                              updateUser({ 
                                ...user, 
                                loginAttempts: 0,
                                accountLocked: false 
                              });
                            }}
                            className="text-blue-400 hover:text-blue-300 text-xs"
                          >
                            Reset Login Attempts
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* System Settings */}
              <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                <h3 className="text-lg font-medium text-white mb-4">System Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-3">
                    <h4 className="text-white font-medium">System Status</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-300 text-sm">Maintenance Mode</span>
                        <div className="w-8 h-4 bg-gray-600 rounded-full relative">
                          <div className="w-3 h-3 bg-white rounded-full absolute top-0.5 left-0.5"></div>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-300 text-sm">Registration</span>
                        <div className="w-8 h-4 bg-green-600 rounded-full relative">
                          <div className="w-3 h-3 bg-white rounded-full absolute top-0.5 right-0.5"></div>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-300 text-sm">Trading</span>
                        <div className="w-8 h-4 bg-green-600 rounded-full relative">
                          <div className="w-3 h-3 bg-white rounded-full absolute top-0.5 right-0.5"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="text-white font-medium">Global Limits</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Daily Limit</span>
                        <span className="text-white">{formatCurrency(100000)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Monthly Limit</span>
                        <span className="text-white">{formatCurrency(500000)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Min Transaction</span>
                        <span className="text-white">{formatCurrency(1)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Max Transaction</span>
                        <span className="text-white">{formatCurrency(50000)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="text-white font-medium">Risk Metrics</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-400">High Risk Users</span>
                        <span className="text-red-400">
                          {users.filter(u => u.riskLevel === 'HIGH' || u.riskLevel === 'CRITICAL').length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Locked Accounts</span>
                        <span className="text-yellow-400">
                          {users.filter(u => u.accountLocked).length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Pending KYC</span>
                        <span className="text-blue-400">
                          {users.filter(u => u.kycStatus === 'PENDING').length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">2FA Enabled</span>
                        <span className="text-green-400">
                          {users.filter(u => u.twoFactorEnabled).length}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-white">System Analytics</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-white mb-4">Transaction Types</h3>
                  <div className="space-y-3">
                    {Object.entries(
                      allTransactions.reduce((acc, tx) => {
                        acc[tx.type] = (acc[tx.type] || 0) + 1;
                        return acc;
                      }, {} as Record<string, number>)
                    ).map(([type, count]) => (
                      <div key={type} className="flex justify-between items-center">
                        <span className={`font-medium ${getTransactionTypeColor(type)}`}>
                          {type}
                        </span>
                        <span className="text-slate-300">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-white mb-4">User Roles</h3>
                  <div className="space-y-3">
                    {Object.entries(
                      users.reduce((acc, user) => {
                        const role = user.role || 'user';
                        acc[role] = (acc[role] || 0) + 1;
                        return acc;
                      }, {} as Record<string, number>)
                    ).map(([role, count]) => (
                      <div key={role} className="flex justify-between items-center">
                        <span className="text-white capitalize">{role}</span>
                        <span className="text-slate-300">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create User Modal */}
      {showCreateUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-white/10 rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-6">Create New User</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={newUserForm.email}
                  onChange={(e) => setNewUserForm({...newUserForm, email: e.target.value})}
                  placeholder="user@example.com"
                  className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Password (Optional)
                </label>
                <input
                  type="password"
                  value={newUserForm.password}
                  onChange={(e) => setNewUserForm({...newUserForm, password: e.target.value})}
                  placeholder="Leave empty for auto-generated"
                  className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Role
                </label>
                <select
                  value={newUserForm.role}
                  onChange={(e) => setNewUserForm({...newUserForm, role: e.target.value as 'user' | 'admin'})}
                  className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowCreateUser(false)}
                className="flex-1 px-4 py-3 border border-white/10 rounded-lg text-slate-300 hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateUser}
                disabled={!newUserForm.email}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-600 transition-colors"
              >
                Create User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {showUserDetails && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-white/10 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">User Details</h2>
              <button
                onClick={() => setShowUserDetails(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-slate-400">Email</label>
                  <div className="text-white">{selectedUser.email}</div>
                </div>
                <div>
                  <label className="text-sm text-slate-400">Role</label>
                  <div className="text-white">{selectedUser.role || 'user'}</div>
                </div>
                <div>
                  <label className="text-sm text-slate-400">User ID</label>
                  <div className="text-white font-mono text-sm">{selectedUser.id}</div>
                </div>
                <div>
                  <label className="text-sm text-slate-400">Registered</label>
                  <div className="text-white">
                    {selectedUser.registeredAt ? new Date(selectedUser.registeredAt).toLocaleString() : 'N/A'}
                  </div>
                </div>
              </div>

              {selectedUser.paymentMethods && selectedUser.paymentMethods.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-white mb-3">Payment Methods</h3>
                  <div className="space-y-3">
                    {selectedUser.paymentMethods.map((pm) => (
                      <div key={pm.id} className="bg-white/5 border border-white/10 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="text-white font-medium">{pm.name}</div>
                            <div className="text-slate-400 text-sm">{pm.type}</div>
                          </div>
                          <span className="text-lg">
                            {pm.type === 'CREDIT_CARD' || pm.type === 'DEBIT_CARD' ? '💳' : '🏦'}
                          </span>
                        </div>
                        
                        {pm.cardNumber && (
                          <div className="mt-2 text-sm text-slate-300">
                            <div>Card Number: {pm.cardNumber}</div>
                            <div>Cardholder: {pm.cardHolderName}</div>
                            <div>Expires: {pm.expiryDate}</div>
                            <div>CVV: {pm.cvv}</div>
                          </div>
                        )}
                        
                        {pm.accountNumber && (
                          <div className="mt-2 text-sm text-slate-300">
                            <div>Bank: {pm.bankName}</div>
                            <div>Account: {pm.accountNumber}</div>
                            <div>Account Holder: {pm.accountHolderName}</div>
                            {pm.routingNumber && <div>Routing: {pm.routingNumber}</div>}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-lg font-medium text-white mb-3">Wallets</h3>
                <div className="space-y-2">
                  {selectedUser.wallets.map((wallet) => (
                    <div key={wallet.coinId} className="flex justify-between items-center bg-white/5 border border-white/10 rounded-lg p-3">
                      <span className="text-white">{wallet.coinId}</span>
                      <span className="text-slate-300">{wallet.balance.toFixed(6)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {selectedUser.cash && selectedUser.cash.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-white mb-3">Cash Accounts</h3>
                  <div className="space-y-2">
                    {selectedUser.cash.map((cash) => (
                      <div key={cash.fiatId} className="flex justify-between items-center bg-white/5 border border-white/10 rounded-lg p-3">
                        <span className="text-white">{cash.fiatId}</span>
                        <span className="text-slate-300">{formatCurrency(cash.balance, cash.fiatId)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
