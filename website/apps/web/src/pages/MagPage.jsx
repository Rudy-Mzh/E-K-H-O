import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Clock, ArrowRight, ArrowUpRight } from 'lucide-react';
import SEOHead from '@/components/SEOHead.jsx';
import { articles } from '@/data/articles.js';

// ── Category color map ────────────────────────────────────────────────────────
const catColor = {
  'Stratégie':          'bg-orange-500/15 text-orange-400 border-orange-500/30',
  'Strategy':           'bg-orange-500/15 text-orange-400 border-orange-500/30',
  'Secteurs':           'bg-red-500/15 text-red-400 border-red-500/30',
  'Industries':         'bg-red-500/15 text-red-400 border-red-500/30',
  'Conseils pratiques': 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  'Practical tips':     'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
};

// ── Article Card ──────────────────────────────────────────────────────────────
const Card = ({ article, featured = false, index = 0 }) => (
  <motion.article
    initial={{ opacity: 0, y: 8 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-40px' }}
    transition={{ duration: 0.5, delay: (index % 6) * 0.07 }}
    className={`group relative bg-[#111] rounded-2xl overflow-hidden border border-white/[0.06] hover:border-orange-500/50 transition-all duration-500 hover:-translate-y-1 ${featured ? 'md:col-span-2' : ''}`}
  >
    <Link to={`/mag/${article.slug}`} className="block h-full">
      {/* Index label */}
      <span className="absolute top-4 right-4 z-20 text-[11px] font-mono text-white/20 select-none">
        {String(index + 1).padStart(2, '0')}
      </span>

      {/* Image */}
      <div className={`relative overflow-hidden ${featured ? 'h-80' : 'h-52'}`}>
        <img
          src={article.coverImage}
          alt={article.title}
          className="w-full h-full object-cover opacity-70 group-hover:opacity-95 group-hover:scale-105 transition-all duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-black/20 to-transparent" />
        <span className={`absolute top-4 left-4 text-[11px] font-bold px-3 py-1 rounded-full border ${catColor[article.category] || 'bg-white/10 text-white/60 border-white/20'}`}>
          {article.category}
        </span>
        {article.lang === 'en' && (
          <span className="absolute bottom-4 right-4 text-[10px] font-bold bg-electric-purple/80 text-white px-2 py-0.5 rounded uppercase tracking-widest">
            EN
          </span>
        )}
      </div>

      {/* Body */}
      <div className="p-6">
        <h3 className={`font-bold text-white group-hover:text-orange-400 transition-colors duration-300 leading-tight mb-3 ${featured ? 'text-2xl md:text-3xl' : 'text-[1.05rem]'}`}>
          {article.title}
        </h3>
        <p className="text-gray-500 text-sm leading-relaxed mb-5 line-clamp-2">{article.excerpt}</p>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-gray-600 text-xs">
            <Clock size={11} />
            {article.readTime} min
          </span>
          <span className="text-orange-400 text-sm font-semibold flex items-center gap-1 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300">
            Lire <ArrowRight size={13} />
          </span>
        </div>
      </div>
    </Link>
  </motion.article>
);

// ── Editorial Claim ───────────────────────────────────────────────────────────
const Claim = ({ children, rotate = '0deg', accent = false, big = false, className = '' }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.96 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true, margin: '-60px' }}
    style={{ transform: `rotate(${rotate})` }}
    className={`${accent ? 'border-l-4 border-orange-500 pl-5' : ''} ${className}`}
  >
    <p className={`font-black leading-tight ${big ? 'text-3xl md:text-5xl text-white' : 'text-xl md:text-2xl text-white/50'} ${accent ? 'text-white' : ''}`}>
      {children}
    </p>
  </motion.div>
);

