"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Status = "idle" | "loading" | "success" | "error";

export default function PriorityAlertsForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    whatsapp: "",
    max_budget: "",
    move_in_date: "",
    minimum_stay: "",
    preferred_areas: "",
    open_to_nearby_cities: false,
    room_type: "",
    kvr_needed: "",
    notes: "",
    terms_accepted: false,
  });

  function set(field: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.terms_accepted) return;

    setStatus("loading");
    setErrorMsg("");

    const supabase = createClient();
    const { error } = await supabase.from("priority_alert_requests").insert({
      name: form.name,
      email: form.email || null,
      whatsapp: form.whatsapp || null,
      max_budget: form.max_budget ? parseInt(form.max_budget, 10) : null,
      move_in_date: form.move_in_date || null,
      minimum_stay: form.minimum_stay || null,
      preferred_areas: form.preferred_areas || null,
      open_to_nearby_cities: form.open_to_nearby_cities,
      room_type: form.room_type || null,
      kvr_needed: form.kvr_needed || null,
      notes: form.notes || null,
      terms_accepted: form.terms_accepted,
      status: "pending",
    });

    if (error) {
      setStatus("error");
      setErrorMsg("Something went wrong. Please try again.");
      return;
    }

    setStatus("success");
  }

  if (status === "success") {
    return (
      <div className="border border-zinc-700 bg-zinc-900 p-8 text-center">
        <p className="text-rose-500 text-xs font-semibold uppercase tracking-widest mb-3">Request submitted</p>
        <p className="text-white text-lg font-display font-bold mb-2">Thanks, your request was submitted.</p>
        <p className="text-zinc-400 text-sm">
          We&apos;ll review it and contact you if it fits the beta.
        </p>
      </div>
    );
  }

  const inputClass =
    "w-full bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 text-sm px-4 py-3 focus:outline-none focus:border-zinc-500 transition-colors";
  const labelClass = "block text-xs text-zinc-400 uppercase tracking-wide mb-1.5";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="grid sm:grid-cols-2 gap-6">
        <div>
          <label className={labelClass}>Name *</label>
          <input
            type="text"
            required
            placeholder="Your name"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Email</label>
          <input
            type="email"
            placeholder="your@email.com"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        <div>
          <label className={labelClass}>WhatsApp number</label>
          <input
            type="text"
            placeholder="+49 ..."
            value={form.whatsapp}
            onChange={(e) => set("whatsapp", e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Max budget (€/month)</label>
          <input
            type="number"
            placeholder="e.g. 900"
            min={0}
            value={form.max_budget}
            onChange={(e) => set("max_budget", e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        <div>
          <label className={labelClass}>Move-in date</label>
          <input
            type="date"
            value={form.move_in_date}
            onChange={(e) => set("move_in_date", e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Minimum stay</label>
          <select
            value={form.minimum_stay}
            onChange={(e) => set("minimum_stay", e.target.value)}
            className={inputClass}
          >
            <option value="">Select...</option>
            <option value="1 month">1 month</option>
            <option value="2 months">2 months</option>
            <option value="3 months">3 months</option>
            <option value="6 months">6 months</option>
            <option value="flexible">Flexible</option>
          </select>
        </div>
      </div>

      <div>
        <label className={labelClass}>Preferred areas</label>
        <textarea
          placeholder="e.g. Schwabing, Maxvorstadt, Garching, central Munich..."
          value={form.preferred_areas}
          onChange={(e) => set("preferred_areas", e.target.value)}
          rows={2}
          className={`${inputClass} resize-none`}
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        <div>
          <label className={labelClass}>Room type</label>
          <select
            value={form.room_type}
            onChange={(e) => set("room_type", e.target.value)}
            className={inputClass}
          >
            <option value="">Select...</option>
            <option value="private room">Private room</option>
            <option value="shared room">Shared room</option>
            <option value="studio">Studio</option>
            <option value="any">Any</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>KVR registration needed?</label>
          <select
            value={form.kvr_needed}
            onChange={(e) => set("kvr_needed", e.target.value)}
            className={inputClass}
          >
            <option value="">Select...</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
            <option value="flexible">Flexible</option>
          </select>
        </div>
      </div>

      <div>
        <label className={labelClass}>Open to nearby cities?</label>
        <label className="flex items-center gap-3 cursor-pointer">
          <div className="relative shrink-0">
            <input
              type="checkbox"
              checked={form.open_to_nearby_cities}
              onChange={(e) => set("open_to_nearby_cities", e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-4 h-4 border border-zinc-600 peer-checked:bg-rose-600 peer-checked:border-rose-600 transition-colors" />
            {form.open_to_nearby_cities && (
              <svg className="absolute inset-0 w-4 h-4 text-white pointer-events-none" viewBox="0 0 16 16" fill="none">
                <path d="M3 8l3.5 3.5 6.5-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
          <span className="text-sm text-zinc-300">Yes, I'm open to Garching, Freising, or other nearby areas</span>
        </label>
      </div>

      <div>
        <label className={labelClass}>Additional notes</label>
        <textarea
          placeholder="Anything else we should know — move-in flexibility, room requirements, etc."
          value={form.notes}
          onChange={(e) => set("notes", e.target.value)}
          rows={3}
          className={`${inputClass} resize-none`}
        />
      </div>

      {/* Terms */}
      <label className="flex items-start gap-3 cursor-pointer">
        <div className="relative mt-0.5 shrink-0">
          <input
            type="checkbox"
            required
            checked={form.terms_accepted}
            onChange={(e) => set("terms_accepted", e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-4 h-4 border border-zinc-600 peer-checked:bg-rose-600 peer-checked:border-rose-600 transition-colors" />
          {form.terms_accepted && (
            <svg className="absolute inset-0 w-4 h-4 text-white pointer-events-none" viewBox="0 0 16 16" fill="none">
              <path d="M3 8l3.5 3.5 6.5-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>
        <span className="text-xs leading-relaxed text-zinc-400">
          I understand that Priority Alerts do not guarantee a room, reply, viewing, or contract. I am requesting earlier alerts for matching or close match RoomRush uploads. *
        </span>
      </label>

      {status === "error" && (
        <p className="text-xs text-rose-400">{errorMsg}</p>
      )}

      <button
        type="submit"
        disabled={status === "loading" || !form.terms_accepted}
        className="inline-flex items-center justify-center bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white px-6 py-3 font-medium text-sm transition-colors w-full sm:w-auto"
      >
        {status === "loading" ? "Submitting…" : "Submit request"}
      </button>
    </form>
  );
}
