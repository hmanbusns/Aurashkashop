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
  category: string;
  ingredients?: string[];
  features?: string[];
  size?: string;
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

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  phone: string;
  role: 'user' | 'admin';
  createdAt: number;
  avatarUrl?: string;
}

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';
