import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import OpenAI from 'openai';

const POSTS_DIR = path.resolve('src/content/posts');
const UPLOADS_DIR = path.resolve('public/uploads');
const MAX_WIDTH = 1200;
const JPEG_QUALITY = 82;
const MODEL = 'gpt-image-2';
const SIZE = '1536x1024';
const QUALITY = 'medium';

interface ParsedArgs {
  dryRun: boolean;
  prompt?: string;
  out?: string;
  slug?: string;
}

function parseArgs(): ParsedArgs {
  const argv = process.argv.slice(2);
  const args: ParsedArgs = { dryRun: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--dry-run') {
      args.dryRun = true;
    } else if (a === '--prompt') {
      args.prompt = argv[++i];
    } else if (a === '--out') {
      args.out = argv[++i];
    } else if (!a.startsWith('--') && !args.slug) {
      args.slug = a;
    }
  }
  return args;
}

function printUsage(): void {
  console.log('Usage:');
  console.log('  Auto-prompt from a post\'s title, category, and description:');
  console.log('    npx tsx scripts/generate-featured-image.ts <slug>');
  console.log('');
  console.log('  Custom prompt for any image (in-post, diagrams, etc.):');
  console.log('    npx tsx scripts/generate-featured-image.ts --prompt "..." --out <name>');
  console.log('');
  console.log('  Preview without calling the API:');
  console.log('    npx tsx scripts/generate-featured-image.ts <slug> --dry-run');
  console.log('    npx tsx scripts/generate-featured-image.ts --prompt "..." --out <name> --dry-run');
  console.log('');
  console.log('Set OPENAI_API_KEY in .env or as an environment variable.');
}

interface PostMeta {
  slug: string;
  title: string;
  description: string;
  category: string;
  filePath: string;
}

