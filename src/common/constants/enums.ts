/** Stored values; map to UI labels in presenters when needed. */

export const UserStatus = {
  ACTIVE: 'ACTIVE',
  DISABLED: 'DISABLED',
} as const;
export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus];

export const UserRole = {
  ADMIN: 'admin',
  EDITOR: 'editor',
  VIEWER: 'viewer',
  MODERATOR: 'moderator',
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const NetworkStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
} as const;
export type NetworkStatus = (typeof NetworkStatus)[keyof typeof NetworkStatus];

export const StoreStatus = {
  ACTIVE: 'ACTIVE',
  DRAFT: 'DRAFT',
  DISABLED: 'DISABLED',
} as const;
export type StoreStatus = (typeof StoreStatus)[keyof typeof StoreStatus];

export const HttpStatus = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE: 422,
  INTERNAL: 500,
} as const;
