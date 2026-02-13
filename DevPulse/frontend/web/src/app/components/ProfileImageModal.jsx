"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";

export default function ProfileImageModal({ open, onClose, user: externalUser }) {
  const { isLoaded, isSignedIn, user } = useUser();
  const [filePreview, setFilePreview] = useState(null);
  const [fileObj, setFileObj] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // use either externalUser prop or the hook user (both should point to same)
  const currentUser = externalUser || user;

  if (!open) return null;

  const onFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    // small validation
    if (!f.type.startsWith("image/")) {
      setMessage("Please pick an image file (jpg/png).");
      return;
    }
    setFileObj(f);
    const url = URL.createObjectURL(f);
    setFilePreview(url);
    setMessage(null);
  };

  const upload = async () => {
    if (!isLoaded) return;
    if (!fileObj) {
      setMessage("Pick an image first.");
      return;
    }
    setLoading(true);
    setMessage(null);

    try {
      await currentUser.setProfileImage({ file: fileObj });
      await currentUser.reload?.();

      setMessage("Profile image updated!");
      setTimeout(() => {
        setLoading(false);
        onClose();
      }, 700);
    } catch (err) {
      console.error("Failed to set profile image:", err);
      setMessage("Upload failed. Try a smaller image (<= 5MB).");
      setLoading(false);
    }
  };

  const removeImage = async () => {
    setLoading(true);
    try {
      await currentUser.setProfileImage({ file: null });
      await currentUser.reload?.();
      setMessage("Profile image removed.");
      setTimeout(() => { setLoading(false); onClose(); }, 600);
    } catch (err) {
      console.error(err);
      setMessage("Could not remove image.");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--modal-overlay)] backdrop-blur-lg">
      <div className="w-[420px] bg-[var(--dropdown-bg)] border border-[var(--border-color)] rounded-2xl p-6 shadow-2xl">
        <h3 className="text-lg font-semibold mb-4 text-[var(--nav-text-active)]">Update profile picture</h3>

        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full overflow-hidden border border-[var(--border-muted)]">
              <img
                src={filePreview || currentUser?.profileImageUrl || "/default-avatar.png"}
                alt="preview"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 bg-[var(--nav-hover-bg)] text-[var(--nav-text-active)] rounded-md border border-[var(--border-muted)] hover:bg-[var(--nav-hover-bg-heavy)] transition-colors">
                Choose image
                <input type="file" accept="image/*" onChange={onFileChange} className="hidden" />
              </label>

              <button onClick={removeImage} className="text-sm text-red-400 hover:underline w-fit">Remove image</button>
            </div>
          </div>

          {message && <div className="text-sm text-[var(--nav-text-muted)]">{message}</div>}

          <div className="flex justify-end gap-3 mt-4">
            <button 
              onClick={onClose} 
              className="px-4 py-2 rounded-lg bg-[var(--nav-hover-bg)] text-[var(--nav-text-active)] hover:bg-[var(--nav-hover-bg-heavy)] border border-[var(--border-muted)] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={upload}
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-60 shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
            >
              {loading ? "Uploading..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}