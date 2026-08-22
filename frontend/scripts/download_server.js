const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3333;
const ASSETS_DIR = path.join(__dirname, 'assets');

const server = http.createServer((req, res) => {
  if (req.url === '/' || req.url === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`
      <!DOCTYPE html>
      <html lang="ko">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>톡톡톡 아이콘 다운로드</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
          body { background-color: #f6f8fb; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; padding: 20px; color: #1e2540; }
          .container { background: #ffffff; border-radius: 24px; padding: 40px; width: 100%; max-width: 600px; box-shadow: 0 10px 30px rgba(62,76,125,0.08); text-align: center; border: 1px solid #e2e7f0; }
          h1 { font-size: 26px; font-weight: 800; color: #3e4c7d; margin-bottom: 8px; }
          p { color: #64748b; font-size: 15px; margin-bottom: 32px; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
          .card { background: #f8fafc; border: 1px solid #e2e7f0; border-radius: 20px; padding: 24px; display: flex; flex-direction: column; align-items: center; gap: 16px; }
          .img-box { width: 100px; height: 100px; background: #ffffff; border-radius: 16px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.04); padding: 12px; }
          .img-box img { max-width: 100%; max-height: 100%; object-fit: contain; }
          .card-title { font-size: 17px; font-weight: 700; color: #1e2540; }
          .btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; background: #3e4c7d; color: #ffffff; text-decoration: none; padding: 12px 20px; border-radius: 12px; font-weight: 700; font-size: 14px; transition: background 0.2s; width: 100%; }
          .btn:hover { background: #2e3a66; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>📦 톡톡톡 커스텀 아이콘 다운로드</h1>
          <p>버튼을 클릭하면 고화질 PNG 파일이 내 컴퓨터에 즉시 저장됩니다.</p>
          <div class="grid">
            <div class="card">
              <div class="img-box">
                <img src="/download/self_assessment_icon.png" alt="자가 체크" />
              </div>
              <div class="card-title">1. 자가 체크 아이콘</div>
              <a href="/download/self_assessment_icon.png" download="자가체크_아이콘.png" class="btn">
                ⬇️ PNG 다운로드
              </a>
            </div>
            <div class="card">
              <div class="img-box">
                <img src="/download/brain_game_icon.png" alt="두뇌 훈련 게임" />
              </div>
              <div class="card-title">2. 두뇌 훈련 게임 아이콘</div>
              <a href="/download/brain_game_icon.png" download="두뇌훈련게임_아이콘.png" class="btn">
                ⬇️ PNG 다운로드
              </a>
            </div>
          </div>
        </div>
      </body>
      </html>
    `);
  } else if (req.url.startsWith('/download/')) {
    const filename = path.basename(req.url);
    const filepath = path.join(ASSETS_DIR, filename);

    if (fs.existsSync(filepath)) {
      res.writeHead(200, {
        'Content-Type': 'image/png',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
      });
      fs.createReadStream(filepath).pipe(res);
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('File not found');
    }
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
  }
});

server.listen(PORT, () => {
  console.log(`Icon Download Server running at http://localhost:${PORT}`);
});
