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

export type SocialPlatform =
  | "github"
  | "twitter"
  | "bluesky"
  | "telegram"
  | "youtube"
  | "linkedin"
  | "email"
  | "rss";

export interface SocialLink {
  platform: SocialPlatform;
  /** Shown as the link text, so keep it short. */
  label: string;
  href: string;
  /** Profile username/handle shown in detailed lists. */
  handle?: string;
}

/** Check if a string matches a given social platform (case-insensitive). */
export const isPlatform = (val: string, platform: SocialPlatform): boolean => {
  const v = val.toLowerCase();
  if (platform === "twitter") return v === "twitter" || v === "x";
  return v === platform;
};

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
  defaultOgImage: "/og-default.png",
} as const;

export const AUTHOR = {
  name: "Stephane Mensah",
  role: "Software Engineer & Writer",
  url: "https://waptik.xyz",
  twitter: "@_waptik",
  /** Path to author avatar image, relative to public/. */
  avatar: "/avatar.jpg",
  /** One or two sentences. Shown on /about and in structured data. */
  bio:
    "Developer and writer passionate about building things on the web. I write about software development, tools, and technology trends.",
} as const;

export const NAV: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Projects", href: "/projects" },
  { label: "Blog", href: "/blog" },
  { label: "About", href: "/about" },
  { label: "Uses", href: "/uses" },
  { label: "Tags", href: "/tags" },
];

export const SOCIAL: SocialLink[] = [
  {
    platform: "github",
    label: "GitHub",
    href: "https://github.com/waptik",
    handle: "waptik",
  },
  {
    platform: "twitter",
    label: "Twitter",
    href: "https://twitter.com/_waptik",
    handle: "@_waptik",
  },
  {
    platform: "bluesky",
    label: "Bluesky",
    href: "https://bsky.app/profile/waptik.xyz",
    handle: "waptik.xyz",
  },
  {
    platform: "telegram",
    label: "Telegram",
    href: "https://t.me/waptik",
    handle: "@waptik",
  },
  {
    platform: "youtube",
    label: "YouTube",
    href: "https://youtube.com/@_waptik",
    handle: "@_waptik",
  },
  {
    platform: "linkedin",
    label: "LinkedIn",
    href: "https://linkedin.com/in/waptik",
    handle: "waptik",
  },
];

export const BLOG = {
  /** Posts per page on /blog and the tag archives. */
  postsPerPage: 6,
  /** Latest posts shown on the home page. */
  postsOnHome: 4,
  /** Estimated reading speed used for the "N min read" label. */
  wordsPerMinute: 200,
  showReadingTime: true,
  /** Render the table of contents on article pages. */
  showTableOfContents: true,
  /** Minimum number of headings before the table of contents appears. */
  tocMinHeadings: 3,
} as const;

/** Generate a per-article OG image at build time with satori. */
export const OG = {
  enabled: true,
  width: 1200,
  height: 630,
} as const;

