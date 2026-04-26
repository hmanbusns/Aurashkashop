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
    return products.filter(p => p.category === categoryName).length;
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      <header className="p-6 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-md z-30">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-surface rounded-full">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-serif font-bold text-cream">Categories</h1>
        <div className="w-10" />
      </header>

      <div className="px-6 grid grid-cols-2 gap-6 mt-4">
        {loading ? (
          [1,2,3,4].map(i => <div key={i} className="h-64 bg-surface/50 rounded-[40px] animate-pulse" />)
        ) : (
          categories.map((cat, idx) => (
            <motion.div 
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => navigate(`/search?category=${encodeURIComponent(cat.name)}`)}
              className="relative h-72 rounded-[48px] overflow-hidden group cursor-pointer border border-white/10 shadow-2xl bg-surface"
            >
              {cat.imageUrl ? (
                <img 
                  src={cat.imageUrl} 
                  alt={cat.name} 
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Grid className="w-8 h-8 text-cream/10" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/20 to-transparent p-6 flex flex-col justify-end items-center text-center">
                <h3 className="text-cream font-bold text-lg mb-1">{cat.name}</h3>
                <p className="text-primary text-[10px] font-bold uppercase tracking-widest">{getProductCount(cat.name)} Items</p>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-xl border-t border-white/5 px-8 py-4 flex items-center justify-between mx-4 mb-4 rounded-[32px] shadow-2xl">
        <NavIcon icon={<Home className="w-6 h-6" />} onClick={() => navigate('/home')} />
        <NavIcon icon={<Grid className="w-6 h-6" />} active />
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
