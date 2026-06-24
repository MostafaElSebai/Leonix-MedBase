import withPWAInit, { runtimeCaching as defaultCache } from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public", // Where the service worker files will be generated
  disable: process.env.NODE_ENV === "development", // Disable PWA in dev mode so it doesn't mess with hot-reloading
  register: true,
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  workboxOptions: {
    // Tell the precache to ignore the "id" query parameter so that static profiles load perfectly offline
    ignoreURLParametersMatching: [/^utm_/, /^fbclid$/, /^id$/, /^patientId$/],
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
      {
        // Match the RSC requests for our static profile pages
        urlPattern: ({ request, url }) => {
          const isRSC = request.headers.get('RSC') === '1';
          const isProfile = /^\/(patients\/profile|visits\/view)/i.test(url.pathname);
          return isRSC && isProfile;
        },
        handler: 'NetworkFirst',
        options: {
          cacheName: 'offline-profiles-rsc',
          matchOptions: {
            ignoreSearch: true,
          },
        },
      },
      {
        // Match the HTML requests for our static profile pages
        urlPattern: /^\/(patients\/profile|visits\/view)/i,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'offline-profiles-html',
          matchOptions: {
            ignoreSearch: true,
          },
        },
      },
      ...defaultCache,
    ],
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Your existing Next.js config goes here (if any)
};

export default withPWA(nextConfig);