const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const publicDir = path.join(__dirname, 'public');

const tasks = [
  { src: 'icon.svg', dest: 'icon-192.png', size: 192 },
  { src: 'icon.svg', dest: 'icon-512.png', size: 512 },
  { src: 'icon-maskable.svg', dest: 'icon-maskable-192.png', size: 192 },
  { src: 'icon-maskable.svg', dest: 'icon-maskable-512.png', size: 512 },
];

async function generate() {
  console.log('Generating PWA PNG icons from vector assets...');
  for (const task of tasks) {
    const inputPath = path.join(publicDir, task.src);
    const outputPath = path.join(publicDir, task.dest);

    if (fs.existsSync(inputPath)) {
      try {
        await sharp(inputPath)
          .resize(task.size, task.size)
          .png()
          .toFile(outputPath);
        console.log(`✓ Successfully generated ${task.dest} (${task.size}x${task.size})`);
      } catch (err) {
        console.error(`✗ Error generating ${task.dest}:`, err);
      }
    } else {
      console.warn(`! Source file ${task.src} not found`);
    }
  }
}

generate().catch(console.error);
