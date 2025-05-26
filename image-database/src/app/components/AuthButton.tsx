// src/components/AuthButton.tsx
'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import Link from 'next/link';

export default function AuthButton() {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>;
  }

  if (user) {
    return (
      <div className="flex items-center space-x-4">
        <Link
          href="/dashboard"
          className="text-sm px-3 py-2 rounded text-gray-700 hover:bg-gray-100"
        >
          Dashboard
        </Link>
        <div className="flex items-center gap-2">
          {user.picture ? (
            <img
              src={user.picture}
              alt={user.name || 'User'}
              className="h-8 w-8 rounded-full"
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
              <span className="text-indigo-600 font-medium">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </span>
            </div>
          )}
          <Link
            href="/api/auth/logout"
            className="text-sm px-3 py-2 rounded text-gray-700 hover:bg-gray-100"
          >
            Log out
          </Link>
        </div>
      </div>
    );
  }

  return (
    <Link
      href="/api/auth/login"
      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
    >
      Log in
    </Link>
  );
}