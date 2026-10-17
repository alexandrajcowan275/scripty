// Offline-only: uses Sharp already installed with Next. Never changes originals.
import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import sharp from 'sharp';
const root=process.cwd();
const out=path.resolve(process.argv[2] || '/private/tmp/scripty-optimized-images');
await fs.mkdir(out,{recursive:true});
const cache=JSON.parse(await fs.readFile('seed/cache/manifest.json','utf8'));
const study=JSON.parse(await fs.readFile('seed/experiments/ab-test/result.json','utf8'));
const sources=new Map();
for(const {shots} of cache.batches) for(const shot of shots) {
 const filename=path.basename(shot.imageUrl);
 sources.set(shot.imageUrl,path.join(root,'seed/cache/images',filename));
}
for(const shot of study.shots) sources.set(`/api/study/images/${shot.id}.png`,path.join(root,'seed/experiments/ab-test',`${shot.id}.png`));
sources.set('/seed/mara-reference.png',path.join(root,'public/seed/mara-reference.png'));
sources.set('/api/locations/mara-platform/image',path.join(root,'experiments/worldlabs/standard-camera-view.png'));
const manifest={}; const totals={sources:sources.size,originalBytes:0,reviewBytes:0,thumbnailBytes:0,largestReviewBytes:0};
for(const [url,source] of sources) {
 const bytes=await fs.readFile(source),meta=await sharp(bytes).metadata();
 const hash=createHash('sha256').update(bytes).update('webp-v1-q78-thumb72').digest('hex').slice(0,24);
 const entry={originalUrl:url,width:meta.width,height:meta.height,originalSha256:createHash('sha256').update(bytes).digest('hex')};
 for(const [width,quality,key] of [[480,72,'thumbnail'],[1200,78,'review']]) {
  const filename=`${hash}-${width}.webp`;
  const encoded=await sharp(bytes).rotate().resize({width,withoutEnlargement:true}).webp({quality,effort:5}).toBuffer();
  await fs.writeFile(path.join(out,filename),encoded);
  entry[`${key}Url`]=`/images/renditions/${filename}`;
  entry[`${key}Bytes`]=encoded.length;
  totals[`${key}Bytes`]+=encoded.length;
  if(key==='review')totals.largestReviewBytes=Math.max(totals.largestReviewBytes,encoded.length);
 }
 manifest[url]=entry;totals.originalBytes+=bytes.length;
}
await fs.writeFile('lib/image-renditions.json',JSON.stringify(manifest,null,2)+'\n');
console.log(JSON.stringify({output:out,...totals,reviewReductionPercent:100*(1-totals.reviewBytes/totals.originalBytes)},null,2));
