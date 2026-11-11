const { execSync } = require('node:child_process');
const path = require('node:path');
const fs = require('node:fs');

const ffmpeg = require('ffmpeg-static');
const src = path.resolve(__dirname, '../assets-src/hero-original.mp4');
const vdir = path.resolve(__dirname, '../assets-src/verification');

if (!fs.existsSync(vdir)) {
  fs.mkdirSync(vdir, { recursive: true });
}

const timestamps = [0, 3, 6, 9];

for (const t of timestamps) {
  // 1. Original corner
  execSync(`"${ffmpeg}" -y -ss ${t} -i "${src}" -vf "crop=160:160:1120:550" -frames:v 1 -q:v 2 "${path.join(vdir, `corner-orig-${t}s.jpg`)}"`);

  // 2. Delogo corner
  execSync(`"${ffmpeg}" -y -ss ${t} -i "${src}" -vf "delogo=x=1128:y=568:w=64:h=64,crop=160:160:1120:550" -frames:v 1 -q:v 2 "${path.join(vdir, `corner-delogo-${t}s.jpg`)}"`);

  // 3. Zoom-crop corner (pushes the watermark out of frame by 5% scale)
  execSync(`"${ffmpeg}" -y -ss ${t} -i "${src}" -vf "crop=1200:675:0:0,scale=1280:720,crop=160:160:1120:550" -frames:v 1 -q:v 2 "${path.join(vdir, `corner-cropzoom-${t}s.jpg`)}"`);
}

console.log('Frames extracted to:', vdir);
const files = fs.readdirSync(vdir);
console.log(files);

