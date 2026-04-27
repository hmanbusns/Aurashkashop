import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './lib/firebase';
import { AuthService } from './services/authService';
import { UserProfile, AuthStatus } from './types';

// Pages
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import HomePage from './pages/HomePage';
import AdminPanel from './pages/AdminPanel';
import SearchPage from './pages/SearchPage';
import ProfilePage from './pages/ProfilePage';
import CategoriesPage from './pages/CategoriesPage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import CartPage from './pages/CartPage';
import WishlistPage from './pages/WishlistPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderTrackingPage from './pages/OrderTrackingPage';
import AboutUsPage from './pages/AboutUsPage';
import ContactUsPage from './pages/ContactUsPage';

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [authStatus, setAuthStatus] = useState<AuthStatus>('loading');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const profile = await AuthService.getUserProfile(firebaseUser.uid);
          setUser(profile);
          setAuthStatus('authenticated');
        } else {
          setUser(null);
          setAuthStatus('unauthenticated');
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        setAuthStatus('unauthenticated');
      }
    });

    const timeout = setTimeout(() => {
      setAuthStatus(prev => {
        if (prev === 'loading') {
          return 'unauthenticated';
        }
        return prev;
      });
    }, 10000);

    return () => {
      unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  if (authStatus === 'loading') {
    return (
      <div className="min-h-screen bg-[#0D110D] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 border-4 border-[#6B7D3F] border-t-transparent rounded-full animate-spin"></div>
        <div className="mt-8">
          <h1 className="text-2xl font-serif text-[#6B7D3F] italic uppercase tracking-widest mb-2">Aurashka</h1>
          <p className="text-cream/40 text-xs animate-pulse">Initializing natural beauty journey...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/home" />} />
        <Route 
          path="/login" 
          element={authStatus === 'authenticated' ? <Navigate to="/home" /> : <LoginPage />} 
        />
        <Route 
          path="/signup" 
          element={authStatus === 'authenticated' ? <Navigate to="/home" /> : <SignupPage />} 
        />
        <Route 
          path="/home" 
          element={<HomePage user={user} />} 
        />
        <Route 
          path="/search" 
          element={<SearchPage />} 
        />
        <Route 
          path="/profile" 
          element={<ProfilePage user={user} />} 
        />
        <Route 
          path="/categories" 
          element={<CategoriesPage />} 
        />
        <Route 
          path="/product/:id" 
          element={<ProductDetailsPage />} 
        />
        <Route 
          path="/cart" 
          element={<CartPage />} 
        />
        <Route 
          path="/wishlist" 
          element={<WishlistPage />} 
        />
        <Route 
          path="/checkout" 
          element={authStatus === 'authenticated' ? <CheckoutPage /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/orders" 
          element={authStatus === 'authenticated' ? <OrderTrackingPage /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/about" 
          element={<AboutUsPage />} 
        />
        <Route 
          path="/contact" 
          element={<ContactUsPage />} 
        />
        <Route 
          path="/admin" 
          element={
            authStatus === 'authenticated' && user?.role === 'admin' 
              ? <AdminPanel /> 
              : <Navigate to="/home" />
          } 
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

