/**
 * linkedin-post.mjs
 * Posts today's scheduled article to LinkedIn (personal profile).
 * Called by GitHub Actions every Mon & Thu at 7:45 UTC (8:45 Paris CET).
 *
 * Required env vars:
 *   LINKEDIN_ACCESS_TOKEN  — OAuth 2.0 bearer token (60-day validity)
 *   LINKEDIN_PERSON_URN    — e.g. "urn:li:person:xxxxxxxx"
 *   SITE_URL               — e.g. "https://ekho.fr"
 *   POST_LANG              — "fr" or "en" (default: "fr")
 */

import { readFileSync } from 'fs';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Load articles (ES module, dynamic import) ──────────────────────────────
const { articles } = await import('../website/apps/web/src/data/articles.js');

const today    = new Date().toISOString().split('T')[0]; // "YYYY-MM-DD"
const lang     = process.env.POST_LANG || 'fr';
const siteUrl  = process.env.SITE_URL  || 'https://ekho.fr';
const token    = process.env.LINKEDIN_ACCESS_TOKEN;
const personUrn = process.env.LINKEDIN_PERSON_URN;

if (!token || !personUrn) {
  console.error('❌ Missing LINKEDIN_ACCESS_TOKEN or LINKEDIN_PERSON_URN');
  process.exit(1);
}

// ── Find today's article ───────────────────────────────────────────────────
const article = articles.find(a =>
  a.publishDate === today &&
  (lang === 'fr' ? (!a.lang || a.lang === 'fr') : a.lang === 'en')
);

if (!article) {
  console.log(`ℹ️  No article scheduled for ${today} (lang: ${lang}). Skipping.`);
  process.exit(0);
}

const articleUrl = `${siteUrl}/mag/${article.slug}`;

// ── Build post text ────────────────────────────────────────────────────────
const hashtags = lang === 'fr'
  ? '#ContentCreator #International #VideoContent #EKHO #Stratégie'
  : '#ContentCreator #GlobalGrowth #VideoContent #EKHO #Strategy';

const postText = lang === 'fr'
  ? `${article.title}\n\n${article.excerpt}\n\n→ Lire l'article : ${articleUrl}\n\n${hashtags}`
  : `${article.title}\n\n${article.excerpt}\n\n→ Read the full article: ${articleUrl}\n\n${hashtags}`;

// ── LinkedIn ugcPosts payload ──────────────────────────────────────────────
const payload = {
  author: personUrn,
  lifecycleState: 'PUBLISHED',
  specificContent: {
    'com.linkedin.ugc.ShareContent': {
      shareCommentary: { text: postText },
      shareMediaCategory: 'ARTICLE',
      media: [
        {
          status: 'READY',
          description: { text: article.excerpt?.substring(0, 256) || '' },
          originalUrl: articleUrl,
          title: { text: article.title },
        },
      ],
    },
  },
  visibility: {
    'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
  },
};

// ── Post ───────────────────────────────────────────────────────────────────
console.log(`📤 Posting to LinkedIn [${lang.toUpperCase()}]: "${article.title}"`);

const res = await fetch('https://api.linkedin.com/v2/ugcPosts', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    'X-Restli-Protocol-Version': '2.0.0',
  },
  body: JSON.stringify(payload),
});

if (!res.ok) {
  const err = await res.text();
  console.error(`❌ LinkedIn API error ${res.status}:`, err);
  process.exit(1);
}

const result = await res.json();
console.log(`✅ Posted! LinkedIn post ID: ${result.id}`);
