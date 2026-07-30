/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [],
  },
  serverExternalPackages: ["@cursor/sdk"],
};

export default nextConfig;