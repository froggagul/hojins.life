# HOJINS.LIFE

## Goal

Build one website that represents Hojin Jung (정호진): personal writing, academic work, and the experiences connecting them. Visitors should be able to understand who I am, read my writing, find my publications, and access my CV.

- Give personal writing and academic work meaningful space on the same site.
- Use a shared identity, layout, and navigation across all pages.
- Keep it simple and stupid. Make the site easy to read, write for, and maintain.

## Core pages and navigation

Use straightforward labels: Home, Blog, Publications, and CV. Keep search easy to reach from every page.

- **Home:** A brief, factual introduction; current research interests; recent blog posts; selected publications; and relevant contact/profile links. Give visitors clear paths to both writing and academic work.
- **Blog:** One chronological archive for personal essays, diaries, research notes, technical explanations, and project write-ups. Support browsing by tags and series.
- **Post:** Show the title, publication date, tags, and series when present. Include a series contents list and previous/next links within that series. Support standalone posts equally well.
- **Publications:** List publications by year, newest first, with title, authors in their original order, venue, year, and available paper, code, project, or video links. Highlight my name and link related blog posts when available.
- **CV:** A concise HTML summary of education, research, and work experience, plus an easy-to-find PDF link. Keep shared facts consistent with the introduction and publications.
- **Search:** Search blog titles, tags, series, and publication titles/authors at minimum. Clearly identify result types, provide working destination links, and handle empty queries and no matches.

## Writing and content organization

- Keep one blog collection. Use tags to connect topics across personal and academic writing; do not force every post into an exclusive personal/academic category.
- Tags describe topics. Series group related posts in an explicit reading order. A post may have multiple tags and may belong to a series, but neither is required to publish a standalone post.
- Preserve Korean and English content in its original language. Support mixed-language titles and text in layout and search. Do not translate or rewrite existing posts unless requested.
- Keep posts in Markdown with colocated media where practical. Use MDX only when a post needs interactive content.
- Keep metadata small: title, date, and a stable URL are essential; tags, series/order, description, language, and updated date are optional. Preserve existing metadata during migration or map it explicitly.
- Support the formats already used in the source blogs: images, code blocks, inline/display math, and video embeds. Long code and equations must remain usable on mobile.
- Store publication data once and reuse it for the full list and homepage selections. Avoid maintaining duplicate entries in page components.
- If drafts are supported, exclude them from public pages, search, feeds, and sitemaps.

## Voice and factual accuracy

- Write clearly and concisely. Use first person where appropriate and preserve the voice of existing writing.
- Use concrete descriptions and ordinary labels. Avoid generic AI copy, slogans, inflated claims, and decorative synonyms. Do not write phrases such as “GO — One board, infinite possibilities.” A hobby can simply be called “Go.”
- Do not invent biographical details, affiliations, research interests, publications, achievements, dates, links, or personal anecdotes. Avoid filler content and empty “coming soon” sections.
- Use my CV and explicit updates from me for academic facts. Treat older biographies in the source sites as historical references; verify time-sensitive claims before presenting them as current.
- Preserve publication titles, author order, and publication status accurately. Distinguish preprints from accepted or published work when applicable.
- When a necessary fact is missing or sources conflict, flag the uncertainty rather than guessing. Continue work that does not depend on it.

## Visual design and usability

- Favor readable typography, comfortable line lengths, clear hierarchy, and enough whitespace. Make Korean and English text equally comfortable to read.
- Keep the visual language consistent across the blog, publications, and CV. Let actual writing, research, and chosen personal details express personality.
- Prefer simple lists and restrained styling. Add cards, illustrations, or motion only when they serve the content.
- Design for mobile and desktop. Use semantic HTML, sufficient contrast, visible keyboard focus, descriptive links, and meaningful image alt text.
- Search and navigation must work with a keyboard. Keep core content and ordinary links usable without client-side JavaScript.

## Implementation principles

- Inspect the current repository before choosing tools. The reference sites use Gatsby, but that does not require this site to use Gatsby.
- Prefer a static site with content stored in the repository. Choose the smallest stack that supports the requirements; avoid a backend, database, CMS, or external search service without a concrete need.
- Reuse simple components for layout, navigation, post metadata, and publication entries. Avoid abstractions that make everyday content edits harder.
- Keep dependencies and browser JavaScript limited. Optimize images and avoid loading heavy embeds until needed.
- Provide page titles, descriptions, canonical URLs, social previews, a sitemap, and a blog RSS feed. Use real content for metadata.
- Keep adding a post, publication, or CV update straightforward, and document the workflow once implemented.
- Work within the requested task. This document describes the site direction; it does not require implementing every feature during each change.

