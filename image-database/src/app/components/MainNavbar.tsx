// src/app/components/MainNavbar.tsx
"use client";

import { SignInButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import React from "react";

const MainNavbar: React.FC = () => {
  const { isLoaded, isSignedIn } = useUser();

  return (
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
          ImageDB
        </Link>

        <div style={{ display: "flex", alignItems: "center" }}>
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
      </div>
    </nav>
  );
};

export default MainNavbar;
