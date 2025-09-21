/* eslint-disable @typescript-eslint/no-require-imports */
const { getDB, COLLECTIONS } = require('./database');
const { ObjectId } = require('mongodb');

// Get all products
const getAllProducts = async (filters = {}, pagination = {}) => {
  try {
    const db = getDB();
    const { page = 1, limit = 10 } = pagination;
    const skip = (page - 1) * limit;

    // Build query
    const query = { isActive: true };
    
    if (filters.category) {
      query.category = { $regex: new RegExp(`^${filters.category}$`, 'i') };
    }
    
    if (filters.sellerId) {
      query['seller.sellerId'] = filters.sellerId;
    }
    
    if (filters.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: 'i' } },
        { description: { $regex: filters.search, $options: 'i' } },
        { tags: { $in: [new RegExp(filters.search, 'i')] } }
      ];
    }
    
    if (filters.priceMin || filters.priceMax) {
      query.price = {};
      if (filters.priceMin) query.price.$gte = parseFloat(filters.priceMin);
      if (filters.priceMax) query.price.$lte = parseFloat(filters.priceMax);
    }

    const products = await db.collection(COLLECTIONS.PRODUCTS)
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const total = await db.collection(COLLECTIONS.PRODUCTS).countDocuments(query);

    return {
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    throw new Error(`Error fetching products: ${error.message}`);
  }
};

// Get product by ID
const getProductById = async (productId) => {
  try {
    const db = getDB();
    const product = await db.collection(COLLECTIONS.PRODUCTS)
      .findOne({ _id: new ObjectId(productId) });
    
    if (!product) {
      throw new Error('Product not found');
    }

    // Increment view count
    await db.collection(COLLECTIONS.PRODUCTS)
      .updateOne(
        { _id: new ObjectId(productId) },
        { $inc: { views: 1 } }
      );

    return product;
  } catch (error) {
    throw new Error(`Error fetching product: ${error.message}`);
  }
};

// Get products by seller
const getProductsBySeller = async (sellerId, pagination = {}) => {
  try {
    const filters = { sellerId };
    return await getAllProducts(filters, pagination);
  } catch (error) {
    throw new Error(`Error fetching seller products: ${error.message}`);
  }
};

// Update product
const updateProduct = async (productId, updateData, sellerId) => {
  try {
    const db = getDB();
    
    // Verify product belongs to seller
    const product = await db.collection(COLLECTIONS.PRODUCTS)
      .findOne({ _id: new ObjectId(productId) });
    
    if (!product) {
      throw new Error('Product not found');
    }
    
    if (product.seller.sellerId !== sellerId) {
      throw new Error('Unauthorized to update this product');
    }

    // Add updated timestamp
    updateData.updatedAt = new Date();

    const result = await db.collection(COLLECTIONS.PRODUCTS)
      .updateOne(
        { _id: new ObjectId(productId) },
        { $set: updateData }
      );

    if (result.matchedCount === 0) {
      throw new Error('Product not found');
    }

    return await db.collection(COLLECTIONS.PRODUCTS)
      .findOne({ _id: new ObjectId(productId) });
  } catch (error) {
    throw new Error(`Error updating product: ${error.message}`);
  }
};

// Delete product
const deleteProduct = async (productId, sellerId) => {
  try {
    const db = getDB();
    
    // Verify product belongs to seller
    const product = await db.collection(COLLECTIONS.PRODUCTS)
      .findOne({ _id: new ObjectId(productId) });
    
    if (!product) {
      throw new Error('Product not found');
    }
    
    if (product.seller.sellerId !== sellerId) {
      throw new Error('Unauthorized to delete this product');
    }

    const result = await db.collection(COLLECTIONS.PRODUCTS)
      .deleteOne({ _id: new ObjectId(productId) });

    return result.deletedCount > 0;
  } catch (error) {
    throw new Error(`Error deleting product: ${error.message}`);
  }
};

// Update product stock
const updateProductStock = async (productId, quantity, operation = 'decrease') => {
  try {
    const db = getDB();
    const updateOperation = operation === 'decrease' ? { $inc: { stock: -quantity } } : { $inc: { stock: quantity } };

    const result = await db.collection(COLLECTIONS.PRODUCTS)
      .updateOne(
        { _id: new ObjectId(productId), stock: { $gte: operation === 'decrease' ? quantity : 0 } },
        updateOperation
      );

    if (result.matchedCount === 0) {
      throw new Error('Insufficient stock or product not found');
    }

    return await db.collection(COLLECTIONS.PRODUCTS)
      .findOne({ _id: new ObjectId(productId) });
  } catch (error) {
    throw new Error(`Error updating stock: ${error.message}`);
  }
};

// Get featured products
const getFeaturedProducts = async (limit = 10) => {
  try {
    const db = getDB();
    const products = await db.collection(COLLECTIONS.PRODUCTS)
      .find({ isFeatured: true, isActive: true })
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();

    return products;
  } catch (error) {
    throw new Error(`Error fetching featured products: ${error.message}`);
  }
};

// Search products
const searchProducts = async (searchTerm, filters = {}, pagination = {}) => {
  try {
    filters.search = searchTerm;
    return await getAllProducts(filters, pagination);
  } catch (error) {
    throw new Error(`Error searching products: ${error.message}`);
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  getProductsBySeller,
  updateProduct,
  deleteProduct,
  updateProductStock,
  getFeaturedProducts,
  searchProducts
};