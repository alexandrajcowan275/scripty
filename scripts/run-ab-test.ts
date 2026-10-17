/** Explicitly paid, founder-authorized 6-pair experiment. Never runs in CI. */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash, randomUUID } from 'node:crypto';
import path from 'node:path';
import { loadLocalEnv } from './env';
import { generateImage } from '../lib/generate';
import { monitorImage, MONITOR_VERSION } from '../lib/monitor';
import { buildFinalPrompt } from '../lib/rules';
import { serverDatabase, uploadShotImage } from '../lib/db';
import { imageConfiguration, monitorConfiguration } from '../lib/engine-config';
import seed from '../seed/mara.json';
import cache from '../seed/cache/manifest.json';
import type { Character, Rule, Shot } from '../lib/types';

const directory = path.resolve('seed/experiments/ab-test');
const filename = path.join(directory, 'result.json');
const scenes = [
 'Frontal medium portrait on a rain-wet railway platform at dawn. Mara faces the camera squarely, both eyes and eyebrows unobstructed, both hands separated at chest height as she holds a ticket in her right hand and an open notebook in her left. Her fingers, knuckles and rings are large, sharply visible. No mirrors.',
 'Frontal waist-up shot inside a quiet train carriage, soft window key light. Mara looks directly at the camera while resting both hands flat and separated on a table, palms down, every finger visible. Both sides of her face and both eyebrows are unobstructed. No mirrors.',
 'Eye-level frontal medium shot at a station ticket counter. Mara faces camera squarely, holding her right hand beside her right cheek with fingers spread, her left hand open beside her left shoulder. Keep both eyebrows, hands and fingers in sharp focus. No mirrors.',
 'Frontal seated portrait on a station bench under soft overcast light. Mara faces the viewer, both hands relaxed side by side on her knees with backs and fingers clearly visible. Frame her complete face, both eyebrows, and both hands in equal sharp focus. No mirrors.',
 'Frontal waist-up portrait in a warmly lit station waiting room. Mara looks straight toward camera; her right hand is raised holding a small key below her face, and her left hand is open at chest level. Both eyes, eyebrows, hands and rings are unobstructed and sharply visible. No mirrors.',
 'Eye-level frontal medium portrait beside a train doorway in blue-hour light. Mara faces camera and presents both hands separated at chest height, palms inward, fingers uncrossed and clearly visible. Keep the complete face and both eyebrows sharp, no occlusion, no mirrors.'
];
async function main() {
 loadLocalEnv();
 if (!process.argv.includes('--paid-authorized')) throw new Error('Explicit --paid-authorized required');
 process.env.SCRIPTY_BUDGET_SCOPE = 'ab_test';
 delete process.env.GEMINI_API_KEY; // No provider/model change between conditions.
 await mkdir(directory, {recursive:true});
 let existing: any;
 try {existing=JSON.parse(await readFile(filename,'utf8'));} catch (e) {if((e as NodeJS.ErrnoException).code!=='ENOENT')throw e;}
 if (existing) throw new Error('Experiment already exists; preserve it. No automatic rerun.');
 const character = seed.project.characters[0] as Character;
 const rules = [...new Map(cache.batches.flatMap(b=>b.rules).filter(r=>r.source!=='seed' && r.attributeKey==='ring_hand').map(r=>[r.id,r])).values()] as Rule[];
 if (rules.length!==1) throw new Error('Expected exactly one historical learned ring rule');
 const id=randomUUID();
 const result:any={id,status:'running',createdAt:new Date().toISOString(),projectId:'mara',maxUsd:3,settings:{...imageConfiguration(),size:'1536x1024',referenceImageUrl:character.referenceImageUrl,referenceSha256:createHash('sha256').update(await readFile('public'+character.referenceImageUrl)).digest('hex'),acceptedReferenceUrl:null,monitorModel:monitorConfiguration().model,monitorVersion:MONITOR_VERSION,monitorRules:[],checkerCalibration:[],threshold:0.6},character,rules,scenes,shots:[],receipts:[],humanVerified:false,limitations:['One stochastic six-pair experiment; no fixed generator seed available.','The learned ring constraint reinforces canon already present in both arms.','Primary checker uses identical canon-only requirements in both arms; learned-rule checks and calibration are excluded to keep the rubric fixed.','Monitor-reported flags are not human-verified image quality or checker accuracy.']};
 const persist=()=>writeFile(filename,JSON.stringify(result,null,2)+'\n');
 await persist();
 try {
 for(let i=0;i<scenes.length;i++) {
  // Alternate order to reduce a fixed condition/time ordering effect.
  for(const condition of (i%2?['B','A']:['A','B'])) {
   const rulesApplied=condition==='B'?rules:[];
   const shotId=randomUUID(), batchId=id+'-'+condition;
   const finalPrompt=buildFinalPrompt(scenes[i],character,rulesApplied);
   const generation=await generateImage({finalPrompt,referenceImageUrl:character.referenceImageUrl,fallbackImageUrl:character.referenceImageUrl,filename:shotId+'.png',deadline:Date.now()+120000},{upload:async(bytes,name,mime)=>{await writeFile(path.join(directory,shotId+'.png'),bytes);return uploadShotImage(bytes,name,mime);}});
   if(generation.provenance!=='openai')throw new Error('Generation failed; no fallback counted: '+generation.errors.join('; '));
   const monitored=await monitorImage({imageUrl:generation.imageUrl,character,rules:[],calibration:[],deadline:Date.now()+120000});
   const shot:Shot={id:shotId,projectId:'mara',batchId,scenePrompt:scenes[i],finalPrompt,imageUrl:generation.imageUrl,checks:monitored.checks,driftScore:monitored.driftScore,flagged:monitored.flagged,status:'pending'};
   result.shots.push({...shot,condition,pair:i+1,rulesApplied:rulesApplied.map(r=>r.id),generationUsage:generation.usage,monitorUsage:monitored.usage,monitorError:monitored.error??null});
   if(monitored.error)throw new Error('Monitor unavailable; keep image but do not report an evaluated pair');
   const {data,error}=await serverDatabase().from('api_attempts').select('id,scope,reserved_usd,cost_usd,model,usage,created_at,settled_at,released_at').eq('scope','ab_test').gte('created_at',result.createdAt);
   if(error)throw new Error('Could not verify experiment usage receipts');
   result.receipts=data;result.usageEstimatedUsd=data.reduce((s,a)=>s+Number(a.cost_usd??0),0);result.unsettledAttempts=data.filter(a=>a.settled_at===null).length;
   await persist();
   console.log(JSON.stringify({pair:i+1,condition,flagged:shot.flagged,estimatedUsd:result.usageEstimatedUsd,shots:result.shots.length}));
   if(result.usageEstimatedUsd>=3)throw new Error('Authorized $3 experiment maximum reached');
  }
 }
 const targeted=['ring_hand','scar_side'];
 result.summary=Object.fromEntries(['A','B'].map(condition=>{const shots=result.shots.filter((s:any)=>s.condition===condition);const checks=shots.flatMap((s:any)=>s.checks);const target=checks.filter((c:any)=>targeted.includes(c.key));const failures=(cs:any[])=>cs.filter(c=>!c.pass&&c.confidence>=0.6).length;const unclear=(cs:any[])=>cs.filter(c=>c.confidence<0.6).length;return[condition,{shots:shots.length,flaggedShots:shots.filter((s:any)=>s.flagged).length,targetedFlaggedShots:shots.filter((s:any)=>s.checks.some((c:any)=>targeted.includes(c.key)&&!c.pass&&c.confidence>=0.6)).length,targetedChecks:target.length,targetedFailures:failures(target),targetedUnclear:unclear(target),overallChecks:checks.length,overallFailures:failures(checks),overallUnclear:unclear(checks),attributes:Object.fromEntries(targeted.map(key=>{const cs=checks.filter((c:any)=>c.key===key);return[key,{total:cs.length,failures:failures(cs),unclear:unclear(cs)}]}))}]}));
 result.status='completed';result.completedAt=new Date().toISOString();await persist();
 console.log(JSON.stringify({status:result.status,summary:result.summary,usageEstimatedUsd:result.usageEstimatedUsd}));
 }catch(e){result.status='incomplete';result.error=e instanceof Error?e.message:'Experiment failed';await persist();throw e;}
}
main().catch(e=>{console.error(e instanceof Error?e.message:e);process.exitCode=1;});
