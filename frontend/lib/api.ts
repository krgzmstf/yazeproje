/**
 * YAZE Proje API Client
 * Contains types and fetch wrappers for database content.
 */

const API_BASE_URL =
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:1002/api/v1";

// ── Types ─────────────────────────────────────────────────────────

export type ProjectCategory =
  | "residential"
  | "commercial"
  | "industrial"
  | "infrastructure"
  | "renovation"
  | "urban_planning"
  | "interior_design"
  | "landscape";

export type ProjectStatus =
  | "draft"
  | "in_progress"
  | "completed"
  | "on_hold"
  | "cancelled";

export type PhaseStatus =
  | "not_started"
  | "in_progress"
  | "completed"
  | "delayed";

export interface ProjectPhase {
  id: string;
  project_id: string;
  name: string;
  description: string | null;
  status: PhaseStatus;
  progress_pct: number;
  sort_order: number;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface ArchitectureProject {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  category: ProjectCategory;
  status: ProjectStatus;
  client_name: string | null;
  location: string | null;
  area_sqm: number | null;
  budget_try: number | null;
  start_date: string | null;
  end_date: string | null;
  cover_image_url: string | null;
  gallery_urls: { images?: string[] } | null;
  is_featured: boolean;
  is_published: boolean;
  sort_order: number;
  meta_title: string | null;
  meta_description: string | null;
  created_at: string;
  updated_at: string;
  phases?: ProjectPhase[];
}

export type ListingType = "sale" | "rent" | "daily_rent";
export type PropertyType =
  | "apartment"
  | "villa"
  | "land"
  | "office"
  | "shop"
  | "warehouse"
  | "other";

export interface RealEstateListing {
  id: string;
  title: string;
  slug: string;
  listing_type: ListingType;
  property_type: PropertyType;
  description: string | null;
  price: number | null;
  currency: string;
  area_sqm: number | null;
  room_count: string | null;
  floor_number: number | null;
  total_floors: number | null;
  building_age: number | null;
  heating_type: string | null;
  city: string | null;
  district: string | null;
  neighborhood: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  cover_image_url: string | null;
  gallery_urls: { images?: string[] } | null;
  features: Record<string, boolean> | null;
  contact_name: string | null;
  contact_phone: string | null;
  is_featured: boolean;
  is_published: boolean;
  view_count: number;
  created_at: string;
  updated_at: string;
}

export type NewsSource =
  | "resmi_gazete"
  | "csbe"
  | "tmmob"
  | "custom_rss"
  | "manual";

export interface AutomatedNews {
  id: string;
  title: string;
  slug: string;
  source: NewsSource;
  source_url: string | null;
  summary: string | null;
  content: string | null;
  cover_image_url: string | null;
  tags: Record<string, string> | null;
  is_published: boolean;
  is_featured: boolean;
  published_at: string | null;
  view_count: number;
  created_at: string;
  updated_at: string;
}

export interface Announcement {
  id: string;
  title: string;
  slug: string;
  content: string | null;
  cover_image_url: string | null;
  is_published: boolean;
  is_pinned: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  location: string | null;
  event_date: string | null;
  event_end_date: string | null;
  cover_image_url: string | null;
  registration_url: string | null;
  is_published: boolean;
  is_featured: boolean;
  max_attendees: number | null;
  current_attendees: number;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionRequest {
  email?: string;
  phone?: string;
  full_name?: string;
}

// ── Fetch Helper ──────────────────────────────────────────────────

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  
  // Since we fetch on the server, we might want caching or revalidation.
  // We use `next: { revalidate: 60 }` to cache for 60 seconds (ISR).
  const defaultOptions: RequestInit = {
    next: { revalidate: 60 },
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
  };

  try {
    const res = await fetch(url, defaultOptions);
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`API fetch error (${res.status}): ${errText || res.statusText}`);
    }
    return (await res.json()) as T;
  } catch (error) {
    console.error(`Fetch failed for URL: ${url}`, error);
    throw error;
  }
}

// ── API Methods ───────────────────────────────────────────────────

