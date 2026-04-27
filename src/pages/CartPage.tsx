import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Trash2, Plus, Minus, ShoppingCart, ChevronRight, Tag } from 'lucide-react';
import { DatabaseService } from '../services/databaseService';
import { auth } from '../lib/firebase';
import { Product, GlobalProductSettings } from '../types';
import { formatCurrency } from '../lib/format';

interface CartItem extends Product {
  cartId: string;
  quantity: number;
  size: string;
}

export default function CartPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<CartItem[]>([]);
  const [globalSettings, setGlobalSettings] = useState<GlobalProductSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const user = auth.currentUser;
      const settings = await DatabaseService.getGlobalSettings();
      setGlobalSettings(settings);

      if (!user) {
        setLoading(false);
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

  // Calculations
  const calculatedData = items.reduce((acc, item) => {
    const discount = item.discountPercentage ?? globalSettings?.defaultDiscountPercentage ?? 0;
    const itemPrice = item.price * (1 - discount / 100);
    const itemSubtotal = itemPrice * item.quantity;
    
    const taxRate = item.taxRate ?? globalSettings?.defaultTaxRate ?? 0;
    const itemTax = itemSubtotal * (taxRate / 100);
    
    const shipping = item.shippingCharge ?? globalSettings?.defaultShippingCharge ?? 0;
    
    return {
      subtotal: acc.subtotal + itemSubtotal,
      tax: acc.tax + itemTax,
      shipping: acc.shipping + shipping,
    };
  }, { subtotal: 0, tax: 0, shipping: 0 });

  const { subtotal, tax, shipping } = calculatedData;
  const total = subtotal + shipping + tax;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="p-3 flex items-center justify-between sticky top-0 bg-background/90 backdrop-blur-sm z-30 fix-glitch">
        <button onClick={() => navigate(-1)} className="p-1.5 hover:bg-surface rounded-full">
          <ArrowLeft className="w-5 h-5 font-bold" />
        </button>
        <h1 className="text-lg font-serif font-bold text-cream">My Cart</h1>
        <div className="relative">
          <ShoppingCart className="w-5 h-5 text-primary" />
          {items.length > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-primary text-background text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full border-2 border-background">
              {items.length}
            </span>
          )}
        </div>
      </header>

      <div className="px-4 space-y-3">
        <AnimatePresence>
          {items.map((item) => (
            <motion.div 
              key={item.cartId}
              initial={{ opacity: 1 }}
              exit={{ opacity: 0, x: -100 }}
              className="bg-surface/30 border border-white/5 rounded-2xl p-2.5 flex gap-3 overflow-hidden"
            >
              <div 
                className="w-16 h-16 overflow-hidden flex-shrink-0 bg-surface cursor-pointer"
                style={{ borderRadius: `${Math.min((item.imageCurve ?? 24) / 2, 32)}px` }}
                onClick={() => navigate(`/product/${item.id}`)}
              >
                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 flex flex-col justify-between py-0.5">
                <div>
                  <div className="flex justify-between items-start">
                    <h3 
                      className="text-cream text-xs font-medium truncate pr-2 cursor-pointer"
                      onClick={() => navigate(`/product/${item.id}`)}
                    >
                      {item.name}
                    </h3>
                    <button onClick={() => removeItem(item.cartId)} className="text-cream/20 hover:text-red-400">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                  <p className="text-[8px] text-cream/30 uppercase tracking-widest">{item.size}</p>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex flex-col">
                    {(() => {
                      const discount = item.discountPercentage ?? globalSettings?.defaultDiscountPercentage ?? 0;
                      const hasDiscount = discount > 0;
                      const finalPrice = hasDiscount ? item.price * (1 - discount / 100) : item.price;
                      return (
                        <>
                          <p className="text-primary font-bold text-sm">{formatCurrency(finalPrice)}</p>
                          {hasDiscount && (
                            <p className="text-[9px] text-cream/30 line-through">{formatCurrency(item.price)}</p>
                          )}
                        </>
                      );
                    })()}
                  </div>
                  <div className="flex items-center gap-1.5 bg-surface p-0.5 rounded-lg">
                    <button onClick={() => updateQuantity(item.cartId, -1)} className="p-1 hover:bg-white/5 rounded-md text-primary"><Minus className="w-2.5 h-2.5" /></button>
                    <span className="text-[10px] font-bold w-3 text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.cartId, 1)} className="p-1 hover:bg-white/5 rounded-md text-primary"><Plus className="w-2.5 h-2.5" /></button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {!auth.currentUser ? (
          <div className="py-16 text-center">
            <ShoppingCart className="w-12 h-12 text-cream/10 mx-auto mb-3" />
            <p className="text-cream/40 px-10 mb-6 text-sm">Login to view your items!</p>
            <button onClick={() => navigate('/login')} className="px-6 py-2.5 bg-primary text-background font-bold rounded-full text-xs">Sign In</button>
          </div>
        ) : items.length === 0 && (
          <div className="py-16 text-center">
            <ShoppingCart className="w-12 h-12 text-cream/10 mx-auto mb-3" />
            <p className="text-cream/40 px-10 text-sm">Your cart is empty.</p>
            <button onClick={() => navigate('/home')} className="mt-6 px-6 py-2.5 bg-primary text-background font-bold rounded-full text-xs">Go Shopping</button>
          </div>
        )}
      </div>

      {items.length > 0 && (
        <div className="mt-8 px-4 space-y-4 pb-24">
          <div className="relative group">
            <input 
              type="text" 
              placeholder="Apply Coupon" 
              className="w-full pl-5 pr-20 py-3 bg-surface/50 border border-white/5 rounded-xl focus:border-primary/50 transition-all outline-none text-cream text-xs"
            />
            <button className="absolute right-1.5 top-1.5 bottom-1.5 px-4 bg-primary text-background font-bold rounded-lg text-[10px] hover:scale-105 transition-transform uppercase tracking-widest">Apply</button>
          </div>

          <div className="bg-surface/20 border border-white/5 rounded-[24px] p-6 space-y-3">
            <div className="flex justify-between text-cream/60 text-sm">
              <span>Subtotal</span>
              <span className="font-bold text-cream">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-cream/60 text-sm">
              <span>Shipping</span>
              <span className={shipping === 0 ? 'font-bold text-primary' : 'font-bold text-cream'}>
                {shipping === 0 ? 'Free' : formatCurrency(shipping)}
              </span>
            </div>
            <div className="flex justify-between text-cream/60 text-sm">
              <span>Tax</span>
              <span className="font-bold text-cream">{formatCurrency(tax)}</span>
            </div>
            <div className="pt-3 border-t border-white/10 flex justify-between items-center">
              <span className="text-lg text-cream">Total</span>
              <span className="text-xl font-bold text-primary">{formatCurrency(total)}</span>
            </div>
          </div>
        </div>
      )}

      {items.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent z-40">
          <button 
            onClick={() => navigate('/checkout')}
            className="w-full bg-primary text-background font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all text-sm"
          >
            Checkout
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}
