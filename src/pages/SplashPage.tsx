import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Leaf } from 'lucide-react';

export default function SplashPage() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-between py-12 px-6 overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center transition-transform duration-1000 scale-105"
        style={{ 
          backgroundImage: 'url("https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=2070")',
          filter: 'brightness(0.4)'
        }}
      />
      <div className="absolute inset-0 z-0 aurashka-gradient" />

      {/* Content */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 flex flex-col items-center text-center mt-20"
      >
        <div className="bg-primary/20 p-4 rounded-full mb-6">
          <Leaf className="w-12 h-12 text-primary" />
        </div>
        <h1 className="text-5xl font-serif tracking-widest text-primary mb-4 uppercase">
          Aurashka
        </h1>
        <p className="text-cream/80 text-lg max-w-xs font-light leading-relaxed">
          Rooted in Nature,<br />Crafted for You
        </p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="relative z-10 w-full max-w-sm space-y-4"
      >
        <button 
          id="get-started-btn"
          onClick={() => navigate('/login')}
          className="w-full py-4 bg-primary text-background font-semibold rounded-full hover:bg-secondary transition-colors duration-300 shadow-lg shadow-primary/20"
        >
          Get Started
        </button>
        <button 
          id="explore-collection-btn"
          onClick={() => navigate('/login')}
          className="w-full py-4 bg-transparent text-cream/90 font-medium rounded-full hover:bg-white/5 transition-colors duration-300"
        >
          Explore our Collection
        </button>
        
        {/* Pagination Dots Indicator (Visual Only) */}
        <div className="flex justify-center gap-2 pt-8">
          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
          <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
          <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
        </div>
      </motion.div>
    </div>
  );
}
