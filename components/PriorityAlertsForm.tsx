"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Status = "idle" | "loading" | "success" | "error";

type FormErrors = Partial<Record<string, string>>;

const inputClass =
  "w-full bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 text-sm px-4 py-3 focus:outline-none focus:border-zinc-500 transition-colors";
const inputErrorClass =
  "w-full bg-zinc-800 border border-rose-500 text-white placeholder-zinc-500 text-sm px-4 py-3 focus:outline-none focus:border-rose-400 transition-colors";
const labelClass = "block text-xs text-zinc-400 uppercase tracking-wide mb-1.5";

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="text-xs text-rose-400 mt-1">{msg}</p>;
}

export default function PriorityAlertsForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [submitError, setSubmitError] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

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
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function validate(): FormErrors {
    const e: FormErrors = {};
    if (!form.name.trim()) e.name = "Name is required.";
    if (!form.email.trim() && !form.whatsapp.trim())
      e.contact = "Please enter either WhatsApp or email so we can contact you.";
    if (!form.max_budget) e.max_budget = "Max budget is required.";
    if (!form.move_in_date) e.move_in_date = "Move-in date is required.";
    if (!form.minimum_stay) e.minimum_stay = "Minimum stay is required.";
    if (!form.preferred_areas.trim()) e.preferred_areas = "Preferred areas are required.";
    if (!form.room_type) e.room_type = "Room type is required.";
    if (!form.kvr_needed) e.kvr_needed = "KVR registration answer is required.";
    if (!form.terms_accepted) e.terms_accepted = "You must accept the terms to continue.";
    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setStatus("loading");
    setSubmitError("");

    const supabase = createClient();
    const { error } = await supabase.from("priority_alert_requests").insert({
      name: form.name.trim(),
      email: form.email.trim() || null,
      whatsapp: form.whatsapp.trim() || null,
      max_budget: parseInt(form.max_budget, 10),
      move_in_date: form.move_in_date,
      minimum_stay: form.minimum_stay,
      preferred_areas: form.preferred_areas.trim(),
      open_to_nearby_cities: form.open_to_nearby_cities,
      room_type: form.room_type,
      kvr_needed: form.kvr_needed,
      notes: form.notes.trim() || null,
      terms_accepted: true,
    });

    if (error) {
      setStatus("error");
      setSubmitError("Something went wrong. Please try again.");
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

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">

      {/* Name */}
      <div>
        <label className={labelClass}>Name *</label>
        <input
          type="text"
          placeholder="Your name"
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          className={errors.name ? inputErrorClass : inputClass}
        />
        <FieldError msg={errors.name} />
      </div>

      {/* Contact — whatsapp or email, at least one required */}
      <div>
        <p className={labelClass}>Contact — WhatsApp or email *</p>
        {errors.contact && (
          <p className="text-xs text-rose-400 mb-2">{errors.contact}</p>
        )}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <input
              type="text"
              placeholder="WhatsApp: +49 ..."
              value={form.whatsapp}
              onChange={(e) => {
                set("whatsapp", e.target.value);
                if (errors.contact) setErrors((prev) => ({ ...prev, contact: undefined }));
              }}
              className={errors.contact ? inputErrorClass : inputClass}
            />
          </div>
          <div>
            <input
              type="email"
              placeholder="Email: your@email.com"
              value={form.email}
              onChange={(e) => {
                set("email", e.target.value);
                if (errors.contact) setErrors((prev) => ({ ...prev, contact: undefined }));
              }}
              className={errors.contact ? inputErrorClass : inputClass}
            />
          </div>
        </div>
        <p className="text-xs text-zinc-500 mt-1.5">Enter at least one. We use this to send your alerts.</p>
      </div>

      {/* Budget + Move-in */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Max budget (€ / month) *</label>
          <input
            type="number"
            placeholder="e.g. 900"
            min={0}
            value={form.max_budget}
            onChange={(e) => set("max_budget", e.target.value)}
            className={errors.max_budget ? inputErrorClass : inputClass}
          />
          <FieldError msg={errors.max_budget} />
        </div>
        <div>
          <label className={labelClass}>Move-in date *</label>
          <input
            type="date"
            value={form.move_in_date}
            onChange={(e) => set("move_in_date", e.target.value)}
            className={errors.move_in_date ? inputErrorClass : inputClass}
          />
          <FieldError msg={errors.move_in_date} />
        </div>
      </div>

      {/* Minimum stay + Room type */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Minimum stay *</label>
          <select
            value={form.minimum_stay}
            onChange={(e) => set("minimum_stay", e.target.value)}
            className={errors.minimum_stay ? inputErrorClass : inputClass}
          >
            <option value="">Select…</option>
            <option value="1 month">1 month</option>
            <option value="2 months">2 months</option>
            <option value="3 months">3 months</option>
            <option value="6 months">6 months</option>
            <option value="flexible">Flexible</option>
          </select>
          <FieldError msg={errors.minimum_stay} />
        </div>
        <div>
          <label className={labelClass}>Room type *</label>
          <select
            value={form.room_type}
            onChange={(e) => set("room_type", e.target.value)}
            className={errors.room_type ? inputErrorClass : inputClass}
          >
            <option value="">Select…</option>
            <option value="private room">Private room</option>
            <option value="shared room">Shared room</option>
            <option value="studio">Studio</option>
            <option value="any">Any</option>
          </select>
          <FieldError msg={errors.room_type} />
        </div>
      </div>

      {/* Preferred areas */}
      <div>
        <label className={labelClass}>Preferred areas *</label>
        <textarea
          placeholder="e.g. Schwabing, Maxvorstadt, Garching, central Munich…"
          value={form.preferred_areas}
          onChange={(e) => set("preferred_areas", e.target.value)}
          rows={2}
          className={`${errors.preferred_areas ? inputErrorClass : inputClass} resize-none`}
        />
        <FieldError msg={errors.preferred_areas} />
      </div>

      {/* KVR + Open to nearby */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>KVR registration needed? *</label>
          <select
            value={form.kvr_needed}
            onChange={(e) => set("kvr_needed", e.target.value)}
            className={errors.kvr_needed ? inputErrorClass : inputClass}
          >
            <option value="">Select…</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
            <option value="flexible">Flexible</option>
          </select>
          <FieldError msg={errors.kvr_needed} />
        </div>
        <div>
          <label className={labelClass}>Open to nearby areas?</label>
          <label className="flex items-center gap-3 cursor-pointer mt-3">
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
            <span className="text-sm text-zinc-300">Yes, open to Garching, Freising, etc.</span>
          </label>
        </div>
      </div>

      {/* Notes (optional) */}
      <div>
        <label className={labelClass}>Additional notes <span className="normal-case text-zinc-600">(optional)</span></label>
        <textarea
          placeholder="Move-in flexibility, room requirements, anything else…"
          value={form.notes}
          onChange={(e) => set("notes", e.target.value)}
          rows={3}
          className={`${inputClass} resize-none`}
        />
      </div>

      {/* Important notice — sits directly above terms and submit */}
      <div className="border border-zinc-800 bg-zinc-900/50 p-4 text-xs text-zinc-400 leading-relaxed space-y-2.5">
        <p className="text-zinc-300 font-semibold text-sm">Important before applying</p>
        <p>
          Priority Alerts do not guarantee that a matching room will be uploaded during your alert period. They also do not guarantee a room, reply, viewing, or contract.
        </p>
        <p>
          If there are zero matching or close match RoomRush uploads during your first 7 days, we extend your Priority Alerts once for another 7 days free. After the free extension, the alert period ends automatically, so the maximum period is 14 days.
        </p>
        <p>
          Since this is still beta, if the feature is improved during your active period, you will be included in the better version without extra charge within your active alert period.
        </p>
      </div>

      {/* Terms */}
      <label className="flex items-start gap-3 cursor-pointer">
        <div className="relative mt-0.5 shrink-0">
          <input
            type="checkbox"
            checked={form.terms_accepted}
            onChange={(e) => set("terms_accepted", e.target.checked)}
            className="sr-only peer"
          />
          <div className={`w-4 h-4 border ${errors.terms_accepted ? "border-rose-500" : "border-zinc-600"} peer-checked:bg-rose-600 peer-checked:border-rose-600 transition-colors`} />
          {form.terms_accepted && (
            <svg className="absolute inset-0 w-4 h-4 text-white pointer-events-none" viewBox="0 0 16 16" fill="none">
              <path d="M3 8l3.5 3.5 6.5-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>
        <span className={`text-xs leading-relaxed ${errors.terms_accepted ? "text-rose-400" : "text-zinc-400"}`}>
          I understand that Priority Alerts do not guarantee a room, reply, viewing, or contract. I am requesting earlier alerts for matching or close match RoomRush uploads. *
          {errors.terms_accepted && (
            <span className="block text-rose-400 mt-0.5">{errors.terms_accepted}</span>
          )}
        </span>
      </label>

      {submitError && (
        <p className="text-xs text-rose-400">{submitError}</p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="inline-flex items-center justify-center bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white px-6 py-3 font-medium text-sm transition-colors w-full sm:w-auto"
      >
        {status === "loading" ? "Submitting…" : "Submit request"}
      </button>

    </form>
  );
}
