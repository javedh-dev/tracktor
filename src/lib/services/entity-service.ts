import type { Response } from '$lib/domain';
import { apiClient } from '$lib/helper/api.helper';
import { uploadFile } from './file.service';

export function extractApiError(e: unknown, fallback: string): string {
  const err = e as { response?: { data?: { message?: string } } };
  return err.response?.data?.message || fallback;
}

interface EntityServiceOptions<T extends { id?: string | null; vehicleId: string }> {
  basePath: string;
  fileField?: 'attachment' | 'image';
  serialize?: (entity: T) => Record<string, unknown>;
}

export function createEntityService<T extends { id?: string | null; vehicleId: string }>(
  options: EntityServiceOptions<T>
) {
  const { basePath, fileField = 'attachment', serialize } = options;

  function buildUrl(entity: T): string {
    const suffix = entity.id || '';
    return `/vehicles/${entity.vehicleId}/${basePath}/${suffix}`;
  }

  function getMethod(entity: T): 'post' | 'put' {
    return entity.id ? 'put' : 'post';
  }

  function preparePayload(entity: T): Record<string, unknown> {
    return serialize ? serialize(entity) : (entity as Record<string, unknown>);
  }

  async function save(entity: T): Promise<Response<T>> {
    const res: Response<T> = { status: 'OK' };
    try {
      const method = getMethod(entity);
      const response = await apiClient[method](buildUrl(entity), preparePayload(entity));
      res.data = response.data;
    } catch (e: unknown) {
      res.status = 'ERROR';
      res.error = extractApiError(e, `Failed to save.`);
    }
    return res;
  }

  async function saveWithAttachment(
    entity: T,
    attachment: File | undefined,
    removeExisting: boolean = false
  ): Promise<Response<T>> {
    if (attachment) {
      try {
        const res = await uploadFile(attachment);
        (entity as Record<string, unknown>)[fileField] = res.data.filename || null;
      } catch (e: unknown) {
        return {
          status: 'ERROR' as const,
          error: extractApiError(e, 'Failed to upload attachment')
        };
      }
    }

    if (removeExisting) {
      (entity as Record<string, unknown>)[fileField] = null;
    } else if (!attachment && entity.id) {
      const payload = { ...entity };
      delete (payload as Record<string, unknown>)[fileField];
      return save(payload as T);
    }

    return save(entity);
  }

  async function deleteEntity(entity: T): Promise<Response<string>> {
    const res: Response<string> = { status: 'OK' };
    try {
      await apiClient.delete(buildUrl(entity));
      res.data = entity.id as string;
    } catch (e: unknown) {
      res.status = 'ERROR';
      res.error = extractApiError(e, `Failed to delete.`);
    }
    return res;
  }

  return { save, saveWithAttachment, delete: deleteEntity };
}
