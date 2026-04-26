import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, ChevronRight, MapPin, CreditCard, ChevronDown, CheckCircle2, ShoppingBag } from 'lucide-react';

type Step = 'shipping' | 'payment' | 'review' | 'success';

export default function CheckoutPage() {
  const [step, setStep] = useState<Step>('shipping');
  const navigate = useNavigate();

  const steps = [
    { id: 'shipping', label: 'Shipping', icon: <MapPin className="w-5 h-5" /> },
    { id: 'payment', label: 'Payment', icon: <CreditCard className="w-5 h-5" /> },
    { id: 'review', label: 'Review', icon: <ShoppingBag className="w-5 h-5" /> },
  ];

  const currentStepIdx = steps.findIndex(s => s.id === step);

  return (
    <div className="min-h-screen bg-background pb-32">
      <header className="p-6 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-md z-30">
        <button onClick={() => step === 'success' ? navigate('/home') : navigate(-1)} className="p-2 hover:bg-surface rounded-full">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-serif font-bold text-cream">Checkout</h1>
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
          {step === 'shipping' && <ShippingForm onNext={() => setStep('payment')} />}
          {step === 'payment' && <PaymentForm onNext={() => setStep('review')} />}
          {step === 'review' && <ReviewOrder onNext={() => setStep('success')} />}
          {step === 'success' && <SuccessView onHome={() => navigate('/home')} />}
        </AnimatePresence>
      </div>
    </div>
  );
}

function ShippingForm({ onNext }: { onNext: () => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-cream">Shipping Address</h2>
        <button className="text-primary text-sm font-bold uppercase tracking-widest">Change</button>
      </div>

      <div className="bg-surface/30 border border-white/5 rounded-[32px] p-6 space-y-2">
        <p className="text-cream font-bold">Priya Sharma</p>
        <p className="text-cream/60 text-sm leading-relaxed">
          123 Green Street, Eco City<br />
          Mumbai, Maharashtra 400001<br />
          India
        </p>
      </div>

      <h2 className="text-xl font-bold text-cream pt-4">Shipping Method</h2>
      <div className="space-y-3">
        <button className="w-full bg-surface/50 border border-primary p-6 rounded-[32px] flex items-center justify-between">
          <div className="flex flex-col items-start">
            <span className="text-cream font-bold">Standard Shipping</span>
            <span className="text-xs text-cream/40">5-7 Business Days</span>
          </div>
          <div className="w-6 h-6 rounded-full border-2 border-primary flex items-center justify-center">
            <div className="w-3 h-3 bg-primary rounded-full" />
          </div>
        </button>
        <button className="w-full bg-surface/20 border border-white/5 p-6 rounded-[32px] flex items-center justify-between">
          <div className="flex flex-col items-start">
            <span className="text-cream font-bold">Express Shipping</span>
            <span className="text-xs text-cream/40">1-2 Business Days</span>
          </div>
          <p className="text-primary font-bold">$4.99</p>
        </button>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background via-background to-transparent">
        <button 
          onClick={onNext}
          className="w-full bg-primary text-background font-bold py-5 rounded-[28px] flex items-center justify-center gap-3 shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          Continue to Payment
        </button>
      </div>
    </motion.div>
  );
}

