export interface Project {
  id: string;
  title: string;
  tagline: string;
  description: string;
  type: string;
  url: string;
  image: string;
  featured: boolean;
  status: "active" | "in-development" | "archived";
  technologies: string[];
  techStackCategories: {
    category: string;
    items: string[];
  }[];
  links: {
    label: string;
    url: string;
    type?: "primary" | "secondary" | "telegram" | "github";
  }[];
  highlights: string[];
}

export const PROJECTS: Project[] = [
  {
    id: "unrollit",
    title: "unrollit.xyz",
    tagline: "Unroll any social post in seconds",
    description:
      "Paste any Twitter / X, TikTok, and Bluesky link. unrollit.xyz expands the full thread and lets you download media in one click.",
    type: "Full-Stack SaaS & Social Media Archiving Tool",
    url: "https://unrollit.xyz",
    image: "/projects/unrollit.png",
    featured: true,
    status: "active",
    technologies: [
      "TanStack Start",
      "Hono",
      "Alchemy",
      "Cloudflare Workers",
      "Appwrite",
      "Go",
      "Coolify",
      "Turso",
      "Upstash Redis",
      "Doppler",
      "Telegram Bot",
      "GitHub",
    ],
    techStackCategories: [
      {
        category: "Frontend",
        items: ["TanStack Start", "TypeScript", "Tailwind CSS"],
      },
      {
        category: "Backend & Edge",
        items: ["Hono", "Cloudflare Workers (KV, R2, Workflows, Queues, Cache)"],
      },
      {
        category: "Infrastructure as Code",
        items: ["Alchemy (alchemy.dev)"],
      },
      {
        category: "Storage & Serverless",
        items: ["Appwrite (Storage & Server Functions)"],
      },
      {
        category: "Proxy & Hosting",
        items: ["Go Reverse Proxy", "Self-hosted Coolify"],
      },
      {
        category: "Data & Cache",
        items: ["Turso (libSQL)", "Upstash Redis"],
      },
      {
        category: "Security & Bots",
        items: ["Doppler (Secrets)", "Telegram Bots (@UnrollItBot, @unrollit_bot)"],
      },
    ],
    links: [
      {
        label: "Visit unrollit.xyz",
        url: "https://unrollit.xyz",
        type: "primary",
      },
      {
        label: "@UnrollItBot on Telegram",
        url: "https://t.me/UnrollItBot",
        type: "telegram",
      },
      {
        label: "@unrollit_bot on Telegram",
        url: "https://t.me/unrollit_bot",
        type: "telegram",
      },
    ],
    highlights: [
      "Multi-platform thread unrolling for Twitter/X, TikTok, and Bluesky posts.",
      "High-speed one-click media downloader preserving original audio and video quality.",
      "Dual access interface: web application + frictionless Telegram bots.",
      "Edge-native execution on Cloudflare Workers deployed automatically via Alchemy IaC.",
      "Distributed libSQL database on Turso paired with Upstash Redis for sub-second responses.",
    ],
  },
];

export function getFeaturedProject(): Project {
  return PROJECTS.find((p) => p.featured) ?? PROJECTS[0];
}

export function getProjectById(id: string): Project | undefined {
  return PROJECTS.find((p) => p.id === id);
}

export interface StatusDisplay {
  label: string;
  colorClass: string;
  dotClass: string;
  pulse: boolean;
}

export function getStatusDisplay(status: Project["status"]): StatusDisplay {
  switch (status) {
    case "active":
      return {
        label: "Active",
        colorClass: "text-primary",
        dotClass: "bg-primary",
        pulse: true,
      };
    case "in-development":
      return {
        label: "In Development",
        colorClass: "text-text-secondary",
        dotClass: "bg-text-secondary",
        pulse: true,
      };
    case "archived":
      return {
        label: "Archived",
        colorClass: "text-text-secondary",
        dotClass: "bg-text-secondary/50",
        pulse: false,
      };
  }
}
