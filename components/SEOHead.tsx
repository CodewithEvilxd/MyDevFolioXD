import Head from 'next/head';
import { useLanguage } from '@/lib/LanguageContext';

interface SEOHeadProps {
  title?: string;
  description?: string;
  username?: string;
  avatar?: string;
  bio?: string;
  skills?: string[];
  projects?: number;
  followers?: number;
  stars?: number;
}

export default function SEOHead({
  title,
  description,
  username,
  avatar,
  bio,
  skills = [],
  projects = 0,
  followers = 0,
  stars = 0
}: SEOHeadProps) {
  const { language } = useLanguage();

  const defaultTitle = title || 'MyDevFolioXD | Developer Portfolio';
  const defaultDescription = description || 'Create stunning developer portfolios from GitHub profiles with AI-powered insights';

  const portfolioTitle = username ? `${username} - Developer Portfolio | MyDevFolioXD` : defaultTitle;
  const portfolioDescription = bio || `Explore ${username}'s developer portfolio with ${projects} projects, ${stars} stars, and expertise in ${skills.slice(0, 3).join(', ')}`;

  const canonicalUrl = username ? `https://mydevfolioxd.com/${username}` : 'https://mydevfolioxd.com';

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{portfolioTitle}</title>
      <meta name="description" content={portfolioDescription} />
      <meta name="keywords" content={`developer, portfolio, ${username || 'github'}, ${skills.join(', ')}, programming, coding`} />
      <meta name="author" content={username || 'MyDevFolioXD'} />
      <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
      <meta name="language" content={language} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="profile" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={portfolioTitle} />
      <meta property="og:description" content={portfolioDescription} />
      <meta property="og:image" content={avatar || 'https://mydevfolioxd.com/MyDevFolioXDOG.png'} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={`${username || 'Developer'} Portfolio`} />
      <meta property="og:site_name" content="MyDevFolioXD" />
      <meta property="og:locale" content={`${language}_${language.toUpperCase()}`} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={canonicalUrl} />
      <meta property="twitter:title" content={portfolioTitle} />
      <meta property="twitter:description" content={portfolioDescription} />
      <meta property="twitter:image" content={avatar || 'https://mydevfolioxd.com/MyDevFolioXDOG.png'} />
      <meta property="twitter:image:alt" content={`${username || 'Developer'} Portfolio`} />

      {/* Additional SEO Meta Tags */}
      <meta name="theme-color" content="#8b5cf6" />
      <meta name="msapplication-TileColor" content="#8b5cf6" />
      <meta name="application-name" content="MyDevFolioXD" />

      {/* Structured Data (JSON-LD) */}
      {username && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ProfilePage",
              "mainEntity": {
                "@type": "Person",
                "name": username,
                "description": bio,
                "image": avatar,
                "sameAs": [
                  `https://github.com/${username}`,
                  canonicalUrl
                ],
                "knowsAbout": skills,
                "hasOccupation": {
                  "@type": "Occupation",
                  "name": "Software Developer",
                  "skills": skills.join(', ')
                },
                "mainEntityOfPage": {
                  "@type": "WebPage",
                  "@id": canonicalUrl
                }
              },
              "publisher": {
                "@type": "Organization",
                "name": "MyDevFolioXD",
                "url": "https://mydevfolioxd.com"
              }
            })
          }}
        />
      )}

      {/* Portfolio-specific structured data */}
      {username && projects > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ItemList",
              "name": `${username}'s Projects`,
              "description": `Portfolio projects by ${username}`,
              "numberOfItems": projects,
              "url": canonicalUrl
            })
          }}
        />
      )}

      {/* Breadcrumbs */}
      {username && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              "itemListElement": [
                {
                  "@type": "ListItem",
                  "position": 1,
                  "name": "Home",
                  "item": "https://mydevfolioxd.com"
                },
                {
                  "@type": "ListItem",
                  "position": 2,
                  "name": username,
                  "item": canonicalUrl
                }
              ]
            })
          }}
        />
      )}
    </Head>
  );
}