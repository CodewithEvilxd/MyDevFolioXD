import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/admin/', '/private/'],
    },
    sitemap: 'https://my-dev-folio-xd.vercel.app/sitemap.xml',
    host: 'https://my-dev-folio-xd.vercel.app'
  }
}
