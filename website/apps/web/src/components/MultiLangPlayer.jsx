import React, { useState, useEffect, useRef } from 'react';
import Player from '@vimeo/player';

const LANG_META = {
  fr: { label: 'Français',  flag: '🇫🇷', short: 'FR' },
  en: { label: 'English',   flag: '🇺🇸', short: 'EN' },
  zh: { label: '中文',       flag: '🇨🇳', short: 'ZH' },
  pt: { label: 'Português', flag: '🇧🇷', short: 'PT' },
  it: { label: 'Italiano',  flag: '🇮🇹', short: 'IT' },
  es: { label: 'Español',   flag: '🇪🇸', short: 'ES' },
  de: { label: 'Deutsch',   flag: '🇩🇪', short: 'DE' },
};

// Load YouTube IFrame API script once
function loadYouTubeAPI() {
  if (window.YT && window.YT.Player) return Promise.resolve();
  return new Promise((resolve) => {
    if (document.getElementById('yt-iframe-api')) {
      // Script already loading — wait for callback
      const prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => { prev?.(); resolve(); };
      return;
    }
    window.onYouTubeIframeAPIReady = resolve;
    const tag = document.createElement('script');
    tag.id = 'yt-iframe-api';
    tag.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(tag);
  });
}

const MultiLangPlayer = ({ videos, langCount, platform = 'vimeo' }) => {
  const langs = Object.keys(videos);
  const [active, setActive] = useState(langs[0]);
  const [switching, setSwitching] = useState(false);
  const containerRef = useRef(null);   // Vimeo container
  const ytContainerRef = useRef(null); // YouTube container div
  const playerRef = useRef(null);      // Vimeo Player instance
  const ytPlayerRef = useRef(null);    // YT.Player instance
  const pendingTimeRef = useRef(0);

  const isYoutube = platform === 'youtube';

  // ── YouTube IFrame API player ──────────────────────────────────────────────
  useEffect(() => {
    if (!isYoutube) return;

    let destroyed = false;

    loadYouTubeAPI().then(() => {
      if (destroyed || !ytContainerRef.current) return;

      // Destroy previous player if any
      if (ytPlayerRef.current) {
        try { ytPlayerRef.current.destroy(); } catch {}
        ytPlayerRef.current = null;
      }

      const startSeconds = Math.floor(pendingTimeRef.current);

      ytPlayerRef.current = new window.YT.Player(ytContainerRef.current, {
        videoId: videos[active].id,
        playerVars: {
          rel: 0,
          modestbranding: 1,
          start: startSeconds > 0 ? startSeconds : undefined,
          autoplay: startSeconds > 0 ? 1 : 0,
        },
        events: {
          onReady: () => { setSwitching(false); },
          onError: () => { setSwitching(false); },
        },
      });
    });

    return () => {
      destroyed = true;
      if (ytPlayerRef.current) {
        try { ytPlayerRef.current.destroy(); } catch {}
        ytPlayerRef.current = null;
      }
    };
  }, [active, isYoutube]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Vimeo SDK ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (isYoutube) return;
    if (!containerRef.current) return;

    if (playerRef.current) {
      playerRef.current.destroy();
      playerRef.current = null;
    }

    const player = new Player(containerRef.current, {
      id: videos[active].id,
      responsive: true,
      title: false,
      byline: false,
      portrait: false,
      badge: false,
    });

    playerRef.current = player;

    player.ready().then(() => {
      const seekTo = pendingTimeRef.current;
      if (seekTo > 0) {
        return player.setCurrentTime(seekTo).then(() => player.play());
      }
    }).then(() => {
      setSwitching(false);
    }).catch(() => {
      setSwitching(false);
    });

    return () => {
      player.destroy().catch(() => {});
    };
  }, [active, isYoutube]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Language switch ───────────────────────────────────────────────────────
  const handleSwitch = async (lang) => {
    if (lang === active || switching) return;
    setSwitching(true);

    if (isYoutube && ytPlayerRef.current) {
      try {
        pendingTimeRef.current = ytPlayerRef.current.getCurrentTime() || 0;
      } catch {
        pendingTimeRef.current = 0;
      }
    } else if (!isYoutube && playerRef.current) {
      try {
        pendingTimeRef.current = await playerRef.current.getCurrentTime();
      } catch {
        pendingTimeRef.current = 0;
      }
    }

    setActive(lang);
  };

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
              onClick={() => handleSwitch(lang)}
              disabled={switching}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-semibold transition-all duration-200 ${
                isActive
                  ? 'bg-electric-purple text-white shadow-[0_0_12px_rgba(139,92,246,0.5)]'
                  : switching
                  ? 'bg-[#050814] text-gray-600 border border-electric-purple/20 cursor-not-allowed'
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

      {/* Player */}
      {isYoutube ? (
        <div className="aspect-video w-full rounded-lg overflow-hidden bg-black">
          <div ref={ytContainerRef} className="w-full h-full" />
        </div>
      ) : (
        <div
          ref={containerRef}
          className="aspect-video w-full rounded-lg overflow-hidden bg-black"
        />
      )}

    </div>
  );
};

export default MultiLangPlayer;
