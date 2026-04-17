# shameemreza.com

My personal site. Built with [Astro](https://astro.build/), written in MDX, deployed on [Netlify](https://www.netlify.com/).

Previously `shameem.dev`, `shameem.blog`, and `shameem.me`. Now everything lives here.

## What's inside

- Blog posts migrated from WordPress, stored as MDX with frontmatter.
- Categories and paginated listing.
- Command palette search (Cmd+K / Ctrl+K).
- RSS feed at `/rss.xml`.
- Sitemap, canonical URLs, Open Graph, Twitter Cards, and JSON-LD structured data.
- Light and dark mode with system preference detection.
- Giscus comments (GitHub Discussions).
- Mailchimp newsletter form.
- Now page with live GitHub activity.
- Responsive, accessible, zero-JS by default (Astro islands only where needed).

![Site preview](.github/preview.png)

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
├── components/     # BaseHead, Header, Footer, CommandPalette, JsonLd
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
featuredImage: "/uploads/your-image.png"
draft: false
---
```

The slug comes from the filename. A post at `src/content/posts/my-new-post.mdx` will be available at `/my-new-post/`.

### Frontmatter fields

| Field | Required | Description |
|---|---|---|
| `title` | Yes | Post title. |
| `description` | Yes | Short summary for SEO and social sharing. |
| `date` | Yes | Publish date (ISO format). |
| `updated` | No | Last updated date. Shows "Updated [date]" on the post and sets `dateModified` in structured data. Important for Google. |
| `category` | Yes | Display name (e.g. "WordPress"). |
| `categorySlug` | Yes | URL slug (e.g. "wordpress"). |
| `featuredImage` | No | Path to image in `/uploads/`. Used as OG image for social sharing. |
| `featured` | No | Set to `true` to pin the post to the top of listings. |
| `draft` | No | Set to `true` to hide the post from the site. |

### CTA buttons inside posts

Use the `cta-button` class to add call-to-action buttons inside any post. Centered by default:

```html
<div class="cta-button">
  <a href="https://example.com">Get Started</a>
</div>
```

Left-aligned:

```html
<div class="cta-button left">
  <a href="https://example.com">Get Started</a>
</div>
```

## License

The source code (layouts, components, styles, config) is open source under [MIT](https://opensource.org/licenses/MIT). Feel free to fork, learn from, or reuse the code for your own site.

All content (blog posts, images, text, and media in `src/content/` and `public/uploads/`) is copyrighted. You may not copy, republish, or redistribute the content without written permission. If you spot a bug or want to suggest an improvement, PRs are welcome.
