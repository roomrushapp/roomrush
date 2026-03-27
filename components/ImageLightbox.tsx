"use client";

import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  images: string[] | null | undefined;
  title: string;
};

export default function ImageLightbox({ images, title }: Props) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const close = useCallback(() => setLightboxIndex(null), []);

  const prev = useCallback(() => {
    if (lightboxIndex === null || !images) return;
    setLightboxIndex((lightboxIndex - 1 + images.length) % images.length);
  }, [lightboxIndex, images]);

  const next = useCallback(() => {
    if (lightboxIndex === null || !images) return;
    setLightboxIndex((lightboxIndex + 1) % images.length);
  }, [lightboxIndex, images]);

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

  return (
    <>
      {/* Image grid — same layout as before */}
      <div className="grid grid-cols-3 gap-2 mb-8 h-72 md:h-96 overflow-hidden">
        <div className="col-span-2 relative cursor-pointer" onClick={() => setLightboxIndex(0)}>
          {images?.[0] ? (
            <Image src={images[0]} alt={title} fill className="object-cover" priority sizes="(max-width: 768px) 100vw, 66vw" />
          ) : (
            <div className="w-full h-full bg-zinc-100 flex items-center justify-center text-zinc-400 text-sm">No photos yet</div>
          )}
        </div>
        <div className="flex flex-col gap-2">
          {[images?.[1], images?.[2]].map((img, i) =>
            img ? (
              <div key={i} className="relative flex-1 cursor-pointer" onClick={() => setLightboxIndex(i + 1)}>
                <Image src={img} alt={`${title} photo ${i + 2}`} fill className="object-cover" sizes="33vw" />
              </div>
            ) : (
              <div key={i} className="flex-1 bg-zinc-100" />
            )
          )}
        </div>
      </div>

      {/* Lightbox overlay */}
      {lightboxIndex !== null && images?.[lightboxIndex] && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={close}
        >
          {/* Close */}
          <button
            className="absolute top-4 right-4 text-white hover:text-zinc-300 transition-colors"
            onClick={close}
            aria-label="Close"
          >
            <X size={28} />
          </button>

          {/* Prev */}
          {images.length > 1 && (
            <button
              className="absolute left-4 text-white hover:text-zinc-300 transition-colors"
              onClick={(e) => { e.stopPropagation(); prev(); }}
              aria-label="Previous image"
            >
              <ChevronLeft size={40} />
            </button>
          )}

          {/* Image */}
          <div
            className="relative w-full max-w-4xl mx-16 aspect-[4/3]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={images[lightboxIndex]}
              alt={`${title} photo ${lightboxIndex + 1}`}
              fill
              className="object-contain"
              sizes="100vw"
            />
          </div>

          {/* Next */}
          {images.length > 1 && (
            <button
              className="absolute right-4 text-white hover:text-zinc-300 transition-colors"
              onClick={(e) => { e.stopPropagation(); next(); }}
              aria-label="Next image"
            >
              <ChevronRight size={40} />
            </button>
          )}

          {/* Counter */}
          {images.length > 1 && (
            <p className="absolute bottom-4 text-white/60 text-sm">
              {lightboxIndex + 1} / {images.length}
            </p>
          )}
        </div>
      )}
    </>
  );
}
