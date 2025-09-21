"use client";

import React, { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ProductFormData, PRODUCT_CATEGORIES } from '@/types/product';
import { Upload, X, Plus, DollarSign, Package, Tag, FileText, Camera } from 'lucide-react';
import { json } from 'stream/consumers';

const AddProductPage = () => {
    const { user, isSignedIn } = useUser();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState<ProductFormData>({
        name: '',
        description: '',
        price: '',
        category: '',
        inStock: true,
        quantity: '1',
        tags: '',
        images: []
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }));
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newImages = Array.from(e.target.files);
            setFormData(prev => ({
                ...prev,
                images: [...prev.images, ...newImages].slice(0, 5) // Max 5 images
            }));
        }
    };

    const removeImage = (index: number) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isSignedIn) {
            alert('Please sign in to add products');
            return;
        }

        setIsSubmitting(true);

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('name', formData.name);
            formDataToSend.append('description', formData.description);
            formDataToSend.append('price', formData.price);
            formDataToSend.append('category', formData.category);
            formDataToSend.append('inStock', formData.inStock.toString());
            formDataToSend.append('quantity', formData.quantity);
            formDataToSend.append('tags', formData.tags);
            formDataToSend.append('sellerId', user.id);
            formDataToSend.append('sellerName', user.fullName || user.emailAddresses[0]?.emailAddress || 'Unknown');


            // Append images
            formData.images.forEach((image, index) => {
                formDataToSend.append(`image${index}`, image);
            });



      const response = await fetch('http://localhost:5000/addProducts', {
        method: 'POST',
        // Don't set Content-Type header when sending FormData
        // The browser will automatically set it with the correct boundary
        body: formDataToSend,
      });            if (response.ok) {
                alert('Product added successfully!');
                router.push('/'); // Redirect to home page
            } else {
                const error = await response.json();
                alert(error.message || 'Failed to add product');
            }
        } catch (error) {
            console.error('Error adding product:', error);
            alert('Failed to add product. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isSignedIn) {
        return (
            <>
                <Navbar />
                <div className="min-h-[80vh] flex items-center justify-center">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-gray-700 mb-4">Please Sign In</h1>
                        <p className="text-gray-500">You need to sign in to add products.</p>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Navbar />
            <main className="min-h-[80vh] bg-gradient-to-b from-white to-indigo-50 text-black">
                <div className="container mx-auto px-4 py-8">
                    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold text-indigo-600 mb-2">Add New Product</h1>
                            <p className="text-gray-600">Share your amazing products with the community</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-8">
                            {/* Product Images */}
                            <div className="space-y-4">
                                <label className="flex items-center text-lg font-semibold text-gray-700">
                                    <Camera className="mr-2" size={20} />
                                    Product Images
                                </label>

                                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                    {formData.images.map((image, index) => (
                                        <div key={index} className="relative group">
                                            <img
                                                src={URL.createObjectURL(image)}
                                                alt={`Product ${index + 1}`}
                                                className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(index)}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ))}

                                    {formData.images.length < 5 && (
                                        <label className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition-colors">
                                            <div className="text-center">
                                                <Plus className="mx-auto mb-2 text-gray-400" size={24} />
                                                <span className="text-sm text-gray-600">Add Image</span>
                                            </div>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                multiple
                                                onChange={handleImageUpload}
                                                className="hidden"
                                            />
                                        </label>
                                    )}
                                </div>
                                <p className="text-sm text-gray-500">Upload up to 5 images (JPEG, PNG, WebP)</p>
                            </div>

                            {/* Product Name */}
                            <div className="space-y-2">
                                <label htmlFor="name" className="flex items-center text-lg font-semibold text-gray-700">
                                    <Package className="mr-2" size={20} />
                                    Product Name*
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    placeholder="Enter product name"
                                />
                            </div>

                            {/* Product Description */}
                            <div className="space-y-2">
                                <label htmlFor="description" className="flex items-center text-lg font-semibold text-gray-700">
                                    <FileText className="mr-2" size={20} />
                                    Description*
                                </label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    required
                                    rows={4}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    placeholder="Describe your product in detail"
                                />
                            </div>

                            {/* Price and Category Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Price */}
                                <div className="space-y-2">
                                    <label htmlFor="price" className="flex items-center text-lg font-semibold text-gray-700">
                                        <DollarSign className="mr-2" size={20} />
                                        Price*
                                    </label>
                                    <input
                                        type="number"
                                        id="price"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleInputChange}
                                        required
                                        min="0"
                                        step="0.01"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        placeholder="0.00"
                                    />
                                </div>

                                {/* Category */}
                                <div className="space-y-2">
                                    <label htmlFor="category" className="flex items-center text-lg font-semibold text-gray-700">
                                        <Tag className="mr-2" size={20} />
                                        Category*
                                    </label>
                                    <select
                                        id="category"
                                        name="category"
                                        value={formData.category}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    >
                                        <option value="">Select a category</option>
                                        {PRODUCT_CATEGORIES.map(category => (
                                            <option key={category} value={category}>
                                                {category}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Quantity and Stock Status */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Quantity */}
                                <div className="space-y-2">
                                    <label htmlFor="quantity" className="text-lg font-semibold text-gray-700">
                                        Quantity Available*
                                    </label>
                                    <input
                                        type="number"
                                        id="quantity"
                                        name="quantity"
                                        value={formData.quantity}
                                        onChange={handleInputChange}
                                        required
                                        min="0"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        placeholder="Enter quantity"
                                    />
                                </div>

                                {/* In Stock Checkbox */}
                                <div className="flex items-center space-x-3 pt-8">
                                    <input
                                        type="checkbox"
                                        id="inStock"
                                        name="inStock"
                                        checked={formData.inStock}
                                        onChange={handleInputChange}
                                        className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                    />
                                    <label htmlFor="inStock" className="text-lg font-semibold text-gray-700">
                                        Currently in stock
                                    </label>
                                </div>
                            </div>

                            {/* Tags */}
                            <div className="space-y-2">
                                <label htmlFor="tags" className="text-lg font-semibold text-gray-700">
                                    Tags (comma-separated)
                                </label>
                                <input
                                    type="text"
                                    id="tags"
                                    name="tags"
                                    value={formData.tags}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    placeholder="e.g., handmade, vintage, organic"
                                />
                                <p className="text-sm text-gray-500">Separate tags with commas to help customers find your product</p>
                            </div>

                            {/* Submit Button */}
                            <div className="flex justify-center pt-6">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {isSubmitting ? 'Adding Product...' : 'Add Product'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
};

export default AddProductPage;