
import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast.js';

const PricingPage = () => {
  const { toast } = useToast();

  const pricingPlans = [
    {
      name: 'PACK STARTER',
      price: '€149',
      period: '/vidéo',
      description: 'Parfait pour tester EKHO',
      features: [
        '1 langue cible',
        'Vidéos jusqu\'à 10 min',
        'Livraison en 48h',
        'Support par email',
        'Révision incluse'
      ],
      highlighted: false
    },
    {
      name: 'PACK PRO',
      price: '€349',
      period: '/vidéo',
      description: 'Le plus choisi',
      features: [
        '2 langues cibles',
        'Vidéos jusqu\'à 30 min',
        'Livraison en 48h',
        'Support prioritaire',
        '2 révisions incluses',
        'Optimisation audio'
      ],
      highlighted: true
    },
    {
      name: 'PACK SUR-MESURE',
      price: 'Sur devis',
      period: '',
      description: 'Pour scaler sans limite',
      features: [
        'Langues illimitées',
        'Vidéos de toute durée',
        'Livraison express',
        'Account manager dédié',
        'Révisions illimitées',
        'Intégration API',
        'Clone de votre voix'
      ],
      highlighted: false
    }
  ];

  const addOns = [
    { name: 'Langue supplémentaire', price: '+89€' },
    { name: 'Synchronisation labiale avancée', price: '+79€' },
    { name: 'Optimisation audio source', price: '+49€' },
    { name: 'Livraison express (-24h)', price: '+59€' },
    { name: 'Sous-titres intégrés', price: '+39€' },
    { name: 'Clone de votre voix', price: 'Sur devis' }
  ];

  const handleSelectPlan = () => {
    toast({
      title: "🚧 This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀"
    });
  };

  return (
    <>
      <Helmet>
        <title>Tarifs - EKHO Studio | Des tarifs transparents</title>
        <meta name="description" content="Découvrez nos tarifs transparents et flexibles. Starter à 149€, Pro à 349€, ou sur-mesure pour vos besoins spécifiques." />
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
              Des tarifs transparents. Pensés pour scaler.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-gray-300 max-w-3xl mx-auto"
            >
              Pas de surprise, pas de frais cachés. Juste des tarifs clairs pour des résultats mesurables.
            </motion.p>
          </div>

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
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <Check className={`w-5 h-5 flex-shrink-0 mt-0.5 transition-colors duration-300 ${plan.highlighted ? 'text-electric-purple group-hover:text-neon-blue' : 'text-electric-purple'}`} />
                      <span className="text-gray-300 transition-colors duration-300 group-hover:text-white">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={handleSelectPlan}
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
