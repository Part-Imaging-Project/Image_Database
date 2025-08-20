// src/app/components/DashboardUI.tsx - Fixed Part Number Display
'use client';

import Link from 'next/link';
import { UserButton } from '@clerk/nextjs';

// Type definitions
export interface ImageData {
  image_id: number;
  file_name: string;
  file_path: string;
  file_type: string;
  image_size: number;
  captured_at: string;
  bucket_name: string;
  part_name?: string;
  part_number?: string;
  device_model?: string;
  location?: string;
  serial_number?: string;
  resolution?: string;
  capture_mode?: string;
  notes?: string;
}

export interface Statistics {
  totalImages: number;
  totalSize: string;
  lastUpload: string;
  processingQueue: number;
}

// Helper function to get display part number
const getDisplayPartNumber = (image: ImageData): string => {
  // Priority order: part_number -> part_name -> extract from notes -> fallback
  if (image.part_number && image.part_number.trim() !== '') {
    return image.part_number.trim();
  }
  
  if (image.part_name && image.part_name.trim() !== '') {
    return image.part_name.trim();
  }
  
  // Try to extract from notes
  if (image.notes) {
    const partMatch = image.notes.match(/Part:\s*([A-Za-z0-9\-_]+)/i);
    if (partMatch) {
      return partMatch[1];
    }
    
    const pnMatch = image.notes.match(/P\/?N:\s*([A-Za-z0-9\-_]+)/i);
    if (pnMatch) {
      return pnMatch[1];
    }
  }
  
  // Fallback
  return `PART-${image.image_id}`;
};

// Helper function to check if part number is available
const hasValidPartNumber = (image: ImageData): boolean => {
  return !!(image.part_number || image.part_name || 
           (image.notes && (image.notes.includes('Part:') || image.notes.includes('P/N:') || image.notes.includes('PN:'))));
};

interface DashboardUIProps {
  user: any;
  statistics: Statistics;
  loading: boolean;
  apiError: string | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  tabImages: ImageData[];
  filteredImages: ImageData[];
  onRefresh: () => void;
  onViewImage: (id: number) => void;
  onDeleteImage: (id: number) => void;
  onDownloadImage: (image: ImageData) => void;
  getImagePreviewUrl: (image: ImageData) => string;
  API_BASE_URL: string;
}

// Navigation Component
export const DashboardNavigation = ({ user }: { user: any }) => (
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
);

// Header Component
export const DashboardHeader = ({ onRefresh }: { onRefresh: () => void }) => (
  <div className="md:flex md:items-center md:justify-between mb-6">
    <div className="flex-1 min-w-0">
      <h1 className="text-2xl font-bold text-gray-900">Image Database Dashboard</h1>
      <p className="mt-1 text-sm text-gray-500">Manage your part images in one centralized location.</p>
    </div>
    <div className="mt-4 md:mt-0 flex space-x-3">
      <button
        onClick={onRefresh}
        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        <svg className="h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Refresh
      </button>
      <Link 
        href="/upload"
        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        <svg className="h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        Upload New Images
      </Link>
    </div>
  </div>
);

// Error Alert Component
export const ErrorAlert = ({ apiError, API_BASE_URL }: { apiError: string; API_BASE_URL: string }) => (
  <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
    <div className="flex">
      <div className="flex-shrink-0">
        <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      </div>
      <div className="ml-3">
        <h3 className="text-sm font-medium text-red-800">API Connection Error</h3>
        <div className="mt-2 text-sm text-red-700">
          <p>{apiError}</p>
          <p className="mt-1 text-xs">Make sure your backend is running on {API_BASE_URL}</p>
        </div>
      </div>
    </div>
  </div>
);

// Statistics Cards Component
export const StatisticsCards = ({ statistics }: { statistics: Statistics }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <dt className="text-sm font-medium text-gray-500 truncate">Total Images</dt>
        <dd className="mt-1 text-3xl font-semibold text-indigo-600">{statistics.totalImages}</dd>
      </div>
    </div>
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <dt className="text-sm font-medium text-gray-500 truncate">Total Storage Used</dt>
        <dd className="mt-1 text-3xl font-semibold text-green-600">{statistics.totalSize}</dd>
      </div>
    </div>
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <dt className="text-sm font-medium text-gray-500 truncate">Last Upload</dt>
        <dd className="mt-1 text-lg font-semibold text-blue-600">{statistics.lastUpload}</dd>
      </div>
    </div>
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <dt className="text-sm font-medium text-gray-500 truncate">Processing Queue</dt>
        <dd className="mt-1 text-3xl font-semibold text-purple-600">{statistics.processingQueue}</dd>
      </div>
    </div>
  </div>
);

