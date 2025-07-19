'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
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
  const { user, error, isLoading } = useUser();
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
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  // Filter images based on search term
  const filteredImages = images.filter((image: ImageData) =>
    image.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    image.partNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
    </div>
  );
  
  if (error) return <div className="text-red-500 text-center mt-10">Error: {error.message}</div>;
  if (!user) return <div className="text-center mt-10">Please log in to view this page.</div>;

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
                  Settings
                </Link>
              </div>
            </div>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="relative ml-3">
                  <div className="flex items-center space-x-4">
                    <span className="text-gray-700">
                      {user.name || user.email || 'User'}
                    </span>
                    <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-800 font-semibold">
                      {(user.name?.charAt(0) || user.email?.charAt(0) || 'U').toUpperCase()}
                    </div>
                    <a
                      href="/api/auth/logout"
                      className="ml-2 px-3 py-1 text-sm text-gray-700 hover:text-gray-900"
                    >
                      Log out
                    </a>
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
      </main>
    </div>
  );
}