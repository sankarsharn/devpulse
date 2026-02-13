"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { Heart, MessageSquare, ArrowUp, ArrowDown, Clock, Star, RefreshCw } from "lucide-react";

/* ------------------------------
   Utilities
   ------------------------------ */

function prettyDate(ts) {
  const diff = Date.now() - ts;
  const minutes = Math.floor(diff / (1000 * 60));
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

/* ------------------------------
   Themed Atoms
   ------------------------------ */

function VoteButton({ active, onClick, children, variant }) {
  const activeClass = variant === "up" 
    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30" 
    : "bg-pink-600 text-white shadow-lg shadow-pink-500/30";

  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm transition-all active:scale-95 ${
        active 
          ? activeClass 
          : "bg-[var(--nav-hover-bg)] text-[var(--nav-text-muted)] hover:bg-[var(--nav-hover-bg-heavy)] hover:text-[var(--nav-text-active)] border border-[var(--border-muted)]"
      }`}
    >
      {children}
    </button>
  );
}

function Tag({ children }) {
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
      #{children}
    </span>
  );
}

/* ------------------------------
   Comments Component
   ------------------------------ */

function Comments({ comments = [], onAddComment, usersMap }) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");

  return (
    <div className="mt-4 border-t border-[var(--border-muted)] pt-4">
      <button 
        onClick={() => setOpen(!open)} 
        className="text-sm font-bold text-[var(--nav-text-muted)] hover:text-indigo-500 transition-colors"
      >
        {open ? "Hide Discussion" : `View Discussion (${comments.length})`}
      </button>

      {open && (
        <div className="mt-4 space-y-4">
          <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
            {comments.map((c) => {
              const u = usersMap[c.authorId] || { displayName: "Developer", avatar: "https://picsum.photos/seed/dev/80/80" };
              return (
                <div key={c.id} className="flex gap-3 animate-in fade-in slide-in-from-left-2">
                  <img src={u.avatar} className="w-8 h-8 rounded-full border border-[var(--border-muted)] object-cover" alt="" />
                  <div className="flex-1 bg-[var(--nav-hover-bg)] p-3 rounded-2xl border border-[var(--border-muted)]">
                    <div className="text-xs font-black text-[var(--nav-text-active)] mb-1">{u.displayName}</div>
                    <div className="text-sm text-[var(--nav-text-active)] opacity-80 leading-relaxed">{c.body}</div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex gap-2">
            <input 
              value={input} 
              onChange={(e) => setInput(e.target.value)}
              placeholder="Add to the conversation..." 
              className="flex-1 bg-[var(--nav-bg)] border border-[var(--border-color)] rounded-full px-5 py-2 text-sm text-[var(--nav-text-active)] outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
            />
            <button 
              onClick={() => { if(input.trim()) { onAddComment(input); setInput(""); } }}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-bold text-sm shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"
            >
              Reply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------
   Post Card Component
   ------------------------------ */

function PostCard({ post, author, onUpvote, onDownvote, onAddComment, onToggleStar, currentUserId, usersMap }) {
  const userUpvoted = post.voters?.up?.includes(currentUserId);
  const userDownvoted = post.voters?.down?.includes(currentUserId);
  const userStarred = (post.stars || []).includes(currentUserId);

  return (
    <article className="rounded-[2.5rem] border border-[var(--border-color)] overflow-hidden bg-[var(--card-bg)] backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-500">
      <div className="p-6 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <img src={author.avatar} className="w-12 h-12 rounded-2xl object-cover ring-2 ring-[var(--border-muted)] shadow-sm" alt="" />
            <div>
              <Link href={`/u/${author.username}`} className="font-black text-lg text-[var(--nav-text-active)] hover:text-indigo-500 transition-colors">
                {author.displayName}
              </Link>
              <div className="text-xs font-bold text-[var(--nav-text-muted)] flex items-center gap-2">
                {prettyDate(post.createdAt)} • <Tag>{post.tags[0]}</Tag>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs font-black text-[var(--nav-text-active)] bg-[var(--nav-hover-bg)] px-4 py-2 rounded-2xl border border-[var(--border-muted)] shadow-inner">
            <div className="flex items-center gap-1.5 text-indigo-500"><ArrowUp size={14}/> {post.upvotes}</div>
            <div className="flex items-center gap-1.5 text-pink-500"><ArrowDown size={14}/> {post.downvotes}</div>
          </div>
        </div>

        <h3 className="text-2xl font-black text-[var(--nav-text-active)] leading-tight mb-3 tracking-tight">{post.title}</h3>
        <p className="text-[var(--nav-text-active)] opacity-70 leading-relaxed mb-6 font-medium text-base">{post.body}</p>

        {post.image && (
          <div className="rounded-3xl overflow-hidden border border-[var(--border-muted)] mb-6 shadow-sm">
            <img src={post.image} className="w-full h-80 object-cover hover:scale-105 transition-transform duration-700" alt="" loading="lazy" />
          </div>
        )}

        <div className="flex items-center gap-3 flex-wrap">
          <VoteButton active={userUpvoted} variant="up" onClick={() => onUpvote(post.id)}>
            <ArrowUp size={18}/> Upvote
          </VoteButton>
          <VoteButton active={userDownvoted} variant="down" onClick={() => onDownvote(post.id)}>
            <ArrowDown size={18}/> Downvote
          </VoteButton>
          <button className="inline-flex items-center gap-2 px-5 py-2 rounded-full font-bold text-sm bg-[var(--nav-hover-bg)] text-[var(--nav-text-muted)] hover:bg-[var(--nav-hover-bg-heavy)] hover:text-[var(--nav-text-active)] border border-[var(--border-muted)] transition-all">
            <MessageSquare size={18}/> {post.comments.length}
          </button>
          <button 
            onClick={() => onToggleStar(post.id)} 
            className={`ml-auto p-3 rounded-full transition-all active:scale-90 ${userStarred ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/25' : 'bg-[var(--nav-hover-bg)] text-[var(--nav-text-muted)] border border-[var(--border-muted)]'}`}
            title={userStarred ? "Unstar" : "Star"}
          >
            <Heart size={20} className={userStarred ? "fill-current" : ""} />
          </button>
        </div>

        <Comments 
          comments={post.comments} 
          usersMap={usersMap} 
          onAddComment={(t) => onAddComment(post.id, t)} 
        />
      </div>
    </article>
  );
}

/* ------------------------------
   Main Page
   ------------------------------ */

export default function FeedPage() {
  const { user, isLoaded } = useUser();
  const currentUserId = user?.id || "me_demo";
  const [posts, setPosts] = useState([]);
  const [sort, setSort] = useState("new");
  const [visibleCount, setVisibleCount] = useState(5);

  const DEMO_USERS = [
    { id: "u_alex", username: "alex_dev", displayName: "Alex Rivera", avatar: "https://picsum.photos/id/1005/200/200" },
    { id: "u_sarah", username: "sarah_codes", displayName: "Sarah Chen", avatar: "https://picsum.photos/id/1011/200/200" },
    { id: "u_jordan", username: "jordan_stack", displayName: "Jordan Smith", avatar: "https://picsum.photos/id/1027/200/200" },
    { id: "u_moto", username: "aurora_rider", displayName: "Mike Wheeler", avatar: "https://picsum.photos/id/1074/200/200" },
  ];

  const DEMO_POSTS = [
    {
      id: "p1",
      authorId: "u_alex",
      title: "Vibrant Light Mode is officially live! 🚀",
      body: "I finally finished the CSS variable migration for DevPulse. The new slate-blue tint in light mode feels so much more premium than pure white. Check out the frosted glass effect on these cards!",
      image: "https://images.unsplash.com/photo-1618477388954-7852f32655ec?auto=format&fit=crop&q=80&w=1000",
      tags: ["ui-design", "frontend"],
      createdAt: Date.now() - 1000 * 60 * 30,
      upvotes: 84,
      downvotes: 2,
      comments: [{ id: "c1", authorId: "u_sarah", body: "The transitions are super smooth!", createdAt: Date.now() - 1000 * 60 * 10 }],
      voters: { up: ["u_sarah"], down: [] },
      stars: ["u_sarah"],
    },
    {
      id: "p2",
      authorId: "u_jordan",
      title: "Automata Theory: NFA to Epsilon-NFA",
      body: "Working on a Java-based visualizer for state machines. Mapping out the recursive epsilon closures was a nightmare, but seeing the transitions animate in real-time is worth it.",
      image: "https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&q=80&w=1000",
      tags: ["java", "cs-theory"],
      createdAt: Date.now() - 1000 * 60 * 60 * 4,
      upvotes: 126,
      downvotes: 0,
      comments: [],
      voters: { up: [], down: [] },
      stars: [],
    },
    {
      id: "p3",
      authorId: "u_moto",
      title: "Meteor 350 Aurora Green - Clean Look",
      body: "Added the custom leg guard to the Meteor 350 Aurora Green today. The way the light hits this green is insane. Shot some 4K wallpapers for the community.",
      image: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=1000",
      tags: ["design", "moto"],
      createdAt: Date.now() - 1000 * 60 * 60 * 24,
      upvotes: 45,
      downvotes: 1,
      comments: [],
      voters: { up: [], down: [] },
      stars: [],
    }
  ];

  const usersMap = useMemo(() => {
    const map = {};
    DEMO_USERS.forEach(u => map[u.id] = u);
    return map;
  }, []);

  // LOAD DATA
  useEffect(() => {
    const raw = localStorage.getItem("devpulse_feed_v4");
    const parsed = raw ? JSON.parse(raw) : null;
    if (!parsed || parsed.length === 0) {
      setPosts(DEMO_POSTS);
    } else {
      setPosts(parsed);
    }
  }, []);

  // PERSIST DATA
  useEffect(() => {
    if (posts.length > 0) {
      localStorage.setItem("devpulse_feed_v4", JSON.stringify(posts));
    }
  }, [posts]);

  // VOTING LOGIC (RESTORED & IMPROVED)
  function handleUpvote(postId) {
    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;
      const up = new Set(p.voters?.up || []);
      const down = new Set(p.voters?.down || []);
      if (up.has(currentUserId)) {
        up.delete(currentUserId);
        return { ...p, upvotes: Math.max(0, p.upvotes - 1), voters: { up: [...up], down: [...down] }};
      }
      if (down.has(currentUserId)) {
        down.delete(currentUserId);
        p.downvotes = Math.max(0, p.downvotes - 1);
      }
      up.add(currentUserId);
      return { ...p, upvotes: p.upvotes + 1, voters: { up: [...up], down: [...down] }};
    }));
  }

  function handleDownvote(postId) {
    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;
      const up = new Set(p.voters?.up || []);
      const down = new Set(p.voters?.down || []);
      if (down.has(currentUserId)) {
        down.delete(currentUserId);
        return { ...p, downvotes: Math.max(0, p.downvotes - 1), voters: { up: [...up], down: [...down] }};
      }
      if (up.has(currentUserId)) {
        up.delete(currentUserId);
        p.upvotes = Math.max(0, p.upvotes - 1);
      }
      down.add(currentUserId);
      return { ...p, downvotes: p.downvotes + 1, voters: { up: [...up], down: [...down] }};
    }));
  }

  function addComment(postId, text) {
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, comments: [...p.comments, { id: Date.now(), authorId: currentUserId, body: text, createdAt: Date.now() }] } : p));
  }

  function toggleStar(postId) {
    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;
      const s = new Set(p.stars || []);
      s.has(currentUserId) ? s.delete(currentUserId) : s.add(currentUserId);
      return { ...p, stars: [...s] };
    }));
  }

  const sortedFeed = useMemo(() => {
    return [...posts].sort((a, b) => sort === "new" ? b.createdAt - a.createdAt : (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes));
  }, [posts, sort]);

  const handleReset = () => {
    localStorage.removeItem("devpulse_feed_v4");
    window.location.reload();
  };

  if (!isLoaded) return null;

  return (
    <main className="min-h-screen bg-[var(--bg-body)] text-[var(--nav-text-active)] py-12 relative overflow-hidden transition-colors duration-300">
      <div className="absolute inset-0 bg-[var(--hero-glow)] blur-[120px] opacity-20 pointer-events-none" />
      
      <div className="max-w-4xl mx-auto px-4 relative z-10">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="text-5xl font-black tracking-tight text-[var(--nav-text-active)]">Community Feed</h1>
            <p className="text-[var(--nav-text-muted)] font-bold mt-2">Latest builds and breakthroughs from the network</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl px-4 py-2 gap-2 shadow-sm">
              <Clock className="w-4 h-4 text-indigo-500" />
              <select value={sort} onChange={(e) => setSort(e.target.value)} className="bg-transparent outline-none text-sm font-black uppercase tracking-wider cursor-pointer">
                <option value="new">Latest</option>
                <option value="top">Trending</option>
              </select>
            </div>
            <button 
              onClick={handleReset} 
              title="Reset Feed Data" 
              className="p-3 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl text-[var(--nav-text-muted)] hover:text-indigo-500 transition-all active:rotate-180 duration-500 shadow-sm"
            >
              <RefreshCw size={18} />
            </button>
          </div>
        </header>

        <section className="space-y-10">
          {sortedFeed.slice(0, visibleCount).map((post) => (
            <PostCard
              key={post.id}
              post={post}
              author={usersMap[post.authorId] || { displayName: "Dev", avatar: "https://picsum.photos/seed/dev/80/80" }}
              currentUserId={currentUserId}
              onUpvote={handleUpvote}
              onDownvote={handleDownvote}
              onAddComment={addComment}
              onToggleStar={toggleStar}
              usersMap={{ ...usersMap, [currentUserId]: { displayName: user?.fullName || "You", avatar: user?.profileImageUrl || "/default-avatar.png" }}}
            />
          ))}

          {visibleCount < sortedFeed.length && (
             <div className="flex justify-center pt-8">
                <button 
                    onClick={() => setVisibleCount(c => c + 5)} 
                    className="px-10 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[1.5rem] font-black shadow-xl shadow-indigo-500/20 transition-all active:scale-95"
                >
                    Load More activity
                </button>
             </div>
          )}
        </section>
      </div>
    </main>
  );
}