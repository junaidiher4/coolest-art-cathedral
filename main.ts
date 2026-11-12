import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const src = join(root, 'entry.png');
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const out = join(outDir, 'entry.png');
const MAX_IMAGE_BYTES = 1048576; // 1 MiB

if (!existsSync(src)) {
  throw new Error(`entry.png is missing from the repository (looked at ${src})`);
}

const buf = readFileSync(src);

if (buf.length === 0) {
  throw new Error('entry.png is empty');
}

const pngMagic = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const jpegMagic = Buffer.from([0xff, 0xd8, 0xff]);
const isPng = buf.length >= 8 && buf.subarray(0, 8).equals(pngMagic);
const isJpeg = buf.length >= 3 && buf.subarray(0, 3).equals(jpegMagic);

if (!isPng && !isJpeg) {
  throw new Error('entry.png is not a PNG or JPEG image');
}

if (buf.length > MAX_IMAGE_BYTES) {
  throw new Error(`entry.png is larger than 1 MiB (${buf.length} bytes)`);
}

mkdirSync(outDir, { recursive: true });
writeFileSync(out, buf);
