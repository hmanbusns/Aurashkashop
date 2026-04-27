export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  rating: number;
  reviewsCount: number;
  imageUrl: string;
  additionalImages?: string[];
  videoUrl?: string;
  category: string | string[]; // Compatibility for single category, but moving to multiple
  categories?: string[]; // Array of categories
  ingredients?: string[];
  features?: string[];
  size?: string;
  order?: number;
  tags?: { text: string; color: string }[];
  customFields?: Record<string, string>;
  createdAt: number;
}

export type CategoryLayout = 'grid' | 'reel' | 'banner';

export interface Category {
  id: string;
  name: string;
  imageUrl: string;
  videoUrl?: string; // For reel-like video clips
  layoutType: CategoryLayout;
  order: number;
  imageSize?: number; // Size in px for the circle/icon
  textSize?: number; // Font size in px
  textColor?: string; // Color code
}

export interface BannerConfig {
  imageUrl: string;
  title: string;
  subtitle: string;
  buttonText: string;
  externalLink?: string;
}

export interface Address {
  id?: string;
  fullName: string;
  phone: string;
  email: string;
  street: string;
  city: string;
  district: string;
  state: string;
  pincode: string;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  phone?: string;
  role: 'user' | 'admin';
  createdAt: number;
  avatarUrl?: string;
  address?: Address | null;
  addresses?: Address[];
}

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

export interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  createdAt: number;
}

export interface HomeSection {
  id: string;
  title: string;
  layoutType: 'grid' | 'reel' | 'banner';
  dataSource: 'category' | 'products' | 'all';
  categoryId?: string; // If dataSource is 'category'
  productIds?: string[]; // If dataSource is 'products'
  order: number;
}
