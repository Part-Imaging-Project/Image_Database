// src/app/gallery/page.tsx - Complete Gallery Page with Fixed Download & Keyboard Navigation
"use client";

import { SignInButton, UserButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import {
  GroupedGalleryNavigation,
  GroupedGalleryHeader,
  GroupedGallerySearch,
  PartNumberGroupsView,
  PartImagesDetailView,
  ImageDetailModal,
  type ImageType,
  type GroupedImages,
} from "../components/GalleryUI";

// API configuration
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

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

  // Navigation state for current image in modal
  const [currentImageSet, setCurrentImageSet] = useState<ImageType[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

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
        category: img.category || "Uncategorized",
        uploadDate: new Date(img.captured_at).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
        size: img.image_size
          ? `${(img.image_size / (1024 * 1024)).toFixed(1)} MB`
          : "Unknown",
        status: "Processed", // Simplified - always show as processed
        file_path: img.file_path,
        file_type: img.file_type,
        image_size: img.image_size,
        captured_at: img.captured_at,
        bucket_name: img.bucket_name || "images",
        imageUrl: "", // Will be generated when needed
        thumbnailUrl: "", // Will be generated when needed
        part_name: img.part_name,
        part_number: img.part_number,
        device_model: img.device_model,
        location: img.location,
        serial_number: img.serial_number,
        resolution: img.resolution,
        capture_mode: img.capture_mode,
        notes: img.notes,
        metadata: {
          dimensions: img.resolution || "1920x1080",
          camera: img.device_model || "Unknown Camera",
          operator: img.location || "Unknown Operator",
          resolution: img.resolution,
          capture_mode: img.capture_mode,
          notes: img.notes,
        },
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

  // Enhanced download function with better error handling and fallback
  const downloadImage = async (image: ImageType): Promise<void> => {
    try {
      console.log("Downloading image:", image.file_name || image.name);

      // Try backend download endpoint first
      try {
        const response = await fetch(
          `${API_BASE_URL}/images/download/${image.image_id || image.id}`,
          {
            method: "GET",
            headers: {
              Accept: "*/*",
            },
          }
        );

        if (response.ok) {
          const blob = await response.blob();

          // Check if we got a valid blob
          if (blob.size > 0) {
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = downloadUrl;
            link.download = image.file_name || image.name;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(downloadUrl);

            console.log(
              "Backend download completed for:",
              image.file_name || image.name
            );
            return; // Success, exit function
          }
        }

        console.warn("Backend download failed, trying fallback method");
      } catch (backendError) {
        console.warn("Backend download error:", backendError);
      }

      // Fallback Method 1: Direct MinIO URL download
      try {
        const directUrl = generateImageUrl(image);
        console.log("Trying direct MinIO download:", directUrl);

        const response = await fetch(directUrl, {
          method: "GET",
          mode: "cors",
        });

        if (response.ok) {
          const blob = await response.blob();
          const downloadUrl = window.URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = downloadUrl;
          link.download = image.file_name || image.name;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(downloadUrl);

          console.log(
            "Direct download completed for:",
            image.file_name || image.name
          );
          return; // Success, exit function
        }
      } catch (directError) {
        console.warn("Direct download failed:", directError);
      }

      // Fallback Method 2: Open in new tab (let browser handle download)
      try {
        const fallbackUrl = generateImageUrl(image);
        console.log("Opening image in new tab:", fallbackUrl);

        // Create a temporary link to trigger download
        const link = document.createElement("a");
        link.href = fallbackUrl;
        link.download = image.file_name || image.name;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        console.log("Fallback method used for:", image.file_name || image.name);
        return;
      } catch (fallbackError) {
        console.error("All download methods failed:", fallbackError);
        throw new Error("All download methods failed");
      }
    } catch (error) {
      console.error("Download completely failed:", error);

      // Show user-friendly error message
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";

      // Instead of alert, you could show a toast notification here
      const userConfirm = confirm(
        `Download failed: ${errorMessage}\n\nWould you like to try opening the image in a new tab instead?`
      );

      if (userConfirm) {
        try {
          const imageUrl = generateImageUrl(image);
          window.open(imageUrl, "_blank", "noopener,noreferrer");
        } catch (finalError) {
          alert(
            "Unable to open image. Please check your network connection and try again."
          );
        }
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

        // Set up navigation context
        let imageSet: ImageType[] = [];
        let imageIndex = 0;

        if (selectedPartNumber) {
          // If we're in a part view, navigate within that part's images
          const selectedGroup = filteredGroupedImages.find(
            (group) => group.partNumber === selectedPartNumber
          );
          if (selectedGroup) {
            imageSet = selectedGroup.images;
            imageIndex = imageSet.findIndex((img) => img.id === imageId);
          }
        } else {
          // If we're in main view, navigate within all images
          imageSet = images;
          imageIndex = imageSet.findIndex((img) => img.id === imageId);
        }

        setCurrentImageSet(imageSet);
        setCurrentImageIndex(Math.max(0, imageIndex));
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

  // Navigate between images in modal
  const handleNavigateImage = useCallback(
    (direction: "prev" | "next") => {
      if (currentImageSet.length === 0) return;

      let newIndex: number;
      if (direction === "prev") {
        newIndex = Math.max(0, currentImageIndex - 1);
      } else {
        newIndex = Math.min(currentImageSet.length - 1, currentImageIndex + 1);
      }

      if (newIndex !== currentImageIndex) {
        const newImage = currentImageSet[newIndex];
        setSelectedImage(newImage);
        setCurrentImageIndex(newIndex);
      }
    },
    [currentImageSet, currentImageIndex]
  );

  // Update metadata for an image
  const handleUpdateMetadata = async (id: number, metadata: any) => {
    try {
      const response = await fetch(`${API_BASE_URL}/images/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(metadata),
      });

      if (response.ok) {
        // Refresh images after update
        loadImages();

        // Update selected image if it's the one being edited
        if (selectedImage && selectedImage.id === id) {
          const updatedImageData = await fetchImageById(id);
          if (updatedImageData) {
            const formattedImage = formatImagesForDisplay([
              updatedImageData,
            ])[0];
            setSelectedImage(formattedImage);
          }
        }
      } else {
        console.error("Failed to update metadata");
      }
    } catch (error) {
      console.error("Error updating metadata:", error);
    }
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
      <GroupedGalleryNavigation user={user} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <GroupedGalleryHeader onRefresh={handleRefresh} />

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
        <GroupedGallerySearch
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          isLoading={isLoading}
          totalParts={totalParts}
          totalImages={totalImages}
        />

        {/* Gallery Content */}
        {selectedPartNumber && selectedGroup ? (
          // Individual Part Images View
          <PartImagesDetailView
            selectedGroup={selectedGroup}
            onBackClick={handleBackClick}
            onImageClick={handleImageClick}
            onDownloadImage={downloadImage}
            generateImageUrl={generateImageUrl}
          />
        ) : (
          // Part Number Groups View
          <PartNumberGroupsView
            groupedImages={filteredGroupedImages}
            onPartNumberClick={handlePartNumberClick}
            selectedPartNumber={selectedPartNumber}
            isLoading={isLoading}
            generateImageUrl={generateImageUrl}
          />
        )}

        {/* Image Detail Modal */}
        <ImageDetailModal
          selectedImage={selectedImage}
          setSelectedImage={setSelectedImage}
          onDownloadImage={downloadImage}
          onDeleteImage={handleDeleteImage}
          onUpdateMetadata={handleUpdateMetadata}
          generateImageUrl={generateImageUrl}
          onNavigateImage={handleNavigateImage}
          currentImageIndex={currentImageIndex}
          totalImagesInSet={currentImageSet.length}
        />
      </main>
    </div>
  );
}
