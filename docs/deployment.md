# GitHub Pages deployment

The production URL is **https://www.hojins.life**, served at `/`. `astro.config.mjs`, canonical and social metadata, RSS, sitemap, and `public/CNAME` use that domain.

The publishing repository is [froggagul/hojins.life](https://github.com/froggagul/hojins.life), with `main` as its default and publishing branch. GitHub Pages uses GitHub Actions, the `github-pages` environment permits `main` without required reviewers, and HTTPS is enforced. The previous `froggagul/www.hojins.life` and `froggagul/dev.hojins.life` repositories are retained as historical sources; their GitHub Pages sites and Gatsby deployment workflows are disabled. `dev.hojins.life` is retired, including its Route 53 CNAME, without a redirect.

## One-time setup

1. Put this project, including `package-lock.json` and `.github/workflows/deploy.yml`, in `froggagul/hojins.life` with `main` as its publishing branch.
2. In **Settings → Pages → Build and deployment**, choose **GitHub Actions** as the source. Allow the `github-pages` environment to deploy from `main`. If routine publishing should require only a push, do not configure required reviewers for that environment.
3. Set the Pages **Custom domain** to `www.hojins.life`. A `CNAME` file is included for portability, but with an Actions publishing source the repository's Pages setting controls the domain.
4. In the Route 53 public hosted zone `hojins.life` (`Z06561233P8SZ06LCW5YA`), set `www` to a **CNAME** pointing to `froggagul.github.io`, without a repository path. This record already points to the correct target and does not need to change when transferring the domain between these repositories.
5. For the bare `hojins.life` domain to redirect to `www`, point its apex to GitHub Pages using ALIAS/ANAME for `<owner>.github.io`, or these four **A** records: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`. Optional **AAAA** records are `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`, and `2606:50c0:8003::153`.
6. After DNS verification and certificate provisioning, enable **Enforce HTTPS** in Pages settings.
7. Push to `main` or run **Check and deploy** manually from Actions. Confirm both the build and deployment jobs succeed and visit the custom domain, both retained post URLs (`/posts/연구 일지/1/` and `/posts/연구 일지/5/`), `/series/recap/`, and `/cv/`.

These steps follow the [Astro GitHub Pages guide](https://docs.astro.build/en/guides/deploy/github/) and [GitHub custom-domain documentation](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site). DNS records should be checked against GitHub's documentation when configuring the domain.

## Routine publishing

Commit and push. There are no content path filters: every push to `main`, including merged pull requests and Markdown-only changes, runs the complete workflow. PRs targeting `main` run the same verification but cannot deploy. Manual runs on other branches verify only.

The workflow uses `.nvmrc` and `npm ci`, installs Chromium, runs Astro/TypeScript checks, tests drafts/standalone posts in an isolated build, checks development behavior, creates the production build, audits its internal links/media/feed/sitemap, and runs desktop/mobile Playwright tests against that build. Only the verified `dist/` artifact is uploaded for deployment; a failed check leaves the published site unchanged.

Concurrency is grouped by branch or PR. A new `main` run cancels the older build/deploy together, and the deploy job checks that its commit is still the tip of `main` before publishing. Deployment has scoped Pages/OIDC permissions and uses the `github-pages` environment. Build and deployment status appear separately in Actions.

## October 14, 2026 domain cutover

The [initial check and deployment](https://github.com/froggagul/hojins.life/actions/runs/38526950678) succeeded before the custom domain was released from the old repository and assigned here. The existing certificate covers both `www.hojins.life` and `hojins.life`.

Both old Gatsby workflows were disabled and both Pages sites were deleted. GitHub rejected deletion while their special `gh-pages` branches existed. Each branch's full published output and history was first preserved as `retired-gh-pages-2026-10-14`; the `gh-pages` branch was then removed and Pages deletion succeeded. The original source branches and local reference directories remain available.

Only the `dev.hojins.life` CNAME was deleted from the [Route 53 hosted zone](https://console.aws.amazon.com/route53/v2/hostedzones#ListRecordSets/Z06561233P8SZ06LCW5YA). Change `C04732751KV2PGBOZTUG6` reached `INSYNC`, and the authoritative nameserver returned `NXDOMAIN` for `dev.hojins.life`. The `www` CNAME, apex GitHub Pages A records, nameservers, and verification records were preserved. Existing resolver and browser caches may retain the old sites until their TTLs expire.

To reverse the cutover, first release the custom domain from this repository. In each old repository, recreate `gh-pages` from `retired-gh-pages-2026-10-14`, restore the Pages source (`gh-pages`, `/`) and its custom domain, and re-enable the Gatsby workflow. Restore the `dev` CNAME to `froggagul.github.io` with TTL 300. Confirm HTTPS and the resulting deployments before relying on them.

The CV PDF is an earlier snapshot and should be replaced with the updated full CV; see [migration notes](migration.md).