// Projects
export async function getProjects(params?: {
  category?: ProjectCategory;
  is_featured?: boolean;
  limit?: number;
}): Promise<ArchitectureProject[]> {
  const searchParams = new URLSearchParams();
  if (params?.category) searchParams.append("category", params.category);
  if (params?.is_featured !== undefined)
    searchParams.append("is_featured", String(params.is_featured));
  if (params?.limit) searchParams.append("limit", String(params.limit));

  const queryStr = searchParams.toString() ? `?${searchParams.toString()}` : "";
  return apiFetch<ArchitectureProject[]>(`/projects${queryStr}`);
}

export async function getProjectBySlug(slug: string): Promise<ArchitectureProject> {
  return apiFetch<ArchitectureProject>(`/projects/${slug}`);
}

// Listings
export async function getListings(params?: {
  listing_type?: ListingType;
  property_type?: PropertyType;
  is_featured?: boolean;
  limit?: number;
}): Promise<RealEstateListing[]> {
  const searchParams = new URLSearchParams();
  if (params?.listing_type) searchParams.append("listing_type", params.listing_type);
  if (params?.property_type) searchParams.append("property_type", params.property_type);
  if (params?.is_featured !== undefined)
    searchParams.append("is_featured", String(params.is_featured));
  if (params?.limit) searchParams.append("limit", String(params.limit));

  const queryStr = searchParams.toString() ? `?${searchParams.toString()}` : "";
  return apiFetch<RealEstateListing[]>(`/listings${queryStr}`);
}

export async function getListingBySlug(slug: string): Promise<RealEstateListing> {
  return apiFetch<RealEstateListing>(`/listings/${slug}`);
}

// News
export async function getNews(params?: {
  is_featured?: boolean;
  limit?: number;
}): Promise<AutomatedNews[]> {
  const searchParams = new URLSearchParams();
  if (params?.is_featured !== undefined)
    searchParams.append("is_featured", String(params.is_featured));
  if (params?.limit) searchParams.append("limit", String(params.limit));

  const queryStr = searchParams.toString() ? `?${searchParams.toString()}` : "";
  return apiFetch<AutomatedNews[]>(`/news${queryStr}`);
}

export async function getNewsBySlug(slug: string): Promise<AutomatedNews> {
  return apiFetch<AutomatedNews>(`/news/${slug}`);
}

// Announcements
export async function getAnnouncements(params?: {
  is_pinned?: boolean;
  limit?: number;
}): Promise<Announcement[]> {
  const searchParams = new URLSearchParams();
  if (params?.is_pinned !== undefined)
    searchParams.append("is_pinned", String(params.is_pinned));
  if (params?.limit) searchParams.append("limit", String(params.limit));

  const queryStr = searchParams.toString() ? `?${searchParams.toString()}` : "";
  return apiFetch<Announcement[]>(`/announcements${queryStr}`);
}

export async function getAnnouncementBySlug(slug: string): Promise<Announcement> {
  return apiFetch<Announcement>(`/announcements/${slug}`);
}

// Events
export async function getEvents(params?: {
  is_featured?: boolean;
  limit?: number;
}): Promise<Event[]> {
  const searchParams = new URLSearchParams();
  if (params?.is_featured !== undefined)
    searchParams.append("is_featured", String(params.is_featured));
  if (params?.limit) searchParams.append("limit", String(params.limit));

  const queryStr = searchParams.toString() ? `?${searchParams.toString()}` : "";
  return apiFetch<Event[]>(`/events${queryStr}`);
}

export async function getEventBySlug(slug: string): Promise<Event> {
  return apiFetch<Event>(`/events/${slug}`);
}

// Subscriptions (client-side submit, so no cache)
export async function subscribe(
  payload: SubscriptionRequest
): Promise<{ status: string; message: string; details: Record<string, string> }> {
  return apiFetch<{ status: string; message: string; details: Record<string, string> }>(
    "/subscriptions",
    {
      method: "POST",
      body: JSON.stringify(payload),
      cache: "no-store", // Do not cache POST requests
      next: undefined,
    }
  );
}

