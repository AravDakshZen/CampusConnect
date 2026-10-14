import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(__dirname, '../public');

// CRC32 table & function
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[n] = c >>> 0;
}

function crc32(buf) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xFF];
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function makeChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);

  const toCrc = Buffer.concat([typeBuf, data]);
  const crcVal = crc32(toCrc);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crcVal, 0);

  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

function createPng(width, height, renderPixel) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8); // bit depth 8
  ihdrData.writeUInt8(6, 9); // RGBA
  ihdrData.writeUInt8(0, 10);
  ihdrData.writeUInt8(0, 11);
  ihdrData.writeUInt8(0, 12);
  const ihdrChunk = makeChunk('IHDR', ihdrData);

  // Scanlines
  const rowBytes = 1 + width * 4;
  const rawData = Buffer.alloc(rowBytes * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowBytes;
    rawData[rowOffset] = 0; // filter None
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = renderPixel(x, y, width, height);
      const pxOffset = rowOffset + 1 + x * 4;
      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  const compressed = zlib.deflateSync(rawData, { level: 9 });
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// Draw REC Campus Connect Emblem
// Primary: #681B97 (104, 27, 151), Secondary: #4A126D (74, 18, 109), Accent: #8A2BB8 (138, 43, 184), Gold: #F59E0B (245, 158, 11), White: #FFFFFF (255, 255, 255)
function drawRecIcon(x, y, w, h, isMaskable = false) {
  const cx = w / 2;
  const cy = h / 2;
  const dx = x - cx;
  const dy = y - cy;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const maxR = w / 2;

  // Maskable icons need a safe zone (inner 80%) with full bleed background
  const cornerRadius = isMaskable ? 0 : w * 0.22;

  // Background rounded rectangle check for non-maskable
  if (!isMaskable) {
    // Check rounded rect boundaries
    const hw = w / 2;
    const hh = h / 2;
    const qx = Math.abs(x - hw) - (hw - cornerRadius);
    const qy = Math.abs(y - hh) - (hh - cornerRadius);
    const isOutside = (qx > 0 && qy > 0 && Math.sqrt(qx * qx + qy * qy) > cornerRadius);
    if (isOutside) {
      return [0, 0, 0, 0]; // transparent outside rounded corner
    }
  }

  // Gradient background: from center-top #7E22CE / #681B97 to bottom #3B0D54
  const gradT = Math.min(1, Math.max(0, (y / h) * 0.8 + (dist / maxR) * 0.3));
  const bgR = Math.round(104 * (1 - gradT * 0.4) + 60 * gradT * 0.4);
  const bgG = Math.round(27 * (1 - gradT * 0.5) + 12 * gradT * 0.5);
  const bgB = Math.round(151 * (1 - gradT * 0.3) + 90 * gradT * 0.3);

  // Decorative subtle inner ring
  const ringRadius = maxR * (isMaskable ? 0.65 : 0.72);
  const ringDist = Math.abs(dist - ringRadius);
  let isRing = ringDist < (w * 0.012);

  // Central shield / emblem geometry
  // Shield width ~ 55% of width, height ~ 60% of height
  const scale = isMaskable ? 0.75 : 0.9;
  const sx = dx / scale;
  const sy = (y - cy * 0.95) / scale;

  // Shield outline check
  const sw = w * 0.24;
  const sh = h * 0.28;
  const inShieldTop = (sy >= -sh && sy <= 0 && Math.abs(sx) <= sw);
  const inShieldBottom = (sy > 0 && sy <= sh && Math.abs(sx) <= sw * (1 - (sy / sh) * (sy / sh)));
  const inShield = inShieldTop || inShieldBottom;

  // Shield border
  const bThick = w * 0.02;
  const inBorderTop = (sy >= -sh - bThick && sy <= 0 && Math.abs(sx) <= sw + bThick);
  const inBorderBottom = (sy > 0 && sy <= sh + bThick && Math.abs(sx) <= (sw + bThick) * (1 - (sy / (sh + bThick)) * (sy / (sh + bThick))));
  const inBorder = (inBorderTop || inBorderBottom) && !inShield;

  // Gold accent band at top of shield
  const inGoldBand = inShield && (sy >= -sh && sy <= -sh * 0.75);

  // Simplified "REC" emblem letter geometry inside shield
  // Center of shield is at sx=0, sy ~ 0
  const isLetterR = (sx >= -sw * 0.75 && sx <= -sw * 0.15 && sy >= -sh * 0.5 && sy <= sh * 0.5) && (
    (Math.abs(sx - (-sw * 0.65)) <= w * 0.02) || // R vertical stem
    (sy <= -sh * 0.4 && sx <= -sw * 0.2) || // R top bar
    (Math.abs(sy - (-sh * 0.05)) <= w * 0.018 && sx <= -sw * 0.2) || // R mid bar
    (sx >= -sw * 0.25 && sy >= -sh * 0.45 && sy <= -sh * 0.05) || // R curve right
    (sy >= -sh * 0.05 && sx >= -sw * 0.5 + (sy - (-sh * 0.05)) * 0.7 && sx <= -sw * 0.4 + (sy - (-sh * 0.05)) * 0.7) // R leg
  );

  const isLetterE = (sx >= -sw * 0.08 && sx <= sw * 0.35 && sy >= -sh * 0.5 && sy <= sh * 0.5) && (
    (Math.abs(sx - (-sw * 0.02)) <= w * 0.02) || // E vertical stem
    (sy <= -sh * 0.4 && sx <= sw * 0.35) || // E top bar
    (Math.abs(sy - 0) <= w * 0.018 && sx <= sw * 0.25) || // E mid bar
    (sy >= sh * 0.4 && sx <= sw * 0.35) // E bottom bar
  );

  const isLetterC = (sx >= sw * 0.45 && sx <= sw * 0.85 && sy >= -sh * 0.5 && sy <= sh * 0.5) && (
    (Math.abs(sx - (sw * 0.5)) <= w * 0.02) || // C vertical spine
    (sy <= -sh * 0.4 && sx >= sw * 0.5) || // C top bar
    (sy >= sh * 0.4 && sx >= sw * 0.5) // C bottom bar
  );

  // Network connection dots around shield
  const dots = [
    { x: cx - w * 0.32, y: cy - h * 0.18, r: w * 0.028 },
    { x: cx + w * 0.32, y: cy - h * 0.18, r: w * 0.028 },
    { x: cx - w * 0.26, y: cy + h * 0.22, r: w * 0.024 },
    { x: cx + w * 0.26, y: cy + h * 0.22, r: w * 0.024 },
    { x: cx, y: cy + h * 0.35, r: w * 0.026 },
    { x: cx, y: cy - h * 0.36, r: w * 0.026 },
  ];

  for (const dot of dots) {
    const ddx = x - dot.x;
    const ddy = y - dot.y;
    if (ddx * ddx + ddy * ddy <= dot.r * dot.r) {
      return [245, 158, 11, 255]; // Amber/Gold dot
    }
  }

  if (isLetterR || isLetterE || isLetterC) {
    return [255, 255, 255, 255]; // White letters
  }

  if (inGoldBand) {
    return [245, 158, 11, 255]; // Gold accent band
  }

  if (inBorder) {
    return [217, 119, 6, 255]; // Gold border
  }

  if (inShield) {
    // Deep purple shield interior
    return [85, 18, 125, 255];
  }

  if (isRing) {
    return [168, 85, 247, 120]; // Translucent purple ring
  }

  return [bgR, bgG, bgB, 255];
}

// Generate the icons
console.log('Generating PWA Icons for Rajalakshmi Engineering College...');

const iconConfigs = [
  { file: 'pwa-64x64.png', size: 64, maskable: false },
  { file: 'pwa-192x192.png', size: 192, maskable: false },
  { file: 'pwa-512x512.png', size: 512, maskable: false },
  { file: 'maskable-icon-512x512.png', size: 512, maskable: true },
  { file: 'apple-touch-icon.png', size: 180, maskable: false },
];

for (const cfg of iconConfigs) {
  const buf = createPng(cfg.size, cfg.size, (x, y, w, h) => drawRecIcon(x, y, w, h, cfg.maskable));
  const outPath = path.join(publicDir, cfg.file);
  fs.writeFileSync(outPath, buf);
  console.log(`✓ Generated ${cfg.file} (${cfg.size}x${cfg.size}, ${buf.length} bytes)`);
}

// Also create a modern vector SVG icon for favicon.svg & pwa vector
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#8A2BB8" />
      <stop offset="50%" stop-color="#681B97" />
      <stop offset="100%" stop-color="#3B0D54" />
    </linearGradient>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FCD34D" />
      <stop offset="100%" stop-color="#D97706" />
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="12" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Background with rounded corners -->
  <rect width="512" height="512" rx="112" fill="url(#bgGrad)" />

  <!-- Outer ambient ring -->
  <circle cx="256" cy="256" r="200" fill="none" stroke="#C084FC" stroke-width="4" stroke-opacity="0.35" stroke-dasharray="12 8" />

  <!-- Academic Shield with Gold Border -->
  <path d="M 256,96 L 376,140 C 376,270 256,360 256,360 C 256,360 136,270 136,140 Z" fill="#4A126D" stroke="url(#goldGrad)" stroke-width="10" filter="url(#glow)" />

  <!-- Gold Top Crest Accent -->
  <path d="M 146,148 L 256,108 L 366,148 L 366,180 L 146,180 Z" fill="url(#goldGrad)" />

  <!-- Connected Network Orbit Nodes -->
  <line x1="256" y1="96" x2="256" y2="52" stroke="#F59E0B" stroke-width="4" stroke-linecap="round" />
  <circle cx="256" cy="48" r="14" fill="#F59E0B" />

  <line x1="376" y1="140" x2="424" y2="120" stroke="#F59E0B" stroke-width="4" stroke-linecap="round" />
  <circle cx="430" cy="116" r="12" fill="#F59E0B" />

  <line x1="136" y1="140" x2="88" y2="120" stroke="#F59E0B" stroke-width="4" stroke-linecap="round" />
  <circle cx="82" cy="116" r="12" fill="#F59E0B" />

  <line x1="256" y1="360" x2="256" y2="416" stroke="#F59E0B" stroke-width="4" stroke-linecap="round" />
  <circle cx="256" cy="424" r="14" fill="#F59E0B" />

  <circle cx="96" cy="310" r="10" fill="#E9D5FF" opacity="0.8" />
  <line x1="136" y1="270" x2="96" y2="310" stroke="#E9D5FF" stroke-width="3" opacity="0.6" stroke-dasharray="4 4" />

  <circle cx="416" cy="310" r="10" fill="#E9D5FF" opacity="0.8" />
  <line x1="376" y1="270" x2="416" y2="310" stroke="#E9D5FF" stroke-width="3" opacity="0.6" stroke-dasharray="4 4" />

  <!-- Prominent "REC" Typography -->
  <text x="256" y="278" font-family="'Inter', system-ui, -apple-system, sans-serif" font-size="78" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="4">REC</text>

  <!-- Tagline Banner -->
  <text x="256" y="318" font-family="'Inter', system-ui, -apple-system, sans-serif" font-size="18" font-weight="700" fill="#FDE68A" text-anchor="middle" letter-spacing="2">CAMPUS CONNECT</text>
</svg>`;

fs.writeFileSync(path.join(publicDir, 'favicon.svg'), svgContent);
fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgContent);
console.log('✓ Generated favicon.svg and icon.svg');
