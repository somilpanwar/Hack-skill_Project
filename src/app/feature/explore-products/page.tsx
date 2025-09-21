"use client"
import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import { Product } from '@/types/product'

const ExplorePage = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')

  const categories = ['electronics', 'clothing', 'books', 'home', 'sports', 'beauty', 'toys', 'automotive', 'other']

  const fetchProducts = async (search = '', category = '') => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      if (category) params.append('category', category)
      
      const response = await fetch(`http://localhost:5000/api/products?${params}`)
      const data = await response.json()
      
      if (data.success) {
        setProducts(data.data.products)
        setError(null)
      } else {
        setError(data.message || 'Failed to fetch products')
      }
    } catch (err) {
      setError('Failed to connect to server')
      console.error('Error fetching products:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchProducts(searchTerm, selectedCategory)
  }

  const handleCategoryFilter = (category: string) => {
    setSelectedCategory(category)
    fetchProducts(searchTerm, category)
  }

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedCategory('')
    fetchProducts()
  }
  return (
    <>
      <Navbar />
      <main>
        <div className='flex flex-col gap-5 items-center justify-center p-5'>
          <h1 className='text-6xl font-bold text-blue-800'>Explore Products</h1>
          <form onSubmit={handleSearch} className='w-1/2'>
            <input 
              type="text" 
              className='bg-gray-100 p-3 text-gray-500 rounded-xl placeholder:text-gray-500 w-full pl-5' 
              placeholder='Search products...' 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </form>
        </div>

        <div className='flex gap-3'>
          <div className='w-1/4 p-4 flex flex-col gap-2 justify-start bg-blue-500'>
            <h3 className='text-white font-bold mb-2'>Categories</h3>
            <button 
              onClick={clearFilters}
              className={`p-2 rounded text-left ${!selectedCategory ? 'bg-blue-700 text-white' : 'bg-white text-blue-500'}`}
            >
              All Categories
            </button>
            {categories.map((category) => (
              <button 
                key={category}
                onClick={() => handleCategoryFilter(category)}
                className={`p-2 rounded text-left capitalize ${selectedCategory === category ? 'bg-blue-700 text-white' : 'bg-white text-blue-500'}`}
              >
                {category}
              </button>
            ))}
          </div>

          <div className='bg-gray-100 w-full p-4'>
            {loading ? (
              <div className='flex justify-center items-center h-64'>
                <p className='text-xl'>Loading products...</p>
              </div>
            ) : error ? (
              <div className='flex justify-center items-center h-64'>
                <p className='text-xl text-red-500'>Error: {error}</p>
              </div>
            ) : products.length === 0 ? (
              <div className='flex justify-center items-center h-64'>
                <p className='text-xl'>No products found</p>
              </div>
            ) : (
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                {products.map((product) => (
                  <section key={product._id} className='p-4 rounded-lg bg-white shadow-md'>
                    <div className='mb-3'>
                      {product.images && product.images.length > 0 ? (
                        <Image
                          src={`http://localhost:5000/${product.images[0]}`}
                          height={200}
                          width={300}
                          alt={product.name}
                          className='w-full h-48 object-cover rounded'
                        />
                      ) : (
                        <div className='w-full h-48 bg-gray-300 rounded flex items-center justify-center'>
                          <span className='text-gray-500'>No Image</span>
                        </div>
                      )}
                    </div>
                    <h2 className='text-lg font-semibold mb-2 truncate'>{product.name}</h2>
                    <p className='text-sm text-gray-600 mb-2 line-clamp-2'>{product.description}</p>
                    <div className='flex justify-between items-center'>
                      <h3 className='text-xl font-bold text-green-600'>${product.price}</h3>
                      <span className='text-sm text-gray-500 capitalize'>{product.category}</span>
                    </div>
                    <div className='mt-2'>
                      <p className='text-sm text-gray-500'>Seller: {product.sellerName || 'Unknown'}</p>
                      <p className={`text-sm ${product.inStock ? 'text-green-500' : 'text-red-500'}`}>
                        {product.inStock ? 'In Stock' : 'Out of Stock'}
                      </p>
                    </div>
                  </section>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

export default ExplorePage