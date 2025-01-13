/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config) => {
        config.module.rules.push({
            test: /\.(pdf)$/,
            type: "asset/resource",
        },{
            test: /\.node/,
            use: "raw-loader"
        });

        return config;
    },
    async rewrites() {
        return [
          {
            source: '/api/:path*',
            destination: 'https://kb-isand.ipu.ru/:path*',
          },
        ];
      },
}

module.exports = nextConfig
