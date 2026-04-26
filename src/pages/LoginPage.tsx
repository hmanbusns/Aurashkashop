import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, Leaf } from 'lucide-react';
import { AuthService } from '../services/authService';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await AuthService.login(email, password);
      navigate('/home');
    } catch (err: any) {
      console.error('Login Error:', err);
      
      if (err.code === 'auth/user-not-found') {
        // Redirect to signup if user not found, pre-filling email
        navigate(`/signup?email=${encodeURIComponent(email)}`);
        return;
      }

      let msg = err.message || 'Login failed. Please check your credentials.';
      
      if (err.code === 'auth/network-request-failed') {
        msg = "Network connection failed. Please ensure Firebase secrets are set correctly.";
      } else if (err.code === 'auth/user-not-found') {
        msg = "No account found with this email. Please check your spelling or sign up below.";
      } else if (err.code === 'auth/wrong-password') {
        msg = "Incorrect password. Please try again.";
      } else if (err.code === 'auth/invalid-email') {
        msg = "The email address is badly formatted.";
      }
      
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col p-6 overflow-y-auto">
      <header className="flex justify-between items-center py-4 mb-8">
        <button 
          onClick={() => navigate('/')}
          className="p-2 hover:bg-surface rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
      </header>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center text-center mb-12"
      >
        <Leaf className="w-10 h-10 text-primary mb-4" />
        <h1 className="text-3xl font-serif text-primary uppercase tracking-widest mb-2">Aurashka</h1>
        <h2 className="text-2xl font-medium text-cream mb-2">Welcome Back</h2>
        <p className="text-cream/60">Sign in to continue your natural beauty journey</p>
      </motion.div>

      <motion.form 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onSubmit={handleLogin}
        className="flex-1 max-w-md mx-auto w-full space-y-6"
      >
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div className="relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Mail className="w-5 h-5 text-cream/40 group-focus-within:text-primary transition-colors" />
            </div>
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full pl-12 pr-4 py-4 bg-surface/50 border border-white/5 rounded-2xl focus:border-primary/50 focus:bg-surface transition-all outline-none text-cream"
            />
          </div>

          <div className="relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Lock className="w-5 h-5 text-cream/40 group-focus-within:text-primary transition-colors" />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full pl-12 pr-12 py-4 bg-surface/50 border border-white/5 rounded-2xl focus:border-primary/50 focus:bg-surface transition-all outline-none text-cream"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-4 flex items-center text-cream/40"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          
          <div className="flex justify-end">
            <button type="button" className="text-sm text-cream/40 hover:text-primary transition-colors">
              Forgot Password?
            </button>
          </div>
        </div>

        <button
          id="login-btn"
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-primary text-background font-bold rounded-2xl shadow-xl shadow-primary/10 hover:shadow-primary/20 active:scale-[0.98] transition-all disabled:opacity-70"
        >
          {loading ? "Signing In..." : "Sign In"}
        </button>

        <div className="flex items-center gap-4 py-4">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-cream/30 text-xs font-semibold uppercase tracking-widest">OR</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        <div className="flex justify-center gap-6">
          <SocialButton icon="https://www.svgrepo.com/show/475656/google-color.svg" />
          <SocialButton icon="https://www.svgrepo.com/show/475647/facebook-color.svg" />
          <SocialButton icon="https://www.svgrepo.com/show/475637/apple-color.svg" />
        </div>

        <p className="text-center text-cream/50 mt-12">
          Don't have an account?{' '}
          <button 
            type="button"
            onClick={() => navigate('/signup')} 
            className="text-primary font-semibold hover:underline"
          >
            Sign Up
          </button>
        </p>
      </motion.form>
    </div>
  );
}

function SocialButton({ icon }: { icon: string }) {
  return (
    <button className="w-14 h-14 bg-surface/80 rounded-full flex items-center justify-center border border-white/5 hover:border-white/20 transition-all cursor-pointer">
      <img src={icon} alt="social" className="w-6 h-6" referrerPolicy="no-referrer" />
    </button>
  );
}
