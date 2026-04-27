import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, ShoppingCart, User as UserIcon, Heart, Home, Grid, 
  Filter, LogOut, Settings, LayoutGrid, Star, Sun, Sunrise, Sunset, Moon, MapPin 
} from 'lucide-react';
import { UserProfile, Product, BannerConfig, Category, HomeSection, GlobalProductSettings } from '../types';
import { DatabaseService } from '../services/databaseService';
import { AuthService } from '../services/authService';
import { formatCurrency } from '../lib/format';
import { LocationPicker } from '../components/LocationPicker';
import { Shimmer, ProductShimmer, CategoryShimmer } from '../components/Shimmer';

export default function HomePage({ user: initialUser }: { user: UserProfile | null }) {
  const [user, setUser] = useState<UserProfile | null>(initialUser);
  const [products, setProducts] = useState<Product[]>([]);
  const [globalSettings, setGlobalSettings] = useState<GlobalProductSettings | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [homeSections, setHomeSections] = useState<HomeSection[]>([]);
  const [banner, setBanner] = useState<BannerConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [cartCount, setCartCount] = useState(0);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const navigate = useNavigate();

  const [hasPromptedLocation, setHasPromptedLocation] = useState(false);

  useEffect(() => {
    setUser(initialUser);
    if (initialUser && !initialUser.address && !hasPromptedLocation) {
      setShowLocationPicker(true);
      setHasPromptedLocation(true);
    }
  }, [initialUser, hasPromptedLocation]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: 'Good Morning', icon: <Sunrise className="w-5 h-5 text-yellow-400/80" /> };
    if (hour < 17) return { text: 'Good Afternoon', icon: <Sun className="w-5 h-5 text-orange-400/80" /> };
    if (hour < 21) return { text: 'Good Evening', icon: <Sunset className="w-5 h-5 text-primary/80" /> };
    return { text: 'Good Night', icon: <Moon className="w-5 h-5 text-blue-300/80" /> };
  };

  const greeting = getGreeting();

  useEffect(() => {
    async function load() {
      const [prodData, bannerData, catData, homeData, settingsData] = await Promise.all([
        DatabaseService.getProducts(),
        DatabaseService.getBannerConfig(),
        DatabaseService.getCategories(),
        DatabaseService.getHomeSections(),
        DatabaseService.getGlobalSettings()
      ]);
      setProducts(prodData);
      setBanner(bannerData);
      setCategories(catData);
      setHomeSections(homeData);
      setGlobalSettings(settingsData);

      if (user) {
        const [w, cartItems] = await Promise.all([
          DatabaseService.getWishlist(user.uid),
          DatabaseService.getCart(user.uid)
        ]);
        setWishlist(w);
        const total = cartItems.reduce((acc, item) => acc + item.quantity, 0);
        setCartCount(total);
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
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/90 backdrop-blur-sm px-4 pt-3 pb-2 flex items-center justify-between fix-glitch">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 overflow-hidden rounded-lg flex items-center justify-center bg-white/5">
            <img 
              src="https://i.ibb.co/vxKFtvqB/20241130-231344.png" 
              className="w-full h-full object-contain" 
              alt="Aurashka Logo" 
              loading="lazy"
            />
          </div>
          <h1 className="text-lg font-serif text-primary uppercase tracking-widest font-bold">Aurashka</h1>
        </div>
        <div className="flex items-center gap-1">
          {user && (
            <button 
              onClick={() => setShowLocationPicker(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-surface/50 border border-white/5 rounded-full mr-1 group transition-all hover:border-primary/30"
            >
              <MapPin className="w-3 h-3 text-primary" />
              <div className="flex flex-col items-start leading-none text-left">
                <span className="text-[7px] text-cream/40 uppercase tracking-[0.1em] font-bold">Deliver to</span>
                <span className="text-[10px] text-cream font-medium truncate max-w-[60px]">
                  {user.address ? `${user.address.city}, ${user.address.pincode}` : 'Select Location'}
                </span>
              </div>
            </button>
          )}
          <button 
            onClick={() => user ? navigate('/cart') : navigate('/login')}
            className="p-1.5 hover:bg-surface rounded-full relative"
          >
            <ShoppingCart className="w-5 h-5 text-primary" />
            {cartCount > 0 && (
              <span className="absolute top-0 right-0 bg-primary text-background text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border-2 border-background">
                {cartCount}
              </span>
            )}
          </button>
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

      {/* Location Picker Modal */}
      {user && (
        <LocationPicker 
          isOpen={showLocationPicker} 
          user={user} 
          onClose={() => setShowLocationPicker(false)}
          onSuccess={(updatedProfile) => {
            setUser(updatedProfile);
          }}
        />
      )}

      {/* Hero Welcome */}
      <section className="px-4 pt-1 pb-3 mb-1">
        <div className="flex items-center gap-2 mb-0.5">
          <h2 className="text-xs font-medium text-cream/40 uppercase tracking-[0.2em]">{greeting.text}</h2>
          {greeting.icon}
        </div>
        <h3 className="text-xl font-serif text-cream mb-4 capitalize font-bold">{user?.displayName?.split(' ')[0] || 'Explorer'}</h3>
        
        <div className="relative group">
          <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none">
            <Search className="w-3.5 h-3.5 text-cream/30" />
          </div>
          <input 
            type="text"
            onClick={() => navigate('/search')}
            readOnly
            placeholder="Search natural products..."
            className="w-full pl-9 pr-11 py-2.5 bg-surface/50 border border-white/5 rounded-xl focus:border-primary/50 transition-all outline-none text-cream text-xs cursor-pointer"
          />
          <button className="absolute inset-y-0 right-3.5 flex items-center text-primary">
            <div className="bg-primary/10 p-1.5 rounded-lg">
              <Filter className="w-4 h-4" />
            </div>
          </button>
        </div>
      </section>

      {/* Main Banner */}
      <section className="px-4 mb-5">
        <div className="relative h-48 w-full rounded-[24px] overflow-hidden group">
          <img 
            src={banner?.imageUrl || "https://images.unsplash.com/photo-1547721065-85669931cc43?auto=format&fit=crop&q=80&w=2070"} 
            alt="nature" 
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
            referrerPolicy="no-referrer"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/30 to-transparent flex flex-col justify-center p-6">
            <h4 className="text-2xl font-serif text-cream mb-2 max-w-[200px] leading-tight font-bold">
              {banner?.title || "Nature Knows Best"}
            </h4>
            <p className="text-cream/60 text-xs mb-4 max-w-[180px]">
              {banner?.subtitle || "Discover the power of botanical care"}
            </p>
            <button 
              onClick={handleBannerClick}
              className="w-fit px-6 py-2.5 bg-primary text-background font-bold rounded-xl text-[9px] hover:scale-105 transition-transform uppercase tracking-widest shadow-xl shadow-primary/20"
            >
              {banner?.buttonText || "Shop Now"}
            </button>
          </div>
        </div>
      </section>

      {/* Categories Chips */}
      <section className="px-4 mb-5 overflow-x-auto no-scrollbar">
        <div className="flex gap-4 pb-1">
          {loading ? (
            [...Array(6)].map((_, i) => <CategoryShimmer key={i} />)
          ) : (
            [...categories].sort((a, b) => (a.order || 0) - (b.order || 0)).map((cat) => (
              <button 
                key={cat.id}
                onClick={() => navigate(`/search?category=${encodeURIComponent(cat.name)}`)}
                className="flex flex-col items-center gap-2 shrink-0 group"
              >
                <div 
                  className="bg-surface rounded-full flex items-center justify-center overflow-hidden border border-white/5 transition-all group-hover:scale-110 group-hover:border-primary/30"
                  style={{ 
                    width: cat.imageSize ? `${parseInt(cat.imageSize) * 0.8}px` : '40px', 
                    height: cat.imageSize ? `${parseInt(cat.imageSize) * 0.8}px` : '40px' 
                  }}
                >
                  {cat.imageUrl ? (
                    <div className="w-full h-full flex items-center justify-center p-1">
                      <img 
                        src={cat.imageUrl} 
                        className="max-w-full max-h-full object-contain" 
                        alt={cat.name} 
                        loading="lazy"
                      />
                    </div>
                  ) : (
                    <LayoutGrid className="text-cream/10" style={{ width: '50%', height: '50%' }} />
                  )}
                </div>
                <span 
                  className="font-bold uppercase tracking-widest whitespace-nowrap"
                  style={{ 
                    fontSize: cat.textSize ? `${parseInt(cat.textSize) * 0.9}px` : '8px',
                    color: cat.textColor || 'rgba(255, 253, 237, 0.4)'
                  }}
                >
                  {cat.name}
                </span>
              </button>
            ))
          )}
        </div>
      </section>

      {/* Dynamic Sections */}
      <div className="space-y-6">
        {loading ? (
          <div className="px-4 space-y-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-4">
                <Shimmer width="150px" height="24px" />
                <div className="flex gap-3 overflow-hidden">
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="min-w-[140px]">
                      <ProductShimmer />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : homeSections.length > 0 ? (
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
                globalSettings={globalSettings}
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
              globalSettings={globalSettings}
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
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-background/90 backdrop-blur-md border-t border-white/5 px-6 py-1.5 flex items-center justify-between mx-4 mb-2 rounded-[24px] shadow-2xl fix-glitch">
        <NavIcon icon={<Home className="w-5 h-5" />} active />
        <NavIcon icon={<Grid className="w-5 h-5" />} onClick={() => navigate('/categories')} />
        <NavIcon icon={<Heart className="w-5 h-5" />} onClick={() => navigate('/wishlist')} />
        <NavIcon icon={<UserIcon className="w-5 h-5" />} onClick={() => navigate('/profile')} />
      </nav>
    </div>
  );
}

function ManualSection({ 
  section, 
  products, 
  globalSettings,
  onProductClick,
  wishlist,
  onToggleWishlist
}: { 
  key?: string,
  section: HomeSection, 
  products: Product[],
  globalSettings: GlobalProductSettings | null,
  onProductClick: (id: string) => void | Promise<void>,
  wishlist: string[],
  onToggleWishlist: (id: string) => void | Promise<void>
}) {
  if (products.length === 0) return null;

  if (section.layoutType === 'reel') {
    return (
      <section className="px-4 relative">
        <div className="flex justify-between items-end mb-4">
          <div>
            <h3 className="text-lg font-serif text-cream font-bold leading-tight">{section.title}</h3>
            <div className="h-1 w-10 bg-primary mt-1.5 rounded-full" />
          </div>
        </div>
        
        <div className="flex gap-3 overflow-x-auto pb-3 no-scrollbar -mx-4 px-4">
          {products.map((p) => {
            const discount = p.discountPercentage ?? globalSettings?.defaultDiscountPercentage ?? 0;
            const hasDiscount = discount > 0;
            const finalPrice = hasDiscount ? p.price * (1 - discount / 100) : p.price;

            return (
              <motion.div 
                key={p.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => onProductClick(p.id)}
                className="relative min-w-[140px] h-60 rounded-[24px] overflow-hidden group border border-white/5"
              >
                <img 
                  src={p.imageUrl} 
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                  alt={p.name}
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                
                {hasDiscount && (
                  <div className="absolute top-3 left-3 px-1.5 py-0.5 bg-red-500 text-white rounded-lg text-[7px] font-bold uppercase tracking-widest z-10 shadow-lg">
                    {discount}% OFF
                  </div>
                )}

                <button 
                  onClick={(e) => { e.stopPropagation(); onToggleWishlist(p.id); }}
                  className={`absolute top-3 right-3 p-1.5 bg-black/20 backdrop-blur-md rounded-full transition-colors z-10 ${wishlist.includes(p.id) ? 'text-red-500' : 'text-white hover:text-red-500'}`}
                >
                  <Heart className={`w-3 h-3 ${wishlist.includes(p.id) ? 'fill-current' : ''}`} />
                </button>

                <div className="absolute bottom-0 left-0 right-0 p-3">
                    <div className="flex gap-0.5 mb-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-1.5 h-1.5 ${i < p.rating ? 'text-primary fill-current' : 'text-cream/10'}`} />
                      ))}
                    </div>
                    <h4 className="text-white font-bold text-xs mb-0.5 line-clamp-1">{p.name}</h4>
                    <div className="flex items-center gap-2">
                       <p className="text-primary font-bold text-sm">{formatCurrency(finalPrice)}</p>
                       {hasDiscount && (
                         <p className="text-[9px] text-white/40 line-through">{formatCurrency(p.price)}</p>
                       )}
                    </div>
                 </div>
              </motion.div>
            );
          })}
        </div>
      </section>
    );
  }

  if (section.layoutType === 'banner') {
    return (
      <section className="px-4">
        <div className="flex justify-between items-end mb-4">
          <div>
            <h3 className="text-lg font-serif text-cream font-bold leading-tight">{section.title}</h3>
            <div className="h-1 w-10 bg-primary mt-1.5 rounded-full" />
          </div>
        </div>
        <div className="space-y-3">
          {products.map((p) => {
             const discount = p.discountPercentage ?? globalSettings?.defaultDiscountPercentage ?? 0;
             const hasDiscount = discount > 0;
             const finalPrice = hasDiscount ? p.price * (1 - discount / 100) : p.price;

             return (
               <div 
                 key={p.id}
                 onClick={() => onProductClick(p.id)}
                 className="relative h-40 w-full rounded-[24px] overflow-hidden group border border-white/5"
               >
                 <img 
                   src={p.imageUrl} 
                   className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
                   alt={p.name}
                   referrerPolicy="no-referrer"
                   loading="lazy"
                 />
                 <div className="absolute inset-0 bg-gradient-to-r from-black via-black/20 to-transparent p-6 flex flex-col justify-center">
                    <div className="flex gap-1 mb-1.5">
                       {[...Array(5)].map((_, i) => (
                         <Star key={i} className={`w-2.5 h-2.5 ${i < p.rating ? 'text-primary fill-current' : 'text-cream/10'}`} />
                       ))}
                     </div>
                    <h4 className="text-white font-bold text-lg mb-0.5">{p.name}</h4>
                    <div className="flex items-center gap-3">
                      <p className="text-primary font-bold text-base">{formatCurrency(finalPrice)}</p>
                      {hasDiscount && (
                        <div className="flex items-center gap-2">
                           <p className="text-white/40 font-medium text-sm line-through">{formatCurrency(p.price)}</p>
                           <span className="px-1.5 py-0.5 bg-red-500 text-white rounded-lg text-[9px] font-bold uppercase tracking-widest shadow-lg">
                             {discount}% OFF
                           </span>
                        </div>
                      )}
                    </div>
                 </div>
                 <button 
                   onClick={(e) => { e.stopPropagation(); onToggleWishlist(p.id); }}
                   className={`absolute top-4 right-4 p-2 bg-black/20 backdrop-blur-md rounded-full transition-colors z-10 ${wishlist.includes(p.id) ? 'text-red-500' : 'text-white hover:text-red-500'}`}
                 >
                   <Heart className={`w-3.5 h-3.5 ${wishlist.includes(p.id) ? 'fill-current' : ''}`} />
                 </button>
               </div>
             );
          })}
        </div>
      </section>
    );
  }

  return (
    <section className="px-4">
      <div className="flex justify-between items-end mb-4">
        <div>
          <h3 className="text-lg font-serif text-cream font-bold leading-tight">{section.title}</h3>
          <div className="h-1 w-10 bg-primary mt-1.5 rounded-full" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} globalSettings={globalSettings} onClick={() => onProductClick(p.id)} isWishlisted={wishlist.includes(p.id)} onToggleWishlist={() => onToggleWishlist(p.id)} />
        ))}
      </div>
    </section>
  );
}

