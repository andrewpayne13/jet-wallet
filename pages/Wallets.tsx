
import React, { useState, useMemo } from 'react';
import { useWallet } from '../hooks/useWallet';
import { usePrices } from '../hooks/usePrices';
import { COINS } from '../constants';
import { Coin, CoinID, TransactionType, FiatID } from '../types';
import CoinLogo from '../components/CoinLogo';
import FiatLogo from '../components/FiatLogo';

// UI components defined within the page for simplicity
const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
    <div className={`bg-slate-800 rounded-xl shadow-lg p-6 ${className}`}>{children}</div>
);

const Button: React.FC<{ onClick?: () => void; children: React.ReactNode; className?: string; type?: 'button' | 'submit' | 'reset', disabled?: boolean }> = ({ onClick, children, className = '', type = 'button', disabled = false }) => (
    <button type={type} onClick={onClick} disabled={disabled} className={`px-4 py-2 rounded-md font-semibold transition-colors duration-200 ${className} ${disabled ? 'bg-slate-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 text-white'}`}>
        {children}
    </button>
);

const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 transition-opacity">
            <div className="bg-slate-800 rounded-lg shadow-xl w-full max-w-md m-4" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b border-slate-700">
                    <h3 className="text-lg font-bold text-white">{title}</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white">&times;</button>
                </div>
                <div className="p-6">{children}</div>
            </div>
        </div>
    );
};

const Spinner: React.FC = () => (
    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
);

