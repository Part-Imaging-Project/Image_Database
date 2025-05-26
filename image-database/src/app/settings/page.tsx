'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import Link from 'next/link';
import { useState } from 'react';

// Interface for user settings
interface UserSettings {
  displayName: string;
  email: string;
  notificationEmail: string;
  profileImage: string | null;
  language: string;
  theme: string;
  emailNotifications: {
    uploads: boolean;
    comments: boolean;
    system: boolean;
  };
}

export default function Settings() {
  const { user, error, isLoading } = useUser();
  const [activeTab, setActiveTab] = useState('profile');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  
  // Initial settings state populated with user data
  const [settings, setSettings] = useState<UserSettings>({
    displayName: '',
    email: '',
    notificationEmail: '',
    profileImage: null,
    language: 'en',
    theme: 'light',
    emailNotifications: {
      uploads: true,
      comments: true,
      system: true,
    }
  });

  // Update settings state with user data once loaded
  if (user && settings.displayName === '') {
    setSettings({
      ...settings,
      displayName: user.name || '',
      email: user.email || '',
      notificationEmail: user.email || '',
      profileImage: user.picture || null,
    });
  }

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      const notificationKey = name.split('.')[1]; // Extract the key from format "emailNotifications.key"
      
      setSettings({
        ...settings,
        emailNotifications: {
          ...settings.emailNotifications,
          [notificationKey]: checkbox.checked
        }
      });
    } else {
      setSettings({
        ...settings,
        [name]: value
      });
    }
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
          {/* Settings Navigation Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('profile')}
                className={`${
                  activeTab === 'profile'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Profile
              </button>
              <button
                onClick={() => setActiveTab('notifications')}
                className={`${
                  activeTab === 'notifications'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Notifications
              </button>
              <button
                onClick={() => setActiveTab('preferences')}
                className={`${
                  activeTab === 'preferences'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Preferences
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`${
                  activeTab === 'security'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Security
              </button>
            </nav>
          </div>
          
          {/* Settings Forms */}
          <div className="px-4 py-5 sm:p-6">
            <form onSubmit={handleSaveSettings}>
              {/* Profile Settings */}
              <div className={activeTab === 'profile' ? 'block' : 'hidden'}>
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
                      <div>
                        <button
                          type="button"
                          className="ml-5 bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          Change
                        </button>
                        {settings.profileImage && (
                          <button
                            type="button"
                            className="ml-3 bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            onClick={() => setSettings({ ...settings, profileImage: null })}
                          >
                            Remove
                          </button>
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

                  {/* Notification Email */}
                  <div className="sm:col-span-3">
                    <label htmlFor="notificationEmail" className="block text-sm font-medium text-gray-700">
                      Notification Email
                    </label>
                    <div className="mt-1">
                      <input
                        type="email"
                        name="notificationEmail"
                        id="notificationEmail"
                        value={settings.notificationEmail}
                        onChange={handleInputChange}
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Where we'll send notifications if different from your login email.
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Notification Settings */}
              <div className={activeTab === 'notifications' ? 'block' : 'hidden'}>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Email Notifications</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Choose what information you want to receive via email.
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="emailNotifications.uploads"
                          name="emailNotifications.uploads"
                          type="checkbox"
                          checked={settings.emailNotifications.uploads}
                          onChange={handleInputChange}
                          className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="emailNotifications.uploads" className="font-medium text-gray-700">
                          Image Upload Notifications
                        </label>
                        <p className="text-gray-500">
                          Get notified when image processing is complete or fails.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="emailNotifications.comments"
                          name="emailNotifications.comments"
                          type="checkbox"
                          checked={settings.emailNotifications.comments}
                          onChange={handleInputChange}
                          className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="emailNotifications.comments" className="font-medium text-gray-700">
                          Comments and Mentions
                        </label>
                        <p className="text-gray-500">
                          Receive notifications when someone comments on or mentions your uploads.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="emailNotifications.system"
                          name="emailNotifications.system"
                          type="checkbox"
                          checked={settings.emailNotifications.system}
                          onChange={handleInputChange}
                          className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="emailNotifications.system" className="font-medium text-gray-700">
                          System Notifications
                        </label>
                        <p className="text-gray-500">
                          Important announcements and system updates.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Preferences Settings */}
              <div className={activeTab === 'preferences' ? 'block' : 'hidden'}>
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  {/* Language Preference */}
                  <div className="sm:col-span-3">
                    <label htmlFor="language" className="block text-sm font-medium text-gray-700">
                      Language
                    </label>
                    <div className="mt-1">
                      <select
                        id="language"
                        name="language"
                        value={settings.language}
                        onChange={handleInputChange}
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      >
                        <option value="en">English</option>
                        <option value="es">Español</option>
                        <option value="fr">Français</option>
                        <option value="de">Deutsch</option>
                        <option value="zh">中文</option>
                      </select>
                    </div>
                  </div>
                  
                  {/* Theme Selection */}
                  <div className="sm:col-span-3">
                    <label htmlFor="theme" className="block text-sm font-medium text-gray-700">
                      Theme
                    </label>
                    <div className="mt-1">
                      <select
                        id="theme"
                        name="theme"
                        value={settings.theme}
                        onChange={handleInputChange}
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      >
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                        <option value="system">System Default</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Security Settings */}
              <div className={activeTab === 'security' ? 'block' : 'hidden'}>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Account Security</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Manage your password and account security settings.
                    </p>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-5">
                    <h3 className="text-sm font-medium text-gray-700">Change Password</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Password management is handled through Auth0.
                    </p>
                    <div className="mt-3">
                      <a
                        href="https://manage.auth0.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Go to Auth0 Dashboard
                      </a>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-5">
                    <h3 className="text-sm font-medium text-gray-700">Account Activity</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      View recent login activity and active sessions.
                    </p>
                    <div className="mt-3">
                      <button
                        type="button"
                        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        View Activity Log
                      </button>
                    </div>
                  </div>
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
                      notificationEmail: user.email || '',
                      profileImage: user.picture || null,
                      language: 'en',
                      theme: 'light',
                      emailNotifications: {
                        uploads: true,
                        comments: true,
                        system: true,
                      }
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