// src/app/upload/page.tsx - Refactored with UI Components
"use client";

import { SignInButton, useUser } from "@clerk/nextjs";
import { useState } from "react";
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

interface UploadResponse {
  success: boolean;
  message: string;
  data?: any;
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

  const [formData, setFormData] = useState<UploadFormData>({
    partNumber: "",
    notes: "",
  });

  // API Functions
  const uploadToServer = async (
    files: File[],
    metadata: UploadFormData
  ): Promise<UploadResponse> => {
    try {
      const formDataToSend = new FormData();

      // Add all files to FormData
      files.forEach((file) => {
        formDataToSend.append("files", file);
      });

      // Add part number
      formDataToSend.append("part_number", metadata.partNumber);

      // Add notes if provided
      if (metadata.notes) {
        formDataToSend.append("notes", metadata.notes);
      }

      console.log(
        `Uploading ${files.length} files for part: ${metadata.partNumber}`
      );

      const response = await fetch(`${API_BASE_URL}/upload-folder`, {
        method: "POST",
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log("Upload successful:", result);

      return {
        success: true,
        message: "Upload successful",
        data: result,
      };
    } catch (error) {
      console.error("Upload error:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Upload failed",
      };
    }
  };

  // Event Handlers
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      // Only accept image files
      const imageFiles = filesArray.filter((file) =>
        file.type.startsWith("image/")
      );
      setFiles(imageFiles);

      const nonImageFiles = filesArray.filter(
        (file) => !file.type.startsWith("image/")
      );
      if (nonImageFiles.length > 0) {
        setUploadError(
          `${nonImageFiles.length} non-image file(s) were skipped. Only image files are supported.`
        );
      } else {
        setUploadError(null);
      }
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
      // Only accept image files
      const imageFiles = filesArray.filter((file) =>
        file.type.startsWith("image/")
      );
      setFiles(imageFiles);

      const nonImageFiles = filesArray.filter(
        (file) => !file.type.startsWith("image/")
      );
      if (nonImageFiles.length > 0) {
        setUploadError(
          `${nonImageFiles.length} non-image file(s) were skipped. Only image files are supported.`
        );
      } else {
        setUploadError(null);
      }
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (files.length === 0) {
      setUploadError("Please select at least one file to upload.");
      return;
    }

    if (!formData.partNumber.trim()) {
      setUploadError("Part number is required.");
      return;
    }

    setUploadError(null);
    setUploadProgress(0);
    setIsUploading(true);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev === null) return 10;
          if (prev >= 90) return prev;
          return prev + 10;
        });
      }, 500);

      const result = await uploadToServer(files, formData);

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (result.success) {
        setUploadSuccess(true);

        // Reset form after 3 seconds
        setTimeout(() => {
          setFiles([]);
          setFormData({
            partNumber: "",
            notes: "",
          });
          setUploadProgress(null);
          setUploadSuccess(false);
          setIsUploading(false);
        }, 3000);
      } else {
        setUploadError(result.message);
        setIsUploading(false);
        setUploadProgress(null);
      }
    } catch (error) {
      console.error("Upload process error:", error);
      setUploadError(
        "An unexpected error occurred during upload. Please try again."
      );
      setUploadProgress(null);
      setIsUploading(false);
    }
  };

  // Helper Functions
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

  // Main upload page render
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Navigation */}
      <UploadNavigation user={user} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <UploadHeader />

        {/* Upload Form */}
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

        {/* Selected Files Display */}
        <SelectedFilesDisplay
          files={files}
          isUploading={isUploading}
          onRemoveFile={handleRemoveFile}
          getTotalSize={getTotalSize}
        />

        {/* Upload Progress */}
        <UploadProgress
          uploadProgress={uploadProgress}
          uploadSuccess={uploadSuccess}
          isUploading={isUploading}
        />

        {/* Status Messages */}
        <StatusMessages
          uploadError={uploadError}
          uploadSuccess={uploadSuccess}
        />

        {/* Upload Guidelines */}
        <UploadGuidelines />

        {/* Pro Tips */}
        <ProTips />
      </main>
    </div>
  );
}
