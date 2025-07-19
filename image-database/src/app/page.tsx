'use client';

import React from 'react';
import Link from 'next/link';
import { useUser, SignInButton } from '@clerk/nextjs';

// Add inline styles to ensure styling works regardless of Tailwind configuration
const styles = {
  navLink: {
    color: 'white',
    marginRight: '1.5rem',
    textDecoration: 'none',
    fontWeight: 500
  },
  button: {
    backgroundColor: '#0078D4', // Azure blue
    color: 'white',
    padding: '0.5rem 1rem',
    borderRadius: '0.375rem',
    textDecoration: 'none',
    fontWeight: 500,
    display: 'inline-block'
  },
  heading: {
    fontSize: '3rem',
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: '1rem',
    lineHeight: 1.2
  },
  subtext: {
    fontSize: '1.125rem',
    color: '#4B5563',
    marginBottom: '2rem'
  }
};

const HeroSection: React.FC = () => {
  const { isLoaded, isSignedIn, user } = useUser();

  return (
    <>
      {/* Professional navigation using basic HTML and inline styles */}
      <nav style={{ padding: '1rem 0', backgroundColor: '#1a1a1a', color: 'white' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white', textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
            <div style={{ width: '32px', height: '32px', backgroundColor: '#0078D4', borderRadius: '4px', marginRight: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '16px' }}>ID</span>
            </div>
            ImageDB
          </Link>
          
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Link href="/dashboard" style={{ color: 'white', marginRight: '1.5rem', textDecoration: 'none' }}>
              Dashboard
            </Link>
            <Link href="/gallery" style={{ color: 'white', marginRight: '1.5rem', textDecoration: 'none' }}>
              Gallery
            </Link>
            <Link href="/upload" style={{ color: 'white', marginRight: '1.5rem', textDecoration: 'none' }}>
              Upload
            </Link>
            <Link href="/settings" style={{ color: 'white', marginRight: '1.5rem', textDecoration: 'none' }}>
            
            </Link>
            
            {!isLoaded ? (
              <div style={{ height: '2.5rem', width: '7rem', backgroundColor: '#4B5563', borderRadius: '0.375rem' }}></div>
            ) : isSignedIn ? (
              <Link
                href="/dashboard"
                style={{ backgroundColor: '#0078D4', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.375rem', textDecoration: 'none' }}
              >
                My Dashboard
              </Link>
            ) : (
              <SignInButton mode="modal">
                <button style={{ backgroundColor: '#0078D4', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: 'none', cursor: 'pointer' }}>
                  Sign In
                </button>
              </SignInButton>
            )}
          </div>
        </div>
      </nav>

      {/* Hero content focused on Image Database system */}
      <div style={{ backgroundColor: 'white', padding: '4rem 1rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 600px', paddingRight: '2rem' }}>
            <h1 style={{ fontSize: '3rem', fontWeight: 'bold', color: '#111827', marginBottom: '1rem', maxWidth: '800px' }}>
              Centralized Image Database Management
            </h1>
            <p style={{ fontSize: '1.125rem', color: '#4B5563', marginBottom: '2rem', maxWidth: '800px', lineHeight: '1.6' }}>
              Streamline your part imaging workflow with our robust system. Store, organize, and retrieve images with comprehensive metadata for ERP integration and AI processing.
            </p>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              {isSignedIn ? (
                <Link 
                  href="/dashboard"
                  style={{ backgroundColor: '#0078D4', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '0.375rem', textDecoration: 'none', fontWeight: '500', display: 'inline-block' }}
                >
                  Go to Dashboard
                </Link>
              ) : (
                <SignInButton mode="modal">
                  <button style={{ backgroundColor: '#0078D4', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '0.375rem', textDecoration: 'none', fontWeight: '500', display: 'inline-block', border: 'none', cursor: 'pointer' }}>
                    Get Started
                  </button>
                </SignInButton>
              )}
              <a 
                href="/demo" 
                style={{ backgroundColor: 'white', color: '#0078D4', padding: '0.75rem 1.5rem', borderRadius: '0.375rem', textDecoration: 'none', fontWeight: '500', display: 'inline-block', border: '1px solid #0078D4' }}
              >
                View Demo
              </a>
            </div>
            
            <div style={{ marginTop: '3rem', display: 'flex', gap: '1.5rem' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#0078D4' }}>10K+</div>
                <div style={{ fontSize: '0.875rem', color: '#6B7280' }}>Images Stored</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#0078D4' }}>99.9%</div>
                <div style={{ fontSize: '0.875rem', color: '#6B7280' }}>Uptime</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#0078D4' }}>5TB</div>
                <div style={{ fontSize: '0.875rem', color: '#6B7280' }}>Storage Capacity</div>
              </div>
            </div>
          </div>
          
          <div style={{ flex: '1 1 400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ 
              width: '100%', 
              maxWidth: '450px', 
              height: '300px', 
              backgroundColor: '#F3F4F6', 
              borderRadius: '8px',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{ position: 'absolute', top: '20px', left: '20px', right: '20px', height: '40px', backgroundColor: '#E5E7EB', borderRadius: '4px' }}></div>
              
              <div style={{ 
                position: 'absolute', 
                top: '80px', 
                left: '20px', 
                width: '120px', 
                height: '80px', 
                backgroundColor: '#D1D5DB', 
                borderRadius: '4px' 
              }}></div>
              
              <div style={{ 
                position: 'absolute', 
                top: '80px', 
                left: '160px', 
                width: '120px', 
                height: '80px', 
                backgroundColor: '#D1D5DB', 
                borderRadius: '4px' 
              }}></div>
              
              <div style={{ 
                position: 'absolute', 
                top: '80px', 
                left: '300px', 
                width: '120px', 
                height: '80px', 
                backgroundColor: '#D1D5DB', 
                borderRadius: '4px' 
              }}></div>
              
              <div style={{ 
                position: 'absolute', 
                top: '180px', 
                left: '20px', 
                right: '20px', 
                height: '40px', 
                backgroundColor: '#E5E7EB', 
                borderRadius: '4px' 
              }}></div>
              
              <div style={{ 
                position: 'absolute', 
                top: '240px', 
                left: '20px', 
                width: '100px', 
                height: '30px', 
                backgroundColor: '#0078D4', 
                borderRadius: '4px' 
              }}></div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Feature highlights section */}
      <div style={{ backgroundColor: '#F9FAFB', padding: '3rem 1rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111827', marginBottom: '3rem' }}>
            Enterprise-Grade Image Management
          </h2>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', justifyContent: 'center' }}>
            <div style={{ flex: '1 1 250px', backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', color: '#111827' }}>Secure Storage</div>
              <p style={{ color: '#6B7280', fontSize: '1rem' }}>MinIO-backed cloud storage with automated backups and high availability.</p>
            </div>
            
            <div style={{ flex: '1 1 250px', backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', color: '#111827' }}>ERP Integration</div>
              <p style={{ color: '#6B7280', fontSize: '1rem' }}>Seamless connection to PostgreSQL database for part image management.</p>
            </div>
            
            <div style={{ flex: '1 1 250px', backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', color: '#111827' }}>AI Ready</div>
              <p style={{ color: '#6B7280', fontSize: '1rem' }}>Structured metadata and image formats optimized for AI training and recognition.</p>
            </div>
          </div>
        </div>
      </div>

      {/* User greeting section for signed-in users */}
      {isSignedIn && user && (
        <div style={{ backgroundColor: '#EBF8FF', padding: '2rem 1rem' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1A365D', marginBottom: '1rem' }}>
              Welcome back, {user.firstName || user.fullName || 'User'}!
            </h3>
            <p style={{ color: '#2D3748', marginBottom: '1.5rem' }}>
              Ready to manage your image database? Access your dashboard to view recent uploads and statistics.
            </p>
            <Link
              href="/dashboard"
              style={{ backgroundColor: '#0078D4', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '0.375rem', textDecoration: 'none', fontWeight: '500', display: 'inline-block' }}
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      )}
    </>
  );
};

export default HeroSection;