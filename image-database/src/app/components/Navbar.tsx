// src/app/components/Navbar.tsx
'use client';

import Link from 'next/link';
import { useUser, SignInButton, UserButton } from '@clerk/nextjs';

export default function Navbar() {
  const { isLoaded, isSignedIn, user } = useUser();
  
  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-indigo-600">
              ImageDB
            </Link>
          </div>
          <div className="flex items-center">
            {!isLoaded ? (
              <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
            ) : isSignedIn ? (
              <div className="flex items-center space-x-4">
                <Link href="/dashboard" className="text-gray-700 hover:text-indigo-600">
                  Dashboard
                </Link>
                <UserButton afterSignOutUrl="/" />
              </div>
            ) : (
              <SignInButton mode="modal">
                <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
                  Log in
                </button>
              </SignInButton>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}