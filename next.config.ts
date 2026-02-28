import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Frame-Options",        value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy",        value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy",     value: "camera=(), microphone=(), geolocation=()" },
  {
    key: "Content-Security-Policy",
    // unsafe-inline and unsafe-eval are required by Next.js's own runtime.
    // These can be tightened with nonces in a future hardening pass.
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "font-src 'self' data: fonts.gstatic.com",
      "img-src 'self' data:",
      "connect-src 'self'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  // Produces a self-contained server.js + minimal node_modules in .next/standalone/
  // Used by both Docker builds and the Azure App Service zip deployment.
  output: "export",
  basePath: '/gis_mt',
  assetPrefix: '/gis_mt/',
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
