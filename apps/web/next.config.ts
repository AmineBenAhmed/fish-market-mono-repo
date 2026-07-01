/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  images: {
    remotePatterns: [{ protocol: 'http', hostname: 'localhost', port: '4000' }],
  },
};

export default nextConfig;
