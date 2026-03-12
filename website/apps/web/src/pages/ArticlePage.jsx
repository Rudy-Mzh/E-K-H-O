import React from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import SEOHead, { articleSchema } from '@/components/SEOHead.jsx';
import { motion } from 'framer-motion';
import { Clock, ArrowLeft, ArrowRight } from 'lucide-react';
import { articles } from '@/data/articles.js';

const ArticlePage = () => {
  const { slug } = useParams();
  const article = articles.find(a => a.slug === slug);

  if (!article) return <Navigate to="/mag" replace />;

  const currentIndex = articles.findIndex(a => a.slug === slug);
  const prev = articles[currentIndex - 1] || null;
  const next = articles[currentIndex + 1] || null;
  const related = articles.filter(a => a.category === article.category && a.id !== article.id).slice(0, 3);

  return (
    <>
      <SEOHead
        title={`${article.title} | Le Mag EKHO Studio`}
        description={article.excerpt}
        canonical={`/mag/${article.slug}`}
        ogImage={article.coverImage}
        lang={article.lang === 'en' ? 'en' : 'fr'}
        article={article}
        jsonLd={articleSchema(article)}
      />

      <div className="bg-[#080808] min-h-screen">
        {/* Cover */}
        <div className="relative h-[60vh] overflow-hidden">
          <img src={article.coverImage} alt={article.title} className="w-full h-full object-cover opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-black/30 to-transparent" />
          {/* Grain on cover */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.04]"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E")`, backgroundSize: '300px' }}
          />
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 max-w-3xl -mt-28 relative z-10">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            {/* Back */}
            <Link to="/mag" className="inline-flex items-center gap-2 text-orange-400 text-sm font-semibold mb-8 hover:gap-3 transition-all group">
              <ArrowLeft size={15} className="group-hover:-translate-x-1 transition-transform" /> {article.lang === 'en' ? 'Back to The Mag' : 'Retour au Mag'}
            </Link>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span className="bg-orange-500/15 text-orange-400 text-xs font-bold px-3 py-1.5 rounded-full border border-orange-500/30">
                {article.category}
              </span>
              {article.lang === 'en' && (
                <span className="bg-electric-purple/20 text-electric-purple text-xs font-bold px-3 py-1.5 rounded-full border border-electric-purple/30 uppercase tracking-widest">
                  EN
                </span>
              )}
              <span className="flex items-center gap-1.5 text-gray-600 text-sm">
                <Clock size={13} />
                {article.readTime} min {article.lang === 'en' ? 'read' : 'de lecture'}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-black text-white leading-tight mb-6">
              {article.title}
            </h1>
            <p className="text-xl text-gray-400 leading-relaxed mb-12 border-l-4 border-orange-500 pl-6">
              {article.excerpt}
            </p>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-orange-500/40 via-white/5 to-transparent mb-12" />

            {/* Article body */}
            <div className="prose-dark" dangerouslySetInnerHTML={{ __html: article.content }} />

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mt-14 pt-8 border-t border-white/[0.06]">
              {article.tags.map(tag => (
                <span key={tag} className="text-xs px-3 py-1.5 bg-white/[0.04] text-gray-500 rounded-full border border-white/[0.06]">
                  #{tag}
                </span>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Nav prev/next */}
        <div className="container mx-auto px-4 max-w-3xl mt-16 mb-8">
          <div className="flex gap-4">
            {prev && (
              <Link to={`/mag/${prev.slug}`} className="flex-1 bg-[#111] rounded-xl p-5 border border-white/[0.06] hover:border-orange-500/40 transition-all group">
                <p className="text-xs text-gray-600 mb-1.5 flex items-center gap-1">
                  <ArrowLeft size={11} /> {article.lang === 'en' ? 'Previous' : 'Article précédent'}
                </p>
                <p className="font-bold text-gray-300 group-hover:text-orange-400 transition-colors text-sm line-clamp-2">{prev.title}</p>
              </Link>
            )}
            {next && (
              <Link to={`/mag/${next.slug}`} className="flex-1 bg-[#111] rounded-xl p-5 border border-white/[0.06] hover:border-orange-500/40 transition-all group text-right">
                <p className="text-xs text-gray-600 mb-1.5 flex items-center gap-1 justify-end">
                  {article.lang === 'en' ? 'Next' : 'Article suivant'} <ArrowRight size={11} />
                </p>
                <p className="font-bold text-gray-300 group-hover:text-orange-400 transition-colors text-sm line-clamp-2">{next.title}</p>
              </Link>
            )}
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="bg-[#0D0D0D] py-16 mt-8 border-t border-white/[0.04]">
            <div className="container mx-auto px-4 max-w-5xl">
              <h3 className="text-xl font-black text-white mb-8 uppercase tracking-widest">
                {article.lang === 'en' ? 'Same category' : 'Dans la même catégorie'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {related.map(a => (
                  <Link key={a.id} to={`/mag/${a.slug}`} className="group">
                    <div className="h-44 rounded-xl overflow-hidden mb-4 border border-white/[0.06] group-hover:border-orange-500/40 transition-colors">
                      <img src={a.coverImage} alt={a.title} className="w-full h-full object-cover opacity-65 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" />
                    </div>
                    <span className="text-xs text-orange-400 font-bold">{a.category}</span>
                    <h4 className="font-bold text-gray-300 group-hover:text-orange-400 transition-colors mt-1 line-clamp-2">{a.title}</h4>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ArticlePage;
