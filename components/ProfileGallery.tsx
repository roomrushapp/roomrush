"use client";

import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  photos: string[];
  name: string;
};

export default function ProfileGallery({ photos, name }: Props) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const close = useCallback(() => setLightboxIndex(null), []);
  const prev = useCallback(
    () => setLightboxIndex((i) => (i === null ? null : (i - 1 + photos.length) % photos.length)),
    [photos.length]
  );
  const next = useCallback(
    () => setLightboxIndex((i) => (i === null ? null : (i + 1) % photos.length)),
    [photos.length]
  );

  useEffect(() => {
    if (lightboxIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxIndex, close, prev, next]);

  useEffect(() => {
    document.body.style.overflow = lightboxIndex !== null ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [lightboxIndex]);

  if (photos.length === 0) return null;

  // Single photo: just a centered square crop
  if (photos.length === 1) {
    return (
      <div
        className="relative w-full aspect-[4/3] overflow-hidden cursor-pointer bg-zinc-100"
        onClick={() => setLightboxIndex(0)}
      >
        <Image src={photos[0]} alt={name} fill unoptimized className="object-cover" priority />
        <span className="absolute top-4 left-4 bg-rose-600 text-white text-xs font-medium px-2 py-1 uppercase tracking-wide">
          Seeking
        </span>
        {renderLightbox()}
      </div>
    );
  }

  // Multiple photos: main + side thumbnails (up to 3 total — same layout as ImageLightbox)
  return (
    <>
      <div className="grid grid-cols-3 gap-1 h-64 sm:h-80 overflow-hidden">
        {/* Main large image */}
        <div
          className="col-span-2 relative cursor-pointer overflow-hidden"
          onClick={() => setLightboxIndex(0)}
        >
          <Image src={photos[0]} alt={name} fill unoptimized className="object-cover" priority />
          <span className="absolute top-3 left-3 bg-rose-600 text-white text-xs font-medium px-2 py-1 uppercase tracking-wide">
            Seeking
          </span>
        </div>

        {/* Side thumbnails */}
        <div className="flex flex-col gap-1">
          {[photos[1], photos[2]].map((img, i) =>
            img ? (
              <div
                key={i}
                className="relative flex-1 cursor-pointer overflow-hidden bg-zinc-100"
                onClick={() => setLightboxIndex(i + 1)}
              >
                <Image
                  src={img}
                  alt={`${name} photo ${i + 2}`}
                  fill
                  unoptimized
                  className="object-cover"
                  sizes="33vw"
                />
              </div>
            ) : (
              <div key={i} className="flex-1 bg-zinc-100" />
            )
          )}
        </div>
      </div>

      {renderLightbox()}
    </>
  );

  function renderLightbox() {
    if (lightboxIndex === null) return null;
    return (
      <div
        className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center"
        onClick={close}
      >
        <button
          className="absolute top-4 right-4 z-10 text-white bg-black/50 rounded-full p-2 hover:bg-black/70 transition-colors"
          onClick={close}
          aria-label="Close"
        >
          <X size={24} />
        </button>

        {photos.length > 1 && (
          <button
            className="absolute left-2 md:left-4 z-10 text-white bg-black/50 rounded-full p-2 hover:bg-black/70 transition-colors"
            onClick={(e) => { e.stopPropagation(); prev(); }}
            aria-label="Previous"
          >
            <ChevronLeft size={28} />
          </button>
        )}

        <div
          className="relative w-full h-[90dvh] md:max-w-3xl md:mx-16"
          onClick={(e) => e.stopPropagation()}
        >
          <Image
            src={photos[lightboxIndex]}
            alt={`${name} photo ${lightboxIndex + 1}`}
            fill
            unoptimized
            className="object-contain"
            sizes="100vw"
          />
        </div>

        {photos.length > 1 && (
          <button
            className="absolute right-2 md:right-4 z-10 text-white bg-black/50 rounded-full p-2 hover:bg-black/70 transition-colors"
            onClick={(e) => { e.stopPropagation(); next(); }}
            aria-label="Next"
          >
            <ChevronRight size={28} />
          </button>
        )}

        {photos.length > 1 && (
          <p className="absolute bottom-4 text-white/70 text-sm bg-black/40 px-3 py-1 rounded-full">
            {lightboxIndex + 1} / {photos.length}
          </p>
        )}
      </div>
    );
  }
}
