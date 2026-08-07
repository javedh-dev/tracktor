import type { FuelLog } from '$lib/domain/fuel';
import { createEntityService } from './entity-service';

const {
  save,
  saveWithAttachment,
  delete: remove
} = createEntityService<FuelLog>({
  basePath: 'fuel-logs'
});

export const saveFuelLog = save;
export const saveFuelLogWithAttachment = saveWithAttachment;
export const deleteFuelLog = remove;
