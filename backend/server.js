/* eslint-disable @typescript-eslint/no-require-imports */
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const multer = require('multer');
dotenv.config()
const { ClerkExpressWithAuth, default: clerkClient } =require('@clerk/clerk-sdk-node')
const { connectDB, getDB, COLLECTIONS } = require('./Schema/database');
const { validateProduct, createProductDocument } = require('./Schema/productSchema');
const { getAllProducts } = require('./Schema/productHelpers');

// Groq AI integration
const { Groq } = require('groq-sdk');
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || "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"
});

const app = express();
const PORT = 5000;

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/') // Make sure this directory exists
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname)
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB per file
    files: 5 // Maximum 5 files
  }
});

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

// Connect to MongoDB on server start
connectDB().catch(console.error);



app.post("/role", ClerkExpressWithAuth() ,async (req,res)=>{
   
   const { role ,Id } = req.body;
   if(!Id )
   {
     res.status(404).json({message:"useId not found"})
   }
   
    await clerkClient.users.updateUser(Id, {
      publicMetadata: { role }, // or privateMetadata for server-only
    });

    res.status(200).json({ success: true });
})

// GET user role
app.get("/role/:userId", ClerkExpressWithAuth(), async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const user = await clerkClient.users.getUser(userId);
    const userRole = user.publicMetadata?.role || "User"; // Default to "User" if no role set

    res.status(200).json({ 
      success: true, 
      role: userRole 
    });
  } catch (error) {
    console.error('Error fetching user role:', error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch user role",
      error: error.message 
    });
  }
})

// for seller 
app.post('/addProducts', ClerkExpressWithAuth(), upload.any(), async (req, res) => {
  try {  
    const productData = req.body;
    
    if (!productData || Object.keys(productData).length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: "No product data provided" 
      });
    }
    
    if (!productData.sellerId) {
      return res.status(401).json({ 
        success: false, 
        message: "User not authenticated" 
      });
    }

    // Get user details from Clerk to verify seller role
    const user = await clerkClient.users.getUser(productData.sellerId);
    const userRole = user.publicMetadata?.role;
  console.log(userRole);
  
    if (userRole !== 'Seller') {
      return res.status(403).json({ 
        success: false, 
        message: "Only sellers can add products" 
      });
    }

    // Add seller information to product data
    productData.seller = {
      sellerId: productData.sellerId,
      sellerName: user.firstName + ' ' + user.lastName,
      sellerEmail: user.emailAddresses[0]?.emailAddress
    };

    // Add file paths to product data
    if (req.files && req.files.length > 0) {
      productData.images = req.files.map(file => file.path);
    }

    // Validate product data
    const validationErrors = validateProduct(productData);
    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Validation failed", 
        errors: validationErrors 
      });
    }

    // Create product document
    const productDocument = createProductDocument(productData);

    // Insert product into database
    const db = getDB();
    const result = await db.collection(COLLECTIONS.PRODUCTS).insertOne(productDocument);

    if (result.acknowledged) {
      res.status(201).json({ 
        success: true, 
        message: "Product added successfully",
        productId: result.insertedId,
        product: productDocument
      });
    } else {
      res.status(500).json({ 
        success: false, 
        message: "Failed to add product" 
      });
    }

  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error",
      error: error.message 
    });
  }
});

// GET route to fetch all products
app.get('/api/products', async (req, res) => {
  try {
    const { page = 1, limit = 12, category, search, priceMin, priceMax } = req.query;
    
    const filters = {};
    if (category) filters.category = category;
    if (search) filters.search = search;
    if (priceMin) filters.priceMin = priceMin;
    if (priceMax) filters.priceMax = priceMax;

    const pagination = {
      page: parseInt(page),
      limit: parseInt(limit)
    };

    const result = await getAllProducts(filters, pagination);

    res.status(200).json({
      success: true,
      message: "Products fetched successfully",
      data: result
    });

  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch products",
      error: error.message
    });
  }
});

