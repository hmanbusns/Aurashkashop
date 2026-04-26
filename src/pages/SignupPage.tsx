import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { Mail, Lock, User, Phone, ArrowLeft, Leaf, Eye, EyeOff } from 'lucide-react';
import { AuthService } from '../services/authService';

export default function SignupPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  });

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const emailParam = params.get('email');
    if (emailParam) {
      setFormData(prev => ({ ...prev, email: emailParam }));
    }
  }, [location]);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await AuthService.signup(
        formData.email,
        formData.password,
        formData.name,
        formData.phone
      );
      navigate('/home');
    } catch (err: any) {
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col p-6 overflow-y-auto">
      <header className="flex items-center py-4 mb-8">
        <button 
          onClick={() => navigate('/login')}
          className="p-2 hover:bg-surface rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
      </header>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center text-center mb-10"
      >
        <Leaf className="w-10 h-10 text-primary mb-4" />
        <h1 className="text-3xl font-serif text-primary uppercase tracking-widest mb-2 font-bold">Aurashka</h1>
        <h2 className="text-2xl font-medium text-cream mb-2">Create Account</h2>
        <p className="text-cream/60">Join our natural beauty community today</p>
      </motion.div>

      <motion.form 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onSubmit={handleSignup}
        className="max-w-md mx-auto w-full space-y-5"
      >
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <InputGroup
            icon={<User className="w-5 h-5" />}
            placeholder="Full Name"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <InputGroup
            icon={<Mail className="w-5 h-5" />}
            placeholder="Email Address"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <InputGroup
            icon={<Phone className="w-5 h-5" />}
            placeholder="Phone Number"
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            required
          />
          <div className="relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-cream/40 group-focus-within:text-primary transition-colors">
              <Lock className="w-5 h-5" />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
        </div>

        <button
          id="signup-btn"
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-primary text-background font-bold rounded-2xl shadow-xl shadow-primary/10 hover:shadow-primary/20 active:scale-[0.98] transition-all disabled:opacity-70 mt-4"
        >
          {loading ? "Creating Account..." : "Sign Up"}
        </button>

        <p className="text-center text-cream/50 py-8">
          Already have an account?{' '}
          <button 
            type="button"
            onClick={() => navigate('/login')} 
            className="text-primary font-semibold hover:underline"
          >
            Log In
          </button>
        </p>
      </motion.form>
    </div>
  );
}

function InputGroup({ icon, ...props }: any) {
  return (
    <div className="relative group">
      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-cream/40 group-focus-within:text-primary transition-colors">
        {icon}
      </div>
      <input
        {...props}
        className="w-full pl-12 pr-4 py-4 bg-surface/50 border border-white/5 rounded-2xl focus:border-primary/50 focus:bg-surface transition-all outline-none text-cream"
      />
    </div>
  );
}
