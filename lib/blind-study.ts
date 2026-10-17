import { createHash } from 'node:crypto';
import { z } from 'zod';
import experiment from '../seed/experiments/ab-test/result.json';
import { shotSchema } from './db';
import type { Shot } from './types';

const studySchema=z.object({status:z.literal('completed'),projectId:z.literal('mara'),shots:z.array(shotSchema).length(12)});
/** Separate eval corpus: never append to the original production takes. */
export function validatedStudyShots(value: unknown): Shot[] {
 const parsed=studySchema.safeParse(value);
 if(!parsed.success || new Set(parsed.data.shots.map(s=>s.id)).size!==12) return [];
 const shots=parsed.data.shots;
 if(shots.some(s=>s.projectId!=='mara' || s.checks.length!==4 || !['ring_hand','scar_side','scarf_color','hair'].every(key=>s.checks.some(c=>c.key===key))))return [];
 // Stable opaque ordering avoids exposing paired A/B generation order.
 return [...shots].sort((a,b)=>createHash('sha256').update(a.id).digest('hex').localeCompare(createHash('sha256').update(b.id).digest('hex')));
}
export function studyShots(projectId:string) {return projectId==='mara'?validatedStudyShots(experiment):[];}
export function evaluationShots(projectId:string, original:Shot[]) {
 const study=studyShots(projectId),ids=new Set(study.map(s=>s.id));
 return [...study,...original.filter(s=>!ids.has(s.id))];
}
export function blindQuestions(shots:Shot[],referenceImageUrl:string) {
 const priority=(key:string)=>key==='ring_hand'?0:key==='scar_side'?1:2;
 return shots.flatMap(shot=>[...shot.checks].sort((a,b)=>priority(a.key)-priority(b.key)).map(check=>({shotId:shot.id,attributeKey:check.key,expected:check.expected,imageUrl:shot.imageUrl,referenceImageUrl})));
}
