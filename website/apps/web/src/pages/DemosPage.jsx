
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import * as Tabs from '@radix-ui/react-tabs';
import { Video, Music, Mic, Megaphone, GraduationCap } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast.js';

const DemosPage = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('all');

  const categories = [
    { id: 'all', name: 'Tous', icon: <Video className="w-5 h-5" /> },
    { id: 'youtube', name: 'Vidéo YouTube', icon: <Video className="w-5 h-5" /> },
    { id: 'tutorial', name: 'Tutoriel', icon: <Music className="w-5 h-5" /> },
    { id: 'podcast', name: 'Podcast', icon: <Mic className="w-5 h-5" /> },
    { id: 'ad', name: 'Publicité', icon: <Megaphone className="w-5 h-5" /> },
    { id: 'training', name: 'Formation', icon: <GraduationCap className="w-5 h-5" /> }
  ];

  const demos = [
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

  const handleDemoRequest = () => {
    toast({
      title: "🚧 This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀"
    });
  };

  return (
    <>
      <Helmet>
        <title>Démos - EKHO Studio | Entendez la différence</title>
        <meta name="description" content="Découvrez des exemples réels de contenus adaptés par EKHO. Avant/après, même message, nouvelle langue." />
      </Helmet>

      <div className="min-h-screen bg-dark-navy pt-24 pb-20">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 neon-glow-purple">
              Entendez la différence.
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Voici des exemples réels de contenus adaptés par EKHO. Avant/après, même message, nouvelle langue.
            </p>
          </div>

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

                    <button
                      onClick={handleDemoRequest}
                      className="w-full px-6 py-3 bg-electric-purple text-white rounded-lg font-semibold btn-neon-purple hover:bg-electric-purple/90 transition-all duration-300"
                    >
                      Je veux le même résultat → Demander une démo
                    </button>
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
