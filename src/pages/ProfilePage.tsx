import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, ShoppingBag, MapPin, CreditCard, Heart, Settings, 
  HelpCircle, LogOut, ChevronRight, User as UserIcon, Shield,
  Home, Grid, Trash2, Edit2, Plus, X, Phone
} from 'lucide-react';
import { UserProfile, Address } from '../types';
import { AuthService } from '../services/authService';
import { LocationPicker } from '../components/LocationPicker';
import { Shimmer } from '../components/Shimmer';

export default function ProfilePage({ user: initialUser }: { user: UserProfile | null }) {
  const [user, setUser] = useState<UserProfile | null>(initialUser);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({ displayName: '', phone: '' });

  React.useEffect(() => {
    setUser(initialUser);
    if (initialUser) {
      setEditFormData({ 
        displayName: initialUser.displayName || '', 
        phone: initialUser.phone || '' 
      });
    }
  }, [initialUser]);

  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [addressLoading, setAddressLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const navigate = useNavigate();

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsUpdating(true);
    try {
      await AuthService.updateUserProfile(user.uid, editFormData);
      setShowEditModal(false);
    } catch (error) {
      console.error("Profile update failed", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEditAddress = (addr: Address) => {
    // This is handled by triggering LocationPicker with specific state 
    // but for simplicity we'll just open the picker which shows the list
    setShowLocationPicker(true);
  };

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
        </div>
        <h2 className="text-2xl font-bold text-cream mb-1 flex items-center gap-2">
          {user?.displayName || 'Hello, Guest'}
          {user && (
            <button onClick={() => setShowEditModal(true)} className="p-1 hover:text-primary transition-colors">
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          )}
        </h2>
        <p className="text-primary text-sm font-medium">{user?.email || 'Sign in to sync your data'}</p>
        {(user?.phone && user.phone !== '') && <p className="text-cream/30 text-[10px] mt-1 uppercase tracking-widest font-bold">{user.phone}</p>}
      </div>

      <AnimatePresence>
        {showEditModal && user && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
              onClick={() => setShowEditModal(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-background border border-white/10 rounded-[32px] overflow-hidden p-8 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-serif font-bold text-cream">Edit Profile</h3>
                <button onClick={() => setShowEditModal(false)} className="p-2 text-cream/20 hover:text-cream transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleUpdateProfile} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-cream/40 uppercase tracking-widest ml-2">Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-cream/20" />
                    <input 
                      type="text"
                      required
                      value={editFormData.displayName}
                      onChange={e => setEditFormData({...editFormData, displayName: e.target.value})}
                      className="w-full bg-surface/50 border border-white/5 rounded-2xl p-4 pl-11 text-cream text-sm outline-none focus:border-primary/50 transition-all font-medium"
                      placeholder="Your name"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-cream/40 uppercase tracking-widest ml-2">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-cream/20" />
                    <input 
                      type="tel"
                      required
                      value={editFormData.phone}
                      onChange={e => setEditFormData({...editFormData, phone: e.target.value})}
                      className="w-full bg-surface/50 border border-white/5 rounded-2xl p-4 pl-11 text-cream text-sm outline-none focus:border-primary/50 transition-all font-medium"
                      placeholder="Your phone number"
                    />
                  </div>
                </div>
                <button 
                  type="submit"
                  disabled={isUpdating}
                  className="w-full bg-primary text-background font-bold py-4.5 rounded-2xl shadow-xl shadow-primary/20 disabled:opacity-50 mt-4 text-[10px] uppercase tracking-[0.2em]"
                >
                  {isUpdating ? 'Updating...' : 'Save Changes'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="px-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-serif font-bold text-cream/70 uppercase tracking-widest">Delivery Addresses</h3>
          {user && (
            <button 
              onClick={() => setShowLocationPicker(true)}
              className="p-2 bg-primary/10 text-primary rounded-lg hover:bg-primary hover:text-background transition-all"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}
        </div>

        {user?.address ? (
          <div className="space-y-3">
             <div className="bg-primary/5 border border-primary/20 p-5 rounded-3xl relative">
                <div className="absolute top-4 right-4 flex items-center gap-2">
                  <span className="bg-primary text-background text-[7px] font-bold px-1.5 py-0.5 rounded uppercase tracking-widest">Selected</span>
                  <button onClick={() => setShowLocationPicker(true)} className="p-1 px-2 bg-surface rounded-lg text-cream/40 hover:text-primary transition-colors">
                    <Edit2 className="w-3 h-3" />
                  </button>
                </div>
                <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-2">Default Address</p>
                <p className="text-cream text-sm font-medium mb-1">{user.address.fullName}</p>
                <p className="text-cream/50 text-[11px] leading-relaxed pr-10">
                  {user.address.street}, {user.address.city}<br/>
                  {user.address.state} - {user.address.pincode}
                </p>
             </div>
             
             {user.addresses && user.addresses.length > 1 && (
               <button 
                onClick={() => setShowLocationPicker(true)}
                className="w-full text-center py-2 text-[10px] uppercase font-bold text-primary/60 tracking-widest"
               >
                 Manage all {user.addresses.length} addresses
               </button>
             )}
          </div>
        ) : user ? (
          <div className="bg-surface/30 border border-white/5 p-8 rounded-3xl text-center">
            <MapPin className="w-8 h-8 text-cream/10 mx-auto mb-3" />
            <p className="text-cream/30 text-xs mb-4">No addresses added yet</p>
            <button 
              onClick={() => setShowLocationPicker(true)}
              className="px-6 py-2 bg-primary text-background text-[10px] font-bold uppercase tracking-widest rounded-xl"
            >
              Add New Address
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <Shimmer height="120px" rounded="rounded-3xl" />
          </div>
        )}
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
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-background/90 backdrop-blur-md border-t border-white/5 px-6 py-1.5 flex items-center justify-between mx-4 mb-2 rounded-[24px] shadow-2xl fix-glitch">
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
