import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, ArrowLeft, Check, User, Mail, Video, Globe, Search } from 'lucide-react';

const FORMSPREE_URL = 'https://formspree.io/f/xvzbldlq';

const PROFILES = [
  { id: 'creator', label: 'Créateur', emoji: '🎬', desc: 'YouTube, Instagram, TikTok…' },
  { id: 'brand', label: 'Marque', emoji: '🏢', desc: 'Pub, brand content, tutoriels…' },
  { id: 'agency', label: 'Agence', emoji: '🚀', desc: 'Contenu pour vos clients' },
  { id: 'other', label: 'Autre', emoji: '✨', desc: 'Formation, coaching, autre…' },
];

const ALL_LANGUAGES = [
  'Afrikaans', 'Albanais', 'Allemand', 'Amharique', 'Anglais', 'Arabe', 'Arménien',
  'Azerbaïdjanais', 'Bambara', 'Basque', 'Bengali', 'Biélorusse', 'Birman', 'Bosniaque',
  'Bulgare', 'Catalan', 'Chinois (Simplifié)', 'Chinois (Traditionnel)', 'Cingalais',
  'Coréen', 'Créole haïtien', 'Croate', 'Danois', 'Dari', 'Espagnol', 'Espéranto',
  'Estonien', 'Féroïen', 'Fidjien', 'Finnois', 'Français', 'Gaélique écossais',
  'Galicien', 'Géorgien', 'Grec', 'Guarani', 'Gujarati', 'Haoussa', 'Hawaiien',
  'Hébreu', 'Hindi', 'Hmong', 'Hongrois', 'Igbo', 'Indonésien', 'Inuktitut',
  'Irlandais', 'Islandais', 'Italien', 'Japonais', 'Javanais', 'Kannada', 'Kazakh',
  'Khmer', 'Kinyarwanda', 'Kirghiz', 'Konkani', 'Kurde', 'Laotien', 'Latin',
  'Letton', 'Lingala', 'Lituanien', 'Luxembourgeois', 'Macédonien', 'Malgache',
  'Malais', 'Malayalam', 'Maltais', 'Maori', 'Marathi', 'Marshallais', 'Mongol',
  'Mooré', 'Néerlandais', 'Népalais', 'Norvégien', 'Oromo', 'Ourdou', 'Ouzbek',
  'Ouïghour', 'Pachtô', 'Pendjabi', 'Persan', 'Peul (Fulfulde)', 'Polonais',
  'Portugais (Brésil)', 'Portugais (Portugal)', 'Quechua', 'Roumain', 'Russe',
  'Samoan', 'Sanskrit', 'Serbe', 'Sesotho', 'Shona', 'Sindhi', 'Siswati',
  'Slovaque', 'Slovène', 'Somali', 'Suédois', 'Swahili', 'Tadjik', 'Tagalog (Filipino)',
  'Tamoul', 'Tatar', 'Tchèque', 'Telugu', 'Thaï', 'Tibétain', 'Tigrigna',
  'Tongien', 'Tswana', 'Turc', 'Turkmène', 'Twi', 'Ukrainien', 'Venda',
  'Vietnamien', 'Walloon', 'Wolof', 'Xhosa', 'Yoruba', 'Zaza', 'Zoulou',
].sort();

const STEP_ICONS = [User, Mail, Video, Globe];
const STEP_LABELS = ['Profil', 'Contact', 'Vidéo', 'Langue'];

