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
};
