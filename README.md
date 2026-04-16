# shameemreza.com

My personal site. Built with [Astro](https://astro.build/), written in MDX, deployed on [Netlify](https://www.netlify.com/).

Previously `shameem.dev`, `shameem.blog`, and `shameem.me`. Now everything lives here.

## What's inside

- Blog posts migrated from WordPress, stored as MDX with frontmatter.
- Categories, tags, and paginated listing.
- RSS feed at `/rss.xml`.
- Sitemap, canonical URLs, Open Graph, Twitter Cards, and JSON-LD structured data.
- Light and dark mode with system preference detection.
- Giscus comments (GitHub Discussions).
- Mailchimp newsletter form.
- Now page with live GitHub activity.
- Responsive, accessible, zero-JS by default (Astro islands only where needed).

## Running locally

```bash
npm install
npm run dev
```

The dev server starts at `http://localhost:4321/`.

## Building

```bash
npm run build
```

Output goes to `dist/`. Preview the production build with:

```bash
npm run preview
```

## Project structure

```
src/
├── components/     # BaseHead, Header, Footer, JsonLd
├── content/posts/  # MDX blog posts
├── layouts/        # BaseLayout, PostLayout
├── pages/          # All routes (index, blog, about, now, contact, privacy, 404)
├── styles/         # global.css with design tokens
└── config.ts       # Site config, social links, experience, projects
public/
├── images/         # OG image, avatar
├── uploads/        # Media from WordPress migration
├── favicon.svg
└── robots.txt
```

## Deployment

Netlify picks up `netlify.toml` automatically. It handles:

- Build command and publish directory.
- Custom 404 page.
- Old domain redirects (shameem.dev, shameem.blog, shameem.me).
- Cache headers for static assets.
- Security headers.

## Writing a new post

Create a `.mdx` file in `src/content/posts/`:

```yaml
---
title: "Your post title"
description: "A short summary for SEO and social sharing."
date: 2026-04-16
category: "WordPress"
categorySlug: "wordpress"
tags: ["WordPress", "WooCommerce"]
draft: false
---
```

The slug comes from the filename. A post at `src/content/posts/my-new-post.mdx` will be available at `/my-new-post/`.

## License

The source code (layouts, components, styles, config) is open source under [MIT](https://opensource.org/licenses/MIT). Feel free to fork, learn from, or reuse the code for your own site.

All content (blog posts, images, text, and media in `src/content/` and `public/uploads/`) is copyrighted. You may not copy, republish, or redistribute the content without written permission. If you spot a bug or want to suggest an improvement, PRs are welcome.
