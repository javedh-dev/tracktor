import type { PollutionCertificate } from '$lib/domain/pucc';
import { createEntityService } from './entity-service';

const { saveWithAttachment, delete: remove } = createEntityService<PollutionCertificate>({
  basePath: 'pucc'
});

export const savePollutionCertificateWithAttachment = saveWithAttachment;
export const deletePollutionCertificate = remove;
