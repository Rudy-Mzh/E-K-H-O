import React, { useState, useRef, useEffect } from 'react';
import SEOHead from '@/components/SEOHead.jsx';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Mail, Phone, Calendar, Loader2, MessageCircle, Copy, Check } from 'lucide-react';
import { CALENDLY_URL, openCalendly } from '@/lib/calendly.js';

const EMAIL = 'rudy.m@ekho-studio.com';

const FORMSPREE_URL = 'https://formspree.io/f/xvzbldlq';

const ContactPage = () => {
  const { t, i18n } = useTranslation();
  const [formData, setFormData] = useState({ name: '', email: '', need: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [emailMenuOpen, setEmailMenuOpen] = useState(false);
  const [phoneMenuOpen, setPhoneMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const emailRef = useRef(null);
  const phoneRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (emailRef.current && !emailRef.current.contains(e.target)) setEmailMenuOpen(false);
      if (phoneRef.current && !phoneRef.current.contains(e.target)) setPhoneMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const copyEmail = () => {
    navigator.clipboard.writeText(EMAIL);
    setCopied(true);
    setTimeout(() => { setCopied(false); setEmailMenuOpen(false); }, 1500);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(FORMSPREE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setSubmitted(true);
      } else {
        setError(t('contact.errorGeneric'));
      }
    } catch {
      setError(t('contact.errorNetwork'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEOHead
        title={t('contact.seoTitle')}
        description={t('contact.seoDesc')}
        canonical="/contact"
        lang={i18n.language}
      />

      {/* Hero with video background */}
      <section className="relative flex items-center justify-center min-h-[50vh] pt-24 pb-20 overflow-hidden">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0"
          src="/contact-bg.mp4"
        />
        <div className="absolute inset-0 bg-black/70 z-0" />
        <div className="relative z-10 container mx-auto px-4 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-4xl md:text-6xl font-bold text-white mb-6 neon-glow-purple"
          >
            {t('contact.heroTitle')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-xl text-gray-300 max-w-3xl mx-auto"
          >
            {t('contact.heroSub')}
          </motion.p>
        </div>
      </section>

      <div className="bg-dark-navy pb-20">
        <div className="container mx-auto px-4 pt-16">

          {/* Two equal columns */}
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch mb-12">

            {/* Left — Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              className="group bg-[#050814] border border-electric-purple/30 rounded-xl p-8 flex flex-col hover:border-electric-purple/70 hover:shadow-[0_0_40px_rgba(123,47,255,0.2)] transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-6">
                <Mail className="w-7 h-7 text-electric-purple" />
                <h2 className="text-2xl font-bold text-white">{t('contact.formTitle')}</h2>
              </div>

              {submitted ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="bg-electric-purple/20 border border-electric-purple rounded-lg p-8 text-center w-full">
                    <p className="text-white text-xl font-semibold mb-2">{t('contact.thankYou')}</p>
                    <p className="text-gray-300">{t('contact.replyTime')}</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col flex-1 space-y-5">
                  <div>
                    <label htmlFor="name" className="block text-white font-semibold mb-2">{t('contact.name')} *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-dark-navy border border-electric-purple/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-electric-purple transition-colors"
                      placeholder="Jean Dupont"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-white font-semibold mb-2">{t('contact.email')} *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-dark-navy border border-electric-purple/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-electric-purple transition-colors"
                      placeholder="jean@entreprise.com"
                    />
                  </div>
                  <div>
                    <label htmlFor="need" className="block text-white font-semibold mb-2">{t('contact.need')} *</label>
                    <select
                      id="need"
                      name="need"
                      value={formData.need}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-dark-navy border border-electric-purple/30 rounded-lg text-white focus:outline-none focus:border-electric-purple transition-colors"
                    >
                      <option value="">{t('contact.selectOption')}</option>
                      <option value="creator">{t('contact.needOptions.creator')}</option>
                      <option value="brand">{t('contact.needOptions.brand')}</option>
                      <option value="agency">{t('contact.needOptions.agency')}</option>
                      <option value="other">{t('contact.needOptions.other')}</option>
                    </select>
                  </div>
                  <div className="flex-1 flex flex-col">
                    <label htmlFor="message" className="block text-white font-semibold mb-2">{t('contact.message')} *</label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows="5"
                      className="flex-1 w-full px-4 py-3 bg-dark-navy border border-electric-purple/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-electric-purple transition-colors resize-none"
                      placeholder={t('contact.messagePlaceholder')}
                    />
                  </div>
                  {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full px-6 py-4 bg-electric-purple text-white rounded-lg font-semibold btn-neon-purple hover:bg-electric-purple/90 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? <><Loader2 className="w-5 h-5 animate-spin" />{t('contact.sending')}</> : t('contact.send')}
                  </button>
                </form>
              )}
            </motion.div>

            {/* Right — Calendly */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              className="group bg-[#050814] border border-neon-blue/30 rounded-xl p-8 flex flex-col hover:border-neon-blue/70 hover:shadow-[0_0_40px_rgba(0,194,255,0.2)] transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-6">
                <Calendar className="w-7 h-7 text-neon-blue" />
                <h2 className="text-2xl font-bold text-white">{t('contact.calendlyTitle')}</h2>
              </div>
              <p className="text-gray-300 mb-6">
                {t('contact.calendlySub')}
              </p>
              {/* Desktop : iframe intégrée */}
              <div className="hidden lg:flex flex-1 min-h-0">
                <iframe
                  src={`${CALENDLY_URL}?background_color=050814&text_color=ffffff&primary_color=00c2ff`}
                  width="100%"
                  height="100%"
                  style={{ minHeight: '560px' }}
                  frameBorder="0"
                  title="Réserver un appel EKHO"
                  className="rounded-lg"
                />
              </div>
              {/* Mobile : bouton popup léger */}
              <div className="flex lg:hidden flex-1 items-center justify-center">
                <button
                  onClick={openCalendly}
                  className="w-full px-8 py-5 bg-neon-blue/10 border-2 border-neon-blue text-neon-blue rounded-lg font-semibold text-lg hover:bg-neon-blue hover:text-dark-navy transition-all duration-300"
                >
                  {t('contact.chooseSlot')}
                </button>
              </div>
            </motion.div>

          </div>

          {/* Informations de contact — centré en bas */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto bg-[#050814] border border-hot-pink/30 rounded-xl p-8 hover:border-hot-pink/60 hover:shadow-[0_0_40px_rgba(255,45,155,0.2)] transition-all duration-300"
          >
            <h2 className="text-2xl font-bold text-white mb-6 text-center">{t('contact.infoTitle')}</h2>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8">

              {/* Email */}
              <div className="flex items-center gap-3 text-gray-300" ref={emailRef}>
                <Mail className="w-5 h-5 text-electric-purple flex-shrink-0" />
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
                        {t('contact.openMail')}
                      </a>
                      <button
                        onClick={copyEmail}
                        className="group w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-neon-blue/20 hover:text-white transition-all duration-200 border-l-2 border-transparent hover:border-neon-blue border-t border-electric-purple/20"
                      >
                        {copied
                          ? <><Check size={15} className="text-green-400" /><span className="text-green-400 font-medium">{t('contact.copied')}</span></>
                          : <><Copy size={15} className="text-neon-blue group-hover:scale-110 transition-transform duration-200" />{t('contact.copyAddress')}</>
                        }
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="hidden sm:block w-px h-6 bg-hot-pink/30" />

              {/* Téléphone */}
              <div className="flex items-center gap-3 text-gray-300" ref={phoneRef}>
                <Phone className="w-5 h-5 text-electric-purple flex-shrink-0" />
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
                        {t('contact.call')}
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
              </div>

            </div>
          </motion.div>

        </div>
      </div>
    </>
  );
};

export default ContactPage;
