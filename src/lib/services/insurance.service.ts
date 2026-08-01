import type { Insurance } from '$lib/domain/insurance';
import { createEntityService } from './entity-service';

const { saveWithAttachment, delete: remove } = createEntityService<Insurance>({
  basePath: 'insurance'
});

export const saveInsuranceWithAttachment = saveWithAttachment;
export const deleteInsurance = remove;
