// src/app/upload/page.tsx - Logic only, UI in components
"use client";

import React, { useState, useEffect } from "react";
import { SignInButton, useUser } from "@clerk/nextjs";
import {
  ProTips,
  SelectedFilesDisplay,
  StatusMessages,
  UploadForm,
  UploadGuidelines,
  UploadHeader,
  UploadNavigation,
  UploadProgress,
  type UploadFormData,
} from "../components/UploadUI";

// API configuration
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

// Type definitions
interface UploadResponse {
  success: boolean;
  message: string;
  data?: any;
  uploaded?: any[];
  partNumber?: string;
  error?: string;
}

interface BackendUploadResponse {
  uploaded: Array<{
    file: string;
    objectUrl: string;
  }>;
  partNumber: string;
}

export default function Upload() {
  const { isLoaded, isSignedIn, user } = useUser();

  // State management
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadDetails, setUploadDetails] = useState<string>("");
  const [backendStatus, setBackendStatus] = useState<
    "checking" | "connected" | "disconnected"
  >("checking");
  const [formData, setFormData] = useState<UploadFormData>({
    partNumber: "",
    notes: "",
  });

  // Check backend connection on component mount
  useEffect(() => {
    checkBackendConnection();
  }, []);

  // Backend connection check
  const checkBackendConnection = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      setBackendStatus(response.ok ? "connected" : "disconnected");
    } catch (error) {
      console.error("Backend connection check failed:", error);
      setBackendStatus("disconnected");
    }
  };

  // Upload to server function
  const uploadToServer = async (
    files: File[],
    metadata: UploadFormData
  ): Promise<UploadResponse> => {
    try {
      if (!files || files.length === 0) {
        throw new Error("No files selected for upload");
      }

      if (!metadata.partNumber || metadata.partNumber.trim() === "") {
        throw new Error("Part number is required");
      }

      console.log(
        `Starting upload: ${files.length} files for part: ${metadata.partNumber}`
      );
      setUploadDetails(`Preparing ${files.length} files for upload...`);

      // Create FormData - matches backend multer setup
      const formDataToSend = new FormData();

      // Add files with key 'files' (multer expects upload.array('files'))
      files.forEach((file, index) => {
        formDataToSend.append("files", file);
        console.log(
          `Adding file ${index + 1}: ${file.name} (${(
            file.size /
            (1024 * 1024)
          ).toFixed(2)} MB)`
        );
      });

      // Add metadata
      formDataToSend.append("part_number", metadata.partNumber.trim());
      if (metadata.notes && metadata.notes.trim()) {
        formDataToSend.append("notes", metadata.notes.trim());
      }

      setUploadDetails(`Uploading ${files.length} files to server...`);

      // Upload request with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
        setUploadDetails("Upload timed out after 10 minutes");
      }, 600000); // 10 minute timeout

      const response = await fetch(`${API_BASE_URL}/upload-folder`, {
        method: "POST",
        body: formDataToSend,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      console.log("Upload response status:", response.status);

      if (!response.ok) {
        let errorMessage = `Upload failed with status ${response.status}`;

        try {
          const errorText = await response.text();
          console.error("Error response body:", errorText);

          if (errorText) {
            try {
              const errorJson = JSON.parse(errorText);
              errorMessage = errorJson.error || errorJson.message || errorText;
            } catch {
              errorMessage = errorText;
            }
          }
        } catch (readError) {
          console.warn("Could not read error response:", readError);
        }

        // Specific error messages for common status codes
        if (response.status === 413) {
          errorMessage =
            "Files too large. Try uploading fewer or smaller files.";
        } else if (response.status === 400) {
          errorMessage =
            errorMessage ||
            "Invalid request. Please check your files and part number.";
        } else if (response.status === 500) {
          errorMessage =
            errorMessage || "Server error during upload. Please try again.";
        }

        throw new Error(errorMessage);
      }

      // Parse successful response
      let result: BackendUploadResponse;
      try {
        const responseText = await response.text();
        console.log("Success response body:", responseText);
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.error("Failed to parse response JSON:", parseError);
        throw new Error("Server returned invalid response format");
      }

      console.log("Upload successful:", result);

      if (!result.uploaded || !Array.isArray(result.uploaded)) {
        console.warn("Unexpected response structure:", result);
        throw new Error("Server returned unexpected response format");
      }

      const successCount = result.uploaded.length;
      setUploadDetails(`Successfully uploaded ${successCount} files`);

      result.uploaded.forEach((item, index) => {
        console.log(
          `Uploaded file ${index + 1}: ${item.file} -> ${item.objectUrl}`
        );
      });

      return {
        success: true,
        message: `Successfully uploaded ${successCount} files for part ${result.partNumber}`,
        data: result,
        uploaded: result.uploaded,
        partNumber: result.partNumber,
      };
    } catch (error) {
      console.error("Upload error:", error);

      let errorMessage = "Upload failed";

      if (error instanceof Error) {
        if (error.name === "AbortError") {
          errorMessage =
            "Upload timed out. Please try again with fewer or smaller files.";
        } else if (error.message.includes("Failed to fetch")) {
          errorMessage = `Cannot connect to server at ${API_BASE_URL}. Please check if the backend is running.`;
        } else if (error.message.includes("NetworkError")) {
          errorMessage =
            "Network error during upload. Please check your connection and try again.";
        } else {
          errorMessage = error.message;
        }
      }

      setUploadDetails("");

      return {
        success: false,
        message: errorMessage,
        error: errorMessage,
      };
    }
  };

  // File validation
  const validateFiles = (filesToValidate: File[]): string | null => {
    if (filesToValidate.length === 0) {
      return "Please select at least one file to upload.";
    }

    // Check for valid image files
    const validTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/bmp",
      "image/tiff",
    ];
    const invalidFiles = filesToValidate.filter((file) => {
      const fileType = file.type.toLowerCase();
      const fileName = file.name.toLowerCase();

      if (validTypes.includes(fileType)) return false;

      const validExtensions = [
        ".jpg",
        ".jpeg",
        ".png",
        ".gif",
        ".webp",
        ".bmp",
        ".tiff",
        ".tif",
      ];
      return !validExtensions.some((ext) => fileName.endsWith(ext));
    });

    if (invalidFiles.length > 0) {
      return `Invalid file types: ${invalidFiles
        .map((f) => f.name)
        .join(
          ", "
        )}. Only image files (JPG, PNG, GIF, WEBP, BMP, TIFF) are allowed.`;
    }

    // Check file sizes
    const largeFiles = filesToValidate.filter(
      (file) => file.size > 100 * 1024 * 1024
    ); // 100MB
    if (largeFiles.length > 0) {
      return `Some files are too large: ${largeFiles
        .map((f) => `${f.name} (${(f.size / (1024 * 1024)).toFixed(1)}MB)`)
        .join(", ")}. Maximum file size is 100MB.`;
    }

    // Check total size
    const totalSize = filesToValidate.reduce((sum, file) => sum + file.size, 0);
    const totalSizeGB = totalSize / (1024 * 1024 * 1024);

    if (totalSizeGB > 5) {
      // 5GB total limit
      return `Total upload size (${totalSizeGB.toFixed(
        1
      )}GB) exceeds maximum limit of 5GB. Please upload in smaller batches.`;
    }

    // Check file count
    if (filesToValidate.length > 50) {
      return `Too many files (${filesToValidate.length}). Maximum 50 files per upload.`;
    }

    return null;
  };

  // Event handlers
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      console.log(`Selected ${filesArray.length} files`);

      const imageFiles = filesArray.filter((file) => {
        const fileType = file.type.toLowerCase();
        const fileName = file.name.toLowerCase();

        if (fileType.startsWith("image/")) return true;

        const validExtensions = [
          ".jpg",
          ".jpeg",
          ".png",
          ".gif",
          ".webp",
          ".bmp",
          ".tiff",
          ".tif",
        ];
        return validExtensions.some((ext) => fileName.endsWith(ext));
      });

      setFiles(imageFiles);

      const nonImageFiles = filesArray.filter((file) => {
        const fileType = file.type.toLowerCase();
        const fileName = file.name.toLowerCase();

        if (fileType.startsWith("image/")) return false;

        const validExtensions = [
          ".jpg",
          ".jpeg",
          ".png",
          ".gif",
          ".webp",
          ".bmp",
          ".tiff",
          ".tif",
        ];
        return !validExtensions.some((ext) => fileName.endsWith(ext));
      });

      if (nonImageFiles.length > 0) {
        setUploadError(
          `${
            nonImageFiles.length
          } non-image file(s) were skipped: ${nonImageFiles
            .map((f) => f.name)
            .join(", ")}`
        );
      } else {
        setUploadError(null);
      }

      imageFiles.forEach((file, index) => {
        console.log(
          `File ${index + 1}: ${file.name} (${file.type}, ${(
            file.size /
            (1024 * 1024)
          ).toFixed(2)} MB)`
        );
      });
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArray = Array.from(e.dataTransfer.files);
      console.log(`Dropped ${filesArray.length} files`);

      const imageFiles = filesArray.filter((file) => {
        const fileType = file.type.toLowerCase();
        const fileName = file.name.toLowerCase();

        if (fileType.startsWith("image/")) return true;

        const validExtensions = [
          ".jpg",
          ".jpeg",
          ".png",
          ".gif",
          ".webp",
          ".bmp",
          ".tiff",
          ".tif",
        ];
        return validExtensions.some((ext) => fileName.endsWith(ext));
      });

      setFiles(imageFiles);

      const nonImageFiles = filesArray.filter((file) => {
        const fileType = file.type.toLowerCase();
        const fileName = file.name.toLowerCase();

        if (fileType.startsWith("image/")) return false;

        const validExtensions = [
          ".jpg",
          ".jpeg",
          ".png",
          ".gif",
          ".webp",
          ".bmp",
          ".tiff",
          ".tif",
        ];
        return !validExtensions.some((ext) => fileName.endsWith(ext));
      });

      if (nonImageFiles.length > 0) {
        setUploadError(
          `${
            nonImageFiles.length
          } non-image file(s) were skipped: ${nonImageFiles
            .map((f) => f.name)
            .join(", ")}`
        );
      } else {
        setUploadError(null);
      }
    }
  };

  const handleRemoveFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    console.log(
      `Removed file at index ${index}, ${newFiles.length} files remaining`
    );

    if (newFiles.length === 0) {
      setUploadError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Upload form submitted");

    // Check backend connection
    if (backendStatus === "disconnected") {
      setUploadError(
        `Cannot connect to backend server at ${API_BASE_URL}. Please ensure the server is running.`
      );
      return;
    }

    // Validate form
    const fileValidationError = validateFiles(files);
    if (fileValidationError) {
      setUploadError(fileValidationError);
      return;
    }

    if (!formData.partNumber.trim()) {
      setUploadError("Part number is required.");
      return;
    }

    // Validate part number format
    const partNumberPattern = /^[A-Za-z0-9\-_\.\s]+$/;
    if (!partNumberPattern.test(formData.partNumber.trim())) {
      setUploadError(
        "Part number contains invalid characters. Use only letters, numbers, hyphens, underscores, periods, and spaces."
      );
      return;
    }

    // Reset states
    setUploadError(null);
    setUploadProgress(0);
    setUploadSuccess(false);
    setIsUploading(true);
    setUploadDetails("Initializing upload...");

    console.log(
      `Starting upload process for ${files.length} files, part: ${formData.partNumber}`
    );

    try {
      // Progress simulation
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev === null) return 10;
          if (prev >= 80) return prev; // Stop at 80% until completion

          const increment =
            files.length > 10 ? Math.random() * 5 : Math.random() * 10;
          return Math.min(prev + increment, 80);
        });
      }, 1000);

      const result = await uploadToServer(files, formData);

      clearInterval(progressInterval);

      if (result.success) {
        setUploadProgress(100);
        setUploadSuccess(true);

        console.log("Upload completed successfully:", result);

        if (result.uploaded && result.uploaded.length > 0) {
          console.log("Successfully uploaded files:");
          result.uploaded.forEach((item, index) => {
            console.log(`  ${index + 1}. ${item.file}`);
          });
        }

        // Auto-reset form after delay
        setTimeout(() => {
          console.log("Auto-resetting form");
          setFiles([]);
          setFormData({ partNumber: "", notes: "" });
          setUploadProgress(null);
          setUploadSuccess(false);
          setIsUploading(false);
          setUploadDetails("");
        }, 8000);
      } else {
        setUploadError(result.message);
        setUploadProgress(null);
        setIsUploading(false);
        setUploadDetails("");
      }
    } catch (error) {
      console.error("Upload process error:", error);
      setUploadError(
        "An unexpected error occurred during upload. Please check your connection and try again."
      );
      setUploadProgress(null);
      setIsUploading(false);
      setUploadDetails("");
    }
  };

  // Helper functions
  const getTotalSize = (): string => {
    const totalBytes = files.reduce((sum, file) => sum + file.size, 0);
    const totalMB = totalBytes / (1024 * 1024);
    const totalGB = totalMB / 1024;

    if (totalGB >= 1) {
      return `${totalGB.toFixed(2)} GB`;
    } else {
      return `${totalMB.toFixed(1)} MB`;
    }
  };

  // Loading state
  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Loading upload page...</p>
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
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Authentication Required
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Please log in to upload images
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

  // Main render with UI components
  return (
    <div className="bg-gray-50 min-h-screen">
      <UploadNavigation user={user} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <UploadHeader />

        {/* Connection Status */}
        <div className="mb-6 bg-white shadow rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center ${
                    backendStatus === "connected"
                      ? "bg-green-100"
                      : backendStatus === "disconnected"
                      ? "bg-red-100"
                      : "bg-yellow-100"
                  }`}
                >
                  {backendStatus === "checking" ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-yellow-600"></div>
                  ) : backendStatus === "connected" ? (
                    <svg
                      className="h-4 w-4 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="h-4 w-4 text-red-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  )}
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-900">
                  Backend Connection{" "}
                  {backendStatus === "connected"
                    ? "(Ready)"
                    : backendStatus === "disconnected"
                    ? "(Offline)"
                    : "(Checking...)"}
                </h3>
                <p className="text-xs text-gray-500">
                  {backendStatus === "connected" &&
                    `Connected to ${API_BASE_URL}`}
                  {backendStatus === "disconnected" &&
                    `Cannot reach ${API_BASE_URL}`}
                  {backendStatus === "checking" && "Checking server status..."}
                </p>
              </div>
            </div>
            {files.length > 0 && (
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {files.length} files selected
                </p>
                <p className="text-xs text-gray-500">Total: {getTotalSize()}</p>
              </div>
            )}
            <button
              onClick={checkBackendConnection}
              className="ml-4 text-xs text-indigo-600 hover:text-indigo-500"
              disabled={backendStatus === "checking"}
            >
              {backendStatus === "checking" ? "Checking..." : "Recheck"}
            </button>
          </div>
        </div>

        <UploadForm
          formData={formData}
          setFormData={setFormData}
          files={files}
          isDragging={isDragging}
          isUploading={isUploading}
          uploadProgress={uploadProgress}
          uploadSuccess={uploadSuccess}
          uploadError={uploadError}
          onSubmit={handleSubmit}
          onFileSelect={handleFileSelect}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onRemoveFile={handleRemoveFile}
          getTotalSize={getTotalSize}
        />

        <SelectedFilesDisplay
          files={files}
          isUploading={isUploading}
          onRemoveFile={handleRemoveFile}
          getTotalSize={getTotalSize}
        />

        {uploadProgress !== null && (
          <div className="mt-6">
            <UploadProgress
              uploadProgress={uploadProgress}
              uploadSuccess={uploadSuccess}
              isUploading={isUploading}
            />
            {uploadDetails && (
              <div className="mt-2 text-center">
                <p className="text-sm text-gray-600">{uploadDetails}</p>
              </div>
            )}
          </div>
        )}

        <StatusMessages
          uploadError={uploadError}
          uploadSuccess={uploadSuccess}
        />

        <UploadGuidelines />
        <ProTips />
      </main>
    </div>
  );
}