// Main page component
const Wallets: React.FC = () => {
    const { state, dispatch } = useWallet();
    const { wallets, cash = [] } = state;
    const { getPrice } = usePrices();

    const [isSendModalOpen, setSendModalOpen] = useState(false);
    const [isReceiveModalOpen, setReceiveModalOpen] = useState(false);
    const [selectedCoin, setSelectedCoin] = useState<Coin | null>(null);
    const [sendAmount, setSendAmount] = useState('');
    const [recipientAddress, setRecipientAddress] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [transactionResult, setTransactionResult] = useState<{success: boolean, message: string} | null>(null);
    const [tab, setTab] = useState<'crypto' | 'cash'>('crypto');
    const totalCash = useMemo(() => cash.reduce((sum, a) => sum + a.balance, 0), [cash]);

    const totalUSDValue = useMemo(() => 
        wallets.reduce((acc, wallet) => {
            return acc + wallet.balance * getPrice(wallet.coinId);
        }, 0),
        [wallets, getPrice]
    );

    const openSendModal = (coinId: CoinID) => {
        setSelectedCoin(COINS[coinId]);
        setTransactionResult(null);
        setSendModalOpen(true);
    };

    const openReceiveModal = (coinId: CoinID) => {
        setSelectedCoin(COINS[coinId]);
        setReceiveModalOpen(true);
    };

    const closeModal = () => {
        setSendModalOpen(false);
        setReceiveModalOpen(false);
        setSelectedCoin(null);
        setSendAmount('');
        setRecipientAddress('');
        setIsProcessing(false);
        setTransactionResult(null);
    };

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCoin || !sendAmount || !recipientAddress) return;
        
        const amountNum = parseFloat(sendAmount);
        const wallet = wallets.find(w => w.coinId === selectedCoin.id);

        if (!wallet || wallet.balance < amountNum) {
            setTransactionResult({success: false, message: "Insufficient funds."});
            return;
        }

        setIsProcessing(true);
        setTimeout(() => {
            dispatch({
                type: 'SIMULATE_TRANSACTION',
                payload: {
                    type: TransactionType.SEND,
                    coinId: selectedCoin.id,
                    amount: amountNum,
                    usdValue: amountNum * getPrice(selectedCoin.id),
                    to: recipientAddress,
                    from: selectedCoin.address
                }
            });
            setIsProcessing(false);
            setTransactionResult({success: true, message: "Transaction successful!"});
            setTimeout(closeModal, 2000);
        }, 2500);
    };

    return (
        <div className="space-y-6">
            <Card>
                <h2 className="text-2xl font-bold text-white">Total Balance</h2>
                <p className="text-4xl font-light text-blue-400 mt-2">${totalUSDValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                <p className="text-slate-400 mt-1">Your combined crypto asset value.</p>
            </Card>

            <div className="flex items-center gap-2">
                <button
                  onClick={() => setTab('crypto')}
                  className={`px-3 py-1.5 rounded-full text-sm font-semibold ${tab === 'crypto' ? 'bg-blue-600 text-white' : 'bg-white/10 text-slate-300'}`}
                >
                  Crypto
                </button>
                <button
                  onClick={() => setTab('cash')}
                  className={`px-3 py-1.5 rounded-full text-sm font-semibold ${tab === 'cash' ? 'bg-blue-600 text-white' : 'bg-white/10 text-slate-300'}`}
                >
                  Cash
                </button>
                {tab === 'cash' && (
                  <span className="ml-auto text-sm text-slate-400">Total Cash: {totalCash.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                )}
            </div>

            {tab === 'crypto' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {wallets.map(wallet => {
                    const coin = COINS[wallet.coinId];
                    const price = getPrice(wallet.coinId);
                    const usdValue = wallet.balance * price;
                    return (
                        <Card key={coin.id} className="flex flex-col">
                            <div className="flex items-center">
                                <CoinLogo coinId={coin.id} className="h-10 w-10" size={40} />
                                <div className="ml-4">
                                    <h3 className="text-xl font-bold text-white">{coin.name}</h3>
                                    <p className="text-sm text-slate-400">{coin.id}</p>
                                </div>
                            </div>
                            <div className="mt-4 flex-grow">
                                <p className="text-2xl font-semibold text-white">{wallet.balance.toFixed(6)}</p>
                                <p className="text-slate-400">~ ${usdValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                            </div>
                            <div className="mt-6 flex space-x-4">
                                <Button onClick={() => openSendModal(coin.id)} className="w-full bg-blue-600 hover:bg-blue-500">Send</Button>
                                <Button onClick={() => openReceiveModal(coin.id)} className="w-full bg-slate-600 hover:bg-slate-500">Receive</Button>
                            </div>
                        </Card>
                    );
                })}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cash.length === 0 ? (
                  <Card><p className="text-slate-400">No cash accounts yet.</p></Card>
                ) : (
                  cash.map(acc => (
                    <Card key={acc.fiatId} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <FiatLogo fiatId={acc.fiatId as FiatID} className="h-10 w-10" size={40} />
                        <div className="ml-4">
                          <h3 className="text-xl font-bold text-white">{acc.fiatId}</h3>
                          <p className="text-sm text-slate-400">Cash</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-semibold text-white">
                          {acc.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                        <p className="text-slate-400 text-sm">{acc.fiatId}</p>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            )}

            {/* Send Modal */}
            <Modal isOpen={isSendModalOpen} onClose={closeModal} title={`Send ${selectedCoin?.name}`}>
                {transactionResult ? (
                    <div className={`text-center p-4 rounded-md ${transactionResult.success ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                       <p className="font-bold">{transactionResult.success ? "Success!" : "Error"}</p>
                       <p>{transactionResult.message}</p>
                    </div>
                ) : (
                    <form onSubmit={handleSend} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Amount to send</label>
                            <input
                                type="number"
                                step="any"
                                value={sendAmount}
                                onChange={e => setSendAmount(e.target.value)}
                                placeholder="0.00"
                                className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-white focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Recipient Address</label>
                            <input
                                type="text"
                                value={recipientAddress}
                                onChange={e => setRecipientAddress(e.target.value)}
                                placeholder={`Enter ${selectedCoin?.name} address`}
                                className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-white focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                        </div>
                        <Button type="submit" className="w-full flex justify-center items-center" disabled={isProcessing}>
                            {isProcessing ? <Spinner /> : 'Confirm Send'}
                        </Button>
                    </form>
                )}
            </Modal>

            {/* Receive Modal */}
            <Modal isOpen={isReceiveModalOpen} onClose={closeModal} title={`Receive ${selectedCoin?.name}`}>
                <div className="text-center space-y-4">
                    <p className="text-slate-300">Your public {selectedCoin?.name} address:</p>
                    <div className="bg-slate-900 p-3 rounded-md">
                        <p className="text-white font-mono break-all text-sm">{selectedCoin?.address}</p>
                    </div>
                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${selectedCoin?.address}&bgcolor=1e293b&color=ffffff&qzone=1`} alt="QR Code" className="mx-auto rounded-lg border-4 border-slate-700"/>
                    <p className="text-xs text-slate-500">Only send {selectedCoin?.id} to this address.</p>
                </div>
            </Modal>
        </div>
    );
};

export default Wallets;
