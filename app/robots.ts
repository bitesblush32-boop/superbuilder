import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard/',
          '/admin/',
          '/api/',
          '/sign-in',
          '/sign-up',
          '/stage-locked',
        ],
      },
    ],
    sitemap: 'https://superbuilder.org/sitemap.xml',
    host:    'https://superbuilder.org',
  }
}