// Tab Navigation Component
export const TabNavigation = ({ 
  activeTab, 
  setActiveTab, 
  filteredImages 
}: { 
  activeTab: string; 
  setActiveTab: (tab: string) => void; 
  filteredImages: ImageData[];
}) => (
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
        Recent Images ({filteredImages.length})
      </button>
      <button
        onClick={() => setActiveTab('favorites')}
        className={`${
          activeTab === 'favorites'
            ? 'border-indigo-500 text-indigo-600'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
        } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
      >
        Favorites (0)
      </button>
      <button
        onClick={() => setActiveTab('pending')}
        className={`${
          activeTab === 'pending'
            ? 'border-indigo-500 text-indigo-600'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
        } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
      >
        Pending (0)
      </button>
    </nav>
  </div>
);

// Images Table Component
export const ImagesTable = ({ 
  loading,
  activeTab,
  searchTerm,
  setSearchTerm,
  tabImages,
  filteredImages,
  onViewImage,
  onDeleteImage,
  onDownloadImage,
  getImagePreviewUrl,
  apiError
}: {
  loading: boolean;
  activeTab: string;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  tabImages: ImageData[];
  filteredImages: ImageData[];
  onViewImage: (id: number) => void;
  onDeleteImage: (id: number) => void;
  onDownloadImage: (image: ImageData) => void;
  getImagePreviewUrl: (image: ImageData) => string;
  apiError: string | null;
}) => (
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
          <span className="ml-3 text-gray-600">Loading images...</span>
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
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tabImages.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <svg className="h-12 w-12 text-gray-400 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {activeTab === 'recent' ? 'No Images Found' : `No ${activeTab} Images`}
                      </h3>
                      <p className="text-sm text-gray-500 max-w-md">
                        {activeTab === 'recent' ? (
                          searchTerm ? 'No images match your search criteria. Try adjusting your search terms.' : 
                          apiError ? 'Unable to load images. Please check your connection and try again.' :
                          'Get started by uploading your first images to the database.'
                        ) : `No ${activeTab} images found. Images will appear here as they are marked.`}
                      </p>
                      {activeTab === 'recent' && !searchTerm && !apiError && (
                        <Link
                          href="/upload"
                          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                        >
                          Upload Your First Images
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                tabImages.map((image: ImageData) => (
                  <tr key={image.image_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-16 w-16 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden shadow-sm">
                        <img
                          src={getImagePreviewUrl(image)}
                          alt={image.file_name}
                          className="h-full w-full object-cover rounded-lg"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                        <div className="hidden flex items-center justify-center h-full w-full bg-gradient-to-br from-gray-300 to-gray-400 rounded-lg">
                          <svg className="h-6 w-6 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{image.file_name}</div>
                      <div className="text-sm text-gray-500">{image.file_type}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-sm text-gray-900 font-medium">
                          {getDisplayPartNumber(image)}
                        </div>
                        {hasValidPartNumber(image) && (
                          <div className="ml-2">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                              ✓
                            </span>
                          </div>
                        )}
                      </div>
                      {image.part_name && image.part_name !== image.part_number && (
                        <div className="text-xs text-gray-500 mt-1">
                          {image.part_name}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(image.captured_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {image.image_size ? `${(image.image_size / (1024 * 1024)).toFixed(1)} MB` : 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-3">
                        <button 
                          onClick={() => onViewImage(image.image_id)}
                          className="text-indigo-600 hover:text-indigo-900 font-medium"
                        >
                          View
                        </button>
                        <button 
                          onClick={() => onDownloadImage(image)}
                          className="text-blue-600 hover:text-blue-900 font-medium"
                        >
                          Download
                        </button>
                        <button 
                          onClick={() => onDeleteImage(image.image_id)}
                          className="text-red-600 hover:text-red-900 font-medium"
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
      {tabImages.length > 0 && (
        <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 bg-gray-50">
          <div className="flex-1 flex justify-between sm:hidden">
            <span className="text-sm text-gray-700">
              Showing {tabImages.length} of {filteredImages.length} results
            </span>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">1</span> to <span className="font-medium">{tabImages.length}</span> of{' '}
                <span className="font-medium">{filteredImages.length}</span> results
              </p>
            </div>
            {filteredImages.length > 10 && (
              <div>
                <Link
                  href="/gallery"
                  className="text-indigo-600 hover:text-indigo-500 text-sm font-medium"
                >
                  View all in Gallery →
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  </div>
);

// Quick Actions Component
export const QuickActions = ({ statistics }: { statistics: Statistics }) => (
  <div className="bg-white shadow rounded-lg overflow-hidden">
    <div className="px-4 py-5 sm:px-6 bg-gray-50">
      <h3 className="text-lg leading-6 font-medium text-gray-900">Quick Actions</h3>
      <p className="mt-1 text-sm text-gray-500">Common tasks and shortcuts</p>
    </div>
    <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/upload"
          className="group relative bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500 rounded-lg border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all"
        >
          <div>
            <span className="rounded-lg inline-flex p-3 bg-indigo-50 text-indigo-700 ring-4 ring-white group-hover:bg-indigo-100">
              <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </span>
          </div>
          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-900 group-hover:text-indigo-600">
              Upload Images
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Add new part images to your database with metadata.
            </p>
          </div>
        </Link>

        <Link
          href="/gallery"
          className="group relative bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500 rounded-lg border border-gray-200 hover:border-green-300 hover:shadow-md transition-all"
        >
          <div>
            <span className="rounded-lg inline-flex p-3 bg-green-50 text-green-700 ring-4 ring-white group-hover:bg-green-100">
              <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </span>
          </div>
          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-900 group-hover:text-green-600">
              Browse Gallery
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              View and manage all your uploaded images in grid or list view.
            </p>
          </div>
        </Link>

        <div className="group relative bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500 rounded-lg border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all">
          <div>
            <span className="rounded-lg inline-flex p-3 bg-purple-50 text-purple-700 ring-4 ring-white group-hover:bg-purple-100">
              <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </span>
          </div>
          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-900 group-hover:text-purple-600">
              Database Stats
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              {statistics.totalImages} images • {statistics.totalSize} storage
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// System Status Component
export const SystemStatus = ({ 
  apiError, 
  user, 
  loading, 
  statistics, 
  API_BASE_URL 
}: { 
  apiError: string | null; 
  user: any; 
  loading: boolean; 
  statistics: Statistics; 
  API_BASE_URL: string;
}) => (
  <div className="mt-8 bg-white shadow rounded-lg overflow-hidden">
    <div className="px-4 py-5 sm:px-6 bg-gray-50">
      <h3 className="text-lg leading-6 font-medium text-gray-900">System Status</h3>
      <p className="mt-1 text-sm text-gray-500">Backend connection and recent activity</p>
    </div>
    <div className="border-t border-gray-200">
      <ul className="divide-y divide-gray-200">
        <li className="px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className={`h-8 w-8 rounded-full ${apiError ? 'bg-red-100' : 'bg-green-100'} flex items-center justify-center`}>
                  <svg className={`h-4 w-4 ${apiError ? 'text-red-600' : 'text-green-600'}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {apiError ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    )}
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-gray-900">
                  Backend API Connection
                </div>
                <div className="text-sm text-gray-500">
                  {apiError ? `Connection failed: ${API_BASE_URL}` : `Connected to ${API_BASE_URL}`}
                </div>
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
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <svg className="h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-gray-900">User Session</div>
                <div className="text-sm text-gray-500">{user?.fullName || user?.emailAddresses[0]?.emailAddress} is logged in</div>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              Active
            </div>
          </div>
        </li>
        <li className="px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                  <svg className="h-4 w-4 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-gray-900">Database Status</div>
                <div className="text-sm text-gray-500">
                  {loading ? 'Checking...' : `${statistics.totalImages} images stored`}
                </div>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              {loading ? 'Loading...' : 'Ready'}
            </div>
          </div>
        </li>
      </ul>
    </div>
  </div>
);