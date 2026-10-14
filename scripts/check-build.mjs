import { readdir, readFile, stat } from 'node:fs/promises';
import { resolve, join, relative } from 'node:path';
import assert from 'node:assert/strict';
import { load } from 'cheerio';
import { parseFrontmatter } from '@astrojs/markdown-remark';

const root = resolve(process.argv[2] ?? '.');
const dist = join(root, 'dist');
const origin = 'https://www.hojins.life';
async function files(dir) {
  return (await Promise.all((await readdir(dir, { withFileTypes: true })).map(entry =>
    entry.isDirectory() ? files(join(dir, entry.name)) : [join(dir, entry.name)],
  ))).flat();
}
const built = await files(dist);
const html = new Map();
const errors = [];
for (const file of built.filter(file => file.endsWith('.html'))) {
  html.set(file, load(await readFile(file, 'utf8')));
}
function targetFile(pathname) {
  const path = decodeURIComponent(pathname);
  return join(dist, path, path.endsWith('/') ? 'index.html' : '');
}
async function checkUrl(href, base, context, anchor = false) {
  if (!href || /^(mailto:|tel:|data:)/.test(href)) return;
  const url = new URL(href, base);
  if (url.origin !== origin) return;
  let file = targetFile(url.pathname);
  try {
    if ((await stat(file)).isDirectory()) file = join(file, 'index.html');
    assert((await stat(file)).isFile());
    if (anchor && url.hash && html.has(file)) {
      const id = decodeURIComponent(url.hash.slice(1));
      assert(html.get(file)('[id]').toArray().some(el => html.get(file)(el).attr('id') === id), `Missing #${id}`);
    }
  } catch (error) { errors.push(`${context}: ${href} (${error.message})`); }
}
for (const [file, $] of html) {
  const path = `/${relative(dist, file).replace(/index\.html$/, '')}`;
  const base = new URL(path, origin);
  for (const el of $('a[href], link[href], script[src], img[src], source[src], video[src], video[poster]').toArray()) {
    await checkUrl($(el).attr('href') ?? $(el).attr('src') ?? $(el).attr('poster'), base, path, el.tagName === 'a');
  }
  for (const el of $('[srcset]').toArray()) {
    for (const src of $(el).attr('srcset').split(',')) await checkUrl(src.trim().split(/\s+/)[0], base, path);
  }
  if (path !== '/about/') {
    assert.equal($('link[rel=canonical]').attr('href'), base.href, `${path}: canonical`);
    assert($('meta[name=description]').attr('content'), `${path}: description`);
    assert.equal($('h1').length, 1, `${path}: one page heading`);
  }
  assert.equal($('.katex-error').length, 0, `${path}: invalid math`);
  assert.equal($('.prose img:not([alt])').length, 0, `${path}: image alt text`);
}
const sources = (await files(join(root, 'src/content/blog'))).filter(file => file.endsWith('.md'));
const posts = await Promise.all(sources.map(async file => parseFrontmatter(await readFile(file, 'utf8')).frontmatter));
const rss = load(await readFile(join(dist, 'rss.xml'), 'utf8'), { xmlMode: true });
const sitemap = load(await readFile(join(dist, 'sitemap-0.xml'), 'utf8'), { xmlMode: true });
assert.equal(rss('item').length, posts.filter(post => !post.draft).length, 'RSS includes every public post');
const publicFiles = [...html.keys(), ...built.filter(file => file.endsWith('.xml'))];
for (const post of posts) {
  const url = new URL(post.url, origin);
  if (post.draft) {
    assert(!html.has(targetFile(post.url)), `Draft has a page: ${post.url}`);
    for (const file of publicFiles) {
      const text = await readFile(file, 'utf8');
      assert(!text.includes(post.url) && !text.includes(url.pathname), `Draft linked in ${file}`);
    }
  } else {
    const page = html.get(targetFile(post.url));
    assert(page, `Missing post: ${post.url}`);
    assert.equal(page('h1').text(), post.title, `${post.url}: title changed`);
    assert(rss('item > link').toArray().some(el => rss(el).text() === url.href), `RSS missing ${post.url}`);
    assert(sitemap('loc').toArray().some(el => sitemap(el).text() === url.href), `Sitemap missing ${post.url}`);
    if (post.series) {
      const siblings = posts.filter(item => !item.draft && item.series === post.series).sort((a, b) => a.order - b.order);
      const index = siblings.findIndex(item => item.url === post.url);
      assert.equal(page('a[rel=prev]').attr('href'), siblings[index - 1]?.url, `${post.url}: previous episode`);
      assert.equal(page('a[rel=next]').attr('href'), siblings[index + 1]?.url, `${post.url}: next episode`);
    } else {
      assert.equal(page('.series-contents, .series-navigation').length, 0, 'Standalone has no series UI');
    }
  }
}
for (const el of sitemap('loc').toArray()) await checkUrl(sitemap(el).text(), origin, 'sitemap');
assert.equal(errors.length, 0, errors.join('\n'));
assert.equal((await readFile(join(dist, 'cv.pdf'))).subarray(0, 4).toString(), '%PDF');
console.log(`Verified ${html.size} HTML pages, ${posts.filter(post => !post.draft).length} public posts, local links/anchors/media, series order, RSS, sitemap, and CV.`);
