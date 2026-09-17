/**
 * Site configuration
 *
 * This is the central configuration file for the site. All site metadata,
 * author information, navigation, and social links are defined here.
 */

export interface NavItem {
  label: string;
  href: string;
}

export interface SocialLink {
  /** Shown as the link text, so keep it short. */
  label: string;
  href: string;
}

export const SITE = {
  /** Absolute origin of the deployed site. No trailing slash. */
  url: "https://waptik.xyz",
  title: "Stephane Mensah",
  tagline: "Developer and writer sharing thoughts on technology and life",
  description: "Developer and writer sharing thoughts on technology and life",
  /** BCP 47 language tag, written to <html lang>. */
  lang: "en",
  /** Used for og:locale. */
  locale: "en_US",
  /** Fallback OG image, relative to public/. Used for pages without one. */
  defaultOgImage: "/avatar.jpg",
} as const;

export const AUTHOR = {
  name: "Stephane Mensah",
  url: "https://waptik.xyz",
  /** Path to author avatar image, relative to public/. */
  avatar: "/avatar.jpg",
  /** One or two sentences. Shown on /about and in structured data. */
  bio:
    "Developer and writer passionate about building things on the web. I write about software development, tools, and technology trends.",
} as const;

export const NAV: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Blog", href: "/blog" },
];

export const SOCIAL: SocialLink[] = [
  { label: "GitHub", href: "https://github.com/waptik" },
  { label: "Twitter", href: "https://twitter.com/_waptik" },
  { label: "Bluesky", href: "https://bsky.app/profile/waptik.xyz" },
  { label: "YouTube", href: "https://youtube.com/@_waptik" },
  { label: "LinkedIn", href: "https://linkedin.com/in/waptik" },
];

export const BLOG = {
  /** Posts per page on /blog. */
  postsPerPage: 10,
  /** Latest posts shown on the home page. */
  postsOnHome: 5,
  /** Estimated reading speed used for the "N min read" label. */
  wordsPerMinute: 200,
  showReadingTime: false,
} as const;
