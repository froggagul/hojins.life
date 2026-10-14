# Migration record

Initially migrated October 14, 2026 from the two local source repositories, which were left unchanged:

| Source | Posts | Media | Destination |
| --- | ---: | ---: | --- |
| `../www.hojins.life/content/posts/` | 30 | 35 | `src/content/blog/` |
| `../dev.hojins.life/content/posts/` | 1 | 0 | `src/content/blog/math/1.md` |

At the owner's request, 28 personal-blog posts, the DDPM technical article, and 30 unused media files were subsequently removed from this repository. Only the following two posts remain:

| Post | File | URL | Series / order |
| --- | --- | --- | --- |
| Recsys Challenge 2023 | `src/content/blog/recap/1.md` | `/posts/연구 일지/1/` | `recap` / 1 |
| 첫 논문 회고 및 대학원 돌아보기 | `src/content/blog/recap/2.md` | `/posts/연구 일지/5/` | `recap` / 2 |

The five images referenced by the two retrospectives remain colocated in `recap/`. The research series was renamed from `연구 일지` to `recap`, and the CoRL retrospective's order changed from 5 to 2. Both post URLs remain stable. The removed posts are no longer generated or included in archives, search, RSS, or sitemaps; their URLs return 404.

[The machine-readable inventory](migration.json) now records only the retained source files, current destinations and series metadata, old and current URLs, original frontmatter, body hashes, and media hashes. There were no path collisions. Retained article bodies and media are unchanged. `npm run check:migration` verifies their preservation; source repositories are not needed to run it.

## Metadata mapping

- `title` and `date` are retained. Quoted and YAML date values are accepted and rendered as the same calendar day in UTC.
- Folder names initially became explicit `series` values and `ep` became `order`. The requested `recap` rename and renumbering are recorded above; the original `ep` values remain in the inventory's `originalFrontmatter`.
- The original `/posts/<series>/<episode>/` path becomes the explicit `url`. File locations no longer determine public URLs.
- Language values come from the previous preview index: both retained posts use `ko`.
- The latest research post retains its existing preview description.
- Retained topic tags are `recap/1` (`추천 시스템`, `학회`) and `recap/2` (`연구`, `대학원`). No other metadata categories were imposed.
- The temporary `src/data/writing.json` link index was removed. Markdown is now the only source for post metadata and text.

## Rendering exceptions and compatibility

Image captions use the original alt text, matching the Gatsby behavior. Colocated media paths remain valid. Astro generates optimized assets, so generated Gatsby `/static/...` image-cache URLs are not retained; the five referenced original images are preserved in the repository. All retained Markdown links and rendered images are checked in the production output. New writing should supply descriptive alt text.

The removed posts contained the original video embeds, code blocks, and math. Support for `youtube:URL` embeds, highlighted code, and build-time math remains available for future writing and is checked with isolated content fixtures. Embeds load on activation, with a YouTube link available without JavaScript. Long code and equations can scroll without widening the page.

## URL mapping

| Original URL | Result |
| --- | --- |
| `https://www.hojins.life/posts/연구 일지/1/` | Same path and canonical host; `recap` episode 1 |
| `https://www.hojins.life/posts/연구 일지/5/` | Same path and canonical host; `recap` episode 2 |
| Other personal-blog post URLs | Removed; return 404 |
| `/posts/math/1/` | Removed; returns 404 |
| `/series/` | Series index, with dedicated reading-order pages |
| `/series/recap/` | RecSys and CoRL retrospectives, in that order; replaces `/series/연구 일지/` |
| `/?query=<query>` | Browser redirect to `/search/?q=<query>`; ordinary homepage content is available without JavaScript |
| `/about/` | Static redirect and fallback link to `/cv/` |
| `/rss.xml` | Same feed URL, containing the two retained posts; title, date, description, tags/series, and canonical link per entry |
| `/sitemap-index.xml` | Astro sitemap index |
| `/sitemap.xml` and `/sitemap/sitemap-index.xml` | Compatibility indexes pointing to the current sitemap |

RSS uses summaries rather than the previous full HTML bodies. The retained post paths do not need redirects. The public deployment has one canonical domain, `www.hojins.life`, published from `froggagul/hojins.life`. At the owner's request, the old `www.hojins.life` and `dev.hojins.life` repositories' Pages deployments and Gatsby workflows were disabled on October 14, 2026, and the `dev.hojins.life` DNS record was removed without a redirect. Their repositories remain available as historical sources, with their former published output preserved in `retired-gh-pages-2026-10-14` branches. See [deployment notes](deployment.md) for the cutover and rollback details.

## Academic facts

The supplied CV was the original source. Explicit October 14 updates take precedence: KAIST master's graduation in August 2026; ROBROS employment ending October 2, 2026; employment as an Engineer at Ludo Robotics starting in October 2026. The KAIST research entry describes the master's period without asserting an ongoing appointment or an exact research end date.

The source PDF remains unchanged and is clearly identified as an earlier CV on the HTML CV page. It needs replacement with the user's updated full CV. Publication titles and author order are unchanged from the validated preview data, and related-writing links now resolve locally.
