import { ref, push, set, get, remove, update, query, limitToLast } from 'firebase/database';
import { db } from '../lib/firebase';
import { Product, BannerConfig, Category } from '../types';

export const DatabaseService = {
  async addProduct(product: Omit<Product, 'id' | 'createdAt'>) {
    const productsRef = ref(db, 'products');
    const newProductRef = push(productsRef);
    const productData: Product = {
      ...product,
      id: newProductRef.key as string,
      createdAt: Date.now(),
    };
    await set(newProductRef, productData);
    return productData;
  },

  async getProducts(): Promise<Product[]> {
    const productsRef = ref(db, 'products');
    const snapshot = await get(productsRef);
    if (snapshot.exists()) {
      const data = snapshot.val();
      return Object.values(data) as Product[];
    }
    return [];
  },

  async getProduct(id: string): Promise<Product | null> {
    const productRef = ref(db, `products/${id}`);
    const snapshot = await get(productRef);
    if (snapshot.exists()) {
      return snapshot.val() as Product;
    }
    return null;
  },

  async updateProduct(id: string, updates: Partial<Product>) {
    await update(ref(db, `products/${id}`), updates);
  },

  async deleteProduct(id: string) {
    await remove(ref(db, `products/${id}`));
  },

  async getBannerConfig(): Promise<BannerConfig | null> {
    const bannerRef = ref(db, 'bannerConfig');
    const snapshot = await get(bannerRef);
    if (snapshot.exists()) {
      return snapshot.val() as BannerConfig;
    }
    return null;
  },

  async setBannerConfig(config: BannerConfig) {
    const bannerRef = ref(db, 'bannerConfig');
    await set(bannerRef, config);
  },

  // Categories
  async getCategories(): Promise<Category[]> {
    const categoriesRef = ref(db, 'categories');
    const snapshot = await get(categoriesRef);
    if (!snapshot.exists()) return [];
    const data = snapshot.val();
    return Object.keys(data).map(key => ({ ...data[key], id: key })).sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
  },

  async saveCategory(category: Partial<Category>): Promise<string> {
    const categoriesRef = ref(db, 'categories');
    const id = category.id || push(categoriesRef).key;
    if (!id) throw new Error('Could not generate ID');
    await set(ref(db, `categories/${id}`), {
      ...category,
      id,
      order: category.order ?? 0
    });
    return id;
  },

  async deleteCategory(id: string): Promise<void> {
    await remove(ref(db, `categories/${id}`));
  }
};
