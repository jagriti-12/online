/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
      },
      {
        protocol: 'http',
        hostname: '*',
      },
    ],
  },
};

module.exports = nextConfig;


// Do change in next config file for adding image from other hostnames!Like cloudinary, stack, etc.