"use client";

import { useState } from "react";
import { AlertTriangle, X } from "lucide-react";

const SUSPICIOUS_REASONS = [
  "Asked for money before viewing",
  "Photos or listing seem fake",
  "Contact details or story do not match",
  "Other suspicious behaviour",
] as const;

export default function ReportListingButton() {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<{ reason?: string; details?: string }>({});

  function validate() {
    const errs: { reason?: string; details?: string } = {};
    if (!reason) errs.reason = "Please select a reason.";
    const trimmed = details.trim();
    if (trimmed.length < 20) errs.details = "Please write at least 20 characters.";
    else if (trimmed.length > 500) errs.details = "Maximum 500 characters.";
    return errs;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    const listingUrl = typeof window !== "undefined" ? window.location.href : "";
    const subject = "Suspicious listing report";
    const body =
      `Hi RoomRush,\n\nI want to report this listing.\n\nSuspicious reason:\n${reason}\n\nDetails:\n${details.trim()}\n\nListing:\n${listingUrl}\n\nI can attach screenshots or proof to this email if needed.`;
    window.location.href = `mailto:roomrush.app@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setSubmitted(true);
  }

  function handleClose() {
    setOpen(false);
    setSubmitted(false);
    setReason("");
    setDetails("");
    setErrors({});
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center justify-center gap-2 border border-zinc-200 hover:border-zinc-300 bg-white text-zinc-500 hover:text-zinc-700 px-4 py-3 font-medium text-sm transition-colors w-full mt-3"
      >
        <AlertTriangle size={14} className="text-amber-500 shrink-0" />
        Report suspicious listing
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
          onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
        >
          <div className="bg-white w-full max-w-sm shadow-lg overflow-y-auto max-h-[90dvh]">
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
              <h2 className="font-semibold text-zinc-900 text-base">Report this listing</h2>
              <button
                onClick={handleClose}
                aria-label="Close"
                className="text-zinc-400 hover:text-zinc-600 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5">
              {submitted ? (
                <div className="text-sm text-zinc-600 leading-relaxed">
                  <p className="font-medium text-zinc-800 mb-2">Thanks for reporting this.</p>
                  <p>
                    Please send the email so the RoomRush admin can review it. If needed, we may
                    contact the lister and remove the listing if it cannot be verified.
                  </p>
                  <button
                    onClick={handleClose}
                    className="mt-5 w-full border border-zinc-200 hover:border-zinc-300 text-zinc-600 px-4 py-2.5 text-sm font-medium transition-colors"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate>
                  <p className="text-sm text-zinc-500 mb-5 leading-relaxed">
                    Help us review suspicious listings faster. Please explain what happened.
                  </p>

                  {/* Reason */}
                  <div className="mb-4">
                    <p className="text-sm font-medium text-zinc-700 mb-2">
                      What seems suspicious?
                    </p>
                    <div className="flex flex-col gap-2.5">
                      {SUSPICIOUS_REASONS.map((r) => (
                        <label
                          key={r}
                          className="flex items-start gap-2.5 cursor-pointer text-sm text-zinc-700"
                        >
                          <input
                            type="radio"
                            name="reason"
                            value={r}
                            checked={reason === r}
                            onChange={() => {
                              setReason(r);
                              setErrors((prev) => ({ ...prev, reason: undefined }));
                            }}
                            className="mt-0.5 accent-rose-600 shrink-0"
                          />
                          {r}
                        </label>
                      ))}
                    </div>
                    {errors.reason && (
                      <p className="text-xs text-rose-600 mt-1.5">{errors.reason}</p>
                    )}
                  </div>

                  {/* Details */}
                  <div className="mb-5">
                    <label
                      htmlFor="report-details"
                      className="block text-sm font-medium text-zinc-700 mb-2"
                    >
                      What happened?
                    </label>
                    <textarea
                      id="report-details"
                      value={details}
                      onChange={(e) => {
                        setDetails(e.target.value);
                        setErrors((prev) => ({ ...prev, details: undefined }));
                      }}
                      placeholder="Example: They asked me to pay a deposit before viewing, or the photos/contact details did not match."
                      rows={4}
                      maxLength={500}
                      className="w-full border border-zinc-200 focus:border-zinc-400 focus:outline-none px-3 py-2.5 text-sm text-zinc-700 placeholder-zinc-400 resize-none"
                    />
                    <div className="flex justify-between mt-1">
                      {errors.details ? (
                        <p className="text-xs text-rose-600">{errors.details}</p>
                      ) : (
                        <span />
                      )}
                      <p className="text-xs text-zinc-400">{details.length}/500</p>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-zinc-800 hover:bg-zinc-900 text-white px-4 py-3 text-sm font-medium transition-colors"
                  >
                    Send report by email
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
