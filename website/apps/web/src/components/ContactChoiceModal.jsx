import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowLeft, Calendar, Mail, Sparkles, Loader2, Check } from 'lucide-react';
import { openCalendly } from '@/lib/calendly.js';

const FORMSPREE_URL = 'https://formspree.io/f/xvzbldlq';

const CHOICES = [
  {
    id: 'demo',
    icon: <Sparkles className="w-7 h-7" />,
    title: 'Démo gratuite',
    desc: 'On analyse votre contenu et on vous prépare une démo personnalisée sous 24h.',
    color: 'electric-purple',
    borderClass: 'border-electric-purple/30 hover:border-electric-purple',
    iconClass: 'text-electric-purple',
    bgClass: 'hover:bg-electric-purple/5',
  },
  {
    id: 'calendly',
    icon: <Calendar className="w-7 h-7" />,
    title: 'Réserver un appel',
    desc: '20 minutes, gratuit. On répond à toutes vos questions et on avance ensemble.',
    color: 'neon-blue',
    borderClass: 'border-neon-blue/30 hover:border-neon-blue',
    iconClass: 'text-neon-blue',
    bgClass: 'hover:bg-neon-blue/5',
  },
  {
    id: 'message',
    icon: <Mail className="w-7 h-7" />,
    title: 'Envoyer un message',
    desc: 'Une question, un contexte particulier ? Écrivez-nous, on répond sous 24h.',
    color: 'hot-pink',
    borderClass: 'border-hot-pink/30 hover:border-hot-pink',
    iconClass: 'text-hot-pink',
    bgClass: 'hover:bg-hot-pink/5',
  },
];

const ContactChoiceModal = ({ isOpen, onClose, onOpenTunnel }) => {
  const [view, setView] = useState('choice'); // 'choice' | 'form' | 'success'
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setView('choice');
        setForm({ name: '', email: '', message: '' });
        setError(null);
      }, 300);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  const handleChoice = (id) => {
    if (id === 'demo') {
      onClose();
      setTimeout(() => onOpenTunnel(), 200);
    } else if (id === 'calendly') {
      onClose();
      setTimeout(() => openCalendly(), 200);
    } else {
      setView('form');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(FORMSPREE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ name: form.name, email: form.email, message: form.message, need: 'Message libre' }),
      });
      if (res.ok) {
        setView('success');
      } else {
        setError('Une erreur est survenue. Veuillez réessayer.');
      }
    } catch {
      setError('Vérifiez votre connexion et réessayez.');
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = form.name.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) && form.message.trim();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.3 }}
        className={`relative bg-[#080b1a] border border-electric-purple/40 rounded-2xl shadow-[0_0_60px_rgba(123,47,255,0.25)] overflow-hidden transition-all duration-300 ${
          view === 'choice' ? 'w-full max-w-2xl' : 'w-full max-w-md'
        }`}
      >
        {/* Close */}
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10">
          <X size={20} />
        </button>

        <AnimatePresence mode="wait">

          {/* ── CHOICE VIEW ── */}
          {view === 'choice' && (
            <motion.div
              key="choice"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="p-8"
            >
              <div className="text-center mb-8 pr-6">
                <h2 className="text-2xl font-bold text-white mb-2">Comment souhaitez-vous nous contacter ?</h2>
                <p className="text-gray-400 text-sm">Choisissez l'option qui vous convient le mieux.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {CHOICES.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => handleChoice(c.id)}
                    className={`group flex flex-col items-start text-left p-5 rounded-xl border-2 bg-[#0d1023] transition-all duration-200 hover:-translate-y-1 ${c.borderClass} ${c.bgClass}`}
                  >
                    <span className={`mb-3 transition-transform duration-200 group-hover:scale-110 ${c.iconClass}`}>
                      {c.icon}
                    </span>
                    <span className="text-white font-semibold text-base mb-2">{c.title}</span>
                    <span className="text-gray-400 text-xs leading-relaxed">{c.desc}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── FORM VIEW ── */}
          {view === 'form' && (
            <motion.div
              key="form"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="p-8"
            >
              {/* Back */}
              <button
                onClick={() => setView('choice')}
                className="flex items-center gap-1.5 text-gray-400 hover:text-white text-sm mb-6 transition-colors"
              >
                <ArrowLeft size={15} />
                Retour
              </button>

              <div className="mb-6 pr-6">
                <h2 className="text-xl font-bold text-white mb-1">Envoyez-nous un message</h2>
                <p className="text-gray-400 text-sm">On vous répond sous 24h.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Prénom et Nom"
                  required
                  className="w-full px-4 py-3 bg-[#0d1023] border border-electric-purple/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-hot-pink transition-colors"
                />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="Email professionnel"
                  required
                  className="w-full px-4 py-3 bg-[#0d1023] border border-electric-purple/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-hot-pink transition-colors"
                />
                <textarea
                  value={form.message}
                  onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                  placeholder="Votre message…"
                  required
                  rows={4}
                  className="w-full px-4 py-3 bg-[#0d1023] border border-electric-purple/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-hot-pink transition-colors resize-none"
                />
                {error && <p className="text-red-400 text-sm">{error}</p>}
                <button
                  type="submit"
                  disabled={!canSubmit || loading}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-hot-pink text-white rounded-lg font-semibold hover:bg-hot-pink/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ boxShadow: '0 0 20px rgba(255,45,155,0.3)' }}
                >
                  {loading
                    ? <><Loader2 size={16} className="animate-spin" /> Envoi…</>
                    : 'Envoyer →'
                  }
                </button>
              </form>
            </motion.div>
          )}

          {/* ── SUCCESS VIEW ── */}
          {view === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="p-8 text-center"
            >
              <div className="w-16 h-16 bg-hot-pink/20 border border-hot-pink rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-8 h-8 text-hot-pink" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">Message envoyé !</h2>
              <p className="text-gray-300 mb-2">
                On vous répond sous <span className="text-hot-pink font-semibold">24h</span>.
              </p>
              <p className="text-gray-500 text-sm mb-8">Vous recevrez une confirmation à {form.email}.</p>
              <button
                onClick={onClose}
                className="px-8 py-3 border border-electric-purple/40 text-electric-purple rounded-lg hover:bg-electric-purple/10 transition-all"
              >
                Fermer
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default ContactChoiceModal;
