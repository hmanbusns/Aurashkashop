import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, ShoppingCart, User as UserIcon, Heart, Home, Grid, 
  Filter, LogOut, Settings, LayoutGrid, Star 
} from 'lucide-react';
import { UserProfile, Product, BannerConfig, Category, HomeSection } from '../types';
import { DatabaseService } from '../services/databaseService';
import { AuthService } from '../services/authService';
import { formatCurrency } from '../lib/format';

export default function HomePage({ user }: { user: UserProfile | null }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [homeSections, setHomeSections] = useState<HomeSection[]>([]);
  const [banner, setBanner] = useState<BannerConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      const [prodData, bannerData, catData, homeData] = await Promise.all([
        DatabaseService.getProducts(),
        DatabaseService.getBannerConfig(),
        DatabaseService.getCategories(),
        DatabaseService.getHomeSections()
      ]);
      setProducts(prodData);
      setBanner(bannerData);
      setCategories(catData);
      setHomeSections(homeData);

      if (user) {
        const w = await DatabaseService.getWishlist(user.uid);
        setWishlist(w);
      }
      setLoading(false);
    }
    load();
  }, [user]);

  const toggleWishlist = async (productId: string) => {
    if (!user) {
      navigate('/login');
      return;
    }
    const added = await DatabaseService.toggleWishlist(user.uid, productId);
    if (added) {
      setWishlist(prev => [...prev, productId]);
    } else {
      setWishlist(prev => prev.filter(id => id !== productId));
    }
  };

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
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 overflow-hidden rounded-xl flex items-center justify-center bg-white/5">
            <img src="https://i.ibb.co/vxKFtvqB/20241130-231344.png" className="w-full h-full object-contain" alt="Aurashka Logo" />
          </div>
          <h1 className="text-xl font-serif text-primary uppercase tracking-widest font-bold">Aurashka</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="group relative">
            <button 
              onClick={() => navigate('/profile')}
              className="w-10 h-10 bg-surface text-primary rounded-full hover:bg-white/10 transition-all flex items-center justify-center font-serif font-bold text-sm shadow-sm"
            >
              {user?.displayName ? (
                user.displayName[0].toUpperCase()
              ) : (
                <UserIcon className="w-5 h-5 text-cream/70" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Welcome */}
      <section className="px-6 py-4 mb-2">
        <h2 className="text-lg font-light text-cream/40">Good Morning</h2>
        <h3 className="text-xl font-bold text-cream mb-4 capitalize">{user?.displayName?.split(' ')[0] || 'Explorer'} 👋</h3>
        
        <div className="relative group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-cream/30" />
          </div>
          <input 
            type="text"
            onClick={() => navigate('/search')}
            readOnly
            placeholder="Search natural products..."
            className="w-full pl-10 pr-12 py-3 bg-surface/50 border border-white/5 rounded-2xl focus:border-primary/50 transition-all outline-none text-cream text-sm cursor-pointer"
          />
          <button className="absolute inset-y-0 right-4 flex items-center text-primary">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Filter className="w-5 h-5" />
            </div>
          </button>
        </div>
      </section>

      {/* Main Banner */}
      <section className="px-6 mb-6">
        <div className="relative h-60 w-full rounded-[32px] overflow-hidden group">
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
      <section className="px-6 mb-6 overflow-x-auto no-scrollbar">
        <div className="flex gap-6 pb-2">
          {[...categories].sort((a, b) => (a.order || 0) - (b.order || 0)).map((cat) => (
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
                  <div className="w-full h-full flex items-center justify-center p-1.5">
                    <img 
                      src={cat.imageUrl} 
                      className="max-w-full max-h-full object-contain" 
                      alt={cat.name} 
                    />
                  </div>
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

      {/* Dynamic Sections */}
      <div className="space-y-10">
        {homeSections.length > 0 ? (
          homeSections.map(section => {
            let sectionProducts: Product[] = [];
            if (section.dataSource === 'all') {
              sectionProducts = [...products];
            } else if (section.dataSource === 'category') {
              sectionProducts = products.filter(p => {
                if (Array.isArray(p.categories)) return p.categories.includes(section.categoryId || '');
                return p.category === section.categoryId;
              });
            } else if (section.dataSource === 'products' && section.productIds) {
              sectionProducts = section.productIds
                .map(id => products.find(p => p.id === id))
                .filter((p): p is Product => !!p);
            }

            return (
              <ManualSection 
                key={section.id} 
                section={section} 
                products={sectionProducts}
                onProductClick={(id) => navigate(`/product/${id}`)}
                wishlist={wishlist}
                onToggleWishlist={toggleWishlist}
              />
            );
          })
        ) : (
          [...categories].sort((a, b) => (a.order || 0) - (b.order || 0)).map((cat) => (
            <CategorySection 
              key={cat.id} 
              category={cat} 
              products={products
                .filter(p => {
                  if (Array.isArray(p.categories)) return p.categories.includes(cat.name);
                  return p.category === cat.name;
                })
                .sort((a, b) => (a.order || 0) - (b.order || 0))}
              onProductClick={(id) => navigate(`/product/${id}`)}
              wishlist={wishlist}
              onToggleWishlist={toggleWishlist}
            />
          ))
        )}

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

function ManualSection({ 
  section, 
  products, 
  onProductClick,
  wishlist,
  onToggleWishlist
}: { 
  key?: string,
  section: HomeSection, 
  products: Product[],
  onProductClick: (id: string) => void | Promise<void>,
  wishlist: string[],
  onToggleWishlist: (id: string) => void | Promise<void>
}) {
  if (products.length === 0) return null;

  if (section.layoutType === 'reel') {
    return (
      <section className="px-6 relative">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h3 className="text-xl font-serif text-cream font-bold leading-tight">{section.title}</h3>
            <div className="h-1 w-12 bg-primary mt-2 rounded-full" />
          </div>
        </div>
        
        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar -mx-6 px-6">
          {products.map((p) => (
            <motion.div 
              key={p.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => onProductClick(p.id)}
              className="relative min-w-[160px] h-72 rounded-[32px] overflow-hidden group border border-white/5"
            >
              <img 
                src={p.imageUrl} 
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                alt={p.name}
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
              
              <button 
                onClick={(e) => { e.stopPropagation(); onToggleWishlist(p.id); }}
                className={`absolute top-4 right-4 p-2 bg-black/20 backdrop-blur-md rounded-full transition-colors z-10 ${wishlist.includes(p.id) ? 'text-red-500' : 'text-white hover:text-red-500'}`}
              >
                <Heart className={`w-3.5 h-3.5 ${wishlist.includes(p.id) ? 'fill-current' : ''}`} />
              </button>

              <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="flex gap-0.5 mb-1.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-2 h-2 ${i < p.rating ? 'text-primary fill-current' : 'text-cream/10'}`} />
                    ))}
                  </div>
                  <h4 className="text-white font-bold text-sm mb-1 line-clamp-1">{p.name}</h4>
                  <p className="text-primary font-bold text-base">{formatCurrency(p.price)}</p>
               </div>
            </motion.div>
          ))}
        </div>
      </section>
    );
  }

  if (section.layoutType === 'banner') {
    return (
      <section className="px-6">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h3 className="text-xl font-serif text-cream font-bold leading-tight">{section.title}</h3>
            <div className="h-1 w-12 bg-primary mt-2 rounded-full" />
          </div>
        </div>
        <div className="space-y-4">
          {products.map((p) => (
            <div 
              key={p.id}
              onClick={() => onProductClick(p.id)}
              className="relative h-48 w-full rounded-[32px] overflow-hidden group border border-white/5"
            >
              <img 
                src={p.imageUrl} 
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
                alt={p.name}
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black via-black/20 to-transparent p-8 flex flex-col justify-center">
                 <div className="flex gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-3 h-3 ${i < p.rating ? 'text-primary fill-current' : 'text-cream/10'}`} />
                    ))}
                  </div>
                 <h4 className="text-white font-bold text-xl mb-1">{p.name}</h4>
                 <p className="text-primary font-bold text-lg">{formatCurrency(p.price)}</p>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); onToggleWishlist(p.id); }}
                className={`absolute top-6 right-6 p-2.5 bg-black/20 backdrop-blur-md rounded-full transition-colors z-10 ${wishlist.includes(p.id) ? 'text-red-500' : 'text-white hover:text-red-500'}`}
              >
                <Heart className={`w-4 h-4 ${wishlist.includes(p.id) ? 'fill-current' : ''}`} />
              </button>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="px-6">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h3 className="text-xl font-serif text-cream font-bold leading-tight">{section.title}</h3>
          <div className="h-1 w-12 bg-primary mt-2 rounded-full" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} onClick={() => onProductClick(p.id)} isWishlisted={wishlist.includes(p.id)} onToggleWishlist={() => onToggleWishlist(p.id)} />
        ))}
      </div>
    </section>
  );
}

