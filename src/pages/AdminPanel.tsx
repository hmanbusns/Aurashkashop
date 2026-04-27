import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, Plus, Edit2, Trash2, X, Check, Package, DollarSign, 
  Tag, Star, List, LayoutGrid, Settings, Save, AlertCircle, Image as ImageIcon, Link as LinkIcon,
  ChevronLeft, ChevronRight, Play, Bold, Italic, Type, Palette, Minus,
  Maximize2, Minimize2, Code, Eye, Image as ImageIcon2
} from 'lucide-react';
import { Product, BannerConfig, Category, Review, HomeSection, GlobalProductSettings } from '../types';
import { DatabaseService } from '../services/databaseService';
import ImageUploader from '../components/ImageUploader';
import { formatCurrency } from '../lib/format';

export default function AdminPanel() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);

  const [isDescFullscreen, setIsDescFullscreen] = useState(false);
  const [descViewMode, setDescViewMode] = useState<'visual' | 'code'>('visual');
  const visualEditorRef = useRef<HTMLDivElement>(null);

  // Use an effect to sync the visual editor's content ONLY when needed
  // to prevent cursor jumping
  useEffect(() => {
    if (descViewMode === 'visual' && visualEditorRef.current) {
      if (visualEditorRef.current.innerHTML !== formData.description) {
        visualEditorRef.current.innerHTML = formData.description;
      }
    }
  }, [descViewMode]); // Run when switching modes

  const syncCodeFromVisual = () => {
    if (visualEditorRef.current) {
      const html = visualEditorRef.current.innerHTML;
      if (html !== formData.description) {
        setFormData(prev => ({ ...prev, description: html }));
      }
    }
  };

  const execCmd = (command: string, value: string = '') => {
    if (descViewMode === 'visual') {
      visualEditorRef.current?.focus();
      document.execCommand(command, false, value);
      syncCodeFromVisual();
    } else if (descViewMode === 'code') {
      insertTag(command === 'bold' ? 'b' : command === 'italic' ? 'i' : 'span');
    }
  };

  const insertTag = (tag: string, endTag?: string, color?: string, size?: string, customHtml?: string) => {
    if (!descriptionRef.current && descViewMode === 'code') return;
    
    let text = formData.description;
    let inserted = '';
    const start = descriptionRef.current?.selectionStart || 0;
    const end = descriptionRef.current?.selectionEnd || 0;
    const selected = text.substring(start, end);

    if (customHtml) {
      inserted = customHtml;
    } else if (tag === 'hr') {
      inserted = '\n<hr class="border-white/10 my-4" />\n';
    } else if (color) {
      inserted = `<span style="color: ${color}">${selected || 'selected text'}</span>`;
    } else if (size) {
      inserted = `<span style="font-size: ${size}">${selected || 'selected text'}</span>`;
    } else {
      inserted = `<${tag}>${selected || 'selected text'}</${endTag || tag}>`;
    }

    if (descViewMode === 'code' && descriptionRef.current) {
      const newText = text.substring(0, start) + inserted + text.substring(end);
      setFormData({ ...formData, description: newText });
    } else {
      setFormData({ ...formData, description: text + inserted });
    }
  };
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'products' | 'hero' | 'categories' | 'home' | 'settings'>('products');
  const navigate = useNavigate();

  // Global Settings State
  const [globalSettings, setGlobalSettings] = useState<GlobalProductSettings>({
    defaultTaxRate: 0,
    defaultShippingCharge: 0,
    defaultDiscountPercentage: 0,
    defaultCouponCode: ''
  });

  // Home Sections State
  const [homeSections, setHomeSections] = useState<HomeSection[]>([]);
  const [isAddingSection, setIsAddingSection] = useState(false);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [sectionForm, setSectionForm] = useState<Omit<HomeSection, 'id'>>({
    title: '',
    layoutType: 'grid',
    dataSource: 'category',
    categoryId: '',
    productIds: [],
    order: 0,
  });

  // Categories State
  const [categories, setCategories] = useState<Category[]>([]);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingReviewsProductId, setEditingReviewsProductId] = useState<string | null>(null);
  const [productReviews, setProductReviews] = useState<Review[]>([]);
  const [isAddingReview, setIsAddingReview] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [reviewForm, setReviewForm] = useState<Omit<Review, 'id' | 'createdAt'>>({
    userName: '',
    rating: 5,
    comment: '',
    date: new Date().toLocaleDateString('en-IN')
  });

  // Category Form State
  const [categoryForm, setCategoryForm] = useState<Omit<Category, 'id'>>({
    name: '',
    imageUrl: '',
    videoUrl: '',
    layoutType: 'grid',
    order: 0,
    imageSize: 48,
    textSize: 12,
    textColor: '#A4B494'
  });

  // Banner State
  const [bannerForm, setBannerForm] = useState<BannerConfig>({
    imageUrl: '',
    title: 'Nature Knows Best',
    subtitle: 'Discover the power of botanical care',
    buttonText: 'Shop Now',
    externalLink: ''
  });

  // Product Form State
  const [formData, setFormData] = useState<Omit<Product, 'id' | 'createdAt'>>({
    name: '',
    description: '',
    price: 0,
    rating: 4.5,
    reviewsCount: 120,
    imageUrl: '',
    additionalImages: [],
    galleryAutoplay: false,
    category: 'Skincare',
    categories: [],
    ingredients: [],
    features: ['Organic', 'Vegan'],
    size: '50ml, 100ml, 150ml',
    order: 0,
    imageCurve: 40,
    tags: [],
    taxRate: undefined,
    shippingCharge: undefined,
    discountPercentage: undefined,
    couponCode: ''
  });

  const [newImageLink, setNewImageLink] = useState('');
  const [newIngredient, setNewIngredient] = useState('');
  const [newFeature, setNewFeature] = useState('');
  const [newTagText, setNewTagText] = useState('');
  const [newTagColor, setNewTagColor] = useState('#A4B494');
  const [newCustomKey, setNewCustomKey] = useState('');
  const [newCustomValue, setNewCustomValue] = useState('');

  useEffect(() => {
    loadProducts();
    loadBanner();
    loadCategories();
    loadHomeSections();
    loadGlobalSettings();
  }, []);

  async function loadGlobalSettings() {
    const data = await DatabaseService.getGlobalSettings();
    setGlobalSettings(data);
  }

  async function loadProducts() {
    const data = await DatabaseService.getProducts();
    setProducts(data);
    setLoading(false);
  }

  async function loadHomeSections() {
    const data = await DatabaseService.getHomeSections();
    setHomeSections(data);
  }

  async function loadCategories() {
    const data = await DatabaseService.getCategories();
    setCategories(data);
  }

  async function loadBanner() {
    const data = await DatabaseService.getBannerConfig();
    if (data) setBannerForm(data);
  }

  const handleBannerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await DatabaseService.setBannerConfig(bannerForm);
      alert('Banner configuration saved!');
    } catch (err) {
      console.error(err);
    }
  };

  const addAdditionalImage = () => {
    if (newImageLink) {
      let finalLink = newImageLink;
      
      // YouTube transformation helper
      if (finalLink.includes('youtube.com/watch?v=') || finalLink.includes('youtu.be/')) {
        const videoId = finalLink.split('v=')[1]?.split('&')[0] || finalLink.split('/').pop()?.split('?')[0];
        if (videoId) {
          finalLink = `https://www.youtube.com/embed/${videoId}`;
        }
      }

      setFormData({
        ...formData,
        additionalImages: [...(formData.additionalImages || []), finalLink]
      });
      setNewImageLink('');
    }
  };

  const removeAdditionalImage = (index: number) => {
    const updated = [...(formData.additionalImages || [])];
    updated.splice(index, 1);
    setFormData({ ...formData, additionalImages: updated });
  };

  const handleEntityAdd = (type: 'ingredients' | 'features') => {
    const val = type === 'ingredients' ? newIngredient : newFeature;
    if (val) {
      setFormData({
        ...formData,
        [type]: [...(formData[type] || []), val]
      });
      if (type === 'ingredients') setNewIngredient('');
      else setNewFeature('');
    }
  };

  const handleEntityRemove = (type: 'ingredients' | 'features', index: number) => {
    const updated = [...(formData[type] || [])];
    updated.splice(index, 1);
    setFormData({ ...formData, [type]: updated });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.imageUrl) {
      alert('Please upload a main image or provide a link');
      return;
    }

    try {
      if (editingId) {
        await DatabaseService.updateProduct(editingId, formData);
      } else {
        await DatabaseService.addProduct(formData);
      }
      resetForm();
      loadProducts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      await DatabaseService.deleteProduct(id);
      loadProducts();
    }
  };

  const handleEdit = (product: Product) => {
    setFormData({
      ...product,
      price: product.price ?? 0,
      rating: product.rating ?? 0,
      reviewsCount: product.reviewsCount ?? 0,
      additionalImages: product.additionalImages || [],
      ingredients: product.ingredients || [],
      features: product.features || [],
      size: product.size || '50ml, 100ml, 150ml',
      order: product.order || 0,
      imageCurve: product.imageCurve ?? 40,
      tags: product.tags || [],
      customFields: product.customFields || {},
      galleryAutoplay: product.galleryAutoplay || false,
      categories: Array.isArray(product.categories) ? product.categories : (product.category ? [product.category] : []),
      taxRate: product.taxRate,
      shippingCharge: product.shippingCharge,
      discountPercentage: product.discountPercentage,
      couponCode: product.couponCode
    });
    setEditingId(product.id);
    setIsAdding(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: 0,
      rating: 4.5,
      reviewsCount: 120,
      imageUrl: '',
      additionalImages: [],
      galleryAutoplay: false,
      category: categories[0]?.name || 'Skincare',
      categories: [categories[0]?.name].filter(Boolean) as string[],
      ingredients: [],
      features: ['Organic', 'Vegan'],
      size: '50ml, 100ml, 150ml',
      order: products.length,
      imageCurve: 40,
      tags: [],
      customFields: {},
      taxRate: undefined,
      shippingCharge: undefined,
      discountPercentage: undefined,
      couponCode: ''
    });
    setEditingId(null);
    setIsAdding(false);
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await DatabaseService.saveCategory({ ...categoryForm, id: editingCategoryId || undefined });
      setIsAddingCategory(false);
      setEditingCategoryId(null);
      setCategoryForm({ name: '', imageUrl: '', videoUrl: '', layoutType: 'grid', order: categories.length, imageSize: 48, textSize: 12, textColor: '#A4B494' });
      loadCategories();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCategoryEdit = (cat: Category) => {
    setCategoryForm({
      ...cat,
      order: cat.order ?? 0,
      imageSize: cat.imageSize || 48,
      textSize: cat.textSize || 12,
      textColor: cat.textColor || '#A4B494'
    });
    setEditingCategoryId(cat.id);
    setIsAddingCategory(true);
  };

  const handleCategoryDelete = async (id: string) => {
    if (confirm('Delete this category?')) {
      await DatabaseService.deleteCategory(id);
      loadCategories();
    }
  };

  const loadReviews = async (productId: string) => {
    const data = await DatabaseService.getReviews(productId);
    setProductReviews(data);
    setEditingReviewsProductId(productId);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReviewsProductId) return;
    try {
      if (editingReviewId) {
        await DatabaseService.updateReview(editingReviewsProductId, editingReviewId, reviewForm);
      } else {
        await DatabaseService.addReview(editingReviewsProductId, reviewForm);
      }
      setReviewForm({ userName: '', rating: 5, comment: '', date: new Date().toLocaleDateString('en-IN') });
      setIsAddingReview(false);
      setEditingReviewId(null);
      loadReviews(editingReviewsProductId);
    } catch (err) {
      console.error(err);
    }
  };

  const handleReviewDelete = async (reviewId: string) => {
    if (editingReviewsProductId && confirm('Delete this review?')) {
      await DatabaseService.deleteReview(editingReviewsProductId, reviewId);
      loadReviews(editingReviewsProductId);
    }
  };

  const handleReviewEdit = (review: Review) => {
    setReviewForm({
      userName: review.userName,
      rating: review.rating,
      comment: review.comment,
      date: review.date
    });
    setEditingReviewId(review.id);
    setIsAddingReview(true);
  };

  const handleSectionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await DatabaseService.saveHomeSection({ ...sectionForm, id: editingSectionId || undefined });
      setIsAddingSection(false);
      setEditingSectionId(null);
      setSectionForm({ title: '', layoutType: 'grid', dataSource: 'category', order: homeSections.length });
      loadHomeSections();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSectionEdit = (section: HomeSection) => {
    setSectionForm({
      title: section.title,
      layoutType: section.layoutType,
      dataSource: section.dataSource,
      categoryId: section.categoryId || '',
      productIds: section.productIds || [],
      order: section.order ?? 0,
    });
    setEditingSectionId(section.id);
    setIsAddingSection(true);
  };

  const handleSectionDelete = async (id: string) => {
    if (confirm('Delete this section?')) {
      await DatabaseService.deleteHomeSection(id);
      loadHomeSections();
    }
  };

  const addTag = () => {
    if (newTagText) {
      setFormData({
        ...formData,
        tags: [...(formData.tags || []), { text: newTagText, color: newTagColor }]
      });
      setNewTagText('');
    }
  };

  const removeTag = (index: number) => {
    const updated = [...(formData.tags || [])];
    updated.splice(index, 1);
    setFormData({ ...formData, tags: updated });
  };
  const addCustomField = () => {
    if (newCustomKey && newCustomValue) {
      setFormData({
        ...formData,
        customFields: {
          ...(formData.customFields || {}),
          [newCustomKey]: newCustomValue
        }
      });
      setNewCustomKey('');
      setNewCustomValue('');
    }
  };

  const removeCustomField = (key: string) => {
    const updated = { ...(formData.customFields || {}) };
    delete updated[key];
    setFormData({ ...formData, customFields: updated });
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 pb-24">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center justify-between w-full sm:w-auto">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/home')}
              className="p-2.5 bg-surface rounded-2xl hover:bg-white/10 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-serif font-bold text-cream">Admin Panel</h1>
              <p className="text-[10px] text-primary font-bold uppercase tracking-widest leading-none">Secret Dashboard</p>
            </div>
          </div>
          
          <div className="sm:hidden">
            {!isAdding && !isAddingCategory && (activeTab === 'products' || activeTab === 'categories') && (
              <button 
                onClick={() => activeTab === 'products' ? setIsAdding(true) : setIsAddingCategory(true)}
                className="bg-primary p-3 rounded-xl text-background shadow-lg shadow-primary/20 flex items-center justify-center"
              >
                <Plus className="w-6 h-6" />
              </button>
            )}
          </div>
        </div>
        
        <div className="flex bg-surface rounded-2xl p-1 shrink-0 overflow-x-auto no-scrollbar scroll-smooth">
          <button 
            onClick={() => setActiveTab('products')}
            className={`flex-1 px-4 sm:px-5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${activeTab === 'products' ? 'bg-primary text-background' : 'text-cream/30 hover:text-cream/60'}`}
          >
            Products
          </button>
          <button 
            onClick={() => setActiveTab('hero')}
            className={`flex-1 px-4 sm:px-5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${activeTab === 'hero' ? 'bg-primary text-background' : 'text-cream/30 hover:text-cream/60'}`}
          >
            Banner
          </button>
          <button 
            onClick={() => setActiveTab('categories')}
            className={`flex-1 px-4 sm:px-5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${activeTab === 'categories' ? 'bg-primary text-background' : 'text-cream/30 hover:text-cream/60'}`}
          >
            Categories
          </button>
          <button 
            onClick={() => setActiveTab('home')}
            className={`flex-1 px-4 sm:px-5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${activeTab === 'home' ? 'bg-primary text-background' : 'text-cream/30 hover:text-cream/60'}`}
          >
            Home Layout
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`flex-1 px-4 sm:px-5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${activeTab === 'settings' ? 'bg-primary text-background' : 'text-cream/30 hover:text-cream/60'}`}
          >
            Product Settings
          </button>
        </div>

        <div className="hidden sm:block">
          {!isAdding && !isAddingCategory && !isAddingSection && (activeTab === 'products' || activeTab === 'categories' || activeTab === 'home') && (
            <button 
              onClick={() => {
                if (activeTab === 'products') setIsAdding(true);
                else if (activeTab === 'categories') setIsAddingCategory(true);
                else setIsAddingSection(true);
              }}
              className="bg-primary px-6 py-3 rounded-2xl text-background hover:scale-105 transition-all shadow-xl shadow-primary/20 flex items-center gap-2 font-bold text-sm"
            >
              <Plus className="w-5 h-5" />
              {activeTab === 'products' ? 'Add Product' : activeTab === 'categories' ? 'Add Category' : 'Add Home Section'}
            </button>
          )}
        </div>
      </header>

      {/* Mobile Add Button */}
      {!isAdding && !isAddingCategory && !isAddingSection && (activeTab === 'products' || activeTab === 'categories' || activeTab === 'home') && (
        <div className="sm:hidden mb-6">
          <button 
            onClick={() => {
              if (activeTab === 'products') setIsAdding(true);
              else if (activeTab === 'categories') setIsAddingCategory(true);
              else setIsAddingSection(true);
            }}
            className="w-full bg-primary py-4 rounded-2xl text-background flex items-center justify-center gap-2 font-bold shadow-lg shadow-primary/10"
          >
            <Plus className="w-5 h-5" />
            {activeTab === 'products' ? 'Add Product' : activeTab === 'categories' ? 'Add Category' : 'Add Home Section'}
          </button>
        </div>
      )}

      <AnimatePresence>
        {isAdding && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-surface border border-white/5 rounded-[24px] sm:rounded-[32px] p-4 sm:p-6 mb-6 shadow-2xl relative"
          >
            {categories.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center space-y-6">
                <AlertCircle className="w-16 h-16 text-yellow-500/50" />
                <div>
                   <h3 className="text-xl font-bold text-cream mb-1">No Categories Found</h3>
                   <p className="text-cream/40 text-sm max-w-xs mx-auto">You must create at least one category before you can add products.</p>
                </div>
                <button 
                  onClick={() => { resetForm(); setActiveTab('categories'); setIsAddingCategory(true); }}
                  className="bg-primary text-background px-8 py-3 rounded-2xl font-bold hover:scale-105 transition-all"
                >
                  Create Your First Category
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-primary">{editingId ? 'Edit Product' : 'Add New Product'}</h2>
                  <button onClick={resetForm} className="p-2 text-cream/40 hover:text-white transition-colors">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <label className="block text-xs font-bold text-cream/40 uppercase tracking-widest mb-3">Main Image</label>
                  <ImageUploader 
                    onImageSelected={(url) => setFormData({ ...formData, imageUrl: url })} 
                    currentImage={formData.imageUrl}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-cream/40 uppercase tracking-widest mb-3">Media Gallery (Images & Video Links)</label>
                  <div className="flex items-center gap-2 mb-3">
                    <button 
                      type="button"
                      onClick={() => setFormData({...formData, galleryAutoplay: !formData.galleryAutoplay})}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase tracking-widest transition-all ${
                        formData.galleryAutoplay 
                          ? 'bg-primary/20 border-primary text-primary' 
                          : 'bg-white/5 border-white/10 text-cream/40'
                      }`}
                    >
                      <Play className="w-3 h-3" />
                      Autoplay {formData.galleryAutoplay ? 'ON' : 'OFF'}
                    </button>
                    <p className="text-[9px] text-cream/20 font-bold uppercase tracking-widest ml-1">Tip: Paste a YouTube link or direct .mp4 link</p>
                  </div>
                  <div className="flex gap-2 mb-4">
                    <input 
                      type="text" 
                      placeholder="Paste link..."
                      value={newImageLink}
                      onChange={(e) => setNewImageLink(e.target.value)}
                      className="flex-1 bg-background border border-white/5 rounded-xl px-4 text-cream outline-none focus:border-primary/50"
                    />
                    <button 
                      type="button"
                      onClick={addAdditionalImage}
                      className="p-3 bg-primary text-background rounded-xl hover:scale-105 transition-transform"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {formData.additionalImages?.map((img, idx) => {
                      const isVideo = img.includes('youtube.com/embed') || img.toLowerCase().endsWith('.mp4');
                      return (
                        <div key={idx} className="relative group rounded-lg overflow-hidden h-24 bg-surface border border-white/5">
                          {isVideo ? (
                            <div className="w-full h-full flex items-center justify-center bg-black/40">
                              <LinkIcon className="w-5 h-5 text-primary" />
                            </div>
                          ) : (
                            <img src={img} className="w-full h-full object-cover" />
                          )}
                          <div className="absolute inset-x-0 bottom-0 bg-background/90 backdrop-blur-sm flex items-center justify-around py-1.5 border-t border-white/10">
                            <button 
                              type="button"
                              onClick={() => {
                                if (idx > 0) {
                                  const newArr = [...(formData.additionalImages || [])];
                                  [newArr[idx-1], newArr[idx]] = [newArr[idx], newArr[idx-1]];
                                  setFormData({...formData, additionalImages: newArr});
                                }
                              }}
                              className={`p-1 rounded-lg transition-colors ${idx > 0 ? 'text-primary hover:bg-primary/10' : 'text-cream/10'}`}
                              disabled={idx === 0}
                            >
                              <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button 
                              type="button"
                              onClick={() => removeAdditionalImage(idx)}
                              className="p-1 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <button 
                              type="button"
                              onClick={() => {
                                if (idx < (formData.additionalImages?.length || 0) - 1) {
                                  const newArr = [...(formData.additionalImages || [])];
                                  [newArr[idx+1], newArr[idx]] = [newArr[idx], newArr[idx+1]];
                                  setFormData({...formData, additionalImages: newArr});
                                }
                              }}
                              className={`p-1 rounded-lg transition-colors ${idx < (formData.additionalImages?.length || 0) - 1 ? 'text-primary hover:bg-primary/10' : 'text-cream/10'}`}
                              disabled={idx === (formData.additionalImages?.length || 0) - 1}
                            >
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-cream/40 uppercase tracking-widest mb-3">Ingredients</label>
                  <div className="flex gap-2 mb-3">
                    <input 
                      type="text" 
                      placeholder="e.g. Lavender Oil"
                      value={newIngredient}
                      onChange={(e) => setNewIngredient(e.target.value)}
                      className="flex-1 bg-background border border-white/5 rounded-xl px-4 text-cream outline-none focus:border-primary/50"
                    />
                    <button type="button" onClick={() => handleEntityAdd('ingredients')} className="p-3 bg-surface text-primary rounded-xl">
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.ingredients?.map((ing, idx) => (
                      <span key={idx} className="px-3 py-1 bg-white/5 text-cream/60 rounded-full text-xs flex items-center gap-2">
                        {ing}
                        <button type="button" onClick={() => handleEntityRemove('ingredients', idx)}>
                          <X className="w-3 h-3 hover:text-red-400" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-cream/40 uppercase tracking-widest mb-3">Features (Keywords)</label>
                  <div className="flex gap-2 mb-3">
                    <input 
                      type="text" 
                      placeholder="e.g. Organic, Vegan"
                      value={newFeature}
                      onChange={(e) => setNewFeature(e.target.value)}
                      className="flex-1 bg-background border border-white/5 rounded-xl px-4 text-cream outline-none focus:border-primary/50"
                    />
                    <button type="button" onClick={() => handleEntityAdd('features')} className="p-3 bg-surface text-primary rounded-xl">
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.features?.map((feat, idx) => (
                      <span key={idx} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs flex items-center gap-2 border border-primary/20">
                        {feat}
                        <button type="button" onClick={() => handleEntityRemove('features', idx)}>
                          <X className="w-3 h-3 hover:text-red-400" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4 sm:space-y-5">
                <AdminInput 
                  label="Product Name" 
                  icon={<Package className="w-4 h-4" />}
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <AdminInput 
                    label="Price (₹)" 
                    type="number"
                    icon={<DollarSign className="w-4 h-4" />}
                    value={formData.price}
                    onChange={(e: any) => setFormData({...formData, price: parseFloat(e.target.value) || 0})}
                    required
                  />
                  <div className="lg:col-span-2">
                    <label className="block text-[10px] font-bold text-cream/40 uppercase tracking-widest mb-1.5 px-1">Categories (Select Multiple)</label>
                    <div className="flex flex-wrap gap-2 p-3 bg-background border border-white/5 rounded-2xl min-h-[48px]">
                      {categories.map(cat => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => {
                            const current = formData.categories || [];
                            const updated = current.includes(cat.name) 
                              ? current.filter(c => c !== cat.name)
                              : [...current, cat.name];
                            setFormData({ 
                              ...formData, 
                              categories: updated,
                              category: updated[0] || '' // Fallback for single category field
                            });
                          }}
                          className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all ${
                            (formData.categories || []).includes(cat.name)
                              ? 'bg-primary text-background border-primary'
                              : 'bg-surface border-white/5 text-cream/30 hover:border-white/10'
                          }`}
                        >
                          {cat.name}
                        </button>
                      ))}
                    </div>
                  </div>
                  <AdminInput 
                    label="Priority (Order)" 
                    type="number"
                    icon={<List className="w-4 h-4" />}
                    value={formData.order}
                    onChange={(e: any) => setFormData({...formData, order: parseInt(e.target.value) || 0})}
                  />
                </div>

                <AdminInput 
                  label="Available Sizes" 
                  icon={<Edit2 className="w-4 h-4" />}
                  placeholder="e.g. 50ml, 100ml"
                  value={formData.size}
                  onChange={(e) => setFormData({...formData, size: e.target.value})}
                  required
                />

                <div className={`${isDescFullscreen ? 'fixed inset-0 z-[100] bg-background p-6 flex flex-col' : ''}`}>
                  <div className="flex items-center justify-between mb-1.5 px-1">
                    <label className="block text-[10px] font-bold text-cream/40 uppercase tracking-widest">Description</label>
                    <div className="flex items-center gap-2">
                       <button 
                        type="button" 
                        onClick={() => setDescViewMode(descViewMode === 'visual' ? 'code' : 'visual')}
                        className={`p-1.5 rounded-lg border transition-all flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest ${
                          descViewMode === 'code' ? 'bg-primary/20 border-primary text-primary' : 'bg-white/5 border-white/10 text-cream/40'
                        }`}
                      >
                        {descViewMode === 'code' ? <Eye className="w-3 h-3" /> : <Code className="w-3 h-3" />}
                        {descViewMode === 'code' ? 'Switch to Visual' : 'Switch to Code'}
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setIsDescFullscreen(!isDescFullscreen)}
                        className="p-1.5 bg-white/5 border border-white/10 rounded-lg text-cream/40 hover:text-primary transition-all"
                      >
                        {isDescFullscreen ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-1 mb-2 p-1 bg-background/50 border border-white/5 rounded-xl sticky top-0 z-10 backdrop-blur-md">
                    <button type="button" onClick={() => execCmd('bold')} className="p-2 hover:bg-primary/10 text-cream/60 hover:text-primary rounded-lg transition-colors border border-transparent hover:border-primary/20" title="Bold">
                      <Bold className="w-3 h-3" />
                    </button>
                    <button type="button" onClick={() => execCmd('italic')} className="p-2 hover:bg-primary/10 text-cream/60 hover:text-primary rounded-lg transition-colors border border-transparent hover:border-primary/20" title="Italic">
                      <Italic className="w-3 h-3" />
                    </button>
                    <button type="button" 
                      onClick={() => {
                        const size = prompt('Enter size (e.g. 20px, 1.5rem, 150%):');
                        if (!size) return;
                        
                        if (descViewMode === 'visual') {
                          visualEditorRef.current?.focus();
                          const selection = window.getSelection();
                          if (selection && selection.rangeCount > 0) {
                            const range = selection.getRangeAt(0);
                            const span = document.createElement('span');
                            span.style.fontSize = size;
                            
                            if (range.collapsed) {
                              // If no selection, insert a space with the style so typing continues in it
                              span.innerHTML = '&#8203;'; // Zero-width space to hold the style
                              range.insertNode(span);
                              range.setStart(span, 1);
                              range.setEnd(span, 1);
                            } else {
                              range.surroundContents(span);
                            }
                            syncCodeFromVisual();
                          }
                        } else {
                          insertTag('span', 'span', '', size);
                        }
                      }} 
                      className="p-2 hover:bg-primary/10 text-cream/60 hover:text-primary rounded-lg transition-colors border border-transparent hover:border-primary/20 flex items-center gap-1" title="Set Size">
                      <Type className="w-3 h-3" />
                      <span className="text-[8px] font-bold">SIZE</span>
                    </button>
                    <button type="button" 
                      onClick={() => {
                        const color = prompt('Enter color hex (e.g. #FF0000) or name:');
                        if (!color) return;

                        if (descViewMode === 'visual') {
                          visualEditorRef.current?.focus();
                          document.execCommand('foreColor', false, color);
                          syncCodeFromVisual();
                        } else {
                          insertTag('span', 'span', color);
                        }
                      }} 
                      className="p-2 hover:bg-primary/10 text-cream/60 hover:text-primary rounded-lg transition-colors border border-transparent hover:border-primary/20" title="Set Color">
                      <Palette className="w-3 h-3 text-primary" />
                    </button>
                    <button type="button" onClick={() => {
                        const url = prompt('Enter Image URL:');
                        if (url) {
                          const html = `<img src="${url}" class="w-full rounded-xl my-4 object-cover max-h-[300px]" />`;
                          if (descViewMode === 'visual') {
                            execCmd('insertHTML', html);
                          } else {
                            insertTag('', '', '', '', html);
                          }
                        }
                      }} 
                      className="p-2 hover:bg-primary/10 text-cream/60 hover:text-primary rounded-lg transition-colors border border-transparent hover:border-primary/20" title="Add Image">
                      <ImageIcon2 className="w-3 h-3" />
                    </button>
                    <div className="w-px h-4 bg-white/10 mx-1" />
                    <button type="button" onClick={() => {
                        const html = '<hr class="border-white/10 my-4" />';
                        if (descViewMode === 'visual') execCmd('insertHTML', html);
                        else insertTag('hr');
                      }} 
                      className="p-2 hover:bg-primary/10 text-cream/60 hover:text-primary rounded-lg transition-colors border border-transparent hover:border-primary/20" title="Divider">
                      <Minus className="w-3 h-3" />
                    </button>
                  </div>

                  <div className={`relative flex-1 min-h-0 ${isDescFullscreen ? 'h-full' : ''}`}>
                    {descViewMode === 'code' ? (
                      <textarea 
                        ref={descriptionRef}
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        className={`w-full p-4 bg-background border border-white/5 rounded-2xl focus:border-primary/50 transition-all outline-none text-cream text-sm font-mono ${isDescFullscreen ? 'h-full resize-none' : 'min-h-[200px]'}`}
                        placeholder="Enter description HTML here..."
                        required
                      />
                    ) : (
                      <div 
                        ref={visualEditorRef}
                        contentEditable
                        onInput={syncCodeFromVisual}
                        onBlur={syncCodeFromVisual}
                        className={`w-full p-4 bg-background border border-white/5 rounded-2xl focus:border-primary/50 transition-all outline-none text-cream text-sm overflow-y-auto product-description-content ${isDescFullscreen ? 'h-full' : 'min-h-[200px] max-h-[500px]'}`}
                        style={{ whiteSpace: 'pre-wrap' }}
                      />
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   <AdminInput 
                    label="Rating" 
                    type="number"
                    step="0.1"
                    max="5"
                    icon={<Star className="w-4 h-4" />}
                    value={formData.rating}
                    onChange={(e: any) => setFormData({...formData, rating: parseFloat(e.target.value) || 0})}
                  />
                  <AdminInput 
                    label="Reviews" 
                    type="number"
                    icon={<List className="w-4 h-4" />}
                    value={formData.reviewsCount}
                    onChange={(e: any) => setFormData({...formData, reviewsCount: parseInt(e.target.value) || 0})}
                  />
                </div>

                <div className="bg-background/50 border border-white/5 p-4 rounded-2xl">
                  <div className="flex justify-between items-center mb-4">
                    <label className="block text-[10px] font-bold text-cream/40 uppercase tracking-widest px-1">Product image Curve (Radius)</label>
                    <span className="text-primary font-bold text-xs">{formData.imageCurve}px</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="200" 
                    value={formData.imageCurve || 0}
                    onChange={(e) => setFormData({...formData, imageCurve: parseInt(e.target.value)})}
                    className="w-full h-1.5 bg-surface rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <div className="flex justify-between mt-2">
                    <span className="text-[8px] text-cream/20 font-bold uppercase tracking-widest">Sharp (0)</span>
                    <span className="text-[8px] text-cream/20 font-bold uppercase tracking-widest">Circle/Round</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-cream/40 uppercase tracking-widest mb-3">Highlighter Tags (Trending, Offer, etc.)</label>
                  <div className="flex gap-2 mb-3">
                    <input 
                      type="text" 
                      placeholder="Tag text..."
                      value={newTagText}
                      onChange={(e) => setNewTagText(e.target.value)}
                      className="flex-1 bg-background border border-white/5 rounded-xl px-4 text-cream outline-none focus:border-primary/50 text-sm"
                    />
                    <input 
                      type="color" 
                      value={newTagColor}
                      onChange={(e) => setNewTagColor(e.target.value)}
                      className="w-12 h-10 bg-background border border-white/5 rounded-xl overflow-hidden cursor-pointer"
                    />
                    <button type="button" onClick={addTag} className="p-3 bg-surface text-primary rounded-xl">
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.tags?.map((tag, idx) => (
                      <span key={idx} style={{ backgroundColor: tag.color + '20', color: tag.color, borderColor: tag.color + '40' }} className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 border">
                        {tag.text}
                        <button type="button" onClick={() => removeTag(idx)}>
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-cream/40 uppercase tracking-widest mb-3">Custom Details (Key: Value)</label>
                  <div className="flex gap-2 mb-3">
                    <input 
                      type="text" 
                      placeholder="Key (e.g. PH Level)"
                      value={newCustomKey}
                      onChange={(e) => setNewCustomKey(e.target.value)}
                      className="w-1/3 bg-background border border-white/5 rounded-xl px-4 text-cream outline-none focus:border-primary/50 text-xs"
                    />
                    <input 
                      type="text" 
                      placeholder="Value (e.g. 5.5)"
                      value={newCustomValue}
                      onChange={(e) => setNewCustomValue(e.target.value)}
                      className="flex-1 bg-background border border-white/5 rounded-xl px-4 text-cream outline-none focus:border-primary/50 text-xs"
                    />
                    <button type="button" onClick={addCustomField} className="p-3 bg-surface text-primary rounded-xl">
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    {Object.entries(formData.customFields || {}).map(([key, val]) => (
                      <div key={key} className="flex justify-between items-center px-4 py-2 bg-white/5 rounded-xl border border-white/5">
                        <span className="text-xs font-bold text-primary">{key}: <span className="text-cream/70 underline">{val}</span></span>
                        <button type="button" onClick={() => removeCustomField(key)}>
                          <Trash2 className="w-4 h-4 text-red-400/50" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Advanced Settings Section */}
                <div className="bg-surface/50 border border-primary/20 p-5 rounded-2xl space-y-5">
                  <div className="flex items-center gap-2 mb-1">
                    <Settings className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-bold text-cream">Advanced Overrides</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <AdminInput 
                      label="Tax Rate (%)" 
                      type="number"
                      placeholder={globalSettings.defaultTaxRate + '% (Default)'}
                      value={formData.taxRate ?? ''}
                      onChange={(e: any) => setFormData({...formData, taxRate: e.target.value ? parseFloat(e.target.value) : undefined})}
                    />
                    <AdminInput 
                      label="Shipping (₹)" 
                      type="number"
                      placeholder={globalSettings.defaultShippingCharge + ' (Default)'}
                      value={formData.shippingCharge ?? ''}
                      onChange={(e: any) => setFormData({...formData, shippingCharge: e.target.value ? parseFloat(e.target.value) : undefined})}
                    />
                    <AdminInput 
                      label="Discount (%)" 
                      type="number"
                      placeholder={globalSettings.defaultDiscountPercentage + '% (Default)'}
                      value={formData.discountPercentage ?? ''}
                      onChange={(e: any) => setFormData({...formData, discountPercentage: e.target.value ? parseFloat(e.target.value) : undefined})}
                    />
                    <AdminInput 
                      label="Coupon Code" 
                      placeholder={globalSettings.defaultCouponCode || 'No default'}
                      value={formData.couponCode ?? ''}
                      onChange={(e: any) => setFormData({...formData, couponCode: e.target.value})}
                    />
                  </div>
                  <p className="text-[10px] text-cream/30 italic">Tip: Leave empty or reset to use Universal Settings from Product Settings tab.</p>
                  <button 
                    type="button" 
                    onClick={() => setFormData({...formData, taxRate: undefined, shippingCharge: undefined, discountPercentage: undefined, couponCode: ''})}
                    className="text-[9px] text-primary font-bold uppercase hover:underline"
                  >
                    Reset to Universal Settings
                  </button>
                </div>

                <button 
                  type="submit"
                  className="w-full py-4 bg-primary text-background font-bold rounded-2xl flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-primary/10 mt-4"
                >
                  <Save className="w-5 h-5" />
                  {editingId ? 'Update Product' : 'Save Product'}
                </button>
              </div>
            </form>
          </>
        )}
      </motion.div>
    )}
</AnimatePresence>

      {/* Reviews Modal */}
      <AnimatePresence>
        {editingReviewsProductId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingReviewsProductId(null)}
              className="absolute inset-0 bg-background/60 backdrop-blur-[2px]"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-surface border border-white/5 rounded-[32px] w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col relative z-10 shadow-2xl"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-serif font-bold text-cream">Manage Reviews</h2>
                  <p className="text-[10px] text-primary uppercase font-bold tracking-widest">
                    {products.find(p => p.id === editingReviewsProductId)?.name}
                  </p>
                </div>
                <button 
                  onClick={() => setEditingReviewsProductId(null)}
                  className="p-2 bg-white/5 rounded-full text-cream/40"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
                {isAddingReview ? (
                  <form onSubmit={handleReviewSubmit} className="space-y-4 bg-background/50 p-4 rounded-2xl border border-white/5">
                    <div className="grid grid-cols-2 gap-4">
                      <AdminInput 
                        label="User Name" 
                        value={reviewForm.userName}
                        onChange={(e: any) => setReviewForm({ ...reviewForm, userName: e.target.value })}
                        required
                      />
                      <AdminInput 
                        label="Rating (1-5)" 
                        type="number"
                        min="1"
                        max="5"
                        value={reviewForm.rating}
                        onChange={(e: any) => setReviewForm({ ...reviewForm, rating: parseInt(e.target.value) })}
                        required
                      />
                    </div>
                    <AdminInput 
                      label="Date" 
                      value={reviewForm.date}
                      onChange={(e: any) => setReviewForm({ ...reviewForm, date: e.target.value })}
                      required
                    />
                    <div>
                      <label className="block text-[10px] font-bold text-cream/30 uppercase tracking-widest mb-1 px-1">Review Content</label>
                      <textarea 
                        value={reviewForm.comment}
                        onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                        className="w-full p-4 bg-background border border-white/5 rounded-xl focus:border-primary/50 transition-all outline-none text-cream text-sm min-h-[100px]"
                        required
                      />
                    </div>
                    <div className="flex gap-2">
                       <button 
                        type="submit" 
                        className="flex-1 py-3 bg-primary text-background font-bold rounded-xl hover:brightness-110"
                       >
                        {editingReviewId ? 'Update Review' : 'Add Review'}
                       </button>
                       <button 
                        type="button"
                        onClick={() => { setIsAddingReview(false); setEditingReviewId(null); }}
                        className="flex-1 py-3 bg-white/5 text-cream/60 font-bold rounded-xl"
                       >
                        Cancel
                       </button>
                    </div>
                  </form>
                ) : (
                  <button 
                    onClick={() => {
                    setReviewForm({ userName: '', rating: 5, comment: '', date: new Date().toLocaleDateString('en-IN') });
                    setIsAddingReview(true);
                    }}
                    className="w-full py-4 border-2 border-dashed border-white/5 rounded-2xl text-cream/40 flex items-center justify-center gap-2 hover:border-primary/50 hover:text-primary transition-all"
                  >
                    <Plus className="w-5 h-5" />
                    Add Custom Review
                  </button>
                )}

                <div className="space-y-3">
                  {productReviews.length === 0 ? (
                    <div className="text-center py-10 text-cream/20 italic">No reviews yet for this product.</div>
                  ) : (
                    productReviews.sort((a,b) => b.createdAt - a.createdAt).map(rev => (
                      <div key={rev.id} className="bg-white/5 border border-white/5 rounded-2xl p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-cream font-bold text-sm">{rev.userName}</h4>
                              <div className="flex gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} className={`w-2.5 h-2.5 ${i < rev.rating ? 'text-primary fill-current' : 'text-cream/10'}`} />
                                ))}
                              </div>
                            </div>
                            <span className="text-[10px] text-cream/30">{rev.date}</span>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => handleReviewEdit(rev)} className="text-cream/20 hover:text-primary"><Edit2 className="w-3.5 h-3.5" /></button>
                            <button onClick={() => handleReviewDelete(rev.id)} className="text-cream/20 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        </div>
                        <p className="text-cream/60 text-xs leading-relaxed">{rev.comment}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      {activeTab === 'hero' && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-surface/50 border border-white/5 rounded-[32px] sm:rounded-[40px] p-4 sm:p-8 mb-6 max-w-4xl mx-auto"
        >
          <div className="flex items-center gap-4 mb-8">
            <LayoutGrid className="w-8 h-8 text-primary" />
            <h2 className="text-xl font-bold">Customize Home Banner</h2>
          </div>

          <form onSubmit={handleBannerSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4 sm:space-y-6">
                <label className="block text-xs font-bold text-cream/40 uppercase tracking-widest">Banner Image</label>
                <ImageUploader 
                  onImageSelected={(url) => setBannerForm({ ...bannerForm, imageUrl: url })} 
                  currentImage={bannerForm.imageUrl}
                />
              </div>

              <div className="space-y-4 sm:space-y-6">
                <AdminInput 
                  label="Title" 
                  icon={<Edit2 className="w-4 h-4" />}
                  value={bannerForm.title}
                  onChange={(e: any) => setBannerForm({...bannerForm, title: e.target.value})}
                  required
                />
                <AdminInput 
                  label="Subtitle" 
                  icon={<Edit2 className="w-4 h-4" />}
                  value={bannerForm.subtitle}
                  onChange={(e: any) => setBannerForm({...bannerForm, subtitle: e.target.value})}
                  required
                />
                <AdminInput 
                  label="Button Text" 
                  icon={<Settings className="w-4 h-4" />}
                  value={bannerForm.buttonText}
                  onChange={(e: any) => setBannerForm({...bannerForm, buttonText: e.target.value})}
                  required
                />
                <AdminInput 
                  label="External Link (Optional)" 
                  icon={<LinkIcon className="w-4 h-4" />}
                  placeholder="https://..."
                  value={bannerForm.externalLink || ''}
                  onChange={(e: any) => setBannerForm({...bannerForm, externalLink: e.target.value})}
                />
              </div>
            </div>

            <button 
              type="submit"
              className="w-full py-4 bg-primary text-background font-bold rounded-2xl flex items-center justify-center gap-3 hover:scale-[1.01] transition-all shadow-xl shadow-primary/10"
            >
              <Save className="w-5 h-5" />
              Save Banner Configuration
            </button>
          </form>
        </motion.div>
      )}

      {activeTab === 'categories' && (
        <div className="max-w-6xl mx-auto">
           <AnimatePresence>
            {isAddingCategory && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-surface/50 border border-white/5 rounded-[32px] sm:rounded-[40px] p-4 sm:p-8 mb-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">{editingCategoryId ? 'Edit Category' : 'Add Category'}</h2>
                  <button onClick={() => { setIsAddingCategory(false); setEditingCategoryId(null); }} className="text-cream/40"><X /></button>
                </div>
                <form onSubmit={handleCategorySubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                  <div className="space-y-4 sm:space-y-6">
                    <label className="block text-xs font-bold text-cream/40 uppercase tracking-widest">Category Image</label>
                    <ImageUploader 
                      onImageSelected={(url) => setCategoryForm({ ...categoryForm, imageUrl: url })} 
                      currentImage={categoryForm.imageUrl}
                    />
                  </div>
                  <div className="space-y-4 sm:space-y-5">
                    <AdminInput 
                      label="Category Name" 
                      icon={<Tag className="w-4 h-4" />}
                      value={categoryForm.name}
                      onChange={(e) => setCategoryForm({...categoryForm, name: e.target.value})}
                      required
                    />
                    <div>
                      <label className="block text-xs font-bold text-cream/40 uppercase tracking-widest mb-2">Layout Type</label>
                      <div className="relative">
                        <select 
                          value={categoryForm.layoutType}
                          onChange={(e) => setCategoryForm({...categoryForm, layoutType: e.target.value as any})}
                          className="w-full p-4 bg-background border border-white/5 rounded-xl outline-none text-cream appearance-none cursor-pointer font-bold text-sm pr-10"
                        >
                          <option value="grid">Grid (Standard Cards)</option>
                          <option value="reel">Reel (Video Clips/Vertical)</option>
                          <option value="banner">Banner (Big Wide Cards)</option>
                        </select>
                        <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-cream/20">
                          <LayoutGrid className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                    <AdminInput 
                      label="Video URL (For Reels)" 
                      icon={<LinkIcon className="w-4 h-4" />}
                      value={categoryForm.videoUrl}
                      onChange={(e) => setCategoryForm({...categoryForm, videoUrl: e.target.value})}
                    />
                    <AdminInput 
                      label="Order (Numerical)" 
                      type="number"
                      icon={<List className="w-4 h-4" />}
                      value={categoryForm.order}
                      onChange={(e: any) => setCategoryForm({...categoryForm, order: parseInt(e.target.value) || 0})}
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <AdminInput 
                        label="Image Size (px)" 
                        type="number"
                        icon={<ImageIcon className="w-4 h-4" />}
                        value={categoryForm.imageSize}
                        onChange={(e: any) => setCategoryForm({...categoryForm, imageSize: parseInt(e.target.value) || 0})}
                      />
                      <AdminInput 
                        label="Text Size (px)" 
                        type="number"
                        icon={<List className="w-4 h-4" />}
                        value={categoryForm.textSize}
                        onChange={(e: any) => setCategoryForm({...categoryForm, textSize: parseInt(e.target.value) || 0})}
                      />
                    </div>
                    <AdminInput 
                      label="Text Color (Hex)" 
                      icon={<Edit2 className="w-4 h-4" />}
                      value={categoryForm.textColor}
                      onChange={(e: any) => setCategoryForm({...categoryForm, textColor: e.target.value})}
                    />
                    <button type="submit" className="w-full py-4 bg-primary text-background font-bold rounded-2xl flex items-center justify-center gap-3">
                      <Save className="w-5 h-5" />
                      Save Category
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
           </AnimatePresence>

           <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
             {[...categories].sort((a, b) => (a.order || 0) - (b.order || 0)).map(cat => (
               <div key={cat.id} className="bg-surface/30 border border-white/5 rounded-2xl p-3 group relative overflow-hidden">
                 <div className="aspect-square rounded-xl mb-3 overflow-hidden bg-surface flex items-center justify-center p-1.5">
                    {cat.imageUrl ? (
                      <img src={cat.imageUrl} className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-700" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-6 h-6 text-cream/10" />
                      </div>
                    )}
                 </div>
                 <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-cream font-bold text-xs truncate max-w-[80px]">{cat.name}</h3>
                      <p className="text-[8px] text-primary uppercase font-bold tracking-widest mt-0.5">{cat.layoutType}</p>
                    </div>
                    <div className="flex gap-1">
                       <button onClick={() => handleCategoryEdit(cat)} className="p-1.5 bg-white/5 rounded-lg text-cream/40 hover:text-primary"><Edit2 className="w-3 h-3" /></button>
                       <button onClick={() => handleCategoryDelete(cat.id)} className="p-1.5 bg-white/5 rounded-lg text-cream/40 hover:text-red-400"><Trash2 className="w-3 h-3" /></button>
                    </div>
                 </div>
               </div>
             ))}
           </div>
        </div>
      )}

      {activeTab === 'home' && (
        <div className="max-w-6xl mx-auto">
          <AnimatePresence>
            {isAddingSection && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-surface border border-white/5 rounded-[32px] sm:rounded-[40px] p-6 sm:p-10 mb-8 shadow-2xl"
              >
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-xl font-serif font-bold text-cream">{editingSectionId ? 'Edit Home Section' : 'Add Home Section'}</h2>
                  <button 
                    onClick={() => { setIsAddingSection(false); setEditingSectionId(null); }}
                    className="p-2 bg-white/5 rounded-full text-cream/40"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSectionSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <AdminInput 
                      label="Section Title (e.g. Recommended for You)" 
                      value={sectionForm.title}
                      onChange={(e) => setSectionForm({ ...sectionForm, title: e.target.value })}
                      required
                    />
                    
                    <div>
                      <label className="block text-[10px] font-bold text-cream/30 uppercase tracking-widest mb-1 px-1">Layout Type</label>
                      <div className="relative">
                        <select 
                          value={sectionForm.layoutType}
                          onChange={(e) => setSectionForm({ ...sectionForm, layoutType: e.target.value as any })}
                          className="w-full p-3 bg-background border border-white/5 rounded-xl text-cream outline-none focus:border-primary/50 font-bold text-sm appearance-none"
                        >
                          <option value="grid">Grid (Vertical List)</option>
                          <option value="reel">Reel (Horizontal Scroll)</option>
                          <option value="banner">Banner (Big Card / Offer)</option>
                        </select>
                        <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-cream/20">
                          <LayoutGrid className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] font-bold text-cream/30 uppercase tracking-widest mb-1 px-1">Data Source (Items selection)</label>
                      <div className="relative">
                        <select 
                          value={sectionForm.dataSource}
                          onChange={(e) => setSectionForm({ ...sectionForm, dataSource: e.target.value as any })}
                          className="w-full p-3 bg-background border border-white/5 rounded-xl text-cream outline-none focus:border-primary/50 font-bold text-sm appearance-none"
                        >
                          <option value="category">Category Wise</option>
                          <option value="products">Select Particular Items</option>
                          <option value="all">All Items</option>
                        </select>
                        <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-cream/20">
                          <Plus className="w-4 h-4" />
                        </div>
                      </div>
                    </div>

                    <AdminInput 
                      label="Display Order (Rank)" 
                      type="number"
                      value={sectionForm.order}
                      onChange={(e: any) => setSectionForm({ ...sectionForm, order: parseInt(e.target.value) || 0 })}
                    />
                  </div>

                  {sectionForm.dataSource === 'category' && (
                    <div className="bg-background/30 p-5 rounded-2xl border border-white/5">
                      <label className="block text-[10px] font-bold text-cream/30 uppercase tracking-widest mb-4">Choose Category</label>
                      <div className="flex flex-wrap gap-2">
                        {categories.map(cat => (
                          <button 
                            key={cat.id}
                            type="button"
                            onClick={() => setSectionForm({ ...sectionForm, categoryId: cat.name })}
                            className={`px-4 py-2 rounded-xl text-[10px] font-bold transition-all border uppercase tracking-widest ${
                              sectionForm.categoryId === cat.name 
                                ? 'bg-primary text-background border-primary' 
                                : 'bg-surface border-white/5 text-cream/40'
                            }`}
                          >
                            {cat.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {sectionForm.dataSource === 'products' && (
                    <div className="bg-background/30 p-5 rounded-2xl border border-white/5">
                      <label className="block text-[10px] font-bold text-cream/30 uppercase tracking-widest mb-4">Select Products for this list</label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        {products.map(p => (
                          <button 
                            key={p.id}
                            type="button"
                            onClick={() => {
                              const ids = [...(sectionForm.productIds || [])];
                              if (ids.includes(p.id)) {
                                setSectionForm({ ...sectionForm, productIds: ids.filter(id => id !== p.id) });
                              } else {
                                setSectionForm({ ...sectionForm, productIds: [...ids, p.id] });
                              }
                            }}
                            className={`p-3 rounded-2xl flex items-center gap-3 border transition-all text-left group ${
                              sectionForm.productIds?.includes(p.id)
                                ? 'bg-primary/10 border-primary text-primary'
                                : 'bg-surface border-white/5 text-cream/30'
                            }`}
                          >
                            <div className="w-10 h-10 rounded-xl overflow-hidden bg-background flex-shrink-0 border border-white/5">
                               <img src={p.imageUrl} className="w-full h-full object-cover" />
                            </div>
                            <span className="text-[10px] font-bold truncate flex-1 leading-tight">{p.name}</span>
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                              sectionForm.productIds?.includes(p.id) ? 'bg-primary border-primary' : 'border-white/10'
                            }`}>
                              {sectionForm.productIds?.includes(p.id) && <Check className="w-2.5 h-2.5 text-background" />}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <button 
                    type="submit" 
                    className="w-full py-5 bg-primary text-background font-bold rounded-2xl hover:brightness-110 shadow-xl shadow-primary/20 flex items-center justify-center gap-3"
                  >
                    <Save className="w-5 h-5" />
                    {editingSectionId ? 'Update Section' : 'Publish Section to Home'}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {homeSections.map(section => (
              <div key={section.id} className="bg-surface/30 border border-white/5 p-6 rounded-[32px] group relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 flex gap-2">
                   <button onClick={() => handleSectionEdit(section)} className="p-2.5 bg-white/5 rounded-xl text-cream/40 hover:text-primary transition-all"><Edit2 className="w-4 h-4" /></button>
                   <button onClick={() => handleSectionDelete(section.id)} className="p-2.5 bg-white/5 rounded-xl text-cream/40 hover:text-red-400 transition-all"><Trash2 className="w-4 h-4" /></button>
                </div>
                
                <p className="text-[9px] font-bold text-primary uppercase tracking-widest mb-2 border border-primary/20 bg-primary/5 inline-block px-3 py-1 rounded-full">
                  #{section.order + 1} Priority
                </p>
                <h3 className="text-xl font-serif font-bold text-cream pr-20">{section.title}</h3>
                
                <div className="flex gap-4 mt-6">
                  <div className="flex flex-col gap-1">
                    <span className="text-[8px] text-cream/20 uppercase font-bold tracking-widest">Layout</span>
                    <div className="flex items-center gap-2 text-cream/60">
                       <LayoutGrid className="w-3.5 h-3.5" />
                       <span className="text-[10px] font-bold capitalize">{section.layoutType}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 border-l border-white/5 pl-4">
                    <span className="text-[8px] text-cream/20 uppercase font-bold tracking-widest">Source</span>
                    <div className="flex items-center gap-2 text-primary">
                       <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                       <span className="text-[10px] font-bold capitalize">{section.dataSource === 'category' ? `Category: ${section.categoryId}` : section.dataSource === 'products' ? `${section.productIds?.length} Selected Items` : 'All Products'}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {homeSections.length === 0 && !isAddingSection && (
            <div className="py-24 text-center bg-surface/10 border-2 border-dashed border-white/5 rounded-[40px]">
              <LayoutGrid className="w-16 h-16 text-cream/5 mx-auto mb-6" />
              <p className="text-cream/30 font-medium mb-6">No sections added to Home Page yet.</p>
              <button 
                onClick={() => setIsAddingSection(true)}
                className="bg-primary/10 text-primary px-8 py-3 rounded-2xl border border-primary/20 hover:bg-primary hover:text-background transition-all font-bold text-xs uppercase tracking-widest"
              >
                + Add Home Section
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'settings' && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-surface/50 border border-white/5 rounded-[32px] sm:rounded-[40px] p-6 sm:p-10 mb-6 max-w-2xl mx-auto"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Settings className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-cream">Universal Product Settings</h2>
              <p className="text-xs text-cream/30 uppercase font-bold tracking-widest">Global Defaults for all items</p>
            </div>
          </div>

          <form 
            onSubmit={async (e) => {
              e.preventDefault();
              try {
                await DatabaseService.updateGlobalSettings(globalSettings);
                alert('Universal settings updated successfully!');
              } catch (err) {
                console.error(err);
                alert('Failed to update settings.');
              }
            }} 
            className="space-y-6"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <AdminInput 
                label="Default Tax Rate (%)" 
                type="number"
                icon={<DollarSign className="w-4 h-4" />}
                value={globalSettings.defaultTaxRate}
                onChange={(e: any) => setGlobalSettings({...globalSettings, defaultTaxRate: parseFloat(e.target.value) || 0})}
                required
              />
              <AdminInput 
                label="Default Shipping Charge (₹)" 
                type="number"
                icon={<Package className="w-4 h-4" />}
                value={globalSettings.defaultShippingCharge}
                onChange={(e: any) => setGlobalSettings({...globalSettings, defaultShippingCharge: parseFloat(e.target.value) || 0})}
                required
              />
              <AdminInput 
                label="Default Discount (%)" 
                type="number"
                icon={<Tag className="w-4 h-4" />}
                value={globalSettings.defaultDiscountPercentage}
                onChange={(e: any) => setGlobalSettings({...globalSettings, defaultDiscountPercentage: parseFloat(e.target.value) || 0})}
                required
              />
              <AdminInput 
                label="Default Coupon Code" 
                icon={<List className="w-4 h-4" />}
                value={globalSettings.defaultCouponCode}
                onChange={(e: any) => setGlobalSettings({...globalSettings, defaultCouponCode: e.target.value})}
              />
            </div>

            <div className="bg-primary/5 border border-primary/10 p-5 rounded-2xl">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-xs font-bold text-primary uppercase tracking-widest">Note on Default Settings</p>
                  <p className="text-[11px] text-cream/40 leading-relaxed">
                    These values will be applied to all products that do not have their own "Advanced Overrides" set. 
                    If you set an override on a specific product, it will take priority over these universal settings.
                  </p>
                </div>
              </div>
            </div>

            <button 
              type="submit"
              className="w-full py-4 bg-primary text-background font-bold rounded-2xl flex items-center justify-center gap-3 hover:scale-[1.02] transition-all shadow-xl shadow-primary/20"
            >
              <Save className="w-5 h-5" />
              Save Universal Settings
            </button>
          </form>
        </motion.div>
      )}

      {activeTab === 'products' && (
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          [1,2,3,4].map(i => <div key={i} className="h-40 bg-surface/50 rounded-2xl animate-pulse" />)
        ) : (
          [...products].sort((a, b) => (a.order || 0) - (b.order || 0)).map((product) => (
            <div key={product.id} className="bg-surface/30 border border-white/5 rounded-2xl p-3 flex gap-3 items-center group relative overflow-hidden">
              <div className="h-20 w-20 rounded-xl overflow-hidden flex-shrink-0 bg-background/50 border border-white/5">
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-5 h-5 text-cream/10" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0 pr-1">
                <h3 className="text-cream font-bold text-sm truncate">{product.name}</h3>
                <p className="text-primary font-bold text-xs">{formatCurrency(product.price)}</p>
                <div className="flex gap-1.5 mt-2">
                  <button 
                    onClick={() => handleEdit(product)}
                    className="p-1.5 bg-white/5 rounded-lg text-cream/40 hover:text-primary hover:bg-white/10 transition-all"
                    title="Edit Product"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={() => loadReviews(product.id)}
                    className="p-1.5 bg-white/5 rounded-lg text-cream/40 hover:text-yellow-400 hover:bg-white/10 transition-all"
                    title="Manage Reviews"
                  >
                    <Star className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={() => handleDelete(product.id)}
                    className="p-1.5 bg-white/5 rounded-lg text-cream/40 hover:text-red-400 hover:bg-white/10 transition-all"
                    title="Delete Product"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      )}

      {!loading && products.length === 0 && !isAdding && activeTab === 'products' && (
        <div className="flex flex-col items-center justify-center py-20 text-cream/20">
          <AlertCircle className="w-12 h-12 mb-4" />
          <p>No products found. Start adding some!</p>
        </div>
      )}
      </div>
    </div>
  );
}

function AdminInput({ label, icon, ...props }: any) {
  const value = props.value;
  // Ensure value is never NaN for controlled components
  const safeProps = {
    ...props,
    value: (typeof value === 'number' && isNaN(value)) ? 0 : value
  };

  return (
    <div className="w-full">
      <label className="block text-[10px] font-bold text-cream/30 uppercase tracking-widest mb-1 px-1">{label}</label>
      <div className="relative">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-primary">
          {icon}
        </div>
        <input 
          {...safeProps}
          className="w-full pl-10 pr-4 py-2 bg-background border border-white/5 rounded-xl focus:border-primary/50 transition-all outline-none text-cream text-sm"
        />
      </div>
    </div>
  );
}
