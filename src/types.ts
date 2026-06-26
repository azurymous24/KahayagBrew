/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type CategoryType = 'signature' | 'espresso' | 'cold-brew' | 'non-coffee' | 'pastries';

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: CategoryType;
  image: string;
  inStock: boolean;
  stockQuantity: number;
}

export interface CartItem {
  id: string; // unique ID for specific item configurations
  menuItem: MenuItem;
  quantity: number;
  size: 'Regular' | 'Large';
  milk: 'Standard' | 'Oat' | 'Almond' | 'None';
  sweetness: '100%' | '70%' | '50%' | 'Less Sweet';
}

export interface Order {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  deliveryType: 'Pickup' | 'Delivery';
  address?: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: 'card' | 'gcash' | 'cash';
  paymentStatus: 'Paid' | 'Pending';
  status: 'Pending' | 'Preparing' | 'Ready' | 'Completed' | 'Cancelled';
  createdAt: string;
  notes?: string;
}

export interface Review {
  id: string;
  authorName: string;
  rating: number;
  comment: string;
  date: string;
  approved: boolean; // Control whether shown on website
  syncedToGoogle: boolean; // Connected to Google Reviews
  isNew?: boolean; // For real-time toast highlights
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'menu' | 'ordering' | 'cancellation' | 'catering';
}

export interface InventoryItem {
  id: string;
  name: string;
  category: 'Beans' | 'Milk' | 'Syrup' | 'Cups' | 'Pastries' | 'Other';
  stockLevel: number;
  unit: string;
  minLimit: number;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: 'general' | 'catering' | 'events' | 'feedback';
  message: string;
  createdAt: string;
  isCatering?: boolean;
  eventDate?: string;
  guestCount?: number;
  status: 'Unread' | 'Replied' | 'Archived';
}
