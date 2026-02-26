
import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Upload, Sparkles, Rocket } from 'lucide-react';

const ServicesPage = () => {
  const steps = [
    {
      number: '01',
      icon: <Upload className="w-16 h-16" />,
      title: 'Vous partagez',
      description: 'Envoyez votre vidéo et vos langues cibles. Nous analysons le contenu et vous proposons un devis en 24h. Simple, rapide, transparent.'
    },
    {
      number: '02',
      icon: <Sparkles className="w-16 h-16" />,
      title: 'Nous adaptons',
      description: "L'IA accélère la traduction et la synchronisation. Nos experts affinent chaque détail pour garantir la fidélité au message original. Qualité humaine, vitesse technologique."
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

      <div className="min-h-screen bg-dark-navy pt-24 pb-20">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-20">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-6xl font-bold text-white mb-6 neon-glow-purple"
            >
              Comment ça marche
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-gray-300 max-w-3xl mx-auto"
            >
              Un processus simple en 3 étapes pour transformer vos vidéos et toucher de nouveaux marchés.
            </motion.p>
          </div>

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
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Differentiator Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto bg-gradient-to-br from-electric-purple/20 to-neon-blue/20 border border-electric-purple/40 rounded-xl p-8 md:p-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 neon-glow-blue text-center">
              EKHO n'est pas un outil de traduction. C'est un studio d'adaptation.
            </h2>
            <p className="text-lg text-gray-300 leading-relaxed text-center">
              Nous ne nous contentons pas de traduire des mots. Nous adaptons votre message pour qu'il résonne dans une nouvelle culture, avec la même force et la même authenticité. L'IA accélère le processus, nos experts garantissent la qualité. C'est la différence entre une traduction automatique et une adaptation professionnelle.
            </p>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default ServicesPage;
