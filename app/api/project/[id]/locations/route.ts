import { maraLocations } from '@/lib/locations';
import { apiError, projectIdSchema } from '@/lib/engine-http';
import { ownedProduction } from '@/lib/productions';
export async function GET(request: Request, context: {params: Promise<{id:string}>}) {
 try {
  const id=projectIdSchema.parse((await context.params).id);
  if (id!=='mara') await ownedProduction(request,id);
  return Response.json({locations:id==='mara'?maraLocations:[]},{headers:{'Cache-Control':'no-store'}});
 }catch(error){return apiError(error);}
}