// ── Marquee (scrolling claims strip) ─────────────────────────────────────────
const Marquee = ({ lang }) => {
  const items = lang === 'en'
    ? ['Your global market is waiting.', '3.2 billion people don\'t speak your language.', 'Stop translating. Start adapting.', 'Content that doesn\'t travel, doesn\'t live.', 'Your audience of tomorrow speaks another language.', 'Scale smart. Create once. Distribute everywhere.']
    : ['Ton marché global t\'attend.', '3,2 milliards de gens ne parlent pas ta langue.', 'Arrête de traduire. Commence à adapter.', 'Le contenu qui ne voyage pas, ne vit pas.', 'Ton audience de demain parle une autre langue.', 'Scale intelligent. Crée une fois. Distribue partout.'];
  const doubled = [...items, ...items];
  return (
    <div className="overflow-hidden border-y border-white/5 py-4 bg-[#0A0A0A] select-none">
      <motion.div
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
        className="flex gap-10 whitespace-nowrap"
      >
        {doubled.map((item, i) => (
          <span key={i} className="text-xs font-bold uppercase tracking-[0.25em] text-white/20 flex-shrink-0">
            {item} <span className="text-orange-500/50 mx-4">✦</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const MagPage = () => {
  const [activeLang, setActiveLang] = useState('fr');
  const [activeCategory, setActiveCategory] = useState('all');

  const today = new Date();
  today.setHours(23, 59, 59, 999);
  const langArticles = articles.filter(a =>
    (a.lang || 'fr') === activeLang &&
    new Date(a.publishDate) <= today
  );
  const categories = ['all', ...new Set(langArticles.map(a => a.category))];
  const filtered = activeCategory === 'all'
    ? langArticles
    : langArticles.filter(a => a.category === activeCategory);

  const labels = activeLang === 'en'
    ? { all: 'All', title: 'The Mag', subtitle: 'No ads. No fluff. Just insights to grow your audience — everywhere.', articles: 'articles', maxRead: 'max read', ads: 'ads' }
    : { all: 'Tout voir', title: 'Le Mag', subtitle: 'Pas de publicité. Pas d\'auto-promo. Juste des insights pour faire grandir ton audience — partout.', articles: 'articles', maxRead: 'lecture max', ads: 'pub' };

  return (
    <>
      <SEOHead
        title={activeLang === 'en'
          ? 'The Mag — Strategy & Insights for Content Creators | EKHO Studio'
          : 'Le Mag — Conseils & Stratégies pour créateurs | EKHO Studio'}
        description={activeLang === 'en'
          ? 'Strategic articles for content creators, coaches and e-commerce brands who want to reach new audiences internationally.'
          : "Articles stratégiques pour créateurs de contenu, formateurs et e-commerçants qui veulent toucher de nouvelles audiences à l'international."}
        canonical="/mag"
        lang={activeLang}
      />

      {/* ── Hero ── */}
      <section className="relative bg-[#080808] pt-32 pb-0 overflow-hidden">
        {/* Grain */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.025]"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E")`, backgroundSize: '300px' }}
        />
        {/* Ghost watermark */}
        <div className="absolute -bottom-6 left-0 right-0 overflow-hidden pointer-events-none select-none">
          <p className="text-[22vw] font-black text-white/[0.018] leading-none">LE MAG</p>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="pb-16">
            {/* Eyebrow */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3 mb-8">
              <div className="h-px w-12 bg-orange-500" />
              <span className="text-orange-500 text-xs font-bold uppercase tracking-[0.3em]">EKHO Studio</span>
            </motion.div>

            {/* Title + floating claims */}
            <div className="relative flex items-start justify-between gap-8">
              <motion.h1
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-[clamp(5rem,16vw,11rem)] font-black text-white leading-[0.9] tracking-tight"
              >
                {activeLang === 'en' ? <>The<br /><span className="relative">Mag<span className="text-orange-500">.</span></span></> : <>Le<br /><span className="relative">Mag<span className="text-orange-500">.</span></span></>}
              </motion.h1>

              {/* Floating editorial badges */}
              <div className="hidden md:flex flex-col gap-3 pt-6 flex-shrink-0">
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}
                  style={{ transform: 'rotate(-2deg)' }}
                  className="bg-orange-500 text-white text-xs font-black px-5 py-3 rounded-xl shadow-xl shadow-orange-500/25 whitespace-nowrap"
                >
                  ✦ {activeLang === 'en' ? 'No fluff. Just facts.' : 'Pas de blabla. Que du concret.'}
                </motion.div>
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.55 }}
                  style={{ transform: 'rotate(1.5deg)' }}
                  className="border border-white/15 text-white/50 text-xs font-bold px-5 py-3 rounded-xl whitespace-nowrap"
                >
                  {activeLang === 'en' ? '5 min max per article →' : '5 min max par article →'}
                </motion.div>
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7 }}
                  style={{ transform: 'rotate(-1deg)' }}
                  className="border border-orange-500/30 text-orange-400/70 text-xs font-bold px-5 py-3 rounded-xl whitespace-nowrap"
                >
                  {activeLang === 'en' ? '0 ads. Ever.' : '0 pub. Jamais.'}
                </motion.div>
              </div>
            </div>

            {/* Subtitle + counters */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="mt-10 flex flex-col md:flex-row md:items-end gap-8 max-w-5xl"
            >
              <p className="text-gray-400 text-lg leading-relaxed max-w-lg">{labels.subtitle}</p>
              <div className="flex gap-10 flex-shrink-0">
                <div className="text-center">
                  <p className="text-4xl font-black text-orange-400">{langArticles.length}</p>
                  <p className="text-[11px] text-gray-600 uppercase tracking-widest mt-1">{labels.articles}</p>
                </div>
                <div className="text-center">
                  <p className="text-4xl font-black text-orange-400">5'</p>
                  <p className="text-[11px] text-gray-600 uppercase tracking-widest mt-1">{labels.maxRead}</p>
                </div>
                <div className="text-center">
                  <p className="text-4xl font-black text-orange-400">0</p>
                  <p className="text-[11px] text-gray-600 uppercase tracking-widest mt-1">{labels.ads}</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-orange-500/30 to-transparent" />
      </section>

      {/* Marquee strip */}
      <Marquee lang={activeLang} />

      {/* ── Sticky filter bar ── */}
      <div className="sticky top-[73px] z-30 bg-[#080808]/95 backdrop-blur-md border-b border-white/[0.05]">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4 overflow-x-auto no-scrollbar">
          {/* Lang toggle */}
          <div className="flex items-center gap-1 bg-white/5 rounded-full p-1 flex-shrink-0">
            {['fr', 'en'].map(l => (
              <button key={l} onClick={() => { setActiveLang(l); setActiveCategory('all'); }}
                className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest transition-all duration-300 ${activeLang === l ? 'bg-orange-500 text-white shadow-md' : 'text-gray-500 hover:text-white'}`}
              >
                {l}
              </button>
            ))}
          </div>
          {/* Categories */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {categories.map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)}
                className={`flex-shrink-0 px-5 py-2 rounded-full text-xs font-semibold transition-all duration-300 ${activeCategory === cat ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25' : 'bg-white/[0.04] text-gray-500 hover:bg-white/[0.08] hover:text-white'}`}
              >
                {cat === 'all' ? labels.all : cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Articles feed ── */}
      <section className="bg-[#080808] py-16 min-h-screen">
        <div className="container mx-auto px-4">

          {filtered.length === 0 && (
            <p className="text-gray-600 text-center py-24 text-lg">Aucun article dans cette catégorie.</p>
          )}

          {/* Row 1 — Featured + 2 stacked */}
          {filtered.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
              <div className="md:col-span-3">
                <Card article={filtered[0]} featured index={0} />
              </div>
              <div className="md:col-span-2 flex flex-col gap-6">
                {filtered[1] && <Card article={filtered[1]} index={1} />}
                {filtered[2] && <Card article={filtered[2]} index={2} />}
              </div>
            </div>
          )}

          {/* Editorial break #1 */}
          {filtered.length > 3 && (
            <div className="py-12 flex flex-col md:flex-row items-center gap-6 md:gap-12 overflow-hidden">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/5 hidden md:block" />
              <motion.blockquote
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, margin: '-60px' }}
                style={{ transform: 'rotate(-0.7deg)' }}
                className="text-2xl md:text-4xl font-black text-white/20 italic text-center flex-shrink-0 leading-tight max-w-2xl"
              >
                {activeLang === 'en' ? '"Content that doesn\'t travel,\ndoesn\'t live."' : '"Le contenu qui ne voyage pas,\nne vit pas."'}
              </motion.blockquote>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/5 hidden md:block" />
            </div>
          )}

          {/* Row 2 — 3 col */}
          {filtered.length > 3 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {filtered.slice(3, 6).map((a, i) => <Card key={a.id} article={a} index={i + 3} />)}
            </div>
          )}

          {/* Editorial break #2 — claim panel left + 2 cards right */}
          {filtered.length > 6 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 items-center">
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                style={{ transform: 'rotate(-1.5deg)' }}
                className="flex flex-col gap-4 p-6 bg-orange-500/[0.06] border border-orange-500/20 rounded-2xl"
              >
                <p className="text-3xl font-black text-orange-400 leading-tight">
                  {activeLang === 'en' ? 'Your global audience is waiting.' : 'Ton audience mondiale t\'attend.'}
                </p>
                <p className="text-white/30 text-sm font-semibold">
                  {activeLang === 'en' ? 'The question is: for how long?' : 'La question c\'est : encore combien de temps ?'}
                </p>
              </motion.div>
              <div className="flex flex-col gap-6">
                {filtered[6] && <Card article={filtered[6]} index={6} />}
              </div>
              <div className="flex flex-col gap-6">
                {filtered[7] && <Card article={filtered[7]} index={7} />}
              </div>
            </div>
          )}

          {/* Row 3 — 2 col */}
          {filtered.length > 8 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {filtered.slice(8, 10).map((a, i) => <Card key={a.id} article={a} index={i + 8} />)}
            </div>
          )}

          {/* Big typographic break */}
          {filtered.length > 10 && (
            <div className="relative py-20 text-center overflow-hidden my-4">
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-[0.025]">
                <p className="text-[25vw] font-black text-white whitespace-nowrap leading-none">
                  {activeLang === 'en' ? 'GLOBAL' : 'GLOBAL'}
                </p>
              </div>
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                className="relative z-10"
              >
                <p className="text-4xl md:text-[3.5rem] font-black text-white leading-tight">
                  {activeLang === 'en'
                    ? <>3.2 billion people<br /><span className="text-orange-400">don't speak your language.</span></>
                    : <>3,2 milliards de gens<br /><span className="text-orange-400">ne parlent pas ta langue.</span></>
                  }
                </p>
                <p className="text-gray-600 text-lg mt-4">
                  {activeLang === 'en' ? 'What if that were an opportunity?' : 'Et si c\'était une opportunité ?'}
                </p>
              </motion.div>
            </div>
          )}

          {/* Row 4 — 3 col */}
          {filtered.length > 10 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {filtered.slice(10, 13).map((a, i) => <Card key={a.id} article={a} index={i + 10} />)}
            </div>
          )}

          {/* Asymmetric editorial row */}
          {filtered.length > 13 && (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6 items-center">
              <div className="md:col-span-2 flex flex-col justify-center gap-5 py-6 px-2">
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true, margin: '-60px' }}
                  style={{ transform: 'rotate(0.8deg)' }}
                  className="leading-none"
                >
                  <p className="text-5xl font-black text-white/[0.07]">SCALE.</p>
                  <p className="text-5xl font-black text-white/[0.07]">CREATE.</p>
                  <p className="text-5xl font-black text-orange-500/25">ADAPT.</p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true, margin: '-60px' }}
                  style={{ transform: 'rotate(-1.2deg)' }}
                  className="border border-white/10 rounded-xl p-5 bg-white/[0.02]"
                >
                  <p className="text-white/50 text-sm font-bold italic">
                    {activeLang === 'en'
                      ? '"Rule #1: don\'t start from scratch."'
                      : '"Première règle : ne recommence pas à zéro."'
                    }
                  </p>
                </motion.div>
              </div>
              <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-6">
                {filtered.slice(13, 15).map((a, i) => <Card key={a.id} article={a} index={i + 13} />)}
              </div>
            </div>
          )}

          {/* Final batch */}
          {filtered.length > 15 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {filtered.slice(15).map((a, i) => <Card key={a.id} article={a} index={i + 15} />)}
            </div>
          )}

        </div>
      </section>
    </>
  );
};

export default MagPage;
