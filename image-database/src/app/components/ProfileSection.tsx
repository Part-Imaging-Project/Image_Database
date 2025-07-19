// src/app/components/ProfileSection.tsx
'use client';

import { useUser, SignInButton } from '@clerk/nextjs';
import Link from 'next/link';

export default function ProfileSection() {
  const { isLoaded, isSignedIn, user } = useUser();

  if (!isLoaded) {
    return (
      <div className="bg-white shadow rounded-lg p-6 mb-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-3"></div>
        <div className="h-8 bg-gray-200 rounded w-1/4 mt-4"></div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <p className="text-gray-500">Please log in to view your profile information.</p>
        <SignInButton mode="modal">
          <button className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            Log in
          </button>
        </SignInButton>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6 mb-6">
      <div className="flex items-center">
        <div className="mr-4">
          {user.imageUrl ? (
            <img
              src={user.imageUrl}
              alt={user.fullName || 'User'}
              className="h-16 w-16 rounded-full"
            />
          ) : (
            <div className="h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center">
              <span className="text-indigo-600 text-xl font-medium">
                {user.firstName ? user.firstName.charAt(0).toUpperCase() : user.emailAddresses[0]?.emailAddress.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
          )}
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">User Profile</h2>
          <div className="mt-2 space-y-2">
            <p className="text-sm text-gray-500">
              <span className="font-medium text-gray-700">Name:</span> {user.fullName || 'Not provided'}
            </p>
            <p className="text-sm text-gray-500">
              <span className="font-medium text-gray-700">Email:</span> {user.emailAddresses[0]?.emailAddress || 'Not provided'}
            </p>
            {user.username && (
              <p className="text-sm text-gray-500">
                <span className="font-medium text-gray-700">Username:</span> {user.username}
              </p>
            )}
          </div>
        </div>
      </div>
      <div className="mt-4 flex justify-end">
        <Link
          href="/settings"
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Edit Profile
        </Link>
      </div>
    </div>
  );
}