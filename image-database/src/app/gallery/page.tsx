// src/app/gallery/page.tsx
'use client';

import { useUser, SignInButton } from '@clerk/nextjs';
import { useState, useEffect } from 'react';
import {
  GalleryNavigation,
  GalleryHeader,
  ErrorAlert,
  FilterAndSearch,
  GridView,
  ListView,
  Pagination,
  ImageDetailModal,
  type ImageType,
  type CategoryType
} from '../components/GalleryUI';

// API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
const MINIO_BASE_URL = process.env.NEXT_PUBLIC_MINIO_URL || 'http://localhost:9000';

export default function Gallery() {
  const { isLoaded, isSignedIn, user } = useUser();
  
  // State management
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
  const categories: CategoryType[] = [
    { id: 'all', name: 'All Images' },
    { id: 'partsA', name: 'A-Series Parts' },
    { id: 'partsB', name: 'B-Series Parts' },
    { id: 'partsC', name: 'C-Series Parts' },
    { id: 'rejected', name: 'Rejected Parts' },
    { id: 'general', name: 'General' }
  ];

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

  // Helper Functions
  const generateImageUrl = (image: ImageType): string => {
    return `${API_BASE_URL}/images/download/${image.image_id || image.id}`;
  };

  const downloadImage = async (image: ImageType): Promise<void> => {
    try {
      console.log('Downloading image:', image.name);
      
      const response = await fetch(`${API_BASE_URL}/images/download/${image.image_id || image.id}`);
      
      if (!response.ok) {
        throw new Error(`Failed to download: ${response.status}`);
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = image.name || image.file_name;
      document.body.appendChild(link);
      
      link.click();
      
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      
      console.log('Download completed for:', image.name);
      
    } catch (error) {
      console.error('Download failed:', error);
      alert(`Download failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      // Fallback: try opening in new tab
      try {
        const fallbackUrl = `${API_BASE_URL}/images/download/${image.image_id || image.id}`;
        window.open(fallbackUrl, '_blank');
      } catch (fallbackError) {
        console.error('Fallback download also failed:', fallbackError);
      }
    }
  };

  const determineCategoryFromPartName = (partName: string): string => {
    if (!partName) return 'all';
    const upperPartName = partName.toUpperCase();
    if (upperPartName.includes('A-') || upperPartName.startsWith('A')) return 'partsA';
    if (upperPartName.includes('B-') || upperPartName.startsWith('B')) return 'partsB';
    if (upperPartName.includes('C-') || upperPartName.startsWith('C')) return 'partsC';
    if (upperPartName.includes('REJECT')) return 'rejected';
    return 'general';
  };

  const determineStatus = (img: any): string => {
    if (img.file_path && img.file_name) return 'Processed';
    return 'Processing';
  };

  const formatImagesForDisplay = (imagesData: any[]): ImageType[] => {
    return imagesData.map(img => {
      const imageId = img.image_id || img.id;
      const bucketName = img.bucket_name || 'default-bucket';
      const fileName = img.file_name;
      
      return {
        id: imageId,
        image_id: imageId,
        name: fileName,
        file_name: fileName,
        partNumber: img.part_number || img.part_name || `PART-${imageId}`,
        category: determineCategoryFromPartName(img.part_name || img.part_number),
        uploadDate: new Date(img.captured_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        }),
        size: img.image_size ? `${(img.image_size / (1024 * 1024)).toFixed(1)} MB` : 'Unknown',
        status: determineStatus(img),
        file_path: img.file_path,
        file_type: img.file_type,
        image_size: img.image_size,
        captured_at: img.captured_at,
        bucket_name: bucketName,
        imageUrl: generateImageUrl({ id: imageId, image_id: imageId } as ImageType),
        thumbnailUrl: generateImageUrl({ id: imageId, image_id: imageId } as ImageType),
        part_name: img.part_name,
        part_number: img.part_number,
        device_model: img.device_model,
        location: img.location,
        serial_number: img.serial_number,
        resolution: img.resolution,
        capture_mode: img.capture_mode,
        notes: img.notes,
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

  // Event Handlers
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

  const handleDeleteImage = async (imageId: number) => {
    if (window.confirm('Are you sure you want to delete this image? This action cannot be undone.')) {
      const result = await deleteImageById(imageId);
      if (result) {
        setImages(prev => prev.filter(img => img.id !== imageId));
        setSelectedImage(null);
        
        // Show success message
        console.log('Image deleted successfully');
      }
    }
  };

  const handleDownloadImage = async (image: ImageType) => {
    await downloadImage(image);
  };

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

  const handleRefresh = () => {
    loadImages();
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

  // Load data on component mount
  useEffect(() => {
    if (isSignedIn) {
      loadImages();
    }
  }, [isSignedIn]);

  // Data Processing
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
  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Loading gallery...</p>
        </div>
      </div>
    );
  }
  
  // Unauthenticated state
  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Authentication Required
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Please log in to access the image gallery
            </p>
          </div>
          <div className="mt-8 text-center">
            <SignInButton mode="modal">
              <button className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                Sign in to continue
              </button>
            </SignInButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Navigation */}
      <GalleryNavigation user={user} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <GalleryHeader onRefresh={handleRefresh} />

        {/* API Error Display */}
        {apiError && (
          <ErrorAlert apiError={apiError} API_BASE_URL={API_BASE_URL} />
        )}
        
        {/* Filter and Search */}
        <FilterAndSearch
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          activeView={activeView}
          setActiveView={setActiveView}
          categories={categories}
          isLoading={isLoading}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
        />

        {/* Gallery Content */}
        {activeView === 'grid' ? (
          <GridView
            currentImages={currentImages}
            onImageClick={handleImageClick}
            generateImageUrl={generateImageUrl}
            isLoading={isLoading}
          />
        ) : (
          <ListView
            currentImages={currentImages}
            onImageClick={handleImageClick}
            generateImageUrl={generateImageUrl}
            isLoading={isLoading}
          />
        )}

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalPages={totalPages}
          indexOfFirstImage={indexOfFirstImage}
          indexOfLastImage={indexOfLastImage}
          filteredImages={filteredImages}
        />

        {/* Image Detail Modal */}
        <ImageDetailModal
          selectedImage={selectedImage}
          setSelectedImage={setSelectedImage}
          onDownloadImage={handleDownloadImage}
          onDeleteImage={handleDeleteImage}
          onUpdateMetadata={handleUpdateMetadata}
          generateImageUrl={generateImageUrl}
        />
      </main>
    </div>
  );
}