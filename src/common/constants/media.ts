export const MediaEntityType = {
  STORE: 'store',
  CATEGORY: 'category',
  DEAL: 'deal',
  COUPON: 'coupon',
} as const;
export type MediaEntityType = (typeof MediaEntityType)[keyof typeof MediaEntityType];

export const MEDIA_ENTITY_TYPES: readonly MediaEntityType[] = [
  MediaEntityType.STORE,
  MediaEntityType.CATEGORY,
  MediaEntityType.DEAL,
  MediaEntityType.COUPON,
];
