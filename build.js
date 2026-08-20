const sharp = require('sharp');
const fs = require('fs');

const SIZE = 512;
const INK = '#24292F';       // 统一深灰（品牌/功能图标）

const OUT_DIR = './icons/';

const logos = [
  ['ChatGPT.png', 'src/openai.svg'],
  ['GitHub.png',  'src/github.svg'],
  ['X.png',       'src/x.svg'],
  ['Reddit.png',  'src/reddit.svg'],
  ['Telegram.png','src/telegram.svg'],
  ['YouTube.png', 'src/youtube.svg'],
  ['Global.png',  'src/fa-globe.svg'],
  ['Final.png',   'src/fa-shield-halved.svg'],
];
const flags = [
  ['HK.png', 'src/hk.svg'],
  ['TW.png', 'src/tw.svg'],
  ['JP.png', 'src/jp.svg'],
  ['KR.png', 'src/kr.svg'],
  ['SG.png', 'src/sg.svg'],
  ['US.png', 'src/us.svg'],
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
    targetW = targetH = Math.round(SIZE * 0.72);   // 单色 logo 占画布 72%
  } else {
    targetW = Math.round(SIZE * 0.96);             // 4:3 国旗铺满宽度的 96%
    targetH = Math.round(targetW * 3 / 4);
  }

  const logo = await sharp(svg, { density: 600 }).resize(targetW, targetH).png().toBuffer();

  // 透明画布，内容居中，无白底卡片
  await sharp({
    create: { width: SIZE, height: SIZE, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite([{ input: logo, gravity: 'center' }])
    .png()
    .toFile(OUT_DIR + out);
  console.log('made', out);
}

(async () => {
  for (const [out, src] of logos) await make(out, src, 'logo');
  for (const [out, src] of flags) await make(out, src, 'flag');
  console.log('ALL DONE');
})().catch(e => { console.error(e); process.exit(1); });
