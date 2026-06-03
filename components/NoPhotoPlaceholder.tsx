import Image from "next/image";

const ROOM_IMAGE =
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=60";

type Props = {
  /** "card" → compact pill (listing cards). "detail" → wider, larger box (detail page). */
  variant?: "card" | "detail";
  /** Extra classes applied to the outer wrapper. */
  className?: string;
};

export default function NoPhotoPlaceholder({
  variant = "card",
  className = "",
}: Props) {
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
      <div className="absolute inset-0 bg-black/40" />

      {/* Centred label */}
      <div className="absolute inset-0 flex items-center justify-center">
        {variant === "detail" ? (
          <span className="inline-flex items-center justify-center bg-black/60 text-white text-sm md:text-base font-medium px-4 py-3 md:px-6 md:py-4 tracking-wide backdrop-blur-sm border border-white/10 text-center w-[75%] md:w-[70%] max-w-lg">
            Contact host for pictures
          </span>
        ) : (
          <span className="inline-flex items-center justify-center bg-black/60 text-white text-xs md:text-sm font-medium px-3 py-2 md:px-4 md:py-2.5 tracking-wide backdrop-blur-sm border border-white/10 text-center">
            Contact host for pictures
          </span>
        )}
      </div>
    </div>
  );
}
