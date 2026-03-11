import React from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Clock, ArrowLeft, ArrowRight, BookOpen } from 'lucide-react';
import { articles } from '@/data/articles.js';

const ArticlePage = () => {
  const { slug } = useParams();
  const article = articles.find(a => a.slug === slug);

  if (!article) return <Navigate to="/mag" replace />;

  const currentIndex = articles.findIndex(a => a.slug === slug);
  const prev = articles[currentIndex - 1] || null;
  const next = articles[currentIndex + 1] || null;
  const related = articles.filter(a => a.category === article.category && a.id !== article.id).slice(0, 3);

  const isStyleA = article.id <= 10;

  return (
    <>
      <Helmet>
        <title>{article.title} | Le Mag EKHO Studio</title>
        <meta name="description" content={article.excerpt} />
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={article.excerpt} />
        <meta property="og:image" content={article.coverImage} />
      </Helmet>

      {isStyleA ? (
        // ── STYLE A : ÉDITORIAL CLAIR ──────────────────────────────────────
        <div className="bg-[#FAFAF8] min-h-screen">
          {/* Cover */}
          <div className="relative h-[60vh] overflow-hidden">
            <img src={article.coverImage} alt={article.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#FAFAF8] via-black/20 to-transparent" />
          </div>

          {/* Content */}
          <div className="container mx-auto px-4 max-w-3xl -mt-24 relative z-10">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              {/* Back */}
              <Link to="/mag" className="inline-flex items-center gap-2 text-amber-600 text-sm font-semibold mb-6 hover:gap-3 transition-all">
                <ArrowLeft size={16} /> Retour au Mag
              </Link>

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full">{article.category}</span>
                <div className="flex items-center gap-1.5 text-gray-400 text-sm">
                  <Clock size={14} />
                  <span>{article.readTime} min de lecture</span>
                </div>
              </div>

              {/* Title */}
              <h1 className="font-serif text-4xl md:text-5xl font-black text-gray-900 leading-tight mb-6">
                {article.title}
              </h1>
              <p className="text-xl text-gray-500 leading-relaxed mb-12 border-l-4 border-amber-400 pl-6">
                {article.excerpt}
              </p>

              {/* Article body */}
              <div
                className="prose-light"
                dangerouslySetInnerHTML={{ __html: article.content }}
              />

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mt-12 pt-8 border-t border-gray-200">
                {article.tags.map(tag => (
                  <span key={tag} className="text-xs px-3 py-1 bg-gray-100 text-gray-500 rounded-full">#{tag}</span>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Nav prev/next */}
          <div className="container mx-auto px-4 max-w-3xl mt-16 mb-8">
            <div className="flex gap-4 justify-between">
              {prev && (
                <Link to={`/mag/${prev.slug}`} className="flex-1 bg-white rounded-xl p-5 border border-gray-100 hover:border-amber-200 hover:shadow-md transition-all group">
                  <p className="text-xs text-gray-400 mb-1 flex items-center gap-1"><ArrowLeft size={12} /> Article précédent</p>
                  <p className="font-serif font-bold text-gray-800 group-hover:text-amber-600 text-sm line-clamp-2">{prev.title}</p>
                </Link>
              )}
              {next && (
                <Link to={`/mag/${next.slug}`} className="flex-1 bg-white rounded-xl p-5 border border-gray-100 hover:border-amber-200 hover:shadow-md transition-all group text-right">
                  <p className="text-xs text-gray-400 mb-1 flex items-center gap-1 justify-end">Article suivant <ArrowRight size={12} /></p>
                  <p className="font-serif font-bold text-gray-800 group-hover:text-amber-600 text-sm line-clamp-2">{next.title}</p>
                </Link>
              )}
            </div>
          </div>

          {/* Related */}
          {related.length > 0 && (
            <div className="bg-white py-16 mt-8">
              <div className="container mx-auto px-4 max-w-5xl">
                <h3 className="font-serif text-2xl font-bold text-gray-900 mb-8">Dans la même catégorie</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {related.map(a => (
                    <Link key={a.id} to={`/mag/${a.slug}`} className="group">
                      <div className="h-40 rounded-xl overflow-hidden mb-4">
                        <img src={a.coverImage} alt={a.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                      <span className="text-xs text-amber-600 font-bold">{a.category}</span>
                      <h4 className="font-serif font-bold text-gray-900 group-hover:text-amber-600 transition-colors mt-1 line-clamp-2">{a.title}</h4>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        // ── STYLE B : DARK & CHAUD ─────────────────────────────────────────
        <div className="bg-[#0D0D0D] min-h-screen">
          {/* Cover */}
          <div className="relative h-[60vh] overflow-hidden">
            <img src={article.coverImage} alt={article.title} className="w-full h-full object-cover opacity-70" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D] via-black/40 to-transparent" />
          </div>

          {/* Content */}
          <div className="container mx-auto px-4 max-w-3xl -mt-24 relative z-10">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              {/* Back */}
              <Link to="/mag" className="inline-flex items-center gap-2 text-orange-400 text-sm font-semibold mb-6 hover:gap-3 transition-all">
                <ArrowLeft size={16} /> Retour au Mag
              </Link>

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <span className="bg-orange-500/20 text-orange-400 text-xs font-bold px-3 py-1 rounded-full">{article.category}</span>
                <div className="flex items-center gap-1.5 text-gray-500 text-sm">
                  <Clock size={14} />
                  <span>{article.readTime} min de lecture</span>
                </div>
              </div>

              {/* Title */}
              <h1 className="text-4xl md:text-5xl font-black text-white leading-tight mb-6">
                {article.title}
              </h1>
              <p className="text-xl text-gray-400 leading-relaxed mb-12 border-l-4 border-orange-500 pl-6">
                {article.excerpt}
              </p>

              {/* Article body */}
              <div
                className="prose-dark"
                dangerouslySetInnerHTML={{ __html: article.content }}
              />

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mt-12 pt-8 border-t border-white/10">
                {article.tags.map(tag => (
                  <span key={tag} className="text-xs px-3 py-1 bg-white/5 text-gray-500 rounded-full">#{tag}</span>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Nav prev/next */}
          <div className="container mx-auto px-4 max-w-3xl mt-16 mb-8">
            <div className="flex gap-4 justify-between">
              {prev && (
                <Link to={`/mag/${prev.slug}`} className="flex-1 bg-[#141414] rounded-xl p-5 border border-white/10 hover:border-orange-500/40 transition-all group">
                  <p className="text-xs text-gray-600 mb-1 flex items-center gap-1"><ArrowLeft size={12} /> Article précédent</p>
                  <p className="font-bold text-gray-300 group-hover:text-orange-400 text-sm line-clamp-2">{prev.title}</p>
                </Link>
              )}
              {next && (
                <Link to={`/mag/${next.slug}`} className="flex-1 bg-[#141414] rounded-xl p-5 border border-white/10 hover:border-orange-500/40 transition-all group text-right">
                  <p className="text-xs text-gray-600 mb-1 flex items-center gap-1 justify-end">Article suivant <ArrowRight size={12} /></p>
                  <p className="font-bold text-gray-300 group-hover:text-orange-400 text-sm line-clamp-2">{next.title}</p>
                </Link>
              )}
            </div>
          </div>

          {/* Related */}
          {related.length > 0 && (
            <div className="bg-[#141414] py-16 mt-8 border-t border-white/5">
              <div className="container mx-auto px-4 max-w-5xl">
                <h3 className="text-2xl font-bold text-white mb-8">Dans la même catégorie</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {related.map(a => (
                    <Link key={a.id} to={`/mag/${a.slug}`} className="group">
                      <div className="h-40 rounded-xl overflow-hidden mb-4">
                        <img src={a.coverImage} alt={a.title} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" />
                      </div>
                      <span className="text-xs text-orange-400 font-bold">{a.category}</span>
                      <h4 className="font-bold text-gray-200 group-hover:text-orange-400 transition-colors mt-1 line-clamp-2">{a.title}</h4>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default ArticlePage;
