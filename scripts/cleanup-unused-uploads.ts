import fs from 'node:fs';
import path from 'node:path';

const UPLOADS_DIR = path.resolve('public/uploads');
const POSTS_DIR = path.resolve('src/content/posts');
const SCAN_DIRS = ['src'];

const dryRun = process.argv.includes('--dry-run');

function getAllUploadFiles(): Set<string> {
  const files = new Set<string>();
  for (const f of fs.readdirSync(UPLOADS_DIR)) {
    if (f === '.DS_Store') continue;
    files.add(f);
  }
  return files;
}

function findReferencedUploads(): Set<string> {
  const referenced = new Set<string>();
  const pattern = /\/uploads\/([^\s)"']+)/g;

  function scanFile(filePath: string) {
    const content = fs.readFileSync(filePath, 'utf-8');
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(content)) !== null) {
      referenced.add(match[1]);
    }
    pattern.lastIndex = 0;
  }

  function scanDir(dir: string) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory() && entry.name !== 'node_modules') {
        scanDir(full);
      } else if (/\.(astro|ts|tsx|mdx|md|css|js|json)$/.test(entry.name)) {
        scanFile(full);
      }
    }
  }

  for (const d of SCAN_DIRS) {
    scanDir(path.resolve(d));
  }

  return referenced;
}

const allFiles = getAllUploadFiles();
const referenced = findReferencedUploads();
const unused = [...allFiles].filter((f) => !referenced.has(f));

console.log(`Total files in uploads/: ${allFiles.size}`);
console.log(`Referenced in codebase:  ${referenced.size}`);
console.log(`Unused files:           ${unused.length}`);

const totalBytes = unused.reduce(
  (sum, f) => sum + fs.statSync(path.join(UPLOADS_DIR, f)).size,
  0
);
console.log(`Unused size:            ${(totalBytes / 1024 / 1024).toFixed(1)} MB`);

if (dryRun) {
  console.log('\n--- DRY RUN (no files deleted) ---');
  unused.slice(0, 20).forEach((f) => console.log(`  would delete: ${f}`));
  if (unused.length > 20) console.log(`  ... and ${unused.length - 20} more`);
  process.exit(0);
}

console.log(`\nDeleting ${unused.length} unused files...`);
let deleted = 0;
for (const f of unused) {
  fs.unlinkSync(path.join(UPLOADS_DIR, f));
  deleted++;
}
console.log(`Done. Deleted ${deleted} files.`);
