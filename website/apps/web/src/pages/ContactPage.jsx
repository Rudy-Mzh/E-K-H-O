
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Mail, Phone, Calendar } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast.js';

const ContactPage = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    need: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    toast({
      title: "Merci ! Nous vous répondrons sous 24h.",
      description: "Votre message a été envoyé avec succès."
    });
  };

  return (
    <>
      <Helmet>
        <title>Contact - EKHO Studio | On vous répond sous 24h</title>
        <meta name="description" content="Contactez EKHO Studio. Nous vous répondons sous 24h. Demandez une démo ou réservez un appel de 20 minutes." />
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
              On vous répond sous 24h.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-gray-300 max-w-3xl mx-auto"
            >
              Une question ? Un projet ? Parlons-en. Nous sommes là pour vous aider.
            </motion.p>
          </div>

          <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-[#050814] border border-electric-purple/30 rounded-xl p-8"
            >
              <h2 className="text-2xl font-bold text-white mb-6">Envoyez-nous un message</h2>
              {submitted ? (
                <div className="bg-electric-purple/20 border border-electric-purple rounded-lg p-6 text-center">
                  <p className="text-white text-lg font-semibold mb-2">Merci !</p>
                  <p className="text-gray-300">Nous vous répondrons sous 24h.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-white font-semibold mb-2">
                      Prénom/Nom *
                    </label>
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
                    <label htmlFor="email" className="block text-white font-semibold mb-2">
                      Email professionnel *
                    </label>
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
                    <label htmlFor="need" className="block text-white font-semibold mb-2">
                      Votre besoin *
                    </label>
                    <select
                      id="need"
                      name="need"
                      value={formData.need}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-dark-navy border border-electric-purple/30 rounded-lg text-white focus:outline-none focus:border-electric-purple transition-colors"
                    >
                      <option value="">Sélectionnez une option</option>
                      <option value="creator">Créateur</option>
                      <option value="brand">Marque</option>
                      <option value="agency">Agence</option>
                      <option value="other">Autre</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-white font-semibold mb-2">
                      Lien vers votre vidéo ou message libre *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows="5"
                      className="w-full px-4 py-3 bg-dark-navy border border-electric-purple/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-electric-purple transition-colors resize-none"
                      placeholder="Parlez-nous de votre projet..."
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="w-full px-6 py-4 bg-electric-purple text-white rounded-lg font-semibold btn-neon-purple hover:bg-electric-purple/90 transition-all duration-300"
                  >
                    Envoyer
                  </button>
                </form>
              )}
            </motion.div>

            {/* Contact Info & Calendly */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
              {/* Calendly Section */}
              <div className="bg-gradient-to-br from-electric-purple/20 to-neon-blue/20 border border-electric-purple/40 rounded-xl p-8">
                <div className="flex items-center gap-3 mb-4">
                  <Calendar className="w-8 h-8 text-electric-purple" />
                  <h2 className="text-2xl font-bold text-white">Réservez un appel</h2>
                </div>
                <p className="text-gray-300 mb-6">
                  Ou réservez un appel de 20 min directement avec notre équipe pour discuter de votre projet.
                </p>
                <div className="bg-dark-navy/50 rounded-lg p-6 text-center">
                  <p className="text-gray-400 mb-4">Intégration Calendly à venir</p>
                  <button
                    onClick={() => toast({
                      title: "🚧 This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀"
                    })}
                    className="px-6 py-3 bg-electric-purple text-white rounded-lg font-semibold btn-neon-purple hover:bg-electric-purple/90 transition-all duration-300"
                  >
                    Réserver un créneau
                  </button>
                </div>
              </div>

              {/* Contact Info */}
              <div className="bg-[#050814] border border-electric-purple/30 rounded-xl p-8">
                <h2 className="text-2xl font-bold text-white mb-6">Informations de contact</h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <Mail className="w-6 h-6 text-electric-purple flex-shrink-0 mt-1" />
                    <div>
                      <p className="text-white font-semibold mb-1">Email</p>
                      <a href="mailto:contact@ekho-studio.com" className="text-gray-400 hover:text-electric-purple transition-colors">
                        contact@ekho-studio.com
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <Phone className="w-6 h-6 text-electric-purple flex-shrink-0 mt-1" />
                    <div>
                      <p className="text-white font-semibold mb-1">Téléphone</p>
                      <a href="tel:+33XXXXXXXXX" className="text-gray-400 hover:text-electric-purple transition-colors">
                        +33 X XX XX XX XX
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ContactPage;
