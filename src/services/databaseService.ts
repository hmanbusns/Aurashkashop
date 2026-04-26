import { ref, push, set, get, remove, update, query, limitToLast } from 'firebase/database';
import { db } from '../lib/firebase';
import { Product, BannerConfig, Category, Review, HomeSection } from '../types';

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
  },

  // Wishlist
  async toggleWishlist(userId: string, productId: string) {
    const wishlistRef = ref(db, `users/${userId}/wishlist/${productId}`);
    const snapshot = await get(wishlistRef);
    if (snapshot.exists()) {
      await remove(wishlistRef);
      return false; // Removed
    } else {
      await set(wishlistRef, true);
      return true; // Added
    }
  },

  async isInWishlist(userId: string, productId: string): Promise<boolean> {
    const wishlistRef = ref(db, `users/${userId}/wishlist/${productId}`);
    const snapshot = await get(wishlistRef);
    return snapshot.exists();
  },

  async getWishlist(userId: string): Promise<string[]> {
    const wishlistRef = ref(db, `users/${userId}/wishlist`);
    const snapshot = await get(wishlistRef);
    if (snapshot.exists()) {
      return Object.keys(snapshot.val());
    }
    return [];
  },

  // Cart
  async addToCart(userId: string, productId: string, quantity: number, size: string) {
    const cartRef = ref(db, `users/${userId}/cart`);
    const snapshot = await get(cartRef);
    
    if (snapshot.exists()) {
      const items = snapshot.val();
      const existingKey = Object.keys(items).find(key => 
        items[key].productId === productId && items[key].size === size
      );

      if (existingKey) {
        const existingItem = items[existingKey];
        await set(ref(db, `users/${userId}/cart/${existingKey}`), {
          ...existingItem,
          quantity: existingItem.quantity + quantity,
          updatedAt: Date.now()
        });
        return;
      }
    }

    const newCartItemRef = push(cartRef);
    await set(newCartItemRef, {
      productId,
      quantity,
      size,
      addedAt: Date.now()
    });
  },

  async updateCartItemQuantity(userId: string, cartId: string, delta: number) {
    const itemRef = ref(db, `users/${userId}/cart/${cartId}`);
    const snapshot = await get(itemRef);
    if (snapshot.exists()) {
      const current = snapshot.val().quantity;
      const next = Math.max(1, current + delta);
      await update(itemRef, { quantity: next });
    }
  },

  async removeFromCart(userId: string, cartId: string) {
    await remove(ref(db, `users/${userId}/cart/${cartId}`));
  },

  async getCart(userId: string): Promise<any[]> {
    const cartRef = ref(db, `users/${userId}/cart`);
    const snapshot = await get(cartRef);
    if (snapshot.exists()) {
      const data = snapshot.val();
      return Object.keys(data).map(key => ({ ...data[key], cartId: key }));
    }
    return [];
  },

  // Reviews
  async addReview(productId: string, review: Omit<Review, 'id' | 'createdAt'>) {
    const reviewsRef = ref(db, `reviews/${productId}`);
    const newReviewRef = push(reviewsRef);
    const id = newReviewRef.key as string;
    await set(newReviewRef, {
      ...review,
      id,
      createdAt: Date.now()
    });
  },

  async getReviews(productId: string): Promise<Review[]> {
    const reviewsRef = ref(db, `reviews/${productId}`);
    const snapshot = await get(reviewsRef);
    if (snapshot.exists()) {
      return Object.values(snapshot.val()) as Review[];
    }
    return [];
  },

  async deleteReview(productId: string, reviewId: string) {
    await remove(ref(db, `reviews/${productId}/${reviewId}`));
  },

  async updateReview(productId: string, reviewId: string, updates: Partial<Review>) {
    await update(ref(db, `reviews/${productId}/${reviewId}`), updates);
  },

  // Home Sections
  async getHomeSections(): Promise<HomeSection[]> {
    const sectionsRef = ref(db, 'homeSections');
    const snapshot = await get(sectionsRef);
    if (!snapshot.exists()) return [];
    const data = snapshot.val();
    return Object.keys(data)
      .map(key => ({ ...data[key], id: key }))
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  },

  async saveHomeSection(section: Partial<HomeSection>): Promise<string> {
    const sectionsRef = ref(db, 'homeSections');
    const id = section.id || push(sectionsRef).key;
    if (!id) throw new Error('Could not generate ID');
    await set(ref(db, `homeSections/${id}`), {
      ...section,
      id,
      order: section.order ?? 0
    });
    return id;
  },

  async deleteHomeSection(id: string): Promise<void> {
    await remove(ref(db, `homeSections/${id}`));
  }
};
