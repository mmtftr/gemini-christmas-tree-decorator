import { TreeProduct, OrnamentProduct, TopperProduct } from '../types';

// ============================================
// TREE PRODUCTS
// ============================================

export const TREE_PRODUCTS: TreeProduct[] = [
  {
    id: 'tree-small',
    name: 'Petite Pine',
    size: 'small',
    heightFt: 4,
    description: 'Perfect for apartments and small spaces. A charming tabletop option.',
    price: {
      amount: 4900,
      currency: 'chf',
      stripePriceId: 'price_tree_small',
    },
    inStock: true,
    leadTimeDays: 7,
  },
  {
    id: 'tree-medium',
    name: 'Classic Fir',
    size: 'medium',
    heightFt: 6,
    description: 'The traditional family-sized tree. Ideal for living rooms.',
    price: {
      amount: 8900,
      currency: 'chf',
      stripePriceId: 'price_tree_medium',
    },
    inStock: true,
    leadTimeDays: 10,
  },
  {
    id: 'tree-large',
    name: 'Grand Spruce',
    size: 'large',
    heightFt: 8,
    description: 'A statement piece for large rooms and high ceilings.',
    price: {
      amount: 14900,
      currency: 'chf',
      stripePriceId: 'price_tree_large',
    },
    inStock: true,
    leadTimeDays: 14,
  },
];

// ============================================
// ORNAMENT PRODUCTS
// ============================================

export const ORNAMENT_PRODUCTS: OrnamentProduct[] = [
  {
    id: 'orn-sphere',
    type: 'sphere',
    name: 'Classic Ball',
    description: 'Timeless glass ball ornament with a reflective finish.',
    price: {
      amount: 599,
      currency: 'chf',
      stripePriceId: 'price_orn_sphere',
    },
    category: 'classic',
    inStock: true,
  },
  {
    id: 'orn-cube',
    type: 'cube',
    name: 'Geometric Cube',
    description: 'Modern geometric design with metallic sheen.',
    price: {
      amount: 799,
      currency: 'chf',
      stripePriceId: 'price_orn_cube',
    },
    category: 'shapes',
    inStock: true,
  },
  {
    id: 'orn-diamond',
    type: 'diamond',
    name: 'Crystal Diamond',
    description: 'Elegant diamond-cut ornament that catches the light beautifully.',
    price: {
      amount: 999,
      currency: 'chf',
      stripePriceId: 'price_orn_diamond',
    },
    category: 'classic',
    inStock: true,
  },
  {
    id: 'orn-giftbox',
    type: 'giftBox',
    name: 'Gift Box',
    description: 'Adorable wrapped present ornament with ribbon detail.',
    price: {
      amount: 899,
      currency: 'chf',
      stripePriceId: 'price_orn_giftbox',
    },
    category: 'festive',
    inStock: true,
  },
  {
    id: 'orn-snowflake',
    type: 'snowflake',
    name: 'Snowflake',
    description: 'Delicate six-pointed snowflake with subtle glow.',
    price: {
      amount: 699,
      currency: 'chf',
      stripePriceId: 'price_orn_snowflake',
    },
    category: 'festive',
    inStock: true,
  },
  {
    id: 'orn-heart',
    type: 'heart',
    name: 'Heart',
    description: 'Romantic heart-shaped ornament with premium finish.',
    price: {
      amount: 799,
      currency: 'chf',
      stripePriceId: 'price_orn_heart',
    },
    category: 'shapes',
    inStock: true,
  },
];

// ============================================
// TOPPER PRODUCTS
// ============================================

export const TOPPER_PRODUCTS: TopperProduct[] = [
  {
    id: 'top-star',
    type: 'star',
    name: 'Golden Star',
    description: 'Classic five-pointed star with brilliant gold finish and LED glow.',
    price: {
      amount: 1499,
      currency: 'chf',
      stripePriceId: 'price_top_star',
    },
    inStock: true,
  },
  {
    id: 'top-snowflake',
    type: 'snowflake',
    name: 'Crystal Snowflake',
    description: 'Elegant snowflake topper with sparkling crystal details.',
    price: {
      amount: 1299,
      currency: 'chf',
      stripePriceId: 'price_top_snowflake',
    },
    inStock: true,
  },
];

// ============================================
// PRODUCT LOOKUP HELPERS
// ============================================

export function getTreeProduct(id: string): TreeProduct | undefined {
  return TREE_PRODUCTS.find((p) => p.id === id);
}

export function getTreeProductBySize(size: 'small' | 'medium' | 'large'): TreeProduct | undefined {
  return TREE_PRODUCTS.find((p) => p.size === size);
}

export function getOrnamentProduct(id: string): OrnamentProduct | undefined {
  return ORNAMENT_PRODUCTS.find((p) => p.id === id);
}

export function getOrnamentProductByType(type: string): OrnamentProduct | undefined {
  return ORNAMENT_PRODUCTS.find((p) => p.type === type);
}

export function getTopperProduct(id: string): TopperProduct | undefined {
  return TOPPER_PRODUCTS.find((p) => p.id === id);
}

export function getTopperProductByType(type: string): TopperProduct | undefined {
  return TOPPER_PRODUCTS.find((p) => p.type === type);
}

// ============================================
// PRODUCT CATEGORIES FOR UI
// ============================================

export const ORNAMENT_PRODUCT_CATEGORIES = {
  classic: ORNAMENT_PRODUCTS.filter((p) => p.category === 'classic'),
  shapes: ORNAMENT_PRODUCTS.filter((p) => p.category === 'shapes'),
  festive: ORNAMENT_PRODUCTS.filter((p) => p.category === 'festive'),
};
