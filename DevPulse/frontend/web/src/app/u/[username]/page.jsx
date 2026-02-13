"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import {
  Edit2,
  ExternalLink,
  Github,
  Youtube,
  Linkedin,
  Instagram,
  Plus,
  Trash2,
  ArrowRight,
  X,
  UserPlus,
  UserCheck
} from "lucide-react";

/**
 * DevPulse Profile Page - Themed with CSS Variables
 */

const THEME_BG =
  "min-h-screen bg-[var(--bg-body)] text-[var(--nav-text-active)] relative overflow-hidden transition-colors duration-300";

function isValidUrl(s) {
  try {
    if (!s) return false;
    const u = new URL(s);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

function IconForSocial({ provider, className = "" }) {
  switch (provider) {
    case "github": return <Github className={className} size={18} />;
    case "youtube": return <Youtube className={className} size={18} />;
    case "linkedin": return <Linkedin className={className} size={18} />;
    case "instagram": return <Instagram className={className} size={18} />;
    default: return <ExternalLink className={className} size={18} />;
  }
}

function makeDefaultProfile(clerkUser, usernameParam) {
  return {
    ownerId: clerkUser?.id || "",
    username: usernameParam || clerkUser?.username || clerkUser?.id || "unknown",
    displayName: clerkUser?.fullName || clerkUser?.username || "New Dev",
    avatar: clerkUser?.imageUrl || `https://ui-avatars.com/api/?name=${usernameParam}`,
    bio: "",
    website: "",
    socials: {
      github: "",
      youtube: "",
      linkedin: "",
      instagram: "",
    },
    stats: {
      posts: 0,
      stars: 0,
      views: 0,
      followers: 0,
      following: 0,
    },
    sections: {
      openSource: [],
      projects: [],
      tutorials: [],
      articles: [],
    },
    joinedAt: clerkUser ? new Date().toISOString() : new Date().toISOString(),
  };
}

/* ---------------------------
   Hoisted sub-components
   --------------------------- */

function SectionList({
  profile,
  isOwner,
  keyName,
  title,
  subtitle,
  openAddSection,
  openEditSection,
  deleteSectionItem
}) {
  const items = profile.sections[keyName] || [];
  return (
    <section className="bg-[var(--card-bg)] border border-[var(--border-color)] backdrop-blur-xl rounded-3xl p-8 w-full shadow-lg">
      <div className="flex items-center justify-between gap-4 mb-8">
        <div className="min-w-0">
          <h3 className="text-2xl font-black tracking-tight text-[var(--nav-text-active)]">{title}</h3>
          {subtitle && <p className="text-[var(--nav-text-muted)] mt-1 text-sm md:text-base font-medium">{subtitle}</p>}
        </div>
        {isOwner && (
          <button
            onClick={() => openAddSection(keyName)}
            className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white transition-all text-sm font-bold shadow-lg shadow-indigo-500/20"
          >
            <Plus size={18} /> Add New
          </button>
        )}
      </div>

      <div className="space-y-4">
        {items.length === 0 ? (
          <div className="py-12 text-center border-2 border-dashed border-[var(--border-muted)] rounded-2xl">
            <p className="text-[var(--nav-text-muted)] italic text-sm">No {title.toLowerCase()} showcased yet.</p>
          </div>
        ) : (
          items.map((it, i) => (
            <article
              key={i}
              className="rounded-2xl p-5 bg-[var(--nav-hover-bg)] border border-[var(--border-muted)] flex justify-between items-start gap-4 transition-all hover:bg-[var(--nav-hover-bg-heavy)] hover:border-[var(--border-color)]"
            >
              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-[var(--nav-text-active)] text-lg">{it.title}</h4>
                <p className="text-[var(--nav-text-muted)] text-sm mt-1 leading-relaxed line-clamp-2">{it.description}</p>
                <div className="flex flex-wrap items-center gap-4 mt-4 text-xs font-bold">
                  {it.link && (
                    <a
                      href={it.link}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-indigo-500 hover:text-indigo-600 transition-colors"
                    >
                      <ExternalLink size={14} />
                      View Project
                    </a>
                  )}
                  <span className="bg-[var(--card-bg)] text-[var(--nav-text-muted)] px-3 py-1 rounded-lg border border-[var(--border-muted)]">{new Date(it.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              {isOwner && (
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => openEditSection(keyName, i)} className="p-2 rounded-xl hover:bg-[var(--nav-hover-bg-heavy)] text-[var(--nav-text-muted)] hover:text-[var(--nav-text-active)] transition-colors">
                    <Edit2 size={18} />
                  </button>
                  <button onClick={() => deleteSectionItem(keyName, i)} className="p-2 rounded-xl hover:bg-red-500/10 text-[var(--nav-text-muted)] hover:text-red-500 transition-colors">
                    <Trash2 size={18} />
                  </button>
                </div>
              )}
            </article>
          ))
        )}
      </div>
    </section>
  );
}

function EditProfileModal({ open, onClose, profile, saveProfile }) {
  const [local, setLocal] = useState(profile);
  useEffect(() => { setLocal(profile); }, [profile, open]);
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[var(--modal-overlay)] backdrop-blur-md" onClick={onClose} />
      <div className="relative z-10 max-w-2xl w-full rounded-[2.5rem] bg-[var(--dropdown-bg)] border border-[var(--border-color)] flex flex-col max-h-[85vh] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-8 border-b border-[var(--border-muted)] flex justify-between items-center">
          <h3 className="text-2xl font-black text-[var(--nav-text-active)]">Edit Profile</h3>
          <button onClick={onClose} className="p-2 hover:bg-[var(--nav-hover-bg)] rounded-full text-[var(--nav-text-muted)] transition-colors"><X size={24}/></button>
        </div>
        
        <div className="p-8 overflow-y-auto space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-[var(--nav-text-muted)] uppercase tracking-[0.2em]">Display name</label>
              <input value={local.displayName} onChange={(e) => setLocal({ ...local, displayName: e.target.value })} className="w-full rounded-2xl px-5 py-4 bg-[var(--nav-hover-bg)] border border-[var(--border-muted)] text-[var(--nav-text-active)] focus:border-indigo-500 outline-none transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-[var(--nav-text-muted)] uppercase tracking-[0.2em]">Avatar URL</label>
              <input value={local.avatar} onChange={(e) => setLocal({ ...local, avatar: e.target.value })} className="w-full rounded-2xl px-5 py-4 bg-[var(--nav-hover-bg)] border border-[var(--border-muted)] text-[var(--nav-text-active)] focus:border-indigo-500 outline-none transition-all" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-[var(--nav-text-muted)] uppercase tracking-[0.2em]">Bio</label>
            <textarea value={local.bio} onChange={(e) => setLocal({ ...local, bio: e.target.value })} rows={3} className="w-full rounded-2xl px-5 py-4 bg-[var(--nav-hover-bg)] border border-[var(--border-muted)] text-[var(--nav-text-active)] focus:border-indigo-500 outline-none transition-all resize-none" placeholder="Tell your story..." />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-[var(--nav-text-muted)] uppercase tracking-[0.2em]">Website</label>
            <input value={local.website} onChange={(e) => setLocal({ ...local, website: e.target.value })} className="w-full rounded-2xl px-5 py-4 bg-[var(--nav-hover-bg)] border border-[var(--border-muted)] text-[var(--nav-text-active)] focus:border-indigo-500 outline-none transition-all" placeholder="https://yourportfolio.com" />
          </div>

          <div className="grid grid-cols-2 gap-6">
             <div className="space-y-2">
              <label className="text-[10px] font-black text-[var(--nav-text-muted)] uppercase tracking-[0.2em]">Followers (Seed)</label>
              <input type="number" value={local.stats.followers} onChange={(e) => setLocal({ ...local, stats: { ...local.stats, followers: parseInt(e.target.value) || 0 } })} className="w-full rounded-2xl px-5 py-4 bg-[var(--nav-hover-bg)] border border-[var(--border-muted)] text-[var(--nav-text-active)] focus:border-indigo-500 outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-[var(--nav-text-muted)] uppercase tracking-[0.2em]">Following (Seed)</label>
              <input type="number" value={local.stats.following} onChange={(e) => setLocal({ ...local, stats: { ...local.stats, following: parseInt(e.target.value) || 0 } })} className="w-full rounded-2xl px-5 py-4 bg-[var(--nav-hover-bg)] border border-[var(--border-muted)] text-[var(--nav-text-active)] focus:border-indigo-500 outline-none" />
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black text-[var(--nav-text-muted)] uppercase tracking-[0.2em]">Social links</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {['github', 'youtube', 'linkedin', 'instagram'].map(s => (
                <div key={s} className="relative">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--nav-text-muted)]">
                      <IconForSocial provider={s} />
                  </div>
                  <input value={local.socials[s]} onChange={(e) => setLocal({ ...local, socials: { ...local.socials, [s]: e.target.value } })} placeholder={`${s.charAt(0).toUpperCase() + s.slice(1)} URL`} className="w-full rounded-2xl pl-14 pr-5 py-4 bg-[var(--nav-hover-bg)] border border-[var(--border-muted)] text-sm text-[var(--nav-text-active)] focus:border-indigo-500 outline-none transition-all" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-8 border-t border-[var(--border-muted)] flex justify-end gap-4 bg-[var(--nav-hover-bg)]">
          <button onClick={onClose} className="px-6 py-3 rounded-2xl hover:bg-[var(--nav-hover-bg-heavy)] text-[var(--nav-text-active)] font-bold transition-all">Cancel</button>
          <button onClick={() => { saveProfile(local, true); onClose(); }} className="px-10 py-3 rounded-2xl bg-indigo-600 text-white font-black shadow-lg shadow-indigo-500/20 active:scale-95 transition-all">Update Profile</button>
        </div>
      </div>
    </div>
  );
}

