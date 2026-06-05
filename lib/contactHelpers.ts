type ContactMethod = "whatsapp" | "email" | "instagram" | "facebook";

export function contactHref(method: ContactMethod, value: string): string {
  const v = value.trim();
  switch (method) {
    case "whatsapp": {
      // Strip all non-digit chars (except leading +) and build wa.me link
      const digits = v.replace(/[^\d+]/g, "");
      return `https://wa.me/${digits}`;
    }
    case "email":
      return `mailto:${v}`;
    case "instagram":
      if (v.startsWith("http://") || v.startsWith("https://")) return v;
      return `https://instagram.com/${v.replace(/^@/, "")}`;
    case "facebook":
      if (v.startsWith("http://") || v.startsWith("https://")) return v;
      return `https://facebook.com/${v}`;
    default:
      return v;
  }
}

export function contactLabel(method: ContactMethod): string {
  switch (method) {
    case "whatsapp": return "WhatsApp";
    case "email": return "Email";
    case "instagram": return "Instagram";
    case "facebook": return "Facebook";
    default: return method;
  }
}

export function contactButtonLabel(method: ContactMethod): string {
  switch (method) {
    case "whatsapp": return "Contact via WhatsApp";
    case "email": return "Contact via Email";
    case "instagram": return "Contact via Instagram";
    case "facebook": return "Contact via Facebook";
    default: return "Contact";
  }
}
