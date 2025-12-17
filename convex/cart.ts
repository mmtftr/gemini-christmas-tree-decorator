/**
 * Cart Functions
 *
 * These functions mimic Convex queries and mutations for shopping cart.
 */

import { Cart, CartItem, CartItemType, CartItemCustomization, calculateCartTotal } from '../types';

// In-memory cart store (keyed by sessionId)
const cartStore: Map<string, Cart> = new Map();
let listeners: Set<() => void> = new Set();

const notifyListeners = () => listeners.forEach((l) => l());
const generateId = () => `cart_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
const generateItemId = () => `item_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

/**
 * Get cart for session
 * Convex: query({ args: { sessionId: v.string() }, handler: ... })
 */
export async function get(args: { sessionId: string }): Promise<Cart | null> {
  return cartStore.get(args.sessionId) || null;
}

/**
 * Add item to cart
 * Convex: mutation({ args: { sessionId, productType, productId, quantity, unitPrice, customization? }, handler: ... })
 */
export async function addItem(args: {
  sessionId: string;
  productType: CartItemType;
  productId: string;
  quantity: number;
  unitPrice: number;
  customization?: CartItemCustomization;
}): Promise<Cart> {
  let cart = cartStore.get(args.sessionId);

  const newItem: CartItem = {
    id: generateItemId(),
    productType: args.productType,
    productId: args.productId,
    quantity: args.quantity,
    unitPrice: args.unitPrice,
    customization: args.customization,
  };

  if (cart) {
    // Check if same product already exists (for trees/toppers, replace; for ornaments with same customization, update quantity)
    const existingIndex = cart.items.findIndex((item) => {
      if (item.productId !== args.productId) return false;
      if (args.productType === 'tree' || args.productType === 'topper') return true;
      // For ornaments, check customization matches
      if (args.productType === 'ornament' && args.customization) {
        return (
          item.customization?.color === args.customization.color &&
          JSON.stringify(item.customization?.position) === JSON.stringify(args.customization.position)
        );
      }
      return false;
    });

    if (existingIndex >= 0 && (args.productType === 'tree' || args.productType === 'topper')) {
      // Replace tree/topper
      cart.items[existingIndex] = newItem;
    } else {
      cart.items.push(newItem);
    }

    cart.subtotal = calculateCartTotal(cart.items);
    cart.updatedAt = Date.now();
  } else {
    cart = {
      id: generateId(),
      sessionId: args.sessionId,
      items: [newItem],
      subtotal: args.unitPrice * args.quantity,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    cartStore.set(args.sessionId, cart);
  }

  notifyListeners();
  return cart;
}

/**
 * Remove item from cart
 * Convex: mutation({ args: { sessionId, itemId }, handler: ... })
 */
export async function removeItem(args: { sessionId: string; itemId: string }): Promise<Cart | null> {
  const cart = cartStore.get(args.sessionId);
  if (!cart) return null;

  cart.items = cart.items.filter((item) => item.id !== args.itemId);
  cart.subtotal = calculateCartTotal(cart.items);
  cart.updatedAt = Date.now();

  notifyListeners();
  return cart;
}

/**
 * Update item quantity
 * Convex: mutation({ args: { sessionId, itemId, quantity }, handler: ... })
 */
export async function updateQuantity(args: {
  sessionId: string;
  itemId: string;
  quantity: number;
}): Promise<Cart | null> {
  const cart = cartStore.get(args.sessionId);
  if (!cart) return null;

  const item = cart.items.find((i) => i.id === args.itemId);
  if (item) {
    if (args.quantity <= 0) {
      // Remove item if quantity is 0 or negative
      cart.items = cart.items.filter((i) => i.id !== args.itemId);
    } else {
      item.quantity = args.quantity;
    }
    cart.subtotal = calculateCartTotal(cart.items);
    cart.updatedAt = Date.now();
  }

  notifyListeners();
  return cart;
}

/**
 * Clear cart
 * Convex: mutation({ args: { sessionId }, handler: ... })
 */
export async function clear(args: { sessionId: string }): Promise<void> {
  cartStore.delete(args.sessionId);
  notifyListeners();
}

/**
 * Get cart item count
 */
export async function getItemCount(args: { sessionId: string }): Promise<number> {
  const cart = cartStore.get(args.sessionId);
  if (!cart) return 0;
  return cart.items.reduce((sum, item) => sum + item.quantity, 0);
}

/**
 * Check if cart has tree
 */
export async function hasTree(args: { sessionId: string }): Promise<boolean> {
  const cart = cartStore.get(args.sessionId);
  if (!cart) return false;
  return cart.items.some((item) => item.productType === 'tree');
}

/**
 * Get cart tree
 */
export async function getTree(args: { sessionId: string }): Promise<CartItem | null> {
  const cart = cartStore.get(args.sessionId);
  if (!cart) return null;
  return cart.items.find((item) => item.productType === 'tree') || null;
}

/**
 * Subscribe to cart changes
 */
export function subscribe(callback: () => void): () => void {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

/**
 * Reset cart store (for testing)
 */
export function _reset(): void {
  cartStore.clear();
  notifyListeners();
}
