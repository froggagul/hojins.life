# hojins.life

Hojin Jung’s personal writing and academic website, built with Astro, TypeScript, and plain CSS. The site generates static HTML for two retained posts, publications, projects, the CV summary, series, tags, and search. The `recap` series contains the RecSys retrospective (episode 1) and CoRL retrospective (episode 2). The existing visual design and collapsed recent-writing section are retained.

## Local development

Use Node.js **24.21.0** (`.nvmrc`) and npm 11.

```sh
npm ci
npx playwright install chromium --only-shell
npm run dev
```

Open the printed URL, normally `http://localhost:4321`.

```sh
npm run check            # Astro and TypeScript
npm run test:content     # Isolated build: drafts, standalone posts, tags, series order
npm run test:dev         # Desktop and mobile browser checks against development
npm run build           # Static output in dist/
npm run check:build     # Every generated page, local link, anchor, image, feed, and CV
npm test                # Desktop and mobile browser checks against dist/
npm run preview         # Serve dist/ locally
npm run check:migration # Retained content integrity audit against the recorded hashes
```

The migration audit preserves the original body and media hashes for the retained imports, with current paths and series metadata. Intentional edits to an imported article will change its hash; it is separate from publishing checks so ordinary writing edits remain possible. Build and browser checks use the current content instead of fixed post counts.

Astro 7 may start a background development server when run by an agent. Use `npx astro dev stop` to stop it; foreground sessions stop with Ctrl+C. Browser tests use `--ignore-lock` to start their own foreground servers on ports 4331 (development) and 4332 (production), so they cannot accidentally reuse a stale preview.

## Write a post

Create a Markdown file anywhere under `src/content/blog/`, with media beside it. Only title, date, and URL are required:

```yaml
---
title: "A new post"
date: "2026-10-14"
url: /posts/a-new-post/
---
```

Write the body below the frontmatter. Keep `url` stable when renaming a file or changing its title. URLs must start with `/posts/`, end with `/`, and contain readable, unencoded path segments. Korean and spaces are supported.

Optional frontmatter:

```yaml
description: "A short description for search engines and RSS."
language: ko              # ko or en; the site defaults to en
tags: [연구, robotics]
series: recap
order: 3                  # Required with series; unique within that series
updated: "2026-10-15"
draft: true
```

Tags connect topics; series determine reading order. Neither is required. One chronological archive contains all writing. Series and tag pages are generated automatically. Episode numbers may have gaps: previous/next navigation uses the published reading order. `draft: true` excludes a post from page routes, the homepage, archive, series, tags, search, RSS, and sitemap in both development and production.

Use ordinary Markdown for images and fenced code blocks. Astro optimizes local images to WebP; image-only paragraphs become figures, with the original alt text also shown as a caption. Supply meaningful alt text when adding images. Shiki highlights code at build time. Use `$...$` and `$$...$$` for inline and display math. Long code and display equations scroll independently and can be focused with a keyboard.

The original video syntax is supported:

```text
`youtube:https://www.youtube.com/watch?v=Q0xvVgKJxfs`
```

An embed loads only after its button is activated. A normal YouTube link remains available without JavaScript. Watch, short, and embed URLs are supported; invalid URLs remain readable code. Markdown does not need MDX for any migrated content. Add MDX only when an article needs interactive components.

To publish, commit and push to `main` after the one-time [GitHub Pages setup](docs/deployment.md). Content-only pushes use the same verification and automatic deployment workflow.

## Projects

`src/data/projects.json` is the single source for the homepage Projects section, `/projects/`, individual project pages, and search. Each entry has a stable lowercase `id` (used in `/projects/<id>/`), `title`, `year`, `status`, a short `description`, and an `overview` array of plain-text paragraphs. Set `selected: true` to include it on the homepage. Entries are validated by the Astro content collection and sorted newest first.

DOLSOE starts with a short overview based on the local project’s README and October 14, 2026 experiment notes. It describes ongoing simulation and control work without claiming hardware or locomotion success. Edit this entry as the project develops; no media or external project links are required.

## Publications and CV

- `src/data/publications.json` is the single publication source. Preserve author order and status (`published`, `accepted`, or `preprint`). Set `selected: true` for homepage selections. Links use `label` and `url`; `relatedPost` is a local `/posts/.../` path. Optional thumbnails are also defined here.
- `src/data/profile.json` holds the introduction, contact links, education, and experience. The October 14, 2026 updates record the Engineer role at Ludo Robotics from October 2026, ROBROS ending October 2, and KAIST graduation in August 2026. No post-graduation KAIST appointment is inferred.
- `public/cv.pdf` is the original supplied PDF, retrieved October 14, 2026. **It predates those updates.** The CV page labels this discrepancy. Replace it with an updated full CV, then remove `cvNote` from `profile.json`. The shared HTML facts already reflect the explicit updates.

Publication and profile structures are validated during checks/builds. Update the PDF, profile facts, and relevant publications together for future CV changes.

## Implementation

- `src/content.config.ts`: Markdown blog, publication, and project schemas.
- `src/lib/content.ts`: public posts, series order, profile validation, date formatting, metadata excerpts.
- `src/pages/posts/[...path].astro`: stable post URLs, metadata, series contents, and previous/next navigation.
- `src/styles/global.css`, `src/styles/post.css`: shared design and readable articles.
- `src/lib/remark-content.mjs`: legacy video syntax, captions, and keyboard-accessible overflow.
- `src/pages/search.astro`, `src/lib/search.ts`: a static HTML search index and small TypeScript filter using `hangul-js`. Search covers titles, tags, series, publication titles/authors, and project titles/descriptions/overviews. Korean decomposition and 초성 matching are preserved. No external search service is used.
- `src/layouts/Layout.astro`: shared navigation, metadata, RSS discovery, and search shortcut. **Ctrl+K / ⌘K** opens search or selects the existing query.
- `src/pages/rss.xml.ts`: chronological RSS with descriptions and canonical post links.
- `astro.config.mjs`: static output, remark/KaTeX/Shiki rendering, sitemap, and legacy about-page redirect.
- `.github/workflows/deploy.yml`: checks every PR to `main`; verifies and deploys pushes to `main` and supports manual runs.

Fonts are self-hosted Inter and Noto Sans KR. Article pages and ordinary links work without JavaScript. The search page falls back to a complete browsable index.

The NeuralSVCD thumbnail combines three original project demos into a 20-second loop. Clip sources and timestamps are recorded in `publications.json`. A CSS control switches to a still image; reduced-motion users receive the still by default.

See [migration notes](docs/migration.md) for provenance, original URLs, preserved hashes, metadata mapping, and old-domain limitations.
