// src/app/gallery/page.tsx - Fixed for MinIO folder structure
"use client";

import { SignInButton, UserButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useEffect, useState } from "react";

// API configuration
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

// Type definitions
interface ImageType {
  id: number;
  image_id: number;
  name: string;
  file_name: string;
  partNumber: string;
  uploadDate: string;
  size: string;
  status: string;
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

interface GroupedImages {
  partNumber: string;
  partName?: string;
  images: ImageType[];
  totalImages: number;
  latestUpload: string;
  totalSize: string;
}

export default function Gallery() {
  const { isLoaded, isSignedIn, user } = useUser();

  // State management
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPartNumber, setSelectedPartNumber] = useState<string | null>(
    null
  );
  const [selectedImage, setSelectedImage] = useState<ImageType | null>(null);
  const [images, setImages] = useState<ImageType[]>([]);
  const [groupedImages, setGroupedImages] = useState<GroupedImages[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);

  // Helper function to extract part number from various sources
  const extractPartNumber = (img: any): string => {
    // Priority order: part_number -> part_name -> extract from file_path -> extract from notes -> fallback
    if (img.part_number && img.part_number.trim() !== "") {
      return img.part_number.trim();
    }

    if (img.part_name && img.part_name.trim() !== "") {
      return img.part_name.trim();
    }

    // Extract from file_path URL structure (new folder format)
    if (img.file_path) {
      const pathPartNumber = extractPartNumberFromPath(img.file_path);
      if (pathPartNumber) {
        return pathPartNumber;
      }
    }

    // Try to extract from notes
    if (img.notes) {
      const partMatch =
        img.notes.match(/Part:\s*([A-Za-z0-9\-_]+)/i) ||
        img.notes.match(/P\/?N:\s*([A-Za-z0-9\-_]+)/i);
      if (partMatch) {
        return partMatch[1];
      }
    }

    // Extract from filename as last resort
    if (img.file_name) {
      const filenameMatch = img.file_name.match(/([A-Za-z0-9\-_]+)/);
      if (filenameMatch) {
        return filenameMatch[1];
      }
    }

    // Fallback
    return `UNKNOWN-${img.image_id || img.id}`;
  };

  // Helper function to extract part number from file path URL
  const extractPartNumberFromPath = (filePath: string): string | null => {
    if (!filePath) return null;

    try {
      // If it's a full URL, parse it
      if (filePath.startsWith("http")) {
        const url = new URL(filePath);
        const pathParts = url.pathname
          .split("/")
          .filter((part) => part.length > 0);
        // Structure: [bucket, partNumber, filename]
        if (pathParts.length >= 3) {
          return pathParts[1]; // Return the part number
        }
      } else {
        // If it's just a path, split by '/'
        const pathParts = filePath.split("/").filter((part) => part.length > 0);
        if (pathParts.length >= 2) {
          return pathParts[0]; // Return the part number (first folder)
        }
      }
    } catch (error) {
      console.error("Error parsing file path:", error);
    }

    return null;
  };

  // Fixed URL generation for MinIO folder structure
  const generateImageUrl = (image: ImageType): string => {
    // If we have a complete file_path URL, use it directly
    if (image.file_path && image.file_path.startsWith("http")) {
      console.log("Using direct file_path URL:", image.file_path);
      return image.file_path;
    }

    // Otherwise, construct the URL using folder structure
    const partNumber = image.partNumber || extractPartNumber(image);

    // Clean bucket name (replace underscores with hyphens if needed)
    const cleanBucketName = (image.bucket_name || "images").replace(/_/g, "-");

    // Encode the filename to handle special characters
    const encodedFileName = encodeURIComponent(image.file_name || image.name);

    // Build MinIO URL with folder structure: bucket/partNumber/filename
    const minioBaseUrl =
      process.env.NEXT_PUBLIC_MINIO_URL || "http://localhost:9000";
    const constructedUrl = `${minioBaseUrl}/${cleanBucketName}/${partNumber}/${encodedFileName}`;

    console.log("Constructing MinIO URL:", {
      partNumber,
      cleanBucketName,
      fileName: image.file_name || image.name,
      constructedUrl,
      originalFilePath: image.file_path,
    });

    return constructedUrl;
  };

  // API Functions
  const fetchAllImages = async () => {
    try {
      setApiError(null);
      console.log("Fetching images from:", `${API_BASE_URL}/images`);
      const response = await fetch(`${API_BASE_URL}/images`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log("Raw API response:", data);
      return data;
    } catch (error) {
      console.error("Error fetching images:", error);
      setApiError(
        "Failed to fetch images from backend. Make sure the backend is running."
      );
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
      console.error("Error fetching image:", error);
      return null;
    }
  };

  const deleteImageById = async (id: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/images/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error deleting image:", error);
      setApiError("Failed to delete image");
      return null;
    }
  };

