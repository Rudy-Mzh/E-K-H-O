
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { openCalendly } from '@/lib/calendly.js';
import { Zap, DollarSign, Target, Globe, Users, RefreshCw, ArrowRight, Upload, Sparkles, Rocket, Star, Quote } from 'lucide-react';
import DemoTunnelModal from '@/components/DemoTunnelModal.jsx';

const FEATURED_DEMOS = [
  {
    title: 'Interview — Yann Darwin & Alec Henry',
    languages: 'FR → ES',
    desc: "Authenticité de l'échange, flow naturel, ambiance sonore — préservés intégralement.",
    beforeId: '1171690830',
    afterId: '1171691552',
    beforeRatio: '56.25%',
    afterRatio: '56.25%',
  },
  {
    title: 'Coaching sportif — Sissy Mua',
    languages: 'FR → ES',
    desc: 'Même énergie, même intensité — en espagnol.',
    beforeId: '1168777376',
    afterId: '1168777402',
    beforeRatio: '75%',
    afterRatio: '75%',
  },
  {
    title: 'Motivation Speaker — David Laroche',
    languages: 'FR → EN',
    desc: 'Rythme, intonation et énergie recréés pour une audience anglophone.',
    beforeId: '1168782805',
    afterId: '1168103220',
    beforeRatio: '75%',
    afterRatio: '56.25%',
  },
  {
    title: 'Publicité — BOKU',
    languages: 'FR → EN',
    desc: 'Même impact, nouvelle langue, nouveau marché.',
    beforeId: '1168816208',
    afterId: '1168815869',
    beforeRatio: '56.25%',
    afterRatio: '56.25%',
  },
];

const AUTO_ROTATE_INTERVAL = 8000; // 8 secondes par démo

