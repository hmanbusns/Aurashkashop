import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Search, ArrowLeft, Filter, ShoppingCart, Heart, Star } from 'lucide-react';
import { Product } from '../types';
import { DatabaseService } from '../services/databaseService';

export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      const data = await DatabaseService.getProducts();
      setProducts(data);
      setLoading(false);
    }
    load();
  }, []);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background p-6 pt-12 pb-24">
      <header className="flex items-center gap-6 mb-10">
        <button 
          onClick={() => navigate('/home')}
          className="p-3 bg-surface rounded-2xl hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-serif font-bold text-cream">Search</h1>
      </header>

      <div className="relative mb-10">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <Search className="w-5 h-5 text-cream/40" />
        </div>
        <input 
          autoFocus
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="What are you looking for?"
          className="w-full pl-12 pr-12 py-5 bg-surface/50 border border-white/5 rounded-3xl focus:border-primary/50 transition-all outline-none text-cream"
        />
        <div className="absolute inset-y-0 right-4 flex items-center gap-3">
          <div className="w-px h-6 bg-white/10" />
          <button className="text-primary hover:scale-110 transition-transform">
            <Filter className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between mb-8 px-2">
        <p className="text-cream/50 text-sm">
          {searchTerm ? `Results for "${searchTerm}"` : 'All Products'}
        </p>
        <div className="flex gap-1">
          <span className="text-primary font-bold">{filteredProducts.length}</span>
          <span className="text-cream/30">found</span>
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          [1,2,3,4].map(i => <div key={i} className="h-32 bg-surface/30 rounded-3xl animate-pulse" />)
        ) : (
          filteredProducts.map((product) => (
            <HorizontalProductCard key={product.id} product={product} />
          ))
        )}
      </div>
    </div>
  );
}

function HorizontalProductCard({ product }: { product: Product, key?: any }) {
  const navigate = useNavigate();
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      onClick={() => navigate(`/product/${product.id}`)}
      className="bg-surface/30 p-3 rounded-[2.5rem] border border-white/5 flex gap-5 group cursor-pointer hover:border-primary/30 transition-all items-center"
    >
      <div className="h-32 w-32 rounded-[2rem] overflow-hidden bg-surface flex-shrink-0 border border-white/5 shadow-2xl">
        <img 
          src={product.imageUrl} 
          alt={product.name} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
          referrerPolicy="no-referrer"
        />
      </div>
      <div className="flex-1 min-w-0 pr-2">
        <h3 className="text-cream font-bold text-xl mb-1 leading-tight truncate">{product.name}</h3>
        <p className="text-primary font-bold text-lg mb-2">${product.price.toFixed(2)}</p>
        <div className="flex items-center gap-1.5">
          <Star className="w-4 h-4 text-primary fill-current" />
          <span className="text-primary font-bold text-xs">{product.rating}</span>
          <span className="text-cream/30 text-xs">({product.reviewsCount})</span>
        </div>
      </div>
      <button 
        onClick={(e) => { e.stopPropagation(); }}
        className="p-4 text-cream/20 hover:text-primary transition-all pr-6"
      >
        <Heart className="w-6 h-6" />
      </button>
    </motion.div>
  );
}
