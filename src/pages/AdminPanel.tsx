import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, Plus, Edit2, Trash2, X, Check, Package, DollarSign, 
  Tag, Star, List, LayoutGrid, Settings, Save, AlertCircle, Image as ImageIcon, Link as LinkIcon
} from 'lucide-react';
import { Product, BannerConfig, Category } from '../types';
import { DatabaseService } from '../services/databaseService';
import ImageUploader from '../components/ImageUploader';

export default function AdminPanel() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'products' | 'hero' | 'categories'>('products');
  const navigate = useNavigate();

  // Categories State
  const [categories, setCategories] = useState<Category[]>([]);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);

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
    videoUrl: '',
    category: 'Skincare',
    ingredients: [],
    features: ['Organic', 'Vegan'],
    size: '50ml, 100ml, 150ml',
    order: 0,
    tags: []
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
  }, []);

  async function loadProducts() {
    const data = await DatabaseService.getProducts();
    setProducts(data);
    setLoading(false);
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
      setFormData({
        ...formData,
        additionalImages: [...(formData.additionalImages || []), newImageLink]
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
      tags: product.tags || [],
      customFields: product.customFields || {}
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
      videoUrl: '',
      category: categories[0]?.name || 'Skincare',
      ingredients: [],
      features: ['Organic', 'Vegan'],
      size: '50ml, 100ml, 150ml',
      order: products.length,
      tags: [],
      customFields: {}
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
        </div>

        <div className="hidden sm:block">
          {!isAdding && !isAddingCategory && (activeTab === 'products' || activeTab === 'categories') && (
            <button 
              onClick={() => activeTab === 'products' ? setIsAdding(true) : setIsAddingCategory(true)}
              className="bg-primary px-6 py-3 rounded-2xl text-background hover:scale-105 transition-all shadow-xl shadow-primary/20 flex items-center gap-2 font-bold text-sm"
            >
              <Plus className="w-5 h-5" />
              {activeTab === 'products' ? 'Add Product' : 'Add Category'}
            </button>
          )}
        </div>
      </header>

      {/* Mobile Add Button */}
      {!isAdding && !isAddingCategory && (activeTab === 'products' || activeTab === 'categories') && (
        <div className="sm:hidden mb-6">
          <button 
            onClick={() => activeTab === 'products' ? setIsAdding(true) : setIsAddingCategory(true)}
            className="w-full bg-primary py-4 rounded-2xl text-background flex items-center justify-center gap-2 font-bold shadow-lg shadow-primary/10"
          >
            <Plus className="w-5 h-5" />
            {activeTab === 'products' ? 'Add Product' : 'Add Category'}
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
                  <label className="block text-xs font-bold text-cream/40 uppercase tracking-widest mb-3">Additional Images</label>
                  <div className="flex gap-2 mb-4">
                    <input 
                      type="text" 
                      placeholder="Paste image link..."
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
                    {formData.additionalImages?.map((img, idx) => (
                      <div key={idx} className="relative group rounded-lg overflow-hidden h-16 bg-surface border border-white/5">
                        <img src={img} className="w-full h-full object-cover" />
                        <button 
                          type="button"
                          onClick={() => removeAdditionalImage(idx)}
                          className="absolute inset-0 bg-red-500/80 items-center justify-center hidden group-hover:flex transition-all"
                        >
                          <Trash2 className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    ))}
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
                    label="Price ($)" 
                    type="number"
                    icon={<DollarSign className="w-4 h-4" />}
                    value={formData.price}
                    onChange={(e: any) => setFormData({...formData, price: parseFloat(e.target.value) || 0})}
                    required
                  />
                  <div>
                    <label className="block text-[10px] font-bold text-cream/40 uppercase tracking-widest mb-1.5 px-1">Category</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-primary z-10">
                        <Tag className="w-4 h-4" />
                      </div>
                      <select 
                        value={formData.category}
                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                        className="w-full pl-10 pr-10 py-2.5 bg-background border border-white/5 rounded-xl focus:border-primary/50 transition-all outline-none text-cream appearance-none cursor-pointer font-bold text-[13px]"
                      >
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.name}>{cat.name}</option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-cream/20">
                        <List className="w-4 h-4" />
                      </div>
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
                  label="Product Video URL" 
                  icon={<LinkIcon className="w-4 h-4" />}
                  placeholder="https://..."
                  value={formData.videoUrl}
                  onChange={(e) => setFormData({...formData, videoUrl: e.target.value})}
                />

                <AdminInput 
                  label="Available Sizes" 
                  icon={<Edit2 className="w-4 h-4" />}
                  placeholder="e.g. 50ml, 100ml"
                  value={formData.size}
                  onChange={(e) => setFormData({...formData, size: e.target.value})}
                  required
                />

                <div>
                  <label className="block text-[10px] font-bold text-cream/40 uppercase tracking-widest mb-1.5 px-1">Description</label>
                  <textarea 
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full p-4 bg-background border border-white/5 rounded-2xl focus:border-primary/50 transition-all outline-none text-cream text-sm min-h-[60px]"
                    required
                  />
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
                <p className="text-primary font-bold text-xs">${product.price}</p>
                <div className="flex gap-1.5 mt-2">
                  <button 
                    onClick={() => handleEdit(product)}
                    className="p-1.5 bg-white/5 rounded-lg text-cream/40 hover:text-primary hover:bg-white/10 transition-all"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={() => handleDelete(product.id)}
                    className="p-1.5 bg-white/5 rounded-lg text-cream/40 hover:text-red-400 hover:bg-white/10 transition-all"
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
