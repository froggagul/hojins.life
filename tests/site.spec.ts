import { test, expect } from "@playwright/test";
import { readdirSync, readFileSync } from 'node:fs';
import { parseFrontmatter } from '@astrojs/markdown-remark';
const postCount = readdirSync('src/content/blog', { recursive: true }).filter(file => String(file).endsWith('.md') && !parseFrontmatter(readFileSync(`src/content/blog/${file}`, 'utf8')).frontmatter.draft).length;
const publicationCount = JSON.parse(readFileSync('src/data/publications.json', 'utf8')).length;
const projectCount = JSON.parse(readFileSync('src/data/projects.json', 'utf8')).length;
const entryCount = postCount + publicationCount + projectCount;

test("landing page, navigation, image, and CV work", async ({
  page,
  request,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(page).toHaveTitle("Hojin Jung · 정호진");
  await expect(
    page.getByRole("heading", { name: "Recent writing" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Selected publications" }),
  ).toBeVisible();
  const writing = page.locator("#writing");
  await expect(writing.locator(".writing-list")).toBeHidden();
  await writing.locator("summary").focus();
  await page.keyboard.press("Enter");
  await expect(writing.locator(".writing-list")).toBeVisible();
  await page.keyboard.press("Space");
  await expect(writing.locator(".writing-list")).toBeHidden();
  await writing.locator("summary").click();
  const photo = page.getByRole("img", {
    name: "Hojin Jung smiling by the sea",
  });
  await expect(photo).toBeVisible();
  expect(
    await photo.evaluate((img) => (img as HTMLImageElement).naturalWidth),
  ).toBeGreaterThan(0);
  await page.getByRole("link", { name: "All posts", exact: true }).click();
  await expect(page).toHaveURL(/\/blog\/$/);
  await expect(page.locator(".writing-row")).toHaveCount(postCount);
  await expect(
    page.getByRole("heading", { name: "Recsys Challenge 2023" }),
  ).toBeVisible();
  await page
    .getByRole("navigation")
    .getByRole("link", { name: "Publications", exact: true })
    .click();
  await expect(page.locator(".publication")).toHaveCount(publicationCount);
  await page
    .getByRole("navigation")
    .getByRole("link", { name: "CV", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Curriculum vitae" }),
  ).toBeVisible();
  const pdf = await request.get("/cv.pdf");
  expect(pdf.status()).toBe(200);
  expect((await pdf.body()).subarray(0, 4).toString()).toBe("%PDF");
  expect(errors).toEqual([]);
});

test('DOLSOE is reachable from home, projects, and search with the keyboard', async ({ page, request }) => {
  await page.goto('/');
  const projects = page.getByRole('region', { name: 'Projects', exact: true });
  await expect(projects.getByRole('heading', { name: 'DOLSOE', exact: true })).toBeVisible();
  await projects.getByRole('link', { name: 'DOLSOE', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/projects\/dolsoe\/$/);
  await expect(page.getByRole('heading', { name: 'DOLSOE', exact: true })).toBeVisible();
  await expect(page.locator('.project-overview')).toContainText('MuJoCo');
  await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href', 'https://www.hojins.life/projects/dolsoe/');
  await expect(page.getByRole('navigation').getByRole('link', { name: 'Projects', exact: true })).toHaveAttribute('aria-current', 'page');
  await page.getByRole('link', { name: 'All projects', exact: true }).click();
  await expect(page).toHaveURL(/\/projects\/$/);
  await expect(page.locator('.project')).toHaveCount(projectCount);
  await page.getByRole('link', { name: 'About DOLSOE', exact: true }).click();
  await expect(page).toHaveURL(/\/projects\/dolsoe\/$/);
  await page.goto('/search/?q=dolsoe');
  const result = page.locator('.search-result:visible');
  await expect(result).toHaveCount(1);
  await expect(result.locator('.result-meta')).toHaveText('Project');
  await page.getByRole('searchbox').fill('wheeled biped');
  await expect(result.getByRole('heading')).toHaveText('DOLSOE');
  await result.getByRole('link').focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/projects\/dolsoe\/$/);
  if (process.env.SITE_TEST_MODE !== 'dev') {
    const sitemap = await (await request.get('/sitemap-0.xml')).text();
    expect(sitemap).toContain('https://www.hojins.life/projects/</loc>');
    expect(sitemap).toContain('https://www.hojins.life/projects/dolsoe/</loc>');
  }
});

test("search supports Korean, initials, English, authors, clearing, and no matches", async ({
  page,
}) => {
  await page.goto("/search/");
  const input = page.getByRole("searchbox");
  const visibleResults = page.locator(".search-result:visible");
  await expect(visibleResults).toHaveCount(entryCount);
  for (const query of ["연구", "ㅇㄱ", "ㄷㅎㅇ"]) {
    await input.fill(query);
    await expect(
      page.getByRole("heading", { name: "첫 논문 회고 및 대학원 돌아보기" }),
    ).toBeVisible();
  }
  await input.fill("Challenge 2023");
  await expect(visibleResults).toHaveCount(1);
  await expect(visibleResults.getByRole("heading")).toHaveText(
    "Recsys Challenge 2023",
  );
  await input.fill("Dongwon");
  await expect(visibleResults).toHaveCount(1);
  await visibleResults.getByRole("link").click();
  await expect(page).toHaveURL(/\/publications\/#neuralsvcd$/);
  await expect(page.locator("#neuralsvcd")).toBeInViewport();
  await page.goto("/search/?q=NeuralSVCD");
  await expect(input).toHaveValue("NeuralSVCD");
  await expect(visibleResults).toHaveCount(1);
  await input.fill("this-word-does-not-exist-983482");
  await expect(page.getByText("No matches yet.")).toBeVisible();
  await expect(visibleResults).toHaveCount(0);
  await page.getByRole("button", { name: "Clear", exact: true }).click();
  await expect(input).toBeFocused();
  await expect(visibleResults).toHaveCount(entryCount);
  await expect(page).toHaveURL(/\/search\/$/);
});

test("keyboard navigation reaches content, search, and results", async ({
  page,
}) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Skip to content" }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#main$/);
  await page.goto("/");
  for (let i = 0; i < 8; i++) await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", {
      name: "Search writing, publications, and projects",
      exact: true,
    }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await page.getByRole("searchbox").focus();
  await page.keyboard.type("neuralsvcd");
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("button", { name: "Clear", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.locator(".search-result:visible a")).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#neuralsvcd$/);
});

test("search shortcuts open search across pages and replace an existing query", async ({ page, isMobile }) => {
  for (const shortcut of ["Control+k", "Meta+k"]) {
    for (const path of ["/", "/blog/", "/publications/", "/projects/", "/projects/dolsoe/", "/cv/"]) {
      await page.goto(path);
      const searchLink = page.getByRole("link", { name: "Search writing, publications, and projects", exact: true });
      await expect(searchLink).toHaveAttribute("aria-keyshortcuts", "Control+k Meta+k");
      const hint = searchLink.locator("kbd");
      if (isMobile) await expect(hint).toBeHidden();
      else await expect(hint).toBeVisible();
      await page.keyboard.press(shortcut);
      await expect(page).toHaveURL(/\/search\/#search-input$/);
      await expect(page.getByRole("searchbox")).toBeFocused();
    }
    await page.getByRole("searchbox").fill("연구");
    await page.getByRole("heading", { name: "Search", exact: true }).click();
    await page.keyboard.press(shortcut);
    await expect(page.getByRole("searchbox")).toBeFocused();
    await expect(page.getByRole("searchbox")).toHaveValue("연구");
    await page.keyboard.type("Challenge 2023");
    await expect(page.getByRole("searchbox")).toHaveValue("Challenge 2023");
    await expect(page.locator(".search-result:visible")).toHaveCount(1);
    await expect(page.locator(".search-result:visible h2")).toHaveText("Recsys Challenge 2023");
  }
});

test("search shortcuts preserve ordinary typing and Korean composition", async ({ page }) => {
  await page.goto("/search/");
  const input = page.getByRole("searchbox");
  await input.fill("연구");
  await page.keyboard.press("End");
  await page.keyboard.type("k/");
  await expect(input).toHaveValue("연구k/");

  // A shortcut during IME composition must not select or replace the query.
  for (const modifiers of [{ ctrlKey: true }, { metaKey: true }]) {
    await input.dispatchEvent("keydown", { key: "k", code: "KeyK", isComposing: true, ...modifiers });
    await page.keyboard.type("a");
  }
  await expect(input).toHaveValue("연구k/aa");
  await page.keyboard.press("Control+Shift+k");
  await page.keyboard.type("b");
  await expect(input).toHaveValue("연구k/aab");

  // Use the physical key as well so a Korean keyboard layout can open search.
  await input.dispatchEvent("keydown", { key: "ㅏ", code: "KeyK", ctrlKey: true });
  await page.keyboard.type("NeuralSVCD");
  await expect(input).toHaveValue("NeuralSVCD");
});

test("all pages fit the viewport and local links resolve", async ({
  page,
  request,
}) => {
  const links = new Set<string>();
  for (const path of ["/", "/blog/", "/publications/", "/projects/", "/projects/dolsoe/", "/cv/", "/search/", "/series/", "/series/recap/", "/tags/", "/tags/추천 시스템/", "/posts/연구 일지/1/", "/posts/연구 일지/5/"]) {
    expect((await page.goto(path))?.ok(), path).toBe(true);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    for (const href of await page
      .locator('a[href^="/"]')
      .evaluateAll((elements) =>
        elements.map((el) => el.getAttribute("href")!),
      ))
      links.add(href.split("#")[0]);
  }
  for (const href of links)
    expect((await request.get(href)).ok(), href).toBe(true);
});

test("core content and destinations remain available without JavaScript", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(baseURL!);
  await expect(
    page.getByRole("heading", { name: "Recent writing" }),
  ).toBeVisible();
  await page.locator("#writing summary").click();
  await expect(page.locator("#writing .writing-list")).toBeVisible();
  await page.getByRole("link", { name: "All posts", exact: true }).click();
  await expect(page.locator(".writing-row")).toHaveCount(postCount);
  await page
    .getByRole("link", { name: "Search writing, publications, and projects", exact: true })
    .click();
  // Playwright's text engine omits noscript descendants even with JS disabled.
  await expect(page.locator("noscript .search-status")).toBeVisible();
  await expect(page.locator(".search-result")).toHaveCount(entryCount);
  await page.getByRole('link', { name: /DOLSOE/ }).click();
  await expect(page.getByRole('heading', { name: 'DOLSOE', exact: true })).toBeVisible();
  await expect(page.locator('.project-overview')).toContainText('MuJoCo');
  await page.getByRole('navigation').getByRole('link', { name: 'Projects', exact: true }).click();
  await expect(page.locator('.project')).toHaveCount(projectCount);
  await page.goto(`${baseURL}/posts/연구 일지/1/`);
  await expect(page.getByRole('heading', { name: 'Recsys Challenge 2023', exact: true })).toBeVisible();
  await page.locator('.post-tags a').first().click();
  await expect(page.getByRole('heading', { name: '추천 시스템', exact: true })).toBeVisible();
  await context.close();
});

test('local posts preserve dates, media captions, series contents, and previous/next links', async ({ page }) => {
  await page.goto('/posts/연구 일지/1/');
  await expect(page.getByRole('heading', { name: 'Recsys Challenge 2023', exact: true })).toBeVisible();
  await expect(page.locator('.post-details time')).toHaveAttribute('datetime', '2023-09-22');
  await expect(page.locator('.post-details a')).toHaveText('recap · 1');
  await expect(page.locator('html')).toHaveAttribute('lang', 'ko');
  await page.locator('.series-contents summary').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.series-contents [aria-current=page]')).toHaveText('Recsys Challenge 2023');
  await expect(page.locator('.series-contents li')).toHaveCount(2);
  const image = page.getByRole('img', { name: '코밑엔! 코밑엔! 코밑엔!' });
  await image.scrollIntoViewIfNeeded();
  await expect(image).toBeVisible();
  await expect.poll(() => image.evaluate(img => (img as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  await expect(page.locator('figcaption', { hasText: '코밑엔! 코밑엔! 코밑엔!' })).toBeVisible();
  await expect(page.locator('a[rel=prev]')).toHaveCount(0);
  await expect(page.locator('a[rel=next]')).toHaveAttribute('href', '/posts/연구 일지/5/');
  await page.locator('a[rel=next]').click();
  await expect(page.getByRole('heading', { name: '첫 논문 회고 및 대학원 돌아보기', exact: true })).toBeVisible();
  await expect(page.locator('.post-details time')).toHaveAttribute('datetime', '2025-07-03');
  await expect(page.locator('.post-details a')).toHaveText('recap · 2');
  await expect(page.locator('a[rel=next]')).toHaveCount(0);
  await expect(page.locator('a[rel=prev]')).toHaveAttribute('href', '/posts/연구 일지/1/');
  await page.locator('a[rel=prev]').click();
  await expect(page.getByRole('heading', { name: 'Recsys Challenge 2023', exact: true })).toBeVisible();
});

test('series and tags browse locally and tag search reaches a post', async ({ page }) => {
  await page.goto('/series/');
  await page.getByRole('link', { name: /recap/ }).click();
  await expect(page).toHaveURL(/\/series\/recap\/$/);
  const orders = await page.locator('.episode').allTextContents();
  expect(orders.map(Number)).toEqual([1, 2]);
  await expect(page.locator('.writing-row h3')).toHaveText(['Recsys Challenge 2023', '첫 논문 회고 및 대학원 돌아보기']);
  await page.goto('/search/?q=recap');
  await expect(page.locator('.search-result:visible')).toHaveCount(2);
  await page.goto('/tags/');
  await page.getByRole('link', { name: /^추천 시스템/ }).click();
  await page.getByRole('link', { name: /Recsys Challenge 2023/ }).click();
  await expect(page).toHaveURL(url => decodeURIComponent(url.pathname) === '/posts/연구 일지/1/');
  await page.goto('/search/?q=추천+시스템');
  await expect(page.locator('.search-result:visible')).toHaveCount(1);
  await page.locator('.search-result:visible a').focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(url => decodeURIComponent(url.pathname) === '/posts/연구 일지/1/');
});

test('old search bookmarks and the about page have working destinations', async ({ page }) => {
  await page.goto('/?query=연구');
  await expect(page).toHaveURL(/\/search\/\?q=/);
  await expect(page.getByRole('searchbox')).toHaveValue('연구');
  await expect(page.getByRole('heading', { name: '첫 논문 회고 및 대학원 돌아보기' })).toBeVisible();
  await page.goto('/about/');
  await expect(page).toHaveURL(/\/cv\/$/);
  await expect(page.getByRole('heading', { name: 'Curriculum vitae' })).toBeVisible();
});

test('metadata, feeds, and updated biography are consistent', async ({ page, request }) => {
  await page.goto('/');
  await expect(page.locator('.intro-description')).toContainText('Ludo Robotics');
  await page.goto('/cv/');
  await expect(page.locator('.cv-entry').filter({ hasText: 'Master of Science' })).toContainText('Aug 2026');
  await expect(page.locator('.cv-entry').filter({ hasText: 'Ludo Robotics' })).toContainText('Oct 2026 — Present');
  await expect(page.locator('.cv-entry').filter({ hasText: 'ROBROS' })).toContainText('Oct 2, 2026');
  await expect(page.locator('.cv-note')).toHaveCount(0);
  await page.goto('/posts/연구 일지/1/');
  const postUrl = new URL('/posts/연구 일지/1/', 'https://www.hojins.life').href;
  await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href', postUrl);
  await expect(page.locator('meta[property="og:type"]')).toHaveAttribute('content', 'article');
  await expect(page.locator('meta[name=description]')).toHaveAttribute('content', /대회를 나가보자/);
  const rss = await request.get('/rss.xml');
  expect(rss.ok()).toBe(true);
  expect(await rss.text()).toContain(postUrl);
  // The sitemap is generated only for production builds.
  if (process.env.SITE_TEST_MODE !== 'dev') {
    for (const path of ['/sitemap-index.xml', '/sitemap.xml', '/sitemap/sitemap-index.xml']) {
      const response = await request.get(path);
      expect(response.ok()).toBe(true);
      expect(await response.text()).toContain('https://www.hojins.life/sitemap-0.xml');
    }
  }
});
