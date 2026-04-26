import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Heart, Star, ShoppingBag, Plus, Minus, Share2, Filter, Check } from 'lucide-react';
import { Product } from '../types';
import { DatabaseService } from '../services/databaseService';

export default function ProductDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState('');

  useEffect(() => {
    async function load() {
      if (id) {
        const data = await DatabaseService.getProduct(id);
        setProduct(data);
        if (data) {
          setActiveImage(data.imageUrl);
          const sizes = data.size?.split(',').map(s => s.trim()) || [];
          if (sizes.length > 0) setSelectedSize(sizes[0]);
        }
      }
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;
  }

  if (!product) {
    return <div className="min-h-screen bg-background p-6 text-center pt-20">Product not found</div>;
  }

  const allImages = [product.imageUrl, ...(product.additionalImages || [])];
  const sizes = product.size?.split(',').map(s => s.trim()) || ['50ml', '100ml', '150ml'];

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md px-6 py-5 flex items-center justify-between">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 text-cream hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-serif font-bold text-cream">Product Details</h1>
        <button className="p-2 text-cream hover:text-red-500 transition-colors">
          <Heart className="w-6 h-6" />
        </button>
      </header>

      <div className="px-6 space-y-8">
        {/* Product Image */}
        <div className="relative aspect-[4/5] w-full rounded-[3rem] overflow-hidden border border-white/5 shadow-2xl">
          <AnimatePresence mode="wait">
            <motion.img 
              key={activeImage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              src={activeImage} 
              alt={product.name} 
              className="w-full h-full object-cover"
            />
          </AnimatePresence>
          
          {/* Thumbnails */}
          {allImages.length > 1 && (
            <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 px-6 overflow-x-auto no-scrollbar">
              {allImages.map((img, idx) => (
                <button 
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`w-12 h-12 rounded-2xl overflow-hidden border-2 shrink-0 transition-all ${
                    activeImage === img ? 'border-primary scale-110' : 'border-white/20 opacity-50'
                  }`}
                >
                  <img src={img} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-4">
          <h1 className="text-3xl font-serif font-bold text-cream leading-tight">{product.name}</h1>
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-[#F5B546] fill-current" />
            <span className="text-cream font-bold">{product.rating}</span>
            <span className="text-cream/40 text-sm">({product.reviewsCount} Reviews)</span>
          </div>
          <div className="text-3xl font-bold text-cream">${product.price.toFixed(2)}</div>
          <p className="text-cream/60 leading-relaxed text-sm">
            {product.description}
          </p>
        </div>

        {/* Size Selection */}
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-cream/80">Size</h4>
          <div className="flex gap-3">
            {sizes.map(size => (
              <button 
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`min-w-[70px] px-4 py-3 rounded-2xl border font-bold text-xs transition-all ${
                  selectedSize === size 
                    ? 'bg-primary/20 border-primary text-primary shadow-[0_0_15px_rgba(164,180,148,0.3)]' 
                    : 'bg-surface border-white/5 text-cream/40'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Quantity Selection */}
        <div className="flex items-center justify-between py-2">
          <h4 className="text-sm font-bold text-cream/80">Quantity</h4>
          <div className="flex items-center gap-4 bg-surface rounded-2xl p-1 border border-white/5">
            <button 
              onClick={() => setQuantity(q => Math.max(1, q - 1))}
              className="p-2.5 hover:bg-white/5 rounded-xl transition-colors"
            >
              <Minus className="w-4 h-4 text-primary" />
            </button>
            <span className="text-base font-bold w-6 text-center text-cream">{quantity}</span>
            <button 
              onClick={() => setQuantity(q => q + 1)}
              className="p-2.5 hover:bg-white/5 rounded-xl transition-colors"
            >
              <Plus className="w-4 h-4 text-primary" />
            </button>
          </div>
        </div>

        {/* Custom Fields */}
        {product.customFields && Object.keys(product.customFields).length > 0 && (
          <div className="space-y-3 pt-4">
            {Object.entries(product.customFields).map(([key, val]) => (
              <div key={key} className="flex justify-between items-center py-4 border-b border-white/5">
                 <span className="text-xs font-bold text-cream/40 uppercase tracking-widest">{key}</span>
                 <span className="text-sm font-bold text-primary">{val}</span>
              </div>
            ))}
          </div>
        )}

        {/* Reviews Section teaser */}
        <div className="pt-8 border-t border-white/5 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-serif font-bold text-cream tracking-wide">Reviews</h3>
            <button className="text-primary text-xs font-bold uppercase tracking-widest hover:underline flex items-center gap-1">
              Filter <Filter className="w-3 h-3" />
            </button>
          </div>

          <div className="flex items-start gap-8">
             <div className="text-6xl font-bold text-cream">4.8</div>
             <div className="space-y-1 pt-1 flex-1">
                <div className="flex gap-1 text-primary">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                </div>
                <div className="text-cream/30 text-xs font-bold">(230 Reviews)</div>
             </div>
          </div>

          <div className="space-y-4">
             {[
               { name: 'Priya S.', comment: 'Excellent product! Made my hair so soft and shiny.', rating: 5, date: '2 days ago' },
               { name: 'Ananya R.', comment: 'Love the natural fragrance and feel.', rating: 4, date: '1 week ago' }
             ].map((rev, i) => (
               <div key={i} className="bg-surface/50 border border-white/5 rounded-[2.5rem] p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary text-xs">
                        {rev.name[0]}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-cream">{rev.name}</div>
                        <div className="flex items-center gap-1 text-[10px] text-primary uppercase tracking-widest">
                           <Check className="w-3 h-3" /> Verified Purchase
                        </div>
                      </div>
                    </div>
                    <Heart className="w-4 h-4 text-cream/20" />
                  </div>
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, idx) => <Star key={idx} className={`w-3 h-3 ${idx < rev.rating ? 'text-[#F5B546] fill-primary' : 'text-cream/10'}`} />)}
                  </div>
                  <p className="text-cream/40 text-xs leading-relaxed italic">"{rev.comment}"</p>
               </div>
             ))}
          </div>

          <button className="w-full py-4 text-cream/30 text-xs font-bold uppercase tracking-[0.2em] border border-white/5 rounded-3xl hover:border-primary/20 transition-all">
            Write a Review
          </button>
        </div>
      </div>

      {/* Fixed Footer */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background via-background/95 to-transparent z-40">
        <button 
          className="w-full bg-[#525E48] text-white font-bold py-5 rounded-[2rem] flex items-center justify-center gap-3 shadow-2xl hover:brightness-110 active:scale-[0.98] transition-all"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}
