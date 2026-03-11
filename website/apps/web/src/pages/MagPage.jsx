import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Clock, ArrowRight, BookOpen } from 'lucide-react';
import { articles } from '@/data/articles.js';

const categoryColors = {
  'Stratégie': { light: 'bg-amber-100 text-amber-800', dark: 'bg-orange-500/20 text-orange-400' },
  'Secteurs': { light: 'bg-rose-100 text-rose-800', dark: 'bg-red-500/20 text-red-400' },
  'Conseils pratiques': { light: 'bg-emerald-100 text-emerald-800', dark: 'bg-emerald-500/20 text-emerald-400' },
};

// ─── STYLE A : ÉDITORIAL CLAIR ─────────────────────────────────────────────

const CardLight = ({ article, featured = false }) => (
  <motion.article
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className={`group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 ${featured ? 'md:col-span-2' : ''}`}
  >
    <Link to={`/mag/${article.slug}`}>
      <div className={`relative overflow-hidden ${featured ? 'h-72' : 'h-48'}`}>
        <img
          src={article.coverImage}
          alt={article.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <span className={`absolute top-4 left-4 text-xs font-bold px-3 py-1 rounded-full ${categoryColors[article.category]?.light}`}>
          {article.category}
        </span>
      </div>
      <div className="p-6">
        <h3 className={`font-serif font-bold text-gray-900 group-hover:text-amber-600 transition-colors leading-tight mb-3 ${featured ? 'text-2xl md:text-3xl' : 'text-xl'}`}>
          {article.title}
        </h3>
        <p className="text-gray-500 text-sm leading-relaxed mb-4 line-clamp-2">{article.excerpt}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-gray-400 text-xs">
            <Clock size={12} />
            <span>{article.readTime} min de lecture</span>
          </div>
          <span className="text-amber-600 text-sm font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
            Lire <ArrowRight size={14} />
          </span>
        </div>
      </div>
    </Link>
  </motion.article>
);

const SectionLight = ({ articlesList }) => (
  <section className="bg-[#FAFAF8] py-20">
    {/* Label de section */}
    <div className="container mx-auto px-4 mb-4">
      <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 text-xs font-bold px-4 py-2 rounded-full mb-2">
        ✦ Style A — Éditorial Clair
      </div>
    </div>

    <div className="container mx-auto px-4">
      {/* Header */}
      <div className="max-w-2xl mb-16">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="flex items-center gap-3 mb-4"
        >
          <div className="w-12 h-1 bg-amber-500 rounded-full" />
          <span className="text-amber-600 font-semibold text-sm uppercase tracking-widest">Le Mag</span>
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-serif text-5xl md:text-6xl font-black text-gray-900 leading-none mb-6"
        >
          Pense global.<br />
          <span className="text-amber-500">Agis maintenant.</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-gray-500 text-lg leading-relaxed"
        >
          Des articles pour les créateurs, formateurs et entreprises qui veulent scaler leur contenu sans recommencer de zéro.
        </motion.p>
      </div>

      {/* Scattered claims */}
      <div className="relative mb-12 hidden md:block">
        <div className="absolute -top-4 right-24 rotate-2 bg-amber-400 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-md">
          ✦ Pas de blabla. Que du concret.
        </div>
        <div className="absolute top-8 right-64 -rotate-1 border-2 border-gray-900 text-gray-900 text-xs font-bold px-4 py-2 rounded-lg">
          5 min max par article →
        </div>
      </div>

      {/* Featured + grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <CardLight article={articlesList[0]} featured />
        <div className="flex flex-col gap-6">
          <CardLight article={articlesList[1]} />
          <CardLight article={articlesList[2]} />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {articlesList.slice(3, 10).map(a => <CardLight key={a.id} article={a} />)}
      </div>
    </div>
  </section>
);

// ─── STYLE B : DARK & CHAUD ─────────────────────────────────────────────────

const CardDark = ({ article, featured = false }) => (
  <motion.article
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className={`group bg-[#141414] border border-orange-500/20 rounded-2xl overflow-hidden hover:border-orange-500/60 hover:-translate-y-1 transition-all duration-400 ${featured ? 'md:col-span-2' : ''}`}
  >
    <Link to={`/mag/${article.slug}`}>
      <div className={`relative overflow-hidden ${featured ? 'h-72' : 'h-48'}`}>
        <img
          src={article.coverImage}
          alt={article.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80 group-hover:opacity-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <span className={`absolute top-4 left-4 text-xs font-bold px-3 py-1 rounded-full ${categoryColors[article.category]?.dark}`}>
          {article.category}
        </span>
      </div>
      <div className="p-6">
        <h3 className={`font-bold text-white group-hover:text-orange-400 transition-colors leading-tight mb-3 ${featured ? 'text-2xl md:text-3xl' : 'text-xl'}`}>
          {article.title}
        </h3>
        <p className="text-gray-400 text-sm leading-relaxed mb-4 line-clamp-2">{article.excerpt}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-gray-500 text-xs">
            <Clock size={12} />
            <span>{article.readTime} min de lecture</span>
          </div>
          <span className="text-orange-400 text-sm font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
            Lire <ArrowRight size={14} />
          </span>
        </div>
      </div>
    </Link>
  </motion.article>
);

const SectionDark = ({ articlesList }) => (
  <section className="bg-[#0D0D0D] py-20">
    {/* Label de section */}
    <div className="container mx-auto px-4 mb-4">
      <div className="inline-flex items-center gap-2 bg-orange-500/20 text-orange-400 text-xs font-bold px-4 py-2 rounded-full mb-2">
        ✦ Style B — Dark & Chaud
      </div>
    </div>

    <div className="container mx-auto px-4">
      {/* Header */}
      <div className="max-w-2xl mb-16">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="flex items-center gap-3 mb-4"
        >
          <div className="w-12 h-1 bg-orange-500 rounded-full" />
          <span className="text-orange-500 font-semibold text-sm uppercase tracking-widest">Le Mag</span>
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-5xl md:text-6xl font-black text-white leading-none mb-6"
        >
          Pense global.<br />
          <span className="text-orange-400">Agis maintenant.</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-gray-400 text-lg leading-relaxed"
        >
          Des articles pour les créateurs, formateurs et entreprises qui veulent scaler leur contenu sans recommencer de zéro.
        </motion.p>
      </div>

      {/* Scattered claims dark */}
      <div className="relative mb-12 hidden md:block h-10">
        <div className="absolute -top-4 right-24 rotate-2 bg-orange-500 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-md">
          ✦ Pas de blabla. Que du concret.
        </div>
        <div className="absolute top-0 right-64 -rotate-1 border-2 border-orange-500/60 text-orange-400 text-xs font-bold px-4 py-2 rounded-lg">
          5 min max par article →
        </div>
      </div>

      {/* Featured + grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <CardDark article={articlesList[0]} featured />
        <div className="flex flex-col gap-6">
          <CardDark article={articlesList[1]} />
          <CardDark article={articlesList[2]} />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {articlesList.slice(3).map(a => <CardDark key={a.id} article={a} />)}
      </div>
    </div>
  </section>
);

// ─── PAGE PRINCIPALE ────────────────────────────────────────────────────────

const MagPage = () => {
  const lightArticles = articles.slice(0, 10);
  const darkArticles = articles.slice(10, 20);

  return (
    <>
      <Helmet>
        <title>Le Mag — Conseils & Stratégies pour créateurs | EKHO Studio</title>
        <meta name="description" content="Articles stratégiques pour créateurs de contenu, formateurs et e-commercants qui veulent toucher de nouvelles audiences à l'international." />
      </Helmet>

      {/* Hero band */}
      <section className="bg-[#050814] pt-32 pb-12 border-b border-white/5">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="text-electric-purple w-5 h-5" />
                <span className="text-electric-purple text-sm font-semibold uppercase tracking-widest">EKHO Studio</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-black text-white leading-none">
                Le Mag<span className="text-electric-purple">.</span>
              </h1>
              <p className="text-gray-400 mt-4 text-lg max-w-xl">
                Pas de publicité. Pas d'auto-promo. Juste des insights pour faire grandir ton audience — partout dans le monde.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {['Stratégie', 'Secteurs', 'Conseils pratiques'].map(cat => (
                <span key={cat} className="px-4 py-2 border border-white/10 text-gray-400 text-sm rounded-full hover:border-electric-purple/50 hover:text-white transition-all cursor-default">
                  {cat}
                </span>
              ))}
            </div>
          </div>

          {/* Divider notice */}
          <div className="mt-10 p-4 border border-electric-purple/30 rounded-xl bg-electric-purple/5 text-center text-sm text-gray-300">
            <span className="text-electric-purple font-semibold">✦ Maquette en cours</span> — Les deux styles sont présentés ci-dessous pour comparaison. Style A (clair) → articles 1-10 · Style B (sombre) → articles 11-20.
          </div>
        </div>
      </section>

      <SectionLight articlesList={lightArticles} />

      {/* Visual separator */}
      <div className="bg-gradient-to-b from-[#FAFAF8] to-[#0D0D0D] py-16 text-center">
        <div className="container mx-auto px-4">
          <div className="inline-flex items-center gap-4">
            <div className="h-px w-24 bg-gradient-to-r from-amber-400 to-transparent" />
            <span className="text-gray-500 text-sm font-semibold uppercase tracking-widest">Style A ↑ · Style B ↓</span>
            <div className="h-px w-24 bg-gradient-to-l from-orange-400 to-transparent" />
          </div>
        </div>
      </div>

      <SectionDark articlesList={darkArticles} />
    </>
  );
};

export default MagPage;
