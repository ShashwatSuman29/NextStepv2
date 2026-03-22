import type { NextConfig } from 'next'
import { withSentryConfig } from '@sentry/nextjs'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
}

export default withSentryConfig(nextConfig, {
  // Sentry build options
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // Only upload source maps in production with valid auth token
  silent: !process.env.CI,
  authToken: process.env.SENTRY_AUTH_TOKEN,

  // Source maps: don't expose to client
  sourcemaps: {
    deleteSourcemapsAfterUpload: true,
  },

  // Don't widen source maps upload (avoid large build artifacts)
  widenClientFileUpload: false,
})
