import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import rehypeExternalLinks from 'rehype-external-links';

// Wrap every <table> in <div class="table-wrap"> for horizontal scroll + styling.
function rehypeWrapTables() {
  const walk = (node) => {
    if (!node || !node.children) return;
    for (let i = 0; i < node.children.length; i++) {
      const child = node.children[i];
      if (child.type === 'element' && child.tagName === 'table') {
        node.children[i] = {
          type: 'element',
          tagName: 'div',
          properties: { className: ['table-wrap'] },
          children: [child],
        };
      } else {
        walk(child);
      }
    }
  };
  return (tree) => walk(tree);
}

export default defineConfig({
  site: 'https://shameemreza.com',
  trailingSlash: 'always',
  integrations: [mdx(), sitemap()],
  markdown: {
    shikiConfig: {
      theme: 'catppuccin-mocha',
    },
    rehypePlugins: [
      [rehypeExternalLinks, {
        target: '_blank',
        rel: ['noopener', 'noreferrer'],
      }],
      rehypeWrapTables,
    ],
  },
});
