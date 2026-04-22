/**
 * Permission identifiers aligned with the admin "Assign Role" UI.
 * @see blog-site/app/users/roles/page.tsx PERMISSIONS
 */
export const PERMISSION_IDS = [
  'general-settings',
  'add-user',
  'edit-user',
  'add-network',
  'edit-network',
  'add-categories',
  'edit-categories',
  'add-stores',
  'edit-stores',
  'add-coupons',
  'edit-coupons',
  'add-deals',
  'edit-deals',
  'add-blog',
  'edit-blog',
] as const;

export type PermissionId = (typeof PERMISSION_IDS)[number];

export function isPermissionId(value: string): value is PermissionId {
  return (PERMISSION_IDS as readonly string[]).includes(value);
}
