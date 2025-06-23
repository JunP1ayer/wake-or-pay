const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputSvg = path.join(__dirname, '../public/icons/icon.svg');
const publicDir = path.join(__dirname, '../public');

async function generateFavicons() {
  // Generate favicon.png (32x32)
  await sharp(inputSvg)
    .resize(32, 32)
    .png()
    .toFile(path.join(publicDir, 'favicon.png'));
  console.log('Generated favicon.png');

  // Generate favicon.ico (multiple sizes)
  const icoSizes = [16, 32, 48];
  const icoBuffers = [];
  
  for (const size of icoSizes) {
    const buffer = await sharp(inputSvg)
      .resize(size, size)
      .png()
      .toBuffer();
    icoBuffers.push(buffer);
  }
  
  // Note: For proper ICO generation, you'd need a specialized library
  // For now, just use the 32x32 PNG as ICO
  await sharp(inputSvg)
    .resize(32, 32)
    .png()
    .toFile(path.join(publicDir, 'favicon.ico'));
  console.log('Generated favicon.ico');
}

generateFavicons();