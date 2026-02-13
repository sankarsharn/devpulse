"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowUp,
  ArrowDown,
  MessageSquare,
  User,
  CornerUpRight,
} from "lucide-react";
import { useUser } from "@clerk/nextjs";

/* -------------------- DUMMY DATA -------------------- */
const SEED_POSTS = [
  {
    id: "p1",
    author: "alice",
    authorAvatar: "",
    title: "I rewrote my CLI tool in Rust — results & benchmarks",
    body:
      "Rewrote my old Node CLI tool in Rust. Startup time improved from ~120ms to ~12ms. Memory dropped by 75%. Sharing some benchmarks and pitfalls.",
    upvotes: 234,
    downvotes: 7,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
    comments: [
      {
        id: "c1",
        author: "bob",
        text: "Amazing. Can you share the benchmarking script?",
        upvotes: 12,
        downvotes: 0,
        createdAt: Date.now() - 1000 * 60 * 60 * 20,
      },
      {
        id: "c2",
        author: "cara",
        text: "Did you use `cargo` features for release optimization?",
        upvotes: 3,
        downvotes: 1,
        createdAt: Date.now() - 1000 * 60 * 60 * 18,
      },
    ],
  },
  {
    id: "p2",
    author: "dave",
    authorAvatar: "",
    title: "Help: Strange memory leak in C++ program with vector reserve",
    body:
      "I reserved a huge vector then filled it. Memory never returned—am I doing something wrong? Minimal code included.",
    upvotes: 87,
    downvotes: 5,
    createdAt: Date.now() - 1000 * 60 * 60 * 12,
    comments: [
      {
        id: "c3",
        author: "erin",
        text: "Are you using global allocators or a third-party profiler?",
        upvotes: 6,
        downvotes: 0,
        createdAt: Date.now() - 1000 * 60 * 60 * 10,
      },
    ],
  },
];

/* -------------------- HELPERS -------------------- */
const STORAGE_KEY = "devpulse_explore_posts_v1";
const VOTE_KEY = "devpulse_votes_v1";

