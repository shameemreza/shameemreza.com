import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';
import { SITE } from '../config';

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

  const body = `${headerLines.join('\n')}${post.body ?? ''}\n`;

  return new Response(body, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'X-Robots-Tag': 'noindex',
    },
  });
}
