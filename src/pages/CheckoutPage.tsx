import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, ChevronRight, MapPin, CreditCard, ChevronDown, CheckCircle2, ShoppingBag, Edit2, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../lib/format';
import { UserProfile, Address, CartItem } from '../types';
import { DatabaseService } from '../services/databaseService';
import { LocationPicker } from '../components/LocationPicker';

type Step = 'shipping' | 'payment' | 'review' | 'success';

export default function CheckoutPage({ user }: { user: UserProfile | null }) {
  const [step, setStep] = useState<Step>('shipping');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      DatabaseService.getCart(user.uid).then(setCartItems);
    }
  }, [user]);

  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const tax = subtotal * 0.18;
  const total = subtotal + tax;

  const steps = [
    { id: 'shipping', label: 'Shipping', icon: <MapPin className="w-5 h-5" /> },
    { id: 'payment', label: 'Payment', icon: <CreditCard className="w-5 h-5" /> },
    { id: 'review', label: 'Review', icon: <ShoppingBag className="w-5 h-5" /> },
  ];

  const currentStepIdx = steps.findIndex(s => s.id === step);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background pb-32">
      <header className="p-6 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-md z-30">
        <button onClick={() => step === 'success' ? navigate('/home') : navigate(-1)} className="p-2 hover:bg-surface rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <span className="text-xl font-serif font-bold text-cream">Checkout</span>
        <div className="w-10" />
      </header>

      {step !== 'success' && (
        <div className="px-6 mb-10">
          <div className="flex justify-between relative">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/5 -translate-y-1/2 -z-10" />
            <div 
              className="absolute top-1/2 left-0 h-0.5 bg-primary transition-all duration-500 -translate-y-1/2 -z-10" 
              style={{ width: `${(currentStepIdx / (steps.length - 1)) * 100}%` }}
            />
            {steps.map((s, idx) => (
              <div key={s.id} className="flex flex-col items-center gap-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${
                  currentStepIdx >= idx ? 'bg-primary text-background' : 'bg-surface text-cream/20'
                }`}>
                  <span className="text-xs font-bold">{idx + 1}</span>
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-widest ${
                  currentStepIdx >= idx ? 'text-primary' : 'text-cream/20'
                }`}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="px-6">
        <AnimatePresence mode="wait">
          {step === 'shipping' && (
            <ShippingForm 
              user={user} 
              onNext={() => setStep('payment')} 
              onChangeAddress={() => setShowLocationPicker(true)} 
            />
          )}
          {step === 'payment' && <PaymentForm onNext={() => setStep('review')} />}
          {step === 'review' && <ReviewOrder user={user} total={total} subtotal={subtotal} tax={tax} count={cartItems.length} onNext={() => setStep('success')} />}
          {step === 'success' && <SuccessView total={total} count={cartItems.length} onHome={() => navigate('/home')} />}
        </AnimatePresence>
      </div>

      <LocationPicker 
        isOpen={showLocationPicker} 
        user={user} 
        onClose={() => setShowLocationPicker(false)}
        onSuccess={() => {}} // User sync handled via App context
      />
    </div>
  );
}

function ShippingForm({ user, onNext, onChangeAddress }: { user: UserProfile, onNext: () => void, onChangeAddress: () => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-cream">Shipping Address</h2>
        {user.address && (
          <button onClick={onChangeAddress} className="text-primary text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 p-2 bg-primary/5 rounded-xl border border-primary/20">
            <Edit2 className="w-3 h-3" /> Change
          </button>
        )}
      </div>

      {user.address ? (
        <div className="bg-surface/30 border border-white/5 rounded-[32px] p-6 space-y-2 relative group shadow-xl">
           <div className="p-3 bg-primary/10 rounded-2xl w-fit mb-2 text-primary">
              <MapPin className="w-4 h-4" />
           </div>
           <p className="text-cream font-bold">{user.address.fullName}</p>
           <p className="text-cream/50 text-xs leading-relaxed max-w-[240px]">
             {user.address.street}, {user.address.city}<br />
             {user.address.district}, {user.address.state} - {user.address.pincode}
           </p>
           <p className="text-[10px] text-primary font-bold mt-2 tracking-tight">{user.address.phone}</p>
        </div>
      ) : (
        <div className="bg-surface/30 border border-dashed border-white/10 rounded-[32px] p-10 flex flex-col items-center text-center space-y-4">
           <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center">
              <MapPin className="w-8 h-8 text-cream/10" />
           </div>
           <div className="space-y-1">
             <p className="text-cream font-bold">No Address Selected</p>
             <p className="text-cream/30 text-[10px]">Please add a shipping address to continue</p>
           </div>
           <button onClick={onChangeAddress} className="px-6 py-2.5 bg-primary text-background text-[10px] font-bold uppercase tracking-widest rounded-xl shadow-lg shadow-primary/10">Add Address</button>
        </div>
      )}

      <h2 className="text-xl font-bold text-cream pt-4">Shipping Method</h2>
      <div className="space-y-3">
        <div className="w-full bg-surface/50 border border-primary p-6 rounded-[32px] flex items-center justify-between shadow-lg shadow-primary/5">
          <div className="flex flex-col items-start leading-tight">
            <span className="text-cream font-bold">Standard Shipping</span>
            <span className="text-xs text-cream/40 mt-1">5-7 Business Days</span>
          </div>
          <div className="w-6 h-6 rounded-full border-2 border-primary flex items-center justify-center">
            <div className="w-3 h-3 bg-primary rounded-full" />
          </div>
        </div>
        <div 
          className="w-full bg-surface/20 border border-white/5 p-6 rounded-[32px] flex items-center justify-between opacity-50 cursor-not-allowed"
        >
          <div className="flex flex-col items-start leading-tight">
            <span className="text-cream font-bold">Express Shipping</span>
            <span className="text-xs text-cream/40 mt-1">1-2 Business Days</span>
          </div>
          <div className="text-right">
            <p className="text-primary font-bold">{formatCurrency(299)}</p>
            <p className="text-[8px] text-cream/20 uppercase font-bold tracking-widest mt-1">Coming Soon</p>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background via-background/90 to-transparent pt-12">
        <button 
          onClick={onNext}
          disabled={!user.address}
          className="w-full bg-primary text-background font-bold py-5 rounded-[28px] flex items-center justify-center gap-3 shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale disabled:scale-100"
        >
          Continue to Payment
        </button>
      </div>
    </motion.div>
  );
}

function PaymentForm({ onNext }: { onNext: () => void }) {
  const [method, setMethod] = useState<'card' | 'upi' | 'paypal' | 'cod'>('cod');
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <h2 className="text-xl font-bold text-cream">Payment Method</h2>
      <div className="space-y-3">
        {[
          { id: 'cod', label: 'Cash on Delivery', description: 'Pay when you receive' },
          { id: 'card', label: 'Credit / Debit Card', description: 'Secure payment' },
          { id: 'upi', label: 'UPI Payment', description: 'GPay, PhonePe, Paytm' }
        ].map((m: any) => (
          <button 
            key={m.id}
            onClick={() => setMethod(m.id)}
            className={`w-full p-6 h-28 rounded-[32px] flex items-center justify-between border transition-all ${
              method === m.id ? 'bg-primary/5 border-primary shadow-lg shadow-primary/5' : 'bg-surface/20 border-white/5'
            }`}
          >
            <div className="text-left">
              <span className={`text-sm font-bold uppercase tracking-widest block mb-1 ${method === m.id ? 'text-primary' : 'text-cream'}`}>{m.label}</span>
              <span className="text-[10px] text-cream/40">{m.description}</span>
            </div>
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${method === m.id ? 'border-primary' : 'border-white/10'}`}>
              {method === m.id && <div className="w-3 h-3 bg-primary rounded-full transition-all" />}
            </div>
          </button>
        ))}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background via-background/90 to-transparent pt-12">
        <button 
          onClick={onNext}
          className="w-full bg-primary text-background font-bold py-5 rounded-[28px] flex items-center justify-center gap-3 shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          Continue to Review
        </button>
      </div>
    </motion.div>
  );
}

function ReviewOrder({ user, total, subtotal, tax, count, onNext }: { user: UserProfile, total: number, subtotal: number, tax: number, count: number, onNext: () => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="bg-primary/5 border border-primary/20 rounded-[40px] p-8 flex flex-col items-center text-center space-y-4">
        <div className="p-4 bg-primary rounded-[24px] text-background shadow-xl shadow-primary/20">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-serif font-bold text-cream">Order Review</h2>
        <p className="text-cream/40 text-xs">One last step before your natural beauty journey begins.</p>
      </div>

      <div className="bg-surface/20 border border-white/5 rounded-[32px] p-8 space-y-4">
        <div className="flex justify-between items-center pb-4 border-b border-white/5">
          <p className="text-cream font-bold">Price Details</p>
          <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-widest">{count} Products</span>
        </div>
        <div className="flex justify-between text-[11px] uppercase tracking-widest font-bold text-cream/40">
          <span>Subtotal</span>
          <span className="text-cream">{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between text-[11px] uppercase tracking-widest font-bold text-cream/40">
          <span>Shipping</span>
          <span className="text-primary">FREE</span>
        </div>
        <div className="flex justify-between text-[11px] uppercase tracking-widest font-bold text-cream/40">
          <span>Tax (GST 18%)</span>
          <span className="text-cream">{formatCurrency(tax)}</span>
        </div>
        <div className="pt-4 border-t border-white/10 flex justify-between items-center">
          <span className="text-xl text-cream font-serif font-bold italic">Total</span>
          <div className="text-right">
             <span className="text-2xl font-bold text-primary">{formatCurrency(total)}</span>
             <p className="text-[8px] text-cream/20 uppercase tracking-widest font-bold">Inclusive of all taxes</p>
          </div>
        </div>
      </div>

      <div className="bg-surface/30 border border-white/5 rounded-[32px] p-6">
         <div className="flex items-center gap-2 mb-3 text-cream/40">
            <MapPin className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Delivering to</span>
         </div>
         <p className="text-cream text-xs font-medium leading-relaxed">
            {user.address?.fullName}, {user.address?.street}, {user.address?.city} - {user.address?.pincode}
         </p>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background via-background/90 to-transparent pt-12">
        <button 
          onClick={onNext}
          className="w-full bg-primary text-background font-bold py-5 rounded-[28px] flex items-center justify-center gap-3 shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          Place Order
        </button>
      </div>
    </motion.div>
  );
}

function SuccessView({ total, count, onHome }: { total: number, count: number, onHome: () => void }) {
  const orderId = Math.random().toString(36).substring(2, 9).toUpperCase();
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center text-center pt-10"
    >
      <div className="relative mb-8">
        <div className="w-28 h-28 bg-primary/20 rounded-full flex items-center justify-center">
          <CheckCircle2 className="w-16 h-16 text-primary" />
        </div>
        <motion.div 
          initial={{ scale: 0, rotate: -45 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', delay: 0.5 }}
          className="absolute -top-1 -right-1 bg-cream text-background p-3 rounded-[18px] shadow-2xl"
        >
          <ShoppingBag className="w-5 h-5" />
        </motion.div>
      </div>
      
      <h2 className="text-3xl font-serif font-bold text-cream mb-2">Order Successful!</h2>
      <p className="text-cream/40 mb-10 max-w-[280px] text-xs">
        Your order has been placed successfully. Thank you for choosing Aurashka.
      </p>

      <div className="w-full bg-surface/30 border border-white/5 rounded-[40px] p-8 space-y-6 mb-8 shadow-2xl">
        <div className="flex justify-between items-center">
          <span className="text-cream/40 font-bold uppercase tracking-widest text-[9px]">Order ID</span>
          <span className="text-primary font-bold tracking-widest text-sm">#AUR-{orderId}</span>
        </div>
        <div className="h-px bg-white/5" />
        <div className="space-y-4">
          <div className="flex justify-between text-xs">
            <span className="text-cream/60">{count} Products</span>
            <span className="text-cream font-bold">{formatCurrency(total)}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-cream/60">Delivery</span>
            <span className="text-primary font-bold uppercase text-[10px] tracking-widest">Free</span>
          </div>
          <div className="pt-2 border-t border-white/5 flex justify-between items-center">
            <span className="text-cream font-bold">Total Paid</span>
            <span className="text-xl font-bold text-primary">{formatCurrency(total)}</span>
          </div>
        </div>
      </div>

      <div className="w-full space-y-4">
        <button 
          onClick={onHome}
          className="w-full bg-primary text-background font-bold py-5 rounded-[28px] shadow-2xl shadow-primary/20 hover:shadow-primary/30 transition-all text-sm uppercase tracking-widest"
        >
          Continue Shopping
        </button>
        <button 
          onClick={() => {}}
          className="w-full bg-surface/50 border border-white/10 text-cream/40 font-bold py-5 rounded-[28px] hover:text-cream transition-all text-xs uppercase tracking-widest"
        >
          Track My Order
        </button>
      </div>
    </motion.div>
  );
}

