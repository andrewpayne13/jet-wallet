import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Logo from '../components/Logo';
import { SEED_PHRASE_WORDS } from '../constants';

const Register: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [hasBackedUp, setHasBackedUp] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();

  const seedPhrase = useMemo(() => {
    const words = new Set<string>();
    while (words.size < 12) {
      const randomIndex = Math.floor(Math.random() * SEED_PHRASE_WORDS.length);
      words.add(SEED_PHRASE_WORDS[randomIndex]);
    }
    return Array.from(words).join(' ');
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    if (!hasBackedUp) {
      setError("Please confirm you have backed up your seed phrase.");
      return;
    }
    const user = register(email);
    if (!user) {
        setError('An account with this email already exists.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-lg">
        <div className="mx-auto mb-8 w-fit">
            <Logo />
        </div>
        <div className="bg-slate-800 rounded-xl shadow-lg p-8">
          <h1 className="text-2xl font-bold text-white text-center mb-2">Create Your Wallet</h1>
          <p className="text-slate-400 text-center mb-6">First, let's secure your new wallet.</p>
          
          <div className="bg-slate-900/50 p-4 rounded-lg mb-6">
            <h2 className="text-lg font-semibold text-amber-300 mb-2">Your Secret Recovery Phrase</h2>
            <p className="text-slate-400 text-sm mb-4">Write down or copy these words in the right order and save them somewhere safe.</p>
            <div className="grid grid-cols-3 gap-3 text-center font-mono text-white select-all">
                {seedPhrase.split(' ').map((word, index) => (
                    <div key={index} className="bg-slate-700 p-2 rounded-md">
                        <span className="text-slate-400 mr-2">{index + 1}.</span>{word}
                    </div>
                ))}
            </div>
             <p className="text-red-400 text-xs mt-4 font-semibold">NEVER share this phrase with anyone. It gives full access to your wallet.</p>
          </div>

          {error && <p className="bg-red-500/20 text-red-300 text-center p-2 rounded-md mb-4">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-white"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-300 mb-1">Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-white"
                    required
                  />
                </div>
            </div>
             <div className="flex items-start">
                <div className="flex items-center h-5">
                    <input id="backup" type="checkbox" checked={hasBackedUp} onChange={e => setHasBackedUp(e.target.checked)} className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-slate-500 rounded" />
                </div>
                <div className="ml-3 text-sm">
                    <label htmlFor="backup" className="font-medium text-slate-300">I have saved my secret recovery phrase.</label>
                </div>
            </div>
            <button type="submit" disabled={!hasBackedUp} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-lg transition disabled:bg-slate-600 disabled:cursor-not-allowed">
              Create Wallet
            </button>
          </form>
        </div>
        <p className="text-center text-slate-400 mt-6">
          Already have a wallet?{' '}
          <Link to="/login" className="font-medium text-blue-400 hover:text-blue-300">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
