/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MenuItem, FAQItem, Review, InventoryItem } from '../types';

export const INITIAL_MENU: MenuItem[] = [
  {
    id: 'm1',
    name: 'Kahayag Honey Latte',
    description: 'Our signature espresso with pure organic wild honey, steamed creamy milk, and a delicate dust of cinnamon. Liquid sunshine in a cup!',
    price: 180,
    category: 'signature',
    image: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&q=80&w=800',
    inStock: true,
    stockQuantity: 45,
  },
  {
    id: 'm2',
    name: 'Sea Salt Caramel Cold Brew',
    description: 'Slow-steeped 18-hour cold brew layered with house-made salted caramel and crowned with a velvet-smooth cold foam cloud.',
    price: 190,
    category: 'signature',
    image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&q=80&w=800',
    inStock: true,
    stockQuantity: 30,
  },
  {
    id: 'm3',
    name: 'Spanish Latte',
    description: 'A rich, comforting double-shot of premium espresso blended with sweetened condensed milk and micro-textured steamed milk.',
    price: 170,
    category: 'espresso',
    image: 'https://images.unsplash.com/photo-1570968915860-54d5c301fc9f?auto=format&fit=crop&q=80&w=800',
    inStock: true,
    stockQuantity: 60,
  },
  {
    id: 'm4',
    name: 'Flat White',
    description: 'Bold double ristretto espresso shot topped with velvet-thin microfoam milk for a strong, silky-smooth finish.',
    price: 160,
    category: 'espresso',
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=800',
    inStock: true,
    stockQuantity: 50,
  },
  {
    id: 'm5',
    name: 'Classic Cold Brew',
    description: 'Smooth, bold cold brew made from premium local Arabica beans steeped in cold water for 18 hours. Zero acidity, full flavor.',
    price: 150,
    category: 'cold-brew',
    image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&q=80&w=800',
    inStock: true,
    stockQuantity: 35,
  },
  {
    id: 'm6',
    name: 'Uji Matcha Strawberry Latte',
    description: 'Premium organic ceremonial-grade Uji matcha layered over real fresh strawberry compote and cold milk. Vibrant, fruity, and earthy.',
    price: 185,
    category: 'non-coffee',
    image: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&q=80&w=800',
    inStock: true,
    stockQuantity: 25,
  },
  {
    id: 'm7',
    name: 'Artisanal Butter Croissant',
    description: 'Flaky, multi-layered golden French croissant baked in-house daily with 100% French Normandy butter.',
    price: 110,
    category: 'pastries',
    image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&q=80&w=800',
    inStock: true,
    stockQuantity: 15,
  },
  {
    id: 'm8',
    name: 'Belgian Dark Chocolate Sea Salt Cookie',
    description: 'Decadent soft-baked cookie packed with melting chunks of 70% dark Belgian chocolate and sprinkled with premium sea salt flakes.',
    price: 95,
    category: 'pastries',
    image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&q=80&w=800',
    inStock: true,
    stockQuantity: 8, // Low stock to demonstrate inventory alert
  },
];

export const INITIAL_FAQS: FAQItem[] = [
  {
    id: 'faq1',
    question: 'What are Kahayag\'s operating hours?',
    answer: 'We are open daily from 7:00 AM to 9:00 PM. Our kitchen stops taking dine-in orders at 8:30 PM, but grab-and-go options and beverages are available until closing.',
    category: 'menu',
  },
  {
    id: 'faq2',
    question: 'How do I cancel or modify an active online order?',
    answer: 'Orders can be cancelled or modified within 5 minutes of placing them directly from your active order screen, or by calling our support line instantly. Please note that once our baristas change the order status to "Preparing", we cannot accept cancellations or offer refunds as your beverages are already being freshly crafted.',
    category: 'cancellation',
  },
  {
    id: 'faq3',
    question: 'Do you offer milk alternatives for your coffees?',
    answer: 'Absolutely! We offer organic Swedish Oat milk and creamy Almond milk as premium dairy alternatives. You can easily customize any beverage option in our online ordering form.',
    category: 'menu',
  },
  {
    id: 'faq4',
    question: 'How can we book Kahayag for events or catering services?',
    answer: 'We love hosting and catering! We offer customized coffee bar setups, professional barista services, and catering packages for private parties, corporate events, and weddings. Simply head over to our Contact page, select "Catering & Events Inquiry", fill out your details, and our events team will get in touch with a customized quote within 24 hours.',
    category: 'catering',
  },
  {
    id: 'faq5',
    question: 'What is your refund policy for cancelled orders?',
    answer: 'Approved cancellations made within the 5-minute window are refunded 100% instantly to your original payment method (GCash or Card). If there is any issue with your order upon pickup or delivery, please let our team know or contact support via the Contact page so we can make it right!',
    category: 'cancellation',
  },
];

export const INITIAL_REVIEWS: Review[] = [
  {
    id: 'r1',
    authorName: 'Maria Sofia Santos',
    rating: 5,
    comment: 'The Kahayag Honey Latte is out of this world! It has the perfect level of natural sweetness and the cinnamon dust is an amazing touch. Highly recommended!',
    date: '2026-06-25',
    approved: true,
    syncedToGoogle: true,
  },
  {
    id: 'r2',
    authorName: 'Ethan Alvarez',
    rating: 5,
    comment: 'Exceptional cold brew! The Sea Salt Caramel cream top is thick, creamy, and holds up well. Incredible minimalist aesthetics and speedy service.',
    date: '2026-06-24',
    approved: true,
    syncedToGoogle: true,
  },
  {
    id: 'r3',
    authorName: 'Kimberly Dy',
    rating: 4,
    comment: 'We booked Kahayag Brew for my sister\'s intimate garden birthday party. Their mobile espresso bar was such a massive hit! Very professional baristas and awesome drinks.',
    date: '2026-06-20',
    approved: true,
    syncedToGoogle: false,
  },
];

export const INITIAL_INVENTORY: InventoryItem[] = [
  { id: 'i1', name: 'Arabica Coffee Beans (Single Origin)', category: 'Beans', stockLevel: 18.5, unit: 'kg', minLimit: 5.0 },
  { id: 'i2', name: 'Barista Grade Whole Milk', category: 'Milk', stockLevel: 42, unit: 'Liters', minLimit: 10 },
  { id: 'i3', name: 'Oat Milk (Oatley)', category: 'Milk', stockLevel: 24, unit: 'Liters', minLimit: 8 },
  { id: 'i4', name: 'Almond Milk (Creamy)', category: 'Milk', stockLevel: 15, unit: 'Liters', minLimit: 5 },
  { id: 'i5', name: 'House Honey Blend Syrup', category: 'Syrup', stockLevel: 6.2, unit: 'Liters', minLimit: 2.0 },
  { id: 'i6', name: 'Artisanal Butter Croissants (Frozen)', category: 'Pastries', stockLevel: 45, unit: 'pcs', minLimit: 15 },
  { id: 'i7', name: 'Gourmet Chocolate Cookie Dough', category: 'Pastries', stockLevel: 12, unit: 'pcs', minLimit: 10 },
  { id: 'i8', name: 'Bio-Degradable Coffee Cups 12oz', category: 'Cups', stockLevel: 650, unit: 'pcs', minLimit: 200 },
  { id: 'i9', name: 'Bio-Degradable Coffee Cups 16oz', category: 'Cups', stockLevel: 820, unit: 'pcs', minLimit: 200 },
];