## Astro stack and conventions

- Use Astro with TypeScript and static output. Generate pages at build time and keep the output deployable to a static host.
- Use reusable `.astro` components and layouts with plain CSS for the shared design. Add client-side JavaScript only for interactions that need it, such as search.
- Use Astro content collections with schemas to validate Markdown frontmatter and structured data. Keep one blog collection with colocated media; add MDX only when a post needs interactive content.
- Store publications and shared biographical facts in JSON files, validate their structure, and reuse them across pages.
- Generate routes from stable content URLs, preserving existing post paths and explicit series order during migration.
- Build a static search index from public content. Use a small TypeScript search module with `hangul-js`, preserving the existing Korean syllable decomposition and 초성 matching while covering blog titles, tags, series, and publication titles/authors.
- Render math at build time with `remark-math` and `rehype-katex`, and highlight code with Shiki. Use Astro's image tooling for supported local images and defer loading video embeds until needed.
- Generate RSS and the sitemap with Astro's supported integrations. Keep page metadata in the shared layout and exclude drafts from all public output.
- Use Node.js LTS and npm, pin a compatible Node.js version, and commit the npm lockfile. Provide scripts for development, production builds, previews, and Astro/TypeScript checks.
- Use Playwright for meaningful browser checks of navigation, search, keyboard interaction, and representative mobile and desktop pages. Verify both local development and the production build when rendering or routing changes.

## GitHub CI/CD and deployment

- Use GitHub Actions for CI/CD, with workflow files stored in `.github/workflows/`, and deploy the generated static site to GitHub Pages. Follow [Astro's GitHub Pages deployment guide](https://docs.astro.build/en/guides/deploy/github/).
- Every push to `main`, including a merged pull request or a content-only commit, must automatically run checks, rebuild the site, and deploy it after successful verification. Routine publishing must require only committing and pushing changes. Also support manual runs with `workflow_dispatch`.
- Run checks and a production build on pull requests targeting `main`; deploy production only from `main`.
- Use the repository's pinned Node.js version and `npm ci`. Run Astro/TypeScript checks and the relevant automated tests, build the site, and deploy the verified build artifact. A failed check or build must leave the published site unchanged.
- Coordinate workflow concurrency so an older run cannot overwrite a newer deployment. Keep build and deployment results visible in GitHub Actions.
- Use `https://www.hojins.life` as the canonical production URL. Set Astro's `site` accordingly, serve the site at the domain root, and use that URL consistently in canonical links, social metadata, RSS, and the sitemap.
- Document the one-time GitHub Pages setup with GitHub Actions as the publishing source, the custom domain `www.hojins.life`, the required DNS records, and HTTPS. Once configured, subsequent pushes must update the live site without manual uploads or deployment steps.

## Migration from the existing sites

- Inspect both local references before migrating content. Treat their directories as sources; make changes in this repository unless asked otherwise.
- Preserve original text, dates, media, internal links, series membership, and episode order. Existing series are derived from folders, with `ep` used for ordering.
- Inventory existing URLs, including `/posts/<series>/<episode>/`. Preserve paths where possible and document redirects for changed paths. Resolve collisions explicitly when combining the two sites.
- Check internal links and media paths after moving content. Preserve RSS and sitemap compatibility where practical.
- Reuse useful content and behavior without carrying over obsolete dependencies, stale biographies, or starter-template filler.

## Verification

- Run the checks available in this repository that are relevant to the change. Once implemented, verify a production build as well as local development behavior for changes affecting rendering or routing.
- For UI changes, check mobile and desktop layouts, keyboard navigation, and representative Korean and English content.
- For content or migration changes, check post links, media, math, series order, publication links, and the CV download as applicable.
- For search changes, check Korean and English queries, clearing the query, no matches, and navigation to results. Preserve the existing Korean search behavior when migrating it.
- Report what changed, what was verified, and any unresolved limitations. Do not claim checks passed unless they were run.

## References

- `../www.hojins.life`: Personal blog; reference for Korean writing, research diaries, series, media, and existing search behavior.
- `../dev.hojins.life`: Academic/technical blog; reference for research writing and math rendering. Its older biography may be outdated.
- [My CV](https://github.com/froggagul/froggagul/blob/main/cv.pdf): Source for academic and career details, subject to newer updates from me.
- [Dongwon Son's website](https://dongwon-son.github.io/): Reference for a clear researcher introduction and publication presentation. Adapt useful patterns while keeping this site's own identity and room for personal writing.
- [Beomjoon Kim's website](https://beomjoonkim.github.io/): Advisor's homepage and reference for a concise academic introduction and publication list.
