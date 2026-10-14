// Exercise drafts and standalone posts in an isolated copy, never in public content.
import { cp, mkdtemp, mkdir, writeFile, symlink, rm, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import assert from 'node:assert/strict';
import { load } from 'cheerio';
const root = resolve('.');
const temp = await mkdtemp(join(tmpdir(), 'hojins-content-'));
function run(args) {
  const result = spawnSync(process.execPath, args, { cwd: temp, encoding: 'utf8' });
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
}
try {
  for (const name of ['src', 'public', 'astro.config.mjs', 'package.json', 'tsconfig.json']) await cp(join(root, name), join(temp, name), { recursive: true });
  await symlink(join(root, 'node_modules'), join(temp, 'node_modules'), 'dir');
  const dir = join(temp, 'src/content/blog/fixtures');
  await mkdir(dir);
  const fixture = (title, path, extra = '', body = 'A standalone post with 한국어 and English.') => `---\ntitle: ${title}\ndate: "2026-01-02"\nurl: /posts/${path}/\n${extra}---\n\n${body}\n`;
  const body = 'A standalone post with 한국어 and English, and inline math $x^2$.\n\n$$\nx^2 + y^2 = z^2\n$$\n\n```js\nconsole.log("Code fixture");\n```\n\n`youtube:https://www.youtube.com/watch?v=Q0xvVgKJxfs`';
  await writeFile(join(dir, 'standalone.md'), fixture('Standalone test', 'standalone-test', '', body));
  await writeFile(join(dir, 'draft.md'), fixture('Private draft sentinel', 'draft-test', 'draft: true\ntags: [private-tag-sentinel]\nseries: Private series sentinel\norder: 1\n'));
  await writeFile(join(dir, 'later.md'), fixture('Later episode', 'later-test', 'series: Fixture series\norder: 9\ntags: [fixture-tag]\n'));
  await writeFile(join(dir, 'earlier.md'), fixture('Earlier episode', 'earlier-test', 'series: Fixture series\norder: 2\n'));
  await writeFile(join(dir, 'middle.md'), fixture('Unpublished middle', 'middle-test', 'series: Fixture series\norder: 4\ndraft: true\n'));
  run([join(root, 'node_modules/astro/bin/astro.mjs'), 'build']);
  run([join(root, 'scripts/check-build.mjs'), temp]);
  const search = await readFile(join(temp, 'dist/search/index.html'), 'utf8');
  assert(!search.includes('Private draft sentinel') && !search.includes('private-tag-sentinel'));
  const series = load(await readFile(join(temp, 'dist/series/Fixture series/index.html'), 'utf8'));
  assert.deepEqual(series('.writing-row h3').map((_, el) => series(el).text()).get(), ['Earlier episode', 'Later episode']);
  const tags = await readFile(join(temp, 'dist/tags/index.html'), 'utf8');
  assert(tags.includes('fixture-tag') && !tags.includes('private-tag-sentinel'));
  const standalone = load(await readFile(join(temp, 'dist/posts/standalone-test/index.html'), 'utf8'));
  assert.equal(standalone('pre.astro-code').text().trim(), 'console.log("Code fixture");');
  assert.equal(standalone('pre.astro-code').attr('tabindex'), '0');
  assert.equal(standalone('.katex').length, 2);
  assert.equal(standalone('.katex-display').attr('tabindex'), '0');
  assert.equal(standalone('.video-embed').attr('data-video-id'), 'Q0xvVgKJxfs');
  assert.equal(standalone('.video-embed button[hidden]').length, 1);
  assert.equal(standalone('.video-embed a').attr('href'), 'https://www.youtube.com/watch?v=Q0xvVgKJxfs');
  assert.equal(standalone('iframe').length, 0);
  console.log('Verified isolated fixtures: minimal standalone metadata, drafts excluded everywhere, tags, nonconsecutive series order across a draft, math, highlighted code, and deferred video markup.');
} finally {
  await rm(temp, { recursive: true, force: true });
}
