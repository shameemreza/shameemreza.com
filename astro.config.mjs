import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { satteri } from '@astrojs/markdown-satteri';

// Open external links in a new tab without leaking the referrer.
const externalLinks = {
  name: 'external-links',
  element: {
    filter: ['a'],
    visit(node, ctx) {
      const href = node.properties?.href;
      if (typeof href === 'string' && (href.startsWith('http://') || href.startsWith('https://'))) {
        ctx.setProperty(node, 'target', '_blank');
        ctx.setProperty(node, 'rel', ['noopener', 'noreferrer']);
      }
    },
  },
};

// Wrap every <table> in <div class="table-wrap"> for horizontal scroll + styling.
const wrapTables = {
  name: 'wrap-tables',
  element: {
    filter: ['table'],
    visit(node, ctx) {
      ctx.wrapNode(node, {
        type: 'element',
        tagName: 'div',
        properties: { className: ['table-wrap'] },
        children: [],
      });
    },
  },
};

export default defineConfig({
  site: 'https://shameemreza.com',
  trailingSlash: 'always',
  integrations: [mdx(), sitemap()],
  markdown: {
    shikiConfig: {
      theme: 'catppuccin-mocha',
    },
    processor: satteri({
      hastPlugins: [externalLinks, wrapTables],
    }),
  },
});
