/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone", // needed for server components / App Router
  images: {
    unoptimized: true, // optional, avoids Netlify image optimization issues
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
