"use client";

import { useMemo, useState } from "react";
import { Camera, ImagePlus } from "lucide-react";

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function AvatarUploader({ name, defaultValue, error }: { name: string; defaultValue?: string | null; error?: string }) {
  const [avatar, setAvatar] = useState(defaultValue ?? "");
  const [localError, setLocalError] = useState("");
  const fallback = useMemo(() => initials(name), [name]);

  function handleFile(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setLocalError("Upload a valid image file.");
      return;
    }
    if (file.size > 1024 * 1024) {
      setLocalError("Avatar must be under 1 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setAvatar(String(reader.result));
      setLocalError("");
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white/80 p-4">
      <input type="hidden" name="avatar" value={avatar} />
      <div className="flex items-center gap-4">
        <div className="relative grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-xl bg-gradient-to-br from-teal-600 to-slate-900 text-lg font-bold text-white">
          {avatar ? <img src={avatar} alt="" className="h-full w-full object-cover" /> : fallback}
          <div className="absolute bottom-1 right-1 grid h-7 w-7 place-items-center rounded-lg bg-white text-slate-700 shadow">
            <Camera className="h-4 w-4" aria-hidden />
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-900">Profile picture</p>
          <p className="mt-1 text-xs text-slate-500">Upload a square JPG or PNG under 1 MB.</p>
          <label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-teal-300 hover:text-teal-700">
            <ImagePlus className="h-4 w-4" aria-hidden />
            Change avatar
            <input className="sr-only" type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => handleFile(event.target.files?.[0])} />
          </label>
          {localError || error ? <p className="mt-2 text-xs font-medium text-rose-600">{localError || error}</p> : null}
        </div>
      </div>
    </div>
  );
}