// Analytics Dashboard Route - Get seller's products
app.get('/api/seller/analytics', ClerkExpressWithAuth(), async (req, res) => {
  try {
    const { page = 1, limit = 10, status, category, search } = req.query;
    const { userId } = req.auth;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: "User not authenticated" 
      });
    }

    // Verify seller role
    const user = await clerkClient.users.getUser(userId);
    const userRole = user.publicMetadata?.role;
    
    if (userRole !== 'Seller') {
      return res.status(403).json({ 
        success: false, 
        message: "Access denied. Only sellers can view analytics dashboard" 
      });
    }

    const filters = { sellerId: userId };
    if (status) filters.status = status;
    if (category) filters.category = category;
    if (search) filters.search = search;

    const pagination = {
      page: parseInt(page),
      limit: parseInt(limit)
    };

    const result = await getAllProducts(filters, pagination);

    // Calculate analytics data
    const db = getDB();
    const totalProducts = await db.collection(COLLECTIONS.PRODUCTS)
      .countDocuments({ 'seller.sellerId': userId });
    
    const activeProducts = await db.collection(COLLECTIONS.PRODUCTS)
      .countDocuments({ 'seller.sellerId': userId, status: 'active' });
    
    const outOfStockProducts = await db.collection(COLLECTIONS.PRODUCTS)
      .countDocuments({ 'seller.sellerId': userId, stock: 0 });

    // Calculate total views and purchases
    const analyticsResult = await db.collection(COLLECTIONS.PRODUCTS)
      .aggregate([
        { $match: { 'seller.sellerId': userId } },
        {
          $group: {
            _id: null,
            totalViews: { $sum: "$views" },
            totalPurchases: { $sum: "$purchaseCount" },
            totalRevenue: { 
              $sum: { 
                $multiply: ["$price", "$purchaseCount"] 
              } 
            }
          }
        }
      ]).toArray();

    const analytics = analyticsResult[0] || {
      totalViews: 0,
      totalPurchases: 0,
      totalRevenue: 0
    };

    res.status(200).json({
      success: true,
      message: "Analytics data fetched successfully",
      data: {
        products: result.products,
        pagination: result.pagination,
        analytics: {
          totalProducts,
          activeProducts,
          outOfStockProducts,
          ...analytics
        }
      }
    });

  } catch (error) {
    console.error('Error fetching analytics data:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch analytics data",
      error: error.message
    });
  }
});

// Update product price and stock
app.put('/api/seller/product/:productId', ClerkExpressWithAuth(), async (req, res) => {
  try {
    const { productId } = req.params;
    const { price, stock } = req.body;
    const { userId } = req.auth;

    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: "User not authenticated" 
      });
    }

    // Verify seller role
    const user = await clerkClient.users.getUser(userId);
    const userRole = user.publicMetadata?.role;
    
    if (userRole !== 'Seller') {
      return res.status(403).json({ 
        success: false, 
        message: "Access denied. Only sellers can update products" 
      });
    }

    const db = getDB();
    const { ObjectId } = require('mongodb');

    // Check if product exists and belongs to the seller
    const product = await db.collection(COLLECTIONS.PRODUCTS)
      .findOne({ 
        _id: new ObjectId(productId), 
        'seller.sellerId': userId 
      });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found or you don't have permission to update it"
      });
    }

    // Prepare update data
    const updateData = {};
    if (price !== undefined) {
      if (price < 0) {
        return res.status(400).json({
          success: false,
          message: "Price cannot be negative"
        });
      }
      updateData.price = parseFloat(price);
    }
    
    if (stock !== undefined) {
      if (stock < 0) {
        return res.status(400).json({
          success: false,
          message: "Stock cannot be negative"
        });
      }
      updateData.stock = parseInt(stock);
      // Update status based on stock
      updateData.status = stock > 0 ? 'active' : 'out_of_stock';
    }

    updateData.updatedAt = new Date();

    // Update the product
    const result = await db.collection(COLLECTIONS.PRODUCTS)
      .updateOne(
        { _id: new ObjectId(productId) },
        { $set: updateData }
      );

    if (result.modifiedCount === 1) {
      res.status(200).json({
        success: true,
        message: "Product updated successfully"
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to update product"
      });
    }

  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
});

