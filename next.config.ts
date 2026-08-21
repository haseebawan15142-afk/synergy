/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
      },
      {
        protocol: "https",
        hostname: "storage.googleapis.com",
      },
      {
        protocol: "https",
        hostname: "synergy-9ea81.firebasestorage.app",
      },
      {
        protocol: "https",
        hostname: "synergy.net.pk",
      },
      {
        protocol: "https",
        hostname: "www.synergy.net.pk",
      },
    ],
  },
  experimental: {
    optimizePackageImports: ["framer-motion", "lucide-react"],
  },
  serverExternalPackages: ["ffmpeg-static", "firebase-admin", "isomorphic-dompurify", "jsdom"],
  poweredByHeader: false,
  compress: true,
  async redirects() {
    return [
      {
        source: "/services/microsoft-365-cloud",
        destination: "/services",
        permanent: true,
      },
      {
        source: "/services/managed-it",
        destination: "/services",
        permanent: true,
      },
      {
        source: "/industries",
        destination: "/services",
        permanent: true,
      },
      {
        source: "/industries/:slug",
        destination: "/services",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
