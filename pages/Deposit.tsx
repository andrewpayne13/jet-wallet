import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useWallet } from '../hooks/useWallet';
import { FiatID, PaymentMethod, CardType, PaymentMethodDetails, TransactionType } from '../types';

const Deposit: React.FC = () => {
  const { currentUser, updateUser } = useAuth();
  const { state, dispatch } = useWallet();
  
  const [selectedFiat, setSelectedFiat] = useState<FiatID>(FiatID.USD);
  const [amount, setAmount] = useState<string>('');
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAddPaymentMethod, setShowAddPaymentMethod] = useState(false);
  const [paymentMethodType, setPaymentMethodType] = useState<PaymentMethod>(PaymentMethod.CREDIT_CARD);
  
  // Card form state
  const [cardForm, setCardForm] = useState({
    cardHolderName: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardType: CardType.VISA,
  });

  // Bank form state
  const [bankForm, setBankForm] = useState({
    accountHolderName: '',
    bankName: '',
    accountNumber: '',
    routingNumber: '',
    sortCode: '',
    iban: '',
    swiftCode: '',
  });

  const userPaymentMethods = currentUser?.paymentMethods || [];

  const fiatOptions = [
    { id: FiatID.USD, name: 'US Dollar', symbol: '$' },
    { id: FiatID.EUR, name: 'Euro', symbol: '€' },
    { id: FiatID.GBP, name: 'British Pound', symbol: '£' },
    { id: FiatID.CAD, name: 'Canadian Dollar', symbol: 'C$' },
    { id: FiatID.AUD, name: 'Australian Dollar', symbol: 'A$' },
  ];

  const handleDeposit = async () => {
    if (!selectedPaymentMethodId || !amount || parseFloat(amount) <= 0) {
      return;
    }

    setIsProcessing(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      const depositAmount = parseFloat(amount);
      const selectedMethod = userPaymentMethods.find(pm => pm.id === selectedPaymentMethodId);
      
      dispatch({
        type: 'SIMULATE_TRANSACTION',
        payload: {
          type: TransactionType.DEPOSIT,
          currency: selectedFiat,
          amount: depositAmount,
          price: 1,
          usdValue: depositAmount,
          coinId: selectedFiat as any,
          from: selectedMethod?.name || 'Payment Method',
          to: 'JetWallet Account',
        },
      });

      setAmount('');
      setSelectedPaymentMethodId('');
      
    } catch (error) {
      // Handle error
    } finally {
      setIsProcessing(false);
    }
  };

  const addPaymentMethod = () => {
    if (!currentUser) {
      return;
    }

    let newMethod: PaymentMethodDetails;

    if (paymentMethodType === PaymentMethod.CREDIT_CARD || paymentMethodType === PaymentMethod.DEBIT_CARD) {
      if (!cardForm.cardHolderName || !cardForm.cardNumber || !cardForm.expiryDate || !cardForm.cvv) {
        alert('Please fill in all required card fields');
        return;
      }

      newMethod = {
        id: `pm_${Date.now()}`,
        type: paymentMethodType,
        name: `${cardForm.cardType} •••• ${cardForm.cardNumber.slice(-4)}`,
        cardType: cardForm.cardType,
        cardNumber: cardForm.cardNumber,
        expiryDate: cardForm.expiryDate,
        cvv: cardForm.cvv,
        cardHolderName: cardForm.cardHolderName,
        isDefault: userPaymentMethods.length === 0,
        createdAt: new Date().toISOString(),
      };
    } else {
      if (!bankForm.accountHolderName || !bankForm.bankName || !bankForm.accountNumber) {
        alert('Please fill in all required bank fields');
        return;
      }

      newMethod = {
        id: `pm_${Date.now()}`,
        type: paymentMethodType,
        name: `${bankForm.bankName} •••• ${bankForm.accountNumber.slice(-4)}`,
        bankName: bankForm.bankName,
        accountNumber: bankForm.accountNumber,
        routingNumber: bankForm.routingNumber,
        sortCode: bankForm.sortCode,
        iban: bankForm.iban,
        swiftCode: bankForm.swiftCode,
        accountHolderName: bankForm.accountHolderName,
        isDefault: userPaymentMethods.length === 0,
        createdAt: new Date().toISOString(),
      };
    }

    const updatedUser = {
      ...currentUser,
      paymentMethods: [...userPaymentMethods, newMethod],
    };

    try {
      updateUser(updatedUser);
      
      // Reset forms
      setCardForm({
        cardHolderName: '',
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        cardType: CardType.VISA,
      });
      setBankForm({
        accountHolderName: '',
        bankName: '',
        accountNumber: '',
        routingNumber: '',
        sortCode: '',
        iban: '',
        swiftCode: '',
      });
      setShowAddPaymentMethod(false);
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Failed to add payment method. Please try again.');
    }
  };

  const deletePaymentMethod = (methodId: string) => {
    if (!currentUser) {
      return;
    }

    const methodToDelete = userPaymentMethods.find(pm => pm.id === methodId);
    if (!methodToDelete) {
      return;
    }

    // Confirm deletion
    if (!window.confirm(`Are you sure you want to delete ${methodToDelete.name}?`)) {
      return;
    }

    // Remove the payment method from the user's payment methods
    const updatedPaymentMethods = userPaymentMethods.filter(pm => pm.id !== methodId);
    
    // If we deleted the default method and there are other methods, make the first one default
    if (methodToDelete.isDefault && updatedPaymentMethods.length > 0) {
      updatedPaymentMethods[0].isDefault = true;
    }

    const updatedUser = {
      ...currentUser,
      paymentMethods: updatedPaymentMethods,
    };

    try {
      updateUser(updatedUser);
      
      // If the deleted method was selected, clear the selection
      if (selectedPaymentMethodId === methodId) {
        setSelectedPaymentMethodId('');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Failed to delete payment method. Please try again.');
    }
  };

  const selectedFiatData = fiatOptions.find(f => f.id === selectedFiat);

  return (
    <div className="space-y-6">
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6">
        <h1 className="text-2xl font-bold text-white mb-6">Deposit Funds</h1>
        
        {/* Currency Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-300 mb-3">
            Select Currency
          </label>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {fiatOptions.map((fiat) => (
              <button
                key={fiat.id}
                onClick={() => setSelectedFiat(fiat.id)}
                className={`p-4 rounded-lg border transition-all duration-200 ${
                  selectedFiat === fiat.id
                    ? 'border-blue-500 bg-blue-500/20 text-blue-300'
                    : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:bg-white/10'
                }`}
              >
                <div className="font-semibold text-lg">{fiat.symbol}</div>
                <div className="text-xs opacity-70">{fiat.id}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Amount Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-300 mb-3">
            Amount to Deposit
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 text-lg">
              {selectedFiatData?.symbol}
            </span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full pl-10 pr-4 py-4 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
              min="0"
              step="0.01"
            />
          </div>
        </div>

        {/* Payment Methods */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <label className="block text-sm font-medium text-slate-300">
              Payment Method
            </label>
            <button
              onClick={() => setShowAddPaymentMethod(true)}
              className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
            >
              + Add Payment Method
            </button>
          </div>
          
          <div className="space-y-3">
            {userPaymentMethods.map((method) => (
              <div
                key={method.id}
                className={`p-4 rounded-lg border transition-all duration-200 ${
                  selectedPaymentMethodId === method.id
                    ? 'border-blue-500 bg-blue-500/20'
                    : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div 
                    className="flex items-center space-x-3 flex-1 cursor-pointer"
                    onClick={() => setSelectedPaymentMethodId(method.id)}
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <span className="text-white text-sm font-bold">
                        {method.type === PaymentMethod.CREDIT_CARD || method.type === PaymentMethod.DEBIT_CARD ? '💳' : '🏦'}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-white">{method.name}</div>
                      <div className="text-sm text-slate-400">
                        {method.cardHolderName || method.accountHolderName}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {method.isDefault && (
                      <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded-full border border-green-500/30">
                        Default
                      </span>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deletePaymentMethod(method.id);
                      }}
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                      title="Delete payment method"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
            
            {userPaymentMethods.length === 0 && (
              <div className="text-center py-8 text-slate-400">
                No payment methods added yet. Click "Add Payment Method" to get started.
              </div>
            )}
          </div>
        </div>

        {/* Deposit Button */}
        <button
          onClick={handleDeposit}
          disabled={!selectedPaymentMethodId || !amount || parseFloat(amount) <= 0 || isProcessing}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
        >
          {isProcessing ? 'Processing...' : `Deposit ${selectedFiatData?.symbol}${amount || '0.00'}`}
        </button>
      </div>

      {/* Add Payment Method Modal */}
      {showAddPaymentMethod && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-white/10 rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-white mb-6">Add Payment Method</h2>
            
            {/* Payment Type Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-300 mb-3">
                Payment Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setPaymentMethodType(PaymentMethod.CREDIT_CARD)}
                  className={`p-3 rounded-lg border text-center transition-all ${
                    paymentMethodType === PaymentMethod.CREDIT_CARD
                      ? 'border-blue-500 bg-blue-500/20 text-blue-300'
                      : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/20'
                  }`}
                >
                  💳 Credit Card
                </button>
                <button
                  onClick={() => setPaymentMethodType(PaymentMethod.BANK_TRANSFER)}
                  className={`p-3 rounded-lg border text-center transition-all ${
                    paymentMethodType === PaymentMethod.BANK_TRANSFER
                      ? 'border-blue-500 bg-blue-500/20 text-blue-300'
                      : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/20'
                  }`}
                >
                  🏦 Bank Transfer
                </button>
              </div>
            </div>

            {/* Card Form */}
            {(paymentMethodType === PaymentMethod.CREDIT_CARD || paymentMethodType === PaymentMethod.DEBIT_CARD) && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    value={cardForm.cardHolderName}
                    onChange={(e) => setCardForm({...cardForm, cardHolderName: e.target.value})}
                    placeholder="John Doe"
                    className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Card Number
                  </label>
                  <input
                    type="text"
                    value={cardForm.cardNumber}
                    onChange={(e) => setCardForm({...cardForm, cardNumber: e.target.value.replace(/\s/g, '')})}
                    placeholder="1234 5678 9012 3456"
                    maxLength={16}
                    className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      value={cardForm.expiryDate}
                      onChange={(e) => setCardForm({...cardForm, expiryDate: e.target.value})}
                      placeholder="MM/YY"
                      maxLength={5}
                      className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      CVV
                    </label>
                    <input
                      type="text"
                      value={cardForm.cvv}
                      onChange={(e) => setCardForm({...cardForm, cvv: e.target.value})}
                      placeholder="123"
                      maxLength={4}
                      className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Card Type
                  </label>
                  <select
                    value={cardForm.cardType}
                    onChange={(e) => setCardForm({...cardForm, cardType: e.target.value as CardType})}
                    className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value={CardType.VISA}>Visa</option>
                    <option value={CardType.MASTERCARD}>Mastercard</option>
                    <option value={CardType.AMEX}>American Express</option>
                  </select>
                </div>
              </div>
            )}

            {/* Bank Form */}
            {paymentMethodType === PaymentMethod.BANK_TRANSFER && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Account Holder Name
                  </label>
                  <input
                    type="text"
                    value={bankForm.accountHolderName}
                    onChange={(e) => setBankForm({...bankForm, accountHolderName: e.target.value})}
                    placeholder="John Doe"
                    className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Bank Name
                  </label>
                  <input
                    type="text"
                    value={bankForm.bankName}
                    onChange={(e) => setBankForm({...bankForm, bankName: e.target.value})}
                    placeholder="Chase Bank"
                    className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Account Number
                  </label>
                  <input
                    type="text"
                    value={bankForm.accountNumber}
                    onChange={(e) => setBankForm({...bankForm, accountNumber: e.target.value})}
                    placeholder="1234567890"
                    className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Routing Number
                  </label>
                  <input
                    type="text"
                    value={bankForm.routingNumber}
                    onChange={(e) => setBankForm({...bankForm, routingNumber: e.target.value})}
                    placeholder="021000021"
                    className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowAddPaymentMethod(false)}
                className="flex-1 px-4 py-3 border border-white/10 rounded-lg text-slate-300 hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={addPaymentMethod}
                disabled={
                  (paymentMethodType === PaymentMethod.CREDIT_CARD && (!cardForm.cardHolderName || !cardForm.cardNumber || !cardForm.expiryDate || !cardForm.cvv)) ||
                  (paymentMethodType === PaymentMethod.BANK_TRANSFER && (!bankForm.accountHolderName || !bankForm.bankName || !bankForm.accountNumber))
                }
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-600 transition-all"
              >
                Add Method
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Deposit;
