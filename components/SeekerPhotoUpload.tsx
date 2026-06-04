"use client";

import Image from "next/image";
import { useRef } from "react";
import { X, ImagePlus } from "lucide-react";

const MAX_PHOTOS = 3;

type Props = {
  /** Already-uploaded URLs stored in Supabase */
  existingUrls: string[];
  /** Local File objects (not yet uploaded) */
  pendingFiles: File[];
  /** Object-URL previews corresponding to pendingFiles */
  pendingPreviews: string[];
  onAddFiles: (files: File[], previews: string[]) => void;
  onRemoveExisting: (index: number) => void;
  onRemovePending: (index: number) => void;
};

export default function SeekerPhotoUpload({
  existingUrls,
  pendingFiles,
  pendingPreviews,
  onAddFiles,
  onRemoveExisting,
  onRemovePending,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const total = existingUrls.length + pendingFiles.length;
  const canAdd = total < MAX_PHOTOS;

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    const slots = MAX_PHOTOS - total;
    const toAdd = files.slice(0, slots);
    if (toAdd.length === 0) return;
    const previews = toAdd.map((f) => URL.createObjectURL(f));
    onAddFiles(toAdd, previews);
    // reset so the same file can be re-selected if removed
    e.target.value = "";
  }

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-3">
        {/* Existing uploaded photos */}
        {existingUrls.map((url, i) => (
          <div key={`ex-${i}`} className="relative w-24 h-24 group">
            <Image
              src={url}
              alt={`Photo ${i + 1}`}
              fill
              unoptimized
              className="object-cover"
            />
            {i === 0 && (
              <span className="absolute bottom-0 left-0 right-0 text-center text-[9px] font-bold text-white bg-black/60 py-0.5 uppercase tracking-wide">
                Main
              </span>
            )}
            <button
              type="button"
              onClick={() => onRemoveExisting(i)}
              className="absolute top-1 right-1 w-5 h-5 bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-600"
              aria-label="Remove photo"
            >
              <X size={12} />
            </button>
          </div>
        ))}

        {/* Pending (local preview) photos */}
        {pendingPreviews.map((preview, i) => (
          <div key={`pend-${i}`} className="relative w-24 h-24 group">
            <Image
              src={preview}
              alt={`New photo ${i + 1}`}
              fill
              unoptimized
              className="object-cover"
            />
            {existingUrls.length === 0 && i === 0 && (
              <span className="absolute bottom-0 left-0 right-0 text-center text-[9px] font-bold text-white bg-black/60 py-0.5 uppercase tracking-wide">
                Main
              </span>
            )}
            {/* Uploading indicator overlay */}
            <div className="absolute inset-0 bg-black/10" />
            <span className="absolute top-1 left-1 text-[9px] text-white bg-zinc-700/80 px-1 py-0.5 uppercase tracking-wide">
              Pending
            </span>
            <button
              type="button"
              onClick={() => onRemovePending(i)}
              className="absolute top-1 right-1 w-5 h-5 bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-600"
              aria-label="Remove photo"
            >
              <X size={12} />
            </button>
          </div>
        ))}

        {/* Add button */}
        {canAdd && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="w-24 h-24 border-2 border-dashed border-zinc-300 hover:border-rose-500 flex flex-col items-center justify-center gap-1 text-zinc-400 hover:text-rose-500 transition-colors"
          >
            <ImagePlus size={20} />
            <span className="text-[10px] font-medium">Add photo</span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />

      <p className="text-xs text-zinc-400 leading-relaxed">
        Add up to {MAX_PHOTOS} photos. The first photo will appear on your profile card.
        {total >= MAX_PHOTOS && (
          <span className="ml-1 text-rose-500">Maximum {MAX_PHOTOS} photos reached.</span>
        )}
      </p>
    </div>
  );
}
