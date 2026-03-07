
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Calendar, CreditCard, Lock, Wallet } from 'lucide-react';
import { openCalendly } from '@/lib/calendly.js';

// ─── Liens de paiement ──────────────────────────────────────────────────────
//
// STRIPE (recommandé, ~1.5% + 0.25€ par transaction)
// 1. Créez un compte sur https://stripe.com
// 2. Dashboard → Payment Links → créer un lien par pack
// 3. Collez les URLs ci-dessous (ex: https://buy.stripe.com/xxxx)
//
// PAYPAL (alternatif, ~3.4% + frais fixes)
// 1. Compte PayPal Business sur https://www.paypal.com/fr/business
// 2. Outils → Boutons de paiement → Créer un lien
// 3. Collez les URLs ci-dessous (ex: https://www.paypal.com/ncp/payment/xxxx)
//
// Laissez '' pour masquer le bouton correspondant.
// ───────────────────────────────────────────────────────────────────────────
const STRIPE_LINKS = {
  'PACK STARTER':    '',  // TODO: https://buy.stripe.com/xxxx
  'PACK PRO':        '',  // TODO: https://buy.stripe.com/xxxx
  'PACK SUR-MESURE': '',
};

const PAYPAL_LINKS = {
  'PACK STARTER':    '',  // TODO: https://www.paypal.com/ncp/payment/xxxx
  'PACK PRO':        '',  // TODO: https://www.paypal.com/ncp/payment/xxxx
  'PACK SUR-MESURE': '',
};

