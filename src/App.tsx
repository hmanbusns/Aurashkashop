import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './lib/firebase';
import { AuthService } from './services/authService';
import { UserProfile, AuthStatus } from './types';
import { PageShimmer } from './components/Shimmer';

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
import SettingsPage from './pages/SettingsPage';

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [authStatus, setAuthStatus] = useState<AuthStatus>('loading');

  useEffect(() => {
    let profileUnsubscribe: (() => void) | null = null;

    const authUnsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // One-time initial fetch
          const initialProfile = await AuthService.getUserProfile(firebaseUser.uid);
          setUser(initialProfile);
          setAuthStatus('authenticated');

          // Set up real-time listener
          if (profileUnsubscribe) profileUnsubscribe();
          profileUnsubscribe = AuthService.onProfileSync(firebaseUser.uid, (updatedProfile) => {
            setUser(updatedProfile);
          });
        } else {
          if (profileUnsubscribe) profileUnsubscribe();
          profileUnsubscribe = null;
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
      authUnsubscribe();
      if (profileUnsubscribe) profileUnsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  if (authStatus === 'loading') {
    return <PageShimmer />;
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
          element={authStatus === 'authenticated' ? <CheckoutPage user={user} /> : <Navigate to="/login" />} 
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
          path="/settings" 
          element={<SettingsPage />} 
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

