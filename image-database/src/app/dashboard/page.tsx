'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import Link from 'next/link';

export default function Dashboard() {
  const { user, error, isLoading } = useUser();

  if (isLoading) return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  if (error) return <div className="text-red-500 text-center mt-10">Error: {error.message}</div>;
  if (!user) return <div className="text-center mt-10">Please log in to view this page.</div>;

  return (
    <div className="bg-gray-50 min-h-screen">
      <nav className="bg-white py-4 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-indigo-600">
              ImageDatabase
            </Link>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user.name || 'User'}</span>
              <a
                href="/api/auth/logout"
                className="text-sm px-4 py-2 border border-transparent rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200"
              >
                Log out
              </a>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>
        
        {/* User Auth0 Sub ID Display */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-medium text-gray-900 mb-4">Your Auth0 Information</h2>
          <div className="bg-gray-100 p-4 rounded overflow-auto">
            <p className="text-sm font-medium text-gray-700">User ID:</p>
            <p className="text-sm font-mono text-gray-900 mb-2">{user.sub}</p>
            
            <p className="text-sm font-medium text-gray-700 mt-4">Email:</p>
            <p className="text-sm font-mono text-gray-900">{user.email}</p>
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-medium text-gray-900 mb-4">Your Images</h2>
          <p className="text-gray-500">You don't have any images yet. Start uploading to build your collection.</p>
          
          <button className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
            Upload Images
          </button>
        </div>
      </main>
    </div>
  );
}