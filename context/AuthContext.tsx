import React, { createContext, useReducer, ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, WalletState } from '../types';

interface AuthState {
  users: Record<string, User>;
  currentUser: User | null;
}

type Action =
  | { type: 'LOGIN'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'REGISTER'; payload: User }
  | { type: 'UPDATE_USER_FINANCIALS'; payload: { userId: string; data: WalletState } }
  | { type: 'DELETE_USER'; payload: { userId: string } }
  | { type: 'UPDATE_USER'; payload: { userId: string; patch: Partial<User> } }
  | { type: 'CREATE_USER'; payload: User }
  | { type: 'IMPERSONATE'; payload: { userId: string } };

const initialState: AuthState = {
  users: {},
  currentUser: null,
};

const authReducer = (state: AuthState, action: Action): AuthState => {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, currentUser: action.payload };
    case 'LOGOUT':
      return { ...state, currentUser: null };
    case 'REGISTER':
      return {
        ...state,
        users: { ...state.users, [action.payload.id]: action.payload },
        currentUser: action.payload,
      };
    case 'UPDATE_USER_FINANCIALS': {
      const { userId, data } = action.payload;
      const updatedUsers = { ...state.users };
      if (updatedUsers[userId]) {
        updatedUsers[userId] = { ...updatedUsers[userId], ...data };
      }
      return {
        ...state,
        users: updatedUsers,
        currentUser: state.currentUser?.id === userId ? updatedUsers[userId] : state.currentUser,
      };
    }
    case 'DELETE_USER': {
      const { userId } = action.payload;
      const newUsers = { ...state.users };
      delete newUsers[userId];
      return {
        ...state,
        users: newUsers,
        currentUser: state.currentUser?.id === userId ? null : state.currentUser,
      };
    }
    case 'UPDATE_USER': {
      const { userId, patch } = action.payload;
      const existing = state.users[userId];
      if (!existing) return state;
      const updated = { ...existing, ...patch };
      const users = { ...state.users, [userId]: updated };
      return {
        ...state,
        users,
        currentUser: state.currentUser?.id === userId ? updated : state.currentUser,
      };
    }
    case 'CREATE_USER': {
      const user = action.payload;
      return {
        ...state,
        users: { ...state.users, [user.id]: user },
      };
    }
    case 'IMPERSONATE': {
      const target = state.users[action.payload.userId];
      if (!target) return state;
      return { ...state, currentUser: target };
    }
    default:
      return state;
  }
};

export const AuthContext = createContext<{
  currentUser: User | null;
  users: User[];
  login: (email: string) => boolean;
  logout: () => void;
  register: (email: string) => User | null;
  updateCurrentUserFinancials: (userId: string, data: WalletState) => void;
  deleteUser: (userId: string) => void;
  // Admin utilities
  createUser: (data: Partial<User>) => User | null;
  updateUser: (userId: string, patch: Partial<User>) => void;
  impersonate: (userId: string) => void;
}>({
  currentUser: null,
  users: [],
  login: () => false,
  logout: () => {},
  register: () => null,
  updateCurrentUserFinancials: () => {},
  deleteUser: () => {},
  createUser: () => null,
  updateUser: () => {},
  impersonate: () => {},
});

const getInitialState = (): AuthState => {
  try {
    const storedState = localStorage.getItem('jet_wallet_auth');
    if (storedState) {
      return JSON.parse(storedState);
    }
  } catch (error) {
    console.error('Could not parse auth state from localStorage', error);
  }
  // Create admin user if it doesn't exist
  const adminUser: User = {
    id: 'admin_user',
    email: 'admin@jetwallet.io',
    role: 'admin',
    registeredAt: Date.now(),
    wallets: [],
    cash: [],
    transactions: [],
    staked: [],
  };
  return {
    users: { admin_user: adminUser },
    currentUser: null,
  };
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, getInitialState());
  const navigate = useNavigate();

  useEffect(() => {
    try {
      localStorage.setItem('jet_wallet_auth', JSON.stringify(state));
    } catch (error) {
      console.error('Could not save auth state to localStorage', error);
    }
  }, [state]);

  const login = (email: string): boolean => {
    const usersArr = Object.values(state.users) as User[];
    const user = usersArr.find((u) => u.email === email);
    if (user) {
      dispatch({ type: 'LOGIN', payload: user });
      if (user.role === 'admin' || user.email === 'admin@jetwallet.io') {
        navigate('/admin');
      } else {
        navigate('/wallets');
      }
      return true;
    }
    return false;
  };

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
    navigate('/login');
  };

  const register = (email: string): User | null => {
    const usersArr = Object.values(state.users) as User[];
    const existingUser = usersArr.find((u) => u.email === email);
    if (existingUser) {
      return null;
    }
    const newUser: User = {
      id: `user_${Date.now()}`,
      email,
      role: 'user',
      registeredAt: Date.now(),
      wallets: [],
      cash: [],
      transactions: [],
      staked: [],
    };
    dispatch({ type: 'REGISTER', payload: newUser });
    navigate('/wallets');
    return newUser;
  };

  const updateCurrentUserFinancials = (userId: string, data: WalletState) => {
    dispatch({ type: 'UPDATE_USER_FINANCIALS', payload: { userId, data } });
  };

  const deleteUser = (userId: string) => {
    dispatch({ type: 'DELETE_USER', payload: { userId } });
  };

  // Admin utilities
  const createUser = (data: Partial<User>): User | null => {
    if (!data.email) return null;
    const usersArr = Object.values(state.users) as User[];
    const exists = usersArr.some((u) => u.email === data.email);
    if (exists) return null;
    const user: User = {
      id: data.id || `user_${Date.now()}`,
      email: data.email,
      password: data.password,
      seedPhrase: data.seedPhrase,
      role: data.role || 'user',
      registeredAt: data.registeredAt || Date.now(),
      wallets: data.wallets || [],
      transactions: data.transactions || [],
      staked: data.staked || [],
    };
    dispatch({ type: 'CREATE_USER', payload: user });
    return user;
  };

  const updateUser = (userId: string, patch: Partial<User>) => {
    dispatch({ type: 'UPDATE_USER', payload: { userId, patch } });
  };

  const impersonate = (userId: string) => {
    dispatch({ type: 'IMPERSONATE', payload: { userId } });
    navigate('/wallets');
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser: state.currentUser,
        users: Object.values(state.users),
        login,
        logout,
        register,
        updateCurrentUserFinancials,
        deleteUser,
        createUser,
        updateUser,
        impersonate,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
