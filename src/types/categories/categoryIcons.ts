// The icon set the frontend can render; categories store one of these names.
export const CATEGORY_ICONS = [
  'cart',
  'utensils',
  'coffee',
  'bus',
  'car',
  'plane',
  'home',
  'bills',
  'phone',
  'clothes',
  'books',
  'leisure',
  'gift',
  'gym',
  'salary',
  'other',
] as const;

export type CategoryIcon = (typeof CATEGORY_ICONS)[number];

export function isCategoryIcon(value: unknown): value is CategoryIcon {
  return CATEGORY_ICONS.includes(value as CategoryIcon);
}
