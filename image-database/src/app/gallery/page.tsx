'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import Link from 'next/link';
import { useState, useEffect } from 'react';

// Define image type interface
interface ImageType {
  id: number;
  name: string;
  partNumber: string;
  category: string;
  uploadDate: string;
  size: string;
  status: string;
  metadata: {
    dimensions: string;
    camera: string;
    operator: string;
  }
}

export default function Gallery() {
  const { user, error, isLoading: authLoading } = useUser();
  const [activeView, setActiveView] = useState('grid');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<ImageType | null>(null);

  // Categories - these would come from API in real implementation
  const categories = [
    { id: 'all', name: 'All Images' },
    { id: 'partsA', name: 'A-Series Parts' },
    { id: 'partsB', name: 'B-Series Parts' },
    { id: 'partsC', name: 'C-Series Parts' },
    { id: 'rejected', name: 'Rejected Parts' }
  ];

  // Empty images array while loading
  const images: ImageType[] = [];

  // Simulate loading data from API
  useEffect(() => {
    if (user) {
      setIsLoading(true);
      // Simulate API request delay
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [user, selectedCategory, searchQuery]);

  // Filter images based on category and search query
  const filteredImages = images.filter(image => {
    const matchesCategory = selectedCategory === 'all' || image.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
                         image.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         image.partNumber.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Authentication loading state
  if (authLoading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
    </div>
  );
  
  // Error state
  if (error) return <div className="text-red-500 text-center mt-10">Error: {error.message}</div>;
  
  // Unauthenticated state
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
            <h1 className="text-2xl font-bold text-gray-900">Image Gallery</h1>
            <p className="mt-1 text-sm text-gray-500">Browse and manage your part images.</p>
          </div>
          <div className="mt-4 md:mt-0">
            <Link 
              href="/upload"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Upload New Images
            </Link>
          </div>
        </div>
        
        {/* Filter and Search */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div className="flex flex-wrap items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">Category:</label>
                <select 
                  className="mt-1 block pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
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
                    onChange={(e) => setSearchQuery(e.target.value)}
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

        {/* Gallery Content with Blur Skeleton */}
        {isLoading ? (
          activeView === 'grid' ? (
            // Grid view skeleton loader
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, index) => (
                <div key={index} className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="relative pb-[75%] bg-gray-200">
                    <div className="absolute inset-0 w-full h-full animate-pulse bg-gray-300"></div>
                    <div className="absolute top-2 right-2">
                      <div className="w-16 h-5 rounded-full animate-pulse bg-gray-300"></div>
                    </div>
                  </div>
                  <div className="px-4 py-3">
                    <div className="h-4 bg-gray-300 rounded animate-pulse mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4 mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // List view skeleton loader
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
                        <div className="flex items-center">
                          <div className="w-16 h-5 rounded-full animate-pulse bg-gray-300 mr-4"></div>
                          <div className="h-3 bg-gray-200 rounded animate-pulse w-20 mr-4"></div>
                          <div className="h-3 bg-gray-200 rounded animate-pulse w-16"></div>
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
            <p className="text-gray-500">No images found. Try changing your search or category filter.</p>
          </div>
        ) : activeView === 'grid' ? (
          // Grid view content - would be populated with actual data
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {/* Placeholder for grid content - this would be replaced with actual data */}
            {[...Array(8)].map((_, index) => (
              <div 
                key={index} 
                className="bg-white overflow-hidden shadow rounded-lg cursor-pointer transition duration-150 hover:shadow-md"
              >
                <div className="relative pb-[75%] bg-gray-200">
                  <div className="absolute inset-0 w-full h-full flex items-center justify-center">
                    <div className="bg-gray-300 flex items-center justify-center w-full h-full">
                      <span className="text-gray-500 text-sm">Part #{index + 1000}</span>
                    </div>
                  </div>
                  <div className="absolute top-2 right-2">
                    <span className={`px-2 py-1 text-xs font-bold rounded-full
                      ${index % 3 === 0 ? 'bg-green-100 text-green-800' : 
                        index % 3 === 1 ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'}`}>
                      {index % 3 === 0 ? 'Processed' : index % 3 === 1 ? 'Processing' : 'Failed'}
                    </span>
                  </div>
                </div>
                <div className="px-4 py-3">
                  <h3 className="text-sm font-medium text-gray-900 truncate">Part_X{1000 + index}.jpg</h3>
                  <p className="text-xs text-gray-500">Part: X{1000 + index}</p>
                  <p className="text-xs text-gray-500">2025-05-{10 + index}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // List view content - would be populated with actual data
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {[...Array(5)].map((_, index) => (
                <li key={index}>
                  <div className="block hover:bg-gray-50 cursor-pointer">
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="bg-gray-200 h-12 w-12 flex items-center justify-center mr-4">
                            <span className="text-gray-500 text-xs">X{1000 + index}</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-indigo-600 truncate">Part_X{1000 + index}.jpg</p>
                            <p className="text-sm text-gray-500">Part: X{1000 + index}</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full 
                            ${index % 3 === 0 ? 'bg-green-100 text-green-800' : 
                              index % 3 === 1 ? 'bg-yellow-100 text-yellow-800' : 
                              'bg-red-100 text-red-800'}`}>
                            {index % 3 === 0 ? 'Processed' : index % 3 === 1 ? 'Processing' : 'Failed'}
                          </span>
                          <p className="ml-4 text-sm text-gray-500">2025-05-{10 + index}</p>
                          <p className="ml-4 text-sm text-gray-500">{2.1 + index * 0.2} MB</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Pagination with Skeleton */}
        <div className="bg-white px-4 py-3 flex items-center justify-between border border-gray-200 sm:px-6 rounded-lg mt-6">
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              {isLoading ? (
                <div className="h-4 bg-gray-200 rounded animate-pulse w-40"></div>
              ) : (
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">1</span> to <span className="font-medium">8</span> of{' '}
                  <span className="font-medium">8</span> results
                </p>
              )}
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50" disabled={isLoading}>
                  <span className="sr-only">Previous</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-indigo-600 hover:bg-gray-50" disabled={isLoading}>
                  1
                </button>
                <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50" disabled={isLoading}>
                  <span className="sr-only">Next</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>

        {/* Image Detail Modal - simplified placeholder */}
        {selectedImage && (
          <div className="fixed inset-0 overflow-y-auto z-50">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={() => setSelectedImage(null)}></div>
              </div>

              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
              
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
                      
                      {/* Placeholder modal content */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gray-100 rounded-lg flex items-center justify-center min-h-[300px]">
                          <div className="text-gray-500">Image preview placeholder</div>
                        </div>
                        <div>
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="text-sm font-medium text-gray-900 mb-3">Image Details</h4>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div className="text-gray-500">Part Number:</div>
                              <div className="font-medium">X1001</div>
                              
                              <div className="text-gray-500">Status:</div>
                              <div>
                                <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                                  Processed
                                </span>
                              </div>
                              
                              <div className="text-gray-500">Uploaded:</div>
                              <div>2025-05-15</div>
                              
                              <div className="text-gray-500">File Size:</div>
                              <div>2.3 MB</div>
                            </div>
                          </div>
                          
                          <div className="mt-4">
                            <h4 className="text-sm font-medium text-gray-900 mb-3">Actions</h4>
                            <div className="flex flex-wrap gap-2">
                              <button className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                Download
                              </button>
                              <button className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Edit Metadata
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