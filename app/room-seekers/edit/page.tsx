"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { compressImage } from "@/lib/compressImage";
import { SEEKER_PREFERRED_AREAS } from "@/lib/constants";
import SeekerPhotoUpload from "@/components/SeekerPhotoUpload";
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

// Delete removed photos from the room-seeker-photos bucket. Only paths inside
// the current user's own folder are deleted — storage RLS enforces this too,
// but we never even attempt to remove someone else's object.
async function deleteRemovedPhotos(userId: string, urls: string[]) {
  if (urls.length === 0) return;
  const marker = "/object/public/room-seeker-photos/";
  const paths = urls
    .map((url) => {
      const idx = url.indexOf(marker);
      return idx !== -1 ? url.slice(idx + marker.length) : null;
    })
    .filter((p): p is string => !!p && p.startsWith(`${userId}/`));
  if (paths.length === 0) return;
  const supabase = createClient();
  await supabase.storage.from("room-seeker-photos").remove(paths);
}

/**
 * If stored value is in the known list, return it.
 * If it's a custom value (not in list), return "Other" so the dropdown shows "Other"
 * and the caller can set customArea to the stored value.
 */
function resolveArea(stored: string): { dropdownValue: string; customValue: string } {
  const inList = (SEEKER_PREFERRED_AREAS as readonly string[]).includes(stored);
  if (inList) return { dropdownValue: stored, customValue: "" };
  return { dropdownValue: "Other", customValue: stored };
}

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

  // Photo state
  const [existingUrls, setExistingUrls] = useState<string[]>([]);
  // URLs the user removed — their storage objects are deleted on save
  const [removedUrls, setRemovedUrls] = useState<string[]>([]);
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
        setExistingUrls(Array.isArray(p.photo_urls) ? p.photo_urls : []);
        const { dropdownValue, customValue } = resolveArea(p.preferred_area);
        setCustomArea(customValue);
        setForm({
          name: p.name,
          age: p.age != null ? String(p.age) : "",
          budget: p.budget,
          move_in_date: p.move_in_date,
          preferred_area: dropdownValue,
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
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleAddFiles(files: File[], previews: string[]) {
    setPendingFiles((prev) => [...prev, ...files]);
    setPendingPreviews((prev) => [...prev, ...previews]);
  }

  function handleRemoveExisting(i: number) {
    const url = existingUrls[i];
    if (url) setRemovedUrls((prev) => [...prev, url]);
    setExistingUrls((prev) => prev.filter((_, idx) => idx !== i));
  }

  function handleRemovePending(i: number) {
    URL.revokeObjectURL(pendingPreviews[i]);
    setPendingFiles((prev) => prev.filter((_, idx) => idx !== i));
    setPendingPreviews((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    // Upload new files, combine with surviving existing URLs
    const newUrls = await uploadPhotos(userId, pendingFiles);
    const finalPhotoUrls = [...existingUrls, ...newUrls];

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
    const { error: err } = await supabase
      .from("room_seeker_profiles")
      .update({
        name: form.name.trim(),
        age: form.age ? parseInt(form.age, 10) : null,
        budget: form.budget.trim(),
        move_in_date: form.move_in_date.trim(),
        preferred_area: resolvedArea,
        short_intro: form.short_intro.trim(),
        contact_method: form.contact_method,
        contact_value: form.contact_value.trim(),
        photo_urls: finalPhotoUrls,
        is_active: form.is_active,
      })
      .eq("user_id", userId);

    setLoading(false);
    if (err) { setError(err.message); return; }

    // Profile saved — now remove the detached photos from storage so they
    // don't remain publicly reachable at their old URLs.
    await deleteRemovedPhotos(userId, removedUrls);

    // Reflect saved state
    setExistingUrls(finalPhotoUrls);
    setRemovedUrls([]);
    setPendingFiles([]);
    setPendingPreviews([]);
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
        {/* Visibility toggle — pill switch */}
        <div className="flex items-center gap-3 bg-zinc-50 border border-zinc-200 px-4 py-4">
          <button
            type="button"
            role="switch"
            aria-checked={form.is_active}
            onClick={() => setForm((f) => ({ ...f, is_active: !f.is_active }))}
            className={`relative inline-flex w-11 h-6 shrink-0 rounded-full overflow-hidden transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-600 ${
              form.is_active ? "bg-green-500" : "bg-zinc-300"
            }`}
          >
            <span
              className={`absolute top-[3px] left-0 w-[18px] h-[18px] bg-white rounded-full shadow-sm transition-transform ${
                form.is_active ? "translate-x-[23px]" : "translate-x-[3px]"
              }`}
            />
          </button>
          <div>
            <span className={`text-sm font-semibold ${form.is_active ? "text-green-700" : "text-zinc-500"}`}>
              {form.is_active ? "Public" : "Hidden"}
            </span>
            <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">
              {form.is_active
                ? "Your profile is visible on the Room Seekers page."
                : "Your profile is hidden from the Room Seekers page."}
            </p>
          </div>
        </div>

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
            placeholder="Hi, I'm a TUM student looking for a friendly WG or short-term room."
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
            onRemoveExisting={handleRemoveExisting}
            onRemovePending={handleRemovePending}
          />
        </div>

        <div className="pt-2">
          <button
            type="submit" disabled={loading}
            className="bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white px-6 py-3 font-medium text-sm transition-colors"
          >
            {loading
              ? pendingFiles.length > 0
                ? "Uploading photos…"
                : "Saving…"
              : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
