# JetWallet - Crypto/Fiat Wallet Application

A modern React + TypeScript single-page application for managing cryptocurrency and fiat wallets, built with Vite and TailwindCSS.

## 🚀 Features

- **Wallet Management**: Create and manage multiple cryptocurrency wallets
- **Portfolio Overview**: Visualize asset allocation with interactive charts
- **Buy/Sell**: Trade cryptocurrencies with real-time pricing
- **Exchange**: Swap between different cryptocurrencies
- **Staking**: Earn rewards by staking supported assets
- **Transaction History**: Track all wallet activities
- **Admin Dashboard**: User management and system administration
- **Authentication**: Secure login and registration system

## 🛠 Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: TailwindCSS
- **Routing**: React Router DOM
- **Charts**: Recharts
- **State Management**: React Context + useReducer
- **Data Persistence**: localStorage (development)

## 📦 Installation

1. Clone the repository:
```bash
git clone https://github.com/andrewpayne13/jet-wallet.git
cd jet-wallet
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run type-check` - Run TypeScript type checking
- `npm run lint` - Run ESLint (when configured)
- `npm run format` - Format code with Prettier (when configured)
- `npm run clean` - Clean build artifacts

## 🏗 Project Structure

```
jet-wallet/
├── components/          # Reusable UI components
│   ├── ErrorBoundary.tsx
│   ├── Header.tsx
│   ├── Sidebar.tsx
│   ├── ProtectedRoute.tsx
│   └── ...
├── context/            # React Context providers
│   ├── AuthContext.tsx
│   ├── WalletContext.tsx
│   └── PricesContext.tsx
├── hooks/              # Custom React hooks
│   ├── useAuth.ts
│   ├── useWallet.ts
│   └── usePrices.ts
├── pages/              # Page components
│   ├── Login.tsx
│   ├── Wallets.tsx
│   ├── Portfolio.tsx
│   ├── BuySell.tsx
│   ├── Exchange.tsx
│   ├── Earn.tsx
│   ├── Transactions.tsx
│   └── Admin.tsx
├── services/           # API services
│   └── prices.ts
├── utils/              # Utility functions
│   └── validation.ts
├── types.ts            # TypeScript type definitions
├── constants.tsx       # App constants and configurations
└── App.tsx            # Main application component
```

## 🔐 Authentication

The application includes a simple authentication system:

- **Default Admin**: `admin@jetwallet.io`
- **Registration**: Create new user accounts
- **Role-based Access**: Admin and user roles
- **Protected Routes**: Secure access to wallet features

## 💰 Supported Cryptocurrencies

- Bitcoin (BTC)
- Ethereum (ETH)
- XRP (XRP)
- Tether (USDT)
- Solana (SOL)
- Dogecoin (DOGE)

## 🔄 Recent Improvements

### Code Quality & Type Safety
- ✅ Enhanced TypeScript types with runtime validation
- ✅ Added comprehensive error boundary component
- ✅ Improved input validation and sanitization
- ✅ Better error handling throughout the application

### Performance Optimizations
- ✅ Optimized React Context providers to prevent unnecessary re-renders
- ✅ Added useCallback and useMemo for expensive operations
- ✅ Implemented debouncing for user inputs
- ✅ Improved state management patterns

### Security Enhancements
- ✅ Input validation and sanitization
- ✅ Email format validation
- ✅ Transaction amount validation
- ✅ Balance checking for sell/send operations
- ✅ Safe localStorage operations with error handling

### User Experience
- ✅ Loading states for async operations
- ✅ Better error messages and user feedback
- ✅ Improved form validation
- ✅ Responsive design improvements
- ✅ Consistent styling and animations

### Developer Experience
- ✅ Utility functions for common operations
- ✅ Better code organization and separation of concerns
- ✅ Comprehensive type definitions
- ✅ Error logging and debugging improvements

## 🚧 Development Notes

### Current Implementation
- Uses localStorage for data persistence (development only)
- Simulated API calls for cryptocurrency prices
- Mock transaction processing
- In-memory user management

### Recommended Production Improvements
1. **Backend Integration**: Replace localStorage with proper database
2. **Real API Integration**: Connect to live cryptocurrency price feeds
3. **Authentication**: Implement JWT tokens and secure session management
4. **Testing**: Add comprehensive unit and integration tests
5. **Security**: Implement proper encryption and security measures
6. **Performance**: Add caching and optimization strategies

## 🧪 Testing

Currently, the project doesn't include tests. Recommended testing setup:

```bash
# Install testing dependencies
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom

# Add test scripts to package.json
"test": "vitest",
"test:ui": "vitest --ui",
"coverage": "vitest --coverage"
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Make your changes and commit: `git commit -m 'Add new feature'`
4. Push to the branch: `git push origin feature/new-feature`
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🔗 Links

- [Repository](https://github.com/andrewpayne13/jet-wallet)
- [Issues](https://github.com/andrewpayne13/jet-wallet/issues)
- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://reactjs.org/)
- [TailwindCSS Documentation](https://tailwindcss.com/)

## 📞 Support

For support, please open an issue on GitHub or contact the development team.
