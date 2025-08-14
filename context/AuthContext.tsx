import React, { createContext, useState, useEffect, ReactNode, useReducer } from 'react';
import { useNavigate } from 'react-router-dom';
import { User as AppUser, WalletState, isValidEmail, Transaction, Wallet, Staked, CashAccount } from '../types';
import { auth, db } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, UserCredential } from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, deleteDoc, collection, getDocs } from 'firebase/firestore';

interface AuthState {
  currentUser: AppUser | null;
  users: AppUser[];
}

type Action =
  | { type: 'LOGIN'; payload: AppUser }
  | { type: 'LOGOUT' }
  | { type: 'REGISTER'; payload: AppUser }
  | { type: 'UPDATE_USER_FINANCIALS'; payload: { userId: string; data: WalletState } }
  | { type: 'DELETE_USER'; payload: { userId: string } }
  | { type: 'UPDATE_USER'; payload: { userId: string; patch: Partial<AppUser> } }
  | { type: 'CREATE_USER'; payload: AppUser }
  | { type: 'IMPERSONATE'; payload: { userId: string } }
  | { type: 'LOAD_USERS'; payload: AppUser[] };

const initialState: AuthState = {
  currentUser: null,
  users: [],
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
        users: [...state.users, action.payload],
        currentUser: action.payload,
      };
    case 'UPDATE_USER_FINANCIALS': {
      const { userId, data } = action.payload;
      const updatedUsers = state.users.map(u => u.id === userId ? { ...u, ...data } : u);
      return {
        ...state,
        users: updatedUsers,
        currentUser: state.currentUser?.id === userId ? { ...state.currentUser, ...data } : state.currentUser,
      };
    }
    case 'DELETE_USER': {
      const { userId } = action.payload;
      const newUsers = state.users.filter(u => u.id !== userId);
      return {
        ...state,
        users: newUsers,
        currentUser: state.currentUser?.id === userId ? null : state.currentUser,
      };
    }
    case 'UPDATE_USER': {
      const { userId, patch } = action.payload;
      const updatedUsers = state.users.map(u => u.id === userId ? { ...u, ...patch } : u);
      return {
        ...state,
        users: updatedUsers,
        currentUser: state.currentUser?.id === userId ? { ...state.currentUser, ...patch } : state.currentUser,
      };
    }
    case 'CREATE_USER': {
      return {
        ...state,
        users: [...state.users, action.payload],
      };
    }
    case 'IMPERSONATE': {
      const target = state.users.find(u => u.id === action.payload.userId);
      return { ...state, currentUser: target || null };
    }
    case 'LOAD_USERS': {
      return { ...state, users: action.payload };
    }
    default:
      return state;
  }
};

export const AuthContext = createContext<{
  currentUser: AppUser | null;
  users: AppUser[];
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (email: string, password: string) => Promise<AppUser | null>;
  updateUserFinancials: (userId: string, data: WalletState) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  createUser: (data: Partial<AppUser>) => Promise<AppUser | null>;
  updateUser: (userId: string, patch: Partial<AppUser>) => Promise<void>;
  impersonate: (userId: string) => void;
  loadUsers: () => Promise<void>;
}>({
  currentUser: null,
  users: [],
  login: async () => false,
  logout: async () => {},
  register: async () => null,
  updateUserFinancials: async () => {},
  deleteUser: async () => {},
  createUser: async () => null,
  updateUser: async () => {},
  impersonate: () => {},
  loadUsers: async () => {},
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          dispatch({ type: 'LOGIN', payload: userDoc.data() as AppUser });
        }
      } else {
        dispatch({ type: 'LOGOUT' });
      }
    });
    return unsubscribe;
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    console.log('Login attempt with email:', email);
    console.log('Login attempt with password:', password);
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const userData = await getDoc(doc(db, 'users', credential.user.uid));
      if (userData.exists()) {
        const user = userData.data() as AppUser;
        dispatch({ type: 'LOGIN', payload: user });
        navigate(user.role === 'admin' ? '/admin' : '/wallets');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error', error);
      return false;
    }
  };

  const logout = async () => {
    await signOut(auth);
    dispatch({ type: 'LOGOUT' });
    navigate('/login');
  };

  const register = async (email: string, password: string): Promise<AppUser | null> => {
    console.log('Registration attempt with email:', email);
    console.log('Registration attempt with password:', password);
    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      const newUser: AppUser = {
        id: credential.user.uid,
        email,
        role: 'user',
        registeredAt: Date.now(),
        wallets: [],
        cash: [],
        transactions: [],
        staked: [],
      };
      await setDoc(doc(db, 'users', newUser.id), newUser);
      dispatch({ type: 'REGISTER', payload: newUser });
      navigate('/wallets');
      return newUser;
    } catch (error) {
      console.error('Registration error', error);
      return null;
    }
  };

  const updateUserFinancials = async (userId: string, data: WalletState) => {
    await updateDoc(doc(db, 'users', userId), data as Partial<AppUser>);
    dispatch({ type: 'UPDATE_USER_FINANCIALS', payload: { userId, data } });
  };

  const deleteUser = async (userId: string) => {
    await deleteDoc(doc(db, 'users', userId));
    dispatch({ type: 'DELETE_USER', payload: { userId } });
  };

  const createUser = async (data: Partial<AppUser>): Promise<AppUser | null> => {
    if (!data.email || !data.password) return null;
    try {
      const credential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const user: AppUser = {
        id: credential.user.uid,
        email: data.email,
        role: data.role || 'user',
        registeredAt: Date.now(),
        wallets: data.wallets || [],
        cash: data.cash || [],
        transactions: data.transactions || [],
        staked: data.staked || [],
      };
      await setDoc(doc(db, 'users', user.id), user);
      dispatch({ type: 'CREATE_USER', payload: user });
      return user;
    } catch (error) {
      console.error('Create user error', error);
      return null;
    }
  };

  const updateUser = async (userId: string, patch: Partial<AppUser>) => {
    await updateDoc(doc(db, 'users', userId), patch);
    dispatch({ type: 'UPDATE_USER', payload: { userId, patch } });
  };

  const impersonate = (userId: string) => {
    dispatch({ type: 'IMPERSONATE', payload: { userId } });
    navigate('/wallets');
  };

  const loadUsers = async () => {
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const usersList = usersSnapshot.docs.map(doc => doc.data() as AppUser);
    dispatch({ type: 'LOAD_USERS', payload: usersList });
  };

  useEffect(() => {
    if (state.currentUser?.role === 'admin') {
      loadUsers();
    }
  }, [state.currentUser]);

  return (
    <AuthContext.Provider
      value={{
        currentUser: state.currentUser,
        users: state.users,
        login,
        logout,
        register,
        updateUserFinancials,
        deleteUser,
        createUser,
        updateUser,
        impersonate,
        loadUsers,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
