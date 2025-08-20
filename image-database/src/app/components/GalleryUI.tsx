// src/app/components/GalleryUI.tsx
'use client';

import Link from 'next/link';
import { UserButton } from '@clerk/nextjs';
import { useState } from 'react';

// Type definitions
export interface ImageType {
  id: number;
  image_id: number;
  name: string;
  file_name: string;
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
  imageUrl: string;
  thumbnailUrl: string;
  part_name?: string;
  part_number?: string;
  device_model?: string;
  location?: string;
  serial_number?: string;
  resolution?: string;
  capture_mode?: string;
  notes?: string;
  metadata: {
    dimensions: string;
    camera: string;
    operator: string;
    resolution?: string;
    capture_mode?: string;
    notes?: string;
  };
}

export interface CategoryType {
  id: string;
  name: string;
}

interface GalleryUIProps {
  user: any;
  activeView: string;
  setActiveView: (view: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isLoading: boolean;
  selectedImage: ImageType | null;
  setSelectedImage: (image: ImageType | null) => void;
  currentImages: ImageType[];
  filteredImages: ImageType[];
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalPages: number;
  indexOfFirstImage: number;
  indexOfLastImage: number;
  categories: CategoryType[];
  onRefresh: () => void;
  onImageClick: (id: number) => void;
  onDeleteImage: (id: number) => void;
  onDownloadImage: (image: ImageType) => void;
  onUpdateMetadata: (id: number, metadata: any) => void;
  generateImageUrl: (image: ImageType) => string;
  apiError: string | null;
  API_BASE_URL: string;
}

// Navigation Component
export const GalleryNavigation = ({ user }: { user: any }) => (
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
export const GalleryHeader = ({ onRefresh }: { onRefresh: () => void }) => (
  <div className="md:flex md:items-center md:justify-between mb-6">
    <div className="flex-1 min-w-0">
      <h1 className="text-2xl font-bold text-gray-900">Image Gallery</h1>
      <p className="mt-1 text-sm text-gray-500">Browse and manage your part images with advanced filtering and search.</p>
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

// Filter and Search Component
export const FilterAndSearch = ({
  selectedCategory,
  setSelectedCategory,
  searchQuery,
  setSearchQuery,
  activeView,
  setActiveView,
  categories,
  isLoading,
  currentPage,
  setCurrentPage
}: {
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeView: string;
  setActiveView: (view: string) => void;
  categories: CategoryType[];
  isLoading: boolean;
  currentPage: number;
  setCurrentPage: (page: number) => void;
}) => (
  <div className="bg-white shadow rounded-lg mb-6">
    <div className="px-4 py-5 sm:p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div className="flex flex-wrap items-center space-x-4">
          <div className="flex items-center space-x-2">
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
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative flex-1 min-w-0 max-w-md">
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
              className={`px-3 py-2 ${activeView === 'grid' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500 hover:text-gray-700'} transition-colors`}
              disabled={isLoading}
              title="Grid View"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button 
              onClick={() => setActiveView('list')} 
              className={`px-3 py-2 ${activeView === 'list' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500 hover:text-gray-700'} transition-colors`}
              disabled={isLoading}
              title="List View"
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
);

// Grid View Component
export const GridView = ({
  currentImages,
  onImageClick,
  generateImageUrl,
  isLoading
}: {
  currentImages: ImageType[];
  onImageClick: (id: number) => void;
  generateImageUrl: (image: ImageType) => string;
  isLoading: boolean;
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {[...Array(12)].map((_, index) => (
          <div key={index} className="bg-white overflow-hidden shadow rounded-lg animate-pulse">
            <div className="relative pb-[75%] bg-gray-200">
              <div className="absolute inset-0 w-full h-full bg-gray-300"></div>
            </div>
            <div className="px-4 py-3">
              <div className="h-4 bg-gray-300 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (currentImages.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No images found</h3>
        <p className="mt-1 text-sm text-gray-500">Try adjusting your search or category filter.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {currentImages.map((image) => (
        <div 
          key={image.id} 
          className="bg-white overflow-hidden shadow rounded-lg cursor-pointer transition duration-150 hover:shadow-lg transform hover:scale-105"
          onClick={() => onImageClick(image.id)}
        >
          <div className="relative pb-[75%] bg-gray-200">
            <img 
              src={generateImageUrl(image)}
              alt={image.name}
              className="absolute inset-0 w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.nextElementSibling?.classList.remove('hidden');
              }}
            />
            <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-300 to-gray-400 hidden">
              <div className="text-center">
                <svg className="mx-auto h-8 w-8 text-gray-500 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-gray-500 text-xs">{image.partNumber}</span>
              </div>
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
            <h3 className="text-sm font-medium text-gray-900 truncate" title={image.name}>
              {image.name}
            </h3>
            <p className="text-xs text-gray-500 mt-1">Part: {image.partNumber}</p>
            <p className="text-xs text-gray-500">{image.uploadDate} • {image.size}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

// List View Component
export const ListView = ({
  currentImages,
  onImageClick,
  generateImageUrl,
  isLoading
}: {
  currentImages: ImageType[];
  onImageClick: (id: number) => void;
  generateImageUrl: (image: ImageType) => string;
  isLoading: boolean;
}) => {
  if (isLoading) {
    return (
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {[...Array(8)].map((_, index) => (
            <li key={index} className="animate-pulse">
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="bg-gray-300 h-12 w-12 rounded mr-4"></div>
                    <div>
                      <div className="h-4 bg-gray-300 rounded w-40 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-24"></div>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (currentImages.length === 0) {
    return (
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No images found</h3>
          <p className="mt-1 text-sm text-gray-500">Try adjusting your search or category filter.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <ul className="divide-y divide-gray-200">
        {currentImages.map((image) => (
          <li key={image.id}>
            <div 
              className="block hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => onImageClick(image.id)}
            >
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-16 w-16 mr-4 flex-shrink-0">
                      <img 
                        src={generateImageUrl(image)}
                        alt={image.name}
                        className="h-16 w-16 object-cover rounded-lg shadow-sm"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                      <div className="hidden bg-gradient-to-br from-gray-200 to-gray-300 h-16 w-16 flex items-center justify-center rounded-lg">
                        <span className="text-gray-500 text-xs font-medium">{image.partNumber.slice(-4)}</span>
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-indigo-600 truncate">{image.name}</p>
                      <p className="text-sm text-gray-500">Part: {image.partNumber}</p>
                      <p className="text-sm text-gray-500">{image.uploadDate} • {image.size} • {image.file_type}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full 
                      ${image.status === 'Processed' ? 'bg-green-100 text-green-800' : 
                        image.status === 'Processing' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'}`}>
                      {image.status}
                    </span>
                    <div className="text-sm text-gray-500">
                      <div>{image.metadata.dimensions}</div>
                      <div className="text-xs">{image.metadata.camera}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

// Pagination Component
export const Pagination = ({
  currentPage,
  setCurrentPage,
  totalPages,
  indexOfFirstImage,
  indexOfLastImage,
  filteredImages
}: {
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalPages: number;
  indexOfFirstImage: number;
  indexOfLastImage: number;
  filteredImages: ImageType[];
}) => {
  if (filteredImages.length === 0) return null;

  return (
    <div className="bg-white px-4 py-3 flex items-center justify-between border border-gray-200 sm:px-6 rounded-lg mt-6">
      <div className="flex-1 flex justify-between sm:hidden">
        <button 
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <button 
          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
              className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="sr-only">Previous</span>
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </button>
            
            {[...Array(Math.min(totalPages, 5))].map((_, index) => {
              const pageNumber = currentPage <= 3 ? index + 1 : 
                                currentPage >= totalPages - 2 ? totalPages - 4 + index : 
                                currentPage - 2 + index;
              
              if (pageNumber < 1 || pageNumber > totalPages) return null;
              
              return (
                <button
                  key={pageNumber}
                  onClick={() => setCurrentPage(pageNumber)}
                  className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                    currentPage === pageNumber
                      ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                      : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {pageNumber}
                </button>
              );
            })}
            
            <button 
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
  );
};

// Image Detail Modal Component
export const ImageDetailModal = ({
  selectedImage,
  setSelectedImage,
  onDownloadImage,
  onDeleteImage,
  onUpdateMetadata,
  generateImageUrl
}: {
  selectedImage: ImageType | null;
  setSelectedImage: (image: ImageType | null) => void;
  onDownloadImage: (image: ImageType) => void;
  onDeleteImage: (id: number) => void;
  onUpdateMetadata: (id: number, metadata: any) => void;
  generateImageUrl: (image: ImageType) => string;
}) => {
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [editedNotes, setEditedNotes] = useState('');

  if (!selectedImage) return null;

  const handleNotesEdit = () => {
    setEditedNotes(selectedImage.metadata.notes || '');
    setIsEditingNotes(true);
  };

  const handleNotesSave = () => {
    onUpdateMetadata(selectedImage.id, { notes: editedNotes });
    setIsEditingNotes(false);
  };

  const handleNotesCancel = () => {
    setIsEditingNotes(false);
    setEditedNotes('');
  };

  return (
    <div className="fixed inset-0 overflow-y-auto z-50">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity">
          <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={() => setSelectedImage(null)}></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
        
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Image Details</h3>
                  <button 
                    type="button" 
                    className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    onClick={() => setSelectedImage(null)}
                  >
                    <span className="sr-only">Close</span>
                    <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Image Display */}
                  <div className="bg-gray-100 rounded-lg flex items-center justify-center min-h-[400px] lg:min-h-[500px]">
                    <img 
                      src={generateImageUrl(selectedImage)}
                      alt={selectedImage.name}
                      className="max-w-full max-h-full object-contain rounded"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                    <div className="hidden text-center">
                      <div className="text-gray-500 mb-4">
                        <svg className="mx-auto h-16 w-16 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="text-sm text-gray-400">
                        {selectedImage.name}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {selectedImage.metadata.dimensions}
                      </div>
                    </div>
                  </div>

                  {/* Image Information */}
                  <div className="space-y-6">
                    {/* Basic Info */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-900 mb-3">Basic Information</h4>
                      <div className="grid grid-cols-1 gap-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">File Name:</span>
                          <span className="font-medium text-right">{selectedImage.name}</span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-gray-500">Part Number:</span>
                          <span className="font-medium">{selectedImage.partNumber}</span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-gray-500">Status:</span>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full 
                            ${selectedImage.status === 'Processed' ? 'bg-green-100 text-green-800' : 
                              selectedImage.status === 'Processing' ? 'bg-yellow-100 text-yellow-800' : 
                              'bg-red-100 text-red-800'}`}>
                            {selectedImage.status}
                          </span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-gray-500">Uploaded:</span>
                          <span className="font-medium">{selectedImage.uploadDate}</span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-gray-500">File Size:</span>
                          <span className="font-medium">{selectedImage.size}</span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-gray-500">File Type:</span>
                          <span className="font-medium">{selectedImage.file_type}</span>
                        </div>
                      </div>
                    </div>

                    {/* Technical Details */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-900 mb-3">Technical Details</h4>
                      <div className="grid grid-cols-1 gap-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Resolution:</span>
                          <span className="font-medium">{selectedImage.metadata.dimensions}</span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-gray-500">Camera:</span>
                          <span className="font-medium">{selectedImage.metadata.camera}</span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-gray-500">Operator:</span>
                          <span className="font-medium">{selectedImage.metadata.operator}</span>
                        </div>
                        
                        {selectedImage.metadata.capture_mode && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">Capture Mode:</span>
                            <span className="font-medium">{selectedImage.metadata.capture_mode}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Notes Section */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="text-sm font-medium text-gray-900">Notes</h4>
                        {!isEditingNotes && (
                          <button 
                            onClick={handleNotesEdit}
                            className="text-xs text-indigo-600 hover:text-indigo-500"
                          >
                            Edit
                          </button>
                        )}
                      </div>
                      {isEditingNotes ? (
                        <div className="space-y-3">
                          <textarea
                            value={editedNotes}
                            onChange={(e) => setEditedNotes(e.target.value)}
                            className="w-full p-2 text-sm border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                            rows={3}
                            placeholder="Add notes about this image..."
                          />
                          <div className="flex space-x-2">
                            <button 
                              onClick={handleNotesSave}
                              className="px-3 py-1 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700"
                            >
                              Save
                            </button>
                            <button 
                              onClick={handleNotesCancel}
                              className="px-3 py-1 text-xs bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-600">
                          {selectedImage.metadata.notes || 'No notes available'}
                        </p>
                      )}
                    </div>
                    
                    {/* Actions */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-900 mb-3">Actions</h4>
                      <div className="flex flex-wrap gap-2">
                        <button 
                          onClick={() => window.open(generateImageUrl(selectedImage), '_blank')}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          View Full Size
                        </button>
                        <button 
                          onClick={() => onDownloadImage(selectedImage)}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          Download
                        </button>
                        <button 
                          onClick={() => onDeleteImage(selectedImage.id)}
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
  );
};