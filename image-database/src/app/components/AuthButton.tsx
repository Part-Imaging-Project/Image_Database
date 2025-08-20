// src/app/components/AuthButton.tsx
'use client';

import { useUser, SignInButton, UserButton } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

export default function AuthButton() {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();

  // Auto-redirect to dashboard after successful login
  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      // Check if we're on the home page and redirect to dashboard
      if (window.location.pathname === '/') {
        router.push('/dashboard');
      }
    }
  }, [isLoaded, isSignedIn, user, router]);

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
          <UserButton 
            afterSignOutUrl="/"
            appearance={{
              elements: {
                avatarBox: "h-8 w-8"
              }
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex space-x-2">
      <SignInButton 
        mode="modal"
        forceRedirectUrl="/dashboard"
        signUpForceRedirectUrl="/dashboard"
      >
        <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
          Log in
        </button>
      </SignInButton>
    </div>
  );
}