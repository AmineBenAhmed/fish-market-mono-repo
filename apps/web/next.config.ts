import path from 'path';

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [{ protocol: 'http', hostname: 'localhost', port: '4000' }],
  },
  outputFileTracingRoot: path.join(__dirname, '../../'),
  experimental: {
    prerenderEarlyExit: false,
  },
};

export default nextConfig;
