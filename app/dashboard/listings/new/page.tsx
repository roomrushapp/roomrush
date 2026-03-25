"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { MUNICH_DISTRICTS } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, Zap, ShieldCheck, Mail, ImagePlus, X } from "lucide-react";

const MAX_IMAGES = 5;

export default function NewListingPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userId, setUserId] = useState("");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    rent: "",
    location: "",
    available_from: "",
    available_until: "",
    phone: "",
  });

  useEffect(() => {
    async function loadUser() {
      const supabase = createClient();
      // Use getSession() (reads from stored cookies, no network call) to avoid
      // a race condition where getUser()'s network request fires before the
      // session token fully settles right after login. The middleware already
      // validates the session server-side via getUser() for all /dashboard routes.
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/auth/login"); return; }
      setUserEmail(session.user.email ?? "");
      setUserId(session.user.id);
      setAuthLoading(false);
    }
    loadUser();
  }, [router]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    const remaining = MAX_IMAGES - imageFiles.length;
    const toAdd = files.slice(0, remaining);

    setImageFiles((prev) => [...prev, ...toAdd]);
    setImagePreviews((prev) => [
      ...prev,
      ...toAdd.map((f) => URL.createObjectURL(f)),
    ]);

    // Reset input so same file can be re-selected if removed
    e.target.value = "";
  }

  function removeImage(index: number) {
    URL.revokeObjectURL(imagePreviews[index]);
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  }

  async function uploadImages(listingId: string): Promise<string[]> {
    const supabase = createClient();
    const urls: string[] = [];

    for (const file of imageFiles) {
      const ext = file.name.split(".").pop();
      const path = `${userId}/${listingId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage
        .from("listing-images")
        .upload(path, file, { upsert: false });

      if (error) continue;

      const { data } = supabase.storage
        .from("listing-images")
        .getPublicUrl(path);

      urls.push(data.publicUrl);
    }

    return urls;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/auth/login"); return; }

    // 1. Create listing first to get the ID
    const { data: listing, error: insertError } = await supabase
      .from("listings")
      .insert({
        user_id: user.id,
        title: form.title,
        description: form.description,
        rent: Number(form.rent),
        location: form.location,
        available_from: form.available_from || null,
        available_until: form.available_until || null,
        contact_email: user.email,
        phone: form.phone || null,
        image_urls: [],
        is_active: true,
      })
      .select()
      .single();

    if (insertError || !listing) {
      setError(insertError?.message ?? "Failed to create listing.");
      setLoading(false);
      return;
    }

    // 2. Upload images if any
    if (imageFiles.length > 0) {
      const urls = await uploadImages(listing.id);
      if (urls.length > 0) {
        await supabase
          .from("listings")
          .update({ image_urls: urls })
          .eq("id", listing.id);
      }
    }

    router.push("/dashboard");
    router.refresh();
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-zinc-400">Loading…</p>
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
        {/* Left panel */}
        <div className="md:col-span-1">
          <p className="text-xs font-medium text-rose-600 uppercase tracking-widest mb-2">New Listing</p>
          <h1 className="font-display font-bold text-3xl text-black leading-tight mb-2">
            The Rush<br />
            <span className="text-rose-600">Submission.</span>
          </h1>
          <p className="text-zinc-500 text-sm mb-8 leading-relaxed">
            List your space in Munich's fastest growing sublet network. Get live in under 60 seconds.
          </p>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3 p-3 bg-zinc-50 border border-zinc-200">
              <Zap size={16} className="text-rose-600 flex-shrink-0" />
              <span className="text-sm text-zinc-700 font-medium">Goes live immediately</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-zinc-50 border border-zinc-200">
              <ShieldCheck size={16} className="text-rose-600 flex-shrink-0" />
              <span className="text-sm text-zinc-700 font-medium">Only you can edit or delete</span>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="md:col-span-2">
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm px-4 py-3 mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* Title */}
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1 uppercase tracking-wide">Listing title *</label>
              <input name="title" type="text" required placeholder="e.g. Sunny Studio in Maxvorstadt"
                value={form.title} onChange={handleChange}
                className="w-full border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-800 focus:outline-none focus:border-rose-600 placeholder:text-zinc-400" />
            </div>

            {/* Rent + Location */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1 uppercase tracking-wide">Rent per month (€) *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">€</span>
                  <input name="rent" type="number" required min={1} placeholder="850"
                    value={form.rent} onChange={handleChange}
                    className="w-full border border-zinc-300 bg-white pl-8 pr-4 py-3 text-sm text-zinc-800 focus:outline-none focus:border-rose-600 placeholder:text-zinc-400" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1 uppercase tracking-wide">Munich district *</label>
                <select name="location" required value={form.location} onChange={handleChange}
                  className="w-full border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-800 focus:outline-none focus:border-rose-600">
                  <option value="">Select district…</option>
                  {MUNICH_DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1 uppercase tracking-wide">Available from</label>
                <input name="available_from" type="date" value={form.available_from} onChange={handleChange}
                  className="w-full border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-800 focus:outline-none focus:border-rose-600" />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1 uppercase tracking-wide">
                  Available until <span className="text-zinc-400 normal-case font-normal">(blank = open end)</span>
                </label>
                <input name="available_until" type="date" value={form.available_until} onChange={handleChange}
                  className="w-full border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-800 focus:outline-none focus:border-rose-600" />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1 uppercase tracking-wide">Description *</label>
              <textarea name="description" required rows={5}
                placeholder="Describe the room, location, flatmates, house rules…"
                value={form.description} onChange={handleChange}
                className="w-full border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-800 focus:outline-none focus:border-rose-600 placeholder:text-zinc-400 resize-y" />
            </div>

            {/* Images */}
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-2 uppercase tracking-wide">
                Photos <span className="text-zinc-400 normal-case font-normal">(up to {MAX_IMAGES}, optional)</span>
              </label>

              {/* Previews */}
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-3">
                  {imagePreviews.map((src, i) => (
                    <div key={i} className="relative aspect-square bg-zinc-100">
                      <Image src={src} alt={`Preview ${i + 1}`} fill className="object-cover" sizes="120px" />
                      <button type="button" onClick={() => removeImage(i)}
                        className="absolute top-1 right-1 bg-black/60 hover:bg-black text-white rounded-full p-0.5 transition-colors">
                        <X size={12} />
                      </button>
                      {i === 0 && (
                        <span className="absolute bottom-1 left-1 bg-rose-600 text-white text-[9px] font-bold px-1 py-0.5">MAIN</span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Upload button */}
              {imageFiles.length < MAX_IMAGES && (
                <>
                  <button type="button" onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 border-2 border-dashed border-zinc-300 hover:border-rose-400 bg-zinc-50 hover:bg-rose-50 text-zinc-500 hover:text-rose-600 px-4 py-3 text-sm font-medium w-full justify-center transition-colors">
                    <ImagePlus size={16} />
                    {imageFiles.length === 0 ? "Add photos" : `Add more (${imageFiles.length}/${MAX_IMAGES})`}
                  </button>
                  <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp"
                    multiple className="hidden" onChange={handleImageSelect} />
                </>
              )}
              <p className="text-xs text-zinc-400 mt-1">JPG, PNG or WebP. First photo is the cover image.</p>
              {imageFiles.length === 0 && (
                <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 px-3 py-2 mt-2">
                  Photos are optional, but listings with photos are more trusted and usually get more responses.
                </p>
              )}
            </div>

            {/* Contact */}
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-3 uppercase tracking-wide">Contact information</label>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3 px-4 py-3 bg-zinc-50 border border-zinc-200">
                  <Mail size={15} className="text-zinc-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-zinc-400 mb-0.5">Contact email (your account email)</p>
                    <p className="text-sm text-zinc-700 font-medium truncate">{userEmail}</p>
                  </div>
                  <span className="text-xs text-zinc-400 bg-white border border-zinc-200 px-2 py-0.5">Auto</span>
                </div>
                <div>
                  <input name="phone" type="tel" placeholder="Phone / WhatsApp: +49 123 456 7890 (optional)"
                    value={form.phone} onChange={handleChange}
                    className="w-full border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-800 focus:outline-none focus:border-rose-600 placeholder:text-zinc-400" />
                  <p className="text-xs text-zinc-400 mt-1">Adding a phone number increases your response rate.</p>
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="flex justify-end pt-2">
              <button type="submit" disabled={loading}
                className="bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 text-white px-8 py-3 font-medium text-sm transition-colors">
                {loading ? "Publishing…" : "Publish Listing"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
