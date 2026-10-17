/** Reviewed existing experiment; no paid generation or location-checking claim. */
import world from '../experiments/worldlabs/result.json';
export const maraLocations = [{
 id: 'mara-platform', name: 'Dawn railway platform',
 imageUrl: '/api/locations/mara-platform/image',
 marbleUrl: world.world_marble_url,
 provenance: 'marble_capture' as const,
 marbleAccess: 'permission_required' as const,
 model: world.model,
 capturedStill: 'experiments/worldlabs/standard-camera-view.png',
}];
