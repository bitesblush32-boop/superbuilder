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
    sitemap: 'https://www.superbuilder.org/sitemap.xml',
    host:    'https://www.superbuilder.org',
  }
}
