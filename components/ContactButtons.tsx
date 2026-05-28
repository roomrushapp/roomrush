"use client";

import { Phone, Mail } from "lucide-react";
import { trackContact } from "@/lib/trackEvent";
import type { CONTACT_EVENT_TYPES } from "@/lib/trackEvent";

type ContactEventType = (typeof CONTACT_EVENT_TYPES)[number];

type Props = {
  listing_id: string;
  contact_email: string | null;
  phone: string | null;
  facebook_url?: string | null;
};

function normalizeFacebookUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (/^(www\.)?facebook\.com/i.test(trimmed)) return `https://${trimmed}`;
  if (/^(www\.)?fb\.com/i.test(trimmed)) return `https://${trimmed}`;
  return trimmed;
}

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

async function handleContact(listing_id: string, event_type: ContactEventType, url: string, newTab = false) {
  try {
    await trackContact(listing_id, event_type);
  } catch (err) {
    console.error("[ContactButtons] tracking failed:", event_type, err);
  }
  if (newTab) {
    window.open(url, "_blank", "noopener,noreferrer");
  } else {
    window.location.href = url;
  }
}

export default function ContactButtons({ listing_id, contact_email, phone, facebook_url }: Props) {
  const hasDirectContact = !!contact_email || !!phone;
  const normalizedFacebookUrl = normalizeFacebookUrl(facebook_url);

  return (
    <div className="flex flex-col gap-3">
      {/* Email */}
      {contact_email && (
        <button
          onClick={() => handleContact(listing_id, "contact_email", buildMailtoUrl(contact_email))}
          className="flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-4 py-3 font-medium text-sm transition-colors w-full"
        >
          <Mail size={16} />
          Contact via email
        </button>
      )}

      {/* Phone / WhatsApp */}
      {phone && (
        <>
          <button
            onClick={() => handleContact(listing_id, "contact_whatsapp", buildWhatsAppUrl(phone), true)}
            className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-3 font-medium text-sm transition-colors w-full"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Message on WhatsApp
          </button>
          <button
            onClick={() => handleContact(listing_id, "contact_phone", `tel:${phone}`)}
            className="flex items-center justify-center gap-2 border border-zinc-300 hover:border-zinc-500 text-zinc-700 px-4 py-3 font-medium text-sm transition-colors w-full"
          >
            <Phone size={16} />
            {phone}
          </button>
        </>
      )}

      {/* Facebook CTA — rendered as <a> so mobile browsers don't block it */}
      {normalizedFacebookUrl && (
        <a
          href={normalizedFacebookUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => { trackContact(listing_id, "contact_facebook").catch(() => {}); }}
          className="flex items-center justify-center gap-2 bg-[#1877F2] hover:bg-[#1464d8] text-white px-4 py-3 font-medium text-sm transition-colors w-full"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.884v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
          </svg>
          Message on Facebook
        </a>
      )}
    </div>
  );
}