// Delete product
app.delete('/api/seller/product/:productId', ClerkExpressWithAuth(), async (req, res) => {
  try {
    const { productId } = req.params;
    const { userId } = req.auth;

    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: "User not authenticated" 
      });
    }

    // Verify seller role
    const user = await clerkClient.users.getUser(userId);
    const userRole = user.publicMetadata?.role;
    
    if (userRole !== 'Seller') {
      return res.status(403).json({ 
        success: false, 
        message: "Access denied. Only sellers can delete products" 
      });
    }

    const db = getDB();
    const { ObjectId } = require('mongodb');

    // Check if product exists and belongs to the seller
    const product = await db.collection(COLLECTIONS.PRODUCTS)
      .findOne({ 
        _id: new ObjectId(productId), 
        'seller.sellerId': userId 
      });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found or you don't have permission to delete it"
      });
    }

    // Delete the product
    const result = await db.collection(COLLECTIONS.PRODUCTS)
      .deleteOne({ _id: new ObjectId(productId) });

    if (result.deletedCount === 1) {
      res.status(200).json({
        success: true,
        message: "Product deleted successfully"
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to delete product"
      });
    }

  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
});

// Image enhancement functions using sharp
const sharp = require('sharp');

// Function to compress and resize image for AI processing
async function compressImageForAI(imageBuffer, maxSizeKB = 1000) {
  try {
    let quality = 80;
    let width = 1024; // Start with reasonable width
    let compressedBuffer;
    
    do {
      compressedBuffer = await sharp(imageBuffer)
        .resize(width, null, { 
          withoutEnlargement: true,
          fit: 'inside'
        })
        .jpeg({ quality }) // Convert to JPEG for better compression
        .toBuffer();
      
      const sizeKB = compressedBuffer.length / 1024;
      
      if (sizeKB <= maxSizeKB) {
        console.log(`Compressed image to ${sizeKB.toFixed(2)}KB with quality ${quality}% and width ${width}px`);
        return compressedBuffer;
      }
      
      // Reduce quality or size
      if (quality > 20) {
        quality -= 10;
      } else if (width > 512) {
        width -= 128;
        quality = 80; // Reset quality when reducing size
      } else {
        break;
      }
    } while (compressedBuffer.length / 1024 > maxSizeKB);
    
    console.log(`Final compressed size: ${(compressedBuffer.length / 1024).toFixed(2)}KB`);
    return compressedBuffer;
  } catch (error) {
    throw new Error(`Image compression failed: ${error.message}`);
  }
}

