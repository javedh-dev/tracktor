import { z } from 'zod';

export const roleSchema = z.enum(['admin', 'driver']);
export const usernameSchema = z.string().trim().min(3).max(128);
export const passwordSchema = z
  .string()
  .min(6)
  .refine(
    (value) => new TextEncoder().encode(value).length <= 72,
    'Password must be at most 72 UTF-8 bytes'
  );
export const credentialsSchema = z.object({ username: usernameSchema, password: passwordSchema });
export const createManagedUserSchema = credentialsSchema.extend({
  role: roleSchema.default('driver')
});
export const updateManagedUserSchema = z
  .object({ role: roleSchema.optional(), isActive: z.boolean().optional() })
  .strict();
export const assignmentSchema = z
  .object({ vehicleIds: z.array(z.string().min(1)).max(10000) })
  .strict();
