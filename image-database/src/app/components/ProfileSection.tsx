// src/components/ProfileSection.tsx
'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import Link from 'next/link';

export default function ProfileSection() {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="bg-white shadow rounded-lg p-6 mb-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-3"></div>
        <div className="h-8 bg-gray-200 rounded w-1/4 mt-4"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <p className="text-gray-500">Please log in to view your profile information.</p>
        <Link 
          href="/api/auth/login"
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Log in
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6 mb-6">
      <div className="flex items-center">
        <div className="mr-4">
          {user.picture ? (
            <img
              src={user.picture}
              alt={user.name || 'User'}
              className="h-16 w-16 rounded-full"
            />
          ) : (
            <div className="h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center">
              <span className="text-indigo-600 text-xl font-medium">
                {user.name ? user.name.charAt(0).toUpperCase() : user.email ? user.email.charAt(0).toUpperCase() : 'U'}
              </span>
            </div>
          )}
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">User Profile</h2>
          <div className="mt-2 space-y-2">
            <p className="text-sm text-gray-500">
              <span className="font-medium text-gray-700">Name:</span> {user.name || 'Not provided'}
            </p>
            <p className="text-sm text-gray-500">
              <span className="font-medium text-gray-700">Email:</span> {user.email || 'Not provided'}
            </p>
            {user.nickname && (
              <p className="text-sm text-gray-500">
                <span className="font-medium text-gray-700">Username:</span> {user.nickname}
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