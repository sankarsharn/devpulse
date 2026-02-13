"use client";

import { useEffect, useMemo, useState } from "react";
import {
  MessageSquare,
  ArrowUp,
  ArrowDown,
  UserPlus,
  Star,
  Bell,
  Check,
} from "lucide-react";

/* -------------------- DUMMY DATA -------------------- */

const SEED_NOTIFICATIONS = [
  {
    id: "n1",
    type: "comment",
    user: "alice",
    message: "commented on your post",
    postTitle: "Rust CLI benchmarks",
    createdAt: Date.now() - 1000 * 60 * 5,
    read: false,
  },
  {
    id: "n2",
    type: "upvote",
    user: "bob",
    message: "upvoted your post",
    postTitle: "C++ memory leak issue",
    createdAt: Date.now() - 1000 * 60 * 30,
    read: false,
  },
  {
    id: "n3",
    type: "downvote",
    user: "cara",
    message: "downvoted your comment",
    postTitle: "CLI tool thread",
    createdAt: Date.now() - 1000 * 60 * 60 * 2,
    read: true,
  },
  {
    id: "n4",
    type: "follow",
    user: "dave",
    message: "started following you",
    createdAt: Date.now() - 1000 * 60 * 60 * 5,
    read: false,
  },
  {
    id: "n5",
    type: "star",
    user: "erin",
    message: "starred your project",
    postTitle: "DevPulse Frontend",
    createdAt: Date.now() - 1000 * 60 * 60 * 12,
    read: true,
  },
];

const STORAGE_KEY = "devpulse_notifications_v1";

/* -------------------- HELPERS -------------------- */

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

function getIcon(type) {
  switch (type) {
    case "comment":
      return <MessageSquare size={18} className="text-indigo-500" />;
    case "upvote":
      return <ArrowUp size={18} className="text-emerald-500" />;
    case "downvote":
      return <ArrowDown size={18} className="text-rose-500" />;
    case "follow":
      return <UserPlus size={18} className="text-sky-500" />;
    case "star":
      return <Star size={18} className="text-amber-500" />;
    default:
      return <Bell size={18} className="text-[var(--nav-text-muted)]" />;
  }
}

/* -------------------- PAGE -------------------- */

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);

  /* load */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);

      if (!raw) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_NOTIFICATIONS));
        setNotifications(SEED_NOTIFICATIONS);
      } else {
        const parsed = JSON.parse(raw);
        setNotifications(parsed?.length ? parsed : SEED_NOTIFICATIONS);
      }
    } catch {
      setNotifications(SEED_NOTIFICATIONS);
    }
  }, []);

  /* persist */
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
  }, [notifications]);

  /* actions */
  function markRead(id) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }

  function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  /* sorted */
  const sorted = useMemo(
    () =>
      [...notifications].sort((a, b) => {
        if (a.read !== b.read) return a.read ? 1 : -1;
        return b.createdAt - a.createdAt;
      }),
    [notifications]
  );

  const unreadCount = notifications.filter((n) => !n.read).length;

  /* -------------------- UI -------------------- */

  return (
    <div className="min-h-screen bg-[var(--bg-body)] text-[var(--nav-text-active)] py-12 px-6 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-[var(--hero-glow)] blur-3xl opacity-20 pointer-events-none" />

      <div className="max-w-3xl mx-auto relative z-10">

        {/* header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-black tracking-tight text-[var(--nav-text-active)]">Notifications</h1>

          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="px-5 py-2 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
            >
              Mark all read
            </button>
          )}
        </div>

        {/* list */}
        <div className="space-y-4">
          {sorted.length === 0 ? (
            <div className="text-[var(--nav-text-muted)] text-center py-24 bg-[var(--card-bg)] rounded-3xl border border-dashed border-[var(--border-color)]">
              You're all caught up 🎉
            </div>
          ) : (
            sorted.map((n) => (
              <div
                key={n.id}
                className={`
                  flex items-start gap-5 p-5 rounded-2xl border transition-all duration-300
                  ${n.read
                    ? "bg-[var(--card-bg)] border-[var(--border-muted)] opacity-70"
                    : "bg-[var(--nav-active-bg)] border-indigo-500/30 shadow-sm"}
                `}
              >
                <div className="mt-1 p-2.5 rounded-xl bg-[var(--nav-hover-bg)] border border-[var(--border-muted)]">
                  {getIcon(n.type)}
                </div>

                <div className="flex-1">
                  <div className="text-sm leading-relaxed">
                    <span className="font-bold text-[var(--nav-text-active)]">{n.user}</span>{" "}
                    <span className="text-[var(--nav-text-active)] opacity-80">{n.message}</span>
                    {n.postTitle && (
                      <span className="text-indigo-500 font-semibold ml-1">
                        “{n.postTitle}”
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-[var(--nav-text-muted)] mt-1 font-medium">
                    {timeAgo(n.createdAt)} ago
                  </div>
                </div>

                {!n.read && (
                  <button
                    onClick={() => markRead(n.id)}
                    className="p-2 rounded-xl text-[var(--nav-text-muted)] hover:bg-[var(--nav-hover-bg-heavy)] hover:text-[var(--nav-text-active)] transition-all"
                    title="Mark read"
                  >
                    <Check size={18} />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}