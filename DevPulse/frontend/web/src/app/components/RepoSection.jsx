import React, { useState, useRef, useEffect } from "react";
import { LayoutGrid, Settings } from "lucide-react";

export default function RepoSection({ initialRepos = [] }) {
  const [repos, setRepos] = useState(initialRepos);
  const [openEditId, setOpenEditId] = useState(null);
  const [form, setForm] = useState({
    showStars: true,
    showForks: true,
    showDescription: true,
    pinToTop: false,
    hideRepo: false,
    description: "",
  });

  const popoverRef = useRef(null);
  useEffect(() => {
    function onDocClick(e) {
      if (!popoverRef.current) return;
      if (!popoverRef.current.contains(e.target)) {
        setOpenEditId(null);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  function openEditorFor(repo) {
    setOpenEditId(repo.id);
    setForm({
      showStars: repo.settings?.showStars ?? true,
      showForks: repo.settings?.showForks ?? true,
      showDescription: repo.settings?.showDescription ?? true,
      pinToTop: repo.settings?.pinToTop ?? false,
      hideRepo: repo.settings?.hideRepo ?? false,
      description: repo.description ?? "",
    });
  }

  function saveRepoSettings(repoId) {
    setRepos((prev) =>
      prev.map((r) =>
        r.id === repoId
          ? {
              ...r,
              description: form.description,
              settings: {
                showStars: form.showStars,
                showForks: form.showForks,
                showDescription: form.showDescription,
                pinToTop: form.pinToTop,
                hideRepo: form.hideRepo,
              },
            }
          : r
      )
    );
    setOpenEditId(null);
  }

  return (
    <section>
      <div className="flex items-center gap-3 mb-6">
        <LayoutGrid size={20} className="text-purple-400" />
        <h3 className="text-2xl font-semibold text-[var(--nav-text-active)]">Your Repositories</h3>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-visible">
        {repos.map((repo) => (
          <article
            key={repo.id}
            className={`relative ${
              openEditId === repo.id ? "z-[9999]" : "z-0"
            } rounded-2xl p-6 bg-[var(--card-bg)] border border-[var(--border-color)] transition backdrop-blur-lg group ${
              repo.settings?.hideRepo ? "opacity-30" : ""
            } shadow-sm hover:shadow-md transition-shadow`}
          >
            <div className="absolute top-3 right-3">
              <button
                onClick={() => openEditorFor(repo)}
                className="text-xs px-3 py-1 rounded-lg bg-[var(--nav-hover-bg)] text-[var(--nav-text-active)] border border-[var(--border-muted)] hover:bg-purple-600 hover:text-white transition flex items-center gap-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                aria-expanded={openEditId === repo.id}
              >
                <Settings size={14} />
                <span className="hidden sm:inline">Edit</span>
              </button>

              {openEditId === repo.id && (
                <div
                  ref={popoverRef}
                  className="absolute right-0 mt-2 w-72 z-[10000] rounded-xl bg-[var(--dropdown-bg)] border border-[var(--border-color)] p-4 shadow-2xl text-sm"
                >
                  <h4 className="text-lg font-semibold mb-3 text-[var(--nav-text-active)]">
                    Customize &middot;{" "}
                    <span className="font-medium text-[var(--nav-text-muted)]">{repo.name}</span>
                  </h4>

                  <div className="space-y-2 mb-3">
                    <label className="flex items-center justify-between gap-3">
                      <span className="text-[var(--nav-text-muted)]">Show stars</span>
                      <input
                        type="checkbox"
                        checked={form.showStars}
                        onChange={(e) =>
                          setForm((s) => ({ ...s, showStars: e.target.checked }))
                        }
                        className="h-4 w-4 rounded border-[var(--border-muted)] bg-[var(--nav-hover-bg)] accent-purple-500"
                      />
                    </label>

                    <label className="flex items-center justify-between gap-3">
                      <span className="text-[var(--nav-text-muted)]">Show forks</span>
                      <input
                        type="checkbox"
                        checked={form.showForks}
                        onChange={(e) =>
                          setForm((s) => ({ ...s, showForks: e.target.checked }))
                        }
                        className="h-4 w-4 rounded border-[var(--border-muted)] bg-[var(--nav-hover-bg)] accent-purple-500"
                      />
                    </label>

                    <label className="flex items-center justify-between gap-3">
                      <span className="text-[var(--nav-text-muted)]">Show description</span>
                      <input
                        type="checkbox"
                        checked={form.showDescription}
                        onChange={(e) =>
                          setForm((s) => ({ ...s, showDescription: e.target.checked }))
                        }
                        className="h-4 w-4 rounded border-[var(--border-muted)] bg-[var(--nav-hover-bg)] accent-purple-500"
                      />
                    </label>

                    <label className="flex items-center justify-between gap-3">
                      <span className="text-[var(--nav-text-muted)]">Pin to top</span>
                      <input
                        type="checkbox"
                        checked={form.pinToTop}
                        onChange={(e) =>
                          setForm((s) => ({ ...s, pinToTop: e.target.checked }))
                        }
                        className="h-4 w-4 rounded border-[var(--border-muted)] bg-[var(--nav-hover-bg)] accent-purple-500"
                      />
                    </label>

                    <label className="flex items-center justify-between gap-3">
                      <span className="text-[var(--nav-text-muted)]">Hide repo</span>
                      <input
                        type="checkbox"
                        checked={form.hideRepo}
                        onChange={(e) =>
                          setForm((s) => ({ ...s, hideRepo: e.target.checked }))
                        }
                        className="h-4 w-4 rounded border-[var(--border-muted)] bg-[var(--nav-hover-bg)] accent-purple-500"
                      />
                    </label>
                  </div>

                  <label className="text-[var(--nav-text-muted)] text-sm mb-1 block">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))}
                    rows={3}
                    placeholder="Short project summary for this repo..."
                    className="w-full resize-none rounded-md border border-[var(--border-muted)] bg-[var(--nav-hover-bg)] px-3 py-2 text-sm text-[var(--nav-text-active)] placeholder:text-[var(--nav-text-muted)] focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />

                  <div className="mt-3 flex items-center justify-end gap-3">
                    <button
                      onClick={() => setOpenEditId(null)}
                      className="px-4 py-2 rounded-lg bg-[var(--nav-hover-bg)] text-[var(--nav-text-active)] hover:bg-[var(--nav-hover-bg-heavy)] border border-[var(--border-muted)] transition text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => saveRepoSettings(repo.id)}
                      className="px-4 py-2 rounded-lg bg-gradient-to-br from-purple-500 to-violet-600 text-white text-sm shadow-md hover:brightness-110 transition"
                    >
                      Save
                    </button>
                  </div>
                </div>
              )}
            </div>

            <h4 className="font-semibold mb-2 text-[var(--nav-text-active)]">{repo.name}</h4>

            {repo.settings?.showDescription ?? true ? (
              <p className="text-sm text-[var(--nav-text-muted)] mb-4">{repo.description || "No description yet."}</p>
            ) : (
              <p className="text-sm text-[var(--nav-text-muted)] opacity-50 italic mb-4">Description hidden</p>
            )}

            <div className="flex justify-between text-sm text-[var(--nav-text-muted)]">
              <span>{(repo.settings?.showStars ?? true) ? `⭐ ${repo.stars ?? 0}` : null}</span>
              <span>{(repo.settings?.showForks ?? true) ? `🍴 ${repo.forks ?? 0}` : null}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}