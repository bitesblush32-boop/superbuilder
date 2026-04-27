import type { MetadataRoute } from 'next'

const BASE = 'https://www.superbuilder.org'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url:             BASE,
      lastModified:    new Date(),
      changeFrequency: 'daily',
      priority:        1.0,
    },
    {
      url:             `${BASE}/terms`,
      lastModified:    new Date('2026-04-01'),
      changeFrequency: 'monthly',
      priority:        0.3,
    },
    {
      url:             `${BASE}/sign-in`,
      lastModified:    new Date('2026-04-01'),
      changeFrequency: 'monthly',
      priority:        0.4,
    },
    {
      url:             `${BASE}/sign-up`,
      lastModified:    new Date('2026-04-01'),
      changeFrequency: 'monthly',
      priority:        0.5,
    },
    {
      url:             `${BASE}/verify-parent`,
      lastModified:    new Date('2026-04-01'),
      changeFrequency: 'monthly',
      priority:        0.2,
    },
  ]
}
