import { readFile } from 'node:fs/promises';
import path from 'node:path';
// Literal paths let Next trace the immutable study assets without changing UI
// build configuration or duplicating27MB into the original production cache.
const readers: Record<string,()=>Promise<Buffer>> = {
 "ef049d17-0da4-4445-88bb-e4b8558cedd1.png":()=>readFile(path.join(process.cwd(),"seed/experiments/ab-test/ef049d17-0da4-4445-88bb-e4b8558cedd1.png")),
 "958fa300-aede-49da-9ae1-6a140d19dbce.png":()=>readFile(path.join(process.cwd(),"seed/experiments/ab-test/958fa300-aede-49da-9ae1-6a140d19dbce.png")),
 "651508fc-45ad-4d12-8225-1c85c343aa91.png":()=>readFile(path.join(process.cwd(),"seed/experiments/ab-test/651508fc-45ad-4d12-8225-1c85c343aa91.png")),
 "5ad31f43-8a97-42ce-baae-09989effe759.png":()=>readFile(path.join(process.cwd(),"seed/experiments/ab-test/5ad31f43-8a97-42ce-baae-09989effe759.png")),
 "92b0702a-5d7d-449e-939f-c7ea499d4b5e.png":()=>readFile(path.join(process.cwd(),"seed/experiments/ab-test/92b0702a-5d7d-449e-939f-c7ea499d4b5e.png")),
 "6067441a-035f-448e-afbe-22af42aa06c7.png":()=>readFile(path.join(process.cwd(),"seed/experiments/ab-test/6067441a-035f-448e-afbe-22af42aa06c7.png")),
 "08f4ca5f-00e4-4a4b-ab2b-58b844afbb85.png":()=>readFile(path.join(process.cwd(),"seed/experiments/ab-test/08f4ca5f-00e4-4a4b-ab2b-58b844afbb85.png")),
 "f269554d-0f92-4178-91ef-5f8f655b02e5.png":()=>readFile(path.join(process.cwd(),"seed/experiments/ab-test/f269554d-0f92-4178-91ef-5f8f655b02e5.png")),
 "291ac920-a7b5-4fbf-9eb3-374a9122caa6.png":()=>readFile(path.join(process.cwd(),"seed/experiments/ab-test/291ac920-a7b5-4fbf-9eb3-374a9122caa6.png")),
 "55aa9274-1dc0-4f7c-8b77-e20cfdd8ca58.png":()=>readFile(path.join(process.cwd(),"seed/experiments/ab-test/55aa9274-1dc0-4f7c-8b77-e20cfdd8ca58.png")),
 "e9b35eb6-6bf1-4aaf-99f6-6c76c4b66015.png":()=>readFile(path.join(process.cwd(),"seed/experiments/ab-test/e9b35eb6-6bf1-4aaf-99f6-6c76c4b66015.png")),
 "1c95115e-ed2c-444d-a1fd-4fadbc3e80f7.png":()=>readFile(path.join(process.cwd(),"seed/experiments/ab-test/1c95115e-ed2c-444d-a1fd-4fadbc3e80f7.png")),
};
export async function GET(_request:Request,context:{params:Promise<{filename:string}>}) {
 const {filename}=await context.params;
 if(!Object.hasOwn(readers,filename)) return new Response('Not found',{status:404});
 try {
  const bytes=await readers[filename]();
  return new Response(new Uint8Array(bytes),{headers:{'Content-Type':'image/png','Cache-Control':'public, max-age=31536000, immutable','X-Content-Type-Options':'nosniff'}});
 }catch{return new Response('Not found',{status:404});}
}