  // Format images for display with proper part number extraction
  const formatImagesForDisplay = (imagesData: any[]): ImageType[] => {
    return imagesData.map((img) => {
      const imageId = img.image_id || img.id;
      const partNumber = extractPartNumber(img);

      return {
        id: imageId,
        image_id: imageId,
        name: img.file_name,
        file_name: img.file_name,
        partNumber: partNumber,
        uploadDate: new Date(img.captured_at).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
        size: img.image_size
          ? `${(img.image_size / (1024 * 1024)).toFixed(1)} MB`
          : "Unknown",
        status: img.file_path && img.file_name ? "Processed" : "Processing",
        file_path: img.file_path,
        file_type: img.file_type,
        image_size: img.image_size,
        captured_at: img.captured_at,
        bucket_name: img.bucket_name || "images",
        part_name: img.part_name,
        part_number: img.part_number,
        device_model: img.device_model,
        location: img.location,
        serial_number: img.serial_number,
        resolution: img.resolution,
        capture_mode: img.capture_mode,
        notes: img.notes,
      };
    });
  };

  // Group images by part number
  const groupImagesByPartNumber = (images: ImageType[]): GroupedImages[] => {
    const grouped = images.reduce((acc, image) => {
      const partNumber = image.partNumber;

      if (!acc[partNumber]) {
        acc[partNumber] = {
          partNumber,
          partName: image.part_name || "",
          images: [],
          totalImages: 0,
          latestUpload: "",
          totalSize: "",
        };
      }

      acc[partNumber].images.push(image);
      acc[partNumber].totalImages = acc[partNumber].images.length;

      return acc;
    }, {} as Record<string, GroupedImages>);

    // Calculate additional stats for each group
    Object.values(grouped).forEach((group) => {
      // Sort images by upload date (newest first)
      group.images.sort(
        (a, b) =>
          new Date(b.captured_at).getTime() - new Date(a.captured_at).getTime()
      );

      // Get latest upload date
      group.latestUpload = group.images[0]?.uploadDate || "Unknown";

      // Calculate total size
      const totalBytes = group.images.reduce(
        (sum, img) => sum + (img.image_size || 0),
        0
      );
      group.totalSize =
        totalBytes > 0
          ? `${(totalBytes / (1024 * 1024)).toFixed(1)} MB`
          : "Unknown";
    });

    return Object.values(grouped).sort((a, b) =>
      a.partNumber.localeCompare(b.partNumber)
    );
  };

