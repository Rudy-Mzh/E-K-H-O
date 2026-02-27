import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { openCalendly } from '@/lib/calendly.js';

const AboutPage = () => {
  return (
    <>
      <Helmet>
        <title>Libérer le vrai potentiel de votre contenu — EKHO Studio</title>
        <meta name="description" content="Votre contenu est un actif. Ne le laissez pas devenir passif. EKHO transforme vos actifs existants en versions multilingues." />
      </Helmet>

      {/* Hero with video background */}
      <section className="relative flex items-center justify-center min-h-[50vh] pt-24 pb-20 overflow-hidden">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0"
          src="/vision-bg.mp4"
        />
        <div className="absolute inset-0 bg-black/70 z-0" />
        <div className="relative z-10 container mx-auto px-4 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-4xl md:text-6xl font-bold text-white neon-glow-purple text-center"
          >
            Libérer le vrai potentiel de votre contenu
          </motion.h1>
        </div>
      </section>

      <div className="bg-dark-navy pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto space-y-8 pt-16">

            {/* Block 1 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-[#050814] border border-electric-purple/30 rounded-xl p-8 md:p-10 hover:border-electric-purple/60 hover:-translate-y-1 transition-all duration-300"
            >
              <span className="block text-center text-electric-purple font-bold text-sm tracking-widest uppercase mb-4">01</span>
              <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-6 neon-glow-purple">
                Votre contenu est un actif.<br />Ne le laissez pas devenir passif.
              </h2>
              <div className="w-12 h-px bg-electric-purple/50 mx-auto mb-6" />
              <p className="text-gray-300 text-lg leading-relaxed">
                Vous avez investi du temps, de l'argent et une énergie considérable dans la création de vos contenus. Vos vidéos, vos podcasts et vos campagnes ont déjà prouvé leur valeur sur votre marché. Pourtant, une fois diffusés, leur potentiel s'arrête aux frontières linguistiques. Vous laissez dormir une audience immense.
              </p>
            </motion.div>

            {/* Block 2 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-[#050814] border border-electric-purple/30 rounded-xl p-8 md:p-10 hover:border-electric-purple/60 hover:-translate-y-1 transition-all duration-300"
            >
              <span className="block text-center text-electric-purple font-bold text-sm tracking-widest uppercase mb-4">02</span>
              <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-6 neon-glow-purple">
                La course à la visibilité ne doit pas<br />être un éternel recommencement.
              </h2>
              <div className="w-12 h-px bg-electric-purple/50 mx-auto mb-6" />
              <p className="text-gray-300 text-lg leading-relaxed">
                Pendant que vous vous épuisez à produire toujours plus pour rester « trendy », vos concurrents internationaux scalent déjà leurs succès. Résultat ? Votre croissance reste linéaire, alors qu'elle pourrait être exponentielle.
              </p>
            </motion.div>

            {/* Block 3 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-[#050814] border border-electric-purple/30 rounded-xl p-8 md:p-10 hover:border-electric-purple/60 hover:-translate-y-1 transition-all duration-300"
            >
              <span className="block text-center text-electric-purple font-bold text-sm tracking-widest uppercase mb-4">03</span>
              <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-6 neon-glow-purple">
                C'est là qu'EKHO intervient —<br />sans repartir de zéro.
              </h2>
              <div className="w-12 h-px bg-electric-purple/50 mx-auto mb-6" />
              <p className="text-gray-300 text-lg leading-relaxed">
                Nous transformons vos actifs existants en versions multilingues. Nous utilisons l'IA pour la puissance et nos experts pour la précision, garantissant un rendu naturel, fidèle à votre voix et à votre ton. Vous gardez l'authenticité de votre message ; nous lui donnons une portée mondiale.
              </p>
            </motion.div>

            {/* Block 4 — Gains */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-electric-purple/10 to-neon-blue/10 border border-electric-purple/40 rounded-xl p-8 md:p-10 hover:border-electric-purple/70 hover:-translate-y-1 transition-all duration-300 text-center"
            >
              <span className="block text-center text-electric-purple font-bold text-sm tracking-widest uppercase mb-6">Le résultat</span>
              <div className="space-y-3">
                <p className="text-2xl md:text-3xl font-bold text-white">Gagnez du temps.</p>
                <p className="text-2xl md:text-3xl font-bold text-white">Ouvrez votre audience.</p>
                <p className="text-2xl md:text-3xl font-bold text-white">Boostez votre business.</p>
              </div>
            </motion.div>

            {/* Tagline + CTA */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center py-8 space-y-8"
            >
              <p className="text-4xl md:text-6xl font-bold text-white cursor-default select-none transition-colors duration-300 hover:text-electric-purple hover:[text-shadow:0_0_30px_rgba(123,47,255,0.8)]">
                Brutalement simple.<br />Insanely powerful.
              </p>
              <div>
                <button
                  onClick={openCalendly}
                  className="inline-block px-10 py-5 bg-electric-purple text-white text-lg rounded-lg font-semibold btn-neon-purple hover:bg-electric-purple/90 transition-all duration-300"
                >
                  Demander une démo gratuite
                </button>
              </div>
            </motion.div>

            {/* Separator */}
            <div className="border-t border-electric-purple/20" />

            {/* Founder */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-electric-purple/20 to-neon-blue/20 border border-electric-purple/40 rounded-xl p-8 md:p-12"
            >
              <div className="flex flex-col md:flex-row items-center gap-8">
                <img
                  src="/rudy.jpg"
                  alt="Rudy, Fondateur d'EKHO Studio"
                  className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover object-top border-4 border-electric-purple flex-shrink-0"
                />
                <div className="text-center md:text-left">
                  <h3 className="text-2xl font-bold text-white mb-2">Rudy Mezoughi</h3>
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
