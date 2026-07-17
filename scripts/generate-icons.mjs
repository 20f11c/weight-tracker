import sharp from 'sharp';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const svgPath = resolve(__dirname, '../src/assets/logo.svg');
const svg = readFileSync(svgPath);
const androidResDir = resolve(__dirname, '../android/app/src/main/res');

// Android icon densities
const sizes = [
  { dir: 'mipmap-mdpi', size: 48 },
  { dir: 'mipmap-hdpi', size: 72 },
  { dir: 'mipmap-xhdpi', size: 96 },
  { dir: 'mipmap-xxhdpi', size: 144 },
  { dir: 'mipmap-xxxhdpi', size: 192 },
];

for (const { dir, size } of sizes) {
  const buf = await sharp(svg).resize(size, size).png().toBuffer();
  await sharp(buf).toFile(`${androidResDir}/${dir}/ic_launcher.png`);
  await sharp(buf).toFile(`${androidResDir}/${dir}/ic_launcher_round.png`);
  await sharp(buf).toFile(`${androidResDir}/${dir}/ic_launcher_foreground.png`);
  console.log(`  ${dir}: ${size}x${size} ✓`);
}

// Splash icon (large for splash screen center)
await sharp(svg).resize(288, 288).png().toFile(`${androidResDir}/drawable/splash_icon.png`);
console.log('  drawable/splash_icon.png: 288x288 ✓');

// Web splash icon
await sharp(svg).resize(1024, 1024).png().toFile(`${__dirname}/../src/assets/splash-icon.png`);
console.log('  src/assets/splash-icon.png: 1024x1024 ✓');

console.log('\nAll icons generated successfully!');
