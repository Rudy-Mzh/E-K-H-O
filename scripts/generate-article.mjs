/**
 * generate-article.mjs
 * Calls Claude API to generate a new FR + EN article pair.
 * Appends them to articles.js with the next available Mon/Thu publication date.
 * Called by GitHub Actions (e.g. every Sunday at 22:00 UTC).
 *
 * Required env vars:
 *   ANTHROPIC_API_KEY  — Claude API key
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ARTICLES_PATH = resolve(__dirname, '../website/apps/web/src/data/articles.js');

// ── Helpers ────────────────────────────────────────────────────────────────
function nextMonThu(fromDate) {
  const d = new Date(fromDate);
  d.setDate(d.getDate() + 1);
  while (![1, 4].includes(d.getDay())) d.setDate(d.getDate() + 1); // 1=Mon, 4=Thu
  return d.toISOString().split('T')[0];
}

function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// ── Load current articles to find last ID and last date ───────────────────
const raw = readFileSync(ARTICLES_PATH, 'utf8');
const idMatches    = [...raw.matchAll(/^\s+id:\s+(\d+),/gm)].map(m => parseInt(m[1]));
const dateMatches  = [...raw.matchAll(/^\s+publishDate:\s+'(\d{4}-\d{2}-\d{2})'/gm)].map(m => m[1]);

const lastId   = Math.max(...idMatches);
const lastDate = dateMatches.sort().at(-1);
const nextDate = nextMonThu(lastDate);

const newIdFr = lastId + 1;
const newIdEn = lastId + 2;

const apiKey = process.env.ANTHROPIC_API_KEY;
if (!apiKey) {
  console.error('❌ Missing ANTHROPIC_API_KEY');
  process.exit(1);
}

// ── EKHO content themes ────────────────────────────────────────────────────
const themes = [
  "content creators who want to reach Spanish-speaking markets",
  "e-commerce brands expanding internationally via video",
  "fitness coaches missing the English-speaking market",
  "podcasters who want to grow beyond their native language",
  "course creators multiplying revenue through localization",
  "how voice adaptation affects trust and conversion",
  "the ROI of multilingual content for YouTube creators",
  "why dubbing beats subtitles for engagement",
  "personal branding across language barriers",
  "the silent cost of creating content in only one language",
  "how TikTok's algorithm rewards multilingual content",
  "Instagram Reels and the multilingual growth hack",
  "the Canadian French market: an untapped opportunity",
  "why your best video performs 10x better in another language",
  "building an international audience from zero",
];

// Pick a random theme not already covered
const theme = themes[Math.floor(Math.random() * themes.length)];

console.log(`🤖 Generating article on theme: "${theme}"`);

// ── Call Claude API ────────────────────────────────────────────────────────
const systemPrompt = `You are a content strategist for EKHO Studio, a French company that helps content creators, coaches, and e-commerce brands adapt their video content to other languages while preserving the original voice, tone, and energy. Write high-quality, insightful editorial articles for "Le Mag", EKHO's content publication. Articles should be practical, concrete, slightly provocative in tone, and always connect back to the value of multilingual content adaptation (not translation). Never sound like an ad. Always sound like editorial.`;

const userPrompt = `Generate a bilingual article pair (French + English) about: ${theme}

Return ONLY valid JSON with this exact structure:
{
  "fr": {
    "title": "Article title in French",
    "excerpt": "2-sentence excerpt in French (150 chars max)",
    "category": "Stratégie" or "Secteurs" or "Conseils pratiques",
    "readTime": 5,
    "tags": ["tag1", "tag2", "tag3"],
    "coverImageQuery": "unsplash search query for a relevant cover image (in English)",
    "content": "Full HTML article content with <h2> sections and <p> tags (800-1200 words in French)"
  },
  "en": {
    "title": "Article title in English",
    "excerpt": "2-sentence excerpt in English (150 chars max)",
    "category": "Strategy" or "Industries" or "Practical tips",
    "readTime": 5,
    "tags": ["tag1", "tag2", "tag3"],
    "coverImageQuery": "unsplash search query for a relevant cover image",
    "content": "Full HTML article content with <h2> sections and <p> tags (800-1200 words in English)"
  }
}`;

const response = await fetch('https://api.anthropic.com/v1/messages', {
  method: 'POST',
  headers: {
    'x-api-key': apiKey,
    'anthropic-version': '2023-06-01',
    'content-type': 'application/json',
  },
  body: JSON.stringify({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 4096,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  }),
});

if (!response.ok) {
  console.error('❌ Claude API error:', await response.text());
  process.exit(1);
}

const data = await response.json();
const jsonText = data.content[0].text.trim();

// Strip markdown code block if present
const cleanJson = jsonText.replace(/^```json\n?/, '').replace(/\n?```$/, '');
const generated = JSON.parse(cleanJson);

// ── Build Unsplash cover URL ───────────────────────────────────────────────
const frCover = `https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=1200&q=80`; // fallback
const enCover = frCover;

// ── Format new articles ────────────────────────────────────────────────────
const frSlug = slugify(generated.fr.title);
const enSlug = slugify(generated.en.title);

const frArticle = `  {
    id: ${newIdFr},
    slug: '${frSlug}',
    title: '${generated.fr.title.replace(/'/g, "\\'")}',
    excerpt: '${generated.fr.excerpt.replace(/'/g, "\\'")}',
    category: '${generated.fr.category}',
    readTime: ${generated.fr.readTime},
    publishDate: '${nextDate}',
    coverImage: '${frCover}',
    tags: ${JSON.stringify(generated.fr.tags)},
    content: \`${generated.fr.content.replace(/`/g, '\\`')}\`,
  }`;

const enArticle = `  {
    id: ${newIdEn},
    slug: '${enSlug}',
    lang: 'en',
    title: '${generated.en.title.replace(/'/g, "\\'")}',
    excerpt: '${generated.en.excerpt.replace(/'/g, "\\'")}',
    category: '${generated.en.category}',
    readTime: ${generated.en.readTime},
    publishDate: '${nextDate}',
    coverImage: '${enCover}',
    tags: ${JSON.stringify(generated.en.tags)},
    content: \`${generated.en.content.replace(/`/g, '\\`')}\`,
  }`;

// ── Append to articles.js ──────────────────────────────────────────────────
const updated = raw.replace(
  /\];\s*$/,
  `,\n${frArticle},\n${enArticle},\n];\n`
);

writeFileSync(ARTICLES_PATH, updated, 'utf8');

console.log(`✅ Added articles #${newIdFr} (FR) and #${newIdEn} (EN) — publishDate: ${nextDate}`);
console.log(`   FR: "${generated.fr.title}"`);
console.log(`   EN: "${generated.en.title}"`);