function uid(prefix = "") {
  return `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

function timeAgo(ts) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  return `${d}d`;
}

/* -------------------- COMPONENT -------------------- */
export default function ExplorePage() {
  const { user } = useUser();
  const username = user?.username || user?.id || "guest";

  const [posts, setPosts] = useState([]);
  const [votes, setVotes] = useState({ posts: {}, comments: {} });
  const [openCommentsPost, setOpenCommentsPost] = useState(null);
  const [commentDrafts, setCommentDrafts] = useState({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (!parsed || !Array.isArray(parsed) || parsed.length === 0) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_POSTS));
            setPosts(SEED_POSTS);
          } else {
            setPosts(parsed);
          }
        } catch {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_POSTS));
          setPosts(SEED_POSTS);
        }
      } else {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_POSTS));
        setPosts(SEED_POSTS);
      }
    } catch (e) {
      setPosts(SEED_POSTS);
    }

    try {
      const vraw = localStorage.getItem(VOTE_KEY);
      if (vraw) {
        try {
          const parsedV = JSON.parse(vraw);
          setVotes(parsedV && typeof parsedV === "object" ? parsedV : { posts: {}, comments: {} });
        } catch {
          setVotes({ posts: {}, comments: {} });
        }
      } else {
        setVotes({ posts: {}, comments: {} });
      }
    } catch {
      setVotes({ posts: {}, comments: {} });
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
    } catch {}
  }, [posts]);

  useEffect(() => {
    try {
      localStorage.setItem(VOTE_KEY, JSON.stringify(votes));
    } catch {}
  }, [votes]);

  function handlePostVote(postId, value) {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        const current = votes.posts[postId] || 0;
        let up = p.upvotes;
        let down = p.downvotes;

        if (current === value) {
          if (value === 1) up = Math.max(0, up - 1);
          else down = Math.max(0, down - 1);
          setVotes((v) => ({ ...v, posts: { ...v.posts, [postId]: 0 } }));
        } else {
          if (value === 1) {
            up = up + 1;
            if (current === -1) down = Math.max(0, down - 1);
          } else {
            down = down + 1;
            if (current === 1) up = Math.max(0, up - 1);
          }
          setVotes((v) => ({ ...v, posts: { ...v.posts, [postId]: value } }));
        }

        return { ...p, upvotes: up, downvotes: down };
      })
    );
  }

  function handleCommentVote(commentId, postId, value) {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        const comments = p.comments.map((c) => {
          if (c.id !== commentId) return c;
          const current = votes.comments[commentId] || 0;
          let up = c.upvotes;
          let down = c.downvotes;

          if (current === value) {
            if (value === 1) up = Math.max(0, up - 1);
            else down = Math.max(0, down - 1);
            setVotes((v) => ({ ...v, comments: { ...v.comments, [commentId]: 0 } }));
          } else {
            if (value === 1) {
              up = up + 1;
              if (current === -1) down = Math.max(0, down - 1);
            } else {
              down = down + 1;
              if (current === 1) up = Math.max(0, up - 1);
            }
            setVotes((v) => ({ ...v, comments: { ...v.comments, [commentId]: value } }));
          }

          return { ...c, upvotes: up, downvotes: down };
        });
        return { ...p, comments };
      })
    );
  }

  function toggleComments(postId) {
    setOpenCommentsPost((cur) => (cur === postId ? null : postId));
  }

  function submitComment(postId) {
    const text = (commentDrafts[postId] || "").trim();
    if (!text) return;
    const newComment = {
      id: uid("c"),
      author: username,
      text,
      upvotes: 0,
      downvotes: 0,
      createdAt: Date.now(),
    };
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, comments: [...p.comments, newComment] } : p))
    );
    setCommentDrafts((d) => ({ ...d, [postId]: "" }));
    setOpenCommentsPost(postId);
  }

  const sortedPosts = useMemo(() => {
    if (!Array.isArray(posts)) return [];
    return [...posts].sort((a, b) => {
      const sa = a.upvotes - a.downvotes;
      const sb = b.upvotes - b.downvotes;
      if (sb === sa) return b.createdAt - a.createdAt;
      return sb - sa;
    });
  }, [posts]);

  return (
    <div className="min-h-screen bg-[var(--bg-body)] text-[var(--nav-text-active)] py-12 px-6 relative overflow-hidden">
      {/* Background Glow to mimic the original Explore feel but using variables */}
      <div className="absolute inset-0 bg-[var(--hero-glow)] blur-3xl opacity-30 pointer-events-none" />
      
      <div className="max-w-4xl mx-auto relative z-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-extrabold text-[var(--nav-text-active)]">Explore</h1>
          <div className="text-sm text-[var(--nav-text-muted)]">Discover trending posts</div>
        </div>

        <div className="space-y-4">
          {sortedPosts.length === 0 ? (
            <div className="text-[var(--nav-text-muted)] text-center py-20">No posts yet</div>
          ) : (
            sortedPosts.map((post) => {
              const userVote = votes.posts[post.id] || 0;
              return (
                <article key={post.id} className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl p-4 flex gap-4 backdrop-blur-xl shadow-sm">
                  {/* votes column */}
                  <div className="w-12 flex flex-col items-center">
                    <button
                      aria-pressed={userVote === 1}
                      onClick={() => handlePostVote(post.id, 1)}
                      className={`p-1 rounded-md transition-all ${userVote === 1 ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30" : "text-[var(--nav-text-muted)] hover:bg-[var(--nav-hover-bg)] hover:text-[var(--nav-text-active)]"}`}
                      title="Upvote"
                    >
                      <ArrowUp size={20} />
                    </button>

                    <div className="text-sm font-semibold mt-2 text-[var(--nav-text-active)]">
                      {post.upvotes - post.downvotes}
                    </div>

                    <button
                      aria-pressed={userVote === -1}
                      onClick={() => handlePostVote(post.id, -1)}
                      className={`p-1 rounded-md mt-2 transition-all ${userVote === -1 ? "bg-pink-600 text-white shadow-lg shadow-pink-500/30" : "text-[var(--nav-text-muted)] hover:bg-[var(--nav-hover-bg)] hover:text-[var(--nav-text-active)]"}`}
                      title="Downvote"
                    >
                      <ArrowDown size={20} />
                    </button>
                  </div>

                  {/* content column */}
                  <div className="flex-1">
                    <header className="flex items-center gap-3 text-sm text-[var(--nav-text-muted)] mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-[var(--nav-hover-bg)] border border-[var(--border-muted)] flex items-center justify-center text-xs text-[var(--nav-text-active)]">
                          {post.author?.[0]?.toUpperCase() || <User size={12} />}
                        </div>
                        <div className="font-medium text-[var(--nav-text-active)]">{post.author}</div>
                        <div className="text-[var(--nav-text-muted)] opacity-50">•</div>
                        <div>{timeAgo(post.createdAt)}</div>
                      </div>
                    </header>

                    <h3 className="text-lg font-semibold text-[var(--nav-text-active)] mb-1">{post.title}</h3>
                    <p className="text-[var(--nav-text-muted)] mb-3 leading-relaxed">{post.body}</p>

                    <div className="flex items-center gap-3 text-sm">
                      <button
                        onClick={() => toggleComments(post.id)}
                        className="inline-flex items-center gap-2 text-[var(--nav-text-muted)] hover:text-[var(--nav-text-active)] transition-colors"
                        aria-expanded={openCommentsPost === post.id}
                      >
                        <MessageSquare size={16} /> {post.comments?.length || 0}
                      </button>

                      <div className="inline-flex items-center gap-2 text-[var(--nav-text-muted)] opacity-80">
                        <span className="text-xs">Up</span>
                        <span className="font-semibold">{post.upvotes}</span>
                        <span className="mx-1 opacity-30">|</span>
                        <span className="text-xs">Down</span>
                        <span className="font-semibold">{post.downvotes}</span>
                      </div>

                      <button
                        onClick={() => {
                          try {
                            const url = typeof location !== "undefined" ? `${location.origin}/posts/${post.id}` : `/posts/${post.id}`;
                            navigator.clipboard.writeText(url);
                            alert("Post link copied to clipboard");
                          } catch {}
                        }}
                        className="ml-auto inline-flex items-center gap-2 text-sm text-[var(--nav-text-muted)] hover:text-[var(--nav-text-active)] transition-colors"
                      >
                        <CornerUpRight size={14} /> Share
                      </button>
                    </div>

                    {/* comments area */}
                    {openCommentsPost === post.id && (
                      <div className="mt-4 border-t border-[var(--border-muted)] pt-4 space-y-3">
                        {(!post.comments || post.comments.length === 0) ? (
                          <div className="text-[var(--nav-text-muted)] italic text-sm">No comments yet — be the first!</div>
                        ) : (
                          post.comments.map((c) => {
                            const cv = votes.comments[c.id] || 0;
                            return (
                              <div key={c.id} className="flex gap-3">
                                <div className="w-10 flex flex-col items-center">
                                  <button
                                    onClick={() => handleCommentVote(c.id, post.id, 1)}
                                    className={`p-1 rounded-md transition-colors ${cv === 1 ? "bg-indigo-600 text-white" : "text-[var(--nav-text-muted)] hover:bg-[var(--nav-hover-bg)]"}`}
                                  >
                                    <ArrowUp size={14} />
                                  </button>
                                  <div className="text-xs font-medium text-[var(--nav-text-active)] mt-1">{c.upvotes - c.downvotes}</div>
                                  <button
                                    onClick={() => handleCommentVote(c.id, post.id, -1)}
                                    className={`p-1 rounded-md mt-1 transition-colors ${cv === -1 ? "bg-pink-600 text-white" : "text-[var(--nav-text-muted)] hover:bg-[var(--nav-hover-bg)]"}`}
                                  >
                                    <ArrowDown size={14} />
                                  </button>
                                </div>

                                <div className="flex-1">
                                  <div className="text-sm">
                                    <span className="font-semibold text-[var(--nav-text-active)] mr-2">{c.author}</span>
                                    <span className="text-xs text-[var(--nav-text-muted)]">{timeAgo(c.createdAt)}</span>
                                  </div>
                                  <div className="mt-1 text-sm text-[var(--nav-text-active)] opacity-90">{c.text}</div>
                                </div>
                              </div>
                            );
                          })
                        )}

                        {/* add comment */}
                        <div className="mt-3">
                          <textarea
                            placeholder="Add a comment..."
                            value={commentDrafts[post.id] || ""}
                            onChange={(e) =>
                              setCommentDrafts((d) => ({ ...d, [post.id]: e.target.value }))
                            }
                            className="w-full rounded-md p-3 bg-[var(--nav-hover-bg)] border border-[var(--border-muted)] text-[var(--nav-text-active)] placeholder:text-[var(--nav-text-muted)] text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
                            rows={2}
                          />
                          <div className="mt-2 flex items-center justify-between">
                            <button
                              onClick={() => submitComment(post.id)}
                              className="px-4 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium shadow-md shadow-indigo-500/20 transition-all active:scale-95"
                            >
                              Comment
                            </button>
                            <div className="text-xs text-[var(--nav-text-muted)]">posting as <span className="text-[var(--nav-text-active)] font-medium ml-1">{username}</span></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </article>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}