function parseFrontmatter(content: string): Record<string, string> {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  const meta: Record<string, string> = {};
  for (const line of match[1].split('\n')) {
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let val = line.slice(idx + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    meta[key] = val;
  }
  return meta;
}

function getPost(slug: string): PostMeta | null {
  const filePath = path.join(POSTS_DIR, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;
  const content = fs.readFileSync(filePath, 'utf-8');
  const meta = parseFrontmatter(content);
  return {
    slug,
    title: meta.title || slug,
    description: meta.description || '',
    category: meta.category || '',
    filePath,
  };
}

function buildPostPrompt(post: PostMeta): string {
  return [
    'Blog featured image.',
    `Topic: ${post.title}.`,
    post.category ? `Category: ${post.category}.` : '',
    post.description ? `Context: ${post.description}` : '',
    'Style: minimalist flat illustration with clean lines, soft gradients, and muted colors.',
    'Palette: deep teal, warm neutrals, subtle blue accents. Gentle and modern, not saturated.',
    'Composition: calm, balanced, single focal concept. Plenty of negative space.',
    'Do not include any text, letters, numbers, logos, or watermarks anywhere in the image.',
    'Professional editorial feel, suitable as a 1200x630 social card.',
  ]
    .filter(Boolean)
    .join(' ');
}

function buildCustomPrompt(userPrompt: string): string {
  return [
    userPrompt,
    'Style: minimalist flat illustration with clean lines, soft gradients, and muted colors.',
    'Palette: deep teal, warm neutrals, subtle blue accents. Gentle and modern, not saturated.',
    'Do not include any text, letters, numbers, logos, or watermarks.',
  ].join(' ');
}

function updateFrontmatter(filePath: string, slug: string): void {
  const content = fs.readFileSync(filePath, 'utf-8');
  const imagePath = `/uploads/${slug}.jpg`;
  let next: string;
  if (/featuredImage:\s*".*?"/.test(content)) {
    next = content.replace(
      /featuredImage:\s*".*?"/,
      `featuredImage: "${imagePath}"`
    );
  } else {
    next = content.replace(
      /^---\n([\s\S]*?)\n---/,
      (_, body) => `---\n${body}\nfeaturedImage: "${imagePath}"\n---`
    );
  }
  fs.writeFileSync(filePath, next);
}

async function compressImage(rawBuffer: Buffer, outName: string): Promise<number> {
  const outputPath = path.join(UPLOADS_DIR, `${outName}.jpg`);
  await sharp(rawBuffer)
    .resize(MAX_WIDTH, undefined, { withoutEnlargement: true })
    .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
    .toFile(outputPath);
  return fs.statSync(outputPath).size;
}

async function callOpenAI(client: OpenAI, prompt: string): Promise<Buffer> {
  const response = await client.images.generate({
    model: MODEL,
    prompt,
    size: SIZE,
    quality: QUALITY,
    output_format: 'png',
  });
  const imageData = response.data?.[0]?.b64_json;
  if (!imageData) throw new Error('No image data returned from API.');
  return Buffer.from(imageData, 'base64');
}

async function runSlugMode(slug: string, dryRun: boolean): Promise<void> {
  const post = getPost(slug);
  if (!post) {
    console.error(`Post not found: ${slug}.mdx`);
    process.exit(1);
  }

  const prompt = buildPostPrompt(post);
  const outPath = path.join(UPLOADS_DIR, `${slug}.jpg`);

  console.log(`Post:     ${post.title}`);
  console.log(`Category: ${post.category || '(none)'}`);
  console.log(`Output:   public/uploads/${slug}.jpg`);
  console.log(`Prompt:   ${prompt}\n`);

  if (dryRun) {
    console.log('--- DRY RUN (no API call, no files written) ---');
    return;
  }

  if (fs.existsSync(outPath)) {
    console.log(`${slug}.jpg already exists. Delete it first to regenerate.`);
    updateFrontmatter(post.filePath, slug);
    console.log('Frontmatter re-linked.');
    return;
  }

  const client = new OpenAI();
  const raw = await callOpenAI(client, prompt);
  const compressed = await compressImage(raw, slug);
  updateFrontmatter(post.filePath, slug);

  const rawKB = (raw.length / 1024).toFixed(0);
  const compressedKB = (compressed / 1024).toFixed(0);
  console.log(`Done. ${rawKB} KB raw -> ${compressedKB} KB compressed.`);
  console.log(`Frontmatter updated in ${path.relative(process.cwd(), post.filePath)}.`);
}

async function runPromptMode(
  userPrompt: string,
  out: string,
  dryRun: boolean
): Promise<void> {
  const prompt = buildCustomPrompt(userPrompt);
  const outPath = path.join(UPLOADS_DIR, `${out}.jpg`);

  console.log(`Output:   public/uploads/${out}.jpg`);
  console.log(`Prompt:   ${prompt}\n`);

  if (dryRun) {
    console.log('--- DRY RUN (no API call, no files written) ---');
    return;
  }

  if (fs.existsSync(outPath)) {
    console.error(`${out}.jpg already exists. Delete it or choose a different --out name.`);
    process.exit(1);
  }

  const client = new OpenAI();
  const raw = await callOpenAI(client, prompt);
  const compressed = await compressImage(raw, out);

  const rawKB = (raw.length / 1024).toFixed(0);
  const compressedKB = (compressed / 1024).toFixed(0);
  console.log(`Done. ${rawKB} KB raw -> ${compressedKB} KB compressed.\n`);
  console.log('Paste into your MDX:');
  console.log(`  ![](/uploads/${out}.jpg)`);
}

async function main() {
  const args = parseArgs();

  const hasPromptArgs = args.prompt || args.out;
  const hasSlug = !!args.slug;

  if (!hasPromptArgs && !hasSlug) {
    printUsage();
    process.exit(0);
  }

  if (hasPromptArgs && hasSlug) {
    console.error('Pass either a slug or --prompt with --out, not both.');
    process.exit(1);
  }

  if (hasPromptArgs) {
    if (!args.prompt) {
      console.error('Missing --prompt value.');
      process.exit(1);
    }
    if (!args.out) {
      console.error('Missing --out value. Provide an output filename, for example: --out my-image');
      process.exit(1);
    }
    if (!/^[a-z0-9][a-z0-9-]*$/.test(args.out)) {
      console.error('--out must be lowercase letters, numbers, and dashes only.');
      process.exit(1);
    }
  }

  if (!args.dryRun && !process.env.OPENAI_API_KEY) {
    console.error('Missing OPENAI_API_KEY.');
    console.error('Add it to your .env file: OPENAI_API_KEY=sk-...');
    process.exit(1);
  }

  if (hasSlug) {
    await runSlugMode(args.slug!, args.dryRun);
  } else {
    await runPromptMode(args.prompt!, args.out!, args.dryRun);
  }
}

main().catch((err) => {
  console.error(err?.message || err);
  process.exit(1);
});
