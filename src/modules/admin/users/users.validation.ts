import { z } from 'zod';
import { UserRole, UserStatus } from '../../../common/constants/enums';
import { optionalObjectIdNullable } from '../../../common/validation/params';

const roleEnum = z.enum([UserRole.ADMIN, UserRole.EDITOR, UserRole.VIEWER, UserRole.MODERATOR]);
const statusEnum = z.enum([UserStatus.ACTIVE, UserStatus.DISABLED]);

export const createUserSchema = z.object({
  username: z.string().min(1).max(120),
  password: z.string().min(8).max(256),
  role: roleEnum,
  networkId: optionalObjectIdNullable,
});

export const updateUserSchema = z
  .object({
    username: z.string().min(1).max(120).optional(),
    password: z.string().min(8).max(256).optional(),
    role: roleEnum.optional(),
    networkId: optionalObjectIdNullable,
  })
  .refine((v) => Object.keys(v).length > 0, { message: 'At least one field is required' });

export const userStatusBodySchema = z.object({
  status: statusEnum,
});

export const userPermissionsBodySchema = z.object({
  enabledPermissionIds: z.array(z.string().min(1)).default([]),
});
