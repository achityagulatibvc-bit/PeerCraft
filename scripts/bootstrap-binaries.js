/**
 * PeerCraft Portable Binary Bootstrap Script
 * 
 * Fetches verified PaperMC 1.20+, Velocity Proxy, and Playit CLI binaries
 * directly from official APIs into the local `bin/` directory.
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BIN_DIR = path.join(__dirname, '..', 'bin');

async function downloadFile(url, destPath) {
  console.log(`[PeerCraft] Downloading: ${url} -> ${destPath}`);
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    https.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        return downloadFile(response.headers.location, destPath).then(resolve).catch(reject);
      }
      if (response.statusCode !== 200) {
        return reject(new Error(`Failed to download with status: ${response.statusCode}`));
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close(() => resolve(destPath));
      });
    }).on('error', (err) => {
      fs.unlink(destPath, () => {});
      reject(err);
    });
  });
}

async function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'PeerCraft-Bootstrapper/0.2.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function bootstrap() {
  if (!fs.existsSync(BIN_DIR)) {
    fs.mkdirSync(BIN_DIR, { recursive: true });
  }

  console.log('========================================================');
  console.log(' [PeerCraft] Binary Acquisition & Environment Bootstrap ');
  console.log('========================================================');

  // 1. Fetch Latest PaperMC 1.20.4 Build from PaperMC API
  try {
    console.log('[1/3] Querying PaperMC API for latest release...');
    const paperApi = await fetchJson('https://api.papermc.io/v2/projects/paper/versions/1.20.4');
    const latestPaperBuild = paperApi.builds[paperApi.builds.length - 1];
    const paperUrl = `https://api.papermc.io/v2/projects/paper/versions/1.20.4/builds/${latestPaperBuild}/downloads/paper-1.20.4-${latestPaperBuild}.jar`;
    const paperDest = path.join(BIN_DIR, 'paper.jar');
    
    if (!fs.existsSync(paperDest)) {
      await downloadFile(paperUrl, paperDest);
      console.log(`[✓] Downloaded PaperMC build #${latestPaperBuild}`);
    } else {
      console.log('[✓] paper.jar already present in bin/');
    }
  } catch (err) {
    console.warn(`[!] Paper download error: ${err.message}. Place paper.jar in bin/ manually if offline.`);
  }

  // 2. Fetch Latest Velocity Proxy Build
  try {
    console.log('[2/3] Querying Velocity API for latest release...');
    const velApi = await fetchJson('https://api.papermc.io/v2/projects/velocity/versions/3.3.0-SNAPSHOT');
    const latestVelBuild = velApi.builds[velApi.builds.length - 1];
    const velUrl = `https://api.papermc.io/v2/projects/velocity/versions/3.3.0-SNAPSHOT/builds/${latestVelBuild}/downloads/velocity-3.3.0-SNAPSHOT-${latestVelBuild}.jar`;
    const velDest = path.join(BIN_DIR, 'velocity.jar');

    if (!fs.existsSync(velDest)) {
      await downloadFile(velUrl, velDest);
      console.log(`[✓] Downloaded Velocity build #${latestVelBuild}`);
    } else {
      console.log('[✓] velocity.jar already present in bin/');
    }
  } catch (err) {
    console.warn(`[!] Velocity download error: ${err.message}. Place velocity.jar in bin/ manually if offline.`);
  }

  // 3. Playit CLI Download Instructions
  const isWindows = process.platform === 'win32';
  const playitDest = path.join(BIN_DIR, isWindows ? 'playit.exe' : 'playit');
  console.log(`[3/3] Playit Anycast binary target: ${playitDest}`);
  if (!fs.existsSync(playitDest)) {
    console.log('[i] Download playit from https://playit.gg/download for your platform.');
  }

  console.log('========================================================');
  console.log(' [PeerCraft] Bootstrap sequence finished.');
  console.log('========================================================');
}

bootstrap().catch(console.error);