// Function to generate AI-powered description using Groq
async function generateAIDescription(imageBuffer, descriptionType) {
  try {
    console.log('Starting AI description generation...');
    console.log('Original image buffer size:', (imageBuffer.length / 1024).toFixed(2), 'KB');
    
    // Compress image for AI processing (1MB limit)
    const compressedImageBuffer = await compressImageForAI(imageBuffer, 1000);
    console.log('Compressed image buffer size:', (compressedImageBuffer.length / 1024).toFixed(2), 'KB');
    
    // Convert to base64 and create data URL
    const base64Image = compressedImageBuffer.toString('base64');
    const mimeType = 'image/jpeg';
    const dataUrl = `data:${mimeType};base64,${base64Image}`;
    
    // Create prompts based on description type - optimized for clean, copy-paste ready e-commerce listings
    let prompt;
    switch (descriptionType) {
      case 'basic':
        prompt = "Generate a clean, READY-TO-PASTE product description for this artwork without any asterisks (*) or markdown formatting. Structure it with clear sections using simple text formatting: 1) Start with an eye-catching product title 2) Write 4-5 key features as simple sentences, each on a new line 3) Follow with a compelling product description paragraph 4) Include dimensions, medium, and material details 5) End with suggested uses and benefits. Use plain text only with natural line breaks. Make it professional and SEO-friendly for direct copy-paste to any marketplace (Amazon, Etsy, eBay, Facebook). Focus on the artwork's subject, colors, style, and appeal to buyers.";
        break;
      case 'detailed':
        prompt = "Create a comprehensive, clean product listing for this artwork using PLAIN TEXT ONLY (no asterisks, no markdown, no special formatting). Structure it in clearly labeled sections: TITLE: (SEO-optimized product name), KEY FEATURES: (4-6 simple sentences about main benefits), DESCRIPTION: (detailed paragraph about the artwork), SPECIFICATIONS: (size, medium, materials), PERFECT FOR: (room suggestions and uses), CARE INSTRUCTIONS: (simple maintenance tips), WHY YOU'LL LOVE IT: (emotional benefits). Use natural language and line breaks for easy reading. Make it conversion-focused and ready to copy-paste into any e-commerce platform.";
        break;
      case 'creative':
        prompt = "Generate a premium, storytelling product listing for this artwork using clean, plain text formatting (absolutely no asterisks or special characters). Create a compelling narrative structure: HEADLINE: (attention-grabbing title), STORY: (emotional connection paragraph), HIGHLIGHTS: (4-5 benefit statements as simple sentences), STYLING IDEAS: (room and decor suggestions), VALUE PROPOSITION: (investment and gift benefits), CALL TO ACTION: (urgency statement). Write in luxury brand voice with persuasive language that creates desire. Format with clear section breaks and natural text flow for easy copy-paste to premium marketplaces and social media shops.";
        break;
      default:
        prompt = "Create a clean, copy-paste ready product description for this artwork using plain text only (no asterisks or special formatting), with clear sections and sales-focused language optimized for online marketplaces.";
    }
    
    console.log('Sending request to Groq AI...');
    console.log('Prompt type:', descriptionType);
    
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: prompt
            },
            {
              type: "image_url",
              image_url: {
                url: dataUrl
              }
            }
          ]
        }
      ],
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      temperature: descriptionType === 'creative' ? 0.8 : 0.3,
      max_completion_tokens: descriptionType === 'detailed' ? 1500 : descriptionType === 'creative' ? 1200 : 500,
      top_p: 1,
      stream: false,
      stop: null
    });

    console.log('Groq AI response received successfully');
    const aiDescription = chatCompletion.choices[0].message.content;
    console.log('AI Description length:', aiDescription.length, 'characters');
    
    return aiDescription;
  } catch (error) {
    console.error('Detailed Groq AI error:', {
      message: error.message,
      status: error.status,
      error: error.error,
      stack: error.stack
    });
    
    // Check if it's a specific API error
    if (error.status === 401) {
      throw new Error('Groq API authentication failed. Please check your API key.');
    } else if (error.status === 429) {
      throw new Error('Groq API rate limit exceeded. Please try again later.');
    } else if (error.status === 400) {
      throw new Error('Invalid image format or size for Groq AI processing.');
    } else {
      throw new Error(`AI description generation failed: ${error.message}`);
    }
  }
}

const enhanceImage = async (imageBuffer, options, outputFormat = 'jpeg') => {
  try {
    // Validate input buffer
    if (!imageBuffer || !Buffer.isBuffer(imageBuffer) || imageBuffer.length === 0) {
      throw new Error('Invalid image buffer: Buffer is empty, null, or not a valid Buffer object');
    }

    console.log('Image buffer size:', imageBuffer.length, 'bytes');
    
    let sharpInstance;
    try {
      sharpInstance = sharp(imageBuffer);
      // Test if sharp can read the image by getting metadata
      const metadata = await sharpInstance.metadata();
      console.log('Image metadata:', {
        format: metadata.format,
        width: metadata.width,
        height: metadata.height,
        channels: metadata.channels
      });
    } catch (sharpError) {
      throw new Error(`Sharp cannot process image: ${sharpError.message}. The file might be corrupted or in an unsupported format.`);
    }
    
    // Apply enhancements
    if (options.brightness !== 1.0 || options.contrast !== 1.0 || options.saturation !== 1.0) {
      sharpInstance = sharpInstance.modulate({
        brightness: options.brightness,
        saturation: options.saturation,
        hue: 0
      });
    }
    
    // Apply gamma correction
    if (options.gamma !== 1.0) {
      sharpInstance = sharpInstance.gamma(options.gamma);
    }
    
    // Apply sharpening
    if (options.sharpness > 0) {
      sharpInstance = sharpInstance.sharpen(options.sharpness);
    }
    
    // Apply upscaling if needed
    if (options.upscale > 1) {
      const metadata = await sharp(imageBuffer).metadata();
      const newWidth = Math.round(metadata.width * options.upscale);
      const newHeight = Math.round(metadata.height * options.upscale);
      sharpInstance = sharpInstance.resize(newWidth, newHeight, {
        kernel: sharp.kernel.lanczos3,
        fit: 'fill'
      });
    }
    
    // Set output format and quality
    if (outputFormat === 'png') {
      sharpInstance = sharpInstance.png({
        quality: Math.min(options.quality, 100),
        compressionLevel: 6
      });
    } else {
      sharpInstance = sharpInstance.jpeg({
        quality: Math.min(options.quality, 100),
        progressive: true
      });
    }
    
    return await sharpInstance.toBuffer();
  } catch (error) {
    console.error('Error in enhanceImage:', error);
    throw error;
  }
};

