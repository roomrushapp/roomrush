"use client";

import { useEffect, useState } from "react";
import { Mail, Phone } from "lucide-react";
import { trackContact } from "@/lib/trackEvent";

const WHATSAPP_ICON = (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

type Props = {
  listing_id: string;
  contact_email: string | null;
  phone: string | null;
  rent: number;
  contactCardId: string;
};

function buildWhatsAppUrl(phone: string): string {
  const number = phone.replace(/[^0-9]/g, "");
  const message =
    "Hi, I found your room on RoomRush and I'm interested. Is it still available?\n\nIf yes, I can send more details about myself.";
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

function buildMailtoUrl(email: string): string {
  const subject = "Room inquiry from RoomRush";
  const body =
    "Hi,\n\nI found your room on RoomRush and I'm interested. Is it still available?\n\nIf yes, I can send more details about myself.\n\nBest";
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export default function MobileStickyContact({
  listing_id,
  contact_email,
  phone,
  rent,
  contactCardId,
}: Props) {
  const [cardVisible, setCardVisible] = useState(false);

  useEffect(() => {
    const el = document.getElementById(contactCardId);
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setCardVisible(entry.isIntersecting),
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [contactCardId]);

  const hasWhatsApp = !!phone;
  const hasEmail = !!contact_email;
  const hasPhone = !!phone;

  if (!hasWhatsApp && !hasEmail && !hasPhone) return null;

  const shouldShow = !cardVisible;

  async function handleWhatsApp() {
    try { await trackContact(listing_id, "contact_whatsapp"); } catch {}
    window.open(buildWhatsAppUrl(phone!), "_blank", "noopener,noreferrer");
  }

  async function handleEmail() {
    try { await trackContact(listing_id, "contact_email"); } catch {}
    window.location.href = buildMailtoUrl(contact_email!);
  }

  async function handlePhone() {
    try { await trackContact(listing_id, "contact_phone"); } catch {}
    window.location.href = `tel:${phone}`;
  }

  return (
    <div
      className="md:hidden"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 40,
        transform: shouldShow ? "translateY(0)" : "translateY(120%)",
        opacity: shouldShow ? 1 : 0,
        pointerEvents: shouldShow ? "auto" : "none",
        transition: "transform 500ms ease-in-out, opacity 400ms ease-in-out",
      }}
    >
      <div
        className="bg-white border-t border-zinc-200 shadow-[0_-2px_12px_rgba(0,0,0,0.08)]"
        style={{
          paddingLeft: "1rem",
          paddingRight: "1rem",
          paddingTop: "0.75rem",
          paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))",
        }}
      >
        <div className="flex items-center gap-3">
          {/* Rent label */}
          <div className="shrink-0 w-1/4">
            <p className="text-[10px] text-zinc-400 leading-none mb-0.5 uppercase tracking-wide">/ month</p>
            <p className="font-display font-bold text-lg text-rose-600 leading-none">
              €{rent.toLocaleString()}
            </p>
          </div>

          {/* Contact buttons — 3/4 of row */}
          <div className="flex gap-2 flex-1">
            {hasWhatsApp && hasEmail ? (
              // Both available — equal halves
              <>
                <button
                  onClick={handleEmail}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 active:scale-[0.97] text-white py-3 font-medium text-sm transition-all"
                >
                  <Mail size={15} />
                  Email
                </button>
                <button
                  onClick={handleWhatsApp}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-green-600 hover:bg-green-700 active:bg-green-800 active:scale-[0.97] text-white py-3 font-medium text-sm transition-all"
                >
                  {WHATSAPP_ICON}
                  WhatsApp
                </button>
              </>
            ) : hasWhatsApp ? (
              <button
                onClick={handleWhatsApp}
                className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 active:bg-green-800 active:scale-[0.97] text-white py-3 font-medium text-sm transition-all"
              >
                {WHATSAPP_ICON}
                Message on WhatsApp
              </button>
            ) : hasEmail ? (
              <button
                onClick={handleEmail}
                className="flex-1 flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 active:scale-[0.97] text-white py-3 font-medium text-sm transition-all"
              >
                <Mail size={15} />
                Contact via email
              </button>
            ) : (
              <button
                onClick={handlePhone}
                className="flex-1 flex items-center justify-center gap-2 border border-zinc-300 hover:border-zinc-500 text-zinc-700 py-3 font-medium text-sm transition-all active:scale-[0.97]"
              >
                <Phone size={15} />
                {phone}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
