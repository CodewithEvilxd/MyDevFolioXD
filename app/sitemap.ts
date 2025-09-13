import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  // Base URLs
  const baseUrl = 'https://my-dev-folio-xd.vercel.app'

  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 1,
    }
  ]

  // Dynamic user pages would be generated from database/API
  // For now, we'll include some example popular developer usernames
  const popularUsers = [
    'torvalds', // Linux creator
    'gaearon', // React maintainer
    'tj', // Node.js maintainer
    'sindresorhus', // Popular npm packages
    'addyosmani', // Google Chrome team
    'paulirish', // Chrome DevTools
    'getify', // JavaScript expert
    'btholt', // Developer educator
    'kentcdodds', // React Testing Library
    'mxstbr', // Styled Components
  ]

  const userPages = popularUsers.map(username => ({
    url: `${baseUrl}/${username}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }))

  return [...staticPages, ...userPages]
}