// Enhanced image processing route
app.post('/enhance-image', upload.single('image'), async (req, res) => {
  const fs = require('fs').promises;
  
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        message: 'No image file provided' 
      });
    }

    // Get output format from request (png or jpeg)
    const outputFormat = req.body.outputFormat || 'jpeg';
    
    if (!['png', 'jpeg'].includes(outputFormat)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid output format. Use png or jpeg.'
      });
    }

    // Enhanced options with better defaults
    const options = {
      brightness: parseFloat(req.body.brightness) || 1.2, // Slight brightness boost
      contrast: parseFloat(req.body.contrast) || 1.1,     // Slight contrast boost
      saturation: parseFloat(req.body.saturation) || 1.1,  // Slight saturation boost
      sharpness: parseFloat(req.body.sharpness) || 1,      // Default sharpening
      gamma: parseFloat(req.body.gamma) || 1.0,
      quality: parseInt(req.body.quality) || 90,
      upscale: parseFloat(req.body.upscale) || 1
    };

    console.log('Processing image:', req.file.originalname);
    console.log('File path:', req.file.path);
    console.log('Output format:', outputFormat);
    console.log('Enhancement options:', options);

    // Read the image file from disk since we're using diskStorage
    const imageBuffer = await fs.readFile(req.file.path);
    
    if (!imageBuffer || imageBuffer.length === 0) {
      throw new Error('Failed to read image file or file is empty');
    }

    // Process the image
    const processedBuffer = await enhanceImage(imageBuffer, options, outputFormat);

    // Convert processed image to base64 for frontend
    const base64Image = processedBuffer.toString('base64');
    const mimeType = outputFormat === 'png' ? 'image/png' : 'image/jpeg';

    // Prepare response data matching frontend expectations
    const responseData = {
      success: true,
      message: 'Image enhanced successfully',
      data: {
        [outputFormat]: `data:${mimeType};base64,${base64Image}`
      },
      originalSize: req.file.size,
      processedSize: processedBuffer.length,
      format: outputFormat
    };

    // Send response to frontend
    res.json(responseData);

    // Delete the uploaded file after successful response
    try {
      await fs.unlink(req.file.path);
      console.log('Uploaded file deleted successfully:', req.file.path);
    } catch (deleteError) {
      console.error('Error deleting uploaded file:', deleteError);
    }

  } catch (error) {
    console.error('Image processing error:', error);
    console.error('Error stack:', error.stack);
    
    // Delete the uploaded file even if processing failed
    if (req.file && req.file.path) {
      try {
        await fs.unlink(req.file.path);
        console.log('Uploaded file deleted after error:', req.file.path);
      } catch (deleteError) {
        console.error('Error deleting uploaded file after processing error:', deleteError);
      }
    }
    
    // Provide more specific error messages
    let errorMessage = 'Image processing failed';
    if (error.message.includes('Invalid image buffer')) {
      errorMessage = 'The uploaded file appears to be corrupted or is not a valid image';
    } else if (error.message.includes('Sharp cannot process image')) {
      errorMessage = 'The image format is not supported or the file is corrupted';
    } else if (error.message.includes('Input file is missing') || error.message.includes('Input buffer contains unsupported image format')) {
      errorMessage = 'Invalid image format. Please upload a valid image file (PNG, JPEG, JPG, WebP)';
    }
    
    res.status(500).json({
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : 'Processing error'
    });
  }
});

