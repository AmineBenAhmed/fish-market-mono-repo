import path from 'path';

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [{ protocol: 'http', hostname: '178.162.242.127', port: '4000' }],
  },
  outputFileTracingRoot: path.join(__dirname, '../../'),
  experimental: {
    prerenderEarlyExit: false,
  },
};

export default nextConfig;
