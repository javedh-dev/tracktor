import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { requestAccess } from '$server/services/access';

export const load: PageServerLoad = async (event) => {
  if (requestAccess(event).role !== 'admin') throw error(403, 'Administrator access required');
  return {};
};
