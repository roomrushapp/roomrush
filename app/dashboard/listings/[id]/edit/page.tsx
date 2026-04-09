"use client";

import { useState, useEffect, useRef, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { MUNICH_DISTRICTS } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, ImagePlus, X } from "lucide-react";

const MAX_IMAGES = 5;

type Props = { params: Promise<{ id: string }> };

export default function EditListingPage({ params }: Props) {
  const { id } = use(params);
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [userId, setUserId] = useState("");
  const [storedEmail, setStoredEmail] = useState<string | null>(null);
  const [includeEmail, setIncludeEmail] = useState(false);

  // Existing images already in storage (URLs)
  const [existingUrls, setExistingUrls] = useState<string[]>([]);
  // URLs the user has removed (to delete from storage on save)
  const [removedUrls, setRemovedUrls] = useState<string[]>([]);
  // New files selected but not yet uploaded
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);

  const [form, setForm] = useState({
    title: "",
    description: "",
    rent: "",
    location: "",
    available_from: "",
    available_until: "",
    phone: "",
    facebook_url: "",
  });

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth/login"); return; }
      setUserId(user.id);

      const { data, error } = await supabase
        .from("listings")
        .select("*")
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

      if (error || !data) { router.push("/dashboard"); return; }

      setForm({
        title: data.title,
        description: data.description,
        rent: String(data.rent),
        location: data.location,
        available_from: data.available_from ?? "",
        available_until: data.available_until ?? "",
        phone: data.phone ?? "",
        facebook_url: data.facebook_url ?? "",
      });
      setStoredEmail(data.contact_email ?? null);
      setIncludeEmail(!!data.contact_email);
      setExistingUrls(data.image_urls ?? []);
      setFetching(false);
    }
    load();
  }, [id, router]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleUrlBlur(e: React.FocusEvent<HTMLInputElement>) {
    const val = e.target.value.trim();
    if (!val) return;
    try {
      const { protocol } = new URL(val);
      if (protocol !== "http:" && protocol !== "https:") throw new Error();
    } catch {
      setForm((prev) => ({ ...prev, facebook_url: "" }));
    }
  }

  function removeExisting(url: string) {
    setExistingUrls((prev) => prev.filter((u) => u !== url));
    setRemovedUrls((prev) => [...prev, url]);
  }

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    const remaining = MAX_IMAGES - existingUrls.length - newFiles.length;
    const toAdd = files.slice(0, remaining);

    setNewFiles((prev) => [...prev, ...toAdd]);
    setNewPreviews((prev) => [...prev, ...toAdd.map((f) => URL.createObjectURL(f))]);
    e.target.value = "";
  }

  function removeNew(index: number) {
    URL.revokeObjectURL(newPreviews[index]);
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
    setNewPreviews((prev) => prev.filter((_, i) => i !== index));
  }

  async function deleteFromStorage(urls: string[]) {
    if (urls.length === 0) return;
    const supabase = createClient();
    // Extract storage path from public URL
    const paths = urls.map((url) => {
      const marker = "/object/public/listing-images/";
      const idx = url.indexOf(marker);
      return idx !== -1 ? url.slice(idx + marker.length) : null;
    }).filter(Boolean) as string[];

    if (paths.length > 0) {
      await supabase.storage.from("listing-images").remove(paths);
    }
  }

  async function uploadNewImages(): Promise<string[]> {
    const supabase = createClient();
    const urls: string[] = [];

    for (const file of newFiles) {
      const ext = file.name.split(".").pop();
      const path = `${userId}/${id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage
        .from("listing-images")
        .upload(path, file, { upsert: false });

      if (error) continue;

      const { data } = supabase.storage.from("listing-images").getPublicUrl(path);
      urls.push(data.publicUrl);
    }

    return urls;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Contact method guard — at least one must be present
    const hasContact =
      (includeEmail && !!storedEmail) ||
      !!form.phone.trim() ||
      !!form.facebook_url.trim();
    if (!hasContact) {
      setError("Please provide at least one contact method: email, phone/WhatsApp, or original post link.");
      setLoading(false);
      return;
    }

    // Delete removed images from storage
    await deleteFromStorage(removedUrls);

    // Upload new images
    const uploaded = await uploadNewImages();

    // Final image list: kept existing + newly uploaded
    const finalUrls = [...existingUrls, ...uploaded];

    const supabase = createClient();
    const { error } = await supabase
      .from("listings")
      .update({
        title: form.title,
        description: form.description,
        rent: Number(form.rent),
        location: form.location,
        available_from: form.available_from || null,
        available_until: form.available_until || null,
        contact_email: includeEmail ? (storedEmail ?? null) : null,
        phone: form.phone || null,
        facebook_url: form.facebook_url || null,
        image_urls: finalUrls,
      })
      .eq("id", id);

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  const totalImages = existingUrls.length + newFiles.length;

  if (fetching) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-zinc-400 text-sm">Loading listing…</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-black mb-6 transition-colors">
        <ArrowLeft size={14} />
        Back to dashboard
      </Link>

      <div className="grid md:grid-cols-3 gap-10">
        <div className="md:col-span-1">
          <p className="text-xs font-medium text-rose-600 uppercase tracking-widest mb-2">Edit Listing</p>
          <h1 className="font-display font-bold text-3xl text-black leading-tight mb-2">
            Update Your<br />
            <span className="text-rose-600">Listing.</span>
          </h1>
          <p className="text-zinc-500 text-sm leading-relaxed">Changes go live immediately.</p>
        </div>

        <div className="md:col-span-2">
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm px-4 py-3 mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1 uppercase tracking-wide">Listing title *</label>
              <input name="title" type="text" required value={form.title} onChange={handleChange}
                className="w-full border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-800 focus:outline-none focus:border-rose-600" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1 uppercase tracking-wide">Rent per month (€) *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">€</span>
                  <input name="rent" type="number" required min={1} value={form.rent} onChange={handleChange}
                    className="w-full border border-zinc-300 bg-white pl-8 pr-4 py-3 text-sm text-zinc-800 focus:outline-none focus:border-rose-600" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1 uppercase tracking-wide">Location *</label>
                <select name="location" required value={form.location} onChange={handleChange}
                  className="w-full border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-800 focus:outline-none focus:border-rose-600">
                  <option value="">Select location…</option>
                  {MUNICH_DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1 uppercase tracking-wide">Available from</label>
                <input name="available_from" type="date" value={form.available_from} onChange={handleChange}
                  className="w-full border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-800 focus:outline-none focus:border-rose-600" />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1 uppercase tracking-wide">Available until</label>
                <input name="available_until" type="date" value={form.available_until} onChange={handleChange}
                  className="w-full border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-800 focus:outline-none focus:border-rose-600" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1 uppercase tracking-wide">Description *</label>
              <textarea name="description" required rows={5} value={form.description} onChange={handleChange}
                className="w-full border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-800 focus:outline-none focus:border-rose-600 resize-y" />
            </div>

            {/* Photos */}
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-2 uppercase tracking-wide">
                Photos <span className="text-zinc-400 normal-case font-normal">(up to {MAX_IMAGES}, optional)</span>
              </label>

              {totalImages > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-3">
                  {/* Existing images */}
                  {existingUrls.map((url, i) => (
                    <div key={url} className="relative aspect-square bg-zinc-100">
                      <Image src={url} alt={`Photo ${i + 1}`} fill unoptimized className="object-cover" sizes="120px" />
                      <button type="button" onClick={() => removeExisting(url)}
                        className="absolute top-1 right-1 bg-black/60 hover:bg-black text-white rounded-full p-0.5 transition-colors">
                        <X size={12} />
                      </button>
                      {i === 0 && newFiles.length === 0 && (
                        <span className="absolute bottom-1 left-1 bg-rose-600 text-white text-[9px] font-bold px-1 py-0.5">MAIN</span>
                      )}
                    </div>
                  ))}
                  {/* New image previews */}
                  {newPreviews.map((src, i) => (
                    <div key={src} className="relative aspect-square bg-zinc-100">
                      <Image src={src} alt={`New photo ${i + 1}`} fill unoptimized className="object-cover" sizes="120px" />
                      <button type="button" onClick={() => removeNew(i)}
                        className="absolute top-1 right-1 bg-black/60 hover:bg-black text-white rounded-full p-0.5 transition-colors">
                        <X size={12} />
                      </button>
                      {existingUrls.length === 0 && i === 0 && (
                        <span className="absolute bottom-1 left-1 bg-rose-600 text-white text-[9px] font-bold px-1 py-0.5">MAIN</span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {totalImages < MAX_IMAGES && (
                <>
                  <button type="button" onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 border-2 border-dashed border-zinc-300 hover:border-rose-400 bg-zinc-50 hover:bg-rose-50 text-zinc-500 hover:text-rose-600 px-4 py-3 text-sm font-medium w-full justify-center transition-colors">
                    <ImagePlus size={16} />
                    {totalImages === 0 ? "Add photos" : `Add more (${totalImages}/${MAX_IMAGES})`}
                  </button>
                  <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp"
                    multiple className="hidden" onChange={handleImageSelect} />
                </>
              )}
              <p className="text-xs text-zinc-400 mt-1">JPG, PNG or WebP. First photo is the cover image.</p>
              {totalImages === 0 && (
                <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 px-3 py-2 mt-2">
                  Photos are optional, but listings with photos are more trusted and usually get more responses.
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1 uppercase tracking-wide">Contact information</label>
              <p className="text-xs text-zinc-400 mb-3">At least one contact method is required.</p>
              <div className="flex flex-col gap-3">
                {storedEmail ? (
                  <label className={`flex items-center gap-3 px-4 py-3 border cursor-pointer transition-colors ${includeEmail ? "bg-zinc-50 border-zinc-200" : "bg-white border-zinc-200 opacity-50"}`}>
                    <input
                      type="checkbox"
                      checked={includeEmail}
                      onChange={(e) => setIncludeEmail(e.target.checked)}
                      className="accent-rose-600 w-4 h-4 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-zinc-400 mb-0.5">Use stored email as contact method</p>
                      <p className="text-sm text-zinc-700 font-medium truncate">{storedEmail}</p>
                    </div>
                  </label>
                ) : (
                  <p className="text-xs text-zinc-400 px-1">No email stored for this listing.</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1 uppercase tracking-wide">Contact phone / WhatsApp</label>
              <input name="phone" type="tel" placeholder="+49 123 456 7890" value={form.phone} onChange={handleChange}
                className="w-full border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-800 focus:outline-none focus:border-rose-600 placeholder:text-zinc-400" />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1 uppercase tracking-wide">Facebook post link</label>
              <input name="facebook_url" type="url" placeholder="https://facebook.com/…" value={form.facebook_url} onChange={handleChange} onBlur={handleUrlBlur}
                className="w-full border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-800 focus:outline-none focus:border-rose-600 placeholder:text-zinc-400" />
              <p className="text-xs text-zinc-400 mt-1">If this listing originates from a Facebook post, paste the link here.</p>
            </div>

            <div className="flex justify-end pt-2">
              <button type="submit" disabled={loading}
                className="bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 text-white px-8 py-3 font-medium text-sm transition-colors">
                {loading ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
