import type { Compliance } from '$lib/domain/compliance';
import { createEntityService } from './entity-service';

const { saveWithAttachment, delete: remove } = createEntityService<Compliance>({
  basePath: 'compliance'
});

export const saveComplianceWithAttachment = saveWithAttachment;
export const deleteComplianceDocument = remove;
