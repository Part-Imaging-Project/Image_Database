// src/app/components/UploadUI.tsx
"use client";

import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { useRef } from "react";

// Type definitions
export interface UploadFormData {
  partNumber: string;
  notes: string;
}

export interface UploadFile {
  file: File;
  preview: string;
  size: string;
}

interface UploadUIProps {
  user: any;
  files: File[];
  setFiles: (files: File[]) => void;
  isDragging: boolean;
  setIsDragging: (dragging: boolean) => void;
  uploadProgress: number | null;
  uploadSuccess: boolean;
  uploadError: string | null;
  isUploading: boolean;
  formData: UploadFormData;
  setFormData: (data: UploadFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDragEnter: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onRemoveFile: (index: number) => void;
  getTotalSize: () => string;
}

// Navigation Component
export const UploadNavigation = ({ user }: { user: any }) => (
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
              className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
            >
              Gallery
            </Link>
            <Link
              href="/upload"
              className="border-indigo-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
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
);

// Header Component
export const UploadHeader = () => (
  <div className="md:flex md:items-center md:justify-between mb-6">
    <div className="flex-1 min-w-0">
      <h1 className="text-2xl font-bold text-gray-900">Upload Images</h1>
      <p className="mt-1 text-sm text-gray-500">
        Upload multiple images for a part number. Select entire folders or
        individual files.
      </p>
    </div>
    <div className="mt-4 md:mt-0">
      <Link
        href="/gallery"
        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        View Gallery
      </Link>
    </div>
  </div>
);

// Upload Form Component
export const UploadForm = ({
  formData,
  setFormData,
  files,
  isDragging,
  isUploading,
  uploadProgress,
  uploadSuccess,
  uploadError,
  onSubmit,
  onFileSelect,
  onDragEnter,
  onDragLeave,
  onDragOver,
  onDrop,
  onRemoveFile,
  getTotalSize,
}: {
  formData: UploadFormData;
  setFormData: (data: UploadFormData) => void;
  files: File[];
  isDragging: boolean;
  isUploading: boolean;
  uploadProgress: number | null;
  uploadSuccess: boolean;
  uploadError: string | null;
  onSubmit: (e: React.FormEvent) => void;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDragEnter: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onRemoveFile: (index: number) => void;
  getTotalSize: () => string;
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const triggerFolderInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.setAttribute("webkitdirectory", "");
      fileInputRef.current.click();
    }
  };