function CategorySection({ 
  category, 
  products, 
  globalSettings,
  onProductClick,
  wishlist,
  onToggleWishlist
}: { 
  key?: string,
  category: Category, 
  products: Product[],
  globalSettings: GlobalProductSettings | null,
  onProductClick: (id: string) => void | Promise<void>,
  wishlist: string[],
  onToggleWishlist: (id: string) => void | Promise<void>
}) {
  if (products.length === 0) return null;

  return (
    <section className="px-4">
      <div className="flex items-center justify-between mb-3">
        <h5 className="text-lg font-serif font-bold text-cream">{category.id === 'best-sellers' ? 'Best Sellers' : category.name}</h5>
        <button className="text-primary text-[10px] font-bold uppercase tracking-widest hover:underline">View All</button>
      </div>

      {category.layoutType === 'grid' && (
        <div className="grid grid-cols-2 gap-3">
          {products.map(p => (
            <ProductCard 
              key={p.id} 
              product={p} 
              globalSettings={globalSettings}
              onClick={() => onProductClick(p.id)}
              isWishlisted={wishlist.includes(p.id)}
              onToggleWishlist={() => onToggleWishlist(p.id)}
            />
          ))}
        </div>
      )}

      {category.layoutType === 'reel' && (
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-3">
          {products.map(p => {
             const discount = p.discountPercentage ?? globalSettings?.defaultDiscountPercentage ?? 0;
             const hasDiscount = discount > 0;
             const finalPrice = hasDiscount ? p.price * (1 - discount / 100) : p.price;

             return (
               <motion.div 
                 key={p.id}
                 whileHover={{ scale: 1.02 }}
                 onClick={() => onProductClick(p.id)}
                 className="relative w-60 h-[380px] rounded-[32px] overflow-hidden shrink-0 group cursor-pointer border border-white/10 shadow-2xl"
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
                      <img src={p.imageUrl} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" loading="lazy" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-surface">
                        <Grid className="w-6 h-6 text-cream/10" />
                      </div>
                    )
                  )}
                  {hasDiscount && (
                    <div className="absolute top-4 left-4 px-2 py-1 bg-red-500 text-white rounded-xl text-[9px] font-bold uppercase tracking-widest z-10 shadow-lg">
                      {discount}% OFF
                    </div>
                  )}
                  <button 
                   onClick={(e) => { 
                     e.stopPropagation(); 
                     onToggleWishlist(p.id);
                   }}
                   className={`absolute top-4 right-4 p-2 bg-black/20 backdrop-blur-md rounded-full transition-colors z-10 ${wishlist.includes(p.id) ? 'text-red-500' : 'text-white hover:text-red-500'}`}
                  >
                   <Heart className={`w-4 h-4 ${wishlist.includes(p.id) ? 'fill-current' : ''}`} />
                  </button>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent flex flex-col justify-end p-6">
                     <div className="flex flex-wrap gap-1.5 mb-1.5">
                       {p.tags?.map((tag, idx) => (
                         <span key={idx} style={{ backgroundColor: tag.color + '20', color: tag.color, borderColor: tag.color + '40' }} className="px-1.5 py-0.5 rounded-full text-[7px] font-bold uppercase tracking-widest border">
                           {tag.text}
                         </span>
                       ))}
                     </div>
                     <h4 className="text-white font-bold text-lg mb-0.5">{p.name}</h4>
                     <div className="flex items-center gap-3">
                       <p className="text-primary font-bold text-base">{formatCurrency(finalPrice)}</p>
                       {hasDiscount && (
                         <p className="text-white/40 font-medium text-sm line-through">{formatCurrency(p.price)}</p>
                       )}
                     </div>
                  </div>
               </motion.div>
             );
          })}
        </div>
      )}

      {category.layoutType === 'banner' && (
        <div className="space-y-3">
          {products.map(p => {
             const discount = p.discountPercentage ?? globalSettings?.defaultDiscountPercentage ?? 0;
             const hasDiscount = discount > 0;
             const finalPrice = hasDiscount ? p.price * (1 - discount / 100) : p.price;

             return (
               <div 
                 key={p.id} 
                 onClick={() => onProductClick(p.id)}
                 className="relative h-36 rounded-[24px] overflow-hidden group cursor-pointer border border-white/5"
               >
                 {p.imageUrl ? (
                   <img src={p.imageUrl} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" loading="lazy" />
                 ) : (
                   <div className="absolute inset-0 bg-surface flex items-center justify-center">
                      <Grid className="w-6 h-6 text-cream/10" />
                   </div>
                 )}
                 {hasDiscount && (
                    <div className="absolute top-4 left-4 px-2 py-1 bg-red-500 text-white rounded-xl text-[9px] font-bold uppercase tracking-widest z-10 shadow-lg">
                      {discount}% OFF
                    </div>
                  )}
                 <button 
                   onClick={(e) => { 
                     e.stopPropagation(); 
                     onToggleWishlist(p.id);
                   }}
                   className={`absolute top-4 right-4 p-2 bg-black/20 backdrop-blur-md rounded-full transition-colors z-10 ${wishlist.includes(p.id) ? 'text-red-500' : 'text-white hover:text-red-500'}`}
                  >
                   <Heart className={`w-3.5 h-3.5 ${wishlist.includes(p.id) ? 'fill-current' : ''}`} />
                  </button>
                 <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/20 to-transparent flex flex-col justify-center p-6">
                    <div className="flex flex-wrap gap-1.5 mb-1.5">
                       {p.tags?.map((tag, idx) => (
                         <span key={idx} style={{ backgroundColor: tag.color + '20', color: tag.color, borderColor: tag.color + '40' }} className="px-1.5 py-0.5 rounded-full text-[7px] font-bold uppercase tracking-widest border">
                           {tag.text}
                         </span>
                       ))}
                     </div>
                    <h4 className="text-white font-bold text-lg mb-0.5">{p.name}</h4>
                    <div className="flex items-center gap-3">
                       <p className="text-primary font-bold text-base">{formatCurrency(finalPrice)}</p>
                       {hasDiscount && (
                         <p className="text-white/40 font-medium text-sm line-through">{formatCurrency(p.price)}</p>
                       )}
                    </div>
                 </div>
               </div>
             );
          })}
        </div>
      )}
    </section>
  );
}

