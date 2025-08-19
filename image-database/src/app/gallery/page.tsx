'use client';

import { useUser, SignInButton, UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import { useState, useEffect } from 'react';

// API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
const MINIO_BASE_URL = process.env.NEXT_PUBLIC_MINIO_URL || 'http://localhost:9000';

// Define image type interface
interface ImageType {
  id: number;
  name: string;
  partNumber: string;
  category: string;
  uploadDate: string;
  size: string;
  status: string;
  file_path: string;
  file_type: string;
  image_size: number;
  captured_at: string;
  bucket_name: string;
  imageUrl: string; // Add this field
  thumbnailUrl: string; // Add this field
  metadata: {
    dimensions: string;
    camera: string;
    operator: string;
    resolution?: string;
    capture_mode?: string;
    notes?: string;
  }
}

export default function Gallery() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [activeView, setActiveView] = useState('grid');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<ImageType | null>(null);
  const [images, setImages] = useState<ImageType[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [imagesPerPage] = useState(12);

  // Categories
  const categories = [
    { id: 'all', name: 'All Images' },
    { id: 'partsA', name: 'A-Series Parts' },
    { id: 'partsB', name: 'B-Series Parts' },
    { id: 'partsC', name: 'C-Series Parts' },
    { id: 'rejected', name: 'Rejected Parts' }
  ];

  // Helper function to generate MinIO URL
  const generateMinIOUrl = (bucketName: string, fileName: string): string => {
    // Clean bucket name (replace underscores with hyphens if needed)
    const cleanBucket = bucketName.replace(/_/g, '-');
    return `${MINIO_BASE_URL}/${cleanBucket}/${fileName}`;
  };

  // Helper function to generate image URL using the download endpoint
  const generateImageUrl = (imageId: number): string => {
    return `${API_BASE_URL}/images/download/${imageId}`;
  };

  // API Functions
  const fetchAllImages = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/images`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching images:', error);
      setApiError('Failed to fetch images');
      return [];
    }
  };

  const fetchImageById = async (id: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/images/${id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching image:', error);
      setApiError('Failed to fetch image details');
      return null;
    }
  };

  const deleteImageById = async (id: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/images/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error deleting image:', error);
      setApiError('Failed to delete image');
      return null;
    }
  };

  const updateImageById = async (id: number, updateData: any) => {
    try {
      const response = await fetch(`${API_BASE_URL}/images/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating image:', error);
      setApiError('Failed to update image');
      return null;
    }
  };

  // Format images for display
  const formatImagesForDisplay = (imagesData: any[]): ImageType[] => {
    return imagesData.map(img => {
      const imageId = img.image_id || img.id;
      const bucketName = img.bucket_name || 'default-bucket';
      const fileName = img.file_name;
      
      return {
        id: imageId,
        name: fileName,
        partNumber: img.part_number || img.part_name || `PART-${imageId}`,
        category: determineCategoryFromPartName(img.part_name || img.part_number),
        uploadDate: new Date(img.captured_at).toLocaleDateString(),
        size: img.image_size ? `${(img.image_size / (1024 * 1024)).toFixed(1)} MB` : 'Unknown',
        status: determineStatus(img),
        file_path: img.file_path,
        file_type: img.file_type,
        image_size: img.image_size,
        captured_at: img.captured_at,
        bucket_name: bucketName,
        // Generate image URLs
        imageUrl: generateImageUrl(imageId),
        thumbnailUrl: generateImageUrl(imageId), // Use same URL for now
        metadata: {
          dimensions: img.resolution || '1920x1080',
          camera: img.device_model || 'Unknown Camera',
          operator: img.serial_number || 'System',
          resolution: img.resolution,
          capture_mode: img.capture_mode,
          notes: img.notes
        }
      };
    });
  };

  // Helper function to determine category from part name
  const determineCategoryFromPartName = (partName: string): string => {
    if (!partName) return 'all';
    const upperPartName = partName.toUpperCase();
    if (upperPartName.includes('A-') || upperPartName.startsWith('A')) return 'partsA';
    if (upperPartName.includes('B-') || upperPartName.startsWith('B')) return 'partsB';
    if (upperPartName.includes('C-') || upperPartName.startsWith('C')) return 'partsC';
    if (upperPartName.includes('REJECT')) return 'rejected';
    return 'all';
  };

  // Helper function to determine status
  const determineStatus = (img: any): string => {
    if (img.file_path && img.file_name) return 'Processed';
    return 'Processing';
  };

  // Load images from API
  const loadImages = async () => {
    setIsLoading(true);
    setApiError(null);
    
    try {
      const imagesData = await fetchAllImages();
      const formattedImages = formatImagesForDisplay(imagesData);
      setImages(formattedImages);
    } catch (error) {
      console.error('Error loading images:', error);
      setApiError('Failed to load images');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle image selection for details
  const handleImageClick = async (imageId: number) => {
    try {
      const imageDetails = await fetchImageById(imageId);
      if (imageDetails) {
        const formattedImage = formatImagesForDisplay([imageDetails])[0];
        setSelectedImage(formattedImage);
      }
    } catch (error) {
      console.error('Error fetching image details:', error);
    }
  };

  // Handle image deletion
  const handleDeleteImage = async (imageId: number) => {
    if (window.confirm('Are you sure you want to delete this image?')) {
      const result = await deleteImageById(imageId);
      if (result) {
        setImages(prev => prev.filter(img => img.id !== imageId));
        setSelectedImage(null);
      }
    }
  };

  // Handle metadata update
  const handleUpdateMetadata = async (imageId: number, newMetadata: any) => {
    const result = await updateImageById(imageId, newMetadata);
    if (result) {
      const updatedImage = await fetchImageById(imageId);
      if (updatedImage) {
        const formattedImage = formatImagesForDisplay([updatedImage])[0];
        setImages(prev => prev.map(img => img.id === imageId ? formattedImage : img));
        setSelectedImage(formattedImage);
      }
    }
  };

  // Load data on component mount
  useEffect(() => {
    if (isSignedIn) {
      loadImages();
    }
  }, [isSignedIn]);

  // Filter images based on category and search query
  const filteredImages = images.filter(image => {
    const matchesCategory = selectedCategory === 'all' || image.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
                         image.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         image.partNumber.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Pagination logic
  const indexOfLastImage = currentPage * imagesPerPage;
  const indexOfFirstImage = indexOfLastImage - imagesPerPage;
  const currentImages = filteredImages.slice(indexOfFirstImage, indexOfLastImage);
  const totalPages = Math.ceil(filteredImages.length / imagesPerPage);

  // Authentication loading state
  if (!isLoaded) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
    </div>
  );
  
  // Unauthenticated state
  if (!isSignedIn) return (
    <div className="text-center mt-10 p-6 bg-white rounded-lg shadow">
      <p className="mb-4">Please log in to view this page.</p>
      <SignInButton mode="modal">
        <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
          Log in
        </button>
      </SignInButton>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Navigation */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/" className="text-2xl font-bold text-indigo-600">
                  ImageDB
                </Link>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link href="/dashboard" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Dashboard
                </Link>
                <Link href="/gallery" className="border-indigo-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Gallery
                </Link>
                <Link href="/upload" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Upload
                </Link>
                <Link href="/settings" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                
                </Link>
              </div>
            </div>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="relative ml-3">
                  <div className="flex items-center space-x-4">
                    <span className="text-gray-700">
                      {user?.fullName || user?.emailAddresses[0]?.emailAddress || 'User'}
                    </span>
                    <UserButton afterSignOutUrl="/" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="md:flex md:items-center md:justify-between mb-6">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-gray-900">Image Gallery</h1>
            <p className="mt-1 text-sm text-gray-500">Browse and manage your part images.</p>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-3">
            <button
              onClick={loadImages}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Refresh
            </button>
            <Link 
              href="/upload"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Upload New Images
            </Link>
          </div>
        </div>

        {/* API Error Display */}
        {apiError && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  API Error
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{apiError}</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Filter and Search */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div className="flex flex-wrap items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">Category:</label>
                <select 
                  className="mt-1 block pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setCurrentPage(1);
                  }}
                  disabled={isLoading}
                >
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex space-x-2">
                <div className="relative flex-1 min-w-0">
                  <input
                    type="text"
                    placeholder="Search by part number or filename..."
                    className="block w-full pr-10 sm:text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    disabled={isLoading}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div className="flex items-center border border-gray-300 rounded-md">
                  <button 
                    onClick={() => setActiveView('grid')} 
                    className={`px-3 py-2 ${activeView === 'grid' ? 'bg-gray-100 text-gray-900' : 'text-gray-500'}`}
                    disabled={isLoading}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </button>
                  <button 
                    onClick={() => setActiveView('list')} 
                    className={`px-3 py-2 ${activeView === 'list' ? 'bg-gray-100 text-gray-900' : 'text-gray-500'}`}
                    disabled={isLoading}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Gallery Content */}
        {isLoading ? (
          activeView === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, index) => (
                <div key={index} className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="relative pb-[75%] bg-gray-200">
                    <div className="absolute inset-0 w-full h-full animate-pulse bg-gray-300"></div>
                  </div>
                  <div className="px-4 py-3">
                    <div className="h-4 bg-gray-300 rounded animate-pulse mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {[...Array(5)].map((_, index) => (
                  <li key={index}>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="bg-gray-300 h-12 w-12 animate-pulse rounded mr-4"></div>
                          <div>
                            <div className="h-4 bg-gray-300 rounded animate-pulse w-40 mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded animate-pulse w-24"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )
        ) : filteredImages.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-6 text-center">
            <p className="text-gray-500">
              {searchQuery || selectedCategory !== 'all' 
                ? 'No images found. Try changing your search or category filter.' 
                : 'No images found. Start uploading to build your collection.'}
            </p>
          </div>
        ) : activeView === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {currentImages.map((image) => (
              <div 
                key={image.id} 
                className="bg-white overflow-hidden shadow rounded-lg cursor-pointer transition duration-150 hover:shadow-md"
                onClick={() => handleImageClick(image.id)}
              >
                <div className="relative pb-[75%] bg-gray-200">
                  <img 
                    src={image.thumbnailUrl}
                    alt={image.name}
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback if image fails to load
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                  <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-gray-300 hidden">
                    <span className="text-gray-500 text-sm">{image.partNumber}</span>
                  </div>
                  <div className="absolute top-2 right-2">
                    <span className={`px-2 py-1 text-xs font-bold rounded-full
                      ${image.status === 'Processed' ? 'bg-green-100 text-green-800' : 
                        image.status === 'Processing' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'}`}>
                      {image.status}
                    </span>
                  </div>
                </div>
                <div className="px-4 py-3">
                  <h3 className="text-sm font-medium text-gray-900 truncate">{image.name}</h3>
                  <p className="text-xs text-gray-500">Part: {image.partNumber}</p>
                  <p className="text-xs text-gray-500">{image.uploadDate}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {currentImages.map((image) => (
                <li key={image.id}>
                  <div 
                    className="block hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleImageClick(image.id)}
                  >
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="h-12 w-12 mr-4 flex-shrink-0">
                            <img 
                              src={image.thumbnailUrl}
                              alt={image.name}
                              className="h-12 w-12 object-cover rounded"
                              onError={(e) => {
                                // Fallback if image fails to load
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                target.nextElementSibling?.classList.remove('hidden');
                              }}
                            />
                            <div className="hidden bg-gray-200 h-12 w-12 flex items-center justify-center rounded">
                              <span className="text-gray-500 text-xs">{image.partNumber.slice(-4)}</span>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-indigo-600 truncate">{image.name}</p>
                            <p className="text-sm text-gray-500">Part: {image.partNumber}</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full 
                            ${image.status === 'Processed' ? 'bg-green-100 text-green-800' : 
                              image.status === 'Processing' ? 'bg-yellow-100 text-yellow-800' : 
                              'bg-red-100 text-red-800'}`}>
                            {image.status}
                          </span>
                          <p className="ml-4 text-sm text-gray-500">{image.uploadDate}</p>
                          <p className="ml-4 text-sm text-gray-500">{image.size}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Pagination */}
        {!isLoading && filteredImages.length > 0 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border border-gray-200 sm:px-6 rounded-lg mt-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button 
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button 
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{indexOfFirstImage + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(indexOfLastImage, filteredImages.length)}</span> of{' '}
                  <span className="font-medium">{filteredImages.length}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button 
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <span className="sr-only">Previous</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  {[...Array(totalPages)].map((_, index) => (
                    <button
                      key={index + 1}
                      onClick={() => setCurrentPage(index + 1)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        currentPage === index + 1
                          ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                  
                  <button 
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <span className="sr-only">Next</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}

        {/* Image Detail Modal */}
        {selectedImage && (
          <div className="fixed inset-0 overflow-y-auto z-50">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity">
                <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={() => setSelectedImage(null)}></div>
              </div>

              <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
              
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">Image Details</h3>
                        <button 
                          type="button" 
                          className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                          onClick={() => setSelectedImage(null)}
                        >
                          <span className="sr-only">Close</span>
                          <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gray-100 rounded-lg flex items-center justify-center min-h-[300px]">
                          <img 
                            src={selectedImage.imageUrl}
                            alt={selectedImage.name}
                            className="max-w-full max-h-full object-contain rounded"
                            onError={(e) => {
                              // Fallback if image fails to load
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              target.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                          <div className="hidden text-center">
                            <div className="text-gray-500 mb-2">Image Preview</div>
                            <div className="text-sm text-gray-400">
                              {selectedImage.name}
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                              {selectedImage.metadata.dimensions}
                            </div>
                          </div>
                        </div>
                        <div>
                          <div className="bg-gray-50 p-4 rounded-lg mb-4">
                            <h4 className="text-sm font-medium text-gray-900 mb-3">Image Details</h4>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div className="text-gray-500">File Name:</div>
                              <div className="font-medium">{selectedImage.name}</div>
                              
                              <div className="text-gray-500">Part Number:</div>
                              <div className="font-medium">{selectedImage.partNumber}</div>
                              
                              <div className="text-gray-500">Status:</div>
                              <div>
                                <span className={`px-2 py-1 text-xs font-medium rounded-full 
                                  ${selectedImage.status === 'Processed' ? 'bg-green-100 text-green-800' : 
                                    selectedImage.status === 'Processing' ? 'bg-yellow-100 text-yellow-800' : 
                                    'bg-red-100 text-red-800'}`}>
                                  {selectedImage.status}
                                </span>
                              </div>
                              
                              <div className="text-gray-500">Uploaded:</div>
                              <div>{selectedImage.uploadDate}</div>
                              
                              <div className="text-gray-500">File Size:</div>
                              <div>{selectedImage.size}</div>
                              
                              <div className="text-gray-500">File Type:</div>
                              <div>{selectedImage.file_type}</div>
                              
                              <div className="text-gray-500">Bucket:</div>
                              <div>{selectedImage.bucket_name}</div>
                            </div>
                          </div>

                          <div className="bg-gray-50 p-4 rounded-lg mb-4">
                            <h4 className="text-sm font-medium text-gray-900 mb-3">Metadata</h4>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div className="text-gray-500">Resolution:</div>
                              <div>{selectedImage.metadata.dimensions}</div>
                              
                              <div className="text-gray-500">Camera:</div>
                              <div>{selectedImage.metadata.camera}</div>
                              
                              <div className="text-gray-500">Operator:</div>
                              <div>{selectedImage.metadata.operator}</div>
                              
                              {selectedImage.metadata.capture_mode && (
                                <>
                                  <div className="text-gray-500">Capture Mode:</div>
                                  <div>{selectedImage.metadata.capture_mode}</div>
                                </>
                              )}
                              
                              {selectedImage.metadata.notes && (
                                <>
                                  <div className="text-gray-500">Notes:</div>
                                  <div className="col-span-2">{selectedImage.metadata.notes}</div>
                                </>
                              )}
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 mb-3">Actions</h4>
                            <div className="flex flex-wrap gap-2">
                              <button 
                                onClick={() => {
                                  window.open(selectedImage.imageUrl, '_blank');
                                }}
                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                Download
                              </button>
                              <button 
                                onClick={() => {
                                  const newNotes = prompt('Enter new notes:', selectedImage.metadata.notes || '');
                                  if (newNotes !== null) {
                                    handleUpdateMetadata(selectedImage.id, { notes: newNotes });
                                  }
                                }}
                                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Edit Notes
                              </button>
                              <button 
                                onClick={() => handleDeleteImage(selectedImage.id)}
                                className="inline-flex items-center px-3 py-2 border border-red-300 text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}