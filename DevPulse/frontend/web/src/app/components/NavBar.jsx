"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useUser, SignOutButton } from "@clerk/nextjs";
import ProfileImageModal from "./ProfileImageModal";
import { Menu, Bell, LayoutDashboard, Sun, Moon } from "lucide-react";
import { usePathname } from "next/navigation";
import { useTheme } from "@/context/ThemeContext"; // Import global theme context

export default function NavBar() {
  const { isLoaded, user } = useUser();
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const pathname = usePathname();

  // Use global theme state and toggle function
  const { isDarkMode, toggleTheme } = useTheme();

  // Notifications state
  const [notifications, setNotifications] = useState(null);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [notifError, setNotifError] = useState(null);
  const [notifOpen, setNotifOpen] = useState(false);

  const notifRef = useRef();
  const profileRef = useRef();
  const mobileRef = useRef();

  async function fetchNotifications() {
    setLoadingNotifications(true);
    setNotifError(null);
    try {
      const res = await fetch("/api/notifications");
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(txt || "Failed to fetch notifications");
      }
      const data = await res.json();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("notifications fetch error", err);
      setNotifError(String(err?.message ?? err) || "Failed to load notifications");
      setNotifications([]);
    } finally {
      setLoadingNotifications(false);
    }
  }

  async function toggleNotifications() {
    const next = !notifOpen;
    setNotifOpen(next);
    if (next && notifications === null) {
      await fetchNotifications();
    }
  }

  async function markRead(id) {
    setNotifications((prev) =>
      prev?.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    try {
      await fetch("/api/notifications/mark-read", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id }),
      });
    } catch (err) {
      console.error("mark read error", err);
    }
  }

  useEffect(() => {
    function onDocClick(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
      if (mobileRef.current && !mobileRef.current.contains(e.target)) {
        setMobileOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  if (!isLoaded) return null;

  const avatarUrl = user?.profileImageUrl || user?.imageUrl || "/default-avatar.png";
  const unreadCount = (notifications || []).filter((n) => !n.read).length;

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/explore", label: "Explore" },
    { href: "/feed", label: "Feed" },
    { href: "/media", label: "Media" },
  ];

  const isActive = (href) => {
    if (!pathname) return false;
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const linkBase = "px-3 py-2 rounded-md transition text-sm flex items-center gap-2";
  const activeCls = "bg-[var(--nav-active-bg)] text-[var(--nav-text-active)] font-semibold";
  const inactiveCls = "text-[var(--nav-text-muted)] hover:text-[var(--nav-text-active)] hover:bg-[var(--nav-hover-bg)]";

  return (
    <>
      <header className="w-full sticky top-0 z-50 bg-[var(--nav-bg)] backdrop-blur-xl border-b border-[var(--border-color)] transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="flex items-center gap-3 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-xs shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                DP
              </div>
              <span className="font-bold text-[var(--nav-text-active)] tracking-tight hidden sm:block">DevPulse</span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`${linkBase} ${isActive(item.href) ? activeCls : inactiveCls}`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {pathname !== "/dashboard" && (
              <Link
                href="/dashboard"
                className="hidden md:flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--nav-active-bg)] hover:bg-[var(--nav-hover-bg-heavy)] border border-[var(--border-color)] text-[var(--nav-text-active)] text-sm font-medium transition-all hover:shadow-lg hover:shadow-white/5 active:scale-95"
              >
                <LayoutDashboard size={15} className="text-indigo-400" />
                Dashboard
              </Link>
            )}

            {/* --- Theme Toggle --- */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-2 rounded-full text-[var(--nav-text-muted)] hover:bg-[var(--nav-hover-bg)] hover:text-[var(--nav-text-active)] transition-all active:scale-90"
            >
              {isDarkMode ? <Sun size={20} className="text-amber-400" /> : <Moon size={20} className="text-indigo-500" />}
            </button>

            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={toggleNotifications}
                className={`p-2 rounded-full transition-colors ${notifOpen ? 'bg-[var(--nav-hover-bg-heavy)] text-[var(--nav-text-active)]' : 'text-[var(--nav-text-muted)] hover:bg-[var(--nav-hover-bg)] hover:text-[var(--nav-text-active)]'}`}
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 flex items-center justify-center text-[10px] font-bold text-white bg-red-500 rounded-full border-2 border-[var(--bg-body)]">
                    {unreadCount > 9 ? "!" : unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-3 w-80 sm:w-96 overflow-hidden bg-[var(--dropdown-bg)] border border-[var(--border-color)] rounded-2xl shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200">
                  <div className="px-4 py-3 border-b border-[var(--border-muted)] bg-[var(--nav-hover-bg)]">
                    <span className="text-sm font-bold text-[var(--nav-text-active)]">Notifications</span>
                  </div>

                  <div className="p-2">
                    {loadingNotifications ? (
                      <div className="p-8 text-center text-[var(--nav-text-muted)] text-sm">Loading...</div>
                    ) : notifError ? (
                      <div className="p-8 text-center text-red-400 text-xs">{notifError}</div>
                    ) : (notifications?.length === 0) ? (
                      <div className="p-8 text-center text-[var(--nav-text-muted)] text-sm italic">No notifications.</div>
                    ) : (
                      <>
                        <div className="space-y-1">
                          {notifications.slice(0, 2).map((n) => (
                            <div
                              key={n.id}
                              className={`p-3 rounded-xl transition-colors relative group ${n.read ? "opacity-60" : "bg-[var(--nav-hover-bg)] hover:bg-[var(--nav-hover-bg-heavy)]"}`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                  <div className="text-sm font-semibold text-[var(--nav-text-active)] truncate">{n.title}</div>
                                  <div className="text-xs text-[var(--nav-text-muted)] line-clamp-2 mt-0.5">{n.body}</div>
                                </div>
                                {!n.read && <div className="w-2 h-2 mt-1.5 rounded-full bg-indigo-500 shrink-0" />}
                              </div>
                              <div className="mt-3 flex items-center justify-between">
                                <span className="text-[10px] text-[var(--nav-text-muted)] font-medium">
                                  {new Date(n.createdAt).toLocaleDateString()}
                                </span>
                                {!n.read && (
                                  <button onClick={() => markRead(n.id)} className="text-[10px] font-bold text-[var(--nav-text-muted)] hover:text-[var(--nav-text-active)] px-2 py-1 rounded-md bg-[var(--nav-hover-bg)] transition-colors">
                                    Mark read
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        <div className="mt-2 pt-2 border-t border-[var(--border-muted)]">
                          <Link 
                            href="/notifications" 
                            className="block w-full text-center py-2 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
                            onClick={() => setNotifOpen(false)}
                          >
                            View all notifications
                          </Link>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Menu (avatar) */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => {
                  setProfileOpen((s) => !s);
                  setMobileOpen(false); 
                }}
                className="flex items-center gap-2 rounded-full p-0.5 hover:ring-2 hover:ring-[var(--border-color)] transition-all border border-[var(--border-color)]"
                aria-expanded={profileOpen}
                aria-label="Account menu"
              >
                <img
                  src={avatarUrl}
                  alt="User"
                  className="w-8 h-8 rounded-full object-cover"
                />
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-[var(--dropdown-bg)] border border-[var(--border-color)] rounded-2xl shadow-2xl py-2 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-4 py-2 border-b border-[var(--border-muted)] mb-1">
                    <p className="text-xs font-bold text-[var(--nav-text-muted)] uppercase tracking-widest">Account</p>
                    <p className="text-sm font-semibold truncate text-[var(--nav-text-active)]">{user?.fullName || user?.username}</p>
                  </div>
                  
                  <Link href={`/u/${user?.username ?? user?.id}`} className="flex items-center px-4 py-2.5 text-sm text-[var(--nav-text-muted)] hover:bg-[var(--nav-hover-bg)] hover:text-[var(--nav-text-active)] transition-colors" onClick={() => setProfileOpen(false)}>
                    View Profile
                  </Link>

                  <Link href="/settings" className="flex items-center px-4 py-2.5 text-sm text-[var(--nav-text-muted)] hover:bg-[var(--nav-hover-bg)] hover:text-[var(--nav-text-active)] transition-colors" onClick={() => setProfileOpen(false)}>
                    Settings
                  </Link>

                  <button
                    className="w-full text-left px-4 py-2.5 text-sm text-[var(--nav-text-muted)] hover:bg-[var(--nav-hover-bg)] hover:text-[var(--nav-text-active)] transition-colors"
                    onClick={() => { setAvatarModalOpen(true); setProfileOpen(false); }}
                  >
                    Change Picture
                  </button>

                  <div className="border-t border-[var(--border-muted)] my-1" />

                  <SignOutButton redirectUrl="/sign-in">
                    <button className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors font-medium">
                      Sign out
                    </button>
                  </SignOutButton>
                </div>
              )}
            </div>

            {/* Mobile hamburger */}
            <div className="relative md:hidden" ref={mobileRef}>
              <button
                aria-label="Open site menu"
                aria-expanded={mobileOpen}
                onClick={() => {
                  setMobileOpen((s) => !s);
                  setProfileOpen(false); 
                }}
                className="p-2 text-[var(--nav-text-muted)] hover:text-[var(--nav-text-active)] transition-colors"
              >
                <Menu size={20} />
              </button>

              {mobileOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-[var(--dropdown-bg)] border border-[var(--border-color)] rounded-2xl shadow-2xl py-2 overflow-hidden animate-in fade-in duration-200">
                  <nav className="flex flex-col">
                    {navItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={`px-4 py-2 text-sm ${isActive(item.href) ? "bg-[var(--nav-active-bg)] text-[var(--nav-text-active)] font-semibold" : "text-[var(--nav-text-muted)] hover:bg-[var(--nav-hover-bg)] hover:text-[var(--nav-text-active)]"} transition-colors`}
                      >
                        {item.label}
                      </Link>
                    ))}

                    {pathname !== "/dashboard" && (
                      <div className="px-4 py-2 border-t border-[var(--border-muted)] mt-1">
                        <Link
                          href="/dashboard"
                          onClick={() => setMobileOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--nav-hover-bg)] hover:bg-[var(--nav-hover-bg-heavy)] text-[var(--nav-text-active)] text-sm font-medium transition-all"
                        >
                          <LayoutDashboard size={15} className="text-indigo-400" />
                          Dashboard
                        </Link>
                      </div>
                    )}
                  </nav>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <ProfileImageModal open={avatarModalOpen} onClose={() => setAvatarModalOpen(false)} user={user} />
    </>
  );
}