function SectionEditorModal({
  open,
  onClose,
  editingSection,
  sectionForm,
  setSectionForm,
  saveSection
}) {
  if (!open) return null;
  const providerLinkValid = !sectionForm.link || isValidUrl(sectionForm.link);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[var(--modal-overlay)] backdrop-blur-md" onClick={onClose} />
      <div className="relative z-10 max-w-lg w-full rounded-[2.5rem] bg-[var(--dropdown-bg)] border border-[var(--border-color)] flex flex-col max-h-[85vh] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-8 border-b border-[var(--border-muted)] bg-[var(--nav-hover-bg)]">
          <h3 className="text-xl font-black text-[var(--nav-text-active)] capitalize">{editingSection?.index === -1 ? "Add" : "Edit"} {editingSection?.key}</h3>
        </div>
        <div className="p-8 overflow-y-auto space-y-4">
          <input value={sectionForm.title} onChange={(e) => setSectionForm({ ...sectionForm, title: e.target.value })} placeholder="Title" className="w-full rounded-2xl px-5 py-4 bg-[var(--nav-hover-bg)] border border-[var(--border-muted)] text-[var(--nav-text-active)] focus:border-indigo-500 outline-none" />
          <textarea value={sectionForm.description} onChange={(e) => setSectionForm({ ...sectionForm, description: e.target.value })} rows={4} placeholder="Description" className="w-full rounded-2xl px-5 py-4 bg-[var(--nav-hover-bg)] border border-[var(--border-muted)] text-[var(--nav-text-active)] focus:border-indigo-500 outline-none resize-none" />
          <input value={sectionForm.link} onChange={(e) => setSectionForm({ ...sectionForm, link: e.target.value })} placeholder="Link (https://...)" className="w-full rounded-2xl px-5 py-4 bg-[var(--nav-hover-bg)] border border-[var(--border-muted)] text-[var(--nav-text-active)] focus:border-indigo-500 outline-none" />
          <input value={sectionForm.tags} onChange={(e) => setSectionForm({ ...sectionForm, tags: e.target.value })} placeholder="Tags (comma separated)" className="w-full rounded-2xl px-5 py-4 bg-[var(--nav-hover-bg)] border border-[var(--border-muted)] text-[var(--nav-text-active)] focus:border-indigo-500 outline-none" />
        </div>
        <div className="p-8 border-t border-[var(--border-muted)] flex justify-end gap-4 bg-[var(--nav-hover-bg)]">
          <button onClick={onClose} className="px-6 py-3 rounded-2xl hover:bg-[var(--nav-hover-bg-heavy)] text-[var(--nav-text-active)] font-bold transition-all">Cancel</button>
          <button onClick={saveSection} disabled={!sectionForm.title || !providerLinkValid} className="px-10 py-3 rounded-2xl bg-indigo-600 text-white font-black disabled:opacity-50 shadow-lg shadow-indigo-500/20 active:scale-95 transition-all">Save {editingSection?.key}</button>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------
   Main page component
   --------------------------- */

export default function UserProfilePage() {
  const params = useParams();
  const routeUsername = params?.username || "unknown";

  const { user: clerkUser, isLoaded } = useUser();

  const storageKey = useMemo(
    () => `devpulse_profile_${routeUsername}`,
    [routeUsername]
  );

  const [profile, setProfile] = useState(() =>
    makeDefaultProfile(clerkUser || {}, routeUsername)
  );

  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  
  const [sectionForm, setSectionForm] = useState({
    title: "",
    description: "",
    link: "",
    tags: "",
  });

  const isOwner = useMemo(() => {
    if (!isLoaded || !clerkUser) return false;
    return profile.username === clerkUser.username || profile.username === clerkUser.id;
  }, [isLoaded, clerkUser, profile.username]);

  useEffect(() => {
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        setProfile((p) => ({ ...p, ...parsed }));
      } catch { /* ignore */ }
    } else {
      if (clerkUser) {
        const seeded = makeDefaultProfile(clerkUser, routeUsername);
        setProfile((p) => ({ ...p, ...seeded }));
      }
    }
    setLoading(false);
  }, [storageKey, routeUsername, clerkUser?.id]);

  async function saveProfile(newProfile, showToast = false) {
    setProfile(newProfile);
    localStorage.setItem(storageKey, JSON.stringify(newProfile));

    try {
      await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProfile),
      });
    } catch (e) { /* non-blocking */ }

    if (showToast) {
      const el = document.createElement("div");
      el.textContent = "Profile saved";
      el.className = "fixed bottom-6 right-6 bg-indigo-600 text-white px-5 py-2.5 rounded-xl z-[9999] shadow-2xl font-bold animate-in slide-in-from-bottom-2";
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 1400);
    }
  }

  function handleFollow() {
    if (isOwner) return;
    const nextFollowingState = !isFollowing;
    setIsFollowing(nextFollowingState);
    const newStats = {
      ...profile.stats,
      followers: nextFollowingState 
        ? (profile.stats.followers || 0) + 1 
        : Math.max(0, (profile.stats.followers || 0) - 1)
    };
    saveProfile({ ...profile, stats: newStats });
  }

  function updateSocial(provider, url) {
    const next = {
      ...profile,
      socials: { ...profile.socials, [provider]: url },
    };
    saveProfile(next);
  }

  function openAddSection(key) {
    setEditingSection({ key, index: -1 });
    setSectionForm({ title: "", description: "", link: "", tags: "" });
  }

  function openEditSection(key, index) {
    const item = profile.sections[key][index];
    setEditingSection({ key, index });
    setSectionForm({
      title: item.title,
      description: item.description,
      link: item.link,
      tags: (item.tags || []).join(", "),
    });
  }

  function saveSection() {
    const key = editingSection.key;
    const index = editingSection.index;
    const newItem = {
      title: sectionForm.title,
      description: sectionForm.description,
      link: sectionForm.link,
      tags: sectionForm.tags.split(",").map((t) => t.trim()).filter(Boolean),
      createdAt: new Date().toISOString(),
    };

    const copy = { ...profile };
    const arr = copy.sections[key] ? [...copy.sections[key]] : [];
    if (index === -1) arr.unshift(newItem);
    else arr[index] = { ...arr[index], ...newItem };

    copy.sections[key] = arr;
    saveProfile(copy, true);
    setEditingSection(null);
    setSectionForm({ title: "", description: "", link: "", tags: "" });
  }

  function deleteSectionItem(key, index) {
    if (!confirm("Delete this item?")) return;
    const copy = { ...profile };
    copy.sections[key] = copy.sections[key].filter((_, i) => i !== index);
    saveProfile(copy, true);
  }

  return (
    <div className={THEME_BG}>
      {/* Background Glow */}
      <div className="absolute inset-0 bg-[var(--hero-glow)] blur-[120px] opacity-20 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-16 relative z-10">
        {/* Header Section */}
        <header className="relative rounded-[3rem] p-8 md:p-12 border border-[var(--border-color)] bg-[var(--card-bg)] backdrop-blur-2xl overflow-hidden shadow-2xl">
          <div className="relative flex flex-col lg:flex-row gap-12 items-center lg:items-start text-center lg:text-left">
            <img src={profile.avatar} alt={profile.displayName} className="w-32 h-32 md:w-44 md:h-44 rounded-[2.5rem] object-cover border-4 border-[var(--border-muted)] shadow-2xl shrink-0" />
            
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                <h1 className="text-4xl md:text-6xl font-black tracking-tight text-[var(--nav-text-active)]">{profile.displayName}</h1>
                <span className="text-[var(--nav-text-muted)] font-mono text-base px-4 py-1.5 bg-[var(--nav-hover-bg)] rounded-2xl border border-[var(--border-muted)]">@{profile.username}</span>
              </div>
              <p className="mt-6 text-[var(--nav-text-muted)] text-lg md:text-xl max-w-2xl mx-auto lg:mx-0 leading-relaxed font-bold">
                {profile.bio || "Crafting experiences and building the future of the web."}
              </p>
              
              <div className="mt-8 flex flex-wrap justify-center lg:justify-start gap-4">
                {isOwner ? (
                  <button onClick={() => setEditOpen(true)} className="px-10 py-3.5 rounded-2xl bg-[var(--nav-hover-bg)] hover:bg-[var(--nav-hover-bg-heavy)] text-[var(--nav-text-active)] transition-all font-black flex items-center gap-2 text-sm border border-[var(--border-muted)] shadow-xl">
                    <Edit2 size={18}/> Update Profile
                  </button>
                ) : (
                  <button 
                    onClick={handleFollow} 
                    className={`px-12 py-3.5 rounded-2xl transition-all font-black flex items-center gap-2 text-sm shadow-2xl ${
                      isFollowing 
                      ? 'bg-[var(--nav-hover-bg-heavy)] border border-[var(--border-color)] text-[var(--nav-text-active)]' 
                      : 'bg-indigo-600 text-white shadow-indigo-500/20'
                    }`}
                  >
                    {isFollowing ? <UserCheck size={20}/> : <UserPlus size={20}/>}
                    {isFollowing ? "Following" : "Follow Developer"}
                  </button>
                )}
                
                {profile.website && (
                  <a href={profile.website} target="_blank" rel="noreferrer" className="px-10 py-3.5 rounded-2xl bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20 transition-all font-black flex items-center gap-2 text-sm border border-indigo-500/20 shadow-xl">
                    Portfolio <ArrowRight size={18}/>
                  </a>
                )}
              </div>
            </div>
            
            {/* Stats & Socials Grid */}
            <div className="w-full lg:w-[400px] shrink-0 space-y-6">
              <div className="bg-[var(--nav-hover-bg)] p-8 rounded-[2.5rem] border border-[var(--border-muted)] backdrop-blur-md shadow-inner">
                <div className="grid grid-cols-3 gap-3 mb-8">
                    {[
                        { val: profile.stats.followers || 0, label: "Fans" },
                        { val: profile.stats.following || 0, label: "Following" },
                        { val: profile.stats.posts, label: "Builds" },
                        { val: profile.stats.stars, label: "Stars" },
                        { val: profile.stats.views, label: "Views" },
                        { val: new Date(profile.joinedAt).getFullYear(), label: "Since" }
                    ].map((s, idx) => (
                        <div key={idx} className="bg-[var(--card-bg)] border border-[var(--border-muted)] p-3 rounded-2xl text-center shadow-sm">
                        <div className="text-xl font-black text-[var(--nav-text-active)]">{s.val}</div>
                        <div className="text-[9px] text-[var(--nav-text-muted)] font-black uppercase tracking-widest mt-1">{s.label}</div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-4 gap-3">
                  {['github', 'youtube', 'linkedin', 'instagram'].map(k => {
                    const v = profile.socials[k];
                    return (
                      <button 
                        key={k} 
                        onClick={() => { 
                          if(!v) { 
                            if(isOwner) {
                              const u = prompt(`Enter ${k} URL`); 
                              if(u) updateSocial(k, u); 
                            }
                          } else { 
                            window.open(v, '_blank'); 
                          } 
                        }} 
                        className={`aspect-square rounded-2xl flex items-center justify-center transition-all border ${
                          v 
                          ? 'bg-indigo-600 border-indigo-400 text-white shadow-xl shadow-indigo-500/20' 
                          : 'bg-[var(--card-bg)] border-[var(--border-muted)] text-[var(--nav-text-muted)] hover:bg-[var(--nav-hover-bg)]'
                        }`}
                      >
                        <IconForSocial provider={k} />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content Layout */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-8 space-y-10 min-w-0">
            {['openSource', 'projects', 'tutorials', 'articles'].map(key => (
               <SectionList
               key={key}
               title={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
               subtitle={key === 'openSource' ? "Public Repos" : key === 'projects' ? "Recent Builds" : key === 'tutorials' ? "Guides" : "Thought Pieces"}
               keyName={key}
               profile={profile}
               isOwner={isOwner}
               openAddSection={openAddSection}
               openEditSection={openEditSection}
               deleteSectionItem={deleteSectionItem}
             />
            ))}
          </div>

          <aside className="lg:col-span-4 space-y-10">
            <div className="rounded-[2.5rem] p-8 bg-[var(--card-bg)] border border-[var(--border-color)] shadow-xl backdrop-blur-xl">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[var(--nav-text-muted)] mb-6">About Developer</h3>
              <p className="text-[var(--nav-text-active)] text-sm leading-relaxed font-medium opacity-80">{profile.bio || "This developer hasn't added a detailed bio yet."}</p>
            </div>

            <div className="rounded-[2.5rem] p-8 bg-[var(--card-bg)] border border-[var(--border-color)] shadow-xl backdrop-blur-xl overflow-hidden">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[var(--nav-text-muted)] mb-8">Social Connections</h3>
              <div className="space-y-6">
                {Object.entries(profile.socials).map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between gap-4 group">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className={`p-3 rounded-2xl border transition-all shrink-0 ${v ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-500 shadow-sm' : 'bg-[var(--nav-hover-bg)] border-[var(--border-muted)] text-[var(--nav-text-muted)] opacity-50'}`}>
                        <IconForSocial provider={k} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[10px] font-black uppercase tracking-widest text-[var(--nav-text-muted)]">{k}</div>
                        <div className="text-sm font-bold text-[var(--nav-text-active)] truncate">{v ? "Authenticated" : "Disconnected"}</div>
                      </div>
                    </div>
                    {isOwner && (
                      <button onClick={() => { const u = prompt(`Edit ${k}`, v || ""); if(u !== null) updateSocial(k, u); }} className="text-xs font-black text-indigo-500 hover:text-indigo-400 transition-colors uppercase">Edit</button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>

      <EditProfileModal open={editOpen} onClose={() => setEditOpen(false)} profile={profile} saveProfile={saveProfile} />
      <SectionEditorModal
        open={!!editingSection}
        onClose={() => setEditingSection(null)}
        editingSection={editingSection}
        sectionForm={sectionForm}
        setSectionForm={setSectionForm}
        saveSection={saveSection}
      />
    </div>
  );
}