// src/components/Navbar.tsx
import Link from 'next/link';
import { useUser } from '@auth0/nextjs-auth0/client';

export default function Navbar() {
  const { user, isLoading } = useUser();
  
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
            {isLoading ? (
              <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
            ) : user ? (
              <div className="flex items-center space-x-4">
                <Link href="/dashboard" className="text-gray-700 hover:text-indigo-600">
                  Dashboard
                </Link>
                <div className="flex items-center space-x-2">
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
            ) : (
              <Link
                href="/api/auth/login"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Log in
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}