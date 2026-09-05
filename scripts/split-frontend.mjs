import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { basename, dirname, join } from 'node:path';

const root = new URL('..', import.meta.url);
const pageNames = [
  'index',
  'atlas',
  'handcricket',
  'matricks',
  'npat',
  'penfight',
  'sps',
  'thiefpolice'
];

const frontendRoot = new URL('../frontend/', import.meta.url);
await mkdir(new URL('css/', frontendRoot), { recursive: true });
await mkdir(new URL('js/', frontendRoot), { recursive: true });

for (const pageName of pageNames) {
  const pageUrl = new URL(`../${pageName}.html`, import.meta.url);
  const pagePath = basename(pageUrl.pathname);
  let html = await readFile(pageUrl, 'utf8');

  const styleMatch = html.match(/  <style>\r?\n([\s\S]*?)  <\/style>/);
  const scriptMatch = html.match(/  <script>\r?\n([\s\S]*?)  <\/script>/);

  if (!styleMatch || !scriptMatch) {
    console.log(`Skipped ${pagePath}; assets are already separated.`);
    continue;
  }

  await writeFile(new URL(`css/${pageName}.css`, frontendRoot), styleMatch[1]);
  await writeFile(new URL(`js/${pageName}.js`, frontendRoot), `${scriptMatch[1]}\n`);

  html = html.replace(styleMatch[0], `  <link rel="stylesheet" href="frontend/css/${pageName}.css">`);
  html = html.replace(scriptMatch[0], `  <script src="frontend/js/${pageName}.js"></script>`);
  await writeFile(pageUrl, html);
}

console.log(`Extracted frontend assets for ${pageNames.length} pages.`);