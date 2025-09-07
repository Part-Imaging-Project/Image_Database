// src/app/upload/page.tsx
"use client";

import { SignInButton, useUser } from "@clerk/nextjs";
import React, { useState } from "react";
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

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

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

  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadDetails, setUploadDetails] = useState<string>("");
  const [formData, setFormData] = useState<UploadFormData>({
    partNumber: "",
    notes: "",
  });

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

      const formDataToSend = new FormData();

      files.forEach((file, index) => {
        formDataToSend.append("files", file);
        console.log(
          `Adding file ${index + 1}: ${file.name} (${(
            file.size /
            (1024 * 1024)
          ).toFixed(2)} MB)`
        );
      });

      formDataToSend.append("part_number", metadata.partNumber.trim());

      if (metadata.notes && metadata.notes.trim()) {
        formDataToSend.append("notes", metadata.notes.trim());
      }

      formDataToSend.append("resolution", "1920x1080");
      formDataToSend.append("capture_mode", "Manual Upload");

      console.log("FormData contents being sent:");
      for (let [key, value] of formDataToSend.entries()) {
        if (value instanceof File) {
          console.log(
            `${key}: File - ${value.name} (${value.size} bytes, ${value.type})`
          );
        } else {
          console.log(`${key}: ${value}`);
        }
      }

      setUploadDetails(`Uploading ${files.length} files to server...`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
        setUploadDetails("Upload timed out after 10 minutes");
      }, 600000);

      console.log(`Making POST request to: ${API_BASE_URL}/upload-folder`);

      const response = await fetch(`${API_BASE_URL}/upload-folder`, {
        method: "POST",
        body: formDataToSend,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      console.log("Upload response status:", response.status);

      if (!response.ok) {
        let errorMessage = `Upload failed with HTTP ${response.status}`;

        try {
          const errorText = await response.text();
          console.error("Error response body:", errorText);

          if (errorText) {
            try {
              const errorJson = JSON.parse(errorText);
              errorMessage = errorJson.error || errorJson.message || errorText;
            } catch {
              errorMessage = errorText.substring(0, 200);
            }
          }
        } catch (readError) {
          console.warn("Could not read error response:", readError);
        }

        switch (response.status) {
          case 400:
            errorMessage = `Bad Request: ${errorMessage}. Check if all required fields are provided.`;
            break;
          case 404:
            errorMessage =
              "Upload endpoint not found. Please verify backend is running on the correct port.";
            break;
          case 413:
            errorMessage =
              "Files too large. Try uploading fewer or smaller files.";
            break;
          case 500:
            errorMessage = `Server error: ${errorMessage}. Check backend logs for details.`;
            break;
        }

        throw new Error(errorMessage);
      }

      let result: BackendUploadResponse;
      try {
        const responseText = await response.text();
        console.log("Success response body:", responseText);

        if (!responseText || responseText.trim() === "") {
          throw new Error("Empty response from server");
        }

        result = JSON.parse(responseText);
        console.log("Parsed upload result:", result);
      } catch (parseError) {
        console.error("Failed to parse response JSON:", parseError);
        throw new Error(
          `Server returned invalid JSON response. Parse error: ${parseError}`
        );
      }

      if (!result || typeof result !== "object") {
        throw new Error("Server returned invalid response format");
      }

      const successCount = result.uploaded?.length || files.length;
      const partNumber = result.partNumber || metadata.partNumber;

      setUploadDetails(`Successfully uploaded ${successCount} files`);

      if (result.uploaded && Array.isArray(result.uploaded)) {
        result.uploaded.forEach((item, index) => {
          console.log(
            `Uploaded file ${index + 1}: ${item.file} -> ${
              item.objectUrl || "stored successfully"
            }`
          );
        });
      }

      return {
        success: true,
        message: `Successfully uploaded ${successCount} files for part ${partNumber}`,
        data: result,
        uploaded:
          result.uploaded ||
          files.map((f) => ({ file: f.name, objectUrl: "" })),
        partNumber: partNumber,
      };
    } catch (error) {
      console.error("Upload process error:", error);

      let errorMessage = "Upload failed";

      if (error instanceof Error) {
        if (error.name === "AbortError") {
          errorMessage =
            "Upload timed out. Please try again with fewer or smaller files.";
        } else if (
          error.message.includes("Failed to fetch") ||
          error.message.includes("fetch")
        ) {
          errorMessage = `Cannot connect to server at ${API_BASE_URL}. Please check if the backend is running and accessible.`;
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

  const validateFiles = (filesToValidate: File[]): string | null => {
    if (filesToValidate.length === 0) {
      return "Please select at least one file to upload.";
    }

    const validTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/bmp",
      "image/tiff",
    ];
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

    const invalidFiles = filesToValidate.filter((file) => {
      const fileType = file.type.toLowerCase();
      const fileName = file.name.toLowerCase();

      if (validTypes.includes(fileType)) return false;
      return !validExtensions.some((ext) => fileName.endsWith(ext));
    });

    if (invalidFiles.length > 0) {
      return `Invalid file types detected: ${invalidFiles
        .slice(0, 3)
        .map((f) => f.name)
        .join(", ")}${
        invalidFiles.length > 3 ? ` and ${invalidFiles.length - 3} more` : ""
      }. Only image files are allowed.`;
    }

    const largeFiles = filesToValidate.filter(
      (file) => file.size > 100 * 1024 * 1024
    );
    if (largeFiles.length > 0) {
      return `Files too large: ${largeFiles
        .slice(0, 3)
        .map((f) => `${f.name} (${(f.size / (1024 * 1024)).toFixed(1)}MB)`)
        .join(", ")}. Maximum file size is 100MB per file.`;
    }

    const totalSize = filesToValidate.reduce((sum, file) => sum + file.size, 0);
    const totalSizeGB = totalSize / (1024 * 1024 * 1024);

    if (totalSizeGB > 2) {
      return `Total upload size (${totalSizeGB.toFixed(
        1
      )}GB) exceeds maximum limit of 2GB. Please upload in smaller batches.`;
    }

    if (filesToValidate.length > 100) {
      return `Too many files (${filesToValidate.length}). Maximum 100 files per upload batch.`;
    }

    return null;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      console.log(`Selected ${filesArray.length} files via file input`);

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
          `${nonImageFiles.length} non-image file(s) were filtered out`
        );
      } else {
        setUploadError(null);
      }

      imageFiles.forEach((file, index) => {
        console.log(
          `Image file ${index + 1}: ${file.name} (${file.type}, ${(
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
          `${nonImageFiles.length} non-image file(s) were filtered out from drag & drop`
        );
      } else {
        setUploadError(null);
      }
    }
  };

  const handleRemoveFile = (index: number) => {
    const removedFile = files[index];
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    console.log(
      `Removed file: ${removedFile.name}, ${newFiles.length} files remaining`
    );

    if (newFiles.length === 0) {
      setUploadError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Upload form submitted");

    const fileValidationError = validateFiles(files);
    if (fileValidationError) {
      setUploadError(fileValidationError);
      return;
    }

    if (!formData.partNumber.trim()) {
      setUploadError("Part number is required.");
      return;
    }

    const partNumberPattern = /^[A-Za-z0-9\-_\.\s]+$/;
    if (!partNumberPattern.test(formData.partNumber.trim())) {
      setUploadError(
        "Part number contains invalid characters. Use only letters, numbers, hyphens, underscores, periods, and spaces."
      );
      return;
    }

    setUploadError(null);
    setUploadProgress(0);
    setUploadSuccess(false);
    setIsUploading(true);
    setUploadDetails("Initializing upload...");

    console.log(
      `Starting upload process for ${files.length} files, part: ${formData.partNumber}`
    );

    try {
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev === null) return 10;
          if (prev >= 80) return prev;

          const increment =
            files.length > 10 ? Math.random() * 3 : Math.random() * 8;
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

        setTimeout(() => {
          console.log("Auto-resetting form after successful upload");
          setFiles([]);
          setFormData({ partNumber: "", notes: "" });
          setUploadProgress(null);
          setUploadSuccess(false);
          setIsUploading(false);
          setUploadDetails("");
        }, 8000);
      } else {
        clearInterval(progressInterval);
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

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="text-center">
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

  return (
    <div className="bg-gray-50 min-h-screen">
      <UploadNavigation user={user} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <UploadHeader />

        <UploadForm
          formData={formData}
          setFormData={setFormData}
          files={files}
          isDragging={isDragging}
          isUploading={isUploading}
          onSubmit={handleSubmit}
          onFileSelect={handleFileSelect}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
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
