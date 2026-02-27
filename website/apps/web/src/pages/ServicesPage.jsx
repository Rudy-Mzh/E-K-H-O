
import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Upload, Sparkles, Rocket } from 'lucide-react';

const ServicesPage = () => {
  const claimContainerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 1.0, delayChildren: 0.3 } }
  };

  const claimLine1Variants = {
    hidden: { opacity: 0, y: 30, filter: 'drop-shadow(0 0 0px rgba(123,47,255,0))' },
    visible: {
      opacity: 1, y: 0,
      filter: 'drop-shadow(0 0 12px rgba(123,47,255,0.7))',
      transition: { duration: 1.2, ease: 'easeOut' }
    }
  };

  const claimLine2Variants = {
    hidden: { opacity: 0, y: 30, filter: 'drop-shadow(0 0 0px rgba(123,47,255,0)) drop-shadow(0 0 0px rgba(123,47,255,0))' },
    visible: {
      opacity: 1, y: 0,
      filter: 'drop-shadow(0 0 18px rgba(123,47,255,0.85)) drop-shadow(0 0 40px rgba(123,47,255,0.4))',
      transition: { duration: 1.3, ease: 'easeOut' }
    }
  };

  const claimLine3Variants = {
    hidden: { opacity: 0, y: 30, filter: 'drop-shadow(0 0 0px rgba(123,47,255,0)) drop-shadow(0 0 0px rgba(123,47,255,0)) drop-shadow(0 0 0px rgba(123,47,255,0))' },
    visible: {
      opacity: 1, y: 0,
      filter: 'drop-shadow(0 0 25px rgba(123,47,255,1)) drop-shadow(0 0 60px rgba(123,47,255,0.7)) drop-shadow(0 0 100px rgba(123,47,255,0.35))',
      transition: { duration: 1.5, ease: 'easeOut' }
    }
  };

  const steps = [
    {
      number: '01',
      icon: <Upload className="w-16 h-16" />,
      title: 'Vous partagez',
      description: 'Envoyez-nous votre vidéo et vos langues cibles. Nous analysons le contenu et vous proposons un devis en 24h. Simple, rapide, transparent.'
    },
    {
      number: '02',
      icon: <Sparkles className="w-16 h-16" />,
      title: 'Nous adaptons',
      description: "L'IA accélère la traduction et la synchronisation. Nos experts affinent chaque détail pour garantir la fidélité au message original.",
      highlight: "L'IA accélère le processus. Nos experts garantissent la qualité.",
      sub: "Qualité humaine, vitesse technologique."
    },
    {
      number: '03',
      icon: <Rocket className="w-16 h-16" />,
      title: 'Vous déployez',
      description: 'Votre vidéo adaptée est livrée en moins de 48h, prête à être publiée sur vos canaux. Nouveau marché, nouvelle audience, nouveaux revenus.'
    }
  ];

  return (
    <>
      <Helmet>
        <title>Services - EKHO Studio | Comment ça marche</title>
        <meta name="description" content="Découvrez le processus EKHO en 3 étapes : partagez, nous adaptons, vous déployez. Simple, rapide, efficace." />
      </Helmet>

      {/* Hero with video background */}
      <section className="relative flex items-center justify-center min-h-[50vh] pt-24 pb-20 overflow-hidden">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0"
          src="/services-bg.mp4"
        />
        <div className="absolute inset-0 bg-black/70 z-0" />
        <div className="relative z-10 container mx-auto px-4 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-4xl md:text-6xl font-bold text-white mb-6 neon-glow-purple"
          >
            Comment ça marche
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-xl text-gray-300 max-w-3xl mx-auto"
          >
            Un processus simple en 3 étapes pour transformer vos vidéos et toucher de nouveaux marchés.
          </motion.p>
        </div>
      </section>

      <div className="bg-dark-navy pb-20">
        <div className="container mx-auto px-4 pt-16">

          {/* Steps */}
          <div className="max-w-5xl mx-auto space-y-12 mb-20">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="bg-[#050814] border border-electric-purple/30 rounded-xl p-8 md:p-12 hover:border-electric-purple/60 transition-all duration-300"
              >
                <div className="flex flex-col md:flex-row items-start gap-8">
                  <div className="flex-shrink-0">
                    <div className="text-electric-purple mb-4">
                      {step.icon}
                    </div>
                    <span className="text-6xl font-bold text-electric-purple/20">{step.number}</span>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{step.title}</h2>
                    <p className="text-lg text-gray-300 leading-relaxed">{step.description}</p>
                    {step.highlight && (
                      <div className="mt-5 border-l-4 border-electric-purple pl-5">
                        <p className="text-xl md:text-2xl font-bold text-white leading-snug">
                          {step.highlight}
                        </p>
                        {step.sub && (
                          <p className="mt-2 text-electric-purple font-semibold tracking-wide">{step.sub}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Differentiator Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto bg-gradient-to-br from-electric-purple/20 to-neon-blue/20 border border-electric-purple/40 rounded-xl p-8 md:p-12 hover:border-electric-purple/70 hover:shadow-[0_0_60px_rgba(123,47,255,0.35)] transition-all duration-300 cursor-default"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 neon-glow-blue text-center">
              EKHO n'est pas un outil de traduction.<br className="hidden md:block" /> C'est un studio d'adaptation.
            </h2>

            <p className="text-lg text-gray-300 leading-relaxed text-center mb-4">
              Nous ne nous contentons pas de traduire des mots. Nous adaptons votre message pour qu'il résonne dans une nouvelle culture, avec la même force et la même authenticité.
            </p>

            <p className="text-xl md:text-2xl font-semibold text-white text-center mb-8">
              Votre message intact — votre impact, décuplé.
            </p>

            {/* Closing claim — cascade + glow on scroll */}
            <motion.div
              variants={claimContainerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="border-t border-electric-purple/30 pt-8 text-center space-y-3"
            >
              <motion.p
                variants={claimLine1Variants}
                className="text-2xl md:text-4xl font-bold text-gray-300"
              >
                IA pour la vitesse
              </motion.p>
              <motion.p
                variants={claimLine2Variants}
                className="text-3xl md:text-5xl font-bold text-white"
              >
                Humains pour l'exigence
              </motion.p>
              <motion.p
                variants={claimLine3Variants}
                className="text-4xl md:text-7xl font-bold text-electric-purple"
              >
                Fidèle à votre ADN
              </motion.p>
            </motion.div>
          </motion.div>

        </div>
      </div>
    </>
  );
};

export default ServicesPage;
