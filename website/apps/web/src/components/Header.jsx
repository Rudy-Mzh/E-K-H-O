import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { openCalendly } from '@/lib/calendly.js';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Accueil', path: '/' },
    { name: 'Notre vision', path: '/about' },
    { name: 'Démos', path: '/demos' },
    { name: 'Services', path: '/services' },
    { name: 'Tarifs', path: '/pricing' },
    { name: 'Le Mag', path: '/mag' },
    { name: 'Contact', path: '/contact' },
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
            {navLinks.map((link) => (
              link.path === '/mag' ? (
                <Link
                  key={link.path}
                  to={link.path}
                  style={{ transform: 'rotate(-1.5deg)' }}
                  className="relative inline-flex items-center gap-1.5 px-3 py-1 bg-orange-500 text-white text-sm font-black rounded-md shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:scale-105 transition-all duration-200"
                >
                  <span className="text-[10px] opacity-70">✦</span>
                  {link.name}
                </Link>
              ) : (
                <Link
                  key={link.path}
                  to={link.path}
                  className="text-white hover:text-electric-purple transition-all duration-300"
                >
                  {link.name}
                </Link>
              )
            ))}
            <button
              onClick={openCalendly}
              className="px-6 py-2 bg-electric-purple text-white rounded-lg btn-neon-purple hover:bg-electric-purple/90 transition-all duration-300"
            >
              Réserver un appel
            </button>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-white hover:text-electric-purple transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
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
            className="fixed top-[73px] right-0 bottom-0 w-full bg-[#0A0E27] border-l border-electric-purple/20 md:hidden"
          >
            <nav className="flex flex-col p-6 space-y-4">
              {navLinks.map((link) => (
                link.path === '/mag' ? (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    style={{ transform: 'rotate(-1deg)' }}
                    className="self-start inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white text-lg font-black rounded-md shadow-lg shadow-orange-500/30"
                  >
                    <span className="text-xs opacity-70">✦</span>
                    {link.name}
                  </Link>
                ) : (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-lg text-white hover:text-electric-purple transition-all duration-300"
                  >
                    {link.name}
                  </Link>
                )
              ))}
              <button
                onClick={() => { openCalendly(); setMobileMenuOpen(false); }}
                className="px-6 py-3 bg-electric-purple text-white rounded-lg btn-neon-purple text-center text-lg"
              >
                Réserver un appel
              </button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
