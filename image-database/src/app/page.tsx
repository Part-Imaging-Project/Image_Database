// src/app/page.tsx
"use client";

import { SignInButton, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import MainNavbar from "./components/MainNavbar";

const HeroSection: React.FC = () => {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();

  // Auto-redirect authenticated users to dashboard
  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      router.push("/dashboard");
    }
  }, [isLoaded, isSignedIn, user, router]);

  // Don't render the homepage content if user is signed in (they'll be redirected)
  if (isLoaded && isSignedIn) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
            Redirecting to dashboard...
          </div>
          <div
            style={{
              width: "3rem",
              height: "3rem",
              border: "3px solid #f3f3f3",
              borderTop: "3px solid #0078D4",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto",
            }}
          ></div>
        </div>
        <style jsx>{`
          @keyframes spin {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    );
  }

  return (
    <>
      {/* Navigation Component */}
      <MainNavbar />

      {/* Hero content */}
      <div style={{ backgroundColor: "white", padding: "4rem 1rem" }}>
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            display: "flex",
            flexDirection: "row",
            flexWrap: "wrap",
          }}
        >
          <div style={{ flex: "1 1 600px", paddingRight: "2rem" }}>
            <h1
              style={{
                fontSize: "3rem",
                fontWeight: "bold",
                color: "#111827",
                marginBottom: "1rem",
                maxWidth: "800px",
              }}
            >
              Centralized Image Database Management
            </h1>
            <p
              style={{
                fontSize: "1.125rem",
                color: "#4B5563",
                marginBottom: "2rem",
                maxWidth: "800px",
                lineHeight: "1.6",
              }}
            >
              Streamline your part imaging workflow with our robust system.
              Store, organize, and retrieve images with comprehensive metadata
              for ERP integration and AI processing.
            </p>

            {/* Action Buttons */}
            <div
              style={{
                display: "flex",
                gap: "1rem",
                flexWrap: "wrap",
                marginBottom: "3rem",
              }}
            >
              <SignInButton
                mode="modal"
                forceRedirectUrl="/dashboard"
                signUpForceRedirectUrl="/dashboard"
              >
                <button
                  style={{
                    backgroundColor: "#0078D4",
                    color: "white",
                    padding: "0.75rem 1.5rem",
                    borderRadius: "0.375rem",
                    textDecoration: "none",
                    fontWeight: "500",
                    display: "inline-block",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Get Started
                </button>
              </SignInButton>
            </div>

            {/* Technology Stack */}
            <div style={{ marginTop: "2rem" }}>
              <div
                style={{
                  fontSize: "0.875rem",
                  fontWeight: "600",
                  color: "#6B7280",
                  marginBottom: "1rem",
                }}
              >
                Built with Modern Technologies
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "1.5rem",
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                <img
                  src="/react.png"
                  alt="React"
                  style={{ height: "40px", filter: "grayscale(30%)" }}
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
                <img
                  src="/postgres.png"
                  alt="PostgreSQL"
                  style={{ height: "40px", filter: "grayscale(30%)" }}
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
                <img
                  src="/expressjs.png"
                  alt="Express.js"
                  style={{ height: "40px", filter: "grayscale(30%)" }}
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
                <img
                  src="/minio.png"
                  alt="MinIO"
                  style={{ height: "40px", filter: "grayscale(30%)" }}
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
            </div>
          </div>

          {/* Dashboard Preview Mockup */}
          <div
            style={{
              flex: "1 1 400px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: "100%",
                maxWidth: "450px",
                height: "350px",
                backgroundColor: "#F3F4F6",
                borderRadius: "8px",
                boxShadow:
                  "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Header bar */}
              <div
                style={{
                  position: "absolute",
                  top: "20px",
                  left: "20px",
                  right: "20px",
                  height: "40px",
                  backgroundColor: "#E5E7EB",
                  borderRadius: "4px",
                  display: "flex",
                  alignItems: "center",
                  paddingLeft: "15px",
                }}
              >
                <div
                  style={{
                    width: "20px",
                    height: "20px",
                    backgroundColor: "#0078D4",
                    borderRadius: "2px",
                    marginRight: "10px",
                  }}
                ></div>
                <div
                  style={{
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#374151",
                  }}
                >
                  ImageDB Dashboard
                </div>
              </div>

              {/* Image grid mockup */}
              <div
                style={{
                  position: "absolute",
                  top: "80px",
                  left: "20px",
                  width: "120px",
                  height: "80px",
                  backgroundColor: "#D1D5DB",
                  borderRadius: "4px",
                  backgroundImage:
                    "linear-gradient(45deg, #D1D5DB 25%, transparent 25%, transparent 75%, #D1D5DB 75%), linear-gradient(45deg, #D1D5DB 25%, transparent 25%, transparent 75%, #D1D5DB 75%)",
                  backgroundSize: "20px 20px",
                  backgroundPosition: "0 0, 10px 10px",
                }}
              ></div>

              <div
                style={{
                  position: "absolute",
                  top: "80px",
                  left: "160px",
                  width: "120px",
                  height: "80px",
                  backgroundColor: "#D1D5DB",
                  borderRadius: "4px",
                  backgroundImage:
                    "linear-gradient(45deg, #D1D5DB 25%, transparent 25%, transparent 75%, #D1D5DB 75%), linear-gradient(45deg, #D1D5DB 25%, transparent 25%, transparent 75%, #D1D5DB 75%)",
                  backgroundSize: "20px 20px",
                  backgroundPosition: "0 0, 10px 10px",
                }}
              ></div>

              <div
                style={{
                  position: "absolute",
                  top: "80px",
                  left: "300px",
                  width: "120px",
                  height: "80px",
                  backgroundColor: "#D1D5DB",
                  borderRadius: "4px",
                  backgroundImage:
                    "linear-gradient(45deg, #D1D5DB 25%, transparent 25%, transparent 75%, #D1D5DB 75%), linear-gradient(45deg, #D1D5DB 25%, transparent 25%, transparent 75%, #D1D5DB 75%)",
                  backgroundSize: "20px 20px",
                  backgroundPosition: "0 0, 10px 10px",
                }}
              ></div>

              {/* Action button */}
              <div
                style={{
                  position: "absolute",
                  top: "200px",
                  left: "20px",
                  width: "120px",
                  height: "40px",
                  backgroundColor: "#0078D4",
                  borderRadius: "4px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    fontSize: "12px",
                    color: "white",
                    fontWeight: "500",
                  }}
                >
                  Upload Images
                </div>
              </div>

              {/* Small chart mockup */}
              <div
                style={{
                  position: "absolute",
                  top: "200px",
                  right: "20px",
                  width: "150px",
                  height: "40px",
                  backgroundColor: "#F3F4F6",
                  borderRadius: "4px",
                  display: "flex",
                  alignItems: "end",
                  justifyContent: "space-around",
                  padding: "5px",
                }}
              >
                <div
                  style={{
                    width: "8px",
                    height: "15px",
                    backgroundColor: "#0078D4",
                    borderRadius: "1px",
                  }}
                ></div>
                <div
                  style={{
                    width: "8px",
                    height: "25px",
                    backgroundColor: "#10B981",
                    borderRadius: "1px",
                  }}
                ></div>
                <div
                  style={{
                    width: "8px",
                    height: "20px",
                    backgroundColor: "#F59E0B",
                    borderRadius: "1px",
                  }}
                ></div>
                <div
                  style={{
                    width: "8px",
                    height: "30px",
                    backgroundColor: "#8B5CF6",
                    borderRadius: "1px",
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced feature highlights section */}
      <div style={{ backgroundColor: "#F9FAFB", padding: "4rem 1rem" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          {/* Technology Stack Section */}
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <h2
              style={{
                fontSize: "1.875rem",
                fontWeight: "bold",
                color: "#111827",
                marginBottom: "1rem",
              }}
            >
              Built with Enterprise Technologies
            </h2>
            <p
              style={{
                fontSize: "1rem",
                color: "#6B7280",
                marginBottom: "2rem",
              }}
            >
              Powered by industry-leading open-source technologies for
              reliability and performance
            </p>

            {/* Tech Stack Icons */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "3rem",
                flexWrap: "wrap",
                marginBottom: "3rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <img
                  src="/react.png"
                  alt="React"
                  style={{ height: "60px", marginBottom: "0.5rem" }}
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
                <span
                  style={{
                    fontSize: "0.875rem",
                    color: "#6B7280",
                    fontWeight: "500",
                  }}
                >
                  React
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <img
                  src="/postgres.png"
                  alt="PostgreSQL"
                  style={{ height: "60px", marginBottom: "0.5rem" }}
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
                <span
                  style={{
                    fontSize: "0.875rem",
                    color: "#6B7280",
                    fontWeight: "500",
                  }}
                >
                  PostgreSQL
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <img
                  src="/expressjs.png"
                  alt="Express.js"
                  style={{ height: "60px", marginBottom: "0.5rem" }}
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
                <span
                  style={{
                    fontSize: "0.875rem",
                    color: "#6B7280",
                    fontWeight: "500",
                  }}
                >
                  Express.js
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <img
                  src="/minio.png"
                  alt="MinIO"
                  style={{ height: "60px", marginBottom: "0.5rem" }}
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
                <span
                  style={{
                    fontSize: "0.875rem",
                    color: "#6B7280",
                    fontWeight: "500",
                  }}
                >
                  MinIO
                </span>
              </div>
            </div>
          </div>

          {/* Feature Cards */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "2rem",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                flex: "1 1 280px",
                backgroundColor: "white",
                padding: "2rem",
                borderRadius: "8px",
                boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
                maxWidth: "350px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "1rem",
                }}
              >
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    backgroundColor: "#EBF8FF",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: "1rem",
                  }}
                >
                  <svg
                    style={{ width: "24px", height: "24px", color: "#0078D4" }}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm12 12V8H4v8h12z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div
                  style={{
                    fontSize: "1.25rem",
                    fontWeight: "bold",
                    color: "#111827",
                  }}
                >
                  Secure Storage
                </div>
              </div>
              <p
                style={{
                  color: "#6B7280",
                  fontSize: "1rem",
                  lineHeight: "1.5",
                }}
              >
                MinIO-backed cloud storage with automated backups and high
                availability for enterprise-grade reliability.
              </p>
            </div>

            <div
              style={{
                flex: "1 1 280px",
                backgroundColor: "white",
                padding: "2rem",
                borderRadius: "8px",
                boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
                maxWidth: "350px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "1rem",
                }}
              >
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    backgroundColor: "#F0FDF4",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: "1rem",
                  }}
                >
                  <svg
                    style={{ width: "24px", height: "24px", color: "#10B981" }}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                  </svg>
                </div>
                <div
                  style={{
                    fontSize: "1.25rem",
                    fontWeight: "bold",
                    color: "#111827",
                  }}
                >
                  ERP Integration
                </div>
              </div>
              <p
                style={{
                  color: "#6B7280",
                  fontSize: "1rem",
                  lineHeight: "1.5",
                }}
              >
                Seamless connection to PostgreSQL database for part image
                management and ERP system integration.
              </p>
            </div>

            <div
              style={{
                flex: "1 1 280px",
                backgroundColor: "white",
                padding: "2rem",
                borderRadius: "8px",
                boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
                maxWidth: "350px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "1rem",
                }}
              >
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    backgroundColor: "#FEF3C7",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: "1rem",
                  }}
                >
                  <svg
                    style={{ width: "24px", height: "24px", color: "#F59E0B" }}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div
                  style={{
                    fontSize: "1.25rem",
                    fontWeight: "bold",
                    color: "#111827",
                  }}
                >
                  AI Ready
                </div>
              </div>
              <p
                style={{
                  color: "#6B7280",
                  fontSize: "1rem",
                  lineHeight: "1.5",
                }}
              >
                Structured metadata and image formats optimized for AI training
                and automated recognition systems.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action Section */}
      <div
        style={{
          backgroundColor: "#1F2937",
          padding: "4rem 1rem",
          color: "white",
        }}
      >
        <div
          style={{ maxWidth: "1200px", margin: "0 auto", textAlign: "center" }}
        >
          <h2
            style={{
              fontSize: "2.25rem",
              fontWeight: "bold",
              marginBottom: "1rem",
            }}
          >
            Ready to Transform Your Image Management?
          </h2>
          <p
            style={{
              fontSize: "1.125rem",
              color: "#D1D5DB",
              marginBottom: "2rem",
              maxWidth: "600px",
              margin: "0 auto 2rem",
            }}
          >
            Join the digital transformation in manufacturing. Start organizing
            your part images with enterprise-grade tools today.
          </p>
          <SignInButton
            mode="modal"
            forceRedirectUrl="/dashboard"
            signUpForceRedirectUrl="/dashboard"
          >
            <button
              style={{
                backgroundColor: "#0078D4",
                color: "white",
                padding: "1rem 2rem",
                borderRadius: "0.5rem",
                fontSize: "1.125rem",
                fontWeight: "600",
                border: "none",
                cursor: "pointer",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              }}
            >
              Get Started Free
            </button>
          </SignInButton>
        </div>
      </div>
    </>
  );
};

export default HeroSection;
