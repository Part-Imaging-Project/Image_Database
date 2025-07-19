'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import Link from 'next/link';
import { useState } from 'react';

// Interface for user settings
interface UserSettings {
  displayName: string;
  email: string;
  profileImage: string | null;
}

export default function Settings() {
  const { user, error, isLoading } = useUser();
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  
  // Initial settings state populated with user data
  const [settings, setSettings] = useState<UserSettings>({
    displayName: '',
    email: '',
    profileImage: null,
  });

  // Update settings state with user data once loaded
  if (user && settings.displayName === '') {
    setSettings({
      ...settings,
      displayName: user.name || '',
      email: user.email || '',
      profileImage: user.picture || null,
    });
  }

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings({
      ...settings,
      [name]: value
    });
  };

  // Handle settings save
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset status messages
    setSaveSuccess(false);
    setSaveError(null);
    
    try {
      // Simulate API call with a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate successful save
      setSaveSuccess(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
      
      // In a real application, you would send the settings to your API here
      // const response = await fetch('/api/user/settings', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(settings)
      // });
      // Handle the API response accordingly
    } catch (error) {
      setSaveError('An error occurred while saving your settings. Please try again.');
    }
  };

  // Loading state
  if (isLoading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
    </div>
  );
  
  // Error state
  if (error) return <div className="text-red-500 text-center mt-10">Error: {error.message}</div>;
  
  // Unauthenticated state
  if (!user) return <div className="text-center mt-10 p-6 bg-white rounded-lg shadow">
    <p className="mb-4">Please log in to view your settings.</p>
    <Link
      href="/api/auth/login?returnTo=/settings"
      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
    >
      Log in
    </Link>
  </div>;

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Navigation */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/" className="text-2xl font-bold text-indigo-600">
                  ImageDB
                </Link>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link href="/dashboard" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Dashboard
                </Link>
                <Link href="/gallery" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Gallery
                </Link>
                <Link href="/upload" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Upload
                </Link>
                <Link href="/settings" className="border-indigo-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Settings
                </Link>
              </div>
            </div>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="relative ml-3">
                  <div className="flex items-center space-x-4">
                    <span className="text-gray-700">
                      {user.name || user.email || 'User'}
                    </span>
                    <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-800 font-semibold">
                      {(user.name?.charAt(0) || user.email?.charAt(0) || 'U').toUpperCase()}
                    </div>
                    <a
                      href="/api/auth/logout"
                      className="ml-2 px-3 py-1 text-sm text-gray-700 hover:text-gray-900"
                    >
                      Log out
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="md:flex md:items-center md:justify-between mb-6">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
            <p className="mt-1 text-sm text-gray-500">Manage your profile and preferences.</p>
          </div>
        </div>
        
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          {/* Settings Forms */}
          <div className="px-4 py-5 sm:p-6">
            <form onSubmit={handleSaveSettings}>
              {/* Profile Settings */}
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                {/* Profile Image */}
                <div className="sm:col-span-6">
                  <div className="flex items-center">
                    <div className="mr-4">
                      {settings.profileImage ? (
                        <img 
                          src={settings.profileImage}
                          alt={settings.displayName || 'User'}
                          className="h-16 w-16 rounded-full"
                        />
                      ) : (
                        <div className="h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center">
                          <span className="text-indigo-600 text-xl font-medium">
                            {settings.displayName ? settings.displayName.charAt(0).toUpperCase() : 'U'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Display Name */}
                <div className="sm:col-span-3">
                  <label htmlFor="displayName" className="block text-sm font-medium text-gray-700">
                    Display Name
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="displayName"
                      id="displayName"
                      value={settings.displayName}
                      onChange={handleInputChange}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                {/* Email - Disabled/Read Only */}
                <div className="sm:col-span-3">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email Address
                  </label>
                  <div className="mt-1">
                    <input
                      type="email"
                      name="email"
                      id="email"
                      value={settings.email}
                      disabled
                      className="bg-gray-50 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md cursor-not-allowed"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Email is managed through your Auth0 account settings.
                  </p>
                </div>
              </div>
              
              {/* Save Button and Status Messages */}
              <div className="pt-5 border-t border-gray-200 mt-6 flex justify-end">
                {/* Success Message */}
                {saveSuccess && (
                  <span className="inline-flex items-center mr-4 px-3 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    <svg className="-ml-1 mr-1.5 h-4 w-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Settings saved successfully!
                  </span>
                )}
                
                {/* Error Message */}
                {saveError && (
                  <span className="inline-flex items-center mr-4 px-3 py-0.5 rounded-full text-sm font-medium bg-red-100 text-red-800">
                    <svg className="-ml-1 mr-1.5 h-4 w-4 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    {saveError}
                  </span>
                )}
                
                <button
                  type="button"
                  className="mr-3 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  onClick={() => {
                    // Reset settings to initial state
                    setSettings({
                      displayName: user.name || '',
                      email: user.email || '',
                      profileImage: user.picture || null,
                    });
                  }}
                >
                  Reset
                </button>
                <button
                  type="submit"
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}