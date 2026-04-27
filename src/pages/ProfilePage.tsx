import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  ArrowLeft, ShoppingBag, MapPin, CreditCard, Heart, Settings, 
  HelpCircle, LogOut, ChevronRight, User as UserIcon, Shield,
  Home, Grid
} from 'lucide-react';
import { UserProfile } from '../types';
import { AuthService } from '../services/authService';
import { LocationPicker } from '../components/LocationPicker';

export default function ProfilePage({ user: initialUser }: { user: UserProfile | null }) {
  const [user, setUser] = useState<UserProfile | null>(initialUser);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await AuthService.logout();
    navigate('/login');
  };

  const menuItems = [
    { icon: <ShoppingBag className="w-5 h-5" />, label: 'My Orders', path: '/orders' },
    { 
      icon: <MapPin className="w-5 h-5" />, 
      label: 'My Address', 
      isAction: true,
      onClick: () => setShowLocationPicker(true)
    },
    { icon: <CreditCard className="w-5 h-5" />, label: 'Payment Methods', path: '/payment' },
    { icon: <Heart className="w-5 h-5" />, label: 'Wishlist', path: '/wishlist' },
    { icon: <Settings className="w-5 h-5" />, label: 'Settings', path: '/settings' },
    { icon: <HelpCircle className="w-5 h-5" />, label: 'Help & Support', path: '/contact' },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="p-6 flex items-center justify-between">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-surface rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-cream/70" />
        </button>
        <h1 className="text-xl font-serif text-cream font-bold">Profile</h1>
        <div className="w-10" /> {/* Spacer */}
      </header>

      <div className="px-6 flex flex-col items-center mb-6">
        <div className="relative mb-4">
          <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-primary/20 shadow-xl bg-surface flex items-center justify-center">
            {user?.displayName ? (
              <span className="text-4xl font-serif font-bold text-primary">
                {user.displayName[0].toUpperCase()}
              </span>
            ) : (
              <UserIcon className="w-12 h-12 text-cream/20" />
            )}
          </div>
          {user && (
            <button className="absolute bottom-0 right-0 p-2 bg-primary text-background rounded-full shadow-lg">
              <Settings className="w-4 h-4" />
            </button>
          )}
        </div>
        <h2 className="text-2xl font-bold text-cream mb-1">{user?.displayName || 'Hello, Guest'}</h2>
        <p className="text-primary text-sm font-medium">{user?.email || 'Sign in to sync your data'}</p>
      </div>

      {user?.address && (
        <div className="px-6 mb-8">
          <div className="bg-surface/30 border border-white/5 p-5 rounded-3xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-1 px-2 border border-primary/20 bg-primary/5 rounded-lg">
                <span className="text-[8px] font-bold text-primary uppercase tracking-[0.2em]">Current Delivery Address</span>
              </div>
            </div>
            <p className="text-cream text-sm font-medium mb-1">{user.address.street}</p>
            <p className="text-cream/50 text-[11px] leading-relaxed">
              {user.address.city}, {user.address.district}<br/>
              {user.address.state} - {user.address.pincode}
            </p>
          </div>
        </div>
      )}

      <div className="px-6 space-y-3">
        {user?.role === 'admin' && (
          <button 
            onClick={() => navigate('/admin')}
            className="w-full bg-primary/10 border border-primary/20 p-5 rounded-3xl flex items-center justify-between group hover:bg-primary/20 transition-all mb-4"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary text-background rounded-2xl">
                <Shield className="w-5 h-5" />
              </div>
              <div className="text-left">
                <span className="text-cream font-bold block">Admin Dashboard</span>
                <span className="text-xs text-primary font-bold uppercase tracking-widest">Secret Access</span>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-primary group-hover:translate-x-1 transition-transform" />
          </button>
        )}

        {menuItems.map((item: any, idx) => (
          <button 
            key={idx}
            onClick={() => {
              if (!user) return navigate('/login');
              if (item.isAction) item.onClick();
              else navigate(item.path);
            }}
            className="w-full bg-surface/30 border border-white/5 p-5 rounded-3xl flex items-center justify-between group hover:bg-surface/50 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-surface rounded-2xl text-primary">
                {item.icon}
              </div>
              <span className="text-cream font-medium">{item.label}</span>
            </div>
            <ChevronRight className="w-5 h-5 text-cream/20 group-hover:translate-x-1 transition-transform" />
          </button>
        ))}

        {user ? (
          <button 
            onClick={handleLogout}
            className="w-full bg-red-500/5 border border-red-500/10 p-5 rounded-3xl flex items-center justify-between group hover:bg-red-500/10 transition-all mt-6"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-500/10 text-red-400 rounded-2xl">
                <LogOut className="w-5 h-5" />
              </div>
              <span className="text-red-400 font-medium">Log Out</span>
            </div>
          </button>
        ) : (
          <button 
            onClick={() => navigate('/login')}
            className="w-full bg-primary/10 border border-primary/20 p-5 rounded-3xl flex items-center justify-between group hover:bg-primary/20 transition-all mt-6"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary text-background rounded-2xl">
                <UserIcon className="w-5 h-5" />
              </div>
              <span className="text-primary font-bold">Log In / Sign Up</span>
            </div>
            <ChevronRight className="w-5 h-5 text-primary group-hover:translate-x-1 transition-transform" />
          </button>
        )}
      </div>

      {/* Location Picker Modal */}
      {user && (
        <LocationPicker 
          isOpen={showLocationPicker} 
          user={user} 
          onClose={() => setShowLocationPicker(false)}
          onSuccess={(updatedProfile) => {
            setUser(updatedProfile);
          }}
        />
      )}

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-xl border-t border-white/5 px-6 py-1.5 flex items-center justify-between mx-4 mb-2 rounded-[24px] shadow-2xl">
        <NavIcon icon={<Home className="w-5 h-5" />} onClick={() => navigate('/home')} />
        <NavIcon icon={<Grid className="w-5 h-5" />} onClick={() => navigate('/categories')} />
        <NavIcon icon={<Heart className="w-5 h-5" />} onClick={() => navigate('/wishlist')} />
        <NavIcon icon={<UserIcon className="w-5 h-5" />} active />
      </nav>
    </div>
  );
}

function NavIcon({ icon, active, onClick }: { icon: any, active?: boolean, onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`p-2.5 rounded-xl transition-all ${active ? 'bg-primary text-background shadow-lg shadow-primary/20' : 'text-cream/30 hover:text-primary'}`}
    >
      {icon}
    </button>
  );
}
