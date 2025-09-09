// src/app/components/MainNavbar.tsx
"use client";

import { SignInButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import React, { useState } from "react";

const MainNavbar: React.FC = () => {
  const { isLoaded, isSignedIn } = useUser();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <style jsx>{`
        .mobile-only {
          display: none;
        }
        .desktop-only {
          display: flex;
        }
        .mobile-menu {
          display: none;
        }
        .brand-text {
          display: block;
        }
        
        @media (max-width: 767px) {
          .mobile-only {
            display: block;
          }
          .desktop-only {
            display: none;
          }
          .mobile-menu {
            display: ${isMobileMenuOpen ? 'block' : 'none'};
          }
        }
        
        @media (max-width: 479px) {
          .brand-text {
            display: none;
          }
        }
      `}</style>
      
      <nav
        style={{ padding: "1rem 0", backgroundColor: "#1a1a1a", color: "white" }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "0 1rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Link
            href="/"
            style={{
              fontSize: "1.5rem",
              fontWeight: "bold",
              color: "white",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
            }}
          >
            <div
              style={{
                width: "32px",
                height: "32px",
                backgroundColor: "#0078D4",
                borderRadius: "4px",
                marginRight: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span style={{ fontSize: "16px" }}>ID</span>
            </div>
            <span className="brand-text">ImageDB</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="desktop-only" style={{ alignItems: "center" }}>
            <Link
              href="/dashboard"
              style={{
                color: "white",
                marginRight: "1.5rem",
                textDecoration: "none",
              }}
            >
              Dashboard
            </Link>
            <Link
              href="/gallery"
              style={{
                color: "white",
                marginRight: "1.5rem",
                textDecoration: "none",
              }}
            >
              Gallery
            </Link>
            <Link
              href="/upload"
              style={{
                color: "white",
                marginRight: "1.5rem",
                textDecoration: "none",
              }}
            >
              Upload
            </Link>

            {!isLoaded ? (
              <div
                style={{
                  height: "2.5rem",
                  width: "7rem",
                  backgroundColor: "#4B5563",
                  borderRadius: "0.375rem",
                }}
              ></div>
            ) : (
              <SignInButton
                mode="modal"
                forceRedirectUrl="/dashboard"
                signUpForceRedirectUrl="/dashboard"
              >
                <button
                  style={{
                    backgroundColor: "#0078D4",
                    color: "white",
                    padding: "0.5rem 1rem",
                    borderRadius: "0.375rem",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Sign In
                </button>
              </SignInButton>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="mobile-only"
            style={{
              background: "transparent",
              border: "none",
              color: "white",
              fontSize: "1.5rem",
              cursor: "pointer",
              padding: "0.5rem",
            }}
          >
            {isMobileMenuOpen ? "✕" : "☰"}
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          className="mobile-menu"
          style={{
            backgroundColor: "#2D3748",
            padding: "1rem",
            borderTop: "1px solid #4A5568",
          }}
        >
          <Link
            href="/dashboard"
            style={{
              color: "white",
              display: "block",
              padding: "0.75rem 0",
              textDecoration: "none",
              borderBottom: "1px solid #4A5568",
            }}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Dashboard
          </Link>
          <Link
            href="/gallery"
            style={{
              color: "white",
              display: "block",
              padding: "0.75rem 0",
              textDecoration: "none",
              borderBottom: "1px solid #4A5568",
            }}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Gallery
          </Link>
          <Link
            href="/upload"
            style={{
              color: "white",
              display: "block",
              padding: "0.75rem 0",
              textDecoration: "none",
              borderBottom: "1px solid #4A5568",
            }}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Upload
          </Link>
          <div style={{ paddingTop: "1rem" }}>
            {!isLoaded ? (
              <div
                style={{
                  height: "2.5rem",
                  backgroundColor: "#4B5563",
                  borderRadius: "0.375rem",
                }}
              ></div>
            ) : (
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
                    border: "none",
                    cursor: "pointer",
                    width: "100%",
                  }}
                >
                  Sign In
                </button>
              </SignInButton>
            )}
          </div>
        </div>
      </nav>
    </>
  );
};

export default MainNavbar;
