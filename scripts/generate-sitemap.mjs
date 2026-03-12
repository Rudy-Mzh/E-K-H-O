/**
 * generate-sitemap.mjs
 * Generates public/sitemap.xml before the Vite build.
 * Only includes articles with publishDate <= today (build date).
 * Run via: node scripts/generate-sitemap.mjs
 */

import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SITE_URL = 'https://ekho-studio.com';
const today = new Date();
today.setHours(23, 59, 59, 999);

// ── Load articles ──────────────────────────────────────────────────────────
const { articles } = await import('../website/apps/web/src/data/articles.js');

const published = articles.filter(a => new Date(a.publishDate) <= today);

// ── Static pages ───────────────────────────────────────────────────────────
const staticPages = [
  { path: '/',         priority: '1.0', changefreq: 'weekly'  },
  { path: '/demos',    priority: '0.9', changefreq: 'weekly'  },
  { path: '/services', priority: '0.8', changefreq: 'monthly' },
  { path: '/pricing',  priority: '0.8', changefreq: 'monthly' },
  { path: '/about',    priority: '0.7', changefreq: 'monthly' },
  { path: '/mag',      priority: '0.9', changefreq: 'weekly'  },
  { path: '/contact',  priority: '0.6', changefreq: 'monthly' },
];

// ── Build XML ──────────────────────────────────────────────────────────────
const urls = [
  ...staticPages.map(p => `
  <url>
    <loc>${SITE_URL}${p.path}</loc>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
    <lastmod>${today.toISOString().split('T')[0]}</lastmod>
  </url>`),

  ...published.map(a => `
  <url>
    <loc>${SITE_URL}/mag/${a.slug}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
    <lastmod>${a.publishDate}</lastmod>
    ${a.lang === 'en' ? '<xhtml:link rel="alternate" hreflang="en-US" href="' + SITE_URL + '/mag/' + a.slug + '"/>' : '<xhtml:link rel="alternate" hreflang="fr" href="' + SITE_URL + '/mag/' + a.slug + '"/>'}
  </url>`),
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join('')}
</urlset>`;

const outPath = resolve(__dirname, '../website/apps/web/public/sitemap.xml');
writeFileSync(outPath, xml, 'utf8');

console.log(`✅ sitemap.xml generated — ${staticPages.length} static pages + ${published.length} articles`);
