
import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';

const AboutPage = () => {
  return (
    <>
      <Helmet>
        <title>À Propos - EKHO Studio | Notre histoire</title>
        <meta name="description" content="Découvrez l'histoire d'EKHO Studio et notre mission : permettre à chaque créateur de toucher de nouveaux marchés sans recommencer de zéro." />
      </Helmet>

      <div className="min-h-screen bg-dark-navy pt-24 pb-20">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-16">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-6xl font-bold text-white mb-6 neon-glow-purple"
            >
              EKHO, c'est une obsession de l'efficacité et du résultat.
            </motion.h1>
          </div>

          {/* Content */}
          <div className="max-w-4xl mx-auto space-y-12">
            {/* Story Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-[#050814] border border-electric-purple/30 rounded-xl p-8 md:p-12"
            >
              <h2 className="text-3xl font-bold text-white mb-6 neon-glow-blue">L'histoire</h2>
              <p className="text-lg text-gray-300 leading-relaxed mb-4">
                Après 15 ans dans des rôles commerciaux, dont plusieurs années en tant que Key Account Manager, j'ai vu trop d'entreprises limiter leur croissance par manque de ressources pour adapter leur contenu.
              </p>
              <p className="text-lg text-gray-300 leading-relaxed">
                Des créateurs talentueux, des marques innovantes, des agences brillantes... tous bloqués par la même barrière : le coût et la complexité de l'adaptation multilingue. EKHO est né de cette frustration.
              </p>
            </motion.div>

            {/* Mission Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-[#050814] border border-electric-purple/30 rounded-xl p-8 md:p-12"
            >
              <h2 className="text-3xl font-bold text-white mb-6 neon-glow-blue">La mission</h2>
              <p className="text-lg text-gray-300 leading-relaxed">
                Notre mission est simple : permettre à chaque créateur et chaque marque de toucher de nouveaux marchés sans recommencer de zéro. Vous avez déjà investi du temps, de l'argent et de l'énergie dans votre contenu. Il mérite de voyager au-delà des frontières linguistiques.
              </p>
            </motion.div>

            {/* Philosophy Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-[#050814] border border-electric-purple/30 rounded-xl p-8 md:p-12"
            >
              <h2 className="text-3xl font-bold text-white mb-6 neon-glow-blue">La philosophie</h2>
              <p className="text-lg text-gray-300 leading-relaxed">
                L'IA amplifie la créativité, elle ne la remplace pas. Chez EKHO, nous utilisons la technologie pour accélérer le processus, mais ce sont nos experts qui garantissent la qualité. Chaque vidéo est revue, affinée, optimisée par des humains qui comprennent les nuances culturelles et linguistiques.
              </p>
            </motion.div>

            {/* Author Bio */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-electric-purple/20 to-neon-blue/20 border border-electric-purple/40 rounded-xl p-8 md:p-12"
            >
              <div className="flex flex-col md:flex-row items-center gap-8">
                <img
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop"
                  alt="Rudy, Fondateur d'EKHO Studio"
                  className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-electric-purple"
                />
                <div className="text-center md:text-left">
                  <h3 className="text-2xl font-bold text-white mb-2">Rudy</h3>
                  <p className="text-electric-purple font-semibold mb-1">Fondateur, EKHO Studio</p>
                  <p className="text-gray-400">La Rochelle, France</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AboutPage;
