import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Heart, Star, ShoppingBag, Plus, Minus, Share2, Filter, Check } from 'lucide-react';
import { Product, Review, GlobalProductSettings } from '../types';
import { DatabaseService } from '../services/databaseService';
import { auth } from '../lib/firebase';
import { formatCurrency } from '../lib/format';

export default function ProductDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [globalSettings, setGlobalSettings] = useState<GlobalProductSettings | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('');
  const [loading, setLoading] = useState(true);
  const [imageIndex, setImageIndex] = useState(0);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [productReviews, setProductReviews] = useState<Review[]>([]);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);

  useEffect(() => {
    window.scrollTo(0, 0);
    async function load() {
      // Load Global Settings
      const settings = await DatabaseService.getGlobalSettings();
      setGlobalSettings(settings);

      if (id) {
        const data = await DatabaseService.getProduct(id);
        setProduct(data);
        if (data) {
          setImageIndex(0);
          const sizes = data.size?.split(',').map(s => s.trim()) || [];
          if (sizes.length > 0) setSelectedSize(sizes[0]);

          const user = auth.currentUser;
          if (user) {
            const inWishlist = await DatabaseService.isInWishlist(user.uid, id);
            setIsInWishlist(inWishlist);
          }

          // Load Reviews
          const reviews = await DatabaseService.getReviews(id);
          setProductReviews(reviews);

          // Load Recommendations
          const allProducts = await DatabaseService.getProducts();
          const recommended = allProducts
            .filter(p => {
              const pCats = Array.isArray(p.categories) ? p.categories : [p.category].filter(Boolean);
              const currentCats = Array.isArray(data.categories) ? data.categories : [data.category].filter(Boolean);
              return pCats.some(cat => currentCats.includes(cat)) && p.id !== id;
            })
            .sort(() => 0.5 - Math.random())
            .slice(0, 5);
          setRecommendedProducts(recommended);
        }
      }
      setLoading(false);
    }
    load();
  }, [id]);

  const handleWishlistToggle = async () => {
    const user = auth.currentUser;
    if (!user) {
      navigate('/login');
      return;
    }
    if (id) {
      const added = await DatabaseService.toggleWishlist(user.uid, id);
      setIsInWishlist(added);
    }
  };

  const handleAddToCart = async () => {
    const user = auth.currentUser;
    if (!user) {
      navigate('/login');
      return;
    }
    if (id && product) {
      setIsAddingToCart(true);
      await DatabaseService.addToCart(user.uid, id, quantity, selectedSize);
      setIsAddingToCart(false);
      navigate('/cart');
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;
  }

  if (!product) {
    return <div className="min-h-screen bg-background p-6 text-center pt-20">Product not found</div>;
  }

  const allImages = [product.imageUrl, ...(product.additionalImages || [])];
  const activeMedia = allImages[imageIndex] || '';
  const isVideo = activeMedia.includes('youtube.com/embed') || activeMedia.toLowerCase().endsWith('.mp4');

  const handleNextImage = () => {
    if (imageIndex < allImages.length - 1) {
      setImageIndex(prev => prev + 1);
    } else {
      setImageIndex(0);
    }
  };

  const handlePrevImage = () => {
    if (imageIndex > 0) {
      setImageIndex(prev => prev - 1);
    } else {
      setImageIndex(allImages.length - 1);
    }
  };

  const sizes = product.size?.split(',').map(s => s.trim()) || ['50ml', '100ml', '150ml'];

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 px-4 py-2 flex items-center justify-between border-b border-white/5">
        <button 
          onClick={() => navigate(-1)}
          className="p-1.5 text-cream hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-base font-serif font-bold text-cream">Product Details</h1>
        <button 
          onClick={handleWishlistToggle}
          className={`p-1.5 transition-colors ${isInWishlist ? 'text-red-500' : 'text-cream hover:text-red-500'}`}
        >
          <Heart className={`w-5 h-5 ${isInWishlist ? 'fill-current' : ''}`} />
        </button>
      </header>

      <div className="px-4 space-y-5">
        {/* Product Image Gallery */}
        <div 
          className="relative aspect-[4/5] w-full overflow-hidden border border-white/5 shadow-2xl bg-surface/10"
          style={{ borderRadius: `${product.imageCurve ?? 40}px` }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={imageIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full h-full"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              onDragEnd={(_, info) => {
                if (info.offset.x < -50) handleNextImage();
                else if (info.offset.x > 50) handlePrevImage();
              }}
            >
              {isVideo ? (
                activeMedia.includes('youtube.com/embed') ? (
                  <iframe 
                    src={`${activeMedia}${activeMedia.includes('?') ? '&' : '?'}${product.galleryAutoplay ? 'autoplay=1&mute=1' : ''}`}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video 
                    src={activeMedia}
                    controls
                    autoPlay={product.galleryAutoplay}
                    muted={product.galleryAutoplay}
                    className="w-full h-full object-contain"
                  />
                )
              ) : (
                <img 
                  src={activeMedia} 
                  alt={product.name} 
                  className="w-full h-full object-contain p-4"
                />
              )}
            </motion.div>
          </AnimatePresence>

          {/* Swipe Indicators */}
          {allImages.length > 1 && (
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 px-4">
              {allImages.map((_, idx) => (
                <div 
                  key={idx}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    imageIndex === idx ? 'w-4 bg-primary' : 'w-1 bg-white/20'
                  }`}
                />
              ))}
            </div>
          )}
          
          {/* Thumbnails (Optional scroll) */}
          {allImages.length > 1 && (
            <div className="absolute top-4 right-4 flex flex-col gap-2 pointer-events-none">
              {allImages.slice(0, 4).map((img, idx) => {
                const isThumbVideo = img.includes('youtube.com/embed') || img.toLowerCase().endsWith('.mp4');
                return (
                  <button 
                    key={idx}
                    onClick={() => setImageIndex(idx)}
                    className={`w-10 h-10 rounded-xl overflow-hidden border-2 shrink-0 transition-all pointer-events-auto relative ${
                      imageIndex === idx ? 'border-primary scale-110 shadow-lg' : 'border-white/10 opacity-40 hover:opacity-100'
                    }`}
                  >
                    {isThumbVideo ? (
                      <div className="w-full h-full bg-black/40 flex items-center justify-center">
                        <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                           <div className="w-0 h-0 border-t-[3px] border-t-transparent border-l-[5px] border-l-background border-b-[3px] border-b-transparent ml-0.5" />
                        </div>
                      </div>
                    ) : (
                      <img src={img} className="w-full h-full object-cover" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {/* Show Categories as Tags */}
            {(Array.isArray(product.categories) ? product.categories : [product.category]).filter(Boolean).map((cat, idx) => (
              <span key={`cat-${idx}`} className="px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-widest bg-primary text-background">
                {cat}
              </span>
            ))}
            {product.tags?.map((tag, idx) => (
              <span key={idx} style={{ backgroundColor: tag.color + '20', color: tag.color, borderColor: tag.color + '40' }} className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest border">
                {tag.text}
              </span>
            ))}
          </div>
          <h1 className="text-xl font-serif font-bold text-cream leading-tight">{product.name}</h1>
          <div className="flex items-center gap-2">
            <Star className="w-3 h-3 text-[#F5B546] fill-current" />
            <span className="text-cream font-bold text-xs">{product.rating}</span>
            <span className="text-cream/40 text-[10px]">({product.reviewsCount} Reviews)</span>
          </div>
          <div className="flex items-center gap-3">
            {(() => {
              const discount = product.discountPercentage ?? globalSettings?.defaultDiscountPercentage ?? 0;
              const hasDiscount = discount > 0;
              const finalPrice = hasDiscount ? product.price * (1 - discount / 100) : product.price;
              
              return (
                <>
                  <div className="text-xl font-bold text-cream">{formatCurrency(finalPrice)}</div>
                  {hasDiscount && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-cream/30 line-through font-medium">{formatCurrency(product.price)}</span>
                      <span className="px-1.5 py-0.5 bg-red-500/10 text-red-500 text-[9px] font-bold rounded-md">
                        {discount}% OFF
                      </span>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
          <div className="space-y-4 pt-4 border-t border-white/5">
            <h2 className="text-[10px] font-bold text-cream/40 uppercase tracking-widest">Description</h2>
            <div 
              className="text-cream/70 leading-relaxed text-sm product-description-content"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />
          </div>
        </div>

        {/* Size Selection */}
        <div className="space-y-2">
          <h4 className="text-[10px] font-bold text-cream/40 tracking-[0.2em] uppercase">Size Selection</h4>
          <div className="flex flex-wrap gap-2">
            {sizes.map(size => (
              <button 
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`px-4 py-1.5 rounded-lg border font-bold text-[9px] transition-all uppercase tracking-widest ${
                  selectedSize === size 
                    ? 'bg-primary text-background border-primary shadow-[0_0_15px_rgba(164,180,148,0.2)]' 
                    : 'bg-surface/50 border-white/5 text-cream/30 hover:text-cream/60'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Quantity Selection */}
        <div className="flex items-center justify-between py-1">
          <h4 className="text-xs font-bold text-cream/80 tracking-widest uppercase">Quantity</h4>
          <div className="flex items-center gap-3 bg-surface rounded-xl p-1 border border-white/5">
            <button 
              onClick={() => setQuantity(q => Math.max(1, q - 1))}
              className="p-2 hover:bg-white/5 rounded-lg transition-colors"
            >
              <Minus className="w-3.5 h-3.5 text-primary" />
            </button>
            <span className="text-sm font-bold w-4 text-center text-cream">{quantity}</span>
            <button 
              onClick={() => setQuantity(q => q + 1)}
              className="p-2 hover:bg-white/5 rounded-lg transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-primary" />
            </button>
          </div>
        </div>

        {/* Custom Fields */}
        {product.customFields && Object.keys(product.customFields).length > 0 && (
          <div className="space-y-1 pt-2">
            {Object.entries(product.customFields).map(([key, val]) => (
              <div key={key} className="flex justify-between items-center py-2.5 border-b border-white/5">
                 <span className="text-[10px] font-bold text-cream/40 uppercase tracking-[0.15em]">{key}</span>
                 <span className="text-xs font-bold text-primary">{val}</span>
              </div>
            ))}
          </div>
        )}

        {/* Reviews Section */}
        <div className="pt-6 border-t border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-serif font-bold text-cream tracking-wide">Customer Reviews</h3>
            <div className="flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 text-primary fill-primary" />
              <span className="text-cream text-xs font-bold">{product.rating}</span>
              <span className="text-cream/30 text-[10px]">({productReviews.length})</span>
            </div>
          </div>

          <div 
            className="flex gap-4 overflow-x-auto pb-4 no-scrollbar px-1 snap-x"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
             {productReviews.length === 0 ? (
               <div className="w-full py-4 text-center text-cream/20 text-[10px] italic">No reviews yet for this product.</div>
             ) : (
                [...productReviews]
                  .sort((a, b) => b.createdAt - a.createdAt)
                  .slice(0, 10)
                  .map((rev) => (
                    <div key={rev.id} className="w-[80vw] max-w-[280px] bg-[#1A1F1A] border border-white/5 rounded-2xl p-4 space-y-2 shrink-0 snap-start shadow-xl">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-[10px]">
                            {rev.userName[0]}
                          </div>
                          <div>
                            <div className="text-[11px] font-bold text-cream">{rev.userName}</div>
                            <div className="text-[8px] text-cream/30 font-bold uppercase tracking-widest">{rev.date}</div>
                          </div>
                        </div>
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, i) => <Star key={i} className={`w-2.5 h-2.5 ${i < rev.rating ? 'text-primary fill-current' : 'text-cream/10'}`} />)}
                        </div>
                      </div>
                      <p className="text-cream/50 text-[11px] leading-relaxed italic pr-2">"{rev.comment}"</p>
                    </div>
                  ))
             )}
          </div>
        </div>

        {/* Recommended Products */}
        {recommendedProducts.length > 0 && (
          <div className="pt-8 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-serif font-bold text-cream tracking-wide">You May Also Like</h3>
              <div className="h-px bg-white/5 flex-1 mx-4" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              {recommendedProducts.map(p => (
                <div 
                  key={p.id} 
                  onClick={() => navigate(`/product/${p.id}`)}
                  className="bg-surface/30 border border-white/5 rounded-2xl p-2.5 space-y-2 cursor-pointer group"
                >
                  <div className="aspect-square rounded-xl overflow-hidden bg-background">
                    <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  </div>
                  <div className="px-1">
                    <h4 className="text-[11px] font-bold text-cream truncate">{p.name}</h4>
                    <p className="text-primary text-[10px] font-bold">{formatCurrency(p.price)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Fixed Footer */}
      <div className="fixed bottom-0 left-0 right-0 px-4 py-2.5 bg-background border-t border-white/5 z-40">
        <div className="max-w-md mx-auto grid grid-cols-2 gap-3">
          <button 
            onClick={handleAddToCart}
            disabled={isAddingToCart}
            className="bg-surface border border-white/5 text-cream font-bold py-2.5 rounded-2xl flex items-center justify-center gap-2 shadow-xl hover:bg-white/5 active:scale-[0.98] transition-all disabled:opacity-50 text-[11px] uppercase tracking-widest"
          >
            {isAddingToCart ? (
              <div className="w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5 text-primary" />
                Add to Cart
              </>
            )}
          </button>
          <button 
            onClick={() => {
              handleAddToCart();
              navigate('/checkout');
            }}
            className="bg-primary text-background font-bold py-2.5 rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-primary/10 hover:brightness-110 active:scale-[0.98] transition-all text-[11px] uppercase tracking-widest"
          >
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
}
