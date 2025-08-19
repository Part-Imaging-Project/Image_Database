// src/app/dashboard/page.tsx - Fixed Download Version
'use client';

import { useUser, SignInButton } from '@clerk/nextjs';
import { useState, useEffect } from 'react';
import {
  DashboardNavigation,
  DashboardHeader,
  ErrorAlert,
  StatisticsCards,
  TabNavigation,
  ImagesTable,
  QuickActions,
  SystemStatus,
  type ImageData,
  type Statistics
} from '../components/DashboardUI';

// API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

export default function Dashboard() {
  const { isLoaded, isSignedIn, user } = useUser();
  
  // State management
  const [activeTab, setActiveTab] = useState('recent');
  const [images, setImages] = useState<ImageData[]>([]);
  const [statistics, setStatistics] = useState<Statistics>({
    totalImages: 0,
    totalSize: '0 MB',
    lastUpload: 'No uploads yet',
    processingQueue: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  // API Functions
  const fetchAllImages = async (): Promise<ImageData[]> => {
    try {
      console.log('Fetching images from:', `${API_BASE_URL}/images`);
      const response = await fetch(`${API_BASE_URL}/images`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Fetched images:', data);
      return data;
    } catch (error) {
      console.error('Error fetching images:', error);
      setApiError(`Failed to fetch images: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return [];
    }
  };

  const fetchImageById = async (id: number): Promise<ImageData | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/images/${id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching image:', error);
      return null;
    }
  };

  const deleteImageById = async (id: number): Promise<any | null> => {
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

  // Generate image preview URL
  const getImagePreviewUrl = (image: ImageData): string => {
    return `${API_BASE_URL}/images/download/${image.image_id}`;
  };

  // Download image function
  const downloadImage = async (image: ImageData): Promise<void> => {
    try {
      console.log('Downloading image:', image.file_name);
      
      // Show loading state
      const originalText = document.activeElement?.textContent;
      if (document.activeElement) {
        (document.activeElement as HTMLElement).textContent = 'Downloading...';
      }

      const response = await fetch(`${API_BASE_URL}/images/download/${image.image_id}`);
      
      if (!response.ok) {
        throw new Error(`Failed to download: ${response.status}`);
      }

      // Get the blob from response
      const blob = await response.blob();
      
      // Create download URL
      const downloadUrl = window.URL.createObjectURL(blob);
      
      // Create temporary download link
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = image.file_name; // Use original filename
      document.body.appendChild(link);
      
      // Trigger download
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      
      console.log('Download completed for:', image.file_name);
      
      // Reset button text
      if (document.activeElement && originalText) {
        (document.activeElement as HTMLElement).textContent = originalText;
      }
      
    } catch (error) {
      console.error('Download failed:', error);
      
      // Reset button text
      if (document.activeElement) {
        (document.activeElement as HTMLElement).textContent = 'Download';
      }
      
      // Show error to user
      alert(`Download failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      // Fallback: try opening in new tab
      try {
        const fallbackUrl = `${API_BASE_URL}/images/download/${image.image_id}`;
        window.open(fallbackUrl, '_blank');
      } catch (fallbackError) {
        console.error('Fallback download also failed:', fallbackError);
      }
    }
  };

  // Calculate statistics from images data
  const calculateStatistics = (imagesData: ImageData[]): Statistics => {
    if (!imagesData || imagesData.length === 0) {
      return {
        totalImages: 0,
        totalSize: '0 MB',
        lastUpload: 'No uploads yet',
        processingQueue: 0
      };
    }

    const totalImages = imagesData.length;
    const totalSizeBytes = imagesData.reduce((acc: number, img: ImageData) => acc + (img.image_size || 0), 0);
    const totalSizeMB = (totalSizeBytes / (1024 * 1024)).toFixed(1);
    
    // Sort by captured_at to get the most recent
    const sortedImages = [...imagesData].sort((a: ImageData, b: ImageData) => 
      new Date(b.captured_at).getTime() - new Date(a.captured_at).getTime()
    );
    const lastUpload = sortedImages.length > 0 
      ? new Date(sortedImages[0].captured_at).toLocaleString()
      : 'No uploads yet';
    
    // For now, assume all images are processed
    const processingQueue = 0;

    return {
      totalImages,
      totalSize: `${totalSizeMB} MB`,
      lastUpload,
      processingQueue
    };
  };

  // Event Handlers
  const handleDeleteImage = async (imageId: number): Promise<void> => {
    if (window.confirm('Are you sure you want to delete this image? This action cannot be undone.')) {
      const result = await deleteImageById(imageId);
      if (result) {
        // Refresh the images list
        loadDashboardData();
        
        // Show success message
        const deletedImage = images.find(img => img.image_id === imageId);
        if (deletedImage) {
          console.log(`Successfully deleted: ${deletedImage.file_name}`);
        }
      }
    }
  };

  const handleViewImage = async (imageId: number): Promise<void> => {
    const imageDetails = await fetchImageById(imageId);
    if (imageDetails) {
      // Open image in new tab
      const imageUrl = getImagePreviewUrl(imageDetails);
      window.open(imageUrl, '_blank');
    }
  };

  const handleDownloadImage = async (image: ImageData): Promise<void> => {
    await downloadImage(image);
  };

  const handleRefresh = (): void => {
    loadDashboardData();
  };

  // Load dashboard data
  const loadDashboardData = async (): Promise<void> => {
    setLoading(true);
    setApiError(null);
    
    try {
      const imagesData = await fetchAllImages();
      const stats = calculateStatistics(imagesData);
      
      setImages(imagesData);
      setStatistics(stats);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setApiError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    if (isSignedIn) {
      loadDashboardData();
    }
  }, [isSignedIn]);

  // Data processing
  const filteredImages = images.filter((image: ImageData) =>
    image.file_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (image.part_number && image.part_number.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (image.part_name && image.part_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Get images for current tab
  const getTabImages = () => {
    switch (activeTab) {
      case 'recent':
        return filteredImages.slice(0, 10); // Show latest 10 images
      case 'favorites':
        // For now, return empty array as we don't have favorites functionality
        return [];
      case 'pending':
        // For now, return empty array as we don't have pending status
        return [];
      default:
        return filteredImages.slice(0, 10);
    }
  };

  const tabImages = getTabImages();

  // Loading state
  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }
  
  // Authentication required state
  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Authentication Required
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Please log in to access your dashboard
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

  // Main dashboard render
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Navigation */}
      <DashboardNavigation user={user} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <DashboardHeader onRefresh={handleRefresh} />
        
        {/* API Error Display */}
        {apiError && (
          <ErrorAlert apiError={apiError} API_BASE_URL={API_BASE_URL} />
        )}
        
        {/* Statistics Cards */}
        <StatisticsCards statistics={statistics} />

        {/* Tab Navigation */}
        <TabNavigation 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          filteredImages={filteredImages} 
        />

        {/* Images Table */}
        <ImagesTable
          loading={loading}
          activeTab={activeTab}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          tabImages={tabImages}
          filteredImages={filteredImages}
          onViewImage={handleViewImage}
          onDeleteImage={handleDeleteImage}
          onDownloadImage={handleDownloadImage}
          getImagePreviewUrl={getImagePreviewUrl}
          apiError={apiError}
        />

        {/* Quick Actions */}
        <QuickActions statistics={statistics} />

        {/* System Status */}
        <SystemStatus 
          apiError={apiError} 
          user={user} 
          loading={loading} 
          statistics={statistics} 
          API_BASE_URL={API_BASE_URL} 
        />
      </main>
    </div>
  );
}