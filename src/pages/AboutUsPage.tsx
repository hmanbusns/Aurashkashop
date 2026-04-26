import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Leaf, Shield, Globe, Home, Grid, Heart, User as UserIcon } from 'lucide-react';

export default function AboutUsPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-32">
      <header className="p-6 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-md z-30">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-surface rounded-full">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-serif font-bold text-cream">About Us</h1>
        <div className="w-10" />
      </header>

      <div className="px-6 space-y-10">
        <div className="relative h-[40vh] rounded-[48px] overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=2070" 
            alt="nature" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent flex items-end p-8">
             <h2 className="text-3xl font-serif font-bold text-cream">Rooted in nature. Committed to you.</h2>
          </div>
        </div>

        <div className="space-y-6">
          <p className="text-cream/60 leading-relaxed text-lg">
            At <span className="text-primary font-bold">Aurashka</span>, we believe in the power of nature. Our products are crafted with love, using the finest botanical ingredients for your natural beauty and well-being.
          </p>
          <p className="text-cream/60 leading-relaxed">
            Founded on the principle of purity, we source our ingredients sustainably from local farmers who share our passion for high-quality, organic harvesting. Every drop of our oil and every grain of our scrub is a testament to the gifts the earth provides.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <ValueCard icon={<Leaf className="w-6 h-6" />} label="100% Natural Ingredients" />
          <ValueCard icon={<Globe className="w-6 h-6" />} label="Sustainable Packaging" />
          <ValueCard icon={<Shield className="w-6 h-6" />} label="Cruelty Free Always" />
        </div>

        <div className="bg-surface/30 border border-white/5 rounded-[40px] p-8 space-y-4">
           <h3 className="text-xl font-bold text-cream">Our Mission</h3>
           <p className="text-cream/60 leading-relaxed">
             To provide luxury botanical care that respects both your skin and the environment. We strive for zero waste and maximum impact in your daily self-care ritual.
           </p>
        </div>
      </div>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-xl border-t border-white/5 px-8 py-4 flex items-center justify-between mx-4 mb-4 rounded-[32px] shadow-2xl">
        <NavIcon icon={<Home className="w-6 h-6" />} onClick={() => navigate('/home')} />
        <NavIcon icon={<Grid className="w-6 h-6" />} onClick={() => navigate('/categories')} />
        <NavIcon icon={<Heart className="w-6 h-6" />} onClick={() => navigate('/wishlist')} />
        <NavIcon icon={<UserIcon className="w-6 h-6" />} onClick={() => navigate('/profile')} />
      </nav>
    </div>
  );
}

function ValueCard({ icon, label }: { icon: any, label: string }) {
  return (
    <div className="flex flex-col items-center text-center gap-3">
      <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center border border-primary/20">
        {icon}
      </div>
      <span className="text-[10px] font-bold uppercase tracking-widest text-cream/40 px-1">{label}</span>
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
