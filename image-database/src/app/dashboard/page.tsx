'use client';

import { useUser, UserButton, SignInButton } from '@clerk/nextjs';
import Link from 'next/link';
import { useState, useEffect } from 'react';

// API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

// Type definitions
interface ImageData {
  id: number;
  name: string;
  partNumber: string;
  uploadDate: string;
  size: string;
  status: string;
  file_path: string;
  file_type: string;
}

interface Statistics {
  totalImages: number;
  totalSize: string;
  lastUpload: string;
  processingQueue: number;
}

export default function Dashboard() {
  const { isLoaded, isSignedIn, user } = useUser();
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
  const fetchAllImages = async (): Promise<any[]> => {
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

  const fetchImageById = async (id: number): Promise<any | null> => {
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

  const updateImageById = async (id: number, updateData: any): Promise<any | null> => {
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

  // Calculate statistics from images data
  const calculateStatistics = (imagesData: any[]): Statistics => {
    if (!imagesData || imagesData.length === 0) {
      return {
        totalImages: 0,
        totalSize: '0 MB',
        lastUpload: 'No uploads yet',
        processingQueue: 0
      };
    }

    const totalImages = imagesData.length;
    const totalSizeBytes = imagesData.reduce((acc: number, img: any) => acc + (img.image_size || 0), 0);
    const totalSizeMB = (totalSizeBytes / (1024 * 1024)).toFixed(1);
    
    // Sort by captured_at to get the most recent
    const sortedImages = imagesData.sort((a: any, b: any) => new Date(b.captured_at).getTime() - new Date(a.captured_at).getTime());
    const lastUpload = sortedImages.length > 0 
      ? new Date(sortedImages[0].captured_at).toLocaleString()
      : 'No uploads yet';
    
    // Count processing queue (this would need a status field in your DB)
    const processingQueue = imagesData.filter((img: any) => img.status === 'Processing').length;

    return {
      totalImages,
      totalSize: `${totalSizeMB} MB`,
      lastUpload,
      processingQueue
    };
  };

  // Format images for display
  const formatImagesForDisplay = (imagesData: any[]): ImageData[] => {
    return imagesData.map((img: any) => ({
      id: img.image_id || img.id,
      name: img.file_name,
      partNumber: img.part_name || 'N/A',
      uploadDate: new Date(img.captured_at).toLocaleDateString(),
      size: img.image_size ? `${(img.image_size / (1024 * 1024)).toFixed(1)} MB` : 'Unknown',
      status: img.status || 'Processed', // You may need to add this field to your DB
      file_path: img.file_path,
      file_type: img.file_type
    }));
  };

  // Handle image deletion
  const handleDeleteImage = async (imageId: number): Promise<void> => {
    if (window.confirm('Are you sure you want to delete this image?')) {
      const result = await deleteImageById(imageId);
      if (result) {
        // Refresh the images list
        loadDashboardData();
      }
    }
  };

  // Handle image viewing
  const handleViewImage = async (imageId: number): Promise<void> => {
    const imageDetails = await fetchImageById(imageId);
    if (imageDetails) {
      // You can implement a modal or navigate to a detail page
      console.log('Image details:', imageDetails);
      // For now, just log the details. You might want to show a modal or navigate to a detail page
      alert(`Image Details:\nFile: ${imageDetails.file_name}\nType: ${imageDetails.file_type}\nSize: ${imageDetails.image_size} bytes`);
    }
  };

  // Load dashboard data
  const loadDashboardData = async (): Promise<void> => {
    setLoading(true);
    setApiError(null);
    
    try {
      const imagesData = await fetchAllImages();
      const formattedImages = formatImagesForDisplay(imagesData);
      const stats = calculateStatistics(imagesData);
      
      setImages(formattedImages);
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

  // Filter images based on search term
  const filteredImages = images.filter((image: ImageData) =>
    image.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    image.partNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isLoaded) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
    </div>
  );
  
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
                <Link href="/dashboard" className="border-indigo-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Dashboard
                </Link>
                <Link href="/gallery" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
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
            <h1 className="text-2xl font-bold text-gray-900">Image Database Dashboard</h1>
            <p className="mt-1 text-sm text-gray-500">Manage your part images in one centralized location.</p>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-3">
            <button
              onClick={loadDashboardData}
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
        
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">Total Images</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">{statistics.totalImages}</dd>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">Total Storage Used</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">{statistics.totalSize}</dd>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">Last Upload</dt>
              <dd className="mt-1 text-xl font-semibold text-gray-900">{statistics.lastUpload}</dd>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">Images Processing</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">{statistics.processingQueue}</dd>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('recent')}
              className={`${
                activeTab === 'recent'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Recent Images
            </button>
            <button
              onClick={() => setActiveTab('favorites')}
              className={`${
                activeTab === 'favorites'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Favorites
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`${
                activeTab === 'pending'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Pending
            </button>
          </nav>
        </div>

        {/* Images Table */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md mb-8">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <h2 className="text-lg leading-6 font-medium text-gray-900">
              {activeTab === 'recent' ? 'Recent Images' : 
               activeTab === 'favorites' ? 'Favorite Images' : 'Pending Images'}
            </h2>
            <div className="relative">
              <input
                type="text"
                placeholder="Search images..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border rounded-md py-2 pl-10 pr-4 block w-full text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-200">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Preview
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        File Name
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Part Number
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Upload Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Size
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredImages.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                          {searchTerm ? 'No images found matching your search.' : 'No images found. Start uploading to build your collection.'}
                        </td>
                      </tr>
                    ) : (
                      filteredImages.map((image: ImageData) => (
                        <tr key={image.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="h-10 w-10 bg-gray-200 rounded flex items-center justify-center">
                              <span className="text-xs text-gray-500">IMG</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {image.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {image.partNumber}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {image.uploadDate}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {image.size}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                              ${image.status === 'Processed' ? 'bg-green-100 text-green-800' : 
                                image.status === 'Processing' ? 'bg-yellow-100 text-yellow-800' : 
                                'bg-red-100 text-red-800'}`}>
                              {image.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex space-x-2">
                              <button 
                                onClick={() => handleViewImage(image.id)}
                                className="text-indigo-600 hover:text-indigo-900"
                              >
                                View
                              </button>
                              <button className="text-gray-600 hover:text-gray-900">
                                Download
                              </button>
                              <button 
                                onClick={() => handleDeleteImage(image.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
            <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                  Previous
                </button>
                <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredImages.length}</span> of{' '}
                    <span className="font-medium">{filteredImages.length}</span> results
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Section */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 bg-gray-50">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Quick Actions</h3>
            <p className="mt-1 text-sm text-gray-500">Common tasks and shortcuts</p>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                href="/upload"
                className="group relative bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500 rounded-lg border border-gray-200 hover:border-indigo-300 transition-colors"
              >
                <div>
                  <span className="rounded-lg inline-flex p-3 bg-indigo-50 text-indigo-700 ring-4 ring-white">
                    <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </span>
                </div>
                <div className="mt-8">
                  <h3 className="text-lg font-medium">
                    <span className="absolute inset-0" aria-hidden="true" />
                    Upload Images
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Add new part images to your database with metadata.
                  </p>
                </div>
                <span className="pointer-events-none absolute top-6 right-6 text-gray-300 group-hover:text-gray-400" aria-hidden="true">
                  <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20 4h1a1 1 0 00-1-1v1zm-1 12a1 1 0 102 0h-2zM8 3a1 1 0 000 2V3zM3.293 19.293a1 1 0 101.414 1.414l-1.414-1.414zM19 4v12h2V4h-2zm1-1H8v2h12V3zm-.707.293l-16 16 1.414 1.414 16-16-1.414-1.414z" />
                  </svg>
                </span>
              </Link>

              <Link
                href="/gallery"
                className="group relative bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500 rounded-lg border border-gray-200 hover:border-indigo-300 transition-colors"
              >
                <div>
                  <span className="rounded-lg inline-flex p-3 bg-green-50 text-green-700 ring-4 ring-white">
                    <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </span>
                </div>
                <div className="mt-8">
                  <h3 className="text-lg font-medium">
                    <span className="absolute inset-0" aria-hidden="true" />
                    Browse Gallery
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    View and manage all your uploaded images in grid or list view.
                  </p>
                </div>
                <span className="pointer-events-none absolute top-6 right-6 text-gray-300 group-hover:text-gray-400" aria-hidden="true">
                  <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20 4h1a1 1 0 00-1-1v1zm-1 12a1 1 0 102 0h-2zM8 3a1 1 0 000 2V3zM3.293 19.293a1 1 0 101.414 1.414l-1.414-1.414zM19 4v12h2V4h-2zm1-1H8v2h12V3zm-.707.293l-16 16 1.414 1.414 16-16-1.414-1.414z" />
                  </svg>
                </span>
              </Link>

              <Link
                href="/settings"
                className="group relative bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500 rounded-lg border border-gray-200 hover:border-indigo-300 transition-colors"
              >
                <div>
                  <span className="rounded-lg inline-flex p-3 bg-purple-50 text-purple-700 ring-4 ring-white">
                    <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </span>
                </div>
                <div className="mt-8">
                  <h3 className="text-lg font-medium">
                    <span className="absolute inset-0" aria-hidden="true" />
                    Account Settings
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Manage your profile, preferences, and account settings.
                  </p>
                </div>
                <span className="pointer-events-none absolute top-6 right-6 text-gray-300 group-hover:text-gray-400" aria-hidden="true">
                  <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20 4h1a1 1 0 00-1-1v1zm-1 12a1 1 0 102 0h-2zM8 3a1 1 0 000 2V3zM3.293 19.293a1 1 0 101.414 1.414l-1.414-1.414zM19 4v12h2V4h-2zm1-1H8v2h12V3zm-.707.293l-16 16 1.414 1.414 16-16-1.414-1.414z" />
                  </svg>
                </span>
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="mt-8 bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 bg-gray-50">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Activity</h3>
            <p className="mt-1 text-sm text-gray-500">Latest system events and updates</p>
          </div>
          <div className="border-t border-gray-200">
            <ul className="divide-y divide-gray-200">
              <li className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                        <svg className="h-4 w-4 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">System initialized</div>
                      <div className="text-sm text-gray-500">Database connection established successfully</div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    Just now
                  </div>
                </div>
              </li>
              <li className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <svg className="h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">User logged in</div>
                      <div className="text-sm text-gray-500">{user?.fullName || user?.emailAddresses[0]?.emailAddress} accessed the dashboard</div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date().toLocaleTimeString()}
                  </div>
                </div>
              </li>
              <li className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center">
                        <svg className="h-4 w-4 text-yellow-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.99-.833-2.732 0L3.5 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">API Connection</div>
                      <div className="text-sm text-gray-500">Attempting to connect to backend API at {API_BASE_URL}</div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date().toLocaleTimeString()}
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}