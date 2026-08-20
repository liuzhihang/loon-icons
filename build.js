const sharp = require('sharp');
const fs = require('fs');

const SIZE = 512;
const TILE_SIZE = 416;
const TILE_OFFSET = (SIZE - TILE_SIZE) / 2;
const TILE_RADIUS = 104;

const OUT_DIR = './icons/';

const logos = [
  { out: 'ChatGPT.png', src: 'src/openai.svg',            from: '#FFFFFF', to: '#F2F3F5', ink: '#0D0D0D', stroke: '#0F172A', strokeOpacity: 0.12, scale: 0.64 },
  { out: 'GitHub.png',  src: 'src/github.svg',            from: '#30363D', to: '#0D1117', scale: 0.66 },
  { out: 'X.png',       src: 'src/x.svg',                 from: '#303030', to: '#050505', scale: 0.58 },
  { out: 'Reddit.png',  src: 'src/reddit.svg',            from: '#FF6A36', to: '#FF4500', scale: 0.68 },
  { out: 'Telegram.png',src: 'src/telegram.svg',          from: '#39B3EA', to: '#168AC0', scale: 0.68 },
  { out: 'YouTube.png', src: 'src/youtube.svg',           from: '#FF3B3B', to: '#E60000', scale: 0.68 },
  { out: 'Global.png',  src: 'src/fa-globe.svg',          from: '#5B7CFA', to: '#3154C9', scale: 0.62 },
  { out: 'Final.png',   src: 'src/fa-shield-halved.svg',  from: '#8B6CF7', to: '#5B3FBF', scale: 0.62 },
];
const flags = [
  { out: 'HK.png', src: 'src/hk.svg', position: 'centre' },
  { out: 'TW.png', src: 'src/tw.svg', position: 'left' },
  { out: 'JP.png', src: 'src/jp.svg', position: 'centre' },
  { out: 'KR.png', src: 'src/kr.svg', position: 'centre' },
  { out: 'SG.png', src: 'src/sg.svg', position: 'left' },
  { out: 'US.png', src: 'src/us.svg', position: 'left' },
];

function monochrome(svg, color) {
  const withoutFill = svg.replace(/\sfill="[^"]*"/g, '');
  return withoutFill.replace(/<svg\b/, `<svg fill="${color}"`);
}

function tileSvg(from, to, stroke, strokeOpacity) {
  return Buffer.from(`
    <svg width="${SIZE}" height="${SIZE}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="tile" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="${from}"/>
          <stop offset="1" stop-color="${to}"/>
        </linearGradient>
      </defs>
      <rect x="${TILE_OFFSET}" y="${TILE_OFFSET}" width="${TILE_SIZE}" height="${TILE_SIZE}"
        rx="${TILE_RADIUS}" fill="url(#tile)"/>
      <rect x="${TILE_OFFSET + 3}" y="${TILE_OFFSET + 3}" width="${TILE_SIZE - 6}" height="${TILE_SIZE - 6}"
        rx="${TILE_RADIUS - 3}" fill="none" stroke="${stroke}" stroke-opacity="${strokeOpacity}" stroke-width="6"/>
    </svg>
  `);
}

function roundedMask() {
  return Buffer.from(`
    <svg width="${TILE_SIZE}" height="${TILE_SIZE}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${TILE_SIZE}" height="${TILE_SIZE}" rx="${TILE_RADIUS}" fill="#fff"/>
    </svg>
  `);
}

async function makeShadow() {
  const svg = Buffer.from(`
    <svg width="${SIZE}" height="${SIZE}" xmlns="http://www.w3.org/2000/svg">
      <rect x="${TILE_OFFSET + 6}" y="${TILE_OFFSET + 12}" width="${TILE_SIZE - 12}" height="${TILE_SIZE - 12}"
        rx="${TILE_RADIUS - 6}" fill="#0F172A" fill-opacity="0.2"/>
    </svg>
  `);
  return sharp(svg).blur(12).png().toBuffer();
}

async function makeLogo(icon, shadow) {
  const raw = fs.readFileSync(icon.src, 'utf8');
  const logoSize = Math.round(TILE_SIZE * icon.scale);
  const logo = await sharp(Buffer.from(monochrome(raw, icon.ink || '#FFFFFF')), { density: 600 })
    .resize(logoSize, logoSize, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();

  await sharp({
    create: { width: SIZE, height: SIZE, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite([
      { input: shadow },
      { input: tileSvg(icon.from, icon.to, icon.stroke || '#FFFFFF', icon.strokeOpacity ?? 0.18) },
      { input: logo, gravity: 'center' },
    ])
    .png()
    .toFile(OUT_DIR + icon.out);
  console.log('made', icon.out);
}

async function makeFlag(icon, shadow) {
  const raw = fs.readFileSync(icon.src);
  const flag = await sharp(raw, { density: 600 })
    .resize(TILE_SIZE, TILE_SIZE, { fit: 'cover', position: icon.position })
    .composite([{ input: roundedMask(), blend: 'dest-in' }])
    .png()
    .toBuffer();

  await sharp({
    create: { width: SIZE, height: SIZE, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite([
      { input: shadow },
      { input: flag, gravity: 'center' },
      { input: tileSvg('transparent', 'transparent', '#0F172A', 0.16) },
    ])
    .png()
    .toFile(OUT_DIR + icon.out);
  console.log('made', icon.out);
}

(async () => {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const shadow = await makeShadow();
  for (const icon of logos) await makeLogo(icon, shadow);
  for (const icon of flags) await makeFlag(icon, shadow);
  console.log('ALL DONE');
})().catch(e => { console.error(e); process.exit(1); });
