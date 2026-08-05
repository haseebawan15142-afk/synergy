import type { ContentStatus, TimestampLike } from "@/lib/firebase/collections";

export type MediaAsset = {
  id?: string;
  name: string;
  url: string;
  path: string;
  folder: string;
  contentType: string;
  size: number;
  width?: number;
  height?: number;
  alt?: string;
  createdAt?: TimestampLike;
  updatedAt?: TimestampLike;
  createdBy?: string;
};

export type BlogDoc = {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  bodyHtml: string;
  bodyMarkdown?: string;
  category: string;
  tags: string[];
  featuredImageUrl?: string;
  galleryUrls?: string[];
  author: string;
  status: ContentStatus | "scheduled";
  publishedAt?: string | null;
  scheduledAt?: string | null;
  seoTitle?: string;
  seoDescription?: string;
  relatedServiceSlug?: string;
  relatedBlogIds?: string[];
  readingTime?: number;
  views?: number;
  featured?: boolean;
  active?: boolean;
  createdAt?: TimestampLike;
  updatedAt?: TimestampLike;
  createdBy?: string;
  updatedBy?: string;
};

export type LeadershipDoc = {
  id?: string;
  name: string;
  designation: string;
  department?: string;
  bio: string;
  photoUrl?: string;
  linkedin?: string;
  email?: string;
  phone?: string;
  sortOrder: number;
  featured: boolean;
  active: boolean;
  createdAt?: TimestampLike;
  updatedAt?: TimestampLike;
};

export type AlumniDoc = {
  id?: string;
  name: string;
  imageUrl?: string;
  batch?: string;
  department?: string;
  designation?: string;
  company?: string;
  linkedin?: string;
  bio?: string;
  achievements?: string;
  featured: boolean;
  sortOrder: number;
  active: boolean;
  createdAt?: TimestampLike;
  updatedAt?: TimestampLike;
};

export type ServiceDoc = {
  id?: string;
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  icon?: string;
  bannerUrl?: string;
  imageUrl?: string;
  category?: string;
  seoTitle?: string;
  seoDescription?: string;
  sortOrder: number;
  featured: boolean;
  status: ContentStatus;
  active: boolean;
  createdAt?: TimestampLike;
  updatedAt?: TimestampLike;
};

export type TestimonialDoc = {
  id?: string;
  name: string;
  company?: string;
  designation?: string;
  review: string;
  rating: number;
  photoUrl?: string;
  featured: boolean;
  active: boolean;
  sortOrder: number;
  createdAt?: TimestampLike;
  updatedAt?: TimestampLike;
};

export type ClientDoc = {
  id?: string;
  name: string;
  logoUrl?: string;
  website?: string;
  category?: string;
  sortOrder: number;
  featured: boolean;
  active: boolean;
  createdAt?: TimestampLike;
  updatedAt?: TimestampLike;
};

export type GalleryItemDoc = {
  id?: string;
  albumId?: string;
  title?: string;
  imageUrl: string;
  alt?: string;
  sortOrder: number;
  active: boolean;
  createdAt?: TimestampLike;
  updatedAt?: TimestampLike;
};

export type GalleryAlbumDoc = {
  id?: string;
  title: string;
  description?: string;
  coverUrl?: string;
  sortOrder: number;
  active: boolean;
  createdAt?: TimestampLike;
  updatedAt?: TimestampLike;
};

export type CareerDoc = {
  id?: string;
  title: string;
  slug: string;
  department: string;
  location: string;
  type: "Full-time" | "Internship" | "Contract";
  salary?: string;
  experience?: string;
  skills: string[];
  description: string;
  status: "open" | "closed" | "draft";
  sortOrder?: number;
  active: boolean;
  createdAt?: TimestampLike;
  updatedAt?: TimestampLike;
};

export type EventDoc = {
  id?: string;
  title: string;
  slug: string;
  bannerUrl?: string;
  date: string;
  location: string;
  description: string;
  registrationLink?: string;
  galleryUrls?: string[];
  status: ContentStatus;
  active: boolean;
  createdAt?: TimestampLike;
  updatedAt?: TimestampLike;
};

export type FaqDoc = {
  id?: string;
  question: string;
  answer: string;
  category: string;
  sortOrder: number;
  active: boolean;
  createdAt?: TimestampLike;
  updatedAt?: TimestampLike;
};

export type NewsletterDoc = {
  id?: string;
  email: string;
  name?: string;
  status: "active" | "unsubscribed";
  createdAt?: TimestampLike;
};

export type NavItemDoc = {
  id: string;
  label: string;
  href: string;
  external?: boolean;
  hidden?: boolean;
  children?: NavItemDoc[];
};

export type ThemeTokens = {
  primary: string;
  secondary: string;
  accent: string;
  text: string;
  textMuted: string;
  buttonBg: string;
  buttonText: string;
  background: string;
  surface: string;
  border: string;
  borderRadius: string;
  shadow: string;
  fontFamily: string;
  fontSizeBase: string;
  containerWidth: string;
  spacing: string;
  animationsEnabled: boolean;
  darkModeDefault: "system" | "light" | "dark";
};

export type SeoPageDoc = {
  id?: string;
  pageId: string;
  title: string;
  description: string;
  keywords?: string;
  robots?: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterCard?: string;
  jsonLd?: string;
  updatedAt?: TimestampLike;
};

export const DEFAULT_THEME: ThemeTokens = {
  primary: "#0f766e",
  secondary: "#134e4a",
  accent: "#f59e0b",
  text: "#0f172a",
  textMuted: "#64748b",
  buttonBg: "#0f766e",
  buttonText: "#ffffff",
  background: "#f8fafc",
  surface: "#ffffff",
  border: "#e2e8f0",
  borderRadius: "0.75rem",
  shadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
  fontFamily: "Inter, system-ui, sans-serif",
  fontSizeBase: "16px",
  containerWidth: "80rem",
  spacing: "1rem",
  animationsEnabled: true,
  darkModeDefault: "system",
};

export const MEDIA_FOLDERS = [
  "logos",
  "blogs",
  "leadership",
  "services",
  "gallery",
  "events",
  "careers",
  "clients",
  "testimonials",
  "hero",
  "seo",
  "general",
] as const;

export type MediaFolder = (typeof MEDIA_FOLDERS)[number];
