
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import * as Tabs from '@radix-ui/react-tabs';
import { Video, Music, Mic, Megaphone, GraduationCap, Dumbbell, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

const DemosPage = () => {
  const [activeTab, setActiveTab] = useState('all');

  const categories = [
    { id: 'all', name: 'Tous', icon: <Video className="w-5 h-5" /> },
    { id: 'sport', name: 'Coaching Sportif', icon: <Dumbbell className="w-5 h-5" /> },
    { id: 'speaker', name: 'Motivation Speaker', icon: <Star className="w-5 h-5" /> },
    { id: 'youtube', name: 'Vidéo YouTube', icon: <Video className="w-5 h-5" /> },
    { id: 'tutorial', name: 'Tutoriel', icon: <Music className="w-5 h-5" /> },
    { id: 'podcast', name: 'Podcast', icon: <Mic className="w-5 h-5" /> },
    { id: 'ad', name: 'Publicité', icon: <Megaphone className="w-5 h-5" /> },
    { id: 'training', name: 'Formation', icon: <GraduationCap className="w-5 h-5" /> }
  ];

  const demos = [
    {
      id: 9,
      category: 'sport',
      title: 'Coaching sportif : Sissy Mua — Cardio en conditions réelles',
      languages: 'FR → ES',
      context: "Extrait de Sissy Mua filmé en pleine séance de cardio. La voix est portée par le mouvement, l'effort et l'intensité physique. EKHO préserve l'énergie, le rythme et l'authenticité dans l'adaptation.",
      beforeVideo: { id: '1168777376', ratio: '75%' },
      afterVideo: { id: '1168777402', ratio: '56.25%' }
    },
    {
      id: 10,
      category: 'speaker',
      title: 'Motivation Speaker : David Laroche — Stoïcisme',
      languages: 'FR → EN',
      context: "Extrait de David Laroche, figure majeure du coaching motivationnel. Rythme, intonation et énergie sont au cœur du message. EKHO recrée l'expérience complète pour une audience anglophone.",
      beforeVideo: { id: '1168782805', ratio: '75%' },
      afterVideo: { id: '1168103220', ratio: '56.25%' }
    },
    {
      id: 11,
      category: 'ad',
      title: 'Publicité : BOKU — Adaptation marché anglophone',
      languages: 'FR → EN',
      context: "Extrait publicitaire BOKU adapté par EKHO pour le marché anglophone. Même énergie, même impact, nouvelle langue.",
      beforeVideo: { id: '1168816208', ratio: '56.25%' },
      afterVideo: { id: '1168815869', ratio: '56.25%' }
    },
    {
      id: 1,
      category: 'tutorial',
      title: 'Tutoriel guitare : débutant à intermédiaire',
      languages: 'FR → EN',
      context: 'Tutoriel de guitare pour débutants, adapté pour le marché anglophone',
      before: 'Bonjour, aujourd\'hui nous allons apprendre les accords de base...',
      after: 'Hello, today we\'re going to learn the basic chords...'
    },
    {
      id: 2,
      category: 'podcast',
      title: 'Podcast business : stratégies de croissance',
      languages: 'FR → ES',
      context: 'Épisode sur les stratégies de croissance pour startups',
      before: 'Dans cet épisode, nous explorons les meilleures stratégies...',
      after: 'En este episodio, exploramos las mejores estrategias...'
    },
    {
      id: 3,
      category: 'ad',
      title: 'Publicité produit : lancement nouvelle gamme',
      languages: 'EN → FR',
      context: 'Publicité pour le lancement d\'une nouvelle gamme de produits',
      before: 'Introducing our revolutionary new product line...',
      after: 'Découvrez notre nouvelle gamme de produits révolutionnaire...'
    },
    {
      id: 4,
      category: 'training',
      title: 'Formation marketing digital : SEO avancé',
      languages: 'FR → DE',
      context: 'Module de formation sur les techniques SEO avancées',
      before: 'Le référencement naturel est essentiel pour votre visibilité...',
      after: 'Suchmaschinenoptimierung ist entscheidend für Ihre Sichtbarkeit...'
    },
    {
      id: 5,
      category: 'youtube',
      title: 'Vidéo tech : revue de produit',
      languages: 'EN → FR',
      context: 'Revue détaillée d\'un nouveau produit technologique',
      before: 'Today we\'re reviewing the latest smartphone on the market...',
      after: 'Aujourd\'hui, nous testons le dernier smartphone du marché...'
    },
    {
      id: 6,
      category: 'tutorial',
      title: 'Tutoriel cuisine : recettes traditionnelles',
      languages: 'FR → IT',
      context: 'Tutoriel de cuisine française adapté pour l\'Italie',
      before: 'Nous allons préparer un bœuf bourguignon authentique...',
      after: 'Prepareremo un autentico bœuf bourguignon...'
    },
    {
      id: 7,
      category: 'podcast',
      title: 'Podcast santé : bien-être au quotidien',
      languages: 'FR → EN',
      context: 'Conseils santé et bien-être pour un public international',
      before: 'Aujourd\'hui, parlons de l\'importance du sommeil...',
      after: 'Today, let\'s talk about the importance of sleep...'
    },
    {
      id: 8,
      category: 'ad',
      title: 'Publicité service : solution SaaS B2B',
      languages: 'FR → EN',
      context: 'Publicité pour une solution SaaS destinée aux entreprises',
      before: 'Simplifiez la gestion de vos projets avec notre solution...',
      after: 'Simplify your project management with our solution...'
    }
  ];

  const filteredDemos = activeTab === 'all' 
    ? demos 
    : demos.filter(demo => demo.category === activeTab);

  return (
    <>
      <Helmet>
        <title>Démos - EKHO Studio | Entendez la différence</title>
        <meta name="description" content="Découvrez des exemples réels de contenus adaptés par EKHO. Avant/après, même message, nouvelle langue." />
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
            Entendez la différence.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-xl text-gray-300 max-w-3xl mx-auto"
          >
            Voici des exemples réels de contenus adaptés par EKHO. Avant/après, même message, nouvelle langue.
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
                      <h3 className="text-xl font-bold text-white mb-2">{demo.title}</h3>
                      <p className="text-electric-purple font-semibold">{demo.languages}</p>
                      <p className="text-gray-400 text-sm mt-2">{demo.context}</p>
                    </div>

                    {demo.beforeVideo ? (
                      <div className="space-y-4 mb-6">
                        <div className="bg-dark-navy rounded-lg p-4">
                          <p className="text-sm font-semibold text-neon-blue mb-3">Version originale — FR</p>
                          <div style={{ padding: `${demo.beforeVideo.ratio} 0 0 0`, position: 'relative' }}>
                            <iframe
                              src={`https://player.vimeo.com/video/${demo.beforeVideo.id}?title=0&byline=0&portrait=0&badge=0&autopause=0`}
                              frameBorder="0"
                              allow="autoplay; fullscreen; picture-in-picture; clipboard-write"
                              referrerPolicy="strict-origin-when-cross-origin"
                              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                              title="Version originale"
                              className="rounded"
                            />
                          </div>
                        </div>
                        <div className="bg-dark-navy rounded-lg p-4">
                          <p className="text-sm font-semibold text-hot-pink mb-3">Version adaptée EKHO — ES</p>
                          <div style={{ padding: `${demo.afterVideo.ratio} 0 0 0`, position: 'relative' }}>
                            <iframe
                              src={`https://player.vimeo.com/video/${demo.afterVideo.id}?title=0&byline=0&portrait=0&badge=0&autopause=0`}
                              frameBorder="0"
                              allow="autoplay; fullscreen; picture-in-picture; clipboard-write"
                              referrerPolicy="strict-origin-when-cross-origin"
                              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                              title="Version adaptée EKHO"
                              className="rounded"
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4 mb-6">
                        <div className="bg-dark-navy rounded-lg p-4">
                          <p className="text-sm font-semibold text-neon-blue mb-2">Avant</p>
                          <p className="text-gray-300 italic">"{demo.before}"</p>
                        </div>
                        <div className="bg-dark-navy rounded-lg p-4">
                          <p className="text-sm font-semibold text-hot-pink mb-2">Après</p>
                          <p className="text-gray-300 italic">"{demo.after}"</p>
                        </div>
                      </div>
                    )}

                    <Link
                      to="/contact"
                      className="block w-full px-6 py-3 bg-electric-purple text-white rounded-lg font-semibold btn-neon-purple hover:bg-electric-purple/90 transition-all duration-300 text-center"
                    >
                      Je veux le même résultat → Demander une démo
                    </Link>
                  </div>
                ))}
              </div>
            </Tabs.Content>
          </Tabs.Root>
        </div>
      </div>
    </>
  );
};

export default DemosPage;
