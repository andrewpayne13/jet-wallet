import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useWallet } from '../hooks/useWallet';
import { CoinID, FiatID, PaymentMethod, TransactionType } from '../types';
import { usePrices } from '../hooks/usePrices';

const Withdraw: React.FC = () => {
  const { currentUser } = useAuth();
  const { state, dispatch } = useWallet();
  const { getPrice } = usePrices();
  
  const [withdrawType, setWithdrawType] = useState<'crypto' | 'fiat'>('crypto');
  const [selectedCoin, setSelectedCoin] = useState<CoinID>(CoinID.BTC);
  const [selectedFiat, setSelectedFiat] = useState<FiatID>(FiatID.USD);
  const [amount, setAmount] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  const userPaymentMethods = currentUser?.paymentMethods || [];
  const availableCoins = state.wallets.map(w => w.coinId);
  const availableFiat = state.cash.map(c => c.fiatId);

  const selectedWallet = state.wallets.find(w => w.coinId === selectedCoin);
  const selectedCash = state.cash.find(c => c.fiatId === selectedFiat);

  const handleWithdraw = async () => {
    if (!amount || parseFloat(amount) <= 0) return;
    const withdrawAmount = parseFloat(amount);

    setIsProcessing(true);

    try {
      if (withdrawType === 'crypto') {
        if (!selectedCoin || !address) return;
        if (!selectedWallet || selectedWallet.balance < withdrawAmount) return;

        await dispatch({
          type: 'WITHDRAW',
          payload: {
            type: 'crypto',
            coinId: selectedCoin,
            amount: withdrawAmount,
            address,
            usdValue: withdrawAmount * getPrice(selectedCoin),
          }
        });
      } else {
        if (!selectedFiat || !selectedPaymentMethodId) return;
        if (!selectedCash || selectedCash.balance < withdrawAmount) return;

        await dispatch({
          type: 'WITHDRAW',
          payload: {
            type: 'fiat',
            fiatId: selectedFiat,
            amount: withdrawAmount,
            paymentMethodId: selectedPaymentMethodId,
            usdValue: withdrawAmount, // Assuming USD equivalent for fiat
          }
        });
      }

      setAmount('');
      setAddress('');
      setSelectedPaymentMethodId('');
    } catch (error) {
      console.error('Withdrawal error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6">
        <h1 className="text-2xl font-bold text-white mb-6">Withdraw Funds</h1>
        
        {/* Type Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-300 mb-3">
            Withdrawal Type
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setWithdrawType('crypto')}
              className={`p-4 rounded-lg border transition-all ${
                withdrawType === 'crypto' ? 'border-blue-500 bg-blue-500/20' : 'border-white/10 bg-white/5'
              }`}
            >
              Crypto
            </button>
            <button
              onClick={() => setWithdrawType('fiat')}
              className={`p-4 rounded-lg border transition-all ${
                withdrawType === 'fiat' ? 'border-blue-500 bg-blue-500/20' : 'border-white/10 bg-white/5'
              }`}
            >
              Fiat
            </button>
          </div>
        </div>

        {withdrawType === 'crypto' ? (
          <>
            {/* Crypto Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-300 mb-3">
                Select Cryptocurrency
              </label>
              <select
                value={selectedCoin}
                onChange={(e) => setSelectedCoin(e.target.value as CoinID)}
                className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white"
              >
                {availableCoins.map(coin => (
                  <option key={coin} value={coin}>{coin}</option>
                ))}
              </select>
              <p className="text-xs text-slate-400 mt-1">
                Available: {selectedWallet?.balance.toFixed(6) || 0} {selectedCoin}
              </p>
            </div>

            {/* Address Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-300 mb-3">
                Wallet Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter destination wallet address"
                className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white"
              />
            </div>
          </>
        ) : (
          <>
            {/* Fiat Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-300 mb-3">
                Select Currency
              </label>
              <select
                value={selectedFiat}
                onChange={(e) => setSelectedFiat(e.target.value as FiatID)}
                className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white"
              >
                {availableFiat.map(fiat => (
                  <option key={fiat} value={fiat}>{fiat}</option>
                ))}
              </select>
              <p className="text-xs text-slate-400 mt-1">
                Available: {formatCurrency(selectedCash?.balance || 0, selectedFiat)}
              </p>
            </div>

            {/* Payment Method Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-300 mb-3">
                Payment Method
              </label>
              <select
                value={selectedPaymentMethodId}
                onChange={(e) => setSelectedPaymentMethodId(e.target.value)}
                className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white"
              >
                <option value="">Select payment method</option>
                {userPaymentMethods.map(pm => (
                  <option key={pm.id} value={pm.id}>{pm.name}</option>
                ))}
              </select>
            </div>
          </>
        )}

        {/* Amount Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-300 mb-3">
            Amount
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white"
            min="0"
            step="0.01"
          />
        </div>

        {/* Submit Button */}
        <button
          onClick={handleWithdraw}
          disabled={isProcessing || !amount || (withdrawType === 'crypto' && (!address || !selectedCoin)) || (withdrawType === 'fiat' && !selectedPaymentMethodId)}
          className="w-full bg-blue-600 text-white py-3 rounded-lg disabled:bg-gray-600"
        >
          {isProcessing ? 'Processing...' : 'Withdraw'}
        </button>
      </div>
    </div>
  );
};

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}

export default Withdraw;
