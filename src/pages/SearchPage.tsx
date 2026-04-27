import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { Search, ArrowLeft, Filter, ShoppingCart, Heart, Star } from 'lucide-react';
import { Product } from '../types';
import { DatabaseService } from '../services/databaseService';
import { formatCurrency } from '../lib/format';

export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const cat = params.get('category');
    if (cat) {
      setSearchTerm(cat);
    }
  }, [location.search]);

  useEffect(() => {
    async function load() {
      const data = await DatabaseService.getProducts();
      setProducts(data);
      setLoading(false);
    }
    load();
  }, []);

  const filteredProducts = products.filter(p => {
    const searchLower = searchTerm.toLowerCase();
    const matchesName = p.name.toLowerCase().includes(searchLower);
    
    let matchesCategory = false;
    if (Array.isArray(p.categories)) {
      matchesCategory = p.categories.some(cat => cat.toLowerCase().includes(searchLower));
    } else if (p.category) {
      matchesCategory = p.category.toLowerCase().includes(searchLower);
    }

    return matchesName || matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background p-6 pt-8 pb-24">
      <header className="flex items-center gap-6 mb-6">
        <button 
          onClick={() => navigate('/home')}
          className="p-3 bg-surface rounded-2xl hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-serif font-bold text-cream">Search</h1>
      </header>

      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <Search className="w-4 h-4 text-cream/40" />
        </div>
        <input 
          autoFocus
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search products..."
          className="w-full pl-10 pr-12 py-3.5 bg-surface/50 border border-white/5 rounded-2xl focus:border-primary/50 transition-all outline-none text-cream text-sm"
        />
        <div className="absolute inset-y-0 right-4 flex items-center gap-3">
          <div className="w-px h-5 bg-white/10" />
          <button className="text-primary hover:scale-110 transition-transform">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6 px-2">
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
      <div className="h-28 w-28 rounded-2xl overflow-hidden bg-surface flex-shrink-0 border border-white/5 shadow-xl relative">
        <img 
          src={product.imageUrl} 
          alt={product.name} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.tags?.slice(0, 1).map((tag, idx) => (
            <span key={idx} style={{ backgroundColor: tag.color + '20', color: tag.color, borderColor: tag.color + '40' }} className="px-1.5 py-0.5 rounded-full text-[7px] font-bold uppercase tracking-widest border backdrop-blur-sm shadow-sm">
              {tag.text}
            </span>
          ))}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-cream font-bold text-lg mb-0.5 leading-tight truncate">{product.name}</h3>
        <p className="text-primary font-bold text-base mb-1.5">{formatCurrency(product.price)}</p>
        <div className="flex items-center gap-1.5">
          <Star className="w-3.5 h-3.5 text-primary fill-current" />
          <span className="text-primary font-bold text-xs">{product.rating}</span>
          <span className="text-cream/30 text-[10px]">({product.reviewsCount})</span>
        </div>
      </div>
    </motion.div>
  );
}
