import React from 'react';
import { Helmet } from 'react-helmet';

const SITE_URL = 'https://ekho-studio.com';
const SITE_NAME = 'EKHO Studio';
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-ekho.jpg`;

/**
 * SEOHead — centralized SEO metadata component
 *
 * Props:
 *   title        {string}  Page title (already formatted)
 *   description  {string}  Meta description
 *   canonical    {string}  Path, e.g. "/demos" (without domain)
 *   ogImage      {string}  Full URL to OG image
 *   lang         {string}  "fr" | "en" (default: "fr")
 *   article      {object}  Article object for /mag/:slug pages
 *   jsonLd       {object}  JSON-LD structured data
 */
const SEOHead = ({
  title,
  description,
  canonical = '/',
  ogImage = DEFAULT_OG_IMAGE,
  lang = 'fr',
  article = null,
  jsonLd = null,
}) => {
  const canonicalUrl = `${SITE_URL}${canonical}`;
  const locale       = lang === 'en' ? 'en_US' : 'fr_FR';
  const htmlLang     = article?.lang === 'en' ? 'en' : lang;

  // Alternate URLs for hreflang
  const frUrl = article
    ? `${SITE_URL}/mag/${article.slug}`     // article page — own URL is definitive
    : `${SITE_URL}${canonical}`;
  const enUrl = article
    ? `${SITE_URL}/mag/${article.slug}`
    : `${SITE_URL}${canonical}?lang=en`;

  return (
    <Helmet>
      {/* Language */}
      <html lang={htmlLang} />

      {/* Core */}
      <title>{title}</title>
      <meta name="description" content={description} />

      {/* Canonical */}
      <link rel="canonical" href={canonicalUrl} />

      {/* Hreflang — FR + EN-US + x-default */}
      {!article && (
        <>
          <link rel="alternate" hreflang="fr"      href={frUrl} />
          <link rel="alternate" hreflang="en-US"   href={enUrl} />
          <link rel="alternate" hreflang="x-default" href={frUrl} />
        </>
      )}
      {article && article.lang === 'en' && (
        <link rel="alternate" hreflang="en-US" href={canonicalUrl} />
      )}
      {article && article.lang !== 'en' && (
        <link rel="alternate" hreflang="fr" href={canonicalUrl} />
      )}

      {/* Open Graph */}
      <meta property="og:site_name"   content={SITE_NAME} />
      <meta property="og:type"        content={article ? 'article' : 'website'} />
      <meta property="og:title"       content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image"       content={ogImage} />
      <meta property="og:url"         content={canonicalUrl} />
      <meta property="og:locale"      content={locale} />

      {/* Article-specific OG */}
      {article && (
        <>
          <meta property="article:published_time" content={article.publishDate} />
          <meta property="article:section"        content={article.category} />
          <meta property="article:author"         content={SITE_NAME} />
          {article.tags?.map(tag => (
            <meta property="article:tag" content={tag} key={tag} />
          ))}
        </>
      )}

      {/* Twitter Card */}
      <meta name="twitter:card"        content="summary_large_image" />
      <meta name="twitter:site"        content="@ekho_studio" />
      <meta name="twitter:title"       content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image"       content={ogImage} />

      {/* JSON-LD Structured Data */}
      {jsonLd && (Array.isArray(jsonLd) ? jsonLd : [jsonLd]).map((schema, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
};

// ── Pre-built JSON-LD schemas ──────────────────────────────────────────────

export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/og-ekho.jpg`,
  description: 'EKHO Studio adapts video content to new markets by preserving the original voice, tone and energy in a new language.',
  foundingDate: '2024',
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer support',
    availableLanguage: ['French', 'English'],
  },
  sameAs: [
    'https://www.linkedin.com/company/ekho-studio',
  ],
};

export const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_NAME,
  url: SITE_URL,
  potentialAction: {
    '@type': 'SearchAction',
    target: `${SITE_URL}/mag?q={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
};

export const articleSchema = (article) => ({
  '@context': 'https://schema.org',
  '@type': 'BlogPosting',
  headline: article.title,
  description: article.excerpt,
  image: article.coverImage,
  datePublished: article.publishDate,
  dateModified: article.publishDate,
  author: {
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
  },
  publisher: {
    '@type': 'Organization',
    name: SITE_NAME,
    logo: {
      '@type': 'ImageObject',
      url: `${SITE_URL}/og-ekho.jpg`,
    },
  },
  mainEntityOfPage: {
    '@type': 'WebPage',
    '@id': `${SITE_URL}/mag/${article.slug}`,
  },
  keywords: article.tags?.join(', '),
  inLanguage: article.lang === 'en' ? 'en-US' : 'fr-FR',
  articleSection: article.category,
});

export default SEOHead;
