"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Heart, Award, Share2, Play, Clock, ArrowLeft, ArrowRight, X, Maximize2 } from "lucide-react";
import Link from "next/link";

/* =========================
   Demo data (stable images/video)
   ========================= */

const DEMO_USERS = [
  { id: "u_alex", username: "alex", displayName: "Alex K", avatar: "https://picsum.photos/id/1005/120/120" },
  { id: "u_sam", username: "sam", displayName: "Samira", avatar: "https://picsum.photos/id/1011/120/120" },
  { id: "u_jordan", username: "jordan", displayName: "Jordan P", avatar: "https://picsum.photos/id/1027/120/120" },
  { id: "u_aria", username: "aria", displayName: "Aria Z", avatar: "https://picsum.photos/id/1012/120/120" },
];

const DEMO_MEDIA = [
  {
    id: "m1",
    type: "image",
    authorId: "u_alex",
    title: "Neon UI mockups",
    src: "https://picsum.photos/id/1018/1200/1800",
    caption: "Vibrant neon UI concepts for a dashboard.",
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 1,
    views: 450,
    hearts: ["u_sam"],
    trophies: [],
    tags: ["ui", "design"],
  },
  {
    id: "m2",
    type: "video",
    authorId: "u_sam",
    title: "Quick WebRTC demo",
    src: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
    caption: "Short demo of live drawing with low-latency.",
    createdAt: Date.now() - 1000 * 60 * 60 * 12,
    views: 1200,
    hearts: ["u_alex", "u_jordan"],
    trophies: ["u_jordan"],
    tags: ["webrtc", "demo"],
  },
  {
    id: "m3",
    type: "image",
    authorId: "u_jordan",
    title: "Caching architecture sketch",
    src: "https://picsum.photos/id/1025/1200/1600",
    caption: "Rough sketch for IndexedDB-based caching flow.",
    createdAt: Date.now() - 1000 * 60 * 60 * 72,
    views: 210,
    hearts: [],
    trophies: [],
    tags: ["architecture", "browser"],
  },
  {
    id: "m4",
    type: "image",
    authorId: "u_aria",
    title: "Landing page hero",
    src: "https://picsum.photos/id/1043/1200/1600",
    caption: "Hero shot experiments for a marketing site.",
    createdAt: Date.now() - 1000 * 60 * 60 * 6,
    views: 980,
    hearts: ["u_alex"],
    trophies: [],
    tags: ["marketing", "design"],
  },
  {
    id: "m5",
    type: "video",
    authorId: "u_alex",
    title: "Tiny animation library showcase",
    src: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
    caption: "Animations running at 60fps — tiny bundle size.",
    createdAt: Date.now() - 1000 * 60 * 30,
    views: 2000,
    hearts: [],
    trophies: ["u_aria"],
    tags: ["animation", "css"],
  },
];

/* =========================
   Helpers & UI primitives
   ========================= */

function prettyDate(ts) {
  const diff = Date.now() - ts;
  const minutes = Math.floor(diff / (1000 * 60));
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

function getUserById(id) {
  return DEMO_USERS.find((u) => u.id === id) || { id, username: id, displayName: id, avatar: "https://picsum.photos/seed/default/120/120" };
}

function Badge({ children }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-[var(--nav-hover-bg)] text-[var(--nav-text-active)] border border-[var(--border-muted)]">
      {children}
    </span>
  );
}

