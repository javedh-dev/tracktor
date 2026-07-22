import type { Insurance } from '$lib/domain';
import { createEntityService } from './entity-service';

const {
  save,
  saveWithAttachment,
  delete: remove
} = createEntityService<Insurance>({
  basePath: 'insurance'
});

export const saveInsurance = save;
export const saveInsuranceWithAttachment = saveWithAttachment;
export const deleteInsurance = remove;
