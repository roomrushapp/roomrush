"use client";

import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import NoPhotoPlaceholder from "@/components/NoPhotoPlaceholder";

type Props = {
  images: string[] | null | undefined;
  title: string;
};

/**
 * Wrapper — decides at render time whether to show the static placeholder
 * or the real interactive gallery. The lightbox state lives inside Gallery
 * so it is never instantiated for listings without photos.
 */
export default function ImageLightbox({ images, title }: Props) {
  const hasImages = Array.isArray(images) && images.length > 0;

  if (!hasImages) {
    return (
      <div className="relative mb-8 h-72 md:h-96 overflow-hidden">
        <NoPhotoPlaceholder variant="detail" />
      </div>
    );
  }

  return <Gallery images={images} title={title} />;
}

/* ─── Real gallery — only rendered when images exist ─────────────────────── */

function Gallery({ images, title }: { images: string[]; title: string }) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const close = useCallback(() => setLightboxIndex(null), []);

  const prev = useCallback(
    () =>
      setLightboxIndex((i) =>
        i === null ? null : (i - 1 + images.length) % images.length
      ),
    [images.length]
  );

  const next = useCallback(
    () =>
      setLightboxIndex((i) =>
        i === null ? null : (i + 1) % images.length
      ),
    [images.length]
  );

  // Keyboard navigation
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

  // Lock body scroll while lightbox is open
  useEffect(() => {
    document.body.style.overflow = lightboxIndex !== null ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [lightboxIndex]);

  return (
    <>
      {/* Thumbnail grid */}
      <div className="grid grid-cols-3 gap-2 mb-8 h-72 md:h-96 overflow-hidden">
        {/* Main (large) image */}
        <div
          className="col-span-2 relative cursor-pointer"
          onClick={() => setLightboxIndex(0)}
        >
          <Image
            src={images[0]}
            alt={title}
            fill
            unoptimized
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, 66vw"
          />
        </div>

        {/* Side thumbnails (slots 1 and 2) */}
        <div className="flex flex-col gap-2">
          {[images[1], images[2]].map((img, i) =>
            img ? (
              <div
                key={i}
                className="relative flex-1 cursor-pointer"
                onClick={() => setLightboxIndex(i + 1)}
              >
                <Image
                  src={img}
                  alt={`${title} photo ${i + 2}`}
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

      {/* Lightbox overlay — only when an image is selected */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center"
          onClick={close}
        >
          {/* Close */}
          <button
            className="absolute top-4 right-4 z-10 text-white bg-black/50 rounded-full p-2 hover:bg-black/70 transition-colors"
            onClick={close}
            aria-label="Close"
          >
            <X size={24} />
          </button>

          {/* Prev */}
          {images.length > 1 && (
            <button
              className="absolute left-2 md:left-4 z-10 text-white bg-black/50 rounded-full p-2 hover:bg-black/70 transition-colors"
              onClick={(e) => { e.stopPropagation(); prev(); }}
              aria-label="Previous image"
            >
              <ChevronLeft size={28} />
            </button>
          )}

          {/* Full image */}
          <div
            className="relative w-full h-[90dvh] md:max-w-4xl md:max-h-[90vh] md:mx-16"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={images[lightboxIndex]}
              alt={`${title} photo ${lightboxIndex + 1}`}
              fill
              unoptimized
              className="object-contain"
              sizes="100vw"
            />
          </div>

          {/* Next */}
          {images.length > 1 && (
            <button
              className="absolute right-2 md:right-4 z-10 text-white bg-black/50 rounded-full p-2 hover:bg-black/70 transition-colors"
              onClick={(e) => { e.stopPropagation(); next(); }}
              aria-label="Next image"
            >
              <ChevronRight size={28} />
            </button>
          )}

          {/* Counter */}
          {images.length > 1 && (
            <p className="absolute bottom-4 text-white/70 text-sm bg-black/40 px-3 py-1 rounded-full">
              {lightboxIndex + 1} / {images.length}
            </p>
          )}
        </div>
      )}
    </>
  );
}
