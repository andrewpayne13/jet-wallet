import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useWallet } from '../hooks/useWallet';
import { FiatID, PaymentMethod, CardType, PaymentMethodDetails, DepositRequest, TransactionType } from '../types';

const Deposit: React.FC = () => {
  const { user } = useAuth();
  const { state, dispatch } = useWallet();
  
  const [selectedFiat, setSelectedFiat] = useState<FiatID>(FiatID.USD);
  const [amount, setAmount] = useState<string>('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAddPaymentMethod, setShowAddPaymentMethod] = useState(false);
  const [newPaymentMethod, setNewPaymentMethod] = useState<Partial<PaymentMethodDetails>>({
    type: PaymentMethod.DEBIT_CARD,
    name: '',
  });

  // Mock payment methods for demo
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodDetails[]>([
    {
      id: 'pm_1',
      type: PaymentMethod.DEBIT_CARD,
      name: 'Personal Debit Card',
      cardType: CardType.VISA,
      lastFourDigits: '4242',
      isDefault: true,
    },
    {
      id: 'pm_2',
      type: PaymentMethod.BANK_TRANSFER,
      name: 'Main Bank Account',
      bankName: 'Chase Bank',
      accountNumber: '****1234',
      isDefault: false,
    },
    {
      id: 'pm_3',
      type: PaymentMethod.UK_FASTER_PAYMENTS,
      name: 'UK Bank Account',
      bankName: 'Barclays',
      sortCode: '20-00-00',
      accountNumber: '****5678',
      isDefault: false,
    },
  ]);

  const fiatOptions = [
    { id: FiatID.USD, name: 'US Dollar', symbol: '$' },
    { id: FiatID.EUR, name: 'Euro', symbol: '€' },
    { id: FiatID.GBP, name: 'British Pound', symbol: '£' },
    { id: FiatID.CAD, name: 'Canadian Dollar', symbol: 'C$' },
    { id: FiatID.AUD, name: 'Australian Dollar', symbol: 'A$' },
  ];

  const paymentMethodOptions = [
    { type: PaymentMethod.DEBIT_CARD, name: 'Debit Card', icon: '💳' },
    { type: PaymentMethod.CREDIT_CARD, name: 'Credit Card', icon: '💳' },
    { type: PaymentMethod.BANK_TRANSFER, name: 'Bank Transfer', icon: '🏦' },
    { type: PaymentMethod.SWIFT_TRANSFER, name: 'SWIFT Transfer', icon: '🌐' },
    { type: PaymentMethod.UK_FASTER_PAYMENTS, name: 'UK Faster Payments', icon: '🇬🇧' },
  ];

  const handleDeposit = async () => {
    if (!selectedPaymentMethod || !amount || parseFloat(amount) <= 0) {
      return;
    }

    setIsProcessing(true);

    try {
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      const depositAmount = parseFloat(amount);
      
      // Create deposit transaction
      dispatch({
        type: 'SIMULATE_TRANSACTION',
        payload: {
          type: TransactionType.DEPOSIT,
          currency: selectedFiat,
          amount: depositAmount,
          price: 1, // 1:1 for fiat deposits
          usdValue: depositAmount,
          coinId: selectedFiat as any,
          from: getPaymentMethodName(selectedPaymentMethod),
          to: 'JetWallet Account',
        },
      });

      // Reset form
      setAmount('');
      setSelectedPaymentMethod(null);
      
    } catch (error) {
      // Handle error
    } finally {
      setIsProcessing(false);
    }
  };

  const getPaymentMethodName = (method: PaymentMethod): string => {
    const methodData = paymentMethods.find(pm => pm.type === method);
    return methodData?.name || method;
  };

  const getPaymentMethodIcon = (method: PaymentMethod): string => {
    const option = paymentMethodOptions.find(opt => opt.type === method);
    return option?.icon || '💳';
  };

  const addPaymentMethod = () => {
    if (!newPaymentMethod.name || !newPaymentMethod.type) return;

    const newMethod: PaymentMethodDetails = {
      id: `pm_${Date.now()}`,
      type: newPaymentMethod.type!,
      name: newPaymentMethod.name,
      cardType: newPaymentMethod.cardType,
      lastFourDigits: newPaymentMethod.lastFourDigits,
      bankName: newPaymentMethod.bankName,
      accountNumber: newPaymentMethod.accountNumber,
      sortCode: newPaymentMethod.sortCode,
      iban: newPaymentMethod.iban,
      swiftCode: newPaymentMethod.swiftCode,
      isDefault: paymentMethods.length === 0,
    };

    setPaymentMethods([...paymentMethods, newMethod]);
    setNewPaymentMethod({ type: PaymentMethod.DEBIT_CARD, name: '' });
    setShowAddPaymentMethod(false);
  };

  const selectedFiatData = fiatOptions.find(f => f.id === selectedFiat);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Deposit Funds</h1>
        
        {/* Currency Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Currency
          </label>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {fiatOptions.map((fiat) => (
              <button
                key={fiat.id}
                onClick={() => setSelectedFiat(fiat.id)}
                className={`p-3 rounded-lg border-2 text-center transition-colors ${
                  selectedFiat === fiat.id
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-semibold">{fiat.symbol}</div>
                <div className="text-xs text-gray-600">{fiat.id}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Amount Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Amount to Deposit
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg">
              {selectedFiatData?.symbol}
            </span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
              min="0"
              step="0.01"
            />
          </div>
        </div>

        {/* Payment Methods */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Payment Method
            </label>
            <button
              onClick={() => setShowAddPaymentMethod(true)}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              + Add Payment Method
            </button>
          </div>
          
          <div className="space-y-3">
            {paymentMethods.map((method) => (
              <div
                key={method.id}
                onClick={() => setSelectedPaymentMethod(method.type)}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                  selectedPaymentMethod === method.type
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{getPaymentMethodIcon(method.type)}</span>
                    <div>
                      <div className="font-medium text-gray-900">{method.name}</div>
                      <div className="text-sm text-gray-600">
                        {method.cardType && method.lastFourDigits && 
                          `${method.cardType} •••• ${method.lastFourDigits}`
                        }
                        {method.bankName && `${method.bankName}`}
                        {method.accountNumber && ` •••• ${method.accountNumber.slice(-4)}`}
                      </div>
                    </div>
                  </div>
                  {method.isDefault && (
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                      Default
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Deposit Button */}
        <button
          onClick={handleDeposit}
          disabled={!selectedPaymentMethod || !amount || parseFloat(amount) <= 0 || isProcessing}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {isProcessing ? 'Processing...' : `Deposit ${selectedFiatData?.symbol}${amount || '0.00'}`}
        </button>

        {/* Processing Info */}
        {selectedPaymentMethod && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Processing Time</h3>
            <div className="text-sm text-gray-600">
              {selectedPaymentMethod === PaymentMethod.DEBIT_CARD && "Instant - funds available immediately"}
              {selectedPaymentMethod === PaymentMethod.CREDIT_CARD && "Instant - funds available immediately"}
              {selectedPaymentMethod === PaymentMethod.BANK_TRANSFER && "1-3 business days"}
              {selectedPaymentMethod === PaymentMethod.SWIFT_TRANSFER && "3-5 business days"}
              {selectedPaymentMethod === PaymentMethod.UK_FASTER_PAYMENTS && "Usually within 2 hours"}
            </div>
          </div>
        )}
      </div>

      {/* Add Payment Method Modal */}
      {showAddPaymentMethod && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add Payment Method</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Type
                </label>
                <select
                  value={newPaymentMethod.type}
                  onChange={(e) => setNewPaymentMethod({...newPaymentMethod, type: e.target.value as PaymentMethod})}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                >
                  {paymentMethodOptions.map((option) => (
                    <option key={option.type} value={option.type}>
                      {option.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  value={newPaymentMethod.name}
                  onChange={(e) => setNewPaymentMethod({...newPaymentMethod, name: e.target.value})}
                  placeholder="e.g., My Debit Card"
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>

              {(newPaymentMethod.type === PaymentMethod.DEBIT_CARD || newPaymentMethod.type === PaymentMethod.CREDIT_CARD) && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Card Type
                    </label>
                    <select
                      value={newPaymentMethod.cardType || CardType.VISA}
                      onChange={(e) => setNewPaymentMethod({...newPaymentMethod, cardType: e.target.value as CardType})}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    >
                      <option value={CardType.VISA}>Visa</option>
                      <option value={CardType.MASTERCARD}>Mastercard</option>
                      <option value={CardType.AMEX}>American Express</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last 4 Digits
                    </label>
                    <input
                      type="text"
                      value={newPaymentMethod.lastFourDigits || ''}
                      onChange={(e) => setNewPaymentMethod({...newPaymentMethod, lastFourDigits: e.target.value})}
                      placeholder="1234"
                      maxLength={4}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </>
              )}

              {(newPaymentMethod.type === PaymentMethod.BANK_TRANSFER || newPaymentMethod.type === PaymentMethod.UK_FASTER_PAYMENTS) && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bank Name
                    </label>
                    <input
                      type="text"
                      value={newPaymentMethod.bankName || ''}
                      onChange={(e) => setNewPaymentMethod({...newPaymentMethod, bankName: e.target.value})}
                      placeholder="e.g., Chase Bank"
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Account Number (last 4 digits)
                    </label>
                    <input
                      type="text"
                      value={newPaymentMethod.accountNumber || ''}
                      onChange={(e) => setNewPaymentMethod({...newPaymentMethod, accountNumber: `****${e.target.value}`})}
                      placeholder="1234"
                      maxLength={4}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowAddPaymentMethod(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={addPaymentMethod}
                disabled={!newPaymentMethod.name}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300"
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
