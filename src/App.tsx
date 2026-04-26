import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './lib/firebase';
import { AuthService } from './services/authService';
import { UserProfile, AuthStatus } from './types';

// Pages
import SplashPage from './pages/SplashPage';
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
      if (firebaseUser) {
        const profile = await AuthService.getUserProfile(firebaseUser.uid);
        setUser(profile);
        setAuthStatus('authenticated');
      } else {
        setUser(null);
        setAuthStatus('unauthenticated');
      }
    });

    return () => unsubscribe();
  }, []);

  if (authStatus === 'loading') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<SplashPage />} />
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
          element={authStatus === 'authenticated' ? <HomePage user={user} /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/search" 
          element={authStatus === 'authenticated' ? <SearchPage /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/profile" 
          element={authStatus === 'authenticated' ? <ProfilePage user={user} /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/categories" 
          element={authStatus === 'authenticated' ? <CategoriesPage /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/product/:id" 
          element={authStatus === 'authenticated' ? <ProductDetailsPage /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/cart" 
          element={authStatus === 'authenticated' ? <CartPage /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/wishlist" 
          element={authStatus === 'authenticated' ? <WishlistPage /> : <Navigate to="/login" />} 
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
          element={authStatus === 'authenticated' ? <AboutUsPage /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/contact" 
          element={authStatus === 'authenticated' ? <ContactUsPage /> : <Navigate to="/login" />} 
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

