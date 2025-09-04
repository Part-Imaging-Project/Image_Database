// src/app/dashboard/page.tsx - Complete Dashboard with Frontend-only fixes
"use client";

import { SignInButton, useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import {
  DashboardHeader,
  DashboardNavigation,
  ErrorAlert,
  ImagesTable,
  QuickActions,
  StatisticsCards,
  SystemStatus,
  TabNavigation,
  type ImageData,
  type Statistics,
} from "../components/DashboardUI";

// API configuration
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export default function Dashboard() {
  const { isLoaded, isSignedIn, user } = useUser();

  // State management
  const [activeTab, setActiveTab] = useState("recent");
  const [images, setImages] = useState<ImageData[]>([]);
  const [statistics, setStatistics] = useState<Statistics>({
    totalImages: 0,
    totalSize: "0 MB",
    lastUpload: "No uploads yet",
    processingQueue: 0,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  // Helper function to extract part number from various sources
  const extractPartNumber = (image: any): string => {
    // Priority order: part_number -> part_name -> extract from file_path -> extract from notes -> fallback
    if (image.part_number && image.part_number.trim() !== "") {
      return image.part_number.trim();
    }

    if (image.part_name && image.part_name.trim() !== "") {
      return image.part_name.trim();
    }

    // Extract from file_path URL structure (new folder format)
    if (image.file_path) {
      const pathPartNumber = extractPartNumberFromPath(image.file_path);
      if (pathPartNumber) {
        return pathPartNumber;
      }
    }

    // Try to extract from notes
    if (image.notes) {
      const partMatch =
        image.notes.match(/Part:\s*([A-Za-z0-9\-_]+)/i) ||
        image.notes.match(/P\/?N:\s*([A-Za-z0-9\-_]+)/i);
      if (partMatch) {
        return partMatch[1];
      }
    }

    // Fallback
    return `PART-${image.image_id || image.id}`;
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
  const getImagePreviewUrl = (image: ImageData): string => {
    // If we have a complete file_path URL, use it directly
    if (image.file_path && image.file_path.startsWith("http")) {
      console.log("Using direct file_path URL:", image.file_path);
      return image.file_path;
    }

    // Otherwise, construct the URL using folder structure
    const partNumber = extractPartNumber(image);

    // Clean bucket name (replace underscores with hyphens if needed)
    const cleanBucketName = (image.bucket_name || "images").replace(/_/g, "-");

    // Encode the filename to handle special characters
    const encodedFileName = encodeURIComponent(image.file_name);

    // Build MinIO URL with folder structure: bucket/partNumber/filename
    const minioBaseUrl =
      process.env.NEXT_PUBLIC_MINIO_URL || "http://localhost:9000";
    const constructedUrl = `${minioBaseUrl}/${cleanBucketName}/${partNumber}/${encodedFileName}`;

    console.log("Constructing MinIO URL:", {
      partNumber,
      cleanBucketName,
      fileName: image.file_name,
      constructedUrl,
      originalFilePath: image.file_path,
    });

    return constructedUrl;
  };

  // FRONTEND-ONLY DOWNLOAD FIX
  const downloadImageFrontendOnly = async (image: ImageData): Promise<void> => {
    try {
      console.log("Starting frontend download for:", image.file_name);

      // Show loading state
      const originalText = document.activeElement?.textContent;
      if (document.activeElement) {
        (document.activeElement as HTMLElement).textContent = "Downloading...";
      }

      // Try direct MinIO URL first
      let imageUrl = getImagePreviewUrl(image);

      try {
        const response = await fetch(imageUrl, {
          method: "GET",
          mode: "cors",
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const blob = await response.blob();

        // Create download link
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.download = image.file_name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);

        console.log("Direct download successful:", image.file_name);
      } catch (directError) {
        console.warn(
          "Direct download failed, trying alternative URL:",
          directError
        );

        // Try without folder structure as fallback
        const minioBaseUrl =
          process.env.NEXT_PUBLIC_MINIO_URL || "http://localhost:9000";
        const cleanBucketName = (image.bucket_name || "images").replace(
          /_/g,
          "-"
        );
        const encodedFileName = encodeURIComponent(image.file_name);
        const fallbackUrl = `${minioBaseUrl}/${cleanBucketName}/${encodedFileName}`;

        try {
          const fallbackResponse = await fetch(fallbackUrl, {
            method: "GET",
            mode: "cors",
          });

          if (!fallbackResponse.ok) {
            throw new Error(`HTTP ${fallbackResponse.status}`);
          }

          const blob = await fallbackResponse.blob();
          const downloadUrl = window.URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = downloadUrl;
          link.download = image.file_name;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(downloadUrl);

          console.log("Fallback download successful:", image.file_name);
        } catch (fallbackError) {
          console.error("All download methods failed:", fallbackError);

          // Last resort: open in new tab
          window.open(imageUrl, "_blank");
          alert(
            "Direct download failed. The image will open in a new tab. Right-click and save to download."
          );
        }
      }

      // Reset button text
      if (document.activeElement && originalText) {
        (document.activeElement as HTMLElement).textContent = originalText;
      }
    } catch (error) {
      console.error("Download process failed:", error);

      // Reset button text
      if (document.activeElement) {
        (document.activeElement as HTMLElement).textContent = "Download";
      }

      alert(
        `Download failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  // API Functions
  const fetchAllImages = async (): Promise<ImageData[]> => {
    try {
      console.log("Fetching images from:", `${API_BASE_URL}/images`);
      const response = await fetch(`${API_BASE_URL}/images`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log("Raw API response:", data);

      // Process and format the data properly
      const processedData = data.map((item: any) => {
        console.log("Processing item:", item);

        const partNumber = extractPartNumber(item);

        const processedItem = {
          image_id: item.image_id || item.id,
          file_name: item.file_name || item.filename,
          file_path: item.file_path,
          file_type: item.file_type || "image/jpeg",
          image_size: item.image_size || 0,
          captured_at: item.captured_at || new Date().toISOString(),
          bucket_name: item.bucket_name || "images",
          part_name: item.part_name || partNumber,
          part_number: partNumber,
          device_model: item.device_model || "Unknown Camera",
          location: item.location || "Unknown Location",
          serial_number: item.serial_number || "Unknown Serial",
          resolution: item.resolution || "1920x1080",
          capture_mode: item.capture_mode || "Auto",
          notes: item.notes || "",
        };

        console.log(
          "Processed item with part number:",
          processedItem.part_number
        );
        return processedItem;
      });

      console.log("All processed images:", processedData);
      return processedData;
    } catch (error) {
      console.error("Error fetching images:", error);
      setApiError(
        `Failed to fetch images: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
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
      console.log("Single image data:", data);

      // Process the single image data
      const processedImage = {
        image_id: data.image_id || data.id,
        file_name: data.file_name || data.filename,
        file_path: data.file_path,
        file_type: data.file_type || "image/jpeg",
        image_size: data.image_size || 0,
        captured_at: data.captured_at || new Date().toISOString(),
        bucket_name: data.bucket_name || "images",
        part_name: data.part_name || extractPartNumber(data),
        part_number: extractPartNumber(data),
        device_model: data.device_model || "Unknown Camera",
        location: data.location || "Unknown Location",
        serial_number: data.serial_number || "Unknown Serial",
        resolution: data.resolution || "1920x1080",
        capture_mode: data.capture_mode || "Auto",
        notes: data.notes || "",
      };

      return processedImage;
    } catch (error) {
      console.error("Error fetching image:", error);
      return null;
    }
  };

  const deleteImageById = async (id: number): Promise<any | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/images/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error deleting image:", error);
      setApiError("Failed to delete image");
      return null;
    }
  };

  // Calculate statistics from images data
  const calculateStatistics = (imagesData: ImageData[]): Statistics => {
    if (!imagesData || imagesData.length === 0) {
      return {
        totalImages: 0,
        totalSize: "0 MB",
        lastUpload: "No uploads yet",
        processingQueue: 0,
      };
    }

    const totalImages = imagesData.length;
    const totalSizeBytes = imagesData.reduce(
      (acc: number, img: ImageData) => acc + (img.image_size || 0),
      0
    );
    const totalSizeMB = (totalSizeBytes / (1024 * 1024)).toFixed(1);

    // Sort by captured_at to get the most recent
    const sortedImages = [...imagesData].sort(
      (a: ImageData, b: ImageData) =>
        new Date(b.captured_at).getTime() - new Date(a.captured_at).getTime()
    );
    const lastUpload =
      sortedImages.length > 0
        ? new Date(sortedImages[0].captured_at).toLocaleString()
        : "No uploads yet";

    // For now, assume all images are processed
    const processingQueue = 0;

    return {
      totalImages,
      totalSize: `${totalSizeMB} MB`,
      lastUpload,
      processingQueue,
    };
  };

  // Event Handlers
  const handleDeleteImage = async (imageId: number): Promise<void> => {
    if (
      window.confirm(
        "Are you sure you want to delete this image? This action cannot be undone."
      )
    ) {
      const result = await deleteImageById(imageId);
      if (result) {
        // Refresh the images list
        loadDashboardData();

        // Show success message
        const deletedImage = images.find((img) => img.image_id === imageId);
        if (deletedImage) {
          console.log(`Successfully deleted: ${deletedImage.file_name}`);
        }
      }
    }
  };

  const handleViewImage = async (imageId: number): Promise<void> => {
    const imageDetails = await fetchImageById(imageId);
    if (imageDetails) {
      // Open image in new tab using the correct folder-based URL
      const imageUrl = getImagePreviewUrl(imageDetails);
      console.log("Opening image URL:", imageUrl);
      window.open(imageUrl, "_blank");
    }
  };

  const handleDownloadImage = async (image: ImageData): Promise<void> => {
    await downloadImageFrontendOnly(image);
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
      console.error("Error loading dashboard data:", error);
      setApiError("Failed to load dashboard data");
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

  // Data processing with improved part number handling
  const filteredImages = images.filter((image: ImageData) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      image.file_name.toLowerCase().includes(searchLower) ||
      (image.part_number &&
        image.part_number.toLowerCase().includes(searchLower)) ||
      (image.part_name && image.part_name.toLowerCase().includes(searchLower))
    );
  });

  // Get images for current tab - show all images
  const getTabImages = () => {
    return filteredImages; // Show all filtered images
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
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
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