// Searchable language dropdown
const LanguageSelector = ({ selected, onChange }) => {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const filtered = ALL_LANGUAGES.filter(
    (l) => l.toLowerCase().includes(query.toLowerCase()) && !selected.includes(l)
  );

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const add = (lang) => {
    onChange([...selected, lang]);
    setQuery('');
  };

  const remove = (lang) => {
    onChange(selected.filter((l) => l !== lang));
  };

  return (
    <div ref={ref} className="relative">
      {/* Selected tags */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {selected.map((lang) => (
            <span
              key={lang}
              className="inline-flex items-center gap-1 px-3 py-1 bg-electric-purple/20 border border-electric-purple/50 text-electric-purple text-sm rounded-full"
            >
              {lang}
              <button onClick={() => remove(lang)} className="hover:text-white ml-1">
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Search input */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder="Rechercher une langue…"
          className="w-full pl-9 pr-4 py-3 bg-[#0d1023] border border-electric-purple/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-electric-purple transition-colors"
        />
      </div>

      {/* Dropdown */}
      {open && filtered.length > 0 && (
        <div className="absolute z-20 w-full mt-1 bg-[#0d1023] border border-electric-purple/30 rounded-lg overflow-hidden shadow-xl">
          <div className="max-h-48 overflow-y-auto">
            {filtered.slice(0, 40).map((lang) => (
              <button
                key={lang}
                onClick={() => { add(lang); setOpen(false); }}
                className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-electric-purple/20 hover:text-white transition-colors"
              >
                {lang}
              </button>
            ))}
          </div>
        </div>
      )}

      {selected.length === 0 && (
        <p className="text-gray-500 text-xs mt-2">+130 langues disponibles · HeyGen & ElevenLabs</p>
      )}
    </div>
  );
};

const DemoTunnelModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({ profile: '', name: '', email: '', videoUrl: '', languages: [] });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setStep(0);
        setData({ profile: '', name: '', email: '', videoUrl: '', languages: [] });
        setSubmitted(false);
        setError(null);
      }, 300);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const profileLabel = PROFILES.find((p) => p.id === data.profile)?.label || data.profile;
      const res = await fetch(FORMSPREE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          need: profileLabel,
          message: `Demande de démo gratuite\n\nProfil : ${profileLabel}\nLien vidéo : ${data.videoUrl || 'Non renseigné'}\nLangues cibles : ${data.languages.join(', ') || 'Non renseigné'}`,
        }),
      });
      if (res.ok) {
        setSubmitted(true);
      } else {
        setError('Une erreur est survenue. Veuillez réessayer.');
      }
    } catch {
      setError('Vérifiez votre connexion et réessayez.');
    } finally {
      setLoading(false);
    }
  };

  const canNext = () => {
    if (step === 0) return !!data.profile;
    if (step === 1) return data.name.trim().length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email);
    if (step === 2) return true;
    if (step === 3) return data.languages.length > 0;
    return false;
  };

  if (!isOpen) return null;

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
        className="relative w-full max-w-lg bg-[#080b1a] border border-electric-purple/50 rounded-2xl shadow-[0_0_60px_rgba(123,47,255,0.3)] overflow-hidden"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10">
          <X size={20} />
        </button>

        {submitted ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-electric-purple/20 border border-electric-purple rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-8 h-8 text-electric-purple" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Demande reçue !</h2>
            <p className="text-gray-300 mb-2">
              Nous analysons votre contenu et vous recontactons <span className="text-electric-purple font-semibold">sous 24h</span>.
            </p>
            <p className="text-gray-400 text-sm mb-8">Un expert EKHO vous préparera une démo personnalisée.</p>
            <button onClick={onClose} className="px-8 py-3 bg-electric-purple text-white rounded-lg font-semibold hover:bg-electric-purple/90 transition-all">
              Fermer
            </button>
          </div>
        ) : (
          <>
            {/* Step indicator */}
            <div className="px-8 pt-8 pb-4">
              <div className="flex items-center justify-between mb-6">
                {STEP_LABELS.map((label, i) => {
                  const Icon = STEP_ICONS[i];
                  const active = i === step;
                  const done = i < step;
                  return (
                    <React.Fragment key={i}>
                      <div className="flex flex-col items-center gap-1">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${done ? 'bg-electric-purple border-electric-purple' : active ? 'bg-electric-purple/20 border-electric-purple' : 'bg-transparent border-gray-600'}`}>
                          {done ? <Check size={16} className="text-white" /> : <Icon size={16} className={active ? 'text-electric-purple' : 'text-gray-500'} />}
                        </div>
                        <span className={`text-xs font-medium ${active ? 'text-electric-purple' : done ? 'text-white' : 'text-gray-500'}`}>{label}</span>
                      </div>
                      {i < STEP_LABELS.length - 1 && (
                        <div className={`flex-1 h-0.5 mx-2 mb-5 transition-all duration-300 ${i < step ? 'bg-electric-purple' : 'bg-gray-700'}`} />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>

            {/* Step content */}
            <div className="px-8 pb-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Step 0 — Profile */}
                  {step === 0 && (
                    <>
                      <h2 className="text-xl font-bold text-white mb-1">Qui êtes-vous ?</h2>
                      <p className="text-gray-400 text-sm mb-5">Nous personnaliserons votre démo selon votre profil.</p>
                      <div className="grid grid-cols-2 gap-3">
                        {PROFILES.map((p) => (
                          <button
                            key={p.id}
                            onClick={() => { setData((d) => ({ ...d, profile: p.id })); setStep(1); }}
                            className={`p-4 rounded-xl border-2 text-left transition-all duration-200 hover:-translate-y-0.5 ${data.profile === p.id ? 'border-electric-purple bg-electric-purple/10' : 'border-gray-700 hover:border-electric-purple/50 bg-[#0d1023]'}`}
                          >
                            <span className="text-2xl mb-2 block">{p.emoji}</span>
                            <span className="text-white font-semibold block">{p.label}</span>
                            <span className="text-gray-400 text-xs">{p.desc}</span>
                          </button>
                        ))}
                      </div>
                    </>
                  )}

                  {/* Step 1 — Contact (email first to filter fakes) */}
                  {step === 1 && (
                    <>
                      <h2 className="text-xl font-bold text-white mb-1">Vos coordonnées</h2>
                      <p className="text-gray-400 text-sm mb-5">On vous envoie votre démo personnalisée sous 24h.</p>
                      <div className="space-y-4">
                        <input
                          type="text"
                          value={data.name}
                          onChange={(e) => setData((d) => ({ ...d, name: e.target.value }))}
                          placeholder="Prénom et Nom *"
                          className="w-full px-4 py-3 bg-[#0d1023] border border-electric-purple/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-electric-purple transition-colors"
                        />
                        <input
                          type="email"
                          value={data.email}
                          onChange={(e) => setData((d) => ({ ...d, email: e.target.value }))}
                          placeholder="Email professionnel *"
                          className="w-full px-4 py-3 bg-[#0d1023] border border-electric-purple/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-electric-purple transition-colors"
                        />
                      </div>
                    </>
                  )}

                  {/* Step 2 — Video URL */}
                  {step === 2 && (
                    <>
                      <h2 className="text-xl font-bold text-white mb-1">Votre vidéo</h2>
                      <p className="text-gray-400 text-sm mb-5">Collez le lien de votre vidéo. Si vous n'en avez pas encore, laissez vide.</p>
                      <input
                        type="url"
                        value={data.videoUrl}
                        onChange={(e) => setData((d) => ({ ...d, videoUrl: e.target.value }))}
                        placeholder="https://youtube.com/watch?v=…"
                        className="w-full px-4 py-3 bg-[#0d1023] border border-electric-purple/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-electric-purple transition-colors text-sm"
                      />
                      <p className="text-gray-500 text-xs mt-2">YouTube · Vimeo · Google Drive · WeTransfer · Dropbox</p>
                    </>
                  )}

                  {/* Step 3 — Language (searchable, 130+) */}
                  {step === 3 && (
                    <>
                      <h2 className="text-xl font-bold text-white mb-1">Langue(s) cible(s)</h2>
                      <p className="text-gray-400 text-sm mb-5">Vers quelle(s) langue(s) souhaitez-vous adapter votre contenu ?</p>
                      <LanguageSelector
                        selected={data.languages}
                        onChange={(langs) => setData((d) => ({ ...d, languages: langs }))}
                      />
                      {error && <p className="text-red-400 text-sm mt-3">{error}</p>}
                    </>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Navigation */}
              {step > 0 && (
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setStep((s) => s - 1)}
                    className="flex items-center gap-2 px-4 py-3 border border-gray-600 text-gray-300 rounded-lg hover:border-gray-400 transition-colors"
                  >
                    <ArrowLeft size={16} />
                    Retour
                  </button>

                  {step < 3 ? (
                    <button
                      onClick={() => setStep((s) => s + 1)}
                      disabled={!canNext()}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-electric-purple text-white rounded-lg font-semibold hover:bg-electric-purple/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Continuer <ArrowRight size={16} />
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmit}
                      disabled={!canNext() || loading}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-electric-purple text-white rounded-lg font-semibold btn-neon-purple hover:bg-electric-purple/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Envoi…' : 'Recevoir ma démo gratuite →'}
                    </button>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default DemoTunnelModal;
