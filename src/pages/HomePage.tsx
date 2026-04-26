import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, ShoppingCart, User as UserIcon, Heart, Home, Grid, 
  Filter, LogOut, Settings, LayoutGrid 
} from 'lucide-react';
import { UserProfile, Product, BannerConfig, Category } from '../types';
import { DatabaseService } from '../services/databaseService';
import { AuthService } from '../services/authService';

export default function HomePage({ user }: { user: UserProfile | null }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [banner, setBanner] = useState<BannerConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      const [prodData, bannerData, catData] = await Promise.all([
        DatabaseService.getProducts(),
        DatabaseService.getBannerConfig(),
        DatabaseService.getCategories()
      ]);
      setProducts(prodData);
      setBanner(bannerData);
      setCategories(catData);
      setLoading(false);
    }
    load();
  }, []);

  const handleLogout = async () => {
    await AuthService.logout();
    navigate('/login');
  };

  const handleBannerClick = () => {
    if (banner?.externalLink) {
      window.open(banner.externalLink, '_blank');
    } else {
      navigate('/search');
    }
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
            <LayoutGrid className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-xl font-serif text-primary uppercase tracking-widest font-bold">Aurashka</h1>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/cart')}
            className="p-2 bg-surface text-cream/70 rounded-full hover:bg-white/10 transition-colors"
          >
            <ShoppingCart className="w-5 h-5" />
          </button>
          <div className="group relative">
            <button 
              onClick={() => navigate('/profile')}
              className="p-2 bg-surface text-cream/70 rounded-full hover:bg-white/10 transition-colors"
            >
              <UserIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Welcome */}
      <section className="px-6 py-6 mb-4">
        <h2 className="text-xl font-light text-cream/40">Good Morning</h2>
        <h3 className="text-2xl font-bold text-cream mb-6 capitalize">{user?.displayName?.split(' ')[0] || 'Explorer'} 👋</h3>
        
        <div className="relative group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-cream/30" />
          </div>
          <input 
            type="text"
            onClick={() => navigate('/search')}
            readOnly
            placeholder="Search natural products..."
            className="w-full pl-12 pr-12 py-4 bg-surface/50 border border-white/5 rounded-2xl focus:border-primary/50 transition-all outline-none text-cream cursor-pointer"
          />
          <button className="absolute inset-y-0 right-4 flex items-center text-primary">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Filter className="w-5 h-5" />
            </div>
          </button>
        </div>
      </section>

      {/* Main Banner */}
      <section className="px-6 mb-10">
        <div className="relative h-72 w-full rounded-[40px] overflow-hidden group">
          <img 
            src={banner?.imageUrl || "https://images.unsplash.com/photo-1547721065-85669931cc43?auto=format&fit=crop&q=80&w=2070"} 
            alt="nature" 
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/30 to-transparent flex flex-col justify-center p-8">
            <h4 className="text-4xl font-serif text-cream mb-3 max-w-[250px] leading-tight font-bold">
              {banner?.title || "Nature Knows Best"}
            </h4>
            <p className="text-cream/60 text-sm mb-6 max-w-[200px]">
              {banner?.subtitle || "Discover the power of botanical care"}
            </p>
            <button 
              onClick={handleBannerClick}
              className="w-fit px-8 py-3 bg-primary text-background font-bold rounded-2xl text-[10px] hover:scale-105 transition-transform uppercase tracking-widest shadow-xl shadow-primary/20"
            >
              {banner?.buttonText || "Shop Now"}
            </button>
          </div>
        </div>
      </section>

      {/* Categories Chips */}
      <section className="px-6 mb-10 overflow-x-auto no-scrollbar">
        <div className="flex gap-6 pb-2">
          {categories.map((cat) => (
            <button 
              key={cat.id}
              onClick={() => navigate(`/search?category=${encodeURIComponent(cat.name)}`)}
              className="flex flex-col items-center gap-3 shrink-0 group"
            >
              <div 
                className="bg-surface rounded-full flex items-center justify-center overflow-hidden border border-white/5 transition-all group-hover:scale-110 group-hover:border-primary/30"
                style={{ 
                  width: cat.imageSize ? `${cat.imageSize}px` : '48px', 
                  height: cat.imageSize ? `${cat.imageSize}px` : '48px' 
                }}
              >
                {cat.imageUrl ? (
                  <img 
                    src={cat.imageUrl} 
                    className="w-full h-full object-contain p-1" 
                    alt={cat.name} 
                  />
                ) : (
                  <LayoutGrid className="text-cream/10" style={{ width: '50%', height: '50%' }} />
                )}
              </div>
              <span 
                className="font-bold uppercase tracking-widest whitespace-nowrap"
                style={{ 
                  fontSize: cat.textSize ? `${cat.textSize}px` : '9px',
                  color: cat.textColor || 'rgba(255, 253, 237, 0.4)'
                }}
              >
                {cat.name}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Dynamic Category Sections */}
      <div className="space-y-16">
        {categories.map((cat) => (
          <CategorySection 
            key={cat.id} 
            category={cat} 
            products={products.filter(p => p.category === cat.name)}
            onProductClick={(id) => navigate(`/product/${id}`)}
          />
        ))}

        {!loading && categories.length === 0 && (
          <div className="px-6 py-20 text-center">
             <LayoutGrid className="w-12 h-12 text-cream/10 mx-auto mb-4" />
             <p className="text-cream/30">No categories found. Visit Admin to add some!</p>
          </div>
        )}
      </div>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-xl border-t border-white/5 px-8 py-4 flex items-center justify-between mx-4 mb-4 rounded-[32px] shadow-2xl">
        <NavIcon icon={<Home className="w-6 h-6" />} active />
        <NavIcon icon={<Grid className="w-6 h-6" />} onClick={() => navigate('/categories')} />
        <NavIcon icon={<Heart className="w-6 h-6" />} onClick={() => navigate('/wishlist')} />
        <NavIcon icon={<UserIcon className="w-6 h-6" />} onClick={() => navigate('/profile')} />
      </nav>
    </div>
  );
}

