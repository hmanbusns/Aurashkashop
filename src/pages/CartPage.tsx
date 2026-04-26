import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Trash2, Plus, Minus, ShoppingCart, ChevronRight, Tag } from 'lucide-react';
import { DatabaseService } from '../services/databaseService';
import { auth } from '../lib/firebase';
import { Product } from '../types';
import { formatCurrency } from '../lib/format';

interface CartItem extends Product {
  cartId: string;
  quantity: number;
  size: string;
}

export default function CartPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const user = auth.currentUser;
      if (!user) {
        navigate('/login');
        return;
      }
      const cartData = await DatabaseService.getCart(user.uid);
      if (cartData.length > 0) {
        const allProducts = await DatabaseService.getProducts();
        const cartItems = cartData.map(c => {
          const product = allProducts.find(p => p.id === c.productId);
          return product ? { ...product, ...c } : null;
        }).filter(Boolean) as CartItem[];
        setItems(cartItems);
      } else {
        setItems([]);
      }
      setLoading(false);
    }
    load();
  }, []);

  const updateQuantity = async (cartId: string, delta: number) => {
    const user = auth.currentUser;
    if (user) {
      await DatabaseService.updateCartItemQuantity(user.uid, cartId, delta);
      setItems(items.map(item => item.cartId === cartId ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item));
    }
  };

  const removeItem = async (cartId: string) => {
    const user = auth.currentUser;
    if (user) {
      await DatabaseService.removeFromCart(user.uid, cartId);
      setItems(items.filter(item => item.cartId !== cartId));
    }
  };

  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shipping = 0;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

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
        <h1 className="text-xl font-serif font-bold text-cream">My Cart</h1>
        <div className="relative">
          <ShoppingCart className="w-6 h-6 text-primary" />
          {items.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-primary text-background text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-background">
              {items.length}
            </span>
          )}
        </div>
      </header>

      <div className="px-6 space-y-4">
        <AnimatePresence>
          {items.map((item) => (
            <motion.div 
              key={item.cartId}
              initial={{ opacity: 1 }}
              exit={{ opacity: 0, x: -100 }}
              className="bg-surface/30 border border-white/5 rounded-2xl p-3 flex gap-3 overflow-hidden"
            >
              <div 
                className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-surface cursor-pointer"
                onClick={() => navigate(`/product/${item.id}`)}
              >
                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 flex flex-col justify-between py-0.5">
                <div>
                  <div className="flex justify-between items-start">
                    <h3 
                      className="text-cream text-sm font-medium truncate pr-2 cursor-pointer"
                      onClick={() => navigate(`/product/${item.id}`)}
                    >
                      {item.name}
                    </h3>
                    <button onClick={() => removeItem(item.cartId)} className="text-cream/20 hover:text-red-400">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-[10px] text-cream/30 uppercase tracking-widest">{item.size}</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-primary font-bold text-base">{formatCurrency(item.price)}</p>
                  <div className="flex items-center gap-2 bg-surface p-1 rounded-lg">
                    <button onClick={() => updateQuantity(item.cartId, -1)} className="p-1 hover:bg-white/5 rounded-md text-primary"><Minus className="w-3 h-3" /></button>
                    <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.cartId, 1)} className="p-1 hover:bg-white/5 rounded-md text-primary"><Plus className="w-3 h-3" /></button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {items.length === 0 && (
          <div className="py-20 text-center">
            <ShoppingCart className="w-16 h-16 text-cream/10 mx-auto mb-4" />
            <p className="text-cream/40 px-10">Your cart is empty. Explore our products and find something you love!</p>
            <button onClick={() => navigate('/home')} className="mt-8 px-8 py-3 bg-primary text-background font-bold rounded-full">Go Shopping</button>
          </div>
        )}
      </div>

      {items.length > 0 && (
        <div className="mt-10 px-6 space-y-6">
          <div className="relative group">
            <input 
              type="text" 
              placeholder="Apply Coupon" 
              className="w-full pl-6 pr-24 py-4 bg-surface/50 border border-white/5 rounded-[20px] focus:border-primary/50 transition-all outline-none text-cream"
            />
            <button className="absolute right-2 top-2 bottom-2 px-6 bg-primary text-background font-bold rounded-xl text-xs hover:scale-105 transition-transform uppercase tracking-widest">Apply</button>
          </div>

          <div className="bg-surface/20 border border-white/5 rounded-[32px] p-8 space-y-4">
            <div className="flex justify-between text-cream/60">
              <span>Subtotal</span>
              <span className="font-bold text-cream">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-cream/60">
              <span>Shipping</span>
              <span className="font-bold text-primary">Free</span>
            </div>
            <div className="flex justify-between text-cream/60">
              <span>Tax</span>
              <span className="font-bold text-cream">{formatCurrency(tax)}</span>
            </div>
            <div className="pt-4 border-t border-white/10 flex justify-between items-center">
              <span className="text-xl text-cream">Total</span>
              <span className="text-2xl font-bold text-primary">{formatCurrency(total)}</span>
            </div>
          </div>
        </div>
      )}

      {items.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background via-background to-transparent z-40">
          <button 
            onClick={() => navigate('/checkout')}
            className="w-full bg-primary text-background font-bold py-5 rounded-[28px] flex items-center justify-center gap-3 shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            Checkout
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      )}
    </div>
  );
}
