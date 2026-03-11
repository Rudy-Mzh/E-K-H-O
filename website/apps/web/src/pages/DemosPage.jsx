
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import * as Tabs from '@radix-ui/react-tabs';
import { Video, Megaphone, Dumbbell, Star, Mic2, BookOpen } from 'lucide-react';
import ContactChoiceModal from '@/components/ContactChoiceModal.jsx';
import DemoTunnelModal from '@/components/DemoTunnelModal.jsx';
import { demos } from '@/data/demos.js';

const DemosPage = () => {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState('all');
  const [choiceOpen, setChoiceOpen] = useState(false);
  const [tunnelOpen, setTunnelOpen] = useState(false);

  const categories = [
    { id: 'all', name: t('demos.categories.all'), icon: <Video className="w-5 h-5" /> },
    { id: 'interview', name: t('demos.categories.interview'), icon: <Mic2 className="w-5 h-5" /> },
    { id: 'sport', name: t('demos.categories.sport'), icon: <Dumbbell className="w-5 h-5" /> },
    { id: 'speaker', name: t('demos.categories.speaker'), icon: <Star className="w-5 h-5" /> },
    { id: 'ad', name: t('demos.categories.ad'), icon: <Megaphone className="w-5 h-5" /> },
    { id: 'tutorial', name: t('demos.categories.tutorial'), icon: <BookOpen className="w-5 h-5" /> },
  ];

  const filteredDemos = activeTab === 'all'
    ? demos
    : demos.filter(demo => demo.category === activeTab);

  return (
    <>
      <ContactChoiceModal
        isOpen={choiceOpen}
        onClose={() => setChoiceOpen(false)}
        onOpenTunnel={() => setTunnelOpen(true)}
      />
      <DemoTunnelModal isOpen={tunnelOpen} onClose={() => setTunnelOpen(false)} />

      <Helmet>
        <title>{t('demos.seoTitle')}</title>
        <meta name="description" content={t('demos.seoDesc')} />
      </Helmet>

      {/* Hero with video background */}
      <section className="relative flex items-center justify-center min-h-[50vh] pt-24 pb-20 overflow-hidden">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0"
          src="/demos-bg.mp4"
        />
        <div className="absolute inset-0 bg-black/70 z-0" />
        <div className="relative z-10 container mx-auto px-4 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-4xl md:text-6xl font-bold text-white mb-6 neon-glow-purple"
          >
            {t('demos.heroTitle')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-xl text-gray-300 max-w-3xl mx-auto"
          >
            {t('demos.heroSub')}
          </motion.p>
        </div>
      </section>

      <div className="bg-dark-navy pb-20">
        <div className="container mx-auto px-4 pt-16">

          {/* Tabs */}
          <Tabs.Root value={activeTab} onValueChange={setActiveTab} className="mb-12">
            <Tabs.List className="flex flex-wrap justify-center gap-4 mb-12">
              {categories.map((category) => (
                <Tabs.Trigger
                  key={category.id}
                  value={category.id}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                    activeTab === category.id
                      ? 'bg-electric-purple text-white btn-neon-purple'
                      : 'bg-[#050814] text-gray-400 border border-electric-purple/30 hover:border-electric-purple/60'
                  }`}
                >
                  {category.icon}
                  <span>{category.name}</span>
                </Tabs.Trigger>
              ))}
            </Tabs.List>

            <Tabs.Content value={activeTab}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {filteredDemos.map((demo) => (
                  <div
                    key={demo.id}
                    className="bg-[#050814] border border-electric-purple/30 rounded-xl p-6 hover:border-electric-purple/60 transition-all duration-300 hover:-translate-y-2"
                  >
                    <div className="mb-4">
                      <h3 className="text-xl font-bold text-white mb-2">{i18n.language === 'en' ? (demo.titleEn || demo.title) : demo.title}</h3>
                      <p className="text-electric-purple font-semibold">{demo.languages}</p>
                      <p className="text-gray-400 text-sm mt-2">{i18n.language === 'en' ? (demo.contextEn || demo.context) : demo.context}</p>
                    </div>

                    {demo.beforeVideo ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                        <div className="bg-dark-navy rounded-lg p-3">
                          <p className="text-xs font-semibold text-neon-blue mb-2 uppercase tracking-wide">
                            {t('demos.original')} — {demo.languages.split(' → ')[0]}
                          </p>
                          <div className="aspect-video w-full rounded overflow-hidden">
                            <iframe
                              src={`https://player.vimeo.com/video/${demo.beforeVideo.id}?title=0&byline=0&portrait=0&badge=0&autopause=0`}
                              frameBorder="0"
                              allow="autoplay; fullscreen; picture-in-picture; clipboard-write"
                              referrerPolicy="strict-origin-when-cross-origin"
                              className="w-full h-full"
                              title="Version originale"
                            />
                          </div>
                        </div>
                        <div className="bg-dark-navy rounded-lg p-3">
                          <p className="text-xs font-semibold text-hot-pink mb-2 uppercase tracking-wide">
                            {t('demos.adapted')} — {demo.languages.split(' → ')[1]}
                          </p>
                          <div className="aspect-video w-full rounded overflow-hidden">
                            <iframe
                              src={`https://player.vimeo.com/video/${demo.afterVideo.id}?title=0&byline=0&portrait=0&badge=0&autopause=0`}
                              frameBorder="0"
                              allow="autoplay; fullscreen; picture-in-picture; clipboard-write"
                              referrerPolicy="strict-origin-when-cross-origin"
                              className="w-full h-full"
                              title="Version adaptée EKHO"
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4 mb-6">
                        <div className="bg-dark-navy rounded-lg p-4">
                          <p className="text-sm font-semibold text-neon-blue mb-2">{t('demos.before')}</p>
                          <p className="text-gray-300 italic">"{demo.before}"</p>
                        </div>
                        <div className="bg-dark-navy rounded-lg p-4">
                          <p className="text-sm font-semibold text-hot-pink mb-2">{t('demos.after')}</p>
                          <p className="text-gray-300 italic">"{demo.after}"</p>
                        </div>
                      </div>
                    )}

                    <button
                      onClick={() => setChoiceOpen(true)}
                      className="block w-full px-6 py-3 bg-electric-purple text-white rounded-lg font-semibold btn-neon-purple hover:bg-electric-purple/90 transition-all duration-300 text-center"
                    >
                      {t('demos.ctaCard')}
                    </button>
                  </div>
                ))}
              </div>
            </Tabs.Content>
          </Tabs.Root>

          {/* Coming soon */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto mt-8 mb-8 bg-gradient-to-br from-electric-purple/10 to-neon-blue/10 border border-electric-purple/30 rounded-xl p-8 text-center hover:border-electric-purple/60 transition-all duration-300"
          >
            <p className="text-2xl font-bold text-white mb-2">{t('demos.comingSoonTitle')}</p>
            <p className="text-gray-400 mb-6">{t('demos.comingSoonSub')}</p>
            <button
              onClick={() => setChoiceOpen(true)}
              className="inline-block px-8 py-3 bg-electric-purple text-white rounded-lg font-semibold btn-neon-purple hover:bg-electric-purple/90 transition-all duration-300"
            >
              {t('demos.submit')}
            </button>
          </motion.div>

        </div>
      </div>
    </>
  );
};

export default DemosPage;
