const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

function convertBlackToTransparent(inputPath, outputPath) {
  return new Promise((resolve, reject) => {
    fs.createReadStream(inputPath)
      .pipe(new PNG({ filterType: 4 }))
      .on('parsed', function () {
        for (let y = 0; y < this.height; y++) {
          for (let x = 0; x < this.width; x++) {
            const idx = (this.width * y + x) << 2;
            const r = this.data[idx];
            const g = this.data[idx + 1];
            const b = this.data[idx + 2];

            // Black/dark background threshold
            if (r < 45 && g < 45 && b < 45) {
              this.data[idx + 3] = 0; // Alpha transparent
            }
          }
        }
        this.pack()
          .pipe(fs.createWriteStream(outputPath))
          .on('finish', () => {
            console.log('Saved transparent PNG:', outputPath);
            resolve();
          })
          .on('error', reject);
      });
  });
}

const dir = 'C:/Users/jhh88/.gemini/antigravity/brain/251e14ad-c38a-4cc4-bbb6-a6784b41f619/.user_uploaded';

async function main() {
  await convertBlackToTransparent(dir + '/media__1786284160110.png', 'assets/self_assessment_icon.png');
  await convertBlackToTransparent(dir + '/media__1786284160116.png', 'assets/brain_game_icon.png');
  console.log('All icons converted to pristine transparent PNGs!');
}

main().catch(console.error);
