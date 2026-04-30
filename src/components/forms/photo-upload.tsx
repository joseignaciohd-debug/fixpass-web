"use client";

// Photo upload — validates client-side, uploads to Supabase Storage
// under the signed-in user's folder, returns a list of storage paths.
// Same guardrails as mobile: max 3 photos, max 15 MB each, whitelist
// JPEG/PNG/WebP/HEIC.

import { Camera, ImageOff, X } from "lucide-react";
import { useRef, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const MAX_PHOTOS = 3;
const MAX_BYTES = 15 * 1024 * 1024; // 15 MB
const ALLOWED = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/heic", "image/heif"];

export type UploadedPhoto = { path: string; previewUrl: string; name: string };

export function PhotoUpload({
  userId,
  bucket = "service-request-photos",
  onChange,
}: {
  userId: string;
  bucket?: string;
  onChange: (paths: string[]) => void;
}) {
  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  async function onFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);

    if (photos.length + files.length > MAX_PHOTOS) {
      setError(`Up to ${MAX_PHOTOS} photos per request.`);
      return;
    }

    const next: UploadedPhoto[] = [];
    setBusy(true);

    try {
      const supabase = getSupabaseBrowserClient();

      for (const file of Array.from(files)) {
        if (!ALLOWED.includes(file.type.toLowerCase())) {
          setError(`${file.name}: only JPG, PNG, WebP, HEIC allowed.`);
          continue;
        }
        if (file.size > MAX_BYTES) {
          setError(`${file.name}: over 15 MB.`);
          continue;
        }

        const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
        const path = `${userId}/${Date.now()}-${crypto.randomUUID()}.${ext}`;

        const { error: upErr } = await supabase.storage
          .from(bucket)
          .upload(path, file, { cacheControl: "3600", upsert: false });

        if (upErr) {
          setError(`${file.name}: ${upErr.message}`);
          continue;
        }

        next.push({
          path,
          name: file.name,
          previewUrl: URL.createObjectURL(file),
        });
      }

      const merged = [...photos, ...next];
      setPhotos(merged);
      onChange(merged.map((p) => p.path));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function remove(i: number) {
    const next = photos.filter((_, idx) => idx !== i);
    setPhotos(next);
    onChange(next.map((p) => p.path));
  }

  return (
    <div className="grid gap-3">
      <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-border-strong bg-canvas-elevated p-5 text-sm text-ink-muted transition hover:border-sky hover:bg-sky-soft/40">
        <input
          ref={inputRef}
          type="file"
          accept={ALLOWED.join(",")}
          multiple
          capture="environment"
          onChange={(e) => onFiles(e.target.files)}
          disabled={busy || photos.length >= MAX_PHOTOS}
          className="sr-only"
        />
        <Camera className="h-5 w-5 shrink-0 text-sky" aria-hidden />
        <span className="flex-1">
          {busy
            ? "Uploading…"
            : photos.length === 0
            ? `Add up to ${MAX_PHOTOS} photos — JPG, PNG, WebP, HEIC, 15 MB each.`
            : `${photos.length} of ${MAX_PHOTOS} photos attached. Tap to add more.`}
        </span>
      </label>

      {photos.length > 0 ? (
        <div className="grid grid-cols-3 gap-3">
          {photos.map((p, i) => (
            <div key={p.path} className="group relative overflow-hidden rounded-xl border border-border bg-surface">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.previewUrl}
                alt={p.name}
                className="aspect-square h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={() => remove(i)}
                aria-label={`Remove ${p.name}`}
                className="absolute right-1.5 top-1.5 rounded-full bg-surface/90 p-1 text-ink shadow transition hover:bg-surface"
              >
                <X className="h-3.5 w-3.5" aria-hidden />
              </button>
            </div>
          ))}
        </div>
      ) : null}

      {error ? (
        <p className="flex items-center gap-2 text-xs text-brick-ink">
          <ImageOff className="h-3.5 w-3.5" aria-hidden /> {error}
        </p>
      ) : null}
    </div>
  );
}
