import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public", // Where the service worker files will be generated
  disable: process.env.NODE_ENV === "development", // Disable PWA in dev mode so it doesn't mess with hot-reloading
  register: true,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Your existing Next.js config goes here (if any)
};

export default withPWA(nextConfig);