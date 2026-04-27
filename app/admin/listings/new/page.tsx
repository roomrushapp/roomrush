"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MUNICH_DISTRICTS } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";
import { makeUniqueSlug } from "@/lib/slugify";
import { ArrowLeft, ShieldAlert } from "lucide-react";

export default function AdminNewListingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isPartner, setIsPartner] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    rent: "",
    location: "",
    available_from: "",
    available_until: "",
    contact_email: "",
    phone: "",
    facebook_url: "",
    is_active: true,
    partner_name: "",
    partner_url: "",
    original_post_url: "",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();

    const slug = await makeUniqueSlug(form.title, async (s) => {
      const { data } = await supabase.from("listings").select("id").eq("slug", s).maybeSingle();
      return !!data;
    });

    const { error: insertError } = await supabase
      .from("listings")
      .insert({
        slug,
        title: form.title,
        description: form.description,
        rent: Number(form.rent),
        location: form.location,
        available_from: form.available_from || null,
        available_until: form.available_until || null,
        contact_email: form.contact_email || null,
        phone: form.phone || null,
        facebook_url: form.facebook_url || null,
        image_urls: [],
        is_active: form.is_active,
        is_partner_listing: isPartner,
        partner_name: isPartner ? form.partner_name || null : null,
        partner_url: isPartner ? form.partner_url || null : null,
        original_post_url: isPartner ? form.original_post_url || null : null,
      });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    router.push("/admin");
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center gap-2 mb-2">
        <ShieldAlert size={14} className="text-rose-600" />
        <p className="text-xs font-medium text-rose-600 uppercase tracking-widest">Admin</p>
      </div>
      <Link href="/admin" className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-black mb-6 transition-colors">
        <ArrowLeft size={14} />
        Back to admin
      </Link>

      <h1 className="font-display font-bold text-2xl text-black mb-6">Create Listing</h1>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm px-4 py-3 mb-4">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* Title */}
        <div>
          <label className="block text-xs font-medium text-zinc-500 mb-1 uppercase tracking-wide">Title *</label>
          <input name="title" type="text" required value={form.title} onChange={handleChange}
            className="w-full border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-800 focus:outline-none focus:border-rose-600" />
        </div>

        {/* Rent + Location */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1 uppercase tracking-wide">Rent (€/mo) *</label>
            <input name="rent" type="number" required min={1} value={form.rent} onChange={handleChange}
              className="w-full border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-800 focus:outline-none focus:border-rose-600" />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1 uppercase tracking-wide">Location *</label>
            <select name="location" required value={form.location} onChange={handleChange}
              className="w-full border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-800 focus:outline-none focus:border-rose-600">
              <option value="">Select…</option>
              {MUNICH_DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1 uppercase tracking-wide">Available from</label>
            <input name="available_from" type="date" value={form.available_from} onChange={handleChange}
              className="w-full border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-800 focus:outline-none focus:border-rose-600" />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1 uppercase tracking-wide">Available until</label>
            <input name="available_until" type="date" value={form.available_until} onChange={handleChange}
              className="w-full border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-800 focus:outline-none focus:border-rose-600" />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-medium text-zinc-500 mb-1 uppercase tracking-wide">Description *</label>
          <textarea name="description" required rows={4} value={form.description} onChange={handleChange}
            className="w-full border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-800 focus:outline-none focus:border-rose-600 resize-y" />
        </div>

        {/* Contact */}
        <div>
          <label className="block text-xs font-medium text-zinc-500 mb-1 uppercase tracking-wide">Contact email</label>
          <input name="contact_email" type="email" value={form.contact_email} onChange={handleChange}
            className="w-full border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-800 focus:outline-none focus:border-rose-600" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1 uppercase tracking-wide">Phone / WhatsApp</label>
            <input name="phone" type="tel" value={form.phone} onChange={handleChange}
              className="w-full border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-800 focus:outline-none focus:border-rose-600" />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-500 mb-1 uppercase tracking-wide">Facebook URL</label>
            <input name="facebook_url" type="url" value={form.facebook_url} onChange={handleChange}
              className="w-full border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-800 focus:outline-none focus:border-rose-600" />
          </div>
        </div>

        {/* Active status */}
        <label className="flex items-center gap-2 text-sm text-zinc-700 cursor-pointer">
          <input type="checkbox" checked={form.is_active}
            onChange={(e) => setForm((prev) => ({ ...prev, is_active: e.target.checked }))}
            className="accent-rose-600 w-4 h-4" />
          Publish immediately
        </label>

        {/* ── Partner section (admin-only) ────────────────────────────────────── */}
        <div className="border border-zinc-200 bg-zinc-50 p-4">
          <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 cursor-pointer mb-1">
            <input type="checkbox" checked={isPartner} onChange={(e) => setIsPartner(e.target.checked)}
              className="accent-rose-600 w-4 h-4" />
            Partner listing
          </label>
          <p className="text-xs text-zinc-400 mb-3">Shows a subtle attribution block on the listing detail page.</p>

          {isPartner && (
            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1 uppercase tracking-wide">Partner name</label>
                <input name="partner_name" type="text" placeholder="e.g. Munich Housing Group"
                  value={form.partner_name} onChange={handleChange}
                  className="w-full border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-800 focus:outline-none focus:border-rose-600" />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1 uppercase tracking-wide">
                  Partner URL <span className="normal-case font-normal text-zinc-400">(join group link)</span>
                </label>
                <input name="partner_url" type="url" placeholder="https://…"
                  value={form.partner_url} onChange={handleChange}
                  className="w-full border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-800 focus:outline-none focus:border-rose-600" />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1 uppercase tracking-wide">Original post URL</label>
                <input name="original_post_url" type="url" placeholder="https://…"
                  value={form.original_post_url} onChange={handleChange}
                  className="w-full border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-800 focus:outline-none focus:border-rose-600" />
              </div>
            </div>
          )}
        </div>
        {/* ──────────────────────────────────────────────────────────────────── */}

        <div className="flex justify-end pt-2">
          <button type="submit" disabled={loading}
            className="bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 text-white px-8 py-2.5 font-medium text-sm transition-colors">
            {loading ? "Creating…" : "Create Listing"}
          </button>
        </div>
      </form>
    </div>
  );
}
