/* eslint-disable @typescript-eslint/no-require-imports */
const { MongoClient } = require('mongodb');
require('dotenv').config();

let db;
let client;

const connectDB = async () => {
  try {
    if (db) {
      return db; // Return existing connection
    }

    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
    const dbName = process.env.DB_NAME || 'hack2skill_marketplace';
    
    client = new MongoClient(uri, {
      useUnifiedTopology: true,
    });

    await client.connect();
    db = client.db(dbName);
    
    console.log('Connected to MongoDB successfully');
    return db;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};

const getDB = () => {
  if (!db) {
    throw new Error('Database not connected. Call connectDB first.');
  }
  return db;
};

const closeDB = async () => {
  if (client) {
    await client.close();
    db = null;
    client = null;
    console.log('MongoDB connection closed');
  }
};

// Collection names
const COLLECTIONS = {
  PRODUCTS: 'products',
  USERS: 'users',
  ORDERS: 'orders',
  REVIEWS: 'reviews'
};

module.exports = {
  connectDB,
  getDB,
  closeDB,
  COLLECTIONS
};