  // Fixed download function for folder structure
  const downloadImage = async (image: ImageType): Promise<void> => {
    try {
      console.log("Downloading image:", image.file_name || image.name);

      // Show loading state
      const originalText = document.activeElement?.textContent;
      if (document.activeElement) {
        (document.activeElement as HTMLElement).textContent = "Downloading...";
      }

      // Use the backend download endpoint instead of direct MinIO access
      const response = await fetch(
        `${API_BASE_URL}/images/download/${image.image_id || image.id}`
      );

      if (!response.ok) {
        throw new Error(`Failed to download: ${response.status}`);
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = image.name || image.file_name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      // Reset button text
      if (document.activeElement && originalText) {
        (document.activeElement as HTMLElement).textContent = originalText;
      }

      console.log("Download completed for:", image.file_name || image.name);
    } catch (error) {
      console.error("Download failed:", error);

      // Reset button text
      if (document.activeElement) {
        (document.activeElement as HTMLElement).textContent = "Download";
      }

      alert(
        `Download failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );

      // Fallback: try direct MinIO access with folder structure
      try {
        const fallbackUrl = generateImageUrl(image);
        console.log("Trying fallback URL:", fallbackUrl);
        window.open(fallbackUrl, "_blank");
      } catch (fallbackError) {
        console.error("Fallback download also failed:", fallbackError);
      }
    }
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
      console.error("Error fetching image details:", error);
    }
  };

  const handleDeleteImage = async (imageId: number) => {
    if (
      window.confirm(
        "Are you sure you want to delete this image? This action cannot be undone."
      )
    ) {
      const result = await deleteImageById(imageId);
      if (result) {
        loadImages(); // Refresh after deletion
        setSelectedImage(null);
      }
    }
  };

  const handleRefresh = () => {
    loadImages();
  };

  const handlePartNumberClick = (partNumber: string) => {
    setSelectedPartNumber(partNumber);
  };

  const handleBackClick = () => {
    setSelectedPartNumber(null);
  };

  // Load images from API
  const loadImages = async () => {
    setIsLoading(true);
    setApiError(null);

    try {
      const imagesData = await fetchAllImages();
      const formattedImages = formatImagesForDisplay(imagesData);
      setImages(formattedImages);

      // Group images by part number
      const grouped = groupImagesByPartNumber(formattedImages);
      setGroupedImages(grouped);

      console.log("Loaded and grouped images:", {
        totalImages: formattedImages.length,
        groups: grouped.length,
        sampleGroup: grouped[0],
      });
    } catch (error) {
      console.error("Error loading images:", error);
      setApiError("Failed to load images");
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

  // Filter grouped images based on search query
  const filteredGroupedImages = groupedImages.filter(
    (group) =>
      group.partNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (group.partName &&
        group.partName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Get selected group details
  const selectedGroup = selectedPartNumber
    ? filteredGroupedImages.find(
        (group) => group.partNumber === selectedPartNumber
      )
    : null;

  // Calculate totals
  const totalParts = filteredGroupedImages.length;
  const totalImages = filteredGroupedImages.reduce(
    (sum, group) => sum + group.totalImages,
    0
  );

  // Authentication states
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

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="text-center">
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
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
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
              <button className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
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
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="relative ml-3">
                  <div className="flex items-center space-x-4">
                    <span className="text-gray-700">
                      {user?.fullName ||
                        user?.emailAddresses[0]?.emailAddress ||
                        "User"}
                    </span>
                    <UserButton afterSignOutUrl="/" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="md:flex md:items-center md:justify-between mb-6">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-gray-900">Parts Gallery</h1>
            <p className="mt-1 text-sm text-gray-500">
              Browse images grouped by part number for easy comparison and
              management.
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-3">
            <button
              onClick={handleRefresh}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
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
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
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

        {/* API Error Display */}
        {apiError && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  API Connection Error
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{apiError}</p>
                  <p className="mt-1 text-xs">
                    Make sure your backend is running on {API_BASE_URL}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search and Stats */}
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
                  <span className="font-medium text-indigo-600">
                    {totalParts}
                  </span>
                  <span className="ml-1">Parts</span>
                </div>
                <div className="flex items-center">
                  <span className="font-medium text-indigo-600">
                    {totalImages}
                  </span>
                  <span className="ml-1">Total Images</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Gallery Content */}
        {selectedPartNumber && selectedGroup ? (
          // Individual Part Images View
          <div>
            {/* Back Button and Header */}
            <div className="flex items-center mb-6">
              <button
                onClick={handleBackClick}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
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
                </p>
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
                      onClick={() => handleImageClick(image.id)}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        console.error(
                          "Image failed to load:",
                          generateImageUrl(image)
                        );
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
                    <div className="absolute top-2 right-2">
                      <span
                        className={`px-2 py-1 text-xs font-bold rounded-full
                        ${
                          image.status === "Processed"
                            ? "bg-green-100 text-green-800"
                            : image.status === "Processing"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {image.status}
                      </span>
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
                    <div className="mt-2 flex space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadImage(image);
                        }}
                        className="flex-1 inline-flex justify-center items-center px-2 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                      >
                        Download
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleImageClick(image.id);
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
        ) : (
          // Part Number Groups View
          <div>
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-lg shadow animate-pulse"
                  >
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
            ) : filteredGroupedImages.length === 0 ? (
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
                  {apiError
                    ? "Backend connection issue. Check if your server is running."
                    : "Try adjusting your search criteria or upload some images."}
                </p>
                {!apiError && (
                  <Link
                    href="/upload"
                    className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Upload Your First Images
                  </Link>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredGroupedImages.map((group) => (
                  <div
                    key={group.partNumber}
                    className={`bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer ${
                      selectedPartNumber === group.partNumber
                        ? "ring-2 ring-indigo-500"
                        : ""
                    }`}
                    onClick={() => handlePartNumberClick(group.partNumber)}
                  >
                    <div className="p-6">
                      {/* Part Number Header */}
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {group.partNumber}
                        </h3>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                          {group.totalImages} images
                        </span>
                      </div>

                      {/* Part Name */}
                      {group.partName &&
                        group.partName !== group.partNumber && (
                          <p className="text-sm text-gray-600 mb-3">
                            {group.partName}
                          </p>
                        )}

                      {/* Image Preview Grid */}
                      <div className="grid grid-cols-3 gap-2 mb-4 relative">
                        {group.images.slice(0, 3).map((image, index) => (
                          <div key={index} className="relative">
                            <img
                              src={generateImageUrl(image)}
                              alt={`${group.partNumber} - ${index + 1}`}
                              className="w-full h-16 object-cover rounded"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                console.error(
                                  "Preview image failed to load:",
                                  generateImageUrl(image)
                                );
                                target.style.display = "none";
                                target.nextElementSibling?.classList.remove(
                                  "hidden"
                                );
                              }}
                            />
                            <div className="hidden w-full h-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded flex items-center justify-center">
                              <span className="text-gray-500 text-xs">
                                {group.partNumber.slice(-3)}
                              </span>
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
                          <span className="font-medium">
                            {group.latestUpload}
                          </span>
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
            )}
          </div>
        )}

        {/* Image Detail Modal */}
        {selectedImage && (
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

              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                          Image Details
                        </h3>
                        <button
                          type="button"
                          className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          onClick={() => setSelectedImage(null)}
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

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Image Display */}
                        <div className="bg-gray-100 rounded-lg flex items-center justify-center min-h-[300px]">
                          <img
                            src={generateImageUrl(selectedImage)}
                            alt={selectedImage.name}
                            className="max-w-full max-h-full object-contain rounded"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              console.error(
                                "Modal image failed to load:",
                                generateImageUrl(selectedImage)
                              );
                              target.style.display = "none";
                              target.nextElementSibling?.classList.remove(
                                "hidden"
                              );
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
                              URL: {generateImageUrl(selectedImage)}
                            </div>
                          </div>
                        </div>

                        {/* Image Information */}
                        <div className="space-y-4">
                          {/* Basic Info */}
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="text-sm font-medium text-gray-900 mb-3">
                              Basic Information
                            </h4>
                            <div className="grid grid-cols-1 gap-3 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-500">
                                  File Name:
                                </span>
                                <span className="font-medium text-right">
                                  {selectedImage.name}
                                </span>
                              </div>

                              <div className="flex justify-between">
                                <span className="text-gray-500">
                                  Part Number:
                                </span>
                                <span className="font-medium">
                                  {selectedImage.partNumber}
                                </span>
                              </div>

                              <div className="flex justify-between">
                                <span className="text-gray-500">Status:</span>
                                <span
                                  className={`px-2 py-1 text-xs font-medium rounded-full 
                                  ${
                                    selectedImage.status === "Processed"
                                      ? "bg-green-100 text-green-800"
                                      : selectedImage.status === "Processing"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  {selectedImage.status}
                                </span>
                              </div>

                              <div className="flex justify-between">
                                <span className="text-gray-500">Uploaded:</span>
                                <span className="font-medium">
                                  {selectedImage.uploadDate}
                                </span>
                              </div>

                              <div className="flex justify-between">
                                <span className="text-gray-500">
                                  File Size:
                                </span>
                                <span className="font-medium">
                                  {selectedImage.size}
                                </span>
                              </div>

                              <div className="flex justify-between">
                                <span className="text-gray-500">
                                  File Type:
                                </span>
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
                                <span className="text-gray-500">
                                  Resolution:
                                </span>
                                <span className="font-medium">
                                  {selectedImage.resolution || "1920x1080"}
                                </span>
                              </div>

                              <div className="flex justify-between">
                                <span className="text-gray-500">Camera:</span>
                                <span className="font-medium">
                                  {selectedImage.device_model || "Unknown"}
                                </span>
                              </div>

                              <div className="flex justify-between">
                                <span className="text-gray-500">Location:</span>
                                <span className="font-medium">
                                  {selectedImage.location || "Unknown"}
                                </span>
                              </div>

                              {selectedImage.capture_mode && (
                                <div className="flex justify-between">
                                  <span className="text-gray-500">
                                    Capture Mode:
                                  </span>
                                  <span className="font-medium">
                                    {selectedImage.capture_mode}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Notes Section */}
                          {selectedImage.notes && (
                            <div className="bg-gray-50 p-4 rounded-lg">
                              <h4 className="text-sm font-medium text-gray-900 mb-3">
                                Notes
                              </h4>
                              <p className="text-sm text-gray-600">
                                {selectedImage.notes}
                              </p>
                            </div>
                          )}

                          {/* Debug Info (temporary) */}
                          <div className="bg-yellow-50 p-4 rounded-lg">
                            <h4 className="text-sm font-medium text-gray-900 mb-3">
                              Debug Info
                            </h4>
                            <div className="text-xs text-gray-600 space-y-1">
                              <div>
                                Image URL: {generateImageUrl(selectedImage)}
                              </div>
                              <div>File Path: {selectedImage.file_path}</div>
                              <div>Bucket: {selectedImage.bucket_name}</div>
                              <div>Part Number: {selectedImage.partNumber}</div>
                            </div>
                          </div>

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
                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
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
                                onClick={() => downloadImage(selectedImage)}
                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
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
                                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                                  />
                                </svg>
                                Download
                              </button>
                              <button
                                onClick={() =>
                                  handleDeleteImage(selectedImage.id)
                                }
                                className="inline-flex items-center px-3 py-2 border border-red-300 text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
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
        )}
      </main>
    </div>
  );
}
