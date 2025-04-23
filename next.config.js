/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import("./src/env.js");

/** @type {import("next").NextConfig} */
const config = {
  async headers() {
    return [
      {
        // Static assets - maximize caching with immutable directive
        source: '/:path*.(jpg|jpeg|gif|png|svg|ico|webp|woff|woff2)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Next.js static files - these have content hashes, maximize caching
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Next.js data files - maximize CDN caching with long stale-while-revalidate
        source: '/_next/data/:path*',
        headers: [
          {
            key: 'Cache-Control',
            // Short browser cache (30 min) but very long CDN cache (1 week) with generous stale period
            value: 'public, max-age=1800, s-maxage=604800, stale-while-revalidate=604800',
          },
        ],
      },
      {
        // API routes - balance freshness with caching to reduce function executions
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            // Short browser cache (1 min) but long CDN cache (1 day) with generous stale period
            value: 'public, max-age=60, s-maxage=86400, stale-while-revalidate=86400',
          },
        ],
      },
      {
        // HTML/dynamic pages - longer CDN caching to reduce serverless function calls
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            // Short browser cache (5 min) but very long CDN cache (1 day) with generous stale period
            value: 'public, max-age=300, s-maxage=86400, stale-while-revalidate=86400',
          },
        ],
      },
    ];
  },

  // Optimize build output
  swcMinify: true,
  
  // Reduce image optimization costs by setting reasonable defaults
  images: {
    minimumCacheTTL: 86400, // 1 day minimum cache for optimized images
    deviceSizes: [640, 750, 828, 1080, 1200], // Fewer sizes = fewer variants to generate
    imageSizes: [16, 32, 48, 64, 96], // Fewer sizes = fewer variants to generate
  },
};

export default config;
