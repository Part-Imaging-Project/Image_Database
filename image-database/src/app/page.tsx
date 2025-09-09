// src/app/page.tsx
'use client';

import { SignInButton, useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';
import MainNavbar from './components/MainNavbar';

const HeroSection: React.FC = () => {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();

  // Auto-redirect authenticated users to dashboard
  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      router.push('/dashboard');
    }
  }, [isLoaded, isSignedIn, user, router]);

  // Don't render the homepage content if user is signed in (they'll be redirected)
  if (isLoaded && isSignedIn) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Redirecting to dashboard...</div>
          <div style={{ width: '3rem', height: '3rem', border: '3px solid #f3f3f3', borderTop: '3px solid #0078D4', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }}></div>
        </div>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <>
      <style jsx>{`
        .hero-container {
          background-color: white;
          padding: 2rem 1rem;
        }
        .hero-content {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }
        .hero-text {
          flex: 1;
        }
        .hero-title {
          font-size: 2rem;
          font-weight: bold;
          color: #111827;
          margin-bottom: 1rem;
          line-height: 1.2;
        }
        .hero-description {
          font-size: 1rem;
          color: #4B5563;
          margin-bottom: 2rem;
          line-height: 1.6;
        }
        .tech-stack {
          display: flex;
          gap: 1rem;
          align-items: center;
          flex-wrap: wrap;
          margin-top: 1.5rem;
        }
        .tech-stack img {
          height: 32px;
          filter: grayscale(30%);
        }
        .dashboard-preview {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: 1rem;
        }
        .preview-container {
          width: 100%;
          max-width: 400px;
          height: 280px;
          background-color: #F3F4F6;
          border-radius: 8px;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
          position: relative;
          overflow: hidden;
        }
        .section-padding {
          padding: 3rem 1rem;
        }
        .features-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.5rem;
          justify-items: center;
        }
        .feature-card {
          background-color: white;
          padding: 1.5rem;
          border-radius: 8px;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
          width: 100%;
          max-width: 350px;
        }
        .tech-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 2rem;
          justify-items: center;
          margin-bottom: 2rem;
        }
        .tech-item {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .tech-item img {
          height: 48px;
          margin-bottom: 0.5rem;
        }
        .cta-section {
          background-color: #1F2937;
          padding: 3rem 1rem;
          color: white;
          text-align: center;
        }
        .cta-title {
          font-size: 1.75rem;
          font-weight: bold;
          margin-bottom: 1rem;
        }
        .cta-description {
          font-size: 1rem;
          color: #D1D5DB;
          margin-bottom: 2rem;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
        }

        @media (min-width: 768px) {
          .hero-container {
            padding: 4rem 1rem;
          }
          .hero-content {
            flex-direction: row;
            align-items: center;
          }
          .hero-text {
            padding-right: 2rem;
          }
          .hero-title {
            font-size: 2.5rem;
          }
          .hero-description {
            font-size: 1.125rem;
          }
          .tech-stack img {
            height: 40px;
          }
          .preview-container {
            height: 350px;
            max-width: 450px;
          }
          .section-padding {
            padding: 4rem 1rem;
          }
          .features-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .tech-grid {
            grid-template-columns: repeat(4, 1fr);
            gap: 3rem;
          }
          .tech-item img {
            height: 60px;
          }
          .cta-title {
            font-size: 2.25rem;
          }
          .cta-description {
            font-size: 1.125rem;
          }
        }

        @media (min-width: 1024px) {
          .hero-title {
            font-size: 3rem;
          }
          .features-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
      `}</style>

      {/* Navigation Component */}
      <MainNavbar />

      {/* Hero content */}
      <div className="hero-container">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              Centralized Image Database Management
            </h1>
            <p className="hero-description">
              Streamline your part imaging workflow with our robust system. Store, organize, and retrieve images with comprehensive metadata for ERP integration and AI processing.
            </p>
            
            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
              <SignInButton 
                mode="modal"
                forceRedirectUrl="/dashboard"
                signUpForceRedirectUrl="/dashboard"
              >
                <button style={{ backgroundColor: '#0078D4', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '0.375rem', textDecoration: 'none', fontWeight: '500', display: 'inline-block', border: 'none', cursor: 'pointer' }}>
                  Get Started
                </button>
              </SignInButton>
            </div>

            {/* Technology Stack */}
            <div style={{ marginTop: '1.5rem' }}>
              <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#6B7280', marginBottom: '1rem' }}>
                Built with Modern Technologies
              </div>
              <div className="tech-stack">
                <img 
                  src="/react.png" 
                  alt="React" 
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <img 
                  src="/postgres.png" 
                  alt="PostgreSQL" 
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <img 
                  src="/expressjs.png" 
                  alt="Express.js" 
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <img 
                  src="/minio.png" 
                  alt="MinIO" 
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            </div>
          </div>
          
          {/* Dashboard Preview Mockup */}
          <div className="dashboard-preview">
            <div className="preview-container">
              {/* Header bar */}
              <div style={{ position: 'absolute', top: '20px', left: '20px', right: '20px', height: '40px', backgroundColor: '#E5E7EB', borderRadius: '4px', display: 'flex', alignItems: 'center', paddingLeft: '15px' }}>
                <div style={{ width: '20px', height: '20px', backgroundColor: '#0078D4', borderRadius: '2px', marginRight: '10px' }}></div>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>ImageDB Dashboard</div>
              </div>
              
              {/* Image grid mockup */}
              <div style={{ 
                position: 'absolute', 
                top: '80px', 
                left: '20px', 
                width: '80px', 
                height: '60px', 
                backgroundColor: '#D1D5DB', 
                borderRadius: '4px',
                backgroundImage: 'linear-gradient(45deg, #D1D5DB 25%, transparent 25%, transparent 75%, #D1D5DB 75%), linear-gradient(45deg, #D1D5DB 25%, transparent 25%, transparent 75%, #D1D5DB 75%)',
                backgroundSize: '15px 15px',
                backgroundPosition: '0 0, 7px 7px'
              }}></div>
              
              <div style={{ 
                position: 'absolute', 
                top: '80px', 
                left: '120px', 
                width: '80px', 
                height: '60px', 
                backgroundColor: '#D1D5DB', 
                borderRadius: '4px',
                backgroundImage: 'linear-gradient(45deg, #D1D5DB 25%, transparent 25%, transparent 75%, #D1D5DB 75%), linear-gradient(45deg, #D1D5DB 25%, transparent 25%, transparent 75%, #D1D5DB 75%)',
                backgroundSize: '15px 15px',
                backgroundPosition: '0 0, 7px 7px'
              }}></div>
              
              <div style={{ 
                position: 'absolute', 
                top: '80px', 
                right: '20px', 
                width: '80px', 
                height: '60px', 
                backgroundColor: '#D1D5DB', 
                borderRadius: '4px',
                backgroundImage: 'linear-gradient(45deg, #D1D5DB 25%, transparent 25%, transparent 75%, #D1D5DB 75%), linear-gradient(45deg, #D1D5DB 25%, transparent 25%, transparent 75%, #D1D5DB 75%)',
                backgroundSize: '15px 15px',
                backgroundPosition: '0 0, 7px 7px'
              }}></div>
              
              {/* Action button */}
              <div style={{ 
                position: 'absolute', 
                top: '180px', 
                left: '20px', 
                width: '100px', 
                height: '32px', 
                backgroundColor: '#0078D4', 
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <div style={{ fontSize: '11px', color: 'white', fontWeight: '500' }}>Upload Images</div>
              </div>

              {/* Small chart mockup */}
              <div style={{ 
                position: 'absolute', 
                top: '180px', 
                right: '20px', 
                width: '120px', 
                height: '32px', 
                backgroundColor: '#F3F4F6', 
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'end',
                justifyContent: 'space-around',
                padding: '4px'
              }}>
                <div style={{ width: '6px', height: '12px', backgroundColor: '#0078D4', borderRadius: '1px' }}></div>
                <div style={{ width: '6px', height: '20px', backgroundColor: '#10B981', borderRadius: '1px' }}></div>
                <div style={{ width: '6px', height: '16px', backgroundColor: '#F59E0B', borderRadius: '1px' }}></div>
                <div style={{ width: '6px', height: '24px', backgroundColor: '#8B5CF6', borderRadius: '1px' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Enhanced feature highlights section */}
      <div style={{ backgroundColor: '#F9FAFB' }} className="section-padding">
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* Technology Stack Section */}
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '1rem' }}>
              Built with Enterprise Technologies
            </h2>
            <p style={{ fontSize: '1rem', color: '#6B7280', marginBottom: '2rem' }}>
              Powered by industry-leading open-source technologies for reliability and performance
            </p>
            
            {/* Tech Stack Icons */}
            <div className="tech-grid">
              <div className="tech-item">
                <img 
                  src="/react.png" 
                  alt="React" 
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <span style={{ fontSize: '0.875rem', color: '#6B7280', fontWeight: '500' }}>React</span>
              </div>
              
              <div className="tech-item">
                <img 
                  src="/postgres.png" 
                  alt="PostgreSQL" 
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <span style={{ fontSize: '0.875rem', color: '#6B7280', fontWeight: '500' }}>PostgreSQL</span>
              </div>
              
              <div className="tech-item">
                <img 
                  src="/expressjs.png" 
                  alt="Express.js" 
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <span style={{ fontSize: '0.875rem', color: '#6B7280', fontWeight: '500' }}>Express.js</span>
              </div>
              
              <div className="tech-item">
                <img 
                  src="/minio.png" 
                  alt="MinIO" 
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <span style={{ fontSize: '0.875rem', color: '#6B7280', fontWeight: '500' }}>MinIO</span>
              </div>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="features-grid">
            <div className="feature-card">
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ width: '40px', height: '40px', backgroundColor: '#EBF8FF', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '1rem' }}>
                  <svg style={{ width: '24px', height: '24px', color: '#0078D4' }} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm12 12V8H4v8h12z" clipRule="evenodd"/>
                  </svg>
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827' }}>Secure Storage</div>
              </div>
              <p style={{ color: '#6B7280', fontSize: '1rem', lineHeight: '1.5' }}>
                MinIO-backed cloud storage with automated backups and high availability for enterprise-grade reliability.
              </p>
            </div>
            
            <div className="feature-card">
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ width: '40px', height: '40px', backgroundColor: '#F0FDF4', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '1rem' }}>
                  <svg style={{ width: '24px', height: '24px', color: '#10B981' }} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
                  </svg>
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827' }}>ERP Integration</div>
              </div>
              <p style={{ color: '#6B7280', fontSize: '1rem', lineHeight: '1.5' }}>
                Seamless connection to PostgreSQL database for part image management and ERP system integration.
              </p>
            </div>
            
            <div className="feature-card">
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ width: '40px', height: '40px', backgroundColor: '#FEF3C7', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '1rem' }}>
                  <svg style={{ width: '24px', height: '24px', color: '#F59E0B' }} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd"/>
                  </svg>
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827' }}>AI Ready</div>
              </div>
              <p style={{ color: '#6B7280', fontSize: '1rem', lineHeight: '1.5' }}>
                Structured metadata and image formats optimized for AI training and automated recognition systems.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action Section */}
      <div className="cta-section">
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 className="cta-title">
            Ready to Transform Your Image Management?
          </h2>
          <p className="cta-description">
            Join the digital transformation in manufacturing. Start organizing your part images with enterprise-grade tools today.
          </p>
          <SignInButton 
            mode="modal"
            forceRedirectUrl="/dashboard"
            signUpForceRedirectUrl="/dashboard"
          >
            <button style={{ 
              backgroundColor: '#0078D4', 
              color: 'white', 
              padding: '1rem 2rem', 
              borderRadius: '0.5rem', 
              fontSize: '1.125rem',
              fontWeight: '600',
              border: 'none', 
              cursor: 'pointer',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}>
              Get Started Free
            </button>
          </SignInButton>
        </div>
      </div>
    </>
  );
};

export default HeroSection;