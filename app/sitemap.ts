import type { MetadataRoute } from 'next'

const BASE = 'https://superbuilder.org'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url:              BASE,
      lastModified:     new Date(),
      changeFrequency:  'daily',
      priority:         1,
    },
    {
      url:              `${BASE}/terms`,
      lastModified:     new Date('2026-04-01'),
      changeFrequency:  'monthly',
      priority:         0.3,
    },
  ]
}
