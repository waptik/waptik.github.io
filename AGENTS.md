# Agent Guidelines & Rules (`AGENTS.md`)

This file defines guidelines, conventions, commands, and rules for AI agents and developers working on **waptik.github.io**.

---

## Development

When starting the dev server, use background mode:

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

- **Current Design System is Preserved**:
  - The site's established design system, typography (`Merriweather` serif, `Fira Sans` sans-serif, `SF Mono` monospace), color palette (`#548e9b` primary, light/dark `#202122` mode), and overall identity remain intact.
  - Do NOT replace the current visual aesthetic or color palette with external palettes unless explicitly requested.
- **Sumi Feature Integration**:
  - We adopt powerful functional features inspired by Sumi (paginated archives, tag directory & tag archives, sticky depth 2–3 Table of Contents, adjacent post navigation, build-time Satori OpenGraph cards, `llms.txt`, and dynamic `robots.txt`), seamlessly integrated into our existing design system.
- **Styling Rule (STRICT)**:
  - **Always style with Tailwind CSS (v4)**.
  - Use Tailwind utility classes directly in Astro components (`text-primary`, `bg-background-body`, `text-text-main`, `text-text-secondary`, `font-serif`, `font-sans`, `font-mono`, etc.).

---

## STRICT RULES: What To Do vs. What NOT To Do

### Styling & CSS Architecture

#### ✅ WHAT TO DO
- **Style exclusively with Tailwind CSS (v4)**.
- Use existing design tokens configured in `src/styles/tailwind.css`:
  - `bg-background-body` / `text-text-main` / `text-text-secondary` / `text-primary`
  - `font-sans` (`Fira Sans`), `font-serif` (`Merriweather`), `font-mono` (`SF Mono`)
  - Dark mode variant: `@custom-variant dark (&:where(.theme-dark, .theme-dark *));`
- Build new components (e.g. Table of Contents, Pagination, PostNav, Tag chips) to match the existing aesthetic, typography, and borders using Tailwind utilities.

#### ❌ WHAT NOT TO DO
- **DO NOT** replace or wipe out the existing design system tokens in `src/styles/tailwind.css`.
- **DO NOT** write un-scoped raw CSS files or heavy component `<style>` blocks when Tailwind utilities apply.
- **DO NOT** use Tailwind v3 directives (like `@apply` inside `@tailwind base;`). This project uses Tailwind CSS v4 with `@import "tailwindcss";`.
- **DO NOT** introduce CSS modules or CSS-in-JS libraries.

---

### Client-Side JavaScript & Performance

#### ✅ WHAT TO DO
- **Keep article pages lightweight and performant**. Static HTML for prose rendering, table of contents, and metadata.
- Retain the fast anti-FOUC theme toggle script in `BaseHead` or navigation.
- Ensure any interactive elements (TOC scroll tracking or theme toggling) are lightweight, accessible, and error-resilient.

#### ❌ WHAT NOT TO DO
- **DO NOT** add React, Vue, Svelte, or other client UI framework islands unless explicitly requested.
- **DO NOT** add external client tracking libraries or heavy animation bundles.

---

### Content Collections & Schema

#### ✅ WHAT TO DO
- Keep post content in `src/content/blog/` as `.md` or `.mdx`.
- Ensure files starting with an underscore (`_draft.md`) are ignored by loaders.
- In `src/content.config.ts`, gracefully support both image asset imports and existing string paths for `heroImage`:
  ```ts
  heroImage: z.union([z.string(), image()]).optional(),
  heroImageAlt: z.string().optional(),
  ```
- Filter out drafts (`data.draft === true`) from production builds while keeping them visible in `astro dev`.

#### ❌ WHAT NOT TO DO
- **DO NOT** break existing frontmatter in published posts (e.g., existing `heroImage` string paths like `"/blog-placeholder-3.jpg"`).
- **DO NOT** make optional fields mandatory without fallbacks.

---

### Navigation, SEO & Endpoints

#### ✅ WHAT TO DO
- Provide structured data (`schema.org` JSON-LD) for `WebSite` and `BlogPosting`.
- Generate per-post Open Graph images at build time using `satori` and `@resvg/resvg-js` styled with our site's typography and color palette.
- Provide `llms.txt` ([llmstxt.org](https://llmstxt.org)) and `robots.txt` dynamic endpoints.
- Support paginated archives for both `/blog/` and `/tags/[tag]/` with accessible `<nav>` elements and clean page numbering.

#### ❌ WHAT NOT TO DO
- **DO NOT** hardcode domain names in internal links or canonical tags; always read from `SITE.url` in `src/config.ts`.
- **DO NOT** emit broken or unescaped JSON in JSON-LD scripts.

---

## Standard Verification Commands

Before concluding any work or committing changes, verify the codebase with:

```bash
# 1. Type check all Astro components and TypeScript files
pnpm run check

# 2. Production build verification (verifies routes, collections, OG rendering)
pnpm run build

# 3. Local dev inspection
pnpm run dev
```
