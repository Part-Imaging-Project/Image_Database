// src/app/components/GalleryUI.tsx - Complete File with All Parts
"use client";

import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { useState, useEffect } from "react";

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
  // New props for keyboard navigation
  onNavigateImage: (direction: "prev" | "next") => void;
  currentImageIndex: number;
  totalImagesInSet: number;
  // New props for batch operations
  selectedImageIds: number[];
  onToggleImageSelection: (id: number) => void;
  onSelectAllImages: (images: ImageType[]) => void;
  onDeselectAllImages: () => void;
  onBatchDeleteImages: (ids: number[]) => void;
  isSelectionMode: boolean;
  onToggleSelectionMode: () => void;
}

// Navigation Component
export const GroupedGalleryNavigation = ({ user }: { user: any }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl sm:text-2xl font-bold text-indigo-600">
                ImageDB
              </Link>
            </div>
            {/* Desktop Navigation */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8 desktop-nav-menu">
              <Link
                href="/dashboard"
                className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Dashboard
              </Link>
              <Link
                href="/gallery"
                className="border-indigo-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Gallery
              </Link>
              <Link
                href="/upload"
                className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Upload
              </Link>
            </div>
          </div>
          
          {/* Desktop User Menu */}
          <div className="hidden sm:flex items-center">
            <div className="flex-shrink-0">
              <div className="relative ml-3">
                <div className="flex items-center space-x-4">
                  <span className="text-gray-700 text-sm">
                    {user?.fullName ||
                      user?.emailAddresses[0]?.emailAddress ||
                      "User"}
                  </span>
                  <UserButton afterSignOutUrl="/" />
                </div>
              </div>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <UserButton afterSignOutUrl="/" />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="ml-2 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {/* Menu icon */}
              <svg
                className={`${isMobileMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              {/* Close icon */}
              <svg
                className={`${isMobileMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} sm:hidden mobile-nav-menu`}>
          <div className="pt-2 pb-3 space-y-1">
            <Link
              href="/dashboard"
              className="border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              href="/gallery"
              className="bg-indigo-50 border-indigo-500 text-indigo-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Gallery
            </Link>
            <Link
              href="/upload"
              className="border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Upload
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

// Header Component
export const GroupedGalleryHeader = ({
  onRefresh,
}: {
  onRefresh: () => void;
}) => (
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0">
    <div className="flex-1 min-w-0">
      <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Parts Gallery</h1>
      <p className="mt-1 text-sm text-gray-500">
        Browse images grouped by part number for easy comparison and management.
      </p>
    </div>
    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
      <button
        onClick={onRefresh}
        className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        <svg
          className="h-4 w-4 mr-2"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
        Refresh
      </button>
      <Link
        href="/upload"
        className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        <svg
          className="h-4 w-4 mr-2"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
          />
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
  totalImages,
}: {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isLoading: boolean;
  totalParts: number;
  totalImages: number;
}) => (
  <div className="bg-white shadow rounded-lg mb-6">
    <div className="px-4 py-5 sm:p-6">
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div className="flex-1 min-w-0 max-w-full md:max-w-md">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by part number..."
              className="block w-full pr-10 text-sm sm:text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={isLoading}
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clipRule="evenodd"
                />
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
  generateImageUrl,
}: {
  groupedImages: GroupedImages[];
  onPartNumberClick: (partNumber: string) => void;
  selectedPartNumber: string | null;
  isLoading: boolean;
  generateImageUrl: (image: ImageType) => string;
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="bg-white rounded-lg shadow animate-pulse mobile-card">
            <div className="p-4 sm:p-6">
              <div className="h-6 bg-gray-300 rounded mb-4"></div>
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="h-12 sm:h-16 bg-gray-200 rounded"></div>
                <div className="h-12 sm:h-16 bg-gray-200 rounded"></div>
                <div className="h-12 sm:h-16 bg-gray-200 rounded"></div>
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
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          No parts found
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Try adjusting your search criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {groupedImages.map((group) => (
        <div
          key={group.partNumber}
          className={`bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer mobile-card ${
            selectedPartNumber === group.partNumber
              ? "ring-2 ring-indigo-500"
              : ""
          }`}
          onClick={() => onPartNumberClick(group.partNumber)}
        >
          <div className="p-4 sm:p-6">
            {/* Part Number Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate mr-2">
                {group.partNumber}
              </h3>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 flex-shrink-0">
                {group.totalImages} images
              </span>
            </div>

            {/* Part Name */}
            {group.partName && (
              <p className="text-sm text-gray-600 mb-3">{group.partName}</p>
            )}

            {/* Image Preview Grid */}
            <div className="grid grid-cols-3 gap-2 mb-4 relative">
              {group.images.slice(0, 3).map((image, index) => (
                <div key={index} className="relative">
                  <img
                    src={generateImageUrl(image)}
                    alt={`${group.partNumber} - ${index + 1}`}
                    className="w-full h-12 sm:h-16 object-cover rounded"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                      target.nextElementSibling?.classList.remove("hidden");
                    }}
                  />
                  <div className="hidden w-full h-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded flex items-center justify-center">
                    <span className="text-gray-500 text-xs">
                      {group.partNumber.slice(-3)}
                    </span>
                  </div>
                  {/* Show "+" indicator only on the last image if more than 3 images */}
                  {index === 2 && group.totalImages > 3 && (
                    <div className="absolute inset-0 bg-black bg-opacity-60 text-white text-xs flex items-center justify-center rounded pointer-events-none">
                      +{group.totalImages - 3}
                    </div>
                  )}
                </div>
              ))}
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
                <svg
                  className="ml-2 h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
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
  generateImageUrl,
  selectedImageIds,
  onToggleImageSelection,
  onSelectAllImages,
  onDeselectAllImages,
  onBatchDeleteImages,
  isSelectionMode,
  onToggleSelectionMode,
}: {
  selectedGroup: GroupedImages;
  onBackClick: () => void;
  onImageClick: (id: number) => void;
  onDownloadImage: (image: ImageType) => void;
  generateImageUrl: (image: ImageType) => string;
  selectedImageIds: number[];
  onToggleImageSelection: (id: number) => void;
  onSelectAllImages: (images: ImageType[]) => void;
  onDeselectAllImages: () => void;
  onBatchDeleteImages: (ids: number[]) => void;
  isSelectionMode: boolean;
  onToggleSelectionMode: () => void;
}) => {
  const handleSelectAll = () => {
    onSelectAllImages(selectedGroup.images);
  };

  const handleBatchDelete = () => {
    if (selectedImageIds.length === 0) return;
    
    if (window.confirm(`Are you sure you want to delete ${selectedImageIds.length} selected images? This action cannot be undone.`)) {
      onBatchDeleteImages(selectedImageIds);
    }
  };

  return (
    <div>
      {/* Back Button and Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={onBackClick}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <svg
              className="h-4 w-4 mr-2"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Parts
          </button>
          <div className="ml-4">
            <h2 className="text-xl font-bold text-gray-900">
              {selectedGroup.partNumber}
            </h2>
            <p className="text-sm text-gray-500">
              {selectedGroup.totalImages} images
              {selectedImageIds.length > 0 && ` • ${selectedImageIds.length} selected`}
            </p>
          </div>
        </div>

        {/* Selection Mode Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={onToggleSelectionMode}
            className={`inline-flex items-center px-3 py-2 border text-sm leading-4 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
              isSelectionMode
                ? "border-red-300 text-red-700 bg-red-50 hover:bg-red-100"
                : "border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
            }`}
          >
            {isSelectionMode ? (
              <>
                <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Cancel Selection
              </>
            ) : (
              <>
                <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Select Images
              </>
            )}
          </button>

          {isSelectionMode && (
            <>
              <button
                onClick={handleSelectAll}
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Select All
              </button>
              
              {selectedImageIds.length > 0 && (
                <button
                  onClick={onDeselectAllImages}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Deselect All
                </button>
              )}

              {selectedImageIds.length > 0 && (
                <button
                  onClick={handleBatchDelete}
                  className="inline-flex items-center px-3 py-2 border border-red-300 text-sm leading-4 font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete Selected ({selectedImageIds.length})
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Images Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {selectedGroup.images.map((image) => {
          const isSelected = selectedImageIds.includes(image.id);
          
          return (
            <div
              key={image.id}
              className={`bg-white overflow-hidden shadow rounded-lg transition duration-150 hover:shadow-lg transform hover:scale-105 ${
                isSelected ? 'ring-2 ring-indigo-500' : ''
              }`}
            >
              <div className="relative pb-[75%] bg-gray-200">
                {/* Selection Checkbox */}
                {isSelectionMode && (
                  <div className="absolute top-2 left-2 z-10">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => {
                        e.stopPropagation();
                        onToggleImageSelection(image.id);
                      }}
                      className="h-5 w-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                    />
                  </div>
                )}
                
                <img
                  src={generateImageUrl(image)}
                  alt={image.name}
                  className="absolute inset-0 w-full h-full object-cover cursor-pointer"
                  onClick={() => {
                    if (isSelectionMode) {
                      onToggleImageSelection(image.id);
                    } else {
                      onImageClick(image.id);
                    }
                  }}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                    target.nextElementSibling?.classList.remove("hidden");
                  }}
                />
                <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-300 to-gray-400 hidden">
                  <div className="text-center">
                    <svg
                      className="mx-auto h-8 w-8 text-gray-500 mb-2"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <span className="text-gray-500 text-xs">
                      {selectedGroup.partNumber}
                    </span>
                  </div>
                </div>
              </div>
              <div className="px-4 py-3">
                <h3
                  className="text-sm font-medium text-gray-900 truncate"
                  title={image.name}
                >
                  {image.name}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  {image.uploadDate} • {image.size}
                </p>
                {!isSelectionMode && (
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
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Enhanced Image Detail Modal with Keyboard Navigation
export const ImageDetailModal = ({
  selectedImage,
  setSelectedImage,
  onDownloadImage,
  onDeleteImage,
  onUpdateMetadata,
  generateImageUrl,
  onNavigateImage,
  currentImageIndex,
  totalImagesInSet,
}: {
  selectedImage: ImageType | null;
  setSelectedImage: (image: ImageType | null) => void;
  onDownloadImage: (image: ImageType) => void;
  onDeleteImage: (id: number) => void;
  onUpdateMetadata: (id: number, metadata: any) => void;
  generateImageUrl: (image: ImageType) => string;
  onNavigateImage: (direction: "prev" | "next") => void;
  currentImageIndex: number;
  totalImagesInSet: number;
}) => {
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [editedNotes, setEditedNotes] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);

  // Keyboard navigation effect
  useEffect(() => {
    if (!selectedImage) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case "ArrowLeft":
          event.preventDefault();
          if (currentImageIndex > 0) {
            onNavigateImage("prev");
          }
          break;
        case "ArrowRight":
          event.preventDefault();
          if (currentImageIndex < totalImagesInSet - 1) {
            onNavigateImage("next");
          }
          break;
        case "Escape":
          event.preventDefault();
          setSelectedImage(null);
          break;
        case "d":
        case "D":
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            handleDownload();
          }
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    selectedImage,
    currentImageIndex,
    totalImagesInSet,
    onNavigateImage,
    setSelectedImage,
  ]);

  if (!selectedImage) return null;

  const handleNotesEdit = () => {
    setEditedNotes(selectedImage.metadata.notes || "");
    setIsEditingNotes(true);
  };

  const handleNotesSave = () => {
    onUpdateMetadata(selectedImage.id, { notes: editedNotes });
    setIsEditingNotes(false);
  };

  const handleNotesCancel = () => {
    setIsEditingNotes(false);
    setEditedNotes("");
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await onDownloadImage(selectedImage);
    } catch (error) {
      console.error("Download failed:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  const canNavigatePrev = currentImageIndex > 0;
  const canNavigateNext = currentImageIndex < totalImagesInSet - 1;

  return (
    <div className="fixed inset-0 overflow-y-auto z-50">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity">
          <div
            className="absolute inset-0 bg-gray-500 opacity-75"
            onClick={() => setSelectedImage(null)}
          ></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">
          &#8203;
        </span>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                {/* Header with Navigation */}
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center space-x-4">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Image Details
                    </h3>
                    {totalImagesInSet > 1 && (
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <span>
                          {currentImageIndex + 1} of {totalImagesInSet}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* Navigation Arrows */}
                    {totalImagesInSet > 1 && (
                      <>
                        <button
                          onClick={() => onNavigateImage("prev")}
                          disabled={!canNavigatePrev}
                          className={`p-2 rounded-md ${
                            canNavigatePrev
                              ? "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                              : "text-gray-300 cursor-not-allowed"
                          }`}
                          title="Previous image (←)"
                        >
                          <svg
                            className="h-5 w-5"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 19l-7-7 7-7"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => onNavigateImage("next")}
                          disabled={!canNavigateNext}
                          className={`p-2 rounded-md ${
                            canNavigateNext
                              ? "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                              : "text-gray-300 cursor-not-allowed"
                          }`}
                          title="Next image (→)"
                        >
                          <svg
                            className="h-5 w-5"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </button>
                        <div className="h-6 w-px bg-gray-300 mx-2"></div>
                      </>
                    )}

                    {/* Close Button */}
                    <button
                      type="button"
                      className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      onClick={() => setSelectedImage(null)}
                      title="Close (Esc)"
                    >
                      <span className="sr-only">Close</span>
                      <svg
                        className="h-6 w-6"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
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
                        target.style.display = "none";
                        target.nextElementSibling?.classList.remove("hidden");
                      }}
                    />
                    <div className="hidden text-center">
                      <div className="text-gray-500 mb-4">
                        <svg
                          className="mx-auto h-16 w-16 mb-4"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
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
                      <h4 className="text-sm font-medium text-gray-900 mb-3">
                        Basic Information
                      </h4>
                      <div className="grid grid-cols-1 gap-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">File Name:</span>
                          <span className="font-medium text-right">
                            {selectedImage.name}
                          </span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-gray-500">Part Number:</span>
                          <span className="font-medium">
                            {selectedImage.partNumber}
                          </span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-gray-500">Uploaded:</span>
                          <span className="font-medium">
                            {selectedImage.uploadDate}
                          </span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-gray-500">File Size:</span>
                          <span className="font-medium">
                            {selectedImage.size}
                          </span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-gray-500">File Type:</span>
                          <span className="font-medium">
                            {selectedImage.file_type}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Technical Details */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-900 mb-3">
                        Technical Details
                      </h4>
                      <div className="grid grid-cols-1 gap-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Resolution:</span>
                          <span className="font-medium">
                            {selectedImage.metadata.dimensions}
                          </span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-gray-500">Camera:</span>
                          <span className="font-medium">
                            {selectedImage.metadata.camera}
                          </span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-gray-500">Operator:</span>
                          <span className="font-medium">
                            {selectedImage.metadata.operator}
                          </span>
                        </div>

                        {selectedImage.metadata.capture_mode && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">Capture Mode:</span>
                            <span className="font-medium">
                              {selectedImage.metadata.capture_mode}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Notes Section */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="text-sm font-medium text-gray-900">
                          Notes
                        </h4>
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
                          {selectedImage.metadata.notes || "No notes available"}
                        </p>
                      )}
                    </div>

                    {/* Keyboard Shortcuts Help */}
                    {totalImagesInSet > 1 && (
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-900 mb-3">
                          Keyboard Shortcuts
                        </h4>
                        <div className="grid grid-cols-1 gap-2 text-xs text-gray-600">
                          <div className="flex justify-between">
                            <span>Previous image:</span>
                            <kbd className="px-2 py-1 bg-white border border-gray-200 rounded">
                              ←
                            </kbd>
                          </div>
                          <div className="flex justify-between">
                            <span>Next image:</span>
                            <kbd className="px-2 py-1 bg-white border border-gray-200 rounded">
                              →
                            </kbd>
                          </div>
                          <div className="flex justify-between">
                            <span>Download:</span>
                            <div>
                              <kbd className="px-2 py-1 bg-white border border-gray-200 rounded">
                                Ctrl
                              </kbd>
                              <span className="mx-1">+</span>
                              <kbd className="px-2 py-1 bg-white border border-gray-200 rounded">
                                D
                              </kbd>
                            </div>
                          </div>
                          <div className="flex justify-between">
                            <span>Close:</span>
                            <kbd className="px-2 py-1 bg-white border border-gray-200 rounded">
                              Esc
                            </kbd>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-900 mb-3">
                        Actions
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() =>
                            window.open(
                              generateImageUrl(selectedImage),
                              "_blank"
                            )
                          }
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 mr-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                          View Full Size
                        </button>
                        <button
                          onClick={handleDownload}
                          disabled={isDownloading}
                          className={`inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white ${
                            isDownloading
                              ? "bg-gray-400 cursor-not-allowed"
                              : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          }`}
                        >
                          {isDownloading ? (
                            <>
                              <svg
                                className="animate-spin h-4 w-4 mr-1"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                ></circle>
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                              </svg>
                              Downloading...
                            </>
                          ) : (
                            <>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 mr-1"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                                />
                              </svg>
                              Download
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => onDeleteImage(selectedImage.id)}
                          disabled={isDownloading}
                          className="inline-flex items-center px-3 py-2 border border-red-300 text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 mr-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
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

// Export all components
export default {
  GroupedGalleryNavigation,
  GroupedGalleryHeader,
  GroupedGallerySearch,
  PartNumberGroupsView,
  PartImagesDetailView,
  ImageDetailModal,
};
