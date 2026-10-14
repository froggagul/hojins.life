import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { parseFrontmatter } from '@astrojs/markdown-remark';
const inventory = JSON.parse(await readFile('docs/migration.json', 'utf8'));
const hash = value => createHash('sha256').update(value).digest('hex');
for (const post of inventory.posts) {
  const source = await readFile(post.file, 'utf8');
  assert.equal(hash(source.slice(source.indexOf('---', 3) + 3)), post.bodySha256, `${post.file}: original body changed`);
  const { frontmatter } = parseFrontmatter(source);
  for (const field of ['title', 'url', 'series', 'order']) assert.equal(frontmatter[field], post[field], `${post.file}: ${field}`);
  const date = frontmatter.date instanceof Date ? frontmatter.date.toISOString().slice(0, 10) : frontmatter.date;
  assert.equal(date, post.date, `${post.file}: date`);
}
for (const media of inventory.media) assert.equal(hash(await readFile(media.file)), media.sha256, media.file);
console.log(`Preserved ${inventory.posts.length} post bodies and ${inventory.media.length} original media files; titles, dates, routes, and episode order match the migration inventory.`);
