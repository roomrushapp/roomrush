import Image from "next/image";

const ROOM_IMAGE =
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=60";

type Props = {
  /** Extra classes applied to the outer wrapper (e.g. "h-72 md:h-96") */
  className?: string;
};

/**
 * Shown in place of a hero image / card thumbnail when a listing has no photos.
 * Blurred room background + dark scrim + single "Contact host for photos" label.
 */
export default function NoPhotoPlaceholder({ className = "" }: Props) {
  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`}>
      {/* Blurred background room image */}
      <Image
        src={ROOM_IMAGE}
        alt=""
        fill
        unoptimized
        className="object-cover scale-110 blur-sm"
        aria-hidden="true"
      />

      {/* Dark scrim */}
      <div className="absolute inset-0 bg-black/55" />

      {/* Centred label */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="bg-black/60 text-white text-xs font-medium px-3 py-2 tracking-wide backdrop-blur-sm border border-white/10">
          Contact host for photos
        </span>
      </div>
    </div>
  );
}
