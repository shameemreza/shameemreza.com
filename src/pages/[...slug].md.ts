import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';
import type { ImageMetadata } from 'astro';
import { SITE } from '../config';

// Post bodies reference images relative to src/content/posts. Those paths
// mean nothing to a markdown consumer, so swap each one for the absolute
// URL of the built asset.
const assetLoaders = import.meta.glob<{ default: ImageMetadata }>(
  '../assets/uploads/*'
);

async function resolveBodyImages(body: string): Promise<string> {
  const refs = [...body.matchAll(/\.\.\/\.\.\/(assets\/uploads\/[^)\s"'>]+)/g)];
  let resolved = body;
  for (const [full, rel] of refs) {
    const loader = assetLoaders[`../${rel}`];
    if (!loader) continue;
    const mod = await loader();
    resolved = resolved.replaceAll(
      full,
      new URL(mod.default.src, SITE.url).toString()
    );
  }
  return resolved.replaceAll('](/uploads/', `](${SITE.url}/uploads/`);
}

export async function getStaticPaths() {
  const posts = await getCollection('posts', ({ data }) => !data.draft);
  return posts.map((post) => ({
    params: { slug: post.id },
    props: { post },
  }));
}

export async function GET({ props }: APIContext) {
  const post = props.post;

  const headerLines = [
    `# ${post.data.title}`,
    '',
    `> ${post.data.description}`,
    '',
    `Published: ${post.data.date.toISOString()}`,
  ];

  if (post.data.updated) {
    headerLines.push(`Updated: ${post.data.updated.toISOString()}`);
  }

  headerLines.push(
    `Author: ${SITE.name}`,
    `Category: ${post.data.category}`,
    `Canonical: ${SITE.url}/${post.id}/`,
    '',
    '---',
    '',
    ''
  );

  const body = `${headerLines.join('\n')}${await resolveBodyImages(post.body ?? '')}\n`;

  return new Response(body, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'X-Robots-Tag': 'noindex',
    },
  });
}
