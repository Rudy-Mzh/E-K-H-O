import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Accueil', path: '/' },
    { name: 'Démos', path: '/demos' },
    { name: 'Services', path: '/services' },
    { name: 'Tarifs', path: '/pricing' },
    { name: 'À Propos', path: '/about' },
    { name: 'Réserver un appel', path: '/contact', highlight: true }
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-dark-navy/90 backdrop-blur-lg border-b border-electric-purple/20">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-electric-purple neon-glow-purple">
            EKHO
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`transition-all duration-300 ${
                  link.highlight
                    ? 'px-6 py-2 bg-electric-purple text-white rounded-lg btn-neon-purple hover:bg-electric-purple/90'
                    : 'text-white hover:text-electric-purple'
                }`}
              >
                {link.name}
              </Link>
            ))}
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
            className="fixed top-[73px] right-0 bottom-0 w-full bg-dark-navy border-l border-electric-purple/20 md:hidden"
          >
            <nav className="flex flex-col p-6 space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`text-lg transition-all duration-300 ${
                    link.highlight
                      ? 'px-6 py-3 bg-electric-purple text-white rounded-lg btn-neon-purple text-center'
                      : 'text-white hover:text-electric-purple'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;