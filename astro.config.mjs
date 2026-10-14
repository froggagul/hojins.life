import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { unified } from '@astrojs/markdown-remark';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkContent, { rehypeReadableBlocks } from './src/lib/remark-content.mjs';

export default defineConfig({
  site: 'https://www.hojins.life',
  output: 'static',
  trailingSlash: 'always',
  integrations: [sitemap({ filter: page => !['/404/', '/404.html', '/about/'].includes(new URL(page).pathname) })],
  redirects: { '/about/': '/cv/' },
  markdown: {
    processor: unified({
      remarkPlugins: [remarkMath, remarkContent],
      rehypePlugins: [[rehypeKatex, { strict: 'ignore' }], rehypeReadableBlocks],
      smartypants: false,
    }),
    shikiConfig: { theme: 'github-light' },
  },
  devToolbar: { enabled: false },
});
