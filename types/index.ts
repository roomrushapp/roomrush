export type RoomSeekerProfile = {
  id: string;
  user_id: string;
  name: string;
  age: number | null;
  photo_url: string | null;        // legacy — keep for backwards compat
  photo_urls: string[];            // v2 — array of uploaded photos
  budget: string;
  move_in_date: string;
  preferred_area: string;
  short_intro: string;
  contact_method: "whatsapp" | "email" | "instagram" | "facebook";
  contact_value: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Listing = {
  id: string;
  created_at: string;
  user_id: string;
  title: string;
  description: string;
  rent: number;
  location: string;
  available_from: string | null;
  available_until: string | null;
  contact_email: string | null;
  phone: string | null;
  image_urls: string[];
  is_active: boolean;
  views_count: number;
  facebook_url: string | null;
  slug: string | null;
  // Partner source attribution (admin-managed)
  is_partner_listing: boolean | null;
  partner_name: string | null;
  partner_url: string | null;
  original_post_url: string | null;
};