function CategorySection({ category, products, onProductClick }: { key?: string; category: Category; products: Product[]; onProductClick: (id: string) => void }) {
  if (products.length === 0) return null;

  return (
    <section className="px-6">
      <div className="flex items-center justify-between mb-6">
        <h5 className="text-2xl font-serif font-bold text-cream">{category.id === 'best-sellers' ? 'Best Sellers' : category.name}</h5>
        <button className="text-primary text-xs font-bold uppercase tracking-widest hover:underline">View All</button>
      </div>

      {category.layoutType === 'grid' && (
        <div className="grid grid-cols-2 gap-4">
          {products.map(p => <ProductCard key={p.id} product={p} onClick={() => onProductClick(p.id)} />)}
        </div>
      )}

      {category.layoutType === 'reel' && (
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4">
          {products.map(p => (
            <motion.div 
              key={p.id}
              whileHover={{ scale: 1.02 }}
              onClick={() => onProductClick(p.id)}
              className="relative w-72 h-[450px] rounded-[48px] overflow-hidden shrink-0 group cursor-pointer border border-white/10 shadow-2xl"
            >
               {p.videoUrl ? (
                 <video 
                   src={p.videoUrl} 
                   autoPlay 
                   muted 
                   loop 
                   playsInline
                   className="absolute inset-0 w-full h-full object-cover"
                 />
               ) : (
                 p.imageUrl ? (
                   <img src={p.imageUrl} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                 ) : (
                   <div className="absolute inset-0 flex items-center justify-center bg-surface">
                     <Grid className="w-8 h-8 text-cream/10" />
                   </div>
                 )
               )}
               <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent flex flex-col justify-end p-8">
                  <h4 className="text-white font-bold text-2xl mb-1">{p.name}</h4>
                  <p className="text-primary font-bold text-lg">${p.price.toFixed(2)}</p>
               </div>
            </motion.div>
          ))}
        </div>
      )}

      {category.layoutType === 'banner' && (
        <div className="space-y-4">
          {products.map(p => (
            <div 
              key={p.id} 
              onClick={() => onProductClick(p.id)}
              className="relative h-48 rounded-[40px] overflow-hidden group cursor-pointer border border-white/5"
            >
              {p.imageUrl ? (
                <img src={p.imageUrl} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
              ) : (
                <div className="absolute inset-0 bg-surface flex items-center justify-center">
                   <Grid className="w-8 h-8 text-cream/10" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/20 to-transparent flex flex-col justify-center p-8">
                 <h4 className="text-white font-bold text-xl mb-1">{p.name}</h4>
                 <p className="text-primary font-bold text-lg">${p.price.toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function ProductCard({ product, onClick }: { key?: string; product: Product; onClick: () => void }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      onClick={onClick}
      className="flex flex-col group cursor-pointer"
    >
      <div className="relative aspect-[4/5] w-full rounded-[2.5rem] overflow-hidden mb-4 bg-surface/50 border border-white/5">
        {product.imageUrl ? (
          <img 
            src={product.imageUrl} 
            alt={product.name} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <LayoutGrid className="w-8 h-8 text-cream/10" />
          </div>
        )}
        <button 
          onClick={(e) => { e.stopPropagation(); }}
          className="absolute top-4 right-4 p-2.5 bg-background/40 backdrop-blur-md rounded-full text-white hover:text-red-500 transition-colors"
        >
          <Heart className="w-4 h-4" />
        </button>
      </div>
      <div className="px-2">
        <h6 className="text-cream text-base font-bold truncate mb-1 leading-tight">{product.name}</h6>
        <p className="text-primary font-bold text-lg">${product.price.toFixed(2)}</p>
      </div>
    </motion.div>
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
