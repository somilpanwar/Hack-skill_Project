// Product-related type definitions
export interface Product {
  _id?: string;
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  sellerId: string;
  sellerName: string;
  inStock: boolean;
  quantity: number;
  tags: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

// Extended Product interface for analytics dashboard
export interface AnalyticsProduct {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  sellerId: string;
  sellerName?: string;
  stock: number;
  status: string;
  views: number;
  purchaseCount: number;
  tags: string[];
  createdAt: string;
  updatedAt?: string;
}

export interface CreateProductRequest {
  name: string;
  description: string;
  price: number;
  category: string;
  images: File[];
  inStock: boolean;
  quantity: number;
  tags: string[];
}

export interface ProductFormData {
  name: string;
  description: string;
  price: string;
  category: string;
  inStock: boolean;
  quantity: string;
  tags: string;
  images: File[];
}

// Type for product data being sent from client (FormData fields)
export interface ClientProductData {
  name: string;
  description: string;
  price: string;
  category: string;
  inStock: string; // FormData sends boolean as string
  quantity: string;
  tags: string;
  sellerId: string;
  sellerName: string;
}

export const PRODUCT_CATEGORIES = [
  'Electronics',
  'Clothing & Fashion',
  'Home & Garden',
  'Sports & Outdoors',
  'Books & Media',
  'Toys & Games',
  'Health & Beauty',
  'Food & Beverages',
  'Art & Crafts',
  'Jewelry & Accessories',
  'Automotive',
  'Other'
] as const;

export type ProductCategory = typeof PRODUCT_CATEGORIES[number];