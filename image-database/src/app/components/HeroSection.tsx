'use client';

import React from 'react';
import Link from 'next/link';
import { useUser } from '@auth0/nextjs-auth0/client';

const HeroSection: React.FC = () => {
  const { user, isLoading } = useUser();

  return (
    <div className="bg-indigo-100">
      {/* Navigation Bar */}
      <nav className="bg-white py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center space-x-10">
            <Link href="/" className="text-gray-700 hover:text-gray-900">
              Home
            </Link>
            <Link href="/pricing" className="text-gray-700 hover:text-gray-900">
              Pricing
            </Link>
            <Link href="/features" className="text-gray-700 hover:text-gray-900">
              Features
            </Link>
            <Link href="/contact" className="text-gray-700 hover:text-gray-900">
              Contact
            </Link>
            
            {isLoading ? (
              <div className="ml-4 h-10 w-28 bg-gray-200 rounded-md animate-pulse"></div>
            ) : user ? (
              <Link
                href="/dashboard"
                className="ml-4 inline-flex items-center px-6 py-2 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
              >
                Dashboard
              </Link>
            ) : (
              <a
                href="/api/auth/login?returnTo=/dashboard"
                className="ml-4 inline-flex items-center px-6 py-2 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Get Started
              </a>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Content */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold text-indigo-600">Hero Section</h1>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;