// Auto Description route for Phase 2 with AI integration
app.post('/autoDescription', upload.single('image'), async (req, res) => {
  const fs = require('fs').promises;
  
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        message: 'No image file provided' 
      });
    }

    // Get description type from request
    const descriptionType = req.body.descriptionType || 'basic';
    const useAI = req.body.useAI !== 'false'; // Default to true, allow disabling for fallback
    
    if (!['basic', 'detailed', 'creative'].includes(descriptionType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid description type. Use basic, detailed, or creative.'
      });
    }

    console.log('Processing image for description:', req.file.originalname);
    console.log('Description type:', descriptionType);
    console.log('Use AI:', useAI);

    // Read the image file from disk
    const imageBuffer = await fs.readFile(req.file.path);
    
    if (!imageBuffer || imageBuffer.length === 0) {
      throw new Error('Failed to read image file or file is empty');
    }

    // Get image metadata using sharp for context
    const metadata = await sharp(imageBuffer).metadata();
    console.log('Image metadata:', {
      format: metadata.format,
      width: metadata.width,
      height: metadata.height,
      channels: metadata.channels
    });

    let description;
    let generationMethod;

    try {
      if (useAI) {
        // Phase 2: Use AI to generate intelligent descriptions
        console.log('Attempting AI-powered description generation...');
        description = await generateAIDescription(imageBuffer, descriptionType);
        generationMethod = 'AI-powered (Groq LLaMA Vision)';
        console.log('✅ AI description generated successfully');
      } else {
        throw new Error('AI disabled, using fallback');
      }
    } catch (aiError) {
      console.warn('❌ AI description failed:', aiError.message);
      console.warn('🔄 Falling back to enhanced rule-based generation...');
      // Fallback to enhanced artistic description generation
      description = generateBasicDescription(metadata, descriptionType);
      generationMethod = 'Enhanced rule-based (AI unavailable)';
      console.log('✅ Fallback description generated successfully');
    }

    // Prepare response
    const responseData = {
      success: true,
      message: 'Description generated successfully',
      description: description,
      descriptionType: descriptionType,
      generationMethod: generationMethod,
      imageMetadata: {
        format: metadata.format,
        width: metadata.width,
        height: metadata.height,
        size: req.file.size
      }
    };

    // Send response to frontend
    res.json(responseData);

    // Delete the uploaded file after successful response
    try {
      await fs.unlink(req.file.path);
      console.log('Uploaded file deleted successfully:', req.file.path);
    } catch (deleteError) {
      console.error('Error deleting uploaded file:', deleteError);
    }

  } catch (error) {
    console.error('Description generation error:', error);
    console.error('Error stack:', error.stack);
    
    // Delete the uploaded file even if processing failed
    if (req.file && req.file.path) {
      try {
        await fs.unlink(req.file.path);
        console.log('Uploaded file deleted after error:', req.file.path);
      } catch (deleteError) {
        console.error('Error deleting uploaded file after processing error:', deleteError);
      }
    }
    
    // Provide specific error messages
    let errorMessage = 'Description generation failed';
    if (error.message.includes('Failed to read image file')) {
      errorMessage = 'The uploaded file appears to be corrupted or is not a valid image';
    } else if (error.message.includes('Input file is missing')) {
      errorMessage = 'Invalid image format. Please upload a valid image file (PNG, JPEG, JPG, WebP)';
    } else if (error.message.includes('AI description generation failed')) {
      errorMessage = 'AI service is temporarily unavailable. Please try again later.';
    }
    
    res.status(500).json({
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : 'Processing error'
    });
  }
});

