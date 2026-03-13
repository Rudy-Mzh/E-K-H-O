import React from 'react';
import { Helmet } from 'react-helmet';

const SITE_URL  = 'https://ekho-studio.com';
const SITE_NAME = 'EKHO Studio';
// TODO: remplacer par og-ekho.jpg (1200×630px, fond sombre, logo EKHO centré)
const DEFAULT_OG_IMAGE = `${SITE_URL}/rudy.jpg`;

/**
 * SEOHead — centralized SEO metadata component
 *
 * Props:
 *   title          {string}  Page title (already formatted)
 *   description    {string}  Meta description (150–160 chars ideally)
 *   canonical      {string}  Path, e.g. "/demos" (without domain)
 *   ogImage        {string}  Full URL to OG image (1200×630)
 *   lang           {string}  "fr" | "en" (default: "fr")
 *   keywords       {string}  Comma-separated keywords
 *   article        {object}  Article object for /mag/:slug pages
 *   articlePairSlug {string} Slug of the paired FR↔EN article
 *   jsonLd         {object|array}  JSON-LD structured data
 *   noindex        {boolean} Set true to block indexing (default false)
 */
const SEOHead = ({
  title,
  description,
  canonical   = '/',
  ogImage     = DEFAULT_OG_IMAGE,
  lang        = 'fr',
  keywords    = '',
  article     = null,
  articlePairSlug = null,
  jsonLd      = null,
  noindex     = false,
}) => {
  const canonicalUrl = `${SITE_URL}${canonical}`;
  const locale       = lang === 'en' ? 'en_US' : 'fr_FR';
  const htmlLang     = article?.lang === 'en' ? 'en' : lang;

  // Default keywords par langue si non fournis
  const defaultKeywords = lang === 'en'
    ? 'video adaptation, multilingual content, voice adaptation, content localization, EKHO Studio'
    : 'adaptation vidéo, contenu multilingue, adaptation vocale, localisation contenu, EKHO Studio';
  const metaKeywords = keywords || defaultKeywords;

  // Hreflang logic
  const frUrl = article
    ? `${SITE_URL}/mag/${article.slug}`
    : `${SITE_URL}${canonical}`;
  const enUrl = article
    ? (articlePairSlug ? `${SITE_URL}/mag/${articlePairSlug}` : `${SITE_URL}/mag/${article.slug}`)
    : `${SITE_URL}${canonical}?lang=en`;

  return (
    <Helmet>
      {/* Language */}
      <html lang={htmlLang} />

      {/* Core */}
      <title>{title}</title>
      <meta name="description"  content={description} />
      <meta name="keywords"     content={metaKeywords} />
      <meta name="author"       content={SITE_NAME} />
      <meta name="robots"       content={noindex ? 'noindex, nofollow' : 'index, follow'} />
      <meta name="theme-color"  content="#7B2FFF" />

      {/* Canonical */}
      <link rel="canonical" href={canonicalUrl} />

      {/* Hreflang */}
      {!article && (
        <>
          <link rel="alternate" hreflang="fr"        href={frUrl} />
          <link rel="alternate" hreflang="en-US"     href={enUrl} />
          <link rel="alternate" hreflang="x-default" href={frUrl} />
        </>
      )}
      {article && (
        <>
          {/* Self-reference */}
          <link
            rel="alternate"
            hreflang={article.lang === 'en' ? 'en-US' : 'fr'}
            href={canonicalUrl}
          />
          {/* Cross-reference paired translation */}
          {articlePairSlug && (
            <link
              rel="alternate"
              hreflang={article.lang === 'en' ? 'fr' : 'en-US'}
              href={`${SITE_URL}/mag/${articlePairSlug}`}
            />
          )}
          {/* x-default points to FR version */}
          <link
            rel="alternate"
            hreflang="x-default"
            href={article.lang === 'en' && articlePairSlug
              ? `${SITE_URL}/mag/${articlePairSlug}`
              : canonicalUrl}
          />
        </>
      )}

      {/* Open Graph */}
      <meta property="og:site_name"   content={SITE_NAME} />
      <meta property="og:type"        content={article ? 'article' : 'website'} />
      <meta property="og:title"       content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image"       content={ogImage} />
      <meta property="og:image:width"  content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:url"         content={canonicalUrl} />
      <meta property="og:locale"      content={locale} />
      {lang === 'fr' && <meta property="og:locale:alternate" content="en_US" />}
      {lang === 'en' && <meta property="og:locale:alternate" content="fr_FR" />}

      {/* Article-specific OG */}
      {article && (
        <>
          <meta property="article:published_time" content={article.publishDate} />
          <meta property="article:modified_time"  content={article.publishDate} />
          <meta property="article:section"        content={article.category} />
          <meta property="article:author"         content="Rudy Mezoughi — EKHO Studio" />
          {article.tags?.map(tag => (
            <meta property="article:tag" content={tag} key={tag} />
          ))}
        </>
      )}

      {/* Twitter / X Card */}
      <meta name="twitter:card"        content="summary_large_image" />
      <meta name="twitter:site"        content="@ekho_studio" />
      <meta name="twitter:creator"     content="@ekho_studio" />
      <meta name="twitter:title"       content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image"       content={ogImage} />
      <meta name="twitter:image:alt"   content={title} />

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
  logo: {
    '@type': 'ImageObject',
    url: `${SITE_URL}/og-ekho.jpg`,
    width: 1200,
    height: 630,
  },
  description: 'EKHO Studio adapte les vidéos pour de nouveaux marchés en préservant la voix, le ton et l\'énergie originels dans une nouvelle langue.',
  foundingDate: '2024',
  founder: {
    '@type': 'Person',
    name: 'Rudy Mezoughi',
    jobTitle: 'Fondateur & CEO',
    url: `${SITE_URL}/about`,
  },
  contactPoint: {
    '@type': 'ContactPoint',
    email: 'rudy.m@ekho-studio.com',
    contactType: 'customer service',
    availableLanguage: ['French', 'English'],
  },
  areaServed: ['FR', 'US', 'GB', 'BE', 'CH', 'CA'],
  sameAs: [
    'https://www.linkedin.com/company/ekho-studio',
  ],
};

export const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_NAME,
  url: SITE_URL,
  inLanguage: ['fr-FR', 'en-US'],
  potentialAction: {
    '@type': 'SearchAction',
    target: `${SITE_URL}/mag?q={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
};

export const personSchema = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Rudy Mezoughi',
  jobTitle: 'Fondateur & CEO',
  worksFor: {
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
  },
  url: `${SITE_URL}/about`,
  image: `${SITE_URL}/rudy.jpg`,
  sameAs: [
    'https://www.linkedin.com/in/rudy-mezoughi',
  ],
};

export const articleSchema = (article, pairSlug = null) => ({
  '@context': 'https://schema.org',
  '@type': 'BlogPosting',
  headline: article.title,
  description: article.excerpt,
  image: {
    '@type': 'ImageObject',
    url: article.coverImage,
    width: 1200,
    height: 630,
  },
  datePublished: `${article.publishDate}T08:45:00+01:00`,
  dateModified:  `${article.publishDate}T08:45:00+01:00`,
  author: {
    '@type': 'Person',
    name: 'Rudy Mezoughi',
    url: `${SITE_URL}/about`,
  },
  publisher: {
    '@type': 'Organization',
    name: SITE_NAME,
    logo: {
      '@type': 'ImageObject',
      url: `${SITE_URL}/og-ekho.jpg`,
      width: 1200,
      height: 630,
    },
  },
  mainEntityOfPage: {
    '@type': 'WebPage',
    '@id': `${SITE_URL}/mag/${article.slug}`,
  },
  keywords: article.tags?.join(', '),
  inLanguage: article.lang === 'en' ? 'en-US' : 'fr-FR',
  articleSection: article.category,
  ...(pairSlug && {
    translationOfWork: {
      '@type': 'BlogPosting',
      '@id': `${SITE_URL}/mag/${pairSlug}`,
    },
  }),
});

export default SEOHead;
