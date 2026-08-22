const fs = require('fs');
const { PNG } = require('pngjs');

function processCrispPNG(inputPath, outputPath) {
  fs.createReadStream(inputPath)
    .pipe(new PNG({ filterType: 4 }))
    .on('parsed', function () {
      let minX = this.width, minY = this.height, maxX = 0, maxY = 0;

      // 1. Find bounding box of subject
      for (let y = 0; y < this.height; y++) {
        for (let x = 0; x < this.width; x++) {
          const idx = (this.width * y + x) << 2;
          const r = this.data[idx];
          const g = this.data[idx + 1];
          const b = this.data[idx + 2];

          // If not dark background
          if (r > 30 || g > 30 || b > 30) {
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
          } else {
            // Background to 100% transparent
            this.data[idx + 3] = 0;
          }
        }
      }

      console.log(`Bounding box for ${outputPath}: [${minX}, ${minY}, ${maxX}, ${maxY}]`);

      // Crop to tight bounding box for maximum sharpness
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
        console.log('Successfully saved crisp tightly cropped PNG:', outputPath);
      });
    });
}

const dir = 'C:/Users/jhh88/.gemini/antigravity/brain/251e14ad-c38a-4cc4-bbb6-a6784b41f619/.user_uploaded';

processCrispPNG(dir + '/media__1786284160110.png', 'assets/self_assessment_icon.png');
processCrispPNG(dir + '/media__1786284160116.png', 'assets/brain_game_icon.png');