const OrderModal = ({ plan, onClose }) => {
  if (!plan) return null;

  const stripeUrl = STRIPE_LINKS[plan.name] || '';
  const paypalUrl = PAYPAL_LINKS[plan.name] || '';
  const hasStripe = !!stripeUrl;
  const hasPaypal = !!paypalUrl;
  const hasAnyPayment = hasStripe || hasPaypal;

  const handleCalendly = () => {
    onClose();
    openCalendly();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.3 }}
        className="relative w-full max-w-md bg-[#080b1a] border border-electric-purple/50 rounded-2xl shadow-[0_0_60px_rgba(123,47,255,0.3)] overflow-hidden"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
          <X size={20} />
        </button>

        <div className="p-8">
          {/* Plan summary */}
          <div className="mb-6">
            <span className="inline-block px-3 py-1 bg-electric-purple/20 text-electric-purple text-xs font-semibold rounded-full mb-3">
              Pack sélectionné
            </span>
            <h2 className="text-2xl font-bold text-white">{plan.name}</h2>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-3xl font-bold text-electric-purple">{plan.price}</span>
              {plan.period && <span className="text-gray-400">{plan.period}</span>}
            </div>
          </div>

          {/* Features summary */}
          <ul className="space-y-2 mb-6 border-t border-electric-purple/20 pt-5">
            {plan.features.slice(0, 4).map((f, i) => (
              <li key={i} className="flex items-center gap-2 text-gray-300 text-sm">
                <Check size={14} className="text-electric-purple flex-shrink-0" />
                {f.text}
              </li>
            ))}
            {plan.features.length > 4 && (
              <li className="text-gray-500 text-xs pl-5">+ {plan.features.length - 4} autres inclus</li>
            )}
          </ul>

          {/* Payment buttons */}
          <div className="space-y-3">
            {hasStripe && (
              <a
                href={stripeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-4 bg-electric-purple text-white rounded-xl font-semibold btn-neon-purple hover:bg-electric-purple/90 transition-all duration-300"
              >
                <CreditCard size={18} />
                Payer par carte — Stripe
              </a>
            )}

            {hasPaypal && (
              <a
                href={paypalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-4 bg-[#003087] text-white rounded-xl font-semibold hover:bg-[#002370] transition-all duration-300"
              >
                <Wallet size={18} />
                Payer avec PayPal
              </a>
            )}

            <button
              onClick={handleCalendly}
              className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-semibold transition-all duration-300 ${
                hasAnyPayment
                  ? 'border border-electric-purple/40 text-electric-purple hover:bg-electric-purple/10'
                  : 'bg-electric-purple text-white btn-neon-purple hover:bg-electric-purple/90'
              }`}
            >
              <Calendar size={18} />
              {hasAnyPayment ? 'Ou réserver un appel' : 'Réserver un appel pour commander'}
            </button>
          </div>

          {/* Trust indicators */}
          <div className="flex items-center justify-center gap-2 mt-4">
            <Lock size={12} className="text-gray-500" />
            <p className="text-gray-500 text-xs">
              {hasAnyPayment ? 'Paiement 100% sécurisé · Sans engagement' : 'Appel gratuit, sans engagement · 20 min'}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const PricingPage = () => {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const pricingPlans = [
    {
      name: 'PACK STARTER',
      price: '€149',
      period: '/vidéo',
      description: 'Parfait pour tester EKHO',
      features: [
        { text: 'Jusqu\'à 10 min de vidéo' },
        { text: '1 langue cible' },
        { text: 'Synchronisation labiale avancée incluse' },
        { text: 'Un seul intervenant sur la vidéo' },
        { text: 'Livraison en 48h' },
        { text: 'Support par email' },
        { text: '1 révision incluse' },
      ],
      highlighted: false
    },
    {
      name: 'PACK PRO',
      price: '€349',
      period: '/vidéo',
      description: 'Le plus choisi',
      features: [
        { text: 'Jusqu\'à 30 min de vidéo', badge: '-22% vs Pack Starter' },
        { text: '1 langue cible' },
        { text: 'Synchronisation labiale avancée incluse' },
        { text: 'Un seul intervenant sur la vidéo' },
        { text: 'Livraison en 48h' },
        { text: 'Support prioritaire' },
        { text: '2 révisions incluses' },
        { text: 'Optimisation audio' },
      ],
      highlighted: true
    },
    {
      name: 'PACK SUR-MESURE',
      price: 'Sur devis',
      period: '',
      description: 'Pour scaler sans limite',
      features: [
        { text: 'Langues illimitées' },
        { text: 'Vidéos de toute durée' },
        { text: 'Multi-intervenants disponibles' },
        { text: 'Livraison express' },
        { text: 'Account manager dédié' },
        { text: 'Révisions incluses selon projet' },
        { text: 'Script livrable' },
        { text: 'Sous-titres personnalisés inclus' },
        { text: 'Clone de votre voix' },
      ],
      highlighted: false
    }
  ];

  const addOns = [
    { name: 'Langue supplémentaire', price: '+89€' },
    { name: 'Optimisation audio source', price: '+49€' },
    { name: 'Livraison express (-24h)', price: '+59€' },
    { name: 'Sous-titres intégrés', price: '+39€' },
    { name: 'Clone de votre voix', price: 'Sur devis' }
  ];

  return (
    <>
      <AnimatePresence>
        {selectedPlan && (
          <OrderModal plan={selectedPlan} onClose={() => setSelectedPlan(null)} />
        )}
      </AnimatePresence>

      <Helmet>
        <title>Tarifs - EKHO Studio | Des tarifs transparents</title>
        <meta name="description" content="Découvrez nos tarifs transparents et flexibles. Starter à 149€, Pro à 349€, ou sur-mesure pour vos besoins spécifiques." />
      </Helmet>

      {/* Hero with video background */}
      <section className="relative flex items-center justify-center min-h-[50vh] pt-24 pb-20 overflow-hidden">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0"
          src="/pricing-bg.mp4"
        />
        <div className="absolute inset-0 bg-black/70 z-0" />
        <div className="relative z-10 container mx-auto px-4 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-4xl md:text-6xl font-bold text-white mb-6 neon-glow-purple"
          >
            Des tarifs transparents. Pensés pour scaler.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-xl text-gray-300 max-w-3xl mx-auto"
          >
            Pas de surprise, pas de frais cachés. Juste des tarifs clairs pour des résultats mesurables.
          </motion.p>
        </div>
      </section>

      <div className="bg-dark-navy pb-20">
        <div className="container mx-auto px-4 pt-16">

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto mb-20">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`group relative rounded-xl p-8 transition-all duration-300 ease-out hover:-translate-y-2 ${
                  plan.highlighted
                    ? 'bg-gradient-to-br from-electric-purple/20 to-neon-blue/20 border-2 border-electric-purple hover:border-neon-blue hover:from-electric-purple/30 hover:to-neon-blue/30 hover:shadow-[0_0_40px_rgba(0,194,255,0.5),inset_0_0_20px_rgba(0,194,255,0.2)]'
                    : 'bg-[#050814] border border-electric-purple/30 hover:border-electric-purple hover:bg-electric-purple/5 hover:shadow-[0_0_30px_rgba(123,47,255,0.4),inset_0_0_20px_rgba(123,47,255,0.15)]'
                }`}
              >
                {plan.highlighted && (
                  <div className="text-center mb-4">
                    <span className="inline-block px-4 py-1 bg-electric-purple text-white text-sm font-semibold rounded-full transition-all duration-300 group-hover:bg-neon-blue group-hover:shadow-[0_0_20px_rgba(0,194,255,0.8)] group-hover:scale-105">
                      {plan.description}
                    </span>
                  </div>
                )}
                <h3 className="text-2xl font-bold text-white mb-2 transition-colors duration-300 group-hover:text-white">
                  {plan.name}
                </h3>
                {!plan.highlighted && (
                  <p className="text-gray-400 mb-4 transition-colors duration-300 group-hover:text-gray-300">
                    {plan.description}
                  </p>
                )}
                <div className="mb-6">
                  <span className={`text-4xl md:text-5xl font-bold transition-colors duration-300 ${plan.highlighted ? 'text-electric-purple group-hover:text-neon-blue group-hover:drop-shadow-[0_0_10px_rgba(0,194,255,0.8)]' : 'text-electric-purple group-hover:drop-shadow-[0_0_10px_rgba(123,47,255,0.8)]'}`}>
                    {plan.price}
                  </span>
                  <span className="text-gray-400 ml-2 transition-colors duration-300 group-hover:text-gray-300">
                    {plan.period}
                  </span>
                  <sup className="text-electric-purple/70 text-sm ml-1">*</sup>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <Check className={`w-5 h-5 flex-shrink-0 mt-0.5 transition-colors duration-300 ${plan.highlighted ? 'text-electric-purple group-hover:text-neon-blue' : 'text-electric-purple'}`} />
                      <span className="text-gray-300 transition-colors duration-300 group-hover:text-white flex flex-wrap items-center gap-2">
                        {feature.text}
                        {feature.badge && (
                          <span className="opacity-0 group-hover:opacity-100 transition-all duration-300 text-xs bg-hot-pink/20 text-hot-pink border border-hot-pink/40 px-2 py-0.5 rounded-full font-semibold whitespace-nowrap">
                            {feature.badge}
                          </span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => setSelectedPlan(plan)}
                  className={`w-full py-3 rounded-lg font-semibold transition-all duration-300 ${
                    plan.highlighted
                      ? 'bg-electric-purple text-white group-hover:bg-neon-blue group-hover:shadow-[0_0_20px_rgba(0,194,255,0.6)]'
                      : 'bg-transparent border-2 border-electric-purple text-electric-purple group-hover:bg-electric-purple group-hover:text-white group-hover:shadow-[0_0_20px_rgba(123,47,255,0.5)]'
                  }`}
                >
                  Choisir ce pack
                </button>
              </motion.div>
            ))}
          </div>

          {/* Footnote */}
          <p className="text-gray-500 text-sm text-center max-w-2xl mx-auto mb-16 border border-electric-purple/20 rounded-lg px-6 py-4">
            <span className="text-electric-purple/70 font-semibold">* </span>
            Nos tarifs sont fournis à titre indicatif. Chaque projet étant unique, seul un devis établi suite à un échange sera retenu comme base contractuelle.
          </p>

          {/* Add-ons Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-8 text-center neon-glow-blue">
              Options supplémentaires
            </h2>
            <div className="bg-[#050814] border border-electric-purple/30 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-electric-purple/10">
                  <tr>
                    <th className="px-6 py-4 text-left text-white font-semibold">Option</th>
                    <th className="px-6 py-4 text-right text-white font-semibold">Prix</th>
                  </tr>
                </thead>
                <tbody>
                  {addOns.map((addon, index) => (
                    <tr
                      key={index}
                      className="border-t border-electric-purple/20 hover:bg-electric-purple/10 transition-colors duration-300"
                    >
                      <td className="px-6 py-4 text-gray-300">{addon.name}</td>
                      <td className="px-6 py-4 text-right text-electric-purple font-semibold">{addon.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default PricingPage;
