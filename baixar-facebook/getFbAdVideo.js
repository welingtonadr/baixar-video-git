// getFbAdVideo.js
// Script para extrair e baixar automaticamente o vídeo MP4 de um anúncio do Facebook Ads Library na melhor qualidade

const fs = require('fs');
const puppeteer = require('puppeteer');
const { execSync } = require('child_process');

(async () => {
  const adID = process.argv[2];
  if (!adID) {
    console.error('Uso: node getFbAdVideo.js <AdID>');
    process.exit(1);
  }

  // 1) Carrega cookies do Facebook (formato Netscape)
  const raw = fs.readFileSync('cookies.txt', 'utf8');
  const cookieLines = raw.split(/\r?\n/).filter(line => line && !line.startsWith('#'));
  const cookies = cookieLines.map(line => {
    const parts = line.split(/\t+/);
    if (parts.length < 7) return null;
    return { name: parts[5], value: parts[6], url: 'https://facebook.com' };
  }).filter(Boolean);

  // 2) Inicia Puppeteer
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
    '(KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36'
  );
  await page.setCookie(...cookies);

  // 3) Navega na página de Ads Library onde está a tag <video>
  const libraryUrl = `https://www.facebook.com/ads/library/?id=${adID}`;
  console.log('Navegando em', libraryUrl);
  await page.goto(libraryUrl, { waitUntil: 'networkidle2' });

  // 4) Aguarda a tag <video> e extrai o src
  await page.waitForSelector('video[src]', { timeout: 10000 });
  const videoLink = await page.$eval('video[src]', el => el.src);

  console.log('\nLink completo do MP4:\n', videoLink);

  // 5) Baixar o vídeo
  const outputFile = `${adID}.mp4`;
  console.log(`\nIniciando download para ${outputFile}...`);
  try {
    if (videoLink.includes('.mp4')) {
      // Link direto para arquivo MP4, usar curl
      execSync(
        `curl.exe -k -L -b cookies.txt "${videoLink}" -o "${outputFile}"`,
        { stdio: 'inherit' }
      );
    } else {
      // Usar yt-dlp para formatos adaptativos
      const outputTemplate = `${adID}.%(ext)s`;
      execSync(
        `yt-dlp --cookies cookies.txt -f bestvideo+bestaudio --merge-output-format mp4 -o "${outputTemplate}" "${videoLink}"`,
        { stdio: 'inherit' }
      );
    }
    console.log(`Download concluído: ${outputFile}`);
  } catch (err) {
    console.error('Erro ao baixar o vídeo:', err);
  }

  await browser.close();
})();
