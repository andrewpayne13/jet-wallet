import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Logo from '../components/Logo';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const success = login(email);
    if (!success) {
      setError('Invalid email or password.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-sm">
        <div className="mx-auto mb-8">
            <Logo />
        </div>
        <div className="bg-slate-800 rounded-xl shadow-lg p-8">
          <h1 className="text-2xl font-bold text-white text-center mb-6">Welcome Back</h1>
          {error && <p className="bg-red-500/20 text-red-300 text-center p-2 rounded-md mb-4">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-white focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-white focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-lg transition">
              Login
            </button>
          </form>
        </div>
        <p className="text-center text-slate-400 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="font-medium text-blue-400 hover:text-blue-300">
            Create Wallet
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
