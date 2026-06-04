"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft } from "lucide-react";
import type { RoomSeekerProfile } from "@/types";

const CONTACT_METHODS = [
  { value: "whatsapp", label: "WhatsApp" },
  { value: "email", label: "Email" },
  { value: "instagram", label: "Instagram" },
  { value: "facebook", label: "Facebook" },
] as const;

const CONTACT_PLACEHOLDERS: Record<string, string> = {
  whatsapp: "+49 176 1234 5678",
  email: "you@example.com",
  instagram: "@yourhandle or profile URL",
  facebook: "https://facebook.com/yourprofile",
};

const INPUT =
  "w-full border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-800 focus:outline-none focus:border-rose-600 placeholder:text-zinc-400";
const LABEL =
  "block text-xs font-semibold text-zinc-700 uppercase tracking-wide mb-1.5";

export default function EditRoomSeekerPage() {
  const router = useRouter();
  const [authLoading, setAuthLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);
  const [userId, setUserId] = useState("");
  const [profileId, setProfileId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [noProfile, setNoProfile] = useState(false);

  const [form, setForm] = useState({
    name: "",
    photo_url: "",
    budget: "",
    move_in_date: "",
    preferred_area: "",
    short_intro: "",
    contact_method: "whatsapp",
    contact_value: "",
    is_active: true,
  });

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { setAuthLoading(false); setProfileLoading(false); return; }
      const uid = session.user.id;
      setUserId(uid);
      setAuthLoading(false);

      const { data } = await supabase
        .from("room_seeker_profiles")
        .select("*")
        .eq("user_id", uid)
        .maybeSingle();

      if (!data) {
        setNoProfile(true);
      } else {
        const p = data as RoomSeekerProfile;
        setProfileId(p.id);
        setForm({
          name: p.name,
          photo_url: p.photo_url ?? "",
          budget: p.budget,
          move_in_date: p.move_in_date,
          preferred_area: p.preferred_area,
          short_intro: p.short_intro,
          contact_method: p.contact_method,
          contact_value: p.contact_value,
          is_active: p.is_active,
        });
      }
      setProfileLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUserId(session?.user.id ?? "");
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!authLoading && !userId) router.push("/auth/login");
  }, [authLoading, userId, router]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setForm({ ...form, [name]: (e.target as HTMLInputElement).checked });
    } else {
      setForm({ ...form, [name]: value });
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);
    const supabase = createClient();
    const { error: err } = await supabase
      .from("room_seeker_profiles")
      .update({
        name: form.name.trim(),
        photo_url: form.photo_url.trim() || null,
        budget: form.budget.trim(),
        move_in_date: form.move_in_date.trim(),
        preferred_area: form.preferred_area.trim(),
        short_intro: form.short_intro.trim(),
        contact_method: form.contact_method,
        contact_value: form.contact_value.trim(),
        is_active: form.is_active,
      })
      .eq("user_id", userId);
    setLoading(false);
    if (err) { setError(err.message); return; }
    setSuccess(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (authLoading || profileLoading) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center text-zinc-400 text-sm">
        Loading…
      </div>
    );
  }

  if (noProfile) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <p className="font-display font-semibold text-xl text-black mb-2">
          You don&apos;t have a profile yet.
        </p>
        <p className="text-zinc-500 text-sm mb-6">
          Create one so listers and WG groups can find you.
        </p>
        <Link
          href="/room-seekers/create"
          className="inline-flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-6 py-3 font-medium text-sm transition-colors"
        >
          Create your profile
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <Link
          href="/room-seekers"
          className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-black transition-colors"
        >
          <ArrowLeft size={14} />
          Room Seekers
        </Link>
        {profileId && (
          <Link
            href={`/room-seekers/${profileId}`}
            className="text-sm text-rose-600 hover:text-rose-700 transition-colors"
          >
            View public profile →
          </Link>
        )}
      </div>

      <div className="mb-8">
        <p className="text-xs font-medium text-rose-600 uppercase tracking-widest mb-1">
          Your Profile
        </p>
        <h1 className="font-display font-bold text-2xl md:text-3xl text-black">
          Edit your profile
        </h1>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 mb-6">
          Profile updated successfully.
        </div>
      )}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm px-4 py-3 mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* Visibility toggle — shown first so it's always visible */}
        <div className="flex items-start gap-3 bg-zinc-50 border border-zinc-200 px-4 py-4">
          <input
            id="is_active" name="is_active" type="checkbox"
            checked={form.is_active} onChange={handleChange}
            className="mt-0.5 accent-rose-600 w-4 h-4 shrink-0"
          />
          <div>
            <label htmlFor="is_active" className="text-sm font-medium text-zinc-900 cursor-pointer">
              Show my profile publicly
            </label>
            <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">
              If turned off, your profile will not appear on the Room Seekers page.
            </p>
          </div>
        </div>

        <div>
          <label htmlFor="name" className={LABEL}>
            Your name <span className="text-rose-600">*</span>
          </label>
          <input
            id="name" name="name" type="text" required maxLength={100}
            placeholder="Prashant"
            value={form.name} onChange={handleChange} className={INPUT}
          />
        </div>

        <div>
          <label htmlFor="budget" className={LABEL}>
            Budget <span className="text-rose-600">*</span>
          </label>
          <input
            id="budget" name="budget" type="text" required maxLength={100}
            placeholder="Up to €750 warm"
            value={form.budget} onChange={handleChange} className={INPUT}
          />
        </div>

        <div>
          <label htmlFor="move_in_date" className={LABEL}>
            Move-in date <span className="text-rose-600">*</span>
          </label>
          <input
            id="move_in_date" name="move_in_date" type="text" required maxLength={50}
            placeholder="From August / ASAP / flexible"
            value={form.move_in_date} onChange={handleChange} className={INPUT}
          />
        </div>

        <div>
          <label htmlFor="preferred_area" className={LABEL}>
            Preferred area <span className="text-rose-600">*</span>
          </label>
          <input
            id="preferred_area" name="preferred_area" type="text" required maxLength={200}
            placeholder="Munich, Garching, or flexible"
            value={form.preferred_area} onChange={handleChange} className={INPUT}
          />
        </div>

        <div>
          <label htmlFor="short_intro" className={LABEL}>
            Short intro <span className="text-rose-600">*</span>
          </label>
          <textarea
            id="short_intro" name="short_intro" required maxLength={500} rows={4}
            placeholder={`Hi, I'm a TUM student looking for a friendly WG or short-term room.`}
            value={form.short_intro} onChange={handleChange} className={INPUT}
          />
          <p className="text-xs text-zinc-400 mt-1">
            {form.short_intro.length} / 500
          </p>
        </div>

        <div>
          <label className={LABEL}>
            How should people contact you? <span className="text-rose-600">*</span>
          </label>
          <div className="flex gap-2">
            <select
              name="contact_method" value={form.contact_method} onChange={handleChange}
              className="border border-zinc-300 bg-white px-3 py-3 text-sm text-zinc-800 focus:outline-none focus:border-rose-600 shrink-0"
            >
              {CONTACT_METHODS.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
            <input
              name="contact_value" type="text" required maxLength={200}
              placeholder={CONTACT_PLACEHOLDERS[form.contact_method]}
              value={form.contact_value} onChange={handleChange}
              className={`${INPUT} flex-1`}
            />
          </div>
          <p className="text-xs text-zinc-500 mt-2 bg-zinc-50 border border-zinc-200 px-3 py-2 leading-relaxed">
            This contact information will be visible on your public RoomRush profile.
          </p>
        </div>

        <div>
          <label htmlFor="photo_url" className={LABEL}>
            Profile photo{" "}
            <span className="text-zinc-400 font-normal normal-case tracking-normal">
              — optional
            </span>
          </label>
          <input
            id="photo_url" name="photo_url" type="url"
            placeholder="https://link-to-your-photo.jpg"
            value={form.photo_url} onChange={handleChange} className={INPUT}
          />
          <p className="text-xs text-zinc-400 mt-1">
            Paste a direct image link. Leave blank to show your initial instead.
          </p>
        </div>

        <div className="pt-2">
          <button
            type="submit" disabled={loading}
            className="bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white px-6 py-3 font-medium text-sm transition-colors"
          >
            {loading ? "Saving…" : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
