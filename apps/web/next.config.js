/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    transpilePackages: ['@privy-io/react-auth'],
    webpack: (config) => {
        config.externals.push("pino-pretty", "lokijs", "encoding");
        return config;
    },
};

module.exports = nextConfig;
