// src/app/components/GroupedGalleryUI.tsx
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

export interface GroupedImages {
  partNumber: string;
  partName?: string;
  images: ImageType[];
  totalImages: number;
  latestUpload: string;
  totalSize: string;
}

interface GroupedGalleryUIProps {
  user: any;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isLoading: boolean;
  selectedPartNumber: string | null;
  setSelectedPartNumber: (partNumber: string | null) => void;
  groupedImages: GroupedImages[];
  selectedImage: ImageType | null;
  setSelectedImage: (image: ImageType | null) => void;
  onRefresh: () => void;
  onImageClick: (id: number) => void;
  onDeleteImage: (id: number) => void;
  onDownloadImage: (image: ImageType) => void;
  generateImageUrl: (image: ImageType) => string;
  apiError: string | null;
  API_BASE_URL: string;
}

// Navigation Component
export const GroupedGalleryNavigation = ({ user }: { user: any }) => (
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
export const GroupedGalleryHeader = ({ onRefresh }: { onRefresh: () => void }) => (
  <div className="md:flex md:items-center md:justify-between mb-6">
    <div className="flex-1 min-w-0">
      <h1 className="text-2xl font-bold text-gray-900">Parts Gallery</h1>
      <p className="mt-1 text-sm text-gray-500">Browse images grouped by part number for easy comparison and management.</p>
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

// Search Component
export const GroupedGallerySearch = ({
  searchQuery,
  setSearchQuery,
  isLoading,
  totalParts,
  totalImages
}: {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isLoading: boolean;
  totalParts: number;
  totalImages: number;
}) => (
  <div className="bg-white shadow rounded-lg mb-6">
    <div className="px-4 py-5 sm:p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div className="flex-1 min-w-0 max-w-md">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by part number..."
              className="block w-full pr-10 sm:text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={isLoading}
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          <div className="flex items-center">
            <span className="font-medium text-indigo-600">{totalParts}</span>
            <span className="ml-1">Parts</span>
          </div>
          <div className="flex items-center">
            <span className="font-medium text-indigo-600">{totalImages}</span>
            <span className="ml-1">Total Images</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Part Number Groups View
export const PartNumberGroupsView = ({
  groupedImages,
  onPartNumberClick,
  selectedPartNumber,
  isLoading,
  generateImageUrl
}: {
  groupedImages: GroupedImages[];
  onPartNumberClick: (partNumber: string) => void;
  selectedPartNumber: string | null;
  isLoading: boolean;
  generateImageUrl: (image: ImageType) => string;
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="bg-white rounded-lg shadow animate-pulse">
            <div className="p-6">
              <div className="h-6 bg-gray-300 rounded mb-4"></div>
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="h-16 bg-gray-200 rounded"></div>
                <div className="h-16 bg-gray-200 rounded"></div>
                <div className="h-16 bg-gray-200 rounded"></div>
              </div>
              <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (groupedImages.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No parts found</h3>
        <p className="mt-1 text-sm text-gray-500">Try adjusting your search criteria.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {groupedImages.map((group) => (
        <div 
          key={group.partNumber}
          className={`bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer ${
            selectedPartNumber === group.partNumber ? 'ring-2 ring-indigo-500' : ''
          }`}
          onClick={() => onPartNumberClick(group.partNumber)}
        >
          <div className="p-6">
            {/* Part Number Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{group.partNumber}</h3>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                {group.totalImages} images
              </span>
            </div>

            {/* Part Name */}
            {group.partName && (
              <p className="text-sm text-gray-600 mb-3">{group.partName}</p>
            )}

            {/* Image Preview Grid */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {group.images.slice(0, 3).map((image, index) => (
                <div key={index} className="relative">
                  <img
                    src={generateImageUrl(image)}
                    alt={`${group.partNumber} - ${index + 1}`}
                    className="w-full h-16 object-cover rounded"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                  <div className="hidden w-full h-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded flex items-center justify-center">
                    <span className="text-gray-500 text-xs">{group.partNumber.slice(-3)}</span>
                  </div>
                </div>
              ))}
              {/* Show "+" indicator if more than 3 images */}
              {group.totalImages > 3 && (
                <div className="absolute top-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                  +{group.totalImages - 3}
                </div>
              )}
            </div>

            {/* Part Info */}
            <div className="space-y-2 text-sm text-gray-500">
              <div className="flex justify-between">
                <span>Total Size:</span>
                <span className="font-medium">{group.totalSize}</span>
              </div>
              <div className="flex justify-between">
                <span>Latest Upload:</span>
                <span className="font-medium">{group.latestUpload}</span>
              </div>
            </div>

            {/* View Details Button */}
            <div className="mt-4">
              <button className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                View All Images
                <svg className="ml-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Individual Images View for Selected Part
export const PartImagesDetailView = ({
  selectedGroup,
  onBackClick,
  onImageClick,
  onDownloadImage,
  generateImageUrl
}: {
  selectedGroup: GroupedImages;
  onBackClick: () => void;
  onImageClick: (id: number) => void;
  onDownloadImage: (image: ImageType) => void;
  generateImageUrl: (image: ImageType) => string;
}) => (
  <div>
    {/* Back Button and Header */}
    <div className="flex items-center mb-6">
      <button
        onClick={onBackClick}
        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        <svg className="h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Parts
      </button>
      <div className="ml-4">
        <h2 className="text-xl font-bold text-gray-900">{selectedGroup.partNumber}</h2>
        <p className="text-sm text-gray-500">{selectedGroup.totalImages} images</p>
      </div>
    </div>

    {/* Images Grid */}
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {selectedGroup.images.map((image) => (
        <div 
          key={image.id}
          className="bg-white overflow-hidden shadow rounded-lg cursor-pointer transition duration-150 hover:shadow-lg transform hover:scale-105"
        >
          <div className="relative pb-[75%] bg-gray-200">
            <img 
              src={generateImageUrl(image)}
              alt={image.name}
              className="absolute inset-0 w-full h-full object-cover"
              onClick={() => onImageClick(image.id)}
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
                <span className="text-gray-500 text-xs">{selectedGroup.partNumber}</span>
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
            <p className="text-xs text-gray-500 mt-1">{image.uploadDate} • {image.size}</p>
            <div className="mt-2 flex space-x-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDownloadImage(image);
                }}
                className="flex-1 inline-flex justify-center items-center px-2 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
              >
                Download
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onImageClick(image.id);
                }}
                className="flex-1 inline-flex justify-center items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-white bg-indigo-600 hover:bg-indigo-700"
              >
                View
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default {
  GroupedGalleryNavigation,
  GroupedGalleryHeader,
  GroupedGallerySearch,
  PartNumberGroupsView,
  PartImagesDetailView
};