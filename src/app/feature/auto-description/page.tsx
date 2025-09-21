"use client"
import React, { useState, useRef } from 'react'
import Image from 'next/image'
import { Upload, FileText, Image as ImageIcon, Loader2, AlertCircle, CheckCircle, Sparkles, Copy, Check } from 'lucide-react'

const AutoDescriptionPage = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [description, setDescription] = useState<string | null>(null)
  const [descriptionType, setDescriptionType] = useState<'basic' | 'detailed' | 'creative'>('basic')
  const [isTestingAPI, setIsTestingAPI] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file')
        return
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB')
        return
      }

      setSelectedFile(file)
      setError(null)
      setSuccess(null)
      setDescription(null)
      
      
      // Create preview URL
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
  }

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    const file = event.dataTransfer.files[0]
    if (file) {
      // Create a new FileList-like object for the dropped file
      const dataTransfer = new DataTransfer()
      dataTransfer.items.add(file)
      
      if (fileInputRef.current) {
        fileInputRef.current.files = dataTransfer.files
        const changeEvent = new Event('change', { bubbles: true })
        fileInputRef.current.dispatchEvent(changeEvent)
      }
    }
  }


  const generateDescription = async () => {
    if (!selectedFile) {
      setError('Please select an image first')
      return
    }

    setIsLoading(true)
    setError(null)
    setSuccess(null)
    setDescription(null)

    try {
      const formData = new FormData()
      formData.append('image', selectedFile)
      formData.append('descriptionType', descriptionType)

      const response = await fetch('http://localhost:5000/autoDescription', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`)
      }

      const result = await response.json()
      
      if (result.success) {
        setDescription(result.description)
        setSuccess(`Description generated successfully! with AI '`)
      } else {
        throw new Error(result.message || 'Description generation failed')
      }

    } catch (err) {
      console.error('Description generation error:', err);
      let errorMessage = 'An error occurred during description generation'
      
      if (err instanceof Error) {
        if (err.message.includes('Server error: 500')) {
          errorMessage = 'Image processing failed. Please check if the image is valid and try again.'
        } else if (err.message.includes('Server error: 400')) {
          errorMessage = 'Invalid image file. Please select a valid image format.'
        } else if (err.message.includes('fetch')) {
          errorMessage = 'Cannot connect to server. Please ensure the backend is running.'
        } else {
          errorMessage = err.message
        }
      }
      
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = async () => {
    if (description) {
      try {
        await navigator.clipboard.writeText(description)
        setIsCopied(true)
        setSuccess('Description copied to clipboard!')
        
        // Reset the copied state after 2 seconds
        setTimeout(() => {
          setIsCopied(false)
        }, 2000)
      } catch {
        setError('Failed to copy to clipboard')
      }
    }
  }

  const resetForm = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    setError(null)
    setSuccess(null)
    setDescription(null)
    setIsCopied(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-purple-800 mb-2 flex items-center justify-center gap-2">
            <Sparkles className="w-8 h-8" />
            AI Image Description Generator
          </h1>
          <p className="text-gray-600">
            Upload an image and get AI-generated descriptions with different styles
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="space-y-6">
            {/* File Upload Area */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-purple-100">
              <h2 className="text-xl font-semibold text-purple-700 mb-4 flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Upload Image
              </h2>
              
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className="border-2 border-dashed border-purple-200 rounded-lg p-8 text-center hover:border-purple-300 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <ImageIcon className="w-12 h-12 text-purple-300 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">
                  Click to select an image or drag and drop
                </p>
                <p className="text-sm text-gray-400">
                  Supports PNG, JPEG, JPG, WebP (Max 10MB)
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            </div>

            {/* Description Type Selection */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-purple-100">
              <h3 className="text-lg font-semibold text-purple-700 mb-4">
                Description Style
              </h3>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-purple-50 transition-colors">
                  <input
                    type="radio"
                    name="descriptionType"
                    value="basic"
                    checked={descriptionType === 'basic'}
                    onChange={(e) => setDescriptionType(e.target.value as 'basic' | 'detailed' | 'creative')}
                    className="text-purple-600"
                  />
                  <div>
                    <span className="text-gray-700 font-medium">Basic</span>
                    <p className="text-sm text-gray-500">Simple, concise description</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-purple-50 transition-colors">
                  <input
                    type="radio"
                    name="descriptionType"
                    value="detailed"
                    checked={descriptionType === 'detailed'}
                    onChange={(e) => setDescriptionType(e.target.value as 'basic' | 'detailed' | 'creative')}
                    className="text-purple-600"
                  />
                  <div>
                    <span className="text-gray-700 font-medium">Detailed</span>
                    <p className="text-sm text-gray-500">Comprehensive analysis with specifics</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-purple-50 transition-colors">
                  <input
                    type="radio"
                    name="descriptionType"
                    value="creative"
                    checked={descriptionType === 'creative'}
                    onChange={(e) => setDescriptionType(e.target.value as 'basic' | 'detailed' | 'creative')}
                    className="text-purple-600"
                  />
                  <div>
                    <span className="text-gray-700 font-medium">Creative</span>
                    <p className="text-sm text-gray-500">Artistic and imaginative description</p>
                  </div>
                </label>
              </div>
            </div>

           
              
              {/* Main Action Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={generateDescription}
                  disabled={!selectedFile || isLoading}
                  className="flex-1 bg-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Generate Description
                    </>
                  )}
                </button>
                
                <button
                  onClick={resetForm}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>

          {/* Preview and Results Section */}
          <div className="space-y-6">
            {/* Image Preview */}
            {previewUrl && (
              <div className="bg-white rounded-xl shadow-md p-6 border border-purple-100">
                <h3 className="text-lg font-semibold text-purple-700 mb-4">
                  Selected Image
                </h3>
                <div className="relative">
                  <Image
                    src={previewUrl}
                    alt="Selected image preview"
                    width={400}
                    height={192}
                    className="w-full h-48 object-cover rounded-lg border"
                    unoptimized={true}
                  />
                  {selectedFile && (
                    <div className="mt-2 text-sm text-gray-600">
                      <p>File: {selectedFile.name}</p>
                      <p>Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Status Messages */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <p className="text-red-700">{error}</p>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <p className="text-green-700">{success}</p>
              </div>
            )}

            {/* Generated Description */}
            {description && (
              <div className="bg-white rounded-xl shadow-md p-6 border border-purple-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-purple-700 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Generated Description
                  </h3>
                 
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                    {description}
                  </p>
                </div>
                
                <button
                  onClick={copyToClipboard}
                  className={`w-full py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 font-medium ${
                    isCopied
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-purple-600 text-white hover:bg-purple-700'
                  }`}
                >
                  {isCopied ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy Description
                    </>
                  )}
                </button>
              </div>
            )}
          
          </div>
        </div>
      </div>
  )
}

export default AutoDescriptionPage