function ProductCard({ product, globalSettings, onClick, isWishlisted, onToggleWishlist }: { key?: string; product: Product; globalSettings: GlobalProductSettings | null; onClick: () => void; isWishlisted: boolean; onToggleWishlist: () => void }) {
  const discount = product.discountPercentage ?? globalSettings?.defaultDiscountPercentage ?? 0;
  const hasDiscount = discount > 0;
  const finalPrice = hasDiscount ? product.price * (1 - discount / 100) : product.price;

  return (
    <motion.div 
      whileHover={{ y: -3 }}
      onClick={onClick}
      className="flex flex-col group cursor-pointer"
    >
      <div 
        className="relative aspect-[4/5] w-full overflow-hidden mb-2 bg-surface/50 border border-white/5"
        style={{ borderRadius: `${product.imageCurve ?? 24}px` }}
      >
        {product.imageUrl ? (
          <img 
            src={product.imageUrl} 
            alt={product.name} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            referrerPolicy="no-referrer"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <LayoutGrid className="w-6 h-6 text-cream/10" />
          </div>
        )}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
          {hasDiscount && (
            <span className="px-1.5 py-0.5 rounded-full text-[7px] font-bold uppercase tracking-widest bg-red-500 text-white shadow-lg backdrop-blur-sm self-start">
              {discount}% OFF
            </span>
          )}
          {product.tags?.map((tag, idx) => (
            <span key={idx} style={{ backgroundColor: tag.color + '20', color: tag.color, borderColor: tag.color + '40' }} className="px-1.5 py-0.5 rounded-full text-[7px] font-bold uppercase tracking-widest border backdrop-blur-sm self-start">
              {tag.text}
            </span>
          ))}
        </div>
        <button 
          onClick={(e) => { 
            e.stopPropagation(); 
            onToggleWishlist();
          }}
          className={`absolute top-2.5 right-2.5 p-1.5 bg-background/40 backdrop-blur-md rounded-full transition-colors ${isWishlisted ? 'text-red-500' : 'text-white hover:text-red-500'}`}
        >
          <Heart className={`w-3 h-3 ${isWishlisted ? 'fill-current' : ''}`} />
        </button>
      </div>
      <div className="px-1">
        <h6 className="text-cream text-sm font-bold truncate mb-0.5 leading-tight">{product.name}</h6>
        <div className="flex items-center gap-2">
          <p className="text-primary font-bold text-base">{formatCurrency(finalPrice)}</p>
          {hasDiscount && (
            <p className="text-[10px] text-cream/20 line-through">{formatCurrency(product.price)}</p>
          )}
        </div>
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
