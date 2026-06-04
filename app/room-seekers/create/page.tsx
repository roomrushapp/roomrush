"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft } from "lucide-react";

const CONTACT_METHODS = [
  { value: "whatsapp", label: "WhatsApp" },
  { value: "email", label: "Email" },
  { value: "instagram", label: "Instagram" },
  { value: "facebook", label: "Facebook" },
] as const;

const CONTACT_PLACEHOLDERS: Record<string, string> = {
  whatsapp: "+49 123 456 7890",
  email: "you@example.com",
  instagram: "@yourhandle",
  facebook: "https://facebook.com/yourprofile",
};

const INPUT_CLASS =
  "w-full border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-800 focus:outline-none focus:border-rose-600 placeholder:text-zinc-400";
const LABEL_CLASS = "block text-xs font-semibold text-zinc-700 uppercase tracking-wide mb-1.5";

export default function CreateRoomSeekerPage() {
  const router = useRouter();
  const [authLoading, setAuthLoading] = useState(true);
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasProfile, setHasProfile] = useState(false);

  const [form, setForm] = useState({
    name: "",
    photo_url: "",
    budget: "",
    move_in_date: "",
    preferred_area: "",
    short_intro: "",
    contact_method: "whatsapp",
    contact_value: "",
  });

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        setAuthLoading(false);
        return;
      }
      const uid = session.user.id;
      setUserId(uid);

      // Check if profile already exists
      const { data } = await supabase
        .from("room_seeker_profiles")
        .select("id")
        .eq("user_id", uid)
        .maybeSingle();

      if (data) {
        setHasProfile(true);
      }
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user.id ?? "");
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!authLoading && !userId) {
      router.push("/auth/login");
    }
  }, [authLoading, userId, router]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error: insertError } = await supabase.from("room_seeker_profiles").insert({
      user_id: userId,
      name: form.name.trim(),
      photo_url: form.photo_url.trim() || null,
      budget: form.budget.trim(),
      move_in_date: form.move_in_date.trim(),
      preferred_area: form.preferred_area.trim(),
      short_intro: form.short_intro.trim(),
      contact_method: form.contact_method,
      contact_value: form.contact_value.trim(),
      is_active: true,
    });

    setLoading(false);

    if (insertError) {
      if (insertError.code === "23505") {
        setError("You already have a profile. Redirecting to edit…");
        setTimeout(() => router.push("/room-seekers/edit"), 1500);
      } else {
        setError(insertError.message);
      }
      return;
    }

    router.push("/room-seekers");
  }

  if (authLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center text-zinc-400 text-sm">
        Loading…
      </div>
    );
  }

  if (hasProfile) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <p className="font-display font-semibold text-xl text-black mb-2">
          You already have a profile.
        </p>
        <p className="text-zinc-500 text-sm mb-6">
          You can only have one Room Seeker profile per account.
        </p>
        <Link
          href="/room-seekers/edit"
          className="inline-flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-6 py-3 font-medium text-sm transition-colors"
        >
          Edit your profile
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      {/* Back link */}
      <Link
        href="/room-seekers"
        className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-black transition-colors mb-6"
      >
        <ArrowLeft size={14} />
        Room Seekers
      </Link>

      <div className="mb-8">
        <p className="text-xs font-medium text-rose-600 uppercase tracking-widest mb-1">
          New Profile
        </p>
        <h1 className="font-display font-bold text-2xl md:text-3xl text-black">
          Create your Room Seeker profile
        </h1>
        <p className="text-zinc-500 text-sm mt-2">
          Your profile will be publicly visible on RoomRush so listers and WG groups can find you.
        </p>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm px-4 py-3 mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Name */}
        <div>
          <label htmlFor="name" className={LABEL_CLASS}>
            Your name <span className="text-rose-600">*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            maxLength={100}
            placeholder="e.g. Prashant"
            value={form.name}
            onChange={handleChange}
            className={INPUT_CLASS}
          />
        </div>

        {/* Budget */}
        <div>
          <label htmlFor="budget" className={LABEL_CLASS}>
            Budget <span className="text-rose-600">*</span>
          </label>
          <input
            id="budget"
            name="budget"
            type="text"
            required
            maxLength={100}
            placeholder="e.g. up to €750/mo"
            value={form.budget}
            onChange={handleChange}
            className={INPUT_CLASS}
          />
        </div>

        {/* Move-in date */}
        <div>
          <label htmlFor="move_in_date" className={LABEL_CLASS}>
            Move-in date <span className="text-rose-600">*</span>
          </label>
          <input
            id="move_in_date"
            name="move_in_date"
            type="text"
            required
            maxLength={50}
            placeholder="e.g. August 2025 or ASAP"
            value={form.move_in_date}
            onChange={handleChange}
            className={INPUT_CLASS}
          />
        </div>

        {/* Preferred area */}
        <div>
          <label htmlFor="preferred_area" className={LABEL_CLASS}>
            Preferred area <span className="text-rose-600">*</span>
          </label>
          <input
            id="preferred_area"
            name="preferred_area"
            type="text"
            required
            maxLength={200}
            placeholder="e.g. Munich / Schwabing / flexible"
            value={form.preferred_area}
            onChange={handleChange}
            className={INPUT_CLASS}
          />
        </div>

        {/* Short intro */}
        <div>
          <label htmlFor="short_intro" className={LABEL_CLASS}>
            Short intro <span className="text-rose-600">*</span>
          </label>
          <textarea
            id="short_intro"
            name="short_intro"
            required
            maxLength={500}
            rows={4}
            placeholder="Tell listers a bit about yourself — who you are, what you're looking for, any important details."
            value={form.short_intro}
            onChange={handleChange}
            className={INPUT_CLASS}
          />
          <p className="text-xs text-zinc-400 mt-1">
            {form.short_intro.length}/500 characters
          </p>
        </div>

        {/* Contact method + value */}
        <div>
          <label className={LABEL_CLASS}>
            Contact method <span className="text-rose-600">*</span>
          </label>
          <div className="flex gap-2">
            <select
              name="contact_method"
              value={form.contact_method}
              onChange={handleChange}
              className="border border-zinc-300 bg-white px-3 py-3 text-sm text-zinc-800 focus:outline-none focus:border-rose-600 shrink-0"
            >
              {CONTACT_METHODS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
            <input
              name="contact_value"
              type="text"
              required
              maxLength={200}
              placeholder={CONTACT_PLACEHOLDERS[form.contact_method]}
              value={form.contact_value}
              onChange={handleChange}
              className={`${INPUT_CLASS} flex-1`}
            />
          </div>
          <p className="text-xs text-zinc-500 mt-2 bg-zinc-50 border border-zinc-200 px-3 py-2">
            This contact information will be visible on your public RoomRush profile.
          </p>
        </div>

        {/* Photo URL (optional) */}
        <div>
          <label htmlFor="photo_url" className={LABEL_CLASS}>
            Profile photo URL{" "}
            <span className="text-zinc-400 font-normal normal-case tracking-normal">
              (optional)
            </span>
          </label>
          <input
            id="photo_url"
            name="photo_url"
            type="url"
            placeholder="https://…"
            value={form.photo_url}
            onChange={handleChange}
            className={INPUT_CLASS}
          />
          <p className="text-xs text-zinc-400 mt-1">
            Paste a direct link to an image. Leave blank to use initials.
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white px-6 py-3 font-medium text-sm transition-colors self-start"
        >
          {loading ? "Creating profile…" : "Create profile"}
        </button>
      </form>
    </div>
  );
}
