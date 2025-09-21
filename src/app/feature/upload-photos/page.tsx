"use client"
import React, { useState, useRef } from 'react'
import Image from 'next/image'
import { Upload, Download, Image as ImageIcon, Loader2, AlertCircle, CheckCircle } from 'lucide-react'

const UploadPhotosPage = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [outputFormat, setOutputFormat] = useState<'png' | 'jpeg'>('png')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [enhancedImages, setEnhancedImages] = useState<{
    png?: string
    jpeg?: string
  } | null>(null)
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
      setEnhancedImages(null)
      
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

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select an image first')
      return
    }

    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const formData = new FormData()
      formData.append('image', selectedFile)
      formData.append('outputFormat', outputFormat)

      const response = await fetch('http://localhost:5000/enhance-image', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`)
      }

      const result = await response.json()
      
      if (result.success) {
        setEnhancedImages(result.data)
        setSuccess('Image enhanced successfully!')
      } else {
        throw new Error(result.message || 'Image enhancement failed')
      }

    } catch (err) {
      console.error('Upload error:', err);
      let errorMessage = 'An error occurred during upload';
      
      if (err instanceof Error) {
        if (err.message.includes('Server error: 500')) {
          errorMessage = 'Image processing failed. Please check if the image is valid and try again.';
        } else if (err.message.includes('Server error: 400')) {
          errorMessage = 'Invalid image file. Please select a valid image format.';
        } else if (err.message.includes('fetch')) {
          errorMessage = 'Cannot connect to server. Please ensure the backend is running.';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  const handleDownload = (format: 'png' | 'jpeg') => {
    if (!enhancedImages || !enhancedImages[format]) {
      setError(`Enhanced ${format.toUpperCase()} image not available`)
      return
    }

    const link = document.createElement('a')
    link.href = enhancedImages[format]!
    link.download = `enhanced-image.${format}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const resetForm = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    setError(null)
    setSuccess(null)
    setEnhancedImages(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-800 mb-2">
            Photo Enhancement Studio
          </h1>
          <p className="text-gray-600">
            Upload your images and get enhanced versions in PNG or JPEG format
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="space-y-6">
            {/* File Upload Area */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-indigo-100">
              <h2 className="text-xl font-semibold text-blue-700 mb-4 flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Upload Image
              </h2>
              
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className="border-2 border-dashed border-indigo-200 rounded-lg p-8 text-center hover:border-indigo-300 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <ImageIcon className="w-12 h-12 text-indigo-300 mx-auto mb-4" />
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

            {/* Format Selection */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-indigo-100">
              <h3 className="text-lg font-semibold text-blue-700 mb-4">
                Output Format
              </h3>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="format"
                    value="png"
                    checked={outputFormat === 'png'}
                    onChange={(e) => setOutputFormat(e.target.value as 'png' | 'jpeg')}
                    className="text-indigo-600"
                  />
                  <span className="text-gray-700">PNG (Lossless)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="format"
                    value="jpeg"
                    checked={outputFormat === 'jpeg'}
                    onChange={(e) => setOutputFormat(e.target.value as 'png' | 'jpeg')}
                    className="text-indigo-600"
                  />
                  <span className="text-gray-700">JPEG (Compressed)</span>
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={handleUpload}
                disabled={!selectedFile || isLoading}
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    Enhance Image
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

          {/* Preview and Results Section */}
          <div className="space-y-6">
            {/* Image Preview */}
            {previewUrl && (
              <div className="bg-white rounded-xl shadow-md p-6 border border-indigo-100">
                <h3 className="text-lg font-semibold text-blue-700 mb-4">
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

            {/* Download Section */}
            {enhancedImages && (
              <div className="bg-white rounded-xl shadow-md p-6 border border-indigo-100">
                <h3 className="text-lg font-semibold text-blue-700 mb-4 flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  Download Enhanced Images
                </h3>
                
                <div className="space-y-3">
                  {enhancedImages.png && (
                    <button
                      onClick={() => handleDownload('png')}
                      className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download PNG Version
                    </button>
                  )}
                  
                  {enhancedImages.jpeg && (
                    <button
                      onClick={() => handleDownload('jpeg')}
                      className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download JPEG Version
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default UploadPhotosPage