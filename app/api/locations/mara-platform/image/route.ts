import {readFile} from 'node:fs/promises';
import path from 'node:path';
/** Existing reviewed capture, never a new generation request. */
export async function GET() {
 try {
  const bytes=await readFile(path.join(process.cwd(),'experiments/worldlabs/standard-camera-view.png'));
  return new Response(new Uint8Array(bytes),{headers:{'Content-Type':'image/png','Cache-Control':'public, max-age=31536000, immutable','X-Content-Type-Options':'nosniff'}});
 }catch{return new Response('Location still unavailable',{status:404});}
}
