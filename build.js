const sharp = require('sharp');
const fs = require('fs');

const SIZE = 512;
const RADIUS = 116;          // iOS 风格圆角
const INK = '#24292F';       // 统一深灰（品牌/功能图标）

const OUT_DIR = '/Users/liuzhihang/Library/Mobile Documents/iCloud~com~ruikq~decar/Documents/loon-icons/icons/';

const logos = [
  ['ChatGPT.png', 'openai.svg'],
  ['GitHub.png',  'github.svg'],
  ['X.png',       'x.svg'],
  ['Reddit.png',  'reddit.svg'],
  ['Telegram.png','telegram.svg'],
  ['YouTube.png', 'youtube.svg'],
  ['Global.png',  'fa-globe.svg'],
  ['Final.png',   'fa-shield-halved.svg'],
];
const flags = [
  ['HK.png', 'hk.svg'],
  ['TW.png', 'tw.svg'],
  ['JP.png', 'jp.svg'],
  ['KR.png', 'kr.svg'],
  ['SG.png', 'sg.svg'],
  ['US.png', 'us.svg'],
];

function recolor(svg, color) {
  let s = svg.replace(/fill="[^"]*"/g, '');
  s = s.replace(/<path /g, `<path fill="${color}" `);
  return s;
}

async function make(out, src, kind) {
  const raw = fs.readFileSync(src, 'utf8');
  const svg = Buffer.from(kind === 'logo' ? recolor(raw, INK) : raw);

  let targetW, targetH;
  if (kind === 'logo') {
    targetW = targetH = Math.round(SIZE * 0.56);
  } else {
    targetW = Math.round(SIZE * 0.88);   // 4:3 国旗，卡片内居中留白
    targetH = Math.round(targetW * 3 / 4);
  }

  const logo = await sharp(svg, { density: 600 }).resize(targetW, targetH).png().toBuffer();
  const mask = Buffer.from(
    `<svg width="${SIZE}" height="${SIZE}"><rect width="${SIZE}" height="${SIZE}" rx="${RADIUS}" fill="#fff"/></svg>`
  );

  await sharp({ create: { width: SIZE, height: SIZE, channels: 4, background: '#FFFFFF' } })
    .composite([
      { input: logo, gravity: 'center' },
      { input: mask, blend: 'dest-in' },
    ])
    .png()
    .toFile(OUT_DIR + out);
  console.log('made', out);
}

(async () => {
  for (const [out, src] of logos) await make(out, src, 'logo');
  for (const [out, src] of flags) await make(out, src, 'flag');
  console.log('ALL DONE');
})().catch(e => { console.error(e); process.exit(1); });
