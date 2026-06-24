import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public", // Where the service worker files will be generated
  disable: process.env.NODE_ENV === "development", // Disable PWA in dev mode so it doesn't mess with hot-reloading
  register: true,
  workboxOptions: {
    // This is CRITICAL for production. We absolutely DO NOT want the Service Worker 
    // to cache any Supabase API calls or WatermelonDB sync calls, otherwise the app 
    // will think it successfully synced data when it really just talked to its own cache!
    runtimeCaching: [
      {
        urlPattern: /\/api\/sync/i,
        handler: 'NetworkOnly',
        options: {
          cacheName: 'api-sync-bypass',
        },
      },
      {
        urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
        handler: 'NetworkOnly',
        options: {
          cacheName: 'supabase-bypass',
        },
      },
    ],
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Your existing Next.js config goes here (if any)
};

export default withPWA(nextConfig);