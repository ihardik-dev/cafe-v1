const { execSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const ffmpeg = require('ffmpeg-static');
const src = path.resolve(__dirname, '../assets-src/hero-original.mp4');
const outDir = path.resolve(__dirname, '../public/video');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const method = process.argv[2] || 'cropzoom'; // 'delogo' or 'cropzoom'

let filterDesktop = 'crop=1200:675:0:0,scale=1280:720';
let filterMobile = 'crop=1200:675:0:0,scale=720:-2';

if (method === 'delogo') {
  filterDesktop = 'delogo=x=1128:y=568:w=64:h=64';
  filterMobile = 'delogo=x=1128:y=568:w=64:h=64,scale=720:-2';
}

console.log(`Encoding with method: ${method}...`);

console.log('1. Encoding desktop all-intra hero video (hero.mp4)...');
execSync(
  `"${ffmpeg}" -y -i "${src}" -an -vf "${filterDesktop}" -c:v libx264 -g 1 -pix_fmt yuv420p -movflags +faststart -crf 23 "${path.join(outDir, 'hero.mp4')}"`,
  { stdio: 'inherit' },
);

console.log('2. Encoding mobile all-intra hero video (hero-mobile.mp4)...');
execSync(
  `"${ffmpeg}" -y -i "${src}" -an -vf "${filterMobile}" -c:v libx264 -g 1 -pix_fmt yuv420p -movflags +faststart -crf 24 "${path.join(outDir, 'hero-mobile.mp4')}"`,
  { stdio: 'inherit' },
);

console.log('3. Extracting first frame poster (hero-poster.jpg)...');
execSync(
  `"${ffmpeg}" -y -ss 00:00:00 -i "${path.join(outDir, 'hero.mp4')}" -frames:v 1 -q:v 2 "${path.join(outDir, 'hero-poster.jpg')}"`,
  { stdio: 'inherit' },
);

console.log('\n=== Hero Video Preparation Complete ===');
const desktopStat = fs.statSync(path.join(outDir, 'hero.mp4'));
const mobileStat = fs.statSync(path.join(outDir, 'hero-mobile.mp4'));
const posterStat = fs.statSync(path.join(outDir, 'hero-poster.jpg'));

console.log(`hero.mp4:        ${(desktopStat.size / (1024 * 1024)).toFixed(2)} MB (Budget: 8.00 MB)`);
console.log(`hero-mobile.mp4: ${(mobileStat.size / (1024 * 1024)).toFixed(2)} MB (Budget: 4.00 MB)`);
console.log(`hero-poster.jpg: ${(posterStat.size / 1024).toFixed(2)} KB`);