function PaymentForm({ onNext }: { onNext: () => void }) {
  const [method, setMethod] = useState<'card' | 'upi' | 'paypal'>('card');
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <h2 className="text-xl font-bold text-cream">Payment Method</h2>
      <div className="space-y-3">
        {['card', 'upi', 'paypal'].map((m: any) => (
          <button 
            key={m}
            onClick={() => setMethod(m)}
            className={`w-full p-6 rounded-[32px] flex items-center justify-between border transition-all ${
              method === m ? 'bg-surface/50 border-primary' : 'bg-surface/20 border-white/5'
            }`}
          >
            <span className="text-cream font-bold uppercase tracking-widest">{m === 'card' ? 'Credit / Debit Card' : m}</span>
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${method === m ? 'border-primary' : 'border-white/10'}`}>
              {method === m && <div className="w-3 h-3 bg-primary rounded-full" />}
            </div>
          </button>
        ))}
      </div>

      {method === 'card' && (
        <div className="bg-surface/30 border border-white/5 rounded-[40px] p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-cream/40 px-2">Card Number</label>
            <input type="text" placeholder="1234 5678 9012 3456" className="w-full bg-surface border border-white/5 p-4 rounded-2xl text-cream outline-none focus:border-primary/50 transition-all" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-cream/40 px-2">Expiry</label>
              <input type="text" placeholder="MM/YY" className="w-full bg-surface border border-white/5 p-4 rounded-2xl text-cream outline-none focus:border-primary/50 transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-cream/40 px-2">CVV</label>
              <input type="text" placeholder="123" className="w-full bg-surface border border-white/5 p-4 rounded-2xl text-cream outline-none focus:border-primary/50 transition-all" />
            </div>
          </div>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background via-background to-transparent">
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

function ReviewOrder({ onNext }: { onNext: () => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="bg-primary/5 border border-primary/20 rounded-[40px] p-8 flex flex-col items-center text-center space-y-4">
        <CheckCircle2 className="w-16 h-16 text-primary" />
        <h2 className="text-3xl font-serif font-bold text-cream">Order Review</h2>
        <p className="text-cream/60">One last step before your natural beauty journey begins.</p>
      </div>

      <div className="bg-surface/20 border border-white/5 rounded-[32px] p-8 space-y-4">
        <div className="flex justify-between items-center pb-4 border-b border-white/5">
          <p className="text-cream font-bold">Order Summary</p>
          <span className="text-primary font-bold">3 Items</span>
        </div>
        <div className="flex justify-between text-cream/60">
          <span>Subtotal</span>
          <span className="font-bold text-cream">$58.35</span>
        </div>
        <div className="flex justify-between text-cream/60">
          <span>Shipping</span>
          <span className="font-bold text-primary">Free</span>
        </div>
        <div className="flex justify-between text-cream/60">
          <span>Tax</span>
          <span className="font-bold text-cream">$5.25</span>
        </div>
        <div className="pt-4 border-t border-white/10 flex justify-between items-center">
          <span className="text-xl text-cream">Total</span>
          <span className="text-2xl font-bold text-primary">$63.60</span>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background via-background to-transparent">
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

function SuccessView({ onHome }: { onHome: () => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center text-center pt-20"
    >
      <div className="relative mb-8">
        <div className="w-32 h-32 bg-primary/20 rounded-full flex items-center justify-center animate-pulse">
          <CheckCircle2 className="w-20 h-20 text-primary" />
        </div>
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.3 }}
          className="absolute -top-2 -right-2 bg-cream text-background p-3 rounded-full shadow-xl"
        >
          <ShoppingBag className="w-6 h-6" />
        </motion.div>
      </div>
      
      <h2 className="text-4xl font-serif font-bold text-cream mb-4">Order Placed!</h2>
      <p className="text-cream/60 mb-10 max-w-[280px]">
        Thank you for your order. Your natural beauty journey begins now.
      </p>

      <div className="w-full bg-surface/30 border border-white/5 rounded-[40px] p-8 space-y-6 mb-10">
        <div className="flex justify-between">
          <span className="text-cream/40 font-bold uppercase tracking-widest text-[10px]">Order ID</span>
          <span className="text-primary font-bold tracking-widest">#MOSS5123456</span>
        </div>
        <div className="h-px bg-white/5" />
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-cream/60">3 Items</span>
            <span className="text-cream">$83.85</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-cream/60">Shipping</span>
            <span className="text-primary">Free</span>
          </div>
          <div className="flex justify-between text-lg font-bold">
            <span className="text-cream">Total Paid</span>
            <span className="text-primary">$63.60</span>
          </div>
        </div>
      </div>

      <div className="w-full space-y-4">
        <button 
          onClick={() => {}}
          className="w-full bg-surface border border-white/10 text-cream font-bold py-5 rounded-[28px] hover:bg-surface/80 transition-all"
        >
          Track Order
        </button>
        <button 
          onClick={onHome}
          className="w-full bg-primary text-background font-bold py-5 rounded-[28px] shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all"
        >
          Continue Shopping
        </button>
      </div>
    </motion.div>
  );
}
