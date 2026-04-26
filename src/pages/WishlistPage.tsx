import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Trash2, Heart, ShoppingBag, Plus, Home, Grid, User as UserIcon } from 'lucide-react';

export default function WishlistPage() {
  const navigate = useNavigate();
  // Mock wishlist items
  const items = [
    { id: '1', name: 'Scalp Serum', price: 21.95, image: 'https://images.unsplash.com/photo-1601049541289-9b1b7abcfe19?auto=format&fit=crop&q=80&w=2070' },
    { id: '2', name: 'Herbal Conditioner', price: 15.45, image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d00c?auto=format&fit=crop&q=80&w=2070' },
    { id: '3', name: 'Body Lotion', price: 13.95, image: 'https://images.unsplash.com/photo-1552693673-1bf958298935?auto=format&fit=crop&q=80&w=2070' },
    { id: '4', name: 'Aromatherapy Oil', price: 17.95, image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&q=80&w=1974' },
  ];

  return (
    <div className="min-h-screen bg-background pb-32">
      <header className="p-6 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-md z-30">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-surface rounded-full">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-serif font-bold text-cream">Wishlist</h1>
        <div className="w-10" />
      </header>

      <div className="px-6 space-y-4">
        {items.map((item, idx) => (
          <motion.div 
            key={item.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-surface/30 border border-white/5 rounded-[32px] p-4 flex gap-4"
          >
            <div className="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 bg-surface">
              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 flex flex-col justify-between py-1">
              <div className="flex justify-between items-start">
                <h3 className="text-cream font-medium truncate pr-2">{item.name}</h3>
                <button className="text-primary">
                  <Heart className="w-4 h-4 fill-current" />
                </button>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-primary font-bold text-lg">${item.price.toFixed(2)}</p>
                <button 
                  onClick={() => navigate('/cart')}
                  className="bg-primary/20 text-primary px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-primary hover:text-background transition-all"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </motion.div>
        ))}

        {items.length === 0 && (
          <div className="py-20 text-center">
            <Heart className="w-16 h-16 text-cream/10 mx-auto mb-4" />
            <p className="text-cream/40 px-10">Your wishlist is empty. Start saving your favorite botanical products!</p>
          </div>
        )}
      </div>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-xl border-t border-white/5 px-8 py-4 flex items-center justify-between mx-4 mb-4 rounded-[32px] shadow-2xl">
        <NavIcon icon={<Home className="w-6 h-6" />} onClick={() => navigate('/home')} />
        <NavIcon icon={<Grid className="w-6 h-6" />} onClick={() => navigate('/categories')} />
        <NavIcon icon={<Heart className="w-6 h-6" />} active />
        <NavIcon icon={<UserIcon className="w-6 h-6" />} onClick={() => navigate('/profile')} />
      </nav>
    </div>
  );
}

function NavIcon({ icon, active, onClick }: { icon: any, active?: boolean, onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`p-3 rounded-2xl transition-all ${active ? 'bg-primary text-background shadow-lg shadow-primary/20' : 'text-cream/30 hover:text-primary'}`}
    >
      {icon}
    </button>
  );
}
