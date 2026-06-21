const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com", pathname: "/**" },
      { protocol: "https", hostname: "res.cloudinary.com", pathname: "/**" },
      { protocol: "https", hostname: "platform-lookaside.fbsbx.com", pathname: "/**" },
      { protocol: "https", hostname: "cdn-icons-png.flaticon.com", pathname: "/**" },
    ],
  },
};

export default nextConfig;