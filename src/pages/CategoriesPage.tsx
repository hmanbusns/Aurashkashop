import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Search, Heart, Home, Grid, User as UserIcon } from 'lucide-react';
import { Category, Product } from '../types';
import { DatabaseService } from '../services/databaseService';

export default function CategoriesPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [catData, prodData] = await Promise.all([
        DatabaseService.getCategories(),
        DatabaseService.getProducts()
      ]);
      setCategories(catData);
      setProducts(prodData);
      setLoading(false);
    }
    load();
  }, []);

  const getProductCount = (categoryName: string) => {
    return products.filter(p => {
      if (Array.isArray(p.categories)) return p.categories.includes(categoryName);
      return p.category === categoryName;
    }).length;
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="p-3 flex items-center justify-between sticky top-0 bg-background/90 backdrop-blur-sm z-30 fix-glitch">
        <button onClick={() => navigate(-1)} className="p-1.5 hover:bg-surface rounded-full">
          <ArrowLeft className="w-5 h-5 font-bold" />
        </button>
        <h1 className="text-lg font-serif font-bold text-cream">Categories</h1>
        <div className="w-8" />
      </header>

      <div className="px-4 grid grid-cols-2 gap-3 mt-1">
        {loading ? (
          [1,2,3,4].map(i => <div key={i} className="h-40 bg-surface/50 rounded-[24px] animate-pulse" />)
        ) : (
          categories.map((cat, idx) => (
            <motion.div 
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => navigate(`/search?category=${encodeURIComponent(cat.name)}`)}
              className="relative h-48 rounded-[24px] overflow-hidden group cursor-pointer border border-white/10 shadow-xl bg-surface"
            >
              {cat.imageUrl ? (
                <img 
                  src={cat.imageUrl} 
                  alt={cat.name} 
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Grid className="w-6 h-6 text-cream/10" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/20 to-transparent p-4 flex flex-col justify-end items-center text-center">
                <h3 className="text-cream font-bold text-base mb-0.5">{cat.name}</h3>
                <p className="text-primary text-[9px] font-bold uppercase tracking-widest">{getProductCount(cat.name)} Items</p>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-background/90 backdrop-blur-md border-t border-white/5 px-6 py-1.5 flex items-center justify-between mx-4 mb-2 rounded-[24px] shadow-2xl fix-glitch">
        <NavIcon icon={<Home className="w-5 h-5" />} onClick={() => navigate('/home')} />
        <NavIcon icon={<Grid className="w-5 h-5" />} active />
        <NavIcon icon={<Heart className="w-5 h-5" />} onClick={() => navigate('/wishlist')} />
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
