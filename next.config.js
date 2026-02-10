/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // We'll keep linting in build; disable only if you want faster CI.
    ignoreDuringBuilds: false,
  },
};

module.exports = nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost', 'websevix.com', 'dashboard.websevix.com'],
  },
  async rewrites() {
    return [
      {
        source: '/dashboard',
        destination: '/dashboard',
      },
    ];
  },
}

module.exports = nextConfig
