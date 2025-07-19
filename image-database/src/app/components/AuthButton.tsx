// src/app/components/AuthButton.tsx
'use client';

import { useUser, SignInButton, UserButton } from '@clerk/nextjs';
import Link from 'next/link';

export default function AuthButton() {
  const { isLoaded, isSignedIn, user } = useUser();

  if (!isLoaded) {
    return <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>;
  }

  if (isSignedIn) {
    return (
      <div className="flex items-center space-x-4">
        <Link
          href="/dashboard"
          className="text-sm px-3 py-2 rounded text-gray-700 hover:bg-gray-100"
        >
          Dashboard
        </Link>
        <div className="flex items-center gap-2">
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex space-x-2">
      <SignInButton mode="modal">
        <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
          Log in
        </button>
      </SignInButton>
    </div>
  );
}