
import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, DollarSign, Target, Globe, Users, RefreshCw, ArrowRight, Upload, Sparkles, Rocket } from 'lucide-react';

const HomePage = () => {
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

  return (
    <>
      <Helmet>
        <title>EKHO Studio - Adaptez vos vidéos pour de nouveaux marchés</title>
        <meta name="description" content="EKHO adapte vos vidéos pour de nouveaux marchés. Même message, nouvelle langue, nouvelle audience. Déployez en 48h." />
      </Helmet>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
        {/* Video Background */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0"
          src="https://images.unsplash.com/photo-1675292310383-0f4ef53fa3ab"
        />
        
        {/* Dark Overlay */}
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
            <Link
              to="/contact"
              className="px-8 py-4 bg-electric-purple text-white rounded-lg font-semibold btn-neon-purple hover:bg-electric-purple/90 transition-all duration-300"
            >
              Demander une démo gratuite
            </Link>
            <Link
              to="/demos"
              className="px-8 py-4 border-2 border-electric-purple text-electric-purple rounded-lg font-semibold hover:bg-electric-purple/10 transition-all duration-300"
            >
              Voir les avant/après
            </Link>
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
                <div className="text-electric-purple mb-4 flex justify-center">
                  {step.icon}
                </div>
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
                <div className="text-electric-purple mb-4">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{benefit.title}</h3>
                <p className="text-gray-400">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Preview Section */}
      <section className="py-20 bg-[#050814]">
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
      <section className="py-20 bg-dark-navy">
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
            <Link
              to="/contact"
              className="inline-block px-10 py-5 bg-electric-purple text-white text-lg rounded-lg font-semibold btn-neon-purple hover:bg-electric-purple/90 transition-all duration-300"
            >
              Réserver un appel
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default HomePage;
