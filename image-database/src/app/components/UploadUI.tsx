// src/app/components/UploadUI.tsx
"use client";

import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { useRef, useState } from "react";

export interface UploadFormData {
  partNumber: string;
  notes: string;
}

export const UploadNavigation = ({ user }: { user: any }) => {
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
              className="border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Gallery
            </Link>
            <Link
              href="/upload"
              className="bg-indigo-50 border-indigo-500 text-indigo-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
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

export const UploadHeader = () => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0">
      <div className="flex-1 min-w-0">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Upload Images</h1>
        <p className="mt-1 text-sm text-gray-500">
          Upload multiple images for a part number.
        </p>
      </div>
      <div className="w-full sm:w-auto">
        <Link
          href="/gallery"
          className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          View Gallery
        </Link>
      </div>
    </div>
  );
};

export const UploadForm = ({
  formData,
  setFormData,
  files,
  isDragging,
  isUploading,
  onSubmit,
  onFileSelect,
  onDragEnter,
  onDragLeave,
  onDragOver,
  onDrop,
}: {
  formData: UploadFormData;
  setFormData: (data: UploadFormData) => void;
  files: File[];
  isDragging: boolean;
  isUploading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDragEnter: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
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
    if (fileInputRef.current) {
      fileInputRef.current.removeAttribute("webkitdirectory");
      fileInputRef.current.click();
    }
  };

  const triggerFolderInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.setAttribute("webkitdirectory", "");
      fileInputRef.current.click();
    }
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
      <div className="px-4 py-5 sm:p-6">
        <form onSubmit={onSubmit}>
          <div className="space-y-6 mobile-form-grid sm:grid sm:grid-cols-6 sm:gap-x-4 sm:gap-y-6 sm:space-y-0">
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
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full text-sm sm:text-sm border-gray-300 rounded-md disabled:bg-gray-100"
                  placeholder="e.g., PART-8899"
                />
              </div>
            </div>

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
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full text-sm sm:text-sm border-gray-300 rounded-md disabled:bg-gray-100"
                  placeholder="Additional information about these images"
                />
              </div>
            </div>

            <div className="sm:col-span-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Images *
              </label>

              <div className="mb-4 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                <button
                  type="button"
                  onClick={triggerFolderInput}
                  disabled={isUploading}
                  className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-indigo-300 rounded-md shadow-sm text-sm font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 disabled:opacity-50"
                >
                  Select Folder
                </button>
              </div>

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
                  <div className="text-sm text-gray-600">
                    <p>Drag and drop images here</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Or use the buttons above to select files/folders
                    </p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF, WEBP</p>
                </div>
              </div>

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

          <div className="mt-6 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:justify-end">
            <Link
              href="/dashboard"
              className="order-2 sm:order-1 sm:mr-3 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 text-center"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={
                isUploading || files.length === 0 || !formData.partNumber.trim()
              }
              className={`order-1 sm:order-2 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
                isUploading || files.length === 0 || !formData.partNumber.trim()
                  ? "bg-indigo-400 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700"
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
                    alt={`Preview`}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className="text-sm font-medium text-gray-900 truncate"
                    title={file.name}
                  >
                    {file.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
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
                ✕
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

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

export const StatusMessages = ({
  uploadError,
  uploadSuccess,
}: {
  uploadError: string | null;
  uploadSuccess: boolean;
}) => {
  return (
    <div className="mt-4 space-y-4">
      {uploadError && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-red-400">❌</span>
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
              <span className="text-green-400">✅</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">
                Upload Successful
              </h3>
              <div className="mt-2 text-sm text-green-700">
                <p>Your files have been uploaded successfully!</p>
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
};

export const UploadGuidelines = () => {
  return (
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
              <span className="text-indigo-500">✓</span>
            </div>
            <p className="ml-2 text-sm text-gray-600">
              <strong>Folder Upload:</strong> Select entire folders containing
              multiple images for batch processing.
            </p>
          </div>
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <span className="text-indigo-500">✓</span>
            </div>
            <p className="ml-2 text-sm text-gray-600">
              <strong>Supported Formats:</strong> JPG, PNG, GIF, WEBP image
              files.
            </p>
          </div>
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <span className="text-indigo-500">✓</span>
            </div>
            <p className="ml-2 text-sm text-gray-600">
              <strong>Automatic Processing:</strong> Images are automatically
              stored in MinIO and metadata saved to PostgreSQL.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
