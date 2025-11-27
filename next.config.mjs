import { withNetlify } from "@netlify/next";

/** @type {import('next').NextConfig} */
const nextConfig = withNetlify({
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true, // keep if you don’t want Netlify Image Optimization
  },
  reactStrictMode: true,
  output: "standalone", // ensures server components work
});

export default nextConfig;
