import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { openCalendly } from '@/lib/calendly.js';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t, i18n } = useTranslation();

  const toggleLang = () => {
    const next = i18n.language === 'fr' ? 'en' : 'fr';
    i18n.changeLanguage(next);
    localStorage.setItem('ekho_lang', next);
  };

  const navLinks = [
    { key: 'home',    path: '/' },
    { key: 'vision',  path: '/about' },
    { key: 'demos',   path: '/demos' },
    { key: 'services',path: '/services' },
    { key: 'pricing', path: '/pricing' },
    { key: 'contact', path: '/contact' },
    { key: 'mag',     path: '/mag', sticker: true },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0A0E27] md:bg-dark-navy/90 md:backdrop-blur-lg border-b border-electric-purple/20">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-electric-purple neon-glow-purple">
            EKHO
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) =>
              link.sticker ? (
                <Link
                  key={link.path}
                  to={link.path}
                  style={{ transform: 'rotate(-1.5deg)' }}
                  className="relative inline-flex items-center gap-1.5 px-3 py-1 bg-orange-500 text-white text-sm font-black rounded-md mag-sticker-glow hover:scale-110 hover:rotate-0 transition-all duration-200"
                >
                  <span className="text-[10px] opacity-70">✦</span>
                  {t(`nav.${link.key}`)}
                </Link>
              ) : (
                <Link
                  key={link.path}
                  to={link.path}
                  className="text-white hover:text-electric-purple transition-all duration-300"
                >
                  {t(`nav.${link.key}`)}
                </Link>
              )
            )}

            {/* Lang toggle */}
            <div className="flex items-center gap-1 border border-white/20 rounded-full px-1 py-1 bg-white/[0.04]">
              <Globe size={13} className="text-white/40 ml-1.5 flex-shrink-0" />
              {['fr', 'en'].map(l => (
                <button
                  key={l}
                  onClick={() => { i18n.changeLanguage(l); localStorage.setItem('ekho_lang', l); }}
                  className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest transition-all duration-200 ${
                    i18n.language === l
                      ? 'bg-electric-purple text-white lang-neon-active'
                      : 'text-white/40 hover:text-white'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>

            <button
              onClick={openCalendly}
              className="px-6 py-2 bg-electric-purple text-white rounded-lg btn-neon-cta hover:bg-electric-purple/90 transition-all duration-300"
            >
              {t('nav.cta')}
            </button>
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-3 md:hidden">
            {/* Mobile lang toggle */}
            <div className="flex items-center gap-1 border border-white/20 rounded-full px-1 py-1 bg-white/[0.04]">
              {['fr', 'en'].map(l => (
                <button
                  key={l}
                  onClick={() => { i18n.changeLanguage(l); localStorage.setItem('ekho_lang', l); }}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-200 ${
                    i18n.language === l
                      ? 'bg-electric-purple text-white lang-neon-active'
                      : 'text-white/40'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-white hover:text-electric-purple transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed top-[73px] right-0 bottom-0 w-full bg-[#0A0E27]/95 backdrop-blur-xl border-l border-electric-purple/40 md:hidden"
            style={{ boxShadow: '-8px 0 40px rgba(123,47,255,0.15)' }}
          >
            {/* Ambient glow top */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-electric-purple/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-20 left-0 w-48 h-48 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />

            <nav className="relative flex flex-col p-6 space-y-1">
              {navLinks.map((link) =>
                link.sticker ? (
                  <div key={link.path} className="pt-3">
                    <Link
                      to={link.path}
                      onClick={() => setMobileMenuOpen(false)}
                      style={{ transform: 'rotate(-1deg)' }}
                      className="self-start inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white text-lg font-black rounded-md mag-sticker-glow"
                    >
                      <span className="text-xs opacity-70">✦</span>
                      {t(`nav.${link.key}`)}
                    </Link>
                  </div>
                ) : (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className="group flex items-center justify-between py-3 border-b border-white/5 text-lg text-white/80 hover:text-electric-purple transition-all duration-300"
                  >
                    {t(`nav.${link.key}`)}
                    <span className="text-electric-purple/0 group-hover:text-electric-purple/60 transition-all duration-300 text-sm">→</span>
                  </Link>
                )
              )}
              <div className="pt-4">
                <button
                  onClick={() => { openCalendly(); setMobileMenuOpen(false); }}
                  className="w-full px-6 py-4 bg-electric-purple text-white rounded-lg btn-neon-cta text-center text-lg font-bold"
                >
                  {t('nav.cta')}
                </button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
