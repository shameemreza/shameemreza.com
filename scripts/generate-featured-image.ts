import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import OpenAI from 'openai';

const POSTS_DIR = path.resolve('src/content/posts');
const UPLOADS_DIR = path.resolve('public/uploads');
const MAX_WIDTH = 1200;
const JPEG_QUALITY = 82;

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const all = args.includes('--all');
const slugArg = args.find((a) => !a.startsWith('--'));

if (!all && !slugArg) {
  console.log('Usage:');
  console.log('  npx tsx scripts/generate-featured-image.ts <slug>');
  console.log('  npx tsx scripts/generate-featured-image.ts --all');
  console.log('  npx tsx scripts/generate-featured-image.ts --all --dry-run');
  console.log('\nSet OPENAI_API_KEY in .env or as an environment variable.');
  process.exit(0);
}

if (!dryRun && !process.env.OPENAI_API_KEY) {
  console.error('Missing OPENAI_API_KEY.');
  console.error('Add it to your .env file: OPENAI_API_KEY=sk-...');
  process.exit(1);
}

interface PostMeta {
  slug: string;
  title: string;
  description: string;
  category: string;
  featuredImage: string;
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

function getPostsNeedingImages(): PostMeta[] {
  const posts: PostMeta[] = [];
  for (const f of fs.readdirSync(POSTS_DIR).sort()) {
    if (!f.endsWith('.mdx')) continue;
    const filePath = path.join(POSTS_DIR, f);
    const content = fs.readFileSync(filePath, 'utf-8');
    const meta = parseFrontmatter(content);
    const slug = f.replace('.mdx', '');
    const fi = meta.featuredImage || '';

    if (fi && fi !== '""' && fi !== "''") continue;

    posts.push({
      slug,
      title: meta.title || slug,
      description: meta.description || '',
      category: meta.category || '',
      featuredImage: fi,
      filePath,
    });
  }
  return posts;
}

function getPost(slug: string): PostMeta | null {
  const f = `${slug}.mdx`;
  const filePath = path.join(POSTS_DIR, f);
  if (!fs.existsSync(filePath)) return null;
  const content = fs.readFileSync(filePath, 'utf-8');
  const meta = parseFrontmatter(content);
  return {
    slug,
    title: meta.title || slug,
    description: meta.description || '',
    category: meta.category || '',
    featuredImage: meta.featuredImage || '',
    filePath,
  };
}

function buildPrompt(post: PostMeta): string {
  return [
    'Create a blog featured image.',
    'Minimalist illustration style with clean lines and soft muted colors.',
    `Visually represent the concept of: "${post.title}".`,
    post.category ? `The topic category is ${post.category}.` : '',
    'No text or words on the image at all.',
    'Subtle, modern, professional look.',
    'Soft gradients or muted blue tones preferred.',
  ]
    .filter(Boolean)
    .join(' ');
}

function updateFrontmatter(filePath: string, slug: string): void {
  let content = fs.readFileSync(filePath, 'utf-8');
  const imagePath = `/uploads/${slug}.jpg`;
  content = content.replace(
    /featuredImage:\s*".*?"/,
    `featuredImage: "${imagePath}"`
  );
  fs.writeFileSync(filePath, content);
}

async function compressImage(rawBuffer: Buffer, slug: string): Promise<number> {
  const outputPath = path.join(UPLOADS_DIR, `${slug}.jpg`);
  await sharp(rawBuffer)
    .resize(MAX_WIDTH, undefined, { withoutEnlargement: true })
    .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
    .toFile(outputPath);
  return fs.statSync(outputPath).size;
}

async function generateImage(
  client: OpenAI,
  post: PostMeta
): Promise<boolean> {
  const prompt = buildPrompt(post);
  const jpgPath = path.join(UPLOADS_DIR, `${post.slug}.jpg`);

  if (fs.existsSync(jpgPath)) {
    console.log(`  [skip] ${post.slug}.jpg already exists`);
    updateFrontmatter(post.filePath, post.slug);
    return true;
  }

  try {
    const response = await client.images.generate({
      model: 'gpt-image-1',
      prompt,
      size: '1536x1024',
      quality: 'medium',
      output_format: 'png',
    });

    const imageData = response.data?.[0]?.b64_json;
    if (!imageData) {
      console.error(`  [fail] ${post.slug}: no image data returned`);
      return false;
    }

    const rawBuffer = Buffer.from(imageData, 'base64');
    const rawKB = (rawBuffer.length / 1024).toFixed(0);
    const compressedSize = await compressImage(rawBuffer, post.slug);
    const compressedKB = (compressedSize / 1024).toFixed(0);

    updateFrontmatter(post.filePath, post.slug);
    console.log(
      `  [done] ${post.slug}.jpg (${rawKB} KB raw -> ${compressedKB} KB compressed)`
    );
    return true;
  } catch (err: any) {
    console.error(`  [fail] ${post.slug}: ${err.message || err}`);
    return false;
  }
}

async function main() {
  let posts: PostMeta[];

  if (all) {
    posts = getPostsNeedingImages();
    console.log(`Found ${posts.length} posts missing featured images.\n`);
  } else {
    const post = getPost(slugArg!);
    if (!post) {
      console.error(`Post not found: ${slugArg}.mdx`);
      process.exit(1);
    }
    posts = [post];
  }

  if (posts.length === 0) {
    console.log('All posts already have featured images.');
    return;
  }

  if (dryRun) {
    console.log('--- DRY RUN (no API calls) ---\n');
    for (const p of posts) {
      console.log(`  ${p.slug}`);
      console.log(`    title: ${p.title}`);
      console.log(`    category: ${p.category}`);
      console.log(`    prompt: ${buildPrompt(p).slice(0, 120)}...`);
      console.log();
    }
    console.log(`Would generate ${posts.length} images.`);
    return;
  }

  const client = new OpenAI();
  let success = 0;
  let fail = 0;

  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];
    console.log(`[${i + 1}/${posts.length}] ${post.slug}`);
    const ok = await generateImage(client, post);
    if (ok) success++;
    else fail++;

    if (i < posts.length - 1) {
      await new Promise((r) => setTimeout(r, 1500));
    }
  }

  console.log(`\nDone. ${success} generated, ${fail} failed.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
