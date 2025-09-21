// eslint-disable-next-line @typescript-eslint/no-require-imports
const {  ObjectId } = require('mongodb');

// Product Schema Definition
const productSchema = {
  // Basic Product Information
  name: {
    type: String,
    required: true,
    trim: true,
    maxLength: 200
  },
  description: {
    type: String,
    required: true,
    maxLength: 2000
  },
  shortDescription: {
    type: String,
    maxLength: 300
  },
  
  // Pricing Information
  price: {
    type: Number,
    required: true,
    min: 0
  },
  originalPrice: {
    type: Number,
    min: 0
  },
  discount: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  
  // Product Category and Classification
  category: {
    type: String,
    required: true,
    enum: ['electronics', 'clothing', 'books', 'home', 'sports', 'beauty', 'toys', 'automotive', 'other']
  },
  subcategory: {
    type: String
  },
  tags: [{
    type: String
  }],
  
  // Product Images and Media
  images: [{
    url: String,
    altText: String,
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  
  // Inventory Management
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  sku: {
    type: String,
    unique: true
  },
  
  // Product Specifications
  specifications: {
    weight: String,
    dimensions: {
      length: String,
      width: String,
      height: String
    },
    color: String,
    size: String,
    material: String,
    brand: String,
    model: String
  },
  
  // Seller Information
  seller: {
    sellerId: {
      type: String, // Clerk user ID
      required: true
    },
    sellerName: String,
    sellerEmail: String
  },
  
  // Product Status and Visibility
  status: {
    type: String,
    enum: ['draft', 'active', 'inactive', 'out_of_stock', 'discontinued'],
    default: 'draft'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  
  // Shipping Information
  shipping: {
    weight: Number,
    freeShipping: {
      type: Boolean,
      default: false
    },
    shippingCost: {
      type: Number,
      default: 0
    },
    processingTime: String,
    shippingMethods: [String]
  },
  
  // SEO and Marketing
  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String]
  },
  
  // Product Analytics
  views: {
    type: Number,
    default: 0
  },
  purchaseCount: {
    type: Number,
    default: 0
  },
  rating: {
    average: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    count: {
      type: Number,
      default: 0
    }
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  
  // Additional Features
  variants: [{
    name: String, // e.g., "Color", "Size"
    options: [String] // e.g., ["Red", "Blue", "Green"]
  }],
  
  relatedProducts: [{
    type: String // Product IDs
  }]
};

// Validation function for product data
const validateProduct = (productData) => {
  const errors = [];
  
  // Required field validation
  if (!productData.name || productData.name.trim().length === 0) {
    errors.push('Product name is required');
  }
  
  if (!productData.description || productData.description.trim().length === 0) {
    errors.push('Product description is required');
  }
  
  if (!productData.price || productData.price <= 0) {
    errors.push('Valid price is required');
  }
  
  if (!productData.category) {
    errors.push('Product category is required');
  }
  
  if (!productData.seller || !productData.seller.sellerId) {
    errors.push('Seller information is required');
  }
  
  if (productData.stock < 0) {
    errors.push('Stock cannot be negative');
  }
  
  // Additional validations
  if (productData.name && productData.name.length > 200) {
    errors.push('Product name must be 200 characters or less');
  }
  
  if (productData.description && productData.description.length > 2000) {
    errors.push('Product description must be 2000 characters or less');
  }
  
  if (productData.discount && (productData.discount < 0 || productData.discount > 100)) {
    errors.push('Discount must be between 0 and 100');
  }
  
  return errors;
};

// Helper function to create a new product document
const createProductDocument = (productData) => {
  const now = new Date();
  
  return {
    _id: new ObjectId(),
    name: productData.name,
    description: productData.description,
    shortDescription: productData.shortDescription || '',
    price: parseFloat(productData.price),
    originalPrice: productData.originalPrice ? parseFloat(productData.originalPrice) : parseFloat(productData.price),
    discount: productData.discount || 0,
    category: productData.category,
    subcategory: productData.subcategory || '',
    tags: productData.tags || [],
    images: productData.images || [],
    stock: parseInt(productData.stock) || 0,
    sku: productData.sku || `SKU-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    specifications: productData.specifications || {},
    seller: {
      sellerId: productData.seller.sellerId,
      sellerName: productData.seller.sellerName || '',
      sellerEmail: productData.seller.sellerEmail || ''
    },
    status: productData.status || 'draft',
    isActive: productData.isActive !== undefined ? productData.isActive : true,
    isFeatured: productData.isFeatured || false,
    shipping: productData.shipping || {
      weight: 0,
      freeShipping: false,
      shippingCost: 0,
      processingTime: '1-3 business days',
      shippingMethods: ['standard']
    },
    seo: productData.seo || {},
    views: 0,
    purchaseCount: 0,
    rating: {
      average: 0,
      count: 0
    },
    createdAt: now,
    updatedAt: now,
    variants: productData.variants || [],
    relatedProducts: productData.relatedProducts || []
  };
};

module.exports = {
  productSchema,
  validateProduct,
  createProductDocument
};