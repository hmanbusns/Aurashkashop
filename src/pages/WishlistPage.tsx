import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Trash2, Heart, ShoppingBag, Plus, Home, Grid, User as UserIcon, ShoppingCart } from 'lucide-react';
import { DatabaseService } from '../services/databaseService';
import { auth } from '../lib/firebase';
import { Product } from '../types';
import { formatCurrency } from '../lib/format';

export default function WishlistPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    async function load() {
      const user = auth.currentUser;
      if (!user) {
        setLoading(false);
        return;
      }
      const [wishlistIds, cartItems] = await Promise.all([
        DatabaseService.getWishlist(user.uid),
        DatabaseService.getCart(user.uid)
      ]);

      const cartTotal = cartItems.reduce((acc, item) => acc + item.quantity, 0);
      setCartCount(cartTotal);

      if (wishlistIds.length > 0) {
        const allProducts = await DatabaseService.getProducts();
        const wishlisted = allProducts.filter(p => wishlistIds.includes(p.id));
        setItems(wishlisted);
      } else {
        setItems([]);
      }
      setLoading(false);
    }
    load();
  }, []);

  const removeItem = async (productId: string) => {
    const user = auth.currentUser;
    if (user) {
      await DatabaseService.toggleWishlist(user.uid, productId);
      setItems(prev => prev.filter(item => item.id !== productId));
    }
  };

  const handleAddToCart = async (product: Product) => {
    const user = auth.currentUser;
    if (!user) {
      navigate('/login');
      return;
    }
    const sizes = product.size?.split(',').map(s => s.trim()) || ['Standard'];
    await DatabaseService.addToCart(user.uid, product.id, 1, sizes[0]);
    navigate('/cart');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      <header className="p-6 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-md z-30">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-surface rounded-full">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-serif font-bold text-cream">Wishlist</h1>
        <button 
          onClick={() => navigate('/cart')}
          className="p-2 hover:bg-surface rounded-full relative"
        >
          <ShoppingCart className="w-6 h-6 text-primary" />
          {cartCount > 0 && (
            <span className="absolute top-0 right-0 bg-primary text-background text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border-2 border-background">
              {cartCount}
            </span>
          )}
        </button>
      </header>

      <div className="px-6 space-y-4">
        {!auth.currentUser ? (
          <div className="py-20 text-center">
            <Heart className="w-16 h-16 text-cream/10 mx-auto mb-4" />
            <p className="text-cream/40 px-10 mb-8">Sign in to save and view your favorite items!</p>
            <button onClick={() => navigate('/login')} className="px-8 py-3 bg-primary text-background font-bold rounded-full">Sign In</button>
          </div>
        ) : (
          items.map((item, idx) => (
            <motion.div 
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-surface/30 border border-white/5 rounded-2xl p-3 flex gap-3"
            >
              <div 
                className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-surface cursor-pointer"
                onClick={() => navigate(`/product/${item.id}`)}
              >
                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 flex flex-col justify-between py-0.5">
                <div className="flex justify-between items-start">
                  <h3 
                    className="text-cream text-sm font-medium truncate pr-2 cursor-pointer"
                    onClick={() => navigate(`/product/${item.id}`)}
                  >
                    {item.name}
                  </h3>
                  <button 
                    onClick={() => removeItem(item.id)}
                    className="text-primary hover:text-red-500 transition-colors"
                  >
                    <Heart className="w-3.5 h-3.5 fill-current" />
                  </button>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-primary font-bold text-base">{formatCurrency(item.price)}</p>
                  <button 
                    onClick={() => handleAddToCart(item)}
                    className="bg-primary/20 text-primary px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-primary hover:text-background transition-all"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}

        {auth.currentUser && items.length === 0 && (
          <div className="py-20 text-center">
            <Heart className="w-16 h-16 text-cream/10 mx-auto mb-4" />
            <p className="text-cream/40 px-10">Your wishlist is empty. Start saving your favorite botanical products!</p>
          </div>
        )}
      </div>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-xl border-t border-white/5 px-6 py-1.5 flex items-center justify-between mx-4 mb-2 rounded-[24px] shadow-2xl">
        <NavIcon icon={<Home className="w-5 h-5" />} onClick={() => navigate('/home')} />
        <NavIcon icon={<Grid className="w-5 h-5" />} onClick={() => navigate('/categories')} />
        <NavIcon icon={<Heart className="w-5 h-5" />} active />
        <NavIcon icon={<UserIcon className="w-5 h-5" />} onClick={() => navigate('/profile')} />
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
