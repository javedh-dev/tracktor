import type { PollutionCertificate } from '$lib/domain';
import { createEntityService } from './entity-service';

const {
  save,
  saveWithAttachment,
  delete: remove
} = createEntityService<PollutionCertificate>({
  basePath: 'pucc'
});

export const savePucc = save;
export const savePuccWithAttachment = saveWithAttachment;
export const deletePucc = remove;

export const savePollutionCertificate = save;
export const savePollutionCertificateWithAttachment = saveWithAttachment;
export const deletePollutionCertificate = remove;
