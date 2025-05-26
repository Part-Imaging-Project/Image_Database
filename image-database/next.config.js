/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactStrictMode: true,
  // swcMinify: true, // Remove this line as it's causing warnings
  images: {
    domains: ['lh3.googleusercontent.com', 's.gravatar.com'],
  },
};

module.exports = nextConfig;