// Helper function for improved fallback description generation (for artists)
const generateBasicDescription = (metadata, descriptionType) => {
  const { format, width, height } = metadata;
  const aspectRatio = width / height;
  
  let orientation = 'square';
  if (aspectRatio > 1.2) orientation = 'landscape';
  else if (aspectRatio < 0.8) orientation = 'portrait';
  
  const resolution = width * height;
  let qualityLevel = 'standard';
  if (resolution > 2000000) qualityLevel = 'high';
  else if (resolution < 500000) qualityLevel = 'low';

  // Improved artistic descriptions for creators
  switch (descriptionType) {
    case 'basic':
      return `This is a ${qualityLevel}-resolution ${orientation} artwork in ${format.toUpperCase()} format (${width}×${height} pixels). The piece appears to be a digital creation or photograph with ${getArtisticQualityDescription(resolution)}. This format is ideal for ${getArtisticUsageSuggestion(resolution, orientation, format)}.`;
    
    case 'detailed':
      return `🎨 Artwork Analysis:

📏 Technical Specifications:
• Format: ${format.toUpperCase()}
• Dimensions: ${width} × ${height} pixels
• Orientation: ${orientation.charAt(0).toUpperCase() + orientation.slice(1)}
• Resolution: ${qualityLevel.charAt(0).toUpperCase() + qualityLevel.slice(1)} quality (${(resolution / 1000000).toFixed(1)}MP)
• Aspect Ratio: ${aspectRatio.toFixed(2)}:1

🎯 Artistic Assessment:
• ${getArtisticStyleGuess(aspectRatio)}
• ${getQualityAssessment(resolution, format)}
• ${getCompositionNotes(orientation, aspectRatio)}

💡 Recommended Applications:
${getDetailedArtisticUsage(resolution, orientation, format)}

📱 Platform Suitability:
${getPlatformRecommendations(aspectRatio, resolution)}`;
    
    case 'creative':
      return `🌟 Artistic Vision Statement:

This ${orientation} composition ${getCreativeArtisticDescription(orientation, aspectRatio)} within a ${width}×${height} pixel canvas. 

${getCreativeStyleDescription(resolution)} The ${qualityLevel} resolution ${getCreativeQualityNarrative(resolution, orientation)}.

This digital masterpiece ${getCreativeCompositionStory(aspectRatio)} and ${getCreativeImpactDescription(qualityLevel, format)}.

✨ Perfect for: ${getCreativeArtisticUsage(resolution, orientation)}

🎭 Artistic Legacy: ${getCreativeLegacyDescription(resolution, aspectRatio)}`;
    
    default:
      return `This is an artistic work in ${format.toUpperCase()} format with ${width}×${height} resolution, suitable for digital display and sharing.`;
  }
};

// Enhanced helper functions for artistic descriptions
const getArtisticQualityDescription = (resolution) => {
  if (resolution > 2000000) return `professional-grade detail suitable for gallery display`;
  if (resolution > 500000) return `excellent clarity perfect for online portfolios and social media`;
  return `good quality ideal for web sharing and digital portfolios`;
};

const getArtisticUsageSuggestion = (resolution, orientation, format) => {
  const suggestions = [];
  if (resolution > 2000000) suggestions.push('fine art prints', 'gallery exhibitions');
  if (resolution > 500000) suggestions.push('portfolio showcases', 'social media features');
  if (orientation === 'landscape') suggestions.push('banner displays', 'website headers');
  if (orientation === 'portrait') suggestions.push('mobile viewing', 'story posts');
  if (format === 'png') suggestions.push('transparent overlays', 'logo work');
  return suggestions.slice(0, 3).join(', ') || 'digital art sharing';
};

const getArtisticStyleGuess = (aspectRatio) => {
  if (aspectRatio > 2) return 'Panoramic composition suggesting landscape or architectural photography';
  if (aspectRatio < 0.5) return 'Vertical composition ideal for portrait work or dramatic scenes';
  if (Math.abs(aspectRatio - 1) < 0.1) return 'Square format popular in contemporary digital art and social media';
  if (aspectRatio > 1.3) return 'Widescreen format excellent for cinematic or narrative artwork';
  return 'Classic proportions suitable for traditional or digital art presentation';
};

const getQualityAssessment = (resolution, format) => {
  const quality = resolution > 2000000 ? 'museum-quality' : resolution > 500000 ? 'professional-grade' : 'web-optimized';
  const formatBenefit = format === 'png' ? 'with lossless quality preservation' : 
                       format === 'jpeg' ? 'with efficient compression for sharing' : 
                       'optimized for digital distribution';
  return `${quality} resolution ${formatBenefit}`;
};

const getCompositionNotes = (orientation, aspectRatio) => {
  switch (orientation) {
    case 'landscape': return `Wide composition (${aspectRatio.toFixed(2)}:1) creates expansive visual flow`;
    case 'portrait': return `Vertical composition (${aspectRatio.toFixed(2)}:1) draws focus upward`;
    default: return `Balanced square composition provides harmony and focus`;
  }
};

