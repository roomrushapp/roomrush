"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { compressImage } from "@/lib/compressImage";
import { SEEKER_PREFERRED_AREAS } from "@/lib/constants";
import SeekerPhotoUpload from "@/components/SeekerPhotoUpload";
import { ArrowLeft } from "lucide-react";

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
const SELECT =
  "w-full border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-800 focus:outline-none focus:border-rose-600";
const LABEL =
  "block text-xs font-semibold text-zinc-700 uppercase tracking-wide mb-1.5";

async function uploadPhotos(userId: string, files: File[]): Promise<string[]> {
  if (files.length === 0) return [];
  const supabase = createClient();
  const urls: string[] = [];
  for (const file of files) {
    const processed = await compressImage(file);
    const ext = processed.name.split(".").pop() ?? "webp";
    const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage
      .from("room-seeker-photos")
      .upload(path, processed, { upsert: false, contentType: processed.type });
    if (error) continue;
    const { data } = supabase.storage.from("room-seeker-photos").getPublicUrl(path);
    urls.push(data.publicUrl);
  }
  return urls;
}

export default function CreateRoomSeekerPage() {
  const router = useRouter();
  const [authLoading, setAuthLoading] = useState(true);
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Photo upload state
  const [existingUrls] = useState<string[]>([]);          // always empty on create
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [pendingPreviews, setPendingPreviews] = useState<string[]>([]);

  const [customArea, setCustomArea] = useState("");
  const [form, setForm] = useState({
    name: "",
    age: "",
    budget: "",
    move_in_date: "",
    preferred_area: SEEKER_PREFERRED_AREAS[0] as string,
    short_intro: "",
    contact_method: "whatsapp",
    contact_value: "",
  });

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { setAuthLoading(false); return; }
      const uid = session.user.id;
      setUserId(uid);
      const { data } = await supabase
        .from("room_seeker_profiles")
        .select("id")
        .eq("user_id", uid)
        .maybeSingle();
      if (data) {
        router.replace("/room-seekers/edit");
        return;
      }
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUserId(session?.user.id ?? "");
    });
    return () => subscription.unsubscribe();
  }, [router]);

  useEffect(() => {
    if (!authLoading && !userId) router.push("/auth/login");
  }, [authLoading, userId, router]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleAddFiles(files: File[], previews: string[]) {
    setPendingFiles((prev) => [...prev, ...files]);
    setPendingPreviews((prev) => [...prev, ...previews]);
  }

  function handleRemovePending(i: number) {
    URL.revokeObjectURL(pendingPreviews[i]);
    setPendingFiles((prev) => prev.filter((_, idx) => idx !== i));
    setPendingPreviews((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Upload photos first
    const uploadedUrls = await uploadPhotos(userId, pendingFiles);

    // Resolve preferred area: if "Other" selected, use custom text if provided
    const resolvedArea =
      form.preferred_area === "Other" && customArea.trim()
        ? customArea.trim()
        : form.preferred_area;

    if (form.preferred_area === "Other" && !customArea.trim()) {
      setError("Please enter your preferred area.");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { error: err } = await supabase.from("room_seeker_profiles").insert({
      user_id: userId,
      name: form.name.trim(),
      age: form.age ? parseInt(form.age, 10) : null,
      budget: form.budget.trim(),
      move_in_date: form.move_in_date.trim(),
      preferred_area: resolvedArea,
      short_intro: form.short_intro.trim(),
      contact_method: form.contact_method,
      contact_value: form.contact_value.trim(),
      photo_urls: uploadedUrls,
      photo_url: null,
      is_active: true,
    });

    setLoading(false);
    if (err) {
      if (err.code === "23505") {
        setError("You already have a profile. Redirecting to edit…");
        setTimeout(() => router.push("/room-seekers/edit"), 1500);
      } else {
        setError(err.message);
      }
      return;
    }
    router.push("/room-seekers");
  }

  if (authLoading) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center text-zinc-400 text-sm">
        Loading…
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-10">
      <Link
        href="/room-seekers"
        className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-black transition-colors mb-8"
      >
        <ArrowLeft size={14} />
        Room Seekers
      </Link>

      <div className="mb-8">
        <p className="text-xs font-medium text-rose-600 uppercase tracking-widest mb-1">
          New Profile
        </p>
        <h1 className="font-display font-bold text-2xl md:text-3xl text-black mb-2">
          Create your Room Seeker profile
        </h1>
        <p className="text-zinc-500 text-sm">
          Your profile will be public on RoomRush — listers and WG groups can find and contact you.
        </p>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm px-4 py-3 mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* Name + Age */}
        <div className="flex gap-3">
          <div className="flex-1">
            <label htmlFor="name" className={LABEL}>
              Your name <span className="text-rose-600">*</span>
            </label>
            <input
              id="name" name="name" type="text" required maxLength={100}
              placeholder="Prashant"
              value={form.name} onChange={handleChange} className={INPUT}
            />
          </div>
          <div className="w-24 shrink-0">
            <label htmlFor="age" className={LABEL}>
              Age{" "}
              <span className="text-zinc-400 font-normal normal-case tracking-normal">opt.</span>
            </label>
            <input
              id="age" name="age" type="number" min={16} max={80}
              placeholder="24"
              value={form.age} onChange={handleChange} className={INPUT}
            />
          </div>
        </div>

        {/* Budget */}
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

        {/* Move-in date */}
        <div>
          <label htmlFor="move_in_date" className={LABEL}>
            Move-in date <span className="text-rose-600">*</span>
          </label>
          <input
            id="move_in_date" name="move_in_date" type="month" required
            value={form.move_in_date} onChange={handleChange} className={INPUT}
          />
          <p className="text-xs text-zinc-400 mt-1">Select the earliest month you can move in.</p>
        </div>

        {/* Preferred area */}
        <div>
          <label htmlFor="preferred_area" className={LABEL}>
            Preferred area <span className="text-rose-600">*</span>
          </label>
          <select
            id="preferred_area" name="preferred_area" required
            value={form.preferred_area} onChange={handleChange} className={SELECT}
          >
            {SEEKER_PREFERRED_AREAS.map((area) => (
              <option key={area} value={area}>{area}</option>
            ))}
          </select>
          {form.preferred_area === "Other" && (
            <input
              type="text"
              required
              placeholder="e.g. Dachau, Garching, near TUM, outside Munich"
              value={customArea}
              onChange={(e) => setCustomArea(e.target.value)}
              className={`${INPUT} mt-2`}
              aria-label="Enter preferred area"
            />
          )}
        </div>

        {/* Short intro */}
        <div>
          <label htmlFor="short_intro" className={LABEL}>
            Short intro <span className="text-rose-600">*</span>
          </label>
          <textarea
            id="short_intro" name="short_intro" required maxLength={500} rows={4}
            placeholder="Hi, I'm a TUM student looking for a friendly WG or short-term room. I work remotely, keep the place tidy, and prefer a quiet building."
            value={form.short_intro} onChange={handleChange} className={INPUT}
          />
          <p className="text-xs text-zinc-400 mt-1">{form.short_intro.length} / 500</p>
        </div>

        {/* Contact */}
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

        {/* Photos */}
        <div>
          <label className={LABEL}>
            Profile photos{" "}
            <span className="text-zinc-400 font-normal normal-case tracking-normal">— optional</span>
          </label>
          <SeekerPhotoUpload
            existingUrls={existingUrls}
            pendingFiles={pendingFiles}
            pendingPreviews={pendingPreviews}
            onAddFiles={handleAddFiles}
            onRemoveExisting={() => {}}
            onRemovePending={handleRemovePending}
          />
        </div>

        <div className="pt-2">
          <button
            type="submit" disabled={loading}
            className="bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white px-6 py-3 font-medium text-sm transition-colors"
          >
            {loading ? "Creating profile…" : "Create profile"}
          </button>
        </div>
      </form>
    </div>
  );
}