const HomePage = () => {
  const [tunnelOpen, setTunnelOpen] = useState(false);
  const [demoIndex, setDemoIndex] = useState(0);

  // Auto-rotation
  useEffect(() => {
    const timer = setInterval(() => {
      setDemoIndex((i) => (i + 1) % FEATURED_DEMOS.length);
    }, AUTO_ROTATE_INTERVAL);
    return () => clearInterval(timer);
  }, []);

  const benefits = [
    {
      icon: <Zap className="w-8 h-8" />,
      title: 'Vitesse stratégique',
      description: 'Déployez sur de nouveaux marchés en 48h, pas en 6 mois'
    },
    {
      icon: <DollarSign className="w-8 h-8" />,
      title: 'Rentabilité optimisée',
      description: 'Multipliez votre ROI sans multiplier vos coûts de production'
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: 'Fidélité éditoriale',
      description: 'Votre message reste intact, seule la langue change'
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: 'Expansion immédiate',
      description: 'Touchez de nouveaux marchés sans équipe locale'
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Accompagnement dédié',
      description: 'Un expert EKHO suit votre projet de A à Z'
    },
    {
      icon: <RefreshCw className="w-8 h-8" />,
      title: 'Flexibilité totale',
      description: 'Adaptez autant de vidéos que nécessaire, sans engagement'
    }
  ];

  const steps = [
    {
      icon: <Upload className="w-12 h-12" />,
      title: 'Vous partagez',
      description: 'Envoyez votre vidéo et vos langues cibles'
    },
    {
      icon: <Sparkles className="w-12 h-12" />,
      title: 'Nous adaptons',
      description: "L'IA accélère la traduction, nos experts affinent"
    },
    {
      icon: <Rocket className="w-12 h-12" />,
      title: 'Vous déployez',
      description: 'Votre vidéo adaptée est livrée en moins de 48h'
    }
  ];

  const testimonials = [
    {
      name: 'Marie L.',
      role: 'Créatrice de contenu',
      text: "J'ai voulu tester EKHO sur une vidéo avant d'aller plus loin. Le résultat en espagnol était tellement bluffant que j'ai enchaîné avec trois autres vidéos dans la semaine. Le rendu est naturel, on ne dirait vraiment pas une adaptation.",
      stars: 5,
    },
    {
      name: 'Thomas R.',
      role: 'Fondateur, marque de sport',
      text: "J'ai fait appel à EKHO pour voir le rendu de ma pub en anglais avant de m'engager sur un marché étranger. Honnêtement, ça m'a convaincu. Depuis, je travaille l'internationalisation de ma marque avec bien plus de confiance.",
      stars: 5,
    },
    {
      name: 'Sofia M.',
      role: 'Coach et formatrice',
      text: "Ce qui m'a surprise, c'est la vitesse. J'ai envoyé ma vidéo le lundi matin et j'avais la version adaptée le mardi. La voix ressemble vraiment à la mienne. Mes clients allemands n'ont rien remarqué — pour eux, c'est moi qui parle.",
      stars: 5,
    },
  ];

  return (
    <>
      <Helmet>
        <title>EKHO Studio - Adaptez vos vidéos pour de nouveaux marchés</title>
        <meta name="description" content="EKHO adapte vos vidéos pour de nouveaux marchés. Même message, nouvelle langue, nouvelle audience. Déployez en 48h." />
      </Helmet>

      {/* Demo Tunnel Modal */}
      <DemoTunnelModal isOpen={tunnelOpen} onClose={() => setTunnelOpen(false)} />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
        <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover z-0" src="/hero-bg.mp4" />
        <div className="absolute inset-0 bg-black/70 z-0"></div>
        <div className="relative z-10 container mx-auto px-4 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 neon-glow-purple"
          >
            Même contenu. Nouveau marché. Nouveau revenu.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto"
          >
            EKHO adapte vos vidéos pour de nouveaux marchés. Même message, nouvelle langue, nouvelle audience.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <button
              onClick={() => setTunnelOpen(true)}
              className="px-8 py-4 bg-electric-purple text-white rounded-lg font-semibold btn-neon-purple hover:bg-electric-purple/90 transition-all duration-300 text-lg"
            >
              Obtenez votre démo gratuite ici
            </button>
            <Link
              to="/demos"
              className="px-8 py-4 border-2 border-electric-purple text-electric-purple rounded-lg font-semibold hover:bg-electric-purple/10 transition-all duration-300"
            >
              Voir les avant/après
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Featured Demo Section — en premier après le hero */}
      <section className="py-20 bg-[#050814]">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 neon-glow-blue">
              Entendez la différence.
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Des exemples réels. Même message, nouvelle langue, même énergie.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            {/* Auto-carousel */}
            <div className="relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={demoIndex}
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.35 }}
                  className="bg-dark-navy border border-electric-purple/30 rounded-xl p-6"
                >
                  <div className="mb-4 flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">{FEATURED_DEMOS[demoIndex].title}</h3>
                      <p className="text-electric-purple font-semibold">{FEATURED_DEMOS[demoIndex].languages}</p>
                      <p className="text-gray-400 text-sm mt-1">{FEATURED_DEMOS[demoIndex].desc}</p>
                    </div>
                    <span className="text-gray-500 text-sm font-medium shrink-0 ml-4 mt-1">
                      {demoIndex + 1} / {FEATURED_DEMOS.length}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-[#050814] rounded-lg p-4">
                      <p className="text-sm font-semibold text-neon-blue mb-3">
                        Version originale — {FEATURED_DEMOS[demoIndex].languages.split(' → ')[0]}
                      </p>
                      <div style={{ padding: `${FEATURED_DEMOS[demoIndex].beforeRatio} 0 0 0`, position: 'relative' }}>
                        <iframe
                          src={`https://player.vimeo.com/video/${FEATURED_DEMOS[demoIndex].beforeId}?title=0&byline=0&portrait=0&badge=0&autopause=0`}
                          frameBorder="0"
                          allow="autoplay; fullscreen; picture-in-picture; clipboard-write"
                          referrerPolicy="strict-origin-when-cross-origin"
                          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                          title="Version originale"
                          className="rounded"
                        />
                      </div>
                    </div>
                    <div className="bg-[#050814] rounded-lg p-4">
                      <p className="text-sm font-semibold text-hot-pink mb-3">
                        Version adaptée EKHO — {FEATURED_DEMOS[demoIndex].languages.split(' → ')[1]}
                      </p>
                      <div style={{ padding: `${FEATURED_DEMOS[demoIndex].afterRatio} 0 0 0`, position: 'relative' }}>
                        <iframe
                          src={`https://player.vimeo.com/video/${FEATURED_DEMOS[demoIndex].afterId}?title=0&byline=0&portrait=0&badge=0&autopause=0`}
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
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Dots (cliquables pour navigation manuelle aussi) */}
            <div className="flex justify-center gap-2 mt-5">
              {FEATURED_DEMOS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setDemoIndex(i)}
                  className={`h-2 rounded-full transition-all duration-300 ${i === demoIndex ? 'bg-electric-purple w-6' : 'bg-gray-600 hover:bg-gray-400 w-2'}`}
                />
              ))}
            </div>

            <div className="text-center mt-8">
              <Link
                to="/demos"
                className="inline-flex items-center gap-2 px-8 py-4 border-2 border-electric-purple text-electric-purple rounded-lg font-semibold hover:bg-electric-purple/10 transition-all duration-300"
              >
                Voir toutes les démos
                <ArrowRight size={18} />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 bg-dark-navy">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto text-center"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 neon-glow-blue">
              Vous avez déjà investi. Pourquoi limiter votre portée ?
            </h2>
            <p className="text-xl text-gray-300">
              Vous avez créé du contenu de qualité. Mais il ne touche qu'un seul marché. EKHO vous permet de multiplier votre impact sans recommencer de zéro.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-20 bg-[#050814]">
        <div className="container mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold text-white text-center mb-16 neon-glow-purple"
          >
            Un contenu. Plusieurs marchés. Sans recommencer.
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="bg-dark-navy border border-electric-purple/30 rounded-xl p-8 text-center hover:border-electric-purple/60 transition-all duration-300 hover:-translate-y-2"
              >
                <div className="text-electric-purple mb-4 flex justify-center">{step.icon}</div>
                <h3 className="text-2xl font-bold text-white mb-3">{step.title}</h3>
                <p className="text-gray-400">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-dark-navy">
        <div className="container mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold text-white text-center mb-16 neon-glow-blue"
          >
            Pourquoi choisir EKHO ?
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-[#050814] border border-electric-purple/30 rounded-xl p-6 hover:border-electric-purple/60 transition-all duration-300 hover:-translate-y-2"
              >
                <div className="text-electric-purple mb-4">{benefit.icon}</div>
                <h3 className="text-xl font-bold text-white mb-2">{benefit.title}</h3>
                <p className="text-gray-400">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-[#050814]">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 neon-glow-purple">
              Ils ont franchi le pas.
            </h2>
            <p className="text-xl text-gray-300">Ce que nos clients disent après leur première adaptation.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((t, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="bg-dark-navy border border-electric-purple/30 rounded-xl p-6 hover:border-electric-purple/60 hover:shadow-[0_0_30px_rgba(123,47,255,0.15)] transition-all duration-300 flex flex-col"
              >
                <Quote className="w-8 h-8 text-electric-purple/40 mb-4 flex-shrink-0" />
                <p className="text-gray-300 text-sm leading-relaxed flex-1 mb-6">"{t.text}"</p>
                <div>
                  <div className="flex gap-0.5 mb-2">
                    {Array.from({ length: t.stars }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                  <p className="text-white font-semibold text-sm">{t.name}</p>
                  <p className="text-gray-500 text-xs">{t.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Preview Section */}
      <section className="py-20 bg-dark-navy">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 neon-glow-purple">
              Des tarifs pensés pour scaler
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Transparents, flexibles, et adaptés à votre croissance. Pas de surprise, juste des résultats.
            </p>
            <Link
              to="/pricing"
              className="inline-flex items-center px-8 py-4 bg-electric-purple text-white rounded-lg font-semibold btn-neon-purple hover:bg-electric-purple/90 transition-all duration-300"
            >
              Voir tous les tarifs
              <ArrowRight className="ml-2" size={20} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Bottom CTA Section */}
      <section className="py-20 bg-[#050814]">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-8 neon-glow-blue">
              Prêt à transformer vos vidéos ?
            </h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setTunnelOpen(true)}
                className="inline-block px-10 py-5 bg-electric-purple text-white text-lg rounded-lg font-semibold btn-neon-purple hover:bg-electric-purple/90 transition-all duration-300"
              >
                Obtenez votre démo gratuite ici
              </button>
              <button
                onClick={openCalendly}
                className="inline-block px-10 py-5 border-2 border-electric-purple text-electric-purple text-lg rounded-lg font-semibold hover:bg-electric-purple/10 transition-all duration-300"
              >
                Réserver un appel
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default HomePage;
