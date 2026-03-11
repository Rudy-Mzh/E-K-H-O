
import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Linkedin, Instagram, Mail, Phone, MessageCircle, Copy, Check } from 'lucide-react';

const EMAIL = 'rudy.m@ekho-studio.com';

const Footer = () => {
  const { t } = useTranslation();
  const [phoneMenuOpen, setPhoneMenuOpen] = useState(false);
  const [emailMenuOpen, setEmailMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const phoneRef = useRef(null);
  const emailRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (phoneRef.current && !phoneRef.current.contains(e.target)) {
        setPhoneMenuOpen(false);
      }
      if (emailRef.current && !emailRef.current.contains(e.target)) {
        setEmailMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const copyEmail = () => {
    navigator.clipboard.writeText(EMAIL);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      setEmailMenuOpen(false);
    }, 1500);
  };

  return (
    <footer className="bg-[#050814] border-t border-electric-purple/20 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand Column */}
          <div>
            <span className="text-2xl font-bold text-electric-purple neon-glow-purple">EKHO</span>
            <p className="mt-4 text-gray-400">
              {t('footer.tagline')}
            </p>
          </div>

          {/* Quick Links Column */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('footer.links')}</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-electric-purple transition-colors">
                  {t('nav.home')}
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-400 hover:text-electric-purple transition-colors">
                  {t('nav.vision')}
                </Link>
              </li>
              <li>
                <Link to="/demos" className="text-gray-400 hover:text-electric-purple transition-colors">
                  {t('nav.demos')}
                </Link>
              </li>
              <li>
                <Link to="/services" className="text-gray-400 hover:text-electric-purple transition-colors">
                  {t('nav.services')}
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-gray-400 hover:text-electric-purple transition-colors">
                  {t('nav.pricing')}
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-400 hover:text-electric-purple transition-colors">
                  {t('nav.contact')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Column */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('footer.contact')}</h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-2 text-gray-400" ref={emailRef}>
                <Mail size={18} className="text-electric-purple flex-shrink-0" />
                <div className="relative">
                  <button
                    onClick={() => setEmailMenuOpen(!emailMenuOpen)}
                    className="hover:text-electric-purple transition-colors"
                  >
                    {EMAIL}
                  </button>
                  {emailMenuOpen && (
                    <div className="absolute bottom-full left-0 mb-2 bg-[#0d0f23] border border-electric-purple/30 rounded-lg overflow-hidden shadow-xl z-50 min-w-[210px]">
                      <a
                        href={`mailto:${EMAIL}`}
                        className="group flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-electric-purple/20 hover:text-white transition-all duration-200 border-l-2 border-transparent hover:border-electric-purple"
                      >
                        <Mail size={15} className="text-electric-purple group-hover:scale-110 transition-transform duration-200" />
                        {t('footer.openMail')}
                      </a>
                      <button
                        onClick={copyEmail}
                        className="group w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-neon-blue/20 hover:text-white transition-all duration-200 border-l-2 border-transparent hover:border-neon-blue border-t border-electric-purple/20"
                      >
                        {copied
                          ? <><Check size={15} className="text-green-400" /><span className="text-green-400 font-medium">{t('footer.copied')}</span></>
                          : <><Copy size={15} className="text-neon-blue group-hover:scale-110 transition-transform duration-200" />{t('footer.copyAddress')}</>
                        }
                      </button>
                    </div>
                  )}
                </div>
              </li>
              <li className="flex items-center space-x-2 text-gray-400" ref={phoneRef}>
                <Phone size={18} className="text-electric-purple flex-shrink-0" />
                <div className="relative">
                  <button
                    onClick={() => setPhoneMenuOpen(!phoneMenuOpen)}
                    className="hover:text-electric-purple transition-colors"
                  >
                    06 30 13 51 89
                  </button>
                  {phoneMenuOpen && (
                    <div className="absolute bottom-full left-0 mb-2 bg-[#0d0f23] border border-electric-purple/30 rounded-lg overflow-hidden shadow-xl z-50 min-w-[180px]">
                      <a
                        href="tel:+33630135189"
                        className="group flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-electric-purple/20 hover:text-white transition-all duration-200 border-l-2 border-transparent hover:border-electric-purple"
                      >
                        <Phone size={15} className="text-electric-purple group-hover:scale-110 transition-transform duration-200" />
                        {t('footer.call')}
                      </a>
                      <a
                        href="https://wa.me/33630135189"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-green-500/20 hover:text-white transition-all duration-200 border-l-2 border-transparent hover:border-green-400 border-t border-electric-purple/20"
                      >
                        <MessageCircle size={15} className="text-green-400 group-hover:scale-110 transition-transform duration-200" />
                        WhatsApp
                      </a>
                    </div>
                  )}
                </div>
              </li>
            </ul>
            <div className="flex space-x-4 mt-6">
              <a
                href="https://www.linkedin.com/services/page/194044342554583271/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-electric-purple transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin size={24} />
              </a>
              <a
                href="https://www.instagram.com/ekho_studio_la_rochelle/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-electric-purple transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={24} />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-electric-purple/20 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} EKHO Studio. {t('footer.rights')}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
