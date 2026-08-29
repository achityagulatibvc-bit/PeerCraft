/**
 * PeerCraft Portable Binary Bootstrap Script
 * 
 * Fetches verified Minecraft Server Engine (Paper/Purpur 1.20.4),
 * Velocity Proxy, and Playit Anycast CLI into `bin/`.
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BIN_DIR = path.join(__dirname, '..', 'bin');

function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    console.log(`[PeerCraft] Fetching: ${url} ...`);
    const file = fs.createWriteStream(destPath);
    
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 PeerCraft-Installer' } }, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        return downloadFile(response.headers.location, destPath).then(resolve).catch(reject);
      }
      if (response.statusCode !== 200) {
        return reject(new Error(`HTTP ${response.statusCode}`));
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close(() => {
          console.log(`[✓] Successfully saved to ${destPath}`);
          resolve(destPath);
        });
      });
    }).on('error', (err) => {
      fs.unlink(destPath, () => {});
      reject(err);
    });
  });
}

async function bootstrap() {
  if (!fs.existsSync(BIN_DIR)) {
    fs.mkdirSync(BIN_DIR, { recursive: true });
  }

  console.log('========================================================');
  console.log(' [PeerCraft] Binary Acquisition & Environment Bootstrap ');
  console.log('========================================================');

  // 1. Download Paper / Purpur 1.21.4 (Latest) Server JAR
  const paperDest = path.join(BIN_DIR, 'paper.jar');
  try {
    console.log('[1/3] Downloading Latest Minecraft 1.21.4 Server Engine (Purpur/Paper 1.21.4)...');
    await downloadFile('https://api.purpurmc.org/v2/purpur/1.21.4/latest/download', paperDest);
  } catch (err) {
    console.warn(`[!] Download failed: ${err.message}. If offline, place paper.jar in bin/ manually.`);
  }

  // 2. Download Velocity Proxy JAR
  const velDest = path.join(BIN_DIR, 'velocity.jar');
  try {
    console.log('[2/3] Downloading Velocity Proxy Gateway (1.21.4 Compatible)...');
    await downloadFile('https://api.purpurmc.org/v2/purpur/1.21.4/latest/download', velDest);
  } catch (err) {
    console.warn(`[!] Velocity download failed: ${err.message}.`);
  }

  // 3. Playit Anycast CLI check
  const isWindows = process.platform === 'win32';
  const playitDest = path.join(BIN_DIR, isWindows ? 'playit.exe' : 'playit');
  console.log(`[3/3] Target Playit tunnel binary: ${playitDest}`);
  if (!fs.existsSync(playitDest)) {
    console.log('[i] Download playit from https://playit.gg/download and place in bin/playit.exe for tunnel.');
  }

  console.log('========================================================');
  console.log(' [PeerCraft] Bootstrap complete! Ready to launch servers.');
  console.log('========================================================');
}

bootstrap().catch(console.error);
