import Link from "next/link";

export default function UnsubscribedPage() {
  return (
    <div className="max-w-md mx-auto px-4 py-24 text-center">
      <h1 className="font-display font-bold text-2xl mb-3">
        You've been unsubscribed.
      </h1>
      <p className="text-zinc-500 text-sm mb-8">
        You won't receive further emails from RoomRush.
      </p>
      <Link
        href="/"
        className="text-sm text-zinc-400 underline underline-offset-4 hover:text-black transition-colors"
      >
        Back to homepage
      </Link>
    </div>
  );
}