  const triggerIndividualFiles = () => {
    if (fileInputRef.current) {
      fileInputRef.current.removeAttribute("webkitdirectory");
      fileInputRef.current.click();
    }
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
      <div className="px-4 py-5 sm:p-6">
        <form onSubmit={onSubmit}>
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            {/* Part Number Field */}
            <div className="sm:col-span-3">
              <label
                htmlFor="partNumber"
                className="block text-sm font-medium text-gray-700"
              >
                Part Number *
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="partNumber"
                  id="partNumber"
                  required
                  value={formData.partNumber}
                  onChange={handleInputChange}
                  disabled={isUploading}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md disabled:bg-gray-100"
                  placeholder="e.g., PART-8899"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                All selected images will be associated with this part number
              </p>
            </div>

            {/* Notes Field */}
            <div className="sm:col-span-6">
              <label
                htmlFor="notes"
                className="block text-sm font-medium text-gray-700"
              >
                Notes (Optional)
              </label>
              <div className="mt-1">
                <textarea
                  id="notes"
                  name="notes"
                  rows={3}
                  value={formData.notes}
                  onChange={handleInputChange}
                  disabled={isUploading}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md disabled:bg-gray-100"
                  placeholder="Additional information about these images"
                />
              </div>
            </div>

            {/* File Upload Area */}
            <div className="sm:col-span-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Images *
              </label>

              {/* Upload Options */}
              <div className="mb-4 flex space-x-4">
                <button
                  type="button"
                  onClick={triggerFolderInput}
                  disabled={isUploading}
                  className="inline-flex items-center px-4 py-2 border border-indigo-300 rounded-md shadow-sm text-sm font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
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
                      d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-5l-2-2H5a2 2 0 00-2 2z"
                    />
                  </svg>
                  Select Folder
                </button>
              </div>

              {/* Drag & Drop Area */}
              <div
                className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md ${
                  isDragging
                    ? "border-indigo-400 bg-indigo-50"
                    : "border-gray-300"
                } ${isUploading ? "opacity-50 pointer-events-none" : ""}`}
                onDragEnter={onDragEnter}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
              >
                <div className="space-y-1 text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                    aria-hidden="true"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="text-sm text-gray-600">
                    <p>Drag and drop images here</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Or use the buttons above to select files/folders
                    </p>
                  </div>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, GIF, WEBP • No size limit
                  </p>
                </div>
              </div>

              {/* Hidden File Input */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={onFileSelect}
                disabled={isUploading}
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-6 flex justify-end">
            <Link
              href="/dashboard"
              className="mr-3 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={
                isUploading || files.length === 0 || !formData.partNumber.trim()
              }
              className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
                isUploading || files.length === 0 || !formData.partNumber.trim()
                  ? "bg-indigo-400 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              }`}
            >
              {isUploading
                ? `Uploading ${files.length} files...`
                : `Upload ${files.length} Files`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Selected Files Display Component
export const SelectedFilesDisplay = ({
  files,
  isUploading,
  onRemoveFile,
  getTotalSize,
}: {
  files: File[];
  isUploading: boolean;
  onRemoveFile: (index: number) => void;
  getTotalSize: () => string;
}) => {
  if (files.length === 0) return null;

  return (
    <div className="mt-6 border rounded-md overflow-hidden">
      <div className="bg-gray-50 px-4 py-3 border-b">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-medium text-gray-700">
            Selected Files ({files.length})
          </h3>
          <div className="text-sm text-gray-500">
            Total Size:{" "}
            <span className="font-medium text-indigo-600">
              {getTotalSize()}
            </span>
          </div>
        </div>
      </div>
      <div className="max-h-60 overflow-y-auto">
        <ul className="divide-y divide-gray-200">
          {files.map((file, index) => (
            <li
              key={index}
              className="px-4 py-3 flex items-center justify-between hover:bg-gray-50"
            >
              <div className="flex items-center flex-1 min-w-0">
                <div className="h-10 w-10 bg-gray-200 rounded flex items-center justify-center overflow-hidden mr-3 flex-shrink-0">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Preview of ${file.name}`}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                      target.nextElementSibling?.classList.remove("hidden");
                    }}
                  />
                  <div className="hidden h-full w-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                    <svg
                      className="h-4 w-4 text-gray-500"
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
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className="text-sm font-medium text-gray-900 truncate"
                    title={file.name}
                  >
                    {file.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {file.size > 1024 * 1024 * 1024
                      ? `${(file.size / (1024 * 1024 * 1024)).toFixed(2)} GB`
                      : `${(file.size / (1024 * 1024)).toFixed(2)} MB`}{" "}
                    • {file.type || "Unknown type"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onRemoveFile(index)}
                disabled={isUploading}
                className="ml-4 text-gray-400 hover:text-gray-500 disabled:opacity-50 flex-shrink-0"
                title="Remove file"
              >
                <span className="sr-only">Remove file</span>
                <svg
                  className="h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

// Upload Progress Component
export const UploadProgress = ({
  uploadProgress,
  uploadSuccess,
  isUploading,
}: {
  uploadProgress: number | null;
  uploadSuccess: boolean;
  isUploading: boolean;
}) => {
  if (uploadProgress === null) return null;

  return (
    <div className="mt-6">
      <div className="relative pt-1">
        <div className="flex mb-2 items-center justify-between">
          <div>
            <span
              className={`text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full ${
                uploadSuccess
                  ? "text-green-600 bg-green-200"
                  : "text-indigo-600 bg-indigo-200"
              }`}
            >
              {uploadSuccess ? "✅ Upload Complete" : "⏳ Uploading..."}
            </span>
          </div>
          <div className="text-right">
            <span
              className={`text-xs font-semibold inline-block ${
                uploadSuccess ? "text-green-600" : "text-indigo-600"
              }`}
            >
              {uploadProgress}%
            </span>
          </div>
        </div>
        <div
          className={`overflow-hidden h-2 mb-4 text-xs flex rounded ${
            uploadSuccess ? "bg-green-200" : "bg-indigo-200"
          }`}
        >
          <div
            style={{ width: `${uploadProgress}%` }}
            className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-500 ${
              uploadSuccess ? "bg-green-500" : "bg-indigo-500"
            }`}
          ></div>
        </div>
      </div>
    </div>
  );
};

// Status Messages Component
export const StatusMessages = ({
  uploadError,
  uploadSuccess,
}: {
  uploadError: string | null;
  uploadSuccess: boolean;
}) => (
  <div className="mt-4 space-y-4">
    {uploadError && (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
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
            <h3 className="text-sm font-medium text-red-800">Upload Error</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{uploadError}</p>
            </div>
          </div>
        </div>
      </div>
    )}

    {uploadSuccess && (
      <div className="bg-green-50 border border-green-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-green-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-green-800">
              Upload Successful
            </h3>
            <div className="mt-2 text-sm text-green-700">
              <p>
                Your files have been uploaded successfully! They will appear in
                the gallery shortly.
              </p>
              <div className="mt-2">
                <Link
                  href="/gallery"
                  className="text-green-600 hover:text-green-500 font-medium"
                >
                  View in Gallery →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    )}
  </div>
);

// Upload Guidelines Component
export const UploadGuidelines = () => (
  <div className="bg-white shadow rounded-lg overflow-hidden mb-8">
    <div className="px-4 py-5 sm:px-6 bg-gray-50">
      <h3 className="text-lg leading-6 font-medium text-gray-900">
        Upload Guidelines
      </h3>
    </div>
    <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
      <div className="space-y-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-indigo-500"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <p className="ml-2 text-sm text-gray-600">
            <strong>Folder Upload:</strong> Select entire folders containing
            multiple images for batch processing.
          </p>
        </div>
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-indigo-500"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <p className="ml-2 text-sm text-gray-600">
            <strong>No Size Limits:</strong> Upload files of any size - perfect
            for high-resolution manufacturing images.
          </p>
        </div>
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-indigo-500"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <p className="ml-2 text-sm text-gray-600">
            <strong>Supported Formats:</strong> JPG, PNG, GIF, WEBP image files.
          </p>
        </div>
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-indigo-500"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <p className="ml-2 text-sm text-gray-600">
            <strong>Automatic Processing:</strong> Images are automatically
            stored in MinIO and metadata saved to PostgreSQL.
          </p>
        </div>
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-green-500"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <p className="ml-2 text-sm text-gray-600">
            <strong>Batch Processing:</strong> All images from a folder will be
            processed together with the same part number.
          </p>
        </div>
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-green-500"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <p className="ml-2 text-sm text-gray-600">
            <strong>Real-time Progress:</strong> Upload progress is tracked and
            displayed for the entire batch.
          </p>
        </div>
      </div>
    </div>
  </div>
);

// Pro Tips Component
export const ProTips = () => (
  <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
    <div className="flex">
      <div className="flex-shrink-0">
        <svg
          className="h-5 w-5 text-blue-400"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
            clipRule="evenodd"
          />
        </svg>
      </div>
      <div className="ml-3">
        <h3 className="text-sm font-medium text-blue-800">
          💡 Pro Tips for Folder Upload
        </h3>
        <div className="mt-2 text-sm text-blue-700">
          <ul className="list-disc list-inside space-y-1">
            <li>
              Organize images in folders by part number for easier batch uploads
            </li>
            <li>
              The folder name can be used as the part number if you don't
              specify one
            </li>
            <li>All images in the selected folder will be uploaded together</li>
            <li>Large folders with hundreds of images are supported</li>
            <li>Use clear, descriptive part numbers for better organization</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
);
