import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, CheckCircle2, Circle, Truck, Package, Clock, Home, Grid, Heart, User as UserIcon } from 'lucide-react';

export default function OrderTrackingPage() {
  const navigate = useNavigate();

  const statuses = [
    { label: 'Order Placed', time: 'May 20, 2024 10:30 AM', icon: <Clock className="w-5 h-5" />, status: 'completed' },
    { label: 'Order Confirmed', time: 'May 20, 2024 11:00 AM', icon: <Package className="w-5 h-5" />, status: 'completed' },
    { label: 'Shipped', time: 'May 21, 2024 09:15 AM', icon: <Truck className="w-5 h-5" />, status: 'completed' },
    { label: 'Out for Delivery', time: 'May 22, 2024 08:00 AM', icon: <Package className="w-5 h-5" />, status: 'active' },
    { label: 'Delivered', time: 'Expected May 22, 2024', icon: <CheckCircle2 className="w-5 h-5" />, status: 'upcoming' },
  ];

  return (
    <div className="min-h-screen bg-background pb-32">
      <header className="p-6 flex items-center justify-between sticky top-0 bg-background/90 backdrop-blur-sm z-30 fix-glitch">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-surface rounded-full">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-serif font-bold text-cream">Order Tracking</h1>
        <div className="w-10" />
      </header>

      <div className="px-6 space-y-6">
        <div className="bg-surface/30 border border-white/5 rounded-[40px] p-8">
          <p className="text-[10px] font-bold uppercase tracking-widest text-cream/40 mb-2">Order ID</p>
          <h2 className="text-2xl font-bold text-cream">#MOSS5123456</h2>
        </div>

        <div className="bg-surface/20 border border-white/5 rounded-[40px] p-8 relative overflow-hidden">
          <div className="absolute top-[3.5rem] bottom-12 left-[3.5rem] w-0.5 bg-white/5" />
          
          <div className="space-y-12">
            {statuses.map((s, idx) => (
              <div key={idx} className="flex gap-6 relative">
                <div className={`relative z-10 w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                  s.status === 'completed' ? 'bg-primary text-background' : 
                  s.status === 'active' ? 'bg-primary/20 text-primary border border-primary/50' : 
                  'bg-surface text-cream/20'
                }`}>
                  {s.icon}
                </div>
                {s.status === 'completed' && (
                  <div className="absolute top-12 left-6 w-0.5 h-12 bg-primary -z-10" />
                )}
                <div className="flex flex-col py-1">
                  <h3 className={`font-bold ${s.status === 'upcoming' ? 'text-cream/20' : 'text-cream'}`}>{s.label}</h3>
                  <p className="text-xs text-cream/40">{s.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-primary/10 border border-primary/20 rounded-[40px] p-8 flex items-center gap-6">
           <div className="w-16 h-16 rounded-2xl overflow-hidden bg-surface">
              <img src="https://images.unsplash.com/photo-1526947425960-945c6e72858f?auto=format&fit=crop&q=80&w=2070" className="w-full h-full object-cover" />
           </div>
           <div>
              <p className="text-xs text-primary font-bold uppercase tracking-widest">In Transit</p>
              <h4 className="text-cream font-bold">Botanical Hair Spray</h4>
              <p className="text-xs text-cream/40">Expected today by 8:00 PM</p>
           </div>
        </div>
      </div>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-background/90 backdrop-blur-md border-t border-white/5 px-8 py-4 flex items-center justify-between mx-4 mb-4 rounded-[32px] shadow-2xl fix-glitch">
        <NavIcon icon={<Home className="w-6 h-6" />} onClick={() => navigate('/home')} />
        <NavIcon icon={<Grid className="w-6 h-6" />} onClick={() => navigate('/categories')} />
        <NavIcon icon={<Heart className="w-6 h-6" />} onClick={() => navigate('/wishlist')} />
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
