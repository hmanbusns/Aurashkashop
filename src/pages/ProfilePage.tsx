import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  ArrowLeft, ShoppingBag, MapPin, CreditCard, Heart, Settings, 
  HelpCircle, LogOut, ChevronRight, User as UserIcon, Shield
} from 'lucide-react';
import { UserProfile } from '../types';
import { AuthService } from '../services/authService';

export default function ProfilePage({ user }: { user: UserProfile | null }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await AuthService.logout();
    navigate('/login');
  };

  const menuItems = [
    { icon: <ShoppingBag className="w-5 h-5" />, label: 'My Orders', path: '/orders' },
    { icon: <MapPin className="w-5 h-5" />, label: 'My Addresses', path: '/addresses' },
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

      <div className="px-6 flex flex-col items-center mb-10">
        <div className="relative mb-4">
          <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-primary/20 shadow-xl">
            <img 
              src={user?.avatarUrl || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=1974"} 
              alt={user?.displayName} 
              className="w-full h-full object-cover"
            />
          </div>
          <button className="absolute bottom-0 right-0 p-2 bg-primary text-background rounded-full shadow-lg">
            <Settings className="w-4 h-4" />
          </button>
        </div>
        <h2 className="text-2xl font-bold text-cream mb-1">{user?.displayName}</h2>
        <p className="text-primary text-sm font-medium">{user?.email}</p>
      </div>

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

        {menuItems.map((item, idx) => (
          <button 
            key={idx}
            onClick={() => navigate(item.path)}
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
      </div>

      {/* Bottom Nav Placeholder */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-xl border-t border-white/5 px-8 py-4 flex items-center justify-between mx-4 mb-4 rounded-[32px] shadow-2xl">
        <button onClick={() => navigate('/home')} className="p-3 text-cream/30 hover:text-primary"><LayoutGridIcon className="w-6 h-6" /></button>
        <button onClick={() => navigate('/search')} className="p-3 text-cream/30 hover:text-primary"><SearchIcon className="w-6 h-6" /></button>
        <button className="p-3 text-cream/30 hover:text-primary"><HeartIcon className="w-6 h-6" /></button>
        <button className="p-3 bg-primary text-background rounded-2xl shadow-lg shadow-primary/20"><UserIcon className="w-6 h-6" /></button>
      </nav>
    </div>
  );
}

function LayoutGridIcon(props: any) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg> }
function SearchIcon(props: any) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg> }
function HeartIcon(props: any) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg> }
