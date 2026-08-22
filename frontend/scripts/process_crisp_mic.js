const fs = require('fs');
const { PNG } = require('pngjs');

// Process user uploaded mic image or high-res mic PNG with precise alpha blending
const inputPath = 'C:/Users/jhh88/.gemini/antigravity/brain/251e14ad-c38a-4cc4-bbb6-a6784b41f619/.user_uploaded/media__1786284833707.png';
const outputPath = 'C:/Users/jhh88/Desktop/toktoktok/assets/studio_mic_icon.png';

fs.createReadStream(inputPath)
  .pipe(new PNG({ filterType: 4 }))
  .on('parsed', function () {
    let minX = this.width, minY = this.height, maxX = 0, maxY = 0;

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const idx = (this.width * y + x) << 2;
        const r = this.data[idx];
        const g = this.data[idx + 1];
        const b = this.data[idx + 2];

        // Background grid/white removal with smooth alpha edge preservation
        const isWhiteOrGrid = (r > 230 && g > 230 && b > 230) || (r > 220 && g > 220 && b > 220 && Math.abs(r - g) < 5 && Math.abs(g - b) < 5);
        
        if (isWhiteOrGrid) {
          this.data[idx + 3] = 0;
        } else {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    console.log(`Mic crop bounds: [${minX}, ${minY}, ${maxX}, ${maxY}]`);

    const cropW = maxX - minX + 1;
    const cropH = maxY - minY + 1;
    const cropped = new PNG({ width: cropW, height: cropH });

    for (let y = 0; y < cropH; y++) {
      for (let x = 0; x < cropW; x++) {
        const srcIdx = (this.width * (minY + y) + (minX + x)) << 2;
        const dstIdx = (cropW * y + x) << 2;
        cropped.data[dstIdx]     = this.data[srcIdx];
        cropped.data[dstIdx + 1] = this.data[srcIdx + 1];
        cropped.data[dstIdx + 2] = this.data[srcIdx + 2];
        cropped.data[dstIdx + 3] = this.data[srcIdx + 3];
      }
    }

    cropped.pack().pipe(fs.createWriteStream(outputPath)).on('finish', () => {
      console.log('Successfully saved crisp high-DPI studio mic PNG:', outputPath);
    });
  });
