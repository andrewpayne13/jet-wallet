import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { usePrices } from '../hooks/usePrices';
import { CoinID, PriceAlert, NotificationSettings } from '../types';

const Settings: React.FC = () => {
  const { currentUser, updateUser } = useAuth();
  const { prices } = usePrices();
  const [activeTab, setActiveTab] = useState<'security' | 'alerts' | 'preferences'>('security');
  const [showAddAlert, setShowAddAlert] = useState(false);

  // 2FA state
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [showTwoFactorSetup, setShowTwoFactorSetup] = useState(false);

  // Price alert form state
  const [alertForm, setAlertForm] = useState({
    coinId: CoinID.BTC,
    targetPrice: '',
    condition: 'above' as 'above' | 'below',
  });

  // Notification settings
  const [notifications, setNotifications] = useState<NotificationSettings>(
    currentUser?.notifications || {
      email: true,
      push: true,
      priceAlerts: true,
      transactionUpdates: true,
      securityAlerts: true,
      marketNews: false,
    }
  );

  const userPriceAlerts = currentUser?.priceAlerts || [];

  const handleToggle2FA = () => {
    if (currentUser?.twoFactorEnabled) {
      // Disable 2FA
      const updatedUser = {
        ...currentUser,
        twoFactorEnabled: false,
        twoFactorSecret: undefined,
      };
      updateUser(updatedUser);
    } else {
      // Show 2FA setup
      setShowTwoFactorSetup(true);
    }
  };

  const handleEnable2FA = () => {
    if (!currentUser || !twoFactorCode) return;

    // In a real app, you'd verify the code against the secret
    const updatedUser = {
      ...currentUser,
      twoFactorEnabled: true,
      twoFactorSecret: 'mock_secret_' + Date.now(),
    };
    updateUser(updatedUser);
    setShowTwoFactorSetup(false);
    setTwoFactorCode('');
  };

  const handleAddPriceAlert = () => {
    if (!currentUser || !alertForm.targetPrice) return;

    const newAlert: PriceAlert = {
      id: `alert_${Date.now()}`,
      coinId: alertForm.coinId,
      targetPrice: parseFloat(alertForm.targetPrice),
      condition: alertForm.condition,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    const updatedUser = {
      ...currentUser,
      priceAlerts: [...userPriceAlerts, newAlert],
    };

    updateUser(updatedUser);
    setAlertForm({ coinId: CoinID.BTC, targetPrice: '', condition: 'above' });
    setShowAddAlert(false);
  };

  const handleDeleteAlert = (alertId: string) => {
    if (!currentUser) return;

    const updatedAlerts = userPriceAlerts.filter(alert => alert.id !== alertId);
    const updatedUser = {
      ...currentUser,
      priceAlerts: updatedAlerts,
    };

    updateUser(updatedUser);
  };

  const handleToggleAlert = (alertId: string) => {
    if (!currentUser) return;

    const updatedAlerts = userPriceAlerts.map(alert =>
      alert.id === alertId ? { ...alert, isActive: !alert.isActive } : alert
    );

    const updatedUser = {
      ...currentUser,
      priceAlerts: updatedAlerts,
    };

    updateUser(updatedUser);
  };

  const handleUpdateNotifications = () => {
    if (!currentUser) return;

    const updatedUser = {
      ...currentUser,
      notifications,
    };

    updateUser(updatedUser);
  };

  const handleThemeChange = (theme: 'light' | 'dark') => {
    if (!currentUser) return;

    const updatedUser = {
      ...currentUser,
      theme,
    };

    updateUser(updatedUser);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getCurrentPrice = (coinId: CoinID) => {
    return prices[coinId] || 0;
  };

  return (
    <div className="space-y-6">
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6">
        <h1 className="text-2xl font-bold text-white mb-6">Settings</h1>
        
        {/* Tabs */}
        <div className="border-b border-white/10 mb-6">
          <nav className="flex space-x-8">
            {[
              { id: 'security', label: 'Security', icon: '🔒' },
              { id: 'alerts', label: 'Price Alerts', icon: '🔔' },
              { id: 'preferences', label: 'Preferences', icon: '⚙️' },
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

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-lg font-medium text-white">Two-Factor Authentication</h3>
                  <p className="text-slate-400 text-sm">Add an extra layer of security to your account</p>
                </div>
                <button
                  onClick={handleToggle2FA}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    currentUser?.twoFactorEnabled
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  {currentUser?.twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
                </button>
              </div>
              
              {currentUser?.twoFactorEnabled && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                  <div className="flex items-center text-green-400">
                    <span className="mr-2">✅</span>
                    Two-factor authentication is enabled
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <h3 className="text-lg font-medium text-white mb-4">Account Information</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Email</span>
                  <span className="text-white">{currentUser?.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Account Type</span>
                  <span className="text-white capitalize">{currentUser?.role || 'user'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Last Login</span>
                  <span className="text-white">
                    {currentUser?.lastLoginAt 
                      ? new Date(currentUser.lastLoginAt).toLocaleString()
                      : 'Never'
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Price Alerts Tab */}
        {activeTab === 'alerts' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-white">Price Alerts</h3>
              <button
                onClick={() => setShowAddAlert(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                + Add Alert
              </button>
            </div>

            <div className="space-y-4">
              {userPriceAlerts.map((alert) => (
                <div key={alert.id} className="bg-white/5 border border-white/10 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-sm">{alert.coinId}</span>
                      </div>
                      <div>
                        <div className="text-white font-medium">
                          {alert.coinId} {alert.condition} {formatCurrency(alert.targetPrice)}
                        </div>
                        <div className="text-slate-400 text-sm">
                          Current: {formatCurrency(getCurrentPrice(alert.coinId))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleToggleAlert(alert.id)}
                        className={`px-3 py-1 rounded-full text-xs ${
                          alert.isActive
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-gray-500/20 text-gray-400'
                        }`}
                      >
                        {alert.isActive ? 'Active' : 'Inactive'}
                      </button>
                      <button
                        onClick={() => handleDeleteAlert(alert.id)}
                        className="text-red-400 hover:text-red-300 p-1"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {userPriceAlerts.length === 0 && (
                <div className="text-center py-8 text-slate-400">
                  No price alerts set. Click "Add Alert" to create your first alert.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Preferences Tab */}
        {activeTab === 'preferences' && (
          <div className="space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <h3 className="text-lg font-medium text-white mb-4">Theme</h3>
              <div className="flex space-x-4">
                <button
                  onClick={() => handleThemeChange('dark')}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    (currentUser?.theme || 'dark') === 'dark'
                      ? 'border-blue-500 bg-blue-500/20 text-blue-300'
                      : 'border-white/10 text-slate-300 hover:border-white/20'
                  }`}
                >
                  🌙 Dark
                </button>
                <button
                  onClick={() => handleThemeChange('light')}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    currentUser?.theme === 'light'
                      ? 'border-blue-500 bg-blue-500/20 text-blue-300'
                      : 'border-white/10 text-slate-300 hover:border-white/20'
                  }`}
                >
                  ☀️ Light
                </button>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <h3 className="text-lg font-medium text-white mb-4">Notifications</h3>
              <div className="space-y-4">
                {Object.entries(notifications).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center">
                    <span className="text-slate-300 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <button
                      onClick={() => setNotifications({ ...notifications, [key]: !value })}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        value ? 'bg-blue-600' : 'bg-gray-600'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 bg-white rounded-full transition-transform ${
                          value ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={handleUpdateNotifications}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Save Preferences
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 2FA Setup Modal */}
      {showTwoFactorSetup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-white/10 rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-6">Enable Two-Factor Authentication</h2>
            
            <div className="space-y-4">
              <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                <p className="text-slate-300 text-sm mb-4">
                  Scan this QR code with your authenticator app or enter the code manually:
                </p>
                <div className="bg-white p-4 rounded-lg text-center">
                  <div className="text-black font-mono text-xs">
                    [QR Code would be here]<br/>
                    MOCK2FA{currentUser?.id?.substring(0, 8)}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Enter 6-digit code from your authenticator app
                </label>
                <input
                  type="text"
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value)}
                  placeholder="123456"
                  maxLength={6}
                  className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center font-mono"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowTwoFactorSetup(false)}
                className="flex-1 px-4 py-3 border border-white/10 rounded-lg text-slate-300 hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleEnable2FA}
                disabled={twoFactorCode.length !== 6}
                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-600 transition-colors"
              >
                Enable 2FA
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Price Alert Modal */}
      {showAddAlert && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-white/10 rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-6">Add Price Alert</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Cryptocurrency
                </label>
                <select
                  value={alertForm.coinId}
                  onChange={(e) => setAlertForm({ ...alertForm, coinId: e.target.value as CoinID })}
                  className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {Object.values(CoinID).map((coin) => (
                    <option key={coin} value={coin}>
                      {coin} - {formatCurrency(getCurrentPrice(coin))}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Condition
                </label>
                <select
                  value={alertForm.condition}
                  onChange={(e) => setAlertForm({ ...alertForm, condition: e.target.value as 'above' | 'below' })}
                  className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="above">Price goes above</option>
                  <option value="below">Price goes below</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Target Price (USD)
                </label>
                <input
                  type="number"
                  value={alertForm.targetPrice}
                  onChange={(e) => setAlertForm({ ...alertForm, targetPrice: e.target.value })}
                  placeholder="0.00"
                  step="0.01"
                  className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowAddAlert(false)}
                className="flex-1 px-4 py-3 border border-white/10 rounded-lg text-slate-300 hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddPriceAlert}
                disabled={!alertForm.targetPrice}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-600 transition-colors"
              >
                Add Alert
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