function Toast({ text, onClose = () => {} }) {
  useEffect(() => {
    const t = setTimeout(onClose, 1600);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div className="fixed bottom-6 right-6 z-[100] bg-[var(--dropdown-bg)] text-[var(--nav-text-active)] px-4 py-2 rounded-xl shadow-2xl border border-[var(--border-color)] animate-in slide-in-from-bottom-2">
      {text}
    </div>
  );
}

/* =========================
   MediaCard (click to view)
   ========================= */

function MediaCard({
  media,
  author,
  currentUserId,
  onToggleHeart,
  onToggleTrophy,
  onShare,
  onView,
}) {
  const heartCount = (media.hearts || []).length;
  const trophyCount = (media.trophies || []).length;
  const userHearted = (media.hearts || []).includes(currentUserId);
  const userTrophy = (media.trophies || []).includes(currentUserId);

  return (
    <article className="rounded-2xl overflow-hidden border border-[var(--border-color)] bg-[var(--card-bg)] backdrop-blur-xl shadow-lg hover:shadow-2xl transition-all duration-300">
      <div
        className="relative cursor-pointer group"
        onClick={() => onView(media)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === "Enter") onView(media); }}
      >
        {media.type === "image" ? (
          <img src={media.src} alt={media.title} className="w-full h-64 sm:h-72 object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
        ) : (
          <div className="w-full h-64 sm:h-72 bg-black/20 flex items-center justify-center relative overflow-hidden">
            <video
              src={media.src}
              className="w-full h-full object-cover"
              preload="metadata"
              playsInline
              muted
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition-colors">
              <div className="p-3 bg-white/20 backdrop-blur-md rounded-full">
                <Play className="w-8 h-8 text-white fill-current" />
              </div>
            </div>
          </div>
        )}

        <div className="absolute top-3 left-3 flex items-center gap-2">
          <img src={author.avatar} alt={author.displayName} className="w-9 h-9 rounded-lg ring-1 ring-[var(--border-muted)]" />
          <div className="bg-[var(--nav-bg)] backdrop-blur-md px-2 py-1 rounded-xl text-xs text-[var(--nav-text-active)] border border-[var(--border-muted)]">
            <div className="font-bold leading-none">{author.displayName}</div>
            <div className="text-[10px] text-[var(--nav-text-muted)]">{prettyDate(media.createdAt)}</div>
          </div>
        </div>

        <div className="absolute top-3 right-3 flex items-center gap-2">
          <Badge>{media.views} views</Badge>
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-black text-[var(--nav-text-active)] truncate">{media.title}</h3>
            <p className="text-sm text-[var(--nav-text-muted)] mt-1 line-clamp-2 leading-relaxed">{media.caption}</p>
            <div className="flex gap-2 mt-4 flex-wrap">
              {(media.tags || []).map((t) => (
                <span key={t} className="text-[10px] font-bold uppercase tracking-wider bg-indigo-500/10 px-2.5 py-1 rounded-lg text-indigo-500 border border-indigo-500/10">#{t}</span>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-end gap-2 shrink-0">
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => { e.stopPropagation(); onToggleHeart(media.id); }}
                className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-bold transition-all ${
                  userHearted ? "bg-gradient-to-r from-indigo-600 to-pink-500 text-white shadow-lg shadow-indigo-500/20" : "bg-[var(--nav-hover-bg)] text-[var(--nav-text-muted)] hover:text-[var(--nav-text-active)]"
                }`}
              >
                <Heart className={`w-4 h-4 ${userHearted ? "fill-current" : ""}`} />
                <span>{heartCount}</span>
              </button>

              <button
                onClick={(e) => { e.stopPropagation(); onToggleTrophy(media.id); }}
                className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-bold transition-all ${
                  userTrophy ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-black shadow-lg shadow-orange-500/20" : "bg-[var(--nav-hover-bg)] text-[var(--nav-text-muted)] hover:text-[var(--nav-text-active)]"
                }`}
              >
                <Award className={`w-4 h-4 ${userTrophy ? "fill-current" : ""}`} />
                <span>{trophyCount}</span>
              </button>
            </div>

            <button
              onClick={(e) => { e.stopPropagation(); onShare(media); }}
              className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-full bg-[var(--nav-hover-bg)] text-xs font-bold text-[var(--nav-text-muted)] hover:bg-[var(--nav-hover-bg-heavy)] hover:text-[var(--nav-text-active)] transition-all"
            >
              <Share2 className="w-3.5 h-3.5" />
              Share
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

/* =========================
   Main Media Page
   ========================= */

export default function MediaPage() {
  const { user } = useUser();
  const currentUserId = user?.id || "me_demo";
  const STORAGE_KEY = "devpulse_media_v2";

  const [mediaItems, setMediaItems] = useState([]);
  const [filter, setFilter] = useState("trending");
  const [sort, setSort] = useState("trending");
  const [query, setQuery] = useState("");
  const [toast, setToast] = useState(null);
  const [modalIndex, setModalIndex] = useState(null);
  const modalMediaRef = useRef(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      setMediaItems(raw ? JSON.parse(raw) : DEMO_MEDIA.map((m) => ({ ...m, hearts: m.hearts || [], trophies: m.trophies || [] })));
    } catch (e) {
      setMediaItems(DEMO_MEDIA);
    }
  }, []);

  useEffect(() => {
    if (mediaItems.length > 0) {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(mediaItems)); } catch (e) {}
    }
  }, [mediaItems]);

  const toggleHeart = (id) => {
    setMediaItems(prev => prev.map(m => {
      if (m.id !== id) return m;
      const set = new Set(m.hearts);
      set.has(currentUserId) ? set.delete(currentUserId) : set.add(currentUserId);
      return { ...m, hearts: [...set] };
    }));
  };

  const toggleTrophy = (id) => {
    setMediaItems(prev => prev.map(m => {
      if (m.id !== id) return m;
      const set = new Set(m.trophies);
      set.has(currentUserId) ? set.delete(currentUserId) : set.add(currentUserId);
      return { ...m, trophies: [...set] };
    }));
  };

  const shareMedia = async (m) => {
    const url = typeof window !== "undefined" ? window.location.origin + `/media/${m.id}` : `/media/${m.id}`;
    try {
      if (navigator.share) await navigator.share({ title: m.title, url });
      else await navigator.clipboard.writeText(url);
      setToast("Link copied to clipboard");
    } catch (e) { setToast("Could not share"); }
  };

  const filtered = useMemo(() => {
    let items = [...mediaItems];
    if (filter === "following") items = items.filter(m => ["u_alex", "u_sam"].includes(m.authorId));
    if (query.trim()) {
      const q = query.toLowerCase();
      items = items.filter(m => m.title.toLowerCase().includes(q) || m.tags.some(t => t.toLowerCase().includes(q)));
    }
    return items.sort((a,b) => sort === "newest" ? b.createdAt - a.createdAt : b.views - a.views);
  }, [mediaItems, filter, sort, query]);

  const openModalFor = (media) => setModalIndex(filtered.findIndex(x => x.id === media.id));
  const closeModal = () => setModalIndex(null);

  const requestFullScreen = async () => {
    const el = modalMediaRef.current;
    if (el?.requestFullscreen) await el.requestFullscreen();
  };

  return (
    <main className="min-h-screen bg-[var(--bg-body)] text-[var(--nav-text-active)] py-12 relative overflow-hidden">
      <div className="absolute inset-0 bg-[var(--hero-glow)] blur-3xl opacity-20 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <header className="mb-10 flex flex-col md:flex-row items-start md:items-center gap-6 justify-between">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-[var(--nav-text-active)]">
              Media Gallery
            </h1>
            <p className="text-sm text-[var(--nav-text-muted)] mt-1 font-medium">Explore visual stories and demos from the community</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <div className="flex items-center bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl px-4 py-2 gap-4 shadow-sm w-full sm:w-auto">
              <select value={filter} onChange={(e) => setFilter(e.target.value)} className="bg-transparent text-sm font-bold outline-none cursor-pointer">
                <option value="trending">All Activity</option>
                <option value="following">Following</option>
              </select>
              <div className="w-px h-4 bg-[var(--border-muted)]" />
              <select value={sort} onChange={(e) => setSort(e.target.value)} className="bg-transparent text-sm font-bold outline-none cursor-pointer">
                <option value="trending">Most Viewed</option>
                <option value="newest">Latest</option>
              </select>
            </div>

            <div className="flex items-center gap-3 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl px-4 py-2 shadow-sm w-full sm:w-auto">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="bg-transparent outline-none placeholder:text-[var(--nav-text-muted)] text-sm font-medium w-full"
                placeholder="Search gallery..."
              />
              <Clock className="w-4 h-4 text-indigo-500" />
            </div>
          </div>
        </header>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((m) => (
            <MediaCard
              key={m.id}
              media={m}
              author={getUserById(m.authorId)}
              currentUserId={currentUserId}
              onToggleHeart={toggleHeart}
              onToggleTrophy={toggleTrophy}
              onShare={shareMedia}
              onView={openModalFor}
            />
          ))}
        </section>

        {/* Modal Lightbox */}
        {modalIndex !== null && filtered[modalIndex] && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8">
            <div className="absolute inset-0 bg-[var(--modal-overlay)] backdrop-blur-md" onClick={closeModal} />
            <div className="relative z-10 max-w-6xl w-full h-[90vh] bg-[var(--dropdown-bg)] rounded-3xl shadow-2xl border border-[var(--border-color)] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="flex items-center justify-between p-6 border-b border-[var(--border-muted)]">
                <div className="flex items-center gap-4">
                  <button onClick={closeModal} className="p-2 rounded-xl hover:bg-[var(--nav-hover-bg)] transition-colors"><X className="w-5 h-5"/></button>
                  <div>
                    <div className="text-xl font-black text-[var(--nav-text-active)] leading-none">{filtered[modalIndex].title}</div>
                    <div className="text-xs text-[var(--nav-text-muted)] mt-1 font-bold">{prettyDate(filtered[modalIndex].createdAt)}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button onClick={() => shareMedia(filtered[modalIndex])} className="p-2.5 rounded-xl bg-[var(--nav-hover-bg)] hover:bg-[var(--nav-hover-bg-heavy)] text-[var(--nav-text-active)] transition-all"><Share2 className="w-5 h-5" /></button>
                  <button onClick={requestFullScreen} className="p-2.5 rounded-xl bg-[var(--nav-hover-bg)] hover:bg-[var(--nav-hover-bg-heavy)] text-[var(--nav-text-active)] transition-all"><Maximize2 className="w-5 h-5" /></button>
                </div>
              </div>

              {/* MEDIA VIEWPORT WITH CENTERED NAVIGATION */}
              <div className="flex-1 flex items-center justify-center relative bg-black/5 overflow-hidden">
                {/* PREV BUTTON - Vertically Centered & High Contrast */}
                {modalIndex > 0 && (
                  <button 
                    onClick={() => setModalIndex(i => i - 1)} 
                    className="absolute left-6 top-1/2 -translate-y-1/2 z-50 p-4 rounded-full bg-[var(--card-bg)] border border-[var(--border-color)] text-[var(--nav-text-active)] hover:bg-[var(--nav-hover-bg-heavy)] transition-all shadow-2xl active:scale-90"
                  >
                    <ArrowLeft className="w-6 h-6" />
                  </button>
                )}

                <div className="w-full h-full p-4 flex items-center justify-center">
                  {filtered[modalIndex].type === "image" ? (
                    <img ref={modalMediaRef} src={filtered[modalIndex].src} className="max-h-full max-w-full object-contain rounded-xl shadow-2xl" />
                  ) : (
                    <video ref={modalMediaRef} src={filtered[modalIndex].src} controls autoPlay className="max-h-full max-w-full rounded-xl shadow-2xl" />
                  )}
                </div>

                {/* NEXT BUTTON - Vertically Centered & High Contrast */}
                {modalIndex < filtered.length - 1 && (
                  <button 
                    onClick={() => setModalIndex(i => i + 1)} 
                    className="absolute right-6 top-1/2 -translate-y-1/2 z-50 p-4 rounded-full bg-[var(--card-bg)] border border-[var(--border-color)] text-[var(--nav-text-active)] hover:bg-[var(--nav-hover-bg-heavy)] transition-all shadow-2xl active:scale-90"
                  >
                    <ArrowRight className="w-6 h-6" />
                  </button>
                )}
              </div>

              <div className="p-6 bg-[var(--nav-hover-bg)] border-t border-[var(--border-muted)] flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <img src={getUserById(filtered[modalIndex].authorId).avatar} className="w-12 h-12 rounded-2xl object-cover ring-2 ring-[var(--border-muted)]" />
                  <div>
                    <div className="font-black text-[var(--nav-text-active)]">{getUserById(filtered[modalIndex].authorId).displayName}</div>
                    <div className="text-xs font-bold text-indigo-500 uppercase tracking-widest">{filtered[modalIndex].tags?.join(" • ")}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button onClick={() => toggleHeart(filtered[modalIndex].id)} className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold transition-all ${filtered[modalIndex].hearts.includes(currentUserId) ? "bg-indigo-600 text-white" : "bg-[var(--card-bg)] text-[var(--nav-text-active)]"}`}><Heart className="w-5 h-5" /> {filtered[modalIndex].hearts.length}</button>
                  <button onClick={() => toggleTrophy(filtered[modalIndex].id)} className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold transition-all ${filtered[modalIndex].trophies.includes(currentUserId) ? "bg-orange-500 text-white" : "bg-[var(--card-bg)] text-[var(--nav-text-active)]"}`}><Award className="w-5 h-5" /> {filtered[modalIndex].trophies.length}</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {toast && <Toast text={toast} onClose={() => setToast(null)} />}
      </div>
    </main>
  );
}