function CategorySection({ 
  category, 
  products, 
  onProductClick,
  wishlist,
  onToggleWishlist
}: { 
  key?: string,
  category: Category, 
  products: Product[],
  onProductClick: (id: string) => void | Promise<void>,
  wishlist: string[],
  onToggleWishlist: (id: string) => void | Promise<void>
}) {
  if (products.length === 0) return null;

  return (
    <section className="px-6">
      <div className="flex items-center justify-between mb-4">
        <h5 className="text-xl font-serif font-bold text-cream">{category.id === 'best-sellers' ? 'Best Sellers' : category.name}</h5>
        <button className="text-primary text-xs font-bold uppercase tracking-widest hover:underline">View All</button>
      </div>

      {category.layoutType === 'grid' && (
        <div className="grid grid-cols-2 gap-4">
          {products.map(p => (
            <ProductCard 
              key={p.id} 
              product={p} 
              onClick={() => onProductClick(p.id)}
              isWishlisted={wishlist.includes(p.id)}
              onToggleWishlist={() => onToggleWishlist(p.id)}
            />
          ))}
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
               <button 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  onToggleWishlist(p.id);
                }}
                className={`absolute top-6 right-6 p-3 bg-black/20 backdrop-blur-md rounded-full transition-colors z-10 ${wishlist.includes(p.id) ? 'text-red-500' : 'text-white hover:text-red-500'}`}
               >
                <Heart className={`w-5 h-5 ${wishlist.includes(p.id) ? 'fill-current' : ''}`} />
               </button>
               <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent flex flex-col justify-end p-8">
                  <div className="flex flex-wrap gap-2 mb-2">
                    {p.tags?.map((tag, idx) => (
                      <span key={idx} style={{ backgroundColor: tag.color + '20', color: tag.color, borderColor: tag.color + '40' }} className="px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-widest border">
                        {tag.text}
                      </span>
                    ))}
                  </div>
                  <h4 className="text-white font-bold text-xl mb-1">{p.name}</h4>
                  <p className="text-primary font-bold text-lg">{formatCurrency(p.price)}</p>
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
              <button 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  onToggleWishlist(p.id);
                }}
                className={`absolute top-6 right-6 p-2.5 bg-black/20 backdrop-blur-md rounded-full transition-colors z-10 ${wishlist.includes(p.id) ? 'text-red-500' : 'text-white hover:text-red-500'}`}
               >
                <Heart className={`w-4 h-4 ${wishlist.includes(p.id) ? 'fill-current' : ''}`} />
               </button>
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/20 to-transparent flex flex-col justify-center p-8">
                 <div className="flex flex-wrap gap-2 mb-2">
                    {p.tags?.map((tag, idx) => (
                      <span key={idx} style={{ backgroundColor: tag.color + '20', color: tag.color, borderColor: tag.color + '40' }} className="px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-widest border">
                        {tag.text}
                      </span>
                    ))}
                  </div>
                 <h4 className="text-white font-bold text-xl mb-1">{p.name}</h4>
                 <p className="text-primary font-bold text-lg">{formatCurrency(p.price)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function ProductCard({ product, onClick, isWishlisted, onToggleWishlist }: { key?: string; product: Product; onClick: () => void; isWishlisted: boolean; onToggleWishlist: () => void }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      onClick={onClick}
      className="flex flex-col group cursor-pointer"
    >
      <div className="relative aspect-[4/5] w-full rounded-[2.5rem] overflow-hidden mb-3 bg-surface/50 border border-white/5">
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
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {product.tags?.map((tag, idx) => (
            <span key={idx} style={{ backgroundColor: tag.color + '20', color: tag.color, borderColor: tag.color + '40' }} className="px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-widest border backdrop-blur-sm self-start">
              {tag.text}
            </span>
          ))}
        </div>
        <button 
          onClick={(e) => { 
            e.stopPropagation(); 
            onToggleWishlist();
          }}
          className={`absolute top-4 right-4 p-2 bg-background/40 backdrop-blur-md rounded-full transition-colors ${isWishlisted ? 'text-red-500' : 'text-white hover:text-red-500'}`}
        >
          <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-current' : ''}`} />
        </button>
      </div>
      <div className="px-2">
        <h6 className="text-cream text-base font-bold truncate mb-1 leading-tight">{product.name}</h6>
        <p className="text-primary font-bold text-lg">{formatCurrency(product.price)}</p>
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