// Site Settings
export async function getSiteSettings(): Promise<Record<string, any>> {
  try {
    return await apiFetch<Record<string, any>>("/settings/");
  } catch (error) {
    console.error("Failed to fetch site settings, using empty defaults", error);
    return {};
  }
}

export async function getAdminSettings(token: string): Promise<any[]> {
  return apiFetch<any[]>("/settings/admin", {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
    next: undefined,
  });
}

export async function updateSiteSettingsBulk(
  settings: Record<string, any>,
  token: string
): Promise<{ status: string; message: string }> {
  return apiFetch<{ status: string; message: string }>("/settings/bulk", {
    method: "PUT",
    body: JSON.stringify({ settings }),
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
    next: undefined,
  });
}

// ── Software Product Types & API Methods ────────────────────────────

export type SoftwareCategory =
  | "cad_tool"
  | "project_management"
  | "bim"
  | "calculation"
  | "visualization"
  | "other";

export interface SoftwareProduct {
  id: string;
  name: string;
  slug: string;
  category: SoftwareCategory;
  short_description: string | null;
  description: string | null;
  features: Record<string, any> | null;
  price: number | null;
  currency: string;
  is_free: boolean;
  download_url: string | null;
  demo_url: string | null;
  cover_image_url: string | null;
  screenshots: Record<string, any> | null;
  version: string | null;
  is_published: boolean;
  is_featured: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export async function getSoftwareProducts(params?: {
  is_featured?: boolean;
  limit?: number;
}): Promise<SoftwareProduct[]> {
  const searchParams = new URLSearchParams();
  if (params?.is_featured !== undefined)
    searchParams.append("is_featured", String(params.is_featured));
  if (params?.limit) searchParams.append("limit", String(params.limit));

  const queryStr = searchParams.toString() ? `?${searchParams.toString()}` : "";
  return apiFetch<SoftwareProduct[]>(`/software${queryStr}`);
}

export async function getAdminSoftwareProducts(token: string): Promise<SoftwareProduct[]> {
  return apiFetch<SoftwareProduct[]>("/software/admin", {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
    next: undefined,
  });
}

export async function getSoftwareProductBySlug(slug: string): Promise<SoftwareProduct> {
  return apiFetch<SoftwareProduct>(`/software/${slug}`);
}

export async function createSoftwareProduct(
  payload: Partial<SoftwareProduct>,
  token: string
): Promise<SoftwareProduct> {
  return apiFetch<SoftwareProduct>("/software/", {
    method: "POST",
    body: JSON.stringify(payload),
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
    next: undefined,
  });
}

export async function updateSoftwareProduct(
  id: string,
  payload: Partial<SoftwareProduct>,
  token: string
): Promise<SoftwareProduct> {
  return apiFetch<SoftwareProduct>(`/software/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
    next: undefined,
  });
}

export async function deleteSoftwareProduct(
  id: string,
  token: string
): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/software/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
    next: undefined,
  });
}

// ── Contact Messages ──────────────────────────────────────────────────

export interface ContactMessage {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export async function submitContactMessage(payload: {
  full_name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}): Promise<ContactMessage> {
  return apiFetch<ContactMessage>("/contact-messages", {
    method: "POST",
    body: JSON.stringify(payload),
    cache: "no-store",
  });
}

export async function getContactMessages(token: string): Promise<ContactMessage[]> {
  return apiFetch<ContactMessage[]>("/contact-messages", {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });
}

export async function deleteContactMessage(id: string, token: string): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/contact-messages/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });
}


export async function registerUser(payload: any): Promise<any> {
  return apiFetch<any>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
    cache: "no-store",
  });
}


export async function forgotPassword(email: string): Promise<{ status: string; message: string }> {
  return apiFetch<{ status: string; message: string }>("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
    cache: "no-store",
  });
}


export async function resetPassword(token: string, password: string): Promise<{ status: string; message: string }> {
  return apiFetch<{ status: string; message: string }>("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ token, password }),
    cache: "no-store",
  });
}