const getDetailedArtisticUsage = (resolution, orientation, format) => {
  const uses = [];
  if (resolution > 2000000) uses.push('• Print reproductions and gallery displays');
  if (resolution > 500000) uses.push('• Online portfolio and artist websites');
  uses.push('• Social media platforms (Instagram, Pinterest, Twitter)');
  if (orientation === 'landscape') uses.push('• Website banners and header images');
  if (orientation === 'portrait') uses.push('• Mobile-first social content');
  if (format === 'png') uses.push('• Merchandise design and transparent graphics');
  return uses.join('\n');
};

const getPlatformRecommendations = (aspectRatio, resolution) => {
  const platforms = [];
  if (Math.abs(aspectRatio - 1) < 0.1) platforms.push('Instagram posts');
  if (aspectRatio > 1.5) platforms.push('Twitter headers', 'Facebook covers');
  if (aspectRatio < 0.8) platforms.push('Instagram Stories', 'Pinterest pins');
  if (resolution > 1000000) platforms.push('Behance', 'DeviantArt');
  platforms.push('Artist portfolio sites');
  return platforms.join(' • ');
};

const getCreativeArtisticDescription = (orientation, aspectRatio) => {
  if (orientation === 'landscape') return aspectRatio > 2 ? 'sweeps across the visual field like a cinematic panorama' : 'unfolds like a story waiting to be told';
  if (orientation === 'portrait') return aspectRatio < 0.5 ? 'rises like a tower of creative expression' : 'stands with dignified artistic presence';
  return 'achieves perfect balance in its square embrace of creative energy';
};

const getCreativeStyleDescription = (resolution) => {
  if (resolution > 2000000) return `Crafted with meticulous attention to detail, each pixel holds artistic intention.`;
  if (resolution > 500000) return `Created with professional precision, balancing quality and accessibility.`;
  return `Designed with focused artistic vision, prioritizing creative expression.`;
};

const getCreativeQualityNarrative = (resolution, orientation) => {
  const quality = resolution > 2000000 ? 'captures every nuance of the artist\'s vision' : 
                 resolution > 500000 ? 'preserves the essential beauty of the creation' : 
                 'distills the artwork to its emotional core';
  const orient = orientation === 'landscape' ? 'spreading its influence across the viewer\'s perspective' : 
                orientation === 'portrait' ? 'commanding attention with vertical authority' : 
                'embracing viewers with perfect symmetry';
  return `${quality}, ${orient}`;
};

const getCreativeCompositionStory = (aspectRatio) => {
  if (aspectRatio > 1.8) return 'stretches the boundaries of conventional framing';
  if (aspectRatio < 0.6) return 'defies horizontal expectations with bold verticality';
  return 'honors classical proportions while embracing modern digital artistry';
};

const getCreativeImpactDescription = (qualityLevel, format) => {
  const quality = qualityLevel === 'high' ? 'radiates professional excellence' : 
                 qualityLevel === 'standard' ? 'balances artistry with accessibility' : 
                 'focuses on pure creative expression';
  const format_desc = format === 'png' ? 'preserving transparency like captured light' : 
                     format === 'jpeg' ? 'optimized for widespread appreciation' : 
                     'digitally crafted for modern viewing';
  return `${quality}, ${format_desc}`;
};

const getCreativeArtisticUsage = (resolution, orientation) => {
  const uses = [];
  if (resolution > 2000000) uses.push('gallery exhibitions', 'fine art prints');
  uses.push('digital art portfolios', 'creative showcases');
  if (orientation === 'landscape') uses.push('immersive displays', 'artistic banners');
  if (orientation === 'portrait') uses.push('statement pieces', 'mobile art experiences');
  uses.push('artistic social media', 'creative inspiration boards');
  return uses.join(', ');
};

const getCreativeLegacyDescription = (resolution, aspectRatio) => {
  if (resolution > 2000000 && aspectRatio > 1.5) return 'This piece stands ready to inspire across digital galleries and physical spaces alike';
  if (resolution > 500000) return 'A digital artwork positioned to touch hearts and minds in our connected world';
  return 'A creative expression ready to find its audience in the vast digital landscape';
};
 

app.listen(PORT , ()=>console.log("server is running...."))