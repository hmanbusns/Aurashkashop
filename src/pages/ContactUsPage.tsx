import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Mail, Phone, MapPin, Instagram, Facebook, Twitter, Pin, Home, Grid, Heart, User as UserIcon } from 'lucide-react';

export default function ContactUsPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-32">
      <header className="p-6 flex items-center justify-between sticky top-0 bg-background/90 backdrop-blur-sm z-30 fix-glitch">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-surface rounded-full">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-serif font-bold text-cream">Contact Us</h1>
        <div className="w-10" />
      </header>

      <div className="px-6 space-y-10">
        <div className="space-y-4">
          <h2 className="text-3xl font-serif font-bold text-cream">We'd love to hear from you!</h2>
          <p className="text-cream/60">Have a question or feedback? Reach out to us through any of the channels below.</p>
        </div>

        <div className="space-y-4">
          <ContactItem 
            icon={<Mail className="w-6 h-6" />} 
            label="Email" 
            value="hello@aurashka.com" 
            onClick={() => window.location.href = 'mailto:hello@aurashka.com'}
          />
          <ContactItem 
            icon={<Phone className="w-6 h-6" />} 
            label="Phone" 
            value="+91 98765 43210" 
            onClick={() => window.location.href = 'tel:+919876543210'}
          />
          <ContactItem 
            icon={<MapPin className="w-6 h-6" />} 
            label="Address" 
            value="123 Green Street, Eco City\nMumbai, Maharashtra 400001" 
          />
        </div>

        <div className="space-y-6 pt-10">
           <h3 className="text-xl font-bold text-cream">Follow Us</h3>
           <div className="flex gap-4">
             <SocialLink icon={<Instagram className="w-6 h-6" />} />
             <SocialLink icon={<Facebook className="w-6 h-6" />} />
             <SocialLink icon={<Twitter className="w-6 h-6" />} />
             <SocialLink icon={<Pin className="w-6 h-6" />} />
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

function ContactItem({ icon, label, value, onClick }: { icon: any, label: string, value: string, onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full bg-surface/30 border border-white/5 p-6 rounded-[32px] flex items-start gap-6 text-left transition-all ${onClick ? 'hover:bg-surface/50' : ''}`}
    >
      <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center border border-primary/20 shrink-0">
        {icon}
      </div>
      <div className="flex flex-col py-1">
        <span className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">{label}</span>
        <span className="text-cream font-medium whitespace-pre-wrap">{value}</span>
      </div>
    </button>
  );
}

function SocialLink({ icon }: { icon: any }) {
  return (
    <button className="w-16 h-16 bg-surface/50 border border-white/5 rounded-full flex items-center justify-center text-cream/40 hover:text-primary hover:border-primary/20 transition-all">
      {icon}
    </button>
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
