# Agent Guidelines & Rules (`AGENTS.md`)

This file defines guidelines, conventions, commands, and rules for AI agents and developers working on **waptik.github.io**.

---

## Development & Server Constraints

- **Do NOT launch dev server or browser sessions unless explicitly requested by the user.**
- When explicitly instructed to start the dev server, use background mode:

```bash
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

---

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)

---

## Core Principles & Philosophy

- **Monochromatic Neutral-Grey Design System**:
  - The site uses an elegant, neutral-grey monochromatic palette (`Merriweather` serif, `Fira Sans` sans-serif, `SF Mono` monospace) defined via OKLCH tokens in `src/styles/tailwind.css`.
  - Design tokens: `bg-background-body`, `text-text-main`, `text-text-secondary`, `text-primary`, `border-border`, and `bg-border`.
  - Preserve this palette; do NOT introduce external colors or legacy teal/emerald tones.
- **Sumi Feature Integration**:
  - Paginated archives, tag directory & tag archives, sticky depth 2–3 Table of Contents, adjacent post navigation, build-time Satori OpenGraph cards, `llms.txt`, and dynamic `robots.txt`, seamlessly integrated into our design system.
- **Styling Rule (STRICT)**:
  - **Always style with Tailwind CSS (v4)** using `@import "tailwindcss";`.
  - Use Tailwind utility classes directly in Astro components (`text-primary`, `bg-background-body`, `text-text-main`, `text-text-secondary`, `border-border`, `font-serif`, `font-sans`, `font-mono`).

---

## STRICT RULES: What To Do vs. What NOT To Do

### Styling & Button Architecture

#### ✅ WHAT TO DO
- **Style exclusively with Tailwind CSS (v4)**.
- Use existing design tokens configured in `src/styles/tailwind.css`:
  - `bg-background-body` / `text-text-main` / `text-text-secondary` / `text-primary` / `border-border`
  - Dark mode variant: `@custom-variant dark (&:where(.theme-dark, .theme-dark *));`
- **Solid Primary Buttons in Dark Mode**:
  - When creating solid primary CTA buttons, ensure high-contrast readability in both light and dark themes using:
    `bg-primary text-white dark:bg-text-main dark:text-background-body hover:bg-primary/90 dark:hover:bg-text-main/90`
  - Outline/ghost buttons should use `border border-border text-text-main hover:bg-border/60`.

#### ❌ WHAT NOT TO DO
- **DO NOT** use `bg-primary text-white` without dark mode text/bg adjustments, as `--primary-color` has high lightness in dark mode and causes unreadable low contrast.
- **DO NOT** use hardcoded opacity hacks like `border-black/10 dark:border-white/10`; always use `border-border` and `bg-border/5`.
- **DO NOT** replace or wipe out the existing design system tokens in `src/styles/tailwind.css`.
- **DO NOT** write un-scoped raw CSS files or heavy component `<style>` blocks when Tailwind utilities apply.
- **DO NOT** use Tailwind v3 directives (`@apply` inside `@tailwind base;`).

---

### Component Modularization & Icons

#### ✅ WHAT TO DO
- Keep SVG icons modularized as dedicated components in `src/components/icons/` (`Github.astro`, `Twitter.astro`, `Bluesky.astro`, `Telegram.astro`, `Youtube.astro`, `Linkedin.astro`, `Email.astro`, `Rss.astro`).
- Re-export icons from `src/components/icons/index.ts`.
- `SocialIcon.astro` delegates to these modular components for platform rendering.

#### ❌ WHAT NOT TO DO
- **DO NOT** paste massive inline SVGs or multi-path data blobs into layouts or widgets.

---

### Content Collections & Schema

#### ✅ WHAT TO DO
- Keep post content in `src/content/blog/` as `.md` or `.mdx`.
- Ensure files starting with an underscore (`_draft.md`) are ignored by loaders.
- **Drafts Default to True**:
  - In `src/content.config.ts`, `draft` defaults to `true`:
    ```ts
    draft: z.boolean().default(true),
    ```
  - Published posts **must explicitly declare `draft: false`** in their frontmatter.
  - In production builds (`import.meta.env.PROD`), drafts are filtered out while remaining visible in dev mode.
- In `src/content.config.ts`, gracefully support both image asset imports and existing string paths for `heroImage`:
  ```ts
  heroImage: z.union([z.string(), image()]).optional(),
  heroImageAlt: z.string().optional(),
  ```

#### ❌ WHAT NOT TO DO
- **DO NOT** break existing frontmatter in published posts (e.g., existing `heroImage` string paths like `"/blog-placeholder-3.jpg"`).
- **DO NOT** omit `draft: false` when creating or maintaining published articles.

---

### Navigation, SEO & Endpoints

#### ✅ WHAT TO DO
- **Typed SEO Component (`src/components/Seo.astro`)**:
  - Use the typed `<Seo />` component for managing title, description, canonical, robots directives, OpenGraph, Twitter cards, and structured JSON-LD (`schema.org`).
  - `BaseHead.astro` implements and coordinates `<Seo />` while managing site infrastructure (fonts, favicons, RSS, sitemap, theme color, anti-FOUC script).
  - `BaseLayout.astro` accepts an optional `seo?: Partial<SeoProps>` to allow granular page-level SEO overrides.
- Generate per-post Open Graph images at build time using `satori` and `@resvg/resvg-js` styled with our site's typography and color palette.
- Provide `llms.txt` ([llmstxt.org](https://llmstxt.org)) and `robots.txt` dynamic endpoints.
- Support paginated archives for both `/blog/` and `/tags/[tag]/` with accessible `<nav>` elements and clean page numbering.

#### ❌ WHAT NOT TO DO
- **DO NOT** hardcode domain names in internal links or canonical tags; always read from `SITE.url` in `src/config.ts`.
- **DO NOT** emit broken or unescaped JSON in JSON-LD scripts.

---

### Sidebar, Recent & Related Posts Architecture

#### ✅ WHAT TO DO
- **Index Sidebar ("Other Posts")**:
  - The home page sidebar renders an "Other Posts" widget via `Sidebar.astro` containing posts that are not already featured in the main recent articles list.
- **Blog Post Sidebar ("Related Posts")**:
  - Blog post pages render a "Related Posts" widget (calculated via `getRelatedPosts(post)` in `src/utils/posts.ts` based on tag intersection, falling back to recent posts) in the desktop sidebar below Table of Contents and in the mobile footer area.
- **Full-Height Sidebar Divider Line**:
  - Two-column layouts use `flex flex-col lg:flex-row gap-8 lg:gap-12` **without `items-start`** so the sidebar stretches to the full height of the main content column.
  - The `<aside>` uses `self-stretch lg:border-l lg:border-border lg:pl-8 xl:pl-12`, ensuring the vertical divider line runs the entire height of the content area (matching Chris Pennington's layout).
  - Inside the `<aside>`, wrap widgets in `<div class="sticky top-8 flex flex-col gap-8">` so sidebar items remain comfortably in view as users scroll.
- **RecentPostsWidget**:
  - Keep `RecentPostsWidget` focused on article titles and publication dates; do NOT include a "View all" link in the widget header.

#### ❌ WHAT NOT TO DO
- **DO NOT** use `items-start` on two-column sidebar containers, as it breaks full-height vertical divider borders.
- **DO NOT** hardcode duplicate post IDs or render posts in the index sidebar that are already in the main feed.
- **DO NOT** add redundant "View all" links to `RecentPostsWidget`.

### Image Rendering & Assets Architecture

#### ✅ WHAT TO DO
- **Always use Astro's `<Image />` component** from `astro:assets` (`import { Image } from "astro:assets";`) when rendering images across all Astro pages and components.
- Specify explicit `width`, `height`, and `alt` attributes to prevent Cumulative Layout Shift (CLS) and leverage Astro's image optimization pipeline.

#### ❌ WHAT NOT TO DO
- **DO NOT** use raw HTML `<img>` tags in `.astro` components.

---

## Standard Verification Commands (When Instructed)

When explicitly running checks or verifying changes:

```bash
# 1. Type check all Astro components and TypeScript files
pnpm run check

# 2. Production build verification (verifies routes, collections, OG rendering)
pnpm run build
```
