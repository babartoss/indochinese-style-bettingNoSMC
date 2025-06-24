const isProduction = process.env.NODE_ENV === 'production';
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://localhost:3000';

const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
          {
            key: 'Content-Security-Policy',
            value: isProduction
              ? `default-src 'self'; script-src 'self' https://esm.sh; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self' https://api.neynar.com https://mainnet.infura.io wss://mainnet.infura.io ${baseUrl};`
              : `default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://esm.sh; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self' https://api.neynar.com https://mainnet.infura.io wss://mainnet.infura.io ${baseUrl};`,
          },
        ],
      },
    ];
  },
};

export default nextConfig;