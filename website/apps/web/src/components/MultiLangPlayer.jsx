import React, { useState } from 'react';

const LANG_META = {
  fr: { label: 'Français',  flag: '🇫🇷', short: 'FR' },
  en: { label: 'English',   flag: '🇺🇸', short: 'EN' },
  zh: { label: '中文',       flag: '🇨🇳', short: 'ZH' },
  pt: { label: 'Português', flag: '🇧🇷', short: 'PT' },
  it: { label: 'Italiano',  flag: '🇮🇹', short: 'IT' },
  es: { label: 'Español',   flag: '🇪🇸', short: 'ES' },
  de: { label: 'Deutsch',   flag: '🇩🇪', short: 'DE' },
};

const MultiLangPlayer = ({ videos, langCount }) => {
  const langs = Object.keys(videos);
  const [active, setActive] = useState(langs[0]);

  const count = langCount || langs.length;

  return (
    <div className="mb-6">

      {/* Pitch badge */}
      <div className="flex items-start gap-3 bg-electric-purple/10 border border-electric-purple/30 rounded-lg px-4 py-3 mb-4">
        <span className="text-electric-purple text-lg mt-0.5">⚡</span>
        <p className="text-sm text-gray-300 leading-snug">
          <span className="text-white font-semibold">{count} vidéos indépendantes</span>
          {' '}— une par langue, synchronisation labiale recalculée pour chacune.{' '}
          <span className="text-electric-purple">Pas du doublage audio : chaque version est une reconstruction complète.</span>
        </p>
      </div>

      {/* Language selector */}
      <div className="flex flex-wrap gap-2 mb-3">
        {langs.map((lang) => {
          const meta = LANG_META[lang] || { label: lang.toUpperCase(), flag: '', short: lang.toUpperCase() };
          const isActive = active === lang;
          return (
            <button
              key={lang}
              onClick={() => setActive(lang)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-semibold transition-all duration-200 ${
                isActive
                  ? 'bg-electric-purple text-white shadow-[0_0_12px_rgba(139,92,246,0.5)]'
                  : 'bg-[#050814] text-gray-400 border border-electric-purple/30 hover:border-electric-purple/60 hover:text-white'
              }`}
            >
              <span>{meta.flag}</span>
              <span>{meta.short}</span>
            </button>
          );
        })}
      </div>

      {/* Label */}
      <p className="text-xs font-semibold uppercase tracking-wide mb-2 text-electric-purple">
        {(() => {
          const meta = LANG_META[active] || { label: active.toUpperCase() };
          return active === langs[0]
            ? `Version originale — ${meta.label}`
            : `Version adaptée — ${meta.label}`;
        })()}
      </p>

      {/* Vimeo embed */}
      <div className="aspect-video w-full rounded-lg overflow-hidden bg-black">
        <iframe
          key={active}
          src={`https://player.vimeo.com/video/${videos[active].id}?title=0&byline=0&portrait=0&badge=0&autopause=0`}
          frameBorder="0"
          allow="autoplay; fullscreen; picture-in-picture; clipboard-write"
          referrerPolicy="strict-origin-when-cross-origin"
          className="w-full h-full"
          title={`Version ${active.toUpperCase()}`}
        />
      </div>

    </div>
  );
};

export default MultiLangPlayer;
