/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Coffee, 
  Sparkles, 
  Phone, 
  MapPin, 
  Clock, 
  Facebook, 
  Instagram, 
  MessageSquare, 
  X, 
  ChevronDown, 
  ChevronUp, 
  Star, 
  Check, 
  HelpCircle, 
  Calendar, 
  Users, 
  Info, 
  ShoppingBag, 
  CreditCard,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  RefreshCw,
  Heart,
  Mail,
  Send,
  Coffee as CoffeeIcon
} from 'lucide-react';
import Logo from './components/Logo';
import { INITIAL_MENU, INITIAL_FAQS, INITIAL_REVIEWS } from './data/initialData';
import { MenuItem, FAQItem, Review, CartItem, Order, ContactMessage } from './types';
import { 
  initAuth, 
  googleSignIn, 
  googleSignOut, 
  findOrCreateSpreadsheet, 
  syncOrderToSheets, 
  syncMessageToSheets,
  syncToAppsScript
} from './lib/googleSheets';

export default function App() {
  // --- STATE MANAGEMENT ---
  const [menu, setMenu] = useState<MenuItem[]>(INITIAL_MENU);
  const [faqs, setFaqs] = useState<FAQItem[]>(INITIAL_FAQS);
  const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  // Google Sheets Integration State
  const [googleUser, setGoogleUser] = useState<any>(null);
  const [googleToken, setGoogleToken] = useState<string | null>(null);
  const [spreadsheetId, setSpreadsheetId] = useState<string | null>(null);
  const [spreadsheetUrl, setSpreadsheetUrl] = useState<string | null>(null);
  const [isConnectingGoogle, setIsConnectingGoogle] = useState<boolean>(false);
  const [googleInitLoading, setGoogleInitLoading] = useState<boolean>(true);
  const [isSyncingAll, setIsSyncingAll] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = initAuth(
      async (user, token) => {
        setGoogleUser(user);
        setGoogleToken(token);
        setGoogleInitLoading(false);
        try {
          const sheetInfo = await findOrCreateSpreadsheet(token);
          setSpreadsheetId(sheetInfo.id);
          setSpreadsheetUrl(sheetInfo.url);
        } catch (err) {
          console.error("Auto sheet connection failed:", err);
        }
      },
      () => {
        setGoogleUser(null);
        setGoogleToken(null);
        setGoogleInitLoading(false);
      }
    );
    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  const handleGoogleConnect = async () => {
    setIsConnectingGoogle(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setGoogleUser(result.user);
        setGoogleToken(result.accessToken);
        showToast("Authenticating with Google Services...", "info");
        const sheetInfo = await findOrCreateSpreadsheet(result.accessToken);
        setSpreadsheetId(sheetInfo.id);
        setSpreadsheetUrl(sheetInfo.url);
        showToast("Connected to Google Sheets & Drive successfully!", "success");
      }
    } catch (err) {
      console.error("Failed to connect Google Sheets:", err);
      showToast("Google Sheets authentication failed.", "error");
    } finally {
      setIsConnectingGoogle(false);
    }
  };

  const handleGoogleDisconnect = async () => {
    try {
      await googleSignOut();
      setGoogleUser(null);
      setGoogleToken(null);
      setSpreadsheetId(null);
      setSpreadsheetUrl(null);
      showToast("Disconnected from Google Sheets.", "info");
    } catch (err) {
      console.error("Failed to disconnect:", err);
    }
  };

  const handleSyncAllPastRecords = async () => {
    if (!googleToken || !spreadsheetId) {
      showToast("Please connect your Google Account first.", "error");
      return;
    }
    
    setIsSyncingAll(true);
    showToast("Starting synchronization of all local orders and messages...", "info");
    
    try {
      let ordersSyncedCount = 0;
      let messagesSyncedCount = 0;
      
      // Sync past orders
      for (const order of orders) {
        try {
          await syncOrderToSheets(spreadsheetId, order, googleToken);
          ordersSyncedCount++;
        } catch (e) {
          console.error(`Failed to sync order ${order.id}:`, e);
        }
      }
      
      // Sync past messages
      for (const msg of messages) {
        try {
          await syncMessageToSheets(spreadsheetId, msg, googleToken);
          messagesSyncedCount++;
        } catch (e) {
          console.error(`Failed to sync message ${msg.id}:`, e);
        }
      }
      
      showToast(
        `Successfully synced ${ordersSyncedCount} orders and ${messagesSyncedCount} messages to Google Sheets!`,
        "success"
      );
    } catch (err) {
      console.error("Sync all failed:", err);
      showToast("Error synchronizing some records to Google Sheets.", "error");
    } finally {
      setIsSyncingAll(false);
    }
  };

  // Navigation & UI States
  const [activeTab, setActiveTab] = useState<'all' | 'signature' | 'espresso' | 'cold-brew' | 'non-coffee' | 'pastries'>('all');
  const [activeFaqCategory, setActiveFaqCategory] = useState<'all' | 'menu' | 'ordering' | 'cancellation' | 'catering'>('all');
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>(null);

  // Cart & Ordering System
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(null);
  
  // Customization Options for Current Customization Modal
  const [customSize, setCustomSize] = useState<'Regular' | 'Large'>('Regular');
  const [customMilk, setCustomMilk] = useState<'Standard' | 'Oat' | 'Almond' | 'None'>('Standard');
  const [customSweetness, setCustomSweetness] = useState<'100%' | '70%' | '50%' | 'Less Sweet'>('100%');

  // Checkout Modal State
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [checkoutName, setCheckoutName] = useState<string>('');
  const [checkoutEmail, setCheckoutEmail] = useState<string>('');
  const [checkoutPhone, setCheckoutPhone] = useState<string>('');
  const [checkoutDelivery, setCheckoutDelivery] = useState<'Pickup' | 'Delivery'>('Pickup');
  const [checkoutAddress, setCheckoutAddress] = useState<string>('');
  const [checkoutPayment, setCheckoutPayment] = useState<'card' | 'gcash' | 'cash'>('gcash');
  const [checkoutNotes, setCheckoutNotes] = useState<string>('');
  const [paymentStep, setPaymentStep] = useState<'form' | 'processing' | 'success'>('form');
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);

  // New Review Form State
  const [newReviewAuthor, setNewReviewAuthor] = useState<string>('');
  const [newReviewRating, setNewReviewRating] = useState<number>(5);
  const [newReviewComment, setNewReviewComment] = useState<string>('');
  const [newReviewShowOnWebsite, setNewReviewShowOnWebsite] = useState<boolean>(true);
  const [newReviewSyncGoogle, setNewReviewSyncGoogle] = useState<boolean>(true);

  // New Contact / Catering Event Booking Form State
  const [contactName, setContactName] = useState<string>('');
  const [contactEmail, setContactEmail] = useState<string>('');
  const [contactPhone, setContactPhone] = useState<string>('');
  const [contactSubject, setContactSubject] = useState<'general' | 'catering' | 'events' | 'feedback'>('general');
  const [contactMessage, setContactMessage] = useState<string>('');
  const [isCateringQuery, setIsCateringQuery] = useState<boolean>(false);
  const [eventDate, setEventDate] = useState<string>('');
  const [guestCount, setGuestCount] = useState<number>(30);
  
  // Feedback Toasts / Notifications
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Real-time Submitted Review Highlight
  const [newReviewNotification, setNewReviewNotification] = useState<Review | null>(null);

  // --- TOAST HELPER ---
  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 5000);
  };

  // --- ADD TO CART ---
  const handleOpenCustomize = (item: MenuItem) => {
    if (!item.inStock) {
      showToast(`${item.name} is currently out of stock!`, 'error');
      return;
    }
    setSelectedMenuItem(item);
    setCustomSize('Regular');
    // For non-coffee/pastries, milk customizable might not make sense or defaulted to standard/none
    setCustomMilk(item.category === 'pastries' ? 'None' : 'Standard');
    setCustomSweetness('100%');
  };

  const handleAddToCart = () => {
    if (!selectedMenuItem) return;

    // Calculate premium customization additions
    let priceOffset = 0;
    if (customSize === 'Large') priceOffset += 30;
    if (customMilk === 'Oat' || customMilk === 'Almond') priceOffset += 45;

    const finalPrice = selectedMenuItem.price + priceOffset;

    const cartId = `${selectedMenuItem.id}-${customSize}-${customMilk}-${customSweetness}`;

    const existingIndex = cart.findIndex(item => item.id === cartId);

    if (existingIndex > -1) {
      const updatedCart = [...cart];
      updatedCart[existingIndex].quantity += 1;
      setCart(updatedCart);
    } else {
      const newItem: CartItem = {
        id: cartId,
        menuItem: {
          ...selectedMenuItem,
          price: finalPrice // store customized price
        },
        quantity: 1,
        size: customSize,
        milk: customMilk,
        sweetness: customSweetness
      };
      setCart([...cart, newItem]);
    }

    showToast(`Added ${selectedMenuItem.name} to order list!`, 'success');
    setSelectedMenuItem(null);
  };

  const handleQuantityChange = (cartId: string, delta: number) => {
    const updatedCart = cart.map(item => {
      if (item.id === cartId) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : null;
      }
      return item;
    }).filter((item): item is CartItem => item !== null);
    
    setCart(updatedCart);
  };

  // --- SUBMIT CHECKOUT / ORDER ---
  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      showToast("Your cart is empty!", "error");
      return;
    }
    if (!checkoutName || !checkoutEmail || !checkoutPhone) {
      showToast("Please fill in all required fields.", "error");
      return;
    }
    if (checkoutDelivery === 'Delivery' && !checkoutAddress) {
      showToast("Please provide your delivery address.", "error");
      return;
    }

    setPaymentStep('processing');

    // Simulate secure network transaction processing
    setTimeout(() => {
      const subtotal = cart.reduce((acc, item) => acc + (item.menuItem.price * item.quantity), 0);
      const tax = Math.round(subtotal * 0.12); // 12% VAT
      const total = subtotal + tax;

      const newOrder: Order = {
        id: `KB-${Math.floor(1000 + Math.random() * 9000)}`,
        customerName: checkoutName,
        email: checkoutEmail,
        phone: checkoutPhone,
        deliveryType: checkoutDelivery,
        address: checkoutDelivery === 'Delivery' ? checkoutAddress : undefined,
        items: [...cart],
        subtotal,
        tax,
        total,
        paymentMethod: checkoutPayment,
        paymentStatus: checkoutPayment === 'cash' ? 'Pending' : 'Paid',
        status: 'Pending',
        createdAt: new Date().toISOString(),
        notes: checkoutNotes
      };

      setOrders([newOrder, ...orders]);
      setPlacedOrder(newOrder);
      setPaymentStep('success');
      setCart([]); // Clear cart
      showToast(`Order ${newOrder.id} successfully received!`, 'success');

      // Automatically sync order to Google Sheets via secure Web App Script
      syncToAppsScript('order', newOrder)
        .then((success) => {
          if (success) {
            console.log("Order automatically backed up to Google Spreadsheet!");
            showToast(`Order ${newOrder.id} automatically synced to Google Spreadsheet!`, 'success');
          } else {
            console.warn("Apps script backup returned false, checking manual token...");
          }
        })
        .catch((err) => {
          console.error("Automatic backup failed:", err);
        });

      // Secondary manual backup to Google Sheets if OAuth is connected
      if (googleToken && spreadsheetId) {
        syncOrderToSheets(spreadsheetId, newOrder, googleToken)
          .then(() => {
            console.log("Order synced to manual OAuth Google Sheets successfully");
          })
          .catch((err) => {
            console.error("Manual OAuth backup failed:", err);
          });
      }
    }, 2000);
  };

  // --- SUBMIT REVIEW FORM ---
  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewAuthor.trim() || !newReviewComment.trim()) {
      showToast("Please tell us your name and write a quick review comment!", 'error');
      return;
    }

    const newReview: Review = {
      id: `rev-${Date.now()}`,
      authorName: newReviewAuthor,
      rating: newReviewRating,
      comment: newReviewComment,
      date: new Date().toISOString().split('T')[0],
      approved: newReviewShowOnWebsite,
      syncedToGoogle: newReviewSyncGoogle,
      isNew: true
    };

    // If approved, put at the top of the reviews display list
    setReviews([newReview, ...reviews]);
    
    // Set notification toast for instant real-time highlight
    setNewReviewNotification(newReview);
    showToast("Feedback submitted! Thank you for sharing your light with us.", 'success');

    // Reset Form
    setNewReviewAuthor('');
    setNewReviewRating(5);
    setNewReviewComment('');
    
    // Clear notification overlay after 6 seconds
    setTimeout(() => {
      setNewReviewNotification(null);
    }, 6000);
  };

  // --- SUBMIT CONTACT / CATERING BOOKING ---
  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !contactEmail.trim() || !contactMessage.trim()) {
      showToast("Please complete the required form fields.", "error");
      return;
    }

    const newMessage: ContactMessage = {
      id: `msg-${Date.now()}`,
      name: contactName,
      email: contactEmail,
      phone: contactPhone || undefined,
      subject: contactSubject,
      message: contactMessage,
      createdAt: new Date().toISOString(),
      isCatering: isCateringQuery,
      eventDate: isCateringQuery ? eventDate : undefined,
      guestCount: isCateringQuery ? guestCount : undefined,
      status: 'Unread'
    };

    setMessages([newMessage, ...messages]);
    showToast(
      isCateringQuery 
        ? "Catering proposal request received! We'll reach out to customize your package."
        : "Message sent successfully! Our team will get back to you soon.",
      "success"
    );

    // Automatically sync message to Google Sheets via secure Web App Script
    syncToAppsScript('message', newMessage)
      .then((success) => {
        if (success) {
          console.log("Inquiry automatically backed up to Google Spreadsheet!");
          showToast("Message copy automatically saved to Google Spreadsheet!", "success");
        } else {
          console.warn("Apps script backup returned false, checking manual token...");
        }
      })
      .catch((err) => {
        console.error("Automatic backup failed:", err);
      });

    // Secondary manual backup to Google Sheets if OAuth is connected
    if (googleToken && spreadsheetId) {
      syncMessageToSheets(spreadsheetId, newMessage, googleToken)
        .then(() => {
          console.log("Message synced to manual OAuth Google Sheets successfully");
        })
        .catch((err) => {
          console.error("Manual OAuth backup failed:", err);
        });
    }

    // Reset Form
    setContactName('');
    setContactEmail('');
    setContactPhone('');
    setContactSubject('general');
    setContactMessage('');
    setIsCateringQuery(false);
    setEventDate('');
    setGuestCount(30);
  };

  // --- ACCORDION FAQ CLICK ---
  const toggleFaq = (id: string) => {
    setExpandedFaqId(expandedFaqId === id ? null : id);
  };

  // --- ADMIN CONTROLS ---
  const toggleReviewApproval = (id: string) => {
    setReviews(reviews.map(r => r.id === id ? { ...r, approved: !r.approved } : r));
    showToast("Review display configuration updated.", "info");
  };

  const toggleReviewGoogleSync = (id: string) => {
    setReviews(reviews.map(r => r.id === id ? { ...r, syncedToGoogle: !r.syncedToGoogle } : r));
    showToast("Google Reviews sync state updated.", "info");
  };

  const deleteReview = (id: string) => {
    setReviews(reviews.filter(r => r.id !== id));
    showToast("Review deleted.", "info");
  };

  const updateOrderStatus = (id: string, newStatus: Order['status']) => {
    setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
    showToast(`Order status updated to ${newStatus}`, "success");
  };

  // Filter Menu
  const filteredMenu = activeTab === 'all' 
    ? menu 
    : menu.filter(item => item.category === activeTab);

  // Filter FAQs
  const filteredFaqs = activeFaqCategory === 'all'
    ? faqs
    : faqs.filter(faq => faq.category === activeFaqCategory);

  // Total amount in cart
  const cartSubtotal = cart.reduce((acc, item) => acc + (item.menuItem.price * item.quantity), 0);
  const cartTax = Math.round(cartSubtotal * 0.12);
  const cartTotal = cartSubtotal + cartTax;

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#3E2723] font-sans antialiased selection:bg-[#E6C15C] selection:text-[#3E2723]">
      
      {/* REAL-TIME REVIEW NOTIFICATION TOAST */}
      {newReviewNotification && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm bg-white border border-[#D4AF37]/40 shadow-xl rounded-2xl overflow-hidden p-5 animate-bounce border-l-4 border-l-[#D4AF37]">
          <div className="flex items-start gap-3">
            <div className="bg-amber-100 p-2 rounded-full text-amber-600">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-[#3E2723]">New Review Live!</span>
                <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Just Now</span>
              </div>
              <h4 className="font-semibold text-[#3E2723] text-xs mt-1">{newReviewNotification.authorName}</h4>
              <div className="flex gap-0.5 my-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-3.5 h-3.5 ${i < newReviewNotification.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} 
                  />
                ))}
              </div>
              <p className="text-xs text-gray-600 italic line-clamp-2 mt-1">"{newReviewNotification.comment}"</p>
              
              <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-100 text-[10px]">
                {newReviewNotification.approved ? (
                  <span className="text-emerald-600 font-medium flex items-center gap-1">
                    <Eye className="w-3 h-3" /> Displaying on Web
                  </span>
                ) : (
                  <span className="text-amber-600 font-medium flex items-center gap-1">
                    <EyeOff className="w-3 h-3" /> Staff Only Approval
                  </span>
                )}
                {newReviewNotification.syncedToGoogle && (
                  <span className="text-blue-600 font-medium flex items-center gap-1 ml-auto">
                    <RefreshCw className="w-2.5 h-2.5" /> Google Synced
                  </span>
                )}
              </div>
            </div>
            <button 
              onClick={() => setNewReviewNotification(null)}
              className="text-gray-400 hover:text-gray-600 self-start"
              id="btn-close-notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* SYSTEM NOTIFICATION TOAST */}
      {toastMessage && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-full shadow-lg flex items-center gap-2 transition-all duration-300 ${
          toastMessage.type === 'success' ? 'bg-[#3E2723] text-[#FFFDF9]' :
          toastMessage.type === 'error' ? 'bg-red-900 text-white' : 'bg-amber-800 text-amber-50'
        }`}>
          {toastMessage.type === 'success' && <CheckCircle className="w-4 h-4 text-[#D4AF37]" />}
          {toastMessage.type === 'error' && <AlertCircle className="w-4 h-4 text-red-300" />}
          <span className="text-sm font-medium tracking-wide">{toastMessage.text}</span>
        </div>
      )}

      {/* HEADER & NAVIGATION */}
      <header className="sticky top-0 z-40 bg-[#FDFBF7]/90 backdrop-blur-md border-b border-[#3E2723]/5 px-6 py-3 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <a href="#" className="flex items-center gap-3 group">
            <Logo size="sm" withText={false} />
            <div className="flex flex-col">
              <span className="font-serif text-xl font-bold tracking-tight text-[#3E2723] group-hover:text-[#8D6E63] transition-colors">
                kahayag
              </span>
              <span className="text-[9px] font-bold tracking-[0.2em] text-[#D4AF37] uppercase -mt-1">
                BREW
              </span>
            </div>
          </a>

          {/* Desktop Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <a href="#about" className="hover:text-[#D4AF37] transition-colors">Our Story</a>
            <a href="#menu" className="hover:text-[#D4AF37] transition-colors">Signature Menu</a>
            <a href="#catering" className="hover:text-[#D4AF37] transition-colors">Catering & Events</a>
            <a href="#reviews" className="hover:text-[#D4AF37] transition-colors">Guest Reviews</a>
            <a href="#faqs" className="hover:text-[#D4AF37] transition-colors">FAQs</a>
            <a href="#contact" className="hover:text-[#D4AF37] transition-colors">Contact</a>
          </nav>

          <div className="flex items-center gap-4">
            {/* Google Sheets Sync Status Badge / Button */}
            {googleToken ? (
              <a 
                href={spreadsheetUrl || '#'} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-xs px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full font-semibold flex items-center gap-1.5 hover:bg-emerald-100 transition-all shadow-xs"
                id="header-sheet-link"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="hidden sm:inline">Sheets: Connected</span>
                <span className="sm:hidden">Sheets: OK</span>
              </a>
            ) : (
              <button 
                onClick={handleGoogleConnect}
                disabled={isConnectingGoogle}
                className="text-xs px-3 py-1.5 bg-stone-100 text-stone-600 hover:bg-[#3E2723]/10 border border-transparent rounded-full font-medium transition-all flex items-center gap-1.5 disabled:opacity-50"
                id="header-sheet-connect"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                <span>{isConnectingGoogle ? 'Connecting...' : 'Connect Sheets'}</span>
              </button>
            )}

            {/* Cart Button */}
            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 bg-[#3E2723] hover:bg-[#5D4037] text-white rounded-full transition-all shadow-md hover:scale-105 flex items-center justify-center"
              id="btn-cart-toggle"
              aria-label="View Cart"
            >
              <ShoppingBag className="w-4.5 h-4.5" />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#D4AF37] text-[#3E2723] text-[10px] font-extrabold h-5 w-5 rounded-full flex items-center justify-center border-2 border-[#FDFBF7]">
                  {cart.reduce((acc, item) => acc + item.quantity, 0)}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* HERO BANNER SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 md:py-28 px-6 bg-gradient-to-b from-[#FFFDF9] to-[#FDFBF7]">
        {/* Decorative elements */}
        <div className="absolute top-10 left-10 w-72 h-72 bg-amber-100/30 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-stone-100/50 rounded-full blur-3xl -z-10" />

        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-12">
          
          <div className="w-full md:w-1/2 flex justify-center">
            {/* The beautiful Coffee Logo */}
            <div className="relative p-8 bg-white/40 backdrop-blur-sm rounded-3xl border border-[#3E2723]/5 shadow-xl hover:shadow-2xl transition-all duration-500 scale-95 md:scale-100">
              <Logo size="xl" withText={false} />
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-[#3E2723] text-[#FFFDF9] text-xs font-serif px-6 py-2 rounded-full shadow-lg border border-[#D4AF37]/30 whitespace-nowrap">
                Est. 2026 • Local Craft
              </div>
            </div>
          </div>

          <div className="w-full md:w-1/2 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-50 border border-[#D4AF37]/20 text-amber-800 text-xs font-semibold mb-6 animate-pulse">
              <Sparkles className="w-3.5 h-3.5 fill-[#D4AF37] text-[#D4AF37]" />
              <span>Experience Liquid Radiance</span>
            </div>
            
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-black text-[#3E2723] leading-[1.1] mb-6">
              Share the warmth of <span className="text-[#B58920] italic">Kahayag</span>
            </h1>
            
            <p className="text-stone-600 text-base sm:text-lg mb-8 leading-relaxed max-w-lg mx-auto md:mx-0">
              In the Visayan tongue, <strong className="text-[#3E2723]">Kahayag</strong> represents light, clarity, and radiance. We handcraft exceptional coffee from single-origin local beans and delicate fresh pastries to brighten your everyday journey.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4">
              <a 
                href="#menu" 
                className="w-full sm:w-auto px-8 py-4 bg-[#3E2723] hover:bg-[#5D4037] text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-xl text-center"
              >
                Explore Menu
              </a>
              <a 
                href="#contact" 
                className="w-full sm:w-auto px-8 py-4 bg-[#FFFDF9] border-2 border-[#3E2723]/10 hover:border-[#3E2723]/30 text-[#3E2723] rounded-xl font-bold transition-all text-center flex items-center justify-center gap-2"
              >
                Book Custom Catering
              </a>
            </div>

            {/* Quick trust metrics */}
            <div className="grid grid-cols-3 gap-6 pt-10 mt-10 border-t border-[#3E2723]/5 max-w-md mx-auto md:mx-0">
              <div>
                <span className="block font-serif text-2xl font-extrabold text-[#3E2723]">100%</span>
                <span className="text-xs text-stone-500 font-medium">Arabica Origin</span>
              </div>
              <div>
                <span className="block font-serif text-2xl font-extrabold text-[#3E2723]">Fresh</span>
                <span className="text-xs text-stone-500 font-medium">Baked Daily</span>
              </div>
              <div>
                <span className="block font-serif text-2xl font-extrabold text-[#3E2723]">5★</span>
                <span className="text-xs text-stone-500 font-medium">Community Rated</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* SOCIAL MEDIA ATTRACT BANNER */}
      <div className="bg-[#3E2723] text-[#FFFDF9] py-8 px-6 border-y-4 border-[#D4AF37]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-center md:text-left">
            <div className="p-3 bg-[#5D4037] rounded-xl text-[#D4AF37]">
              <Instagram className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg">Follow our brewing ritual online!</h3>
              <p className="text-stone-300 text-xs mt-0.5">Catch behind-the-scenes coffee stories, fresh batch announcements, and private catering logs.</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <a 
              href="https://facebook.com" 
              target="_blank" 
              rel="noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 bg-[#4267B2] hover:bg-[#365899] text-white text-xs font-semibold rounded-lg transition-all hover:scale-105 shadow-md"
            >
              <Facebook className="w-4 h-4 fill-current" />
              <span>@KahayagBrewFB</span>
            </a>
            <a 
              href="https://instagram.com" 
              target="_blank" 
              rel="noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white text-xs font-semibold rounded-lg transition-all hover:scale-105 shadow-md"
            >
              <Instagram className="w-4 h-4" />
              <span>@KahayagBrewIG</span>
            </a>
          </div>
        </div>
      </div>

      {/* STORYTELLING / ABOUT SECTION */}
      <section id="about" className="py-20 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-5 relative order-2 lg:order-1">
            <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl relative">
              <img 
                src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=1000" 
                alt="Cozy Kahayag Cafe Environment"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#3E2723]/80 via-transparent to-transparent" />
              
              {/* Overlay quote */}
              <div className="absolute bottom-8 left-8 right-8 text-[#FFFDF9]">
                <p className="font-serif italic text-lg leading-relaxed">
                  "Our goal is to build more than a cafe. We want to be the light of your morning and the peaceful refuge of your evening."
                </p>
                <div className="h-0.5 w-12 bg-[#D4AF37] my-3" />
                <span className="text-xs uppercase font-bold tracking-wider text-[#D4AF37]">The Kahayag Family</span>
              </div>
            </div>

            {/* Floating element */}
            <div className="absolute -top-6 -right-6 bg-white p-4 rounded-2xl shadow-xl border border-[#3E2723]/5 flex items-center gap-3 max-w-[200px]">
              <div className="bg-amber-100 p-2 rounded-xl text-amber-800">
                <CoffeeIcon className="w-5 h-5" />
              </div>
              <div>
                <span className="block font-bold text-xs text-[#3E2723]">Ethically Sourced</span>
                <span className="text-[10px] text-stone-500">Mindanao Highlands</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 order-1 lg:order-2">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#D4AF37]">Radiant Community</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-black text-[#3E2723] mt-2 mb-6">
              Our Story: Bringing Radiance to Every Single Brew
            </h2>
            
            <div className="space-y-6 text-stone-600 text-sm sm:text-base leading-relaxed">
              <p>
                In the heart of our community, <strong className="text-[#3E2723]">Kahayag Brew</strong> was established with a singular, beautiful mission: to bring light (Kahayag) into the lives of everyone who enters our doors. For us, coffee is not a mere utility; it is a sacred daily ritual, a moment of presence, and a source of connection.
              </p>
              <p>
                We collaborate directly with passionate coffee growers in local highlands, securing premium single-origin Arabica coffee beans. Our expert baristas meticulously roast and prepare every cup to accentuate the unique regional notes, pairing them with sweet wild honey and organic ingredients.
              </p>
              <p>
                Our signature pastries are handmade from scratch at the crack of dawn using pure French butter. When you take a bite of our warm, multi-layered croissants or savor the smooth complexity of our 18-hour cold brew, you are experiencing the true dedication of craft.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6">
                <div className="p-4 bg-white rounded-xl border border-[#3E2723]/5 shadow-sm flex items-start gap-3">
                  <span className="bg-[#3E2723] text-white p-1 rounded-full text-xs shrink-0 font-serif">1</span>
                  <div>
                    <h4 className="font-serif font-bold text-sm text-[#3E2723]">Community Warmth</h4>
                    <p className="text-xs text-stone-500 mt-1">A safe, beautifully lit haven to meet friends, read books, or work productively.</p>
                  </div>
                </div>
                <div className="p-4 bg-white rounded-xl border border-[#3E2723]/5 shadow-sm flex items-start gap-3">
                  <span className="bg-[#3E2723] text-white p-1 rounded-full text-xs shrink-0 font-serif">2</span>
                  <div>
                    <h4 className="font-serif font-bold text-sm text-[#3E2723]">Local Agriculture</h4>
                    <p className="text-xs text-stone-500 mt-1">Sustaining highland farmers with fair wages and supporting ecological agriculture.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* MENU SHOWCASE */}
      <section id="menu" className="py-20 bg-stone-100/50 px-6 border-y border-[#3E2723]/5">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#D4AF37]">The Curated Brews</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-black text-[#3E2723] mt-2">
              Our Artisanal Menu
            </h2>
            <p className="text-stone-500 text-sm mt-3">
              Filter through our catalog and customize your drinks. Click any item to explore premium options, choose milk alternatives, sweetness, and order online.
            </p>
          </div>

          {/* MENU CATEGORY FILTER TABS */}
          <div className="flex flex-wrap justify-center gap-2 mb-10 max-w-3xl mx-auto">
            {[
              { id: 'all', label: 'All Items' },
              { id: 'signature', label: 'Signature Cups' },
              { id: 'espresso', label: 'Classic Espresso' },
              { id: 'cold-brew', label: '18H Cold Brew' },
              { id: 'non-coffee', label: 'Non-Coffee Specialties' },
              { id: 'pastries', label: 'Baked Pastries' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-5 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-[#3E2723] text-[#FFFDF9] shadow-md'
                    : 'bg-white hover:bg-stone-100 text-stone-600 border border-[#3E2723]/5'
                }`}
                id={`tab-menu-${tab.id}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* MENU LIST GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredMenu.map(item => (
              <div 
                key={item.id}
                className="bg-white rounded-2xl overflow-hidden border border-[#3E2723]/5 shadow-sm hover:shadow-md transition-all flex flex-col group"
              >
                {/* Image & Badges */}
                <div className="aspect-[4/3] w-full overflow-hidden relative bg-stone-100">
                  <img 
                    src={item.image} 
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  
                  {item.category === 'signature' && (
                    <span className="absolute top-3 left-3 bg-[#D4AF37] text-[#3E2723] text-[9px] font-extrabold uppercase px-2 py-1 rounded-full tracking-wider shadow-sm">
                      Signature Craft
                    </span>
                  )}

                  {!item.inStock ? (
                    <span className="absolute inset-0 bg-[#3E2723]/80 backdrop-blur-xs flex items-center justify-center text-white text-xs font-bold uppercase tracking-wider">
                      Out of Stock
                    </span>
                  ) : item.stockQuantity <= 10 ? (
                    <span className="absolute top-3 right-3 bg-rose-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-sm animate-pulse">
                      Selling Out Fast
                    </span>
                  ) : null}
                </div>

                {/* Body Details */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-serif font-extrabold text-base text-[#3E2723] group-hover:text-[#B58920] transition-colors line-clamp-1">
                        {item.name}
                      </h3>
                      <span className="text-sm font-extrabold text-[#3E2723] shrink-0">
                        ₱{item.price}
                      </span>
                    </div>
                    <p className="text-stone-500 text-xs leading-relaxed line-clamp-3 mb-4">
                      {item.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-[#3E2723]/5 flex items-center justify-between">
                    <span className="text-[10px] text-stone-400 capitalize font-medium flex items-center gap-1">
                      <Coffee className="w-3 h-3" /> {item.category.replace('-', ' ')}
                    </span>

                    <button
                      onClick={() => handleOpenCustomize(item)}
                      disabled={!item.inStock}
                      className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                        item.inStock
                          ? 'bg-[#3E2723] hover:bg-[#5D4037] text-white hover:scale-[1.03] shadow-xs cursor-pointer'
                          : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                      }`}
                      id={`btn-order-item-${item.id}`}
                    >
                      Configure & Add
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredMenu.length === 0 && (
            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-stone-200 p-8">
              <Coffee className="w-12 h-12 text-stone-300 mx-auto mb-4" />
              <h3 className="text-[#3E2723] font-serif font-bold">No custom brews found</h3>
              <p className="text-stone-400 text-xs mt-1">Please select another active filter category above.</p>
            </div>
          )}

        </div>
      </section>

      {/* SPECIAL CATERING & PRIVATE EVENTS SERVICE SECTION */}
      <section id="catering" className="py-20 px-6 max-w-7xl mx-auto">
        <div className="bg-[#3E2723] rounded-[2.5rem] overflow-hidden text-[#FFFDF9] shadow-2xl relative">
          
          {/* Subtle glowing lights */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-stone-500/10 rounded-full blur-3xl" />

          <div className="grid grid-cols-1 lg:grid-cols-2">
            
            {/* Catering content */}
            <div className="p-8 sm:p-12 md:p-16 flex flex-col justify-center">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#D4AF37]">Artisanal Hosting</span>
              <h2 className="font-serif text-3xl sm:text-4xl font-black mt-2 mb-6 text-white">
                Private Catering & Customized Mobile Coffee Bars
              </h2>
              
              <p className="text-stone-300 text-sm sm:text-base leading-relaxed mb-6">
                Bring the complete premium Kahayag Brew experience directly to your personal celebrations and corporate events. We provide elegant mobile espresso bar setups, state-of-the-art brewing equipment, customizable signature menu offerings, and professional licensed baristas who craft beverages on-demand for your esteemed guests.
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white text-sm block">Custom Signature Beverage Menus</strong>
                    <span className="text-stone-400 text-xs">Collaborate with our head roaster to design bespoke coffees matching your event's theme.</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white text-sm block">Premium Mobile Espresso Counter</strong>
                    <span className="text-stone-400 text-xs">An aesthetically beautiful wooden counter setup that blends perfectly with warm, cozy, or rustic themes.</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white text-sm block">Professional Certified Baristas</strong>
                    <span className="text-stone-400 text-xs">Friendly, highly trained team delivering impeccable service and beautiful coffee latte art.</span>
                  </div>
                </div>
              </div>

              <div>
                <a 
                  href="#contact" 
                  onClick={() => {
                    setIsCateringQuery(true);
                    setContactSubject('catering');
                  }}
                  className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#D4AF37] hover:bg-[#E6C15C] text-[#3E2723] font-bold rounded-xl transition-all shadow-md hover:scale-[1.02]"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Request Customized Event Proposal</span>
                </a>
              </div>
            </div>

            {/* Catering visual */}
            <div className="relative min-h-[350px] lg:min-h-full">
              <img 
                src="https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&q=80&w=1000" 
                alt="Professional barista brewing coffee in event"
                className="w-full h-full object-cover absolute inset-0"
              />
              <div className="absolute inset-0 bg-gradient-to-r lg:bg-gradient-to-l from-transparent to-[#3E2723]" />
              
              {/* Event Badge */}
              <div className="absolute bottom-6 right-6 bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl max-w-xs">
                <span className="text-[#D4AF37] text-[10px] font-bold uppercase tracking-widest block mb-1">Catering Highlight</span>
                <p className="text-white font-serif text-sm font-semibold">"Kahayag was the talk of our corporate gala! Truly professional and extremely memorable."</p>
                <span className="text-stone-300 text-[10px] block mt-2">— Ayala Land Event Coordinator</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* REVIEWS & FEEDBACK (WITH GOOGLE SYNC & ADMIN SIMULATION) */}
      <section id="reviews" className="py-20 bg-stone-50 px-6 border-y border-[#3E2723]/5">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#D4AF37]">Guest Experiences</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-black text-[#3E2723] mt-2">
              Customer Reviews & Real-time Feedback
            </h2>
            <p className="text-stone-500 text-sm mt-3">
              We highly value customer reviews. Submit feedback below to see it live on our dashboard, synced to Google, or managed via the moderation panels.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* SUBMIT FEEDBOOK FORM CARD */}
            <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-[#3E2723]/5 shadow-sm self-start">
              <h3 className="font-serif font-black text-xl text-[#3E2723] mb-2 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[#D4AF37]" />
                <span>Write a Review</span>
              </h3>
              <p className="text-stone-500 text-xs mb-6">
                Your radiant words keep our fires burning. Share your review instantly below.
              </p>

              <form onSubmit={handleSubmitReview} className="space-y-4">
                {/* Guest Name */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wide mb-1.5">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newReviewAuthor}
                    onChange={(e) => setNewReviewAuthor(e.target.value)}
                    placeholder="e.g. Sofia Dimaguiba"
                    className="w-full px-4 py-3 bg-[#FDFBF7] border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-[#3E2723] transition-colors"
                  />
                </div>

                {/* Rating selection */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wide mb-1.5">
                    Star Rating ({newReviewRating} Stars)
                  </label>
                  <div className="flex gap-2 bg-[#FDFBF7] p-3 rounded-xl border border-stone-200">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewReviewRating(star)}
                        className="text-amber-400 hover:scale-110 transition-transform focus:outline-none cursor-pointer"
                        id={`btn-star-rating-${star}`}
                      >
                        <Star className={`w-6 h-6 ${star <= newReviewRating ? 'fill-amber-400' : 'text-stone-200'}`} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Comment */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wide mb-1.5">
                    Your Experience *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={newReviewComment}
                    onChange={(e) => setNewReviewComment(e.target.value)}
                    placeholder="How was your coffee, pastry, or catering? We read every single review..."
                    className="w-full px-4 py-3 bg-[#FDFBF7] border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-[#3E2723] transition-colors resize-none"
                  />
                </div>

                {/* Options panel */}
                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200/50 space-y-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">Feedback Integrations</span>
                  
                  {/* Toggle Display on Website */}
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newReviewShowOnWebsite}
                      onChange={(e) => setNewReviewShowOnWebsite(e.target.checked)}
                      className="accent-[#3E2723] h-4 w-4 rounded cursor-pointer"
                    />
                    <div>
                      <span className="text-xs font-bold text-[#3E2723] block">Display Review on Website</span>
                      <span className="text-[10px] text-stone-400 block">Allow your review to showcase in our live website client feed.</span>
                    </div>
                  </label>

                  {/* Toggle Google Sync */}
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newReviewSyncGoogle}
                      onChange={(e) => setNewReviewSyncGoogle(e.target.checked)}
                      className="accent-[#3E2723] h-4 w-4 rounded cursor-pointer"
                    />
                    <div>
                      <span className="text-xs font-bold text-[#3E2723] block">Sync with Google Reviews</span>
                      <span className="text-[10px] text-stone-400 block">Simulate connecting review to Kahayag's official Google Business Profile.</span>
                    </div>
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-[#3E2723] hover:bg-[#5D4037] text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                  id="btn-submit-review"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Live Review</span>
                </button>
              </form>
            </div>

            {/* LIVE FEED REVIEWS FEEDBACK LIST */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              
              {/* Header block with total ratings & sync status indicator */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
                <div>
                  <h4 className="font-serif font-black text-lg text-[#3E2723]">Guest Testimonials ({reviews.filter(r => r.approved).length})</h4>
                  <p className="text-stone-400 text-xs">Real community voices celebrating our craft brews</p>
                </div>
              </div>

              {/* REVIEWS CONTAINER */}
              <div className="space-y-4 max-h-[580px] overflow-y-auto pr-2 custom-scrollbar">
                {reviews.map(review => {
                  // If not approved, hide
                  if (!review.approved) return null;

                  return (
                    <div 
                      key={review.id}
                      className={`p-5 rounded-2xl border transition-all ${
                        review.isNew 
                          ? 'bg-amber-50/50 border-[#D4AF37]/30 shadow-md ring-1 ring-[#D4AF37]/20 animate-fade-in'
                          : 'bg-white border-stone-100 shadow-xs'
                      }`}
                    >
                      {/* Top Header of review */}
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <h5 className="font-serif font-bold text-sm text-[#3E2723]">{review.authorName}</h5>
                            
                            {/* Meta Badge Tags */}
                            {review.syncedToGoogle && (
                              <span className="bg-blue-50 text-blue-700 border border-blue-100 text-[9px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                                Google Review
                              </span>
                            )}

                            {!review.approved && (
                              <span className="bg-rose-50 text-rose-700 border border-rose-100 text-[9px] font-semibold px-2 py-0.5 rounded-full">
                                Hidden from Public
                              </span>
                            )}
                          </div>

                          <div className="flex gap-0.5 mt-1.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star 
                                key={i} 
                                className={`w-3.5 h-3.5 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-stone-100'}`} 
                              />
                            ))}
                          </div>
                        </div>

                        <span className="text-xs text-stone-400">{review.date}</span>
                      </div>

                      {/* Comment text */}
                      <p className="text-stone-600 text-xs sm:text-sm mt-3 leading-relaxed italic">
                        "{review.comment}"
                      </p>


                    </div>
                  );
                })}
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* CONTACT & DETAILED EVENT BOOKING SECTION */}
      <section id="contact" className="py-20 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Quick contact information column */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#D4AF37]">Seamless Connection</span>
              <h2 className="font-serif text-3xl sm:text-4xl font-black text-[#3E2723] mt-2 mb-6">
                Get in Touch with our Support & Events Team
              </h2>
              
              <p className="text-stone-600 text-sm sm:text-base leading-relaxed mb-8">
                Have inquiries about our single-origin coffees, sweet pastries, or order guidelines? Want to customize a mobile coffee bar setup for weddings, private parties, or corporate gatherings? Send us a direct query below and we'll reply promptly!
              </p>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-amber-100 p-3 rounded-xl text-amber-900 shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <strong className="text-sm text-[#3E2723] block font-serif">Customer Support Hotline</strong>
                    <span className="text-stone-500 text-xs">+63 (917) 839-4456</span>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-amber-100 p-3 rounded-xl text-amber-900 shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <strong className="text-sm text-[#3E2723] block font-serif">Corporate Events & Catering</strong>
                    <span className="text-stone-500 text-xs">events@kahayagbrew.com</span>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-amber-100 p-3 rounded-xl text-amber-900 shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <strong className="text-sm text-[#3E2723] block font-serif">Kahayag Flagship Coffee House</strong>
                    <span className="text-stone-500 text-xs">Avenue of the Sun, IT Park, Cebu City, 6000 Philippines</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Coffee Shop Operating Schedule */}
            <div className="p-6 bg-amber-55/40 border border-amber-200/40 rounded-2xl mt-12 bg-[#FFFDF9]">
              <h4 className="font-serif font-extrabold text-sm text-[#3E2723] mb-3 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#D4AF37]" />
                <span>Operating Hours</span>
              </h4>
              <ul className="text-xs space-y-2 text-stone-600">
                <li className="flex justify-between"><span>Monday – Thursday:</span> <strong className="text-[#3E2723]">7:00 AM – 9:00 PM</strong></li>
                <li className="flex justify-between"><span>Friday – Sunday:</span> <strong className="text-[#3E2723]">7:00 AM – 10:00 PM</strong></li>
                <li className="border-t border-stone-200 pt-2 mt-2 text-[10px] text-stone-400 italic">
                  * Live online order system stops accepting submissions 15 minutes before closing daily.
                </li>
              </ul>
            </div>
          </div>

          {/* COMPREHENSIVE INTERACTIVE BOOKING & CONTACT FORM */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-[#3E2723]/5 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="font-serif font-black text-xl text-[#3E2723]">Send a Message</h3>
                <p className="text-stone-500 text-xs">For general support, feedback, or events inquiries</p>
              </div>
              
              {/* Event trigger button */}
              <button
                type="button"
                onClick={() => {
                  setIsCateringQuery(!isCateringQuery);
                  setContactSubject(isCateringQuery ? 'general' : 'catering');
                }}
                className={`text-xs px-4 py-2 font-bold rounded-xl border transition-all ${
                  isCateringQuery 
                    ? 'bg-[#3E2723] text-[#FFFDF9] border-[#3E2723]' 
                    : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                }`}
                id="btn-catering-toggle-form"
              >
                {isCateringQuery ? 'Switch to Support Inquiry' : 'Switch to Event/Catering Booking'}
              </button>
            </div>

            <form onSubmit={handleContactSubmit} className="space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Name */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wide mb-1.5">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="e.g. Jean dela Cruz"
                    className="w-full px-4 py-3 bg-[#FDFBF7] border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-[#3E2723] transition-colors"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wide mb-1.5">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="e.g. jean@example.com"
                    className="w-full px-4 py-3 bg-[#FDFBF7] border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-[#3E2723] transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Phone */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wide mb-1.5">
                    Phone Number (Optional)
                  </label>
                  <input
                    type="text"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="e.g. +63 917 123 4567"
                    className="w-full px-4 py-3 bg-[#FDFBF7] border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-[#3E2723] transition-colors"
                  />
                </div>

                {/* Inquiry Subject */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wide mb-1.5">
                    Subject / Topic *
                  </label>
                  <select
                    value={contactSubject}
                    onChange={(e) => {
                      const val = e.target.value as any;
                      setContactSubject(val);
                      if (val === 'catering' || val === 'events') {
                        setIsCateringQuery(true);
                      } else {
                        setIsCateringQuery(false);
                      }
                    }}
                    className="w-full px-4 py-3 bg-[#FDFBF7] border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-[#3E2723] transition-colors"
                  >
                    <option value="general">General Coffee Shop Question</option>
                    <option value="feedback">Customer Feedback & Reviews</option>
                    <option value="catering">Catering & Mobile Coffee Bar Inquiry</option>
                    <option value="events">Private Event Reservation</option>
                  </select>
                </div>
              </div>

              {/* DYNAMIC CATERING DETAILS PANEL */}
              {isCateringQuery && (
                <div className="p-5 bg-amber-50/40 rounded-2xl border border-amber-200/50 space-y-4 animate-fade-in">
                  <div className="flex items-center gap-2 pb-2 border-b border-amber-200/20">
                    <Sparkles className="w-4.5 h-4.5 text-[#D4AF37] fill-[#D4AF37]" />
                    <span className="text-xs font-serif font-extrabold text-[#3E2723]">Catering Details</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Event Date */}
                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wide mb-1.5">
                        Target Event Date *
                      </label>
                      <input
                        type="date"
                        required={isCateringQuery}
                        value={eventDate}
                        onChange={(e) => setEventDate(e.target.value)}
                        className="w-full px-4 py-3 bg-[#FDFBF7] border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-[#3E2723] transition-colors"
                      />
                    </div>

                    {/* Guest Count slider */}
                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wide mb-1.5 flex justify-between">
                        <span>Approx. Guest Count:</span>
                        <strong className="text-[#3E2723]">{guestCount} pax</strong>
                      </label>
                      <div className="flex items-center gap-3 pt-2">
                        <span className="text-xs text-stone-400">10</span>
                        <input
                          type="range"
                          min="10"
                          max="250"
                          step="10"
                          value={guestCount}
                          onChange={(e) => setGuestCount(Number(e.target.value))}
                          className="flex-1 accent-[#3E2723] h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <span className="text-xs text-stone-400">250+</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Message */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wide mb-1.5">
                  Your Message / Proposal Notes *
                </label>
                <textarea
                  required
                  rows={5}
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  placeholder={
                    isCateringQuery 
                      ? "Describe your ideal private party or corporate function (location details, drink choices, and any customization requests)..."
                      : "Type your query here. Our support baristas read and address each message carefully."
                  }
                  className="w-full px-4 py-3 bg-[#FDFBF7] border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-[#3E2723] transition-colors resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-[#3E2723] hover:bg-[#5D4037] text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                id="btn-submit-contact"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isCateringQuery ? 'Request Event Proposal' : 'Send Message'}</span>
              </button>
            </form>
          </div>

        </div>
      </section>

      {/* ACCORDION FAQ SECTION */}
      <section id="faqs" className="py-20 bg-stone-100/30 px-6 border-y border-[#3E2723]/5">
        <div className="max-w-4xl mx-auto">
          
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#D4AF37]">Clear Common Inquiries</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-black text-[#3E2723] mt-2">
              Frequently Asked Questions
            </h2>
            <p className="text-stone-500 text-sm mt-3">
              Answers regarding menu customization, event catering services, and order cancellation guidelines.
            </p>
          </div>

          {/* FAQ categories filtering buttons */}
          <div className="flex flex-wrap justify-center gap-1.5 mb-8">
            {[
              { id: 'all', label: 'All FAQs' },
              { id: 'menu', label: 'Our Coffee & Menu' },
              { id: 'ordering', label: 'Online Ordering' },
              { id: 'cancellation', label: 'Cancellations & Refunds' },
              { id: 'catering', label: 'Catering & Events' },
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveFaqCategory(cat.id as any);
                  setExpandedFaqId(null); // collapse active
                }}
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  activeFaqCategory === cat.id
                    ? 'bg-stone-800 text-white shadow-sm'
                    : 'bg-white hover:bg-stone-50 text-stone-500 border border-[#3E2723]/5'
                }`}
                id={`tab-faq-${cat.id}`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* ACCORDION FAQ LIST */}
          <div className="space-y-3">
            {filteredFaqs.map(faq => {
              const isExpanded = expandedFaqId === faq.id;
              return (
                <div 
                  key={faq.id}
                  className="bg-white rounded-2xl overflow-hidden border border-[#3E2723]/5 shadow-xs transition-all duration-300"
                >
                  <button
                    onClick={() => toggleFaq(faq.id)}
                    className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 font-serif font-extrabold text-sm sm:text-base text-[#3E2723] hover:bg-stone-50/50 transition-colors focus:outline-none cursor-pointer"
                    id={`btn-faq-header-${faq.id}`}
                  >
                    <div className="flex items-center gap-3">
                      <HelpCircle className="w-4.5 h-4.5 text-[#D4AF37] shrink-0" />
                      <span>{faq.question}</span>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-4.5 h-4.5 text-stone-400 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4.5 h-4.5 text-stone-400 shrink-0" />
                    )}
                  </button>

                  <div 
                    className={`transition-all overflow-hidden ${
                      isExpanded ? 'max-h-96 border-t border-[#3E2723]/5' : 'max-h-0'
                    }`}
                  >
                    <div className="p-6 text-stone-600 text-xs sm:text-sm leading-relaxed bg-[#FDFBF7]/30">
                      {faq.answer}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Extra emphasis on order cancellation policy */}
          <div className="p-5 rounded-2xl bg-amber-50/50 border border-amber-200/40 mt-8 flex gap-3">
            <Info className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-[#3E2723]">Crucial Order Cancellation Guidelines</h4>
              <p className="text-[11px] text-stone-500 mt-0.5 leading-relaxed">
                To prevent product waste and support sustainability, our baristas begin grinding fresh beans immediately. Active orders can only be cancelled within <strong>5 minutes</strong> of transaction completion. Cancellations requested after baristas declare an order "Preparing" are unfortunately non-refundable.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#3E2723] text-[#FFFDF9] pt-16 pb-8 px-6 border-t-4 border-[#D4AF37]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 pb-12 border-b border-white/10">
          
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <Logo size="md" light={true} className="mb-4" />
            <p className="text-stone-300 text-xs mt-2 leading-relaxed max-w-xs">
              Where Liquid Sunshine Meets Warm Community. Proudly roasting local single-origin coffees and baking fresh artisanal pastries.
            </p>
          </div>

          <div>
            <h4 className="font-serif font-black text-sm text-[#D4AF37] uppercase tracking-wider mb-4">Explore</h4>
            <ul className="text-xs space-y-2.5 text-stone-300">
              <li><a href="#about" className="hover:text-white transition-colors">Our Story & Meaning</a></li>
              <li><a href="#menu" className="hover:text-white transition-colors">Artisanal Coffee Menu</a></li>
              <li><a href="#catering" className="hover:text-white transition-colors">Mobile Bar Catering</a></li>
              <li><a href="#reviews" className="hover:text-white transition-colors">Guest Feedbacks</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-serif font-black text-sm text-[#D4AF37] uppercase tracking-wider mb-4">Guidelines & Support</h4>
            <ul className="text-xs space-y-2.5 text-stone-300">
              <li><a href="#faqs" className="hover:text-white transition-colors">Frequently Asked FAQs</a></li>
              <li><a href="#faqs" className="hover:text-white transition-colors">Cancellation & Refund Policy</a></li>
              <li><a href="#contact" className="hover:text-white transition-colors">Event Catering Booking</a></li>
              <li><a href="#contact" className="hover:text-white transition-colors">General Support Form</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-serif font-black text-sm text-[#D4AF37] uppercase tracking-wider mb-4">Find Us Everywhere</h4>
            <p className="text-xs text-stone-300 mb-4">
              Avenue of the Sun, IT Park, Cebu City, 6000 Philippines
            </p>
            
            <div className="flex items-center gap-3">
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noreferrer" 
                className="p-2 bg-white/10 hover:bg-[#4267B2] rounded-full transition-colors text-white"
                aria-label="Follow us on Facebook"
              >
                <Facebook className="w-4 h-4 fill-current" />
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noreferrer" 
                className="p-2 bg-white/10 hover:bg-gradient-to-tr hover:from-[#f9ce34] hover:via-[#ee2a7b] hover:to-[#6228d7] rounded-full transition-colors text-white"
                aria-label="Follow us on Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>

        </div>

        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 text-xs text-stone-400 text-center sm:text-left">
          <span>&copy; {new Date().getFullYear()} Kahayag Brew. All Rights Reserved.</span>
          <span className="flex items-center gap-1">
            Made with <Heart className="w-3 h-3 text-red-500 fill-current" /> in the Philippines
          </span>
        </div>
      </footer>

      {/* --- CUSTOMIZATION MODAL --- */}
      {selectedMenuItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs">
          <div className="bg-white rounded-3xl overflow-hidden max-w-lg w-full border border-[#3E2723]/10 shadow-2xl animate-scale-up">
            
            {/* Header image overlay */}
            <div className="relative aspect-[16/10] bg-stone-100">
              <img 
                src={selectedMenuItem.image} 
                alt={selectedMenuItem.name}
                className="w-full h-full object-cover"
              />
              <button 
                onClick={() => setSelectedMenuItem(null)}
                className="absolute top-4 right-4 p-2 bg-[#3E2723] hover:bg-[#5D4037] text-white rounded-full transition-colors shadow-md cursor-pointer"
                id="btn-close-customize"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content Details */}
            <div className="p-6">
              <div className="flex items-start justify-between gap-4 mb-2">
                <h3 className="font-serif font-black text-xl text-[#3E2723]">
                  Customize {selectedMenuItem.name}
                </h3>
                <span className="font-serif font-extrabold text-lg text-[#3E2723]">
                  ₱{selectedMenuItem.price + (customSize === 'Large' ? 30 : 0) + (customMilk === 'Oat' || customMilk === 'Almond' ? 45 : 0)}
                </span>
              </div>
              
              <p className="text-stone-500 text-xs leading-relaxed mb-6">
                {selectedMenuItem.description}
              </p>

              <div className="space-y-4">
                {/* Size choice */}
                <div>
                  <span className="block text-xs font-bold text-stone-700 uppercase tracking-wide mb-2">
                    Size selection
                  </span>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: 'Regular', label: 'Regular Size', price: 'Standard price' },
                      { id: 'Large', label: 'Large Size (+ ₱30)', price: 'More espresso volume' },
                    ].map(sz => (
                      <button
                        key={sz.id}
                        type="button"
                        onClick={() => setCustomSize(sz.id as any)}
                        className={`p-3 text-xs rounded-xl border text-left cursor-pointer transition-all ${
                          customSize === sz.id 
                            ? 'bg-[#3E2723] text-white border-[#3E2723] font-bold shadow-xs' 
                            : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                        }`}
                        id={`btn-size-${sz.id}`}
                      >
                        <span className="block text-xs font-bold">{sz.label}</span>
                        <span className="block text-[10px] opacity-80 mt-0.5">{sz.price}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Milk selection - skip for pastries */}
                {selectedMenuItem.category !== 'pastries' && (
                  <div>
                    <span className="block text-xs font-bold text-stone-700 uppercase tracking-wide mb-2">
                      Dairy alternatives
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { id: 'Standard', label: 'Whole Milk' },
                        { id: 'Oat', label: 'Oat (+₱45)' },
                        { id: 'Almond', label: 'Almond (+₱45)' },
                        { id: 'None', label: 'Black Coffee' },
                      ].map(ml => (
                        <button
                          key={ml.id}
                          type="button"
                          onClick={() => setCustomMilk(ml.id as any)}
                          className={`py-2 px-1 text-center text-[10px] rounded-lg border font-semibold cursor-pointer transition-all ${
                            customMilk === ml.id
                              ? 'bg-[#3E2723] text-white border-[#3E2723] font-bold'
                              : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                          }`}
                          id={`btn-milk-${ml.id}`}
                        >
                          {ml.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sweetness selection - skip for pastries */}
                {selectedMenuItem.category !== 'pastries' && (
                  <div>
                    <span className="block text-xs font-bold text-stone-700 uppercase tracking-wide mb-2">
                      Sweetness intensity
                    </span>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { id: '100%', label: 'Standard' },
                        { id: '70%', label: '70% Sweet' },
                        { id: '50%', label: 'Half Sweet' },
                        { id: 'Less Sweet', label: 'Unsweetened' },
                      ].map(sw => (
                        <button
                          key={sw.id}
                          type="button"
                          onClick={() => setCustomSweetness(sw.id as any)}
                          className={`py-2 text-center text-[10px] rounded-lg border font-semibold cursor-pointer transition-all ${
                            customSweetness === sw.id
                              ? 'bg-[#3E2723] text-white border-[#3E2723] font-bold'
                              : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                          }`}
                          id={`btn-sweetness-${sw.id}`}
                        >
                          {sw.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Add to order cart button */}
              <button
                onClick={handleAddToCart}
                className="w-full mt-6 py-4 bg-[#3E2723] hover:bg-[#5D4037] text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                id="btn-confirm-customize"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Confirm Selection & Add to Order</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* --- CART DRAWER OVERLAY --- */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col justify-between animate-slide-left border-l border-stone-200">
            
            {/* Header */}
            <div className="p-6 border-b border-stone-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-[#D4AF37]" />
                <h3 className="font-serif font-black text-lg text-[#3E2723]">Your Custom Brews</h3>
              </div>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition-colors cursor-pointer"
                id="btn-close-cart"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Items display */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {cart.map((item, idx) => (
                <div key={item.id} className="flex gap-4 p-3 bg-stone-50 rounded-xl border border-stone-200/40 relative">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-stone-100 shrink-0">
                    <img 
                      src={item.menuItem.image} 
                      alt={item.menuItem.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h4 className="font-serif font-bold text-sm text-[#3E2723] line-clamp-1">{item.menuItem.name}</h4>
                      <span className="text-xs font-bold text-[#3E2723]">₱{item.menuItem.price * item.quantity}</span>
                    </div>

                    <div className="text-[10px] text-stone-400 space-y-0.5 mt-1">
                      <span>Size: {item.size}</span>
                      {item.menuItem.category !== 'pastries' && (
                        <>
                          <span className="mx-1.5">•</span>
                          <span>Milk: {item.milk}</span>
                          <span className="mx-1.5">•</span>
                          <span>Sweetness: {item.sweetness}</span>
                        </>
                      )}
                    </div>

                    {/* Quantity Selector */}
                    <div className="flex items-center gap-3 mt-2">
                      <button 
                        onClick={() => handleQuantityChange(item.id, -1)}
                        className="w-6 h-6 bg-white border border-stone-200 rounded flex items-center justify-center text-xs font-bold text-stone-600 hover:bg-stone-100 focus:outline-none cursor-pointer"
                        id={`btn-qty-dec-${idx}`}
                      >
                        -
                      </button>
                      <span className="text-xs font-bold text-stone-700">{item.quantity}</span>
                      <button 
                        onClick={() => handleQuantityChange(item.id, 1)}
                        className="w-6 h-6 bg-white border border-stone-200 rounded flex items-center justify-center text-xs font-bold text-stone-600 hover:bg-stone-100 focus:outline-none cursor-pointer"
                        id={`btn-qty-inc-${idx}`}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {cart.length === 0 && (
                <div className="text-center py-16">
                  <CoffeeIcon className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                  <h4 className="font-serif font-bold text-sm text-stone-700">Brew cup is empty</h4>
                  <p className="text-stone-400 text-xs mt-1">Select signature items on our menu and configure them to order.</p>
                </div>
              )}
            </div>

            {/* Checkout Pricing footer */}
            <div className="p-6 border-t border-stone-200 space-y-4 bg-stone-50">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-stone-500">
                  <span>Subtotal:</span>
                  <span>₱{cartSubtotal}</span>
                </div>
                <div className="flex justify-between text-stone-500">
                  <span>12% VAT:</span>
                  <span>₱{cartTax}</span>
                </div>
                <div className="flex justify-between text-base font-extrabold text-[#3E2723] pt-1 border-t border-stone-200/50">
                  <span>Grand Total:</span>
                  <span>₱{cartTotal}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCart([])}
                  disabled={cart.length === 0}
                  className="py-3 bg-white hover:bg-stone-100 border border-stone-200 text-stone-600 font-bold rounded-xl text-xs transition-colors cursor-pointer disabled:opacity-40"
                  id="btn-clear-cart"
                >
                  Clear Order
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsCartOpen(false);
                    setIsCheckoutOpen(true);
                    setPaymentStep('form');
                  }}
                  disabled={cart.length === 0}
                  className="py-3 bg-[#3E2723] hover:bg-[#5D4037] text-white font-bold rounded-xl text-xs transition-all shadow-sm cursor-pointer disabled:opacity-40 disabled:hover:bg-[#3E2723]"
                  id="btn-checkout"
                >
                  Place Order
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* --- CHECKOUT & PAYMENTS MODAL --- */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs">
          <div className="bg-white rounded-3xl overflow-hidden max-w-xl w-full border border-[#3E2723]/10 shadow-2xl animate-scale-up">
            
            <div className="bg-[#3E2723] p-6 text-white flex items-center justify-between border-b-4 border-[#D4AF37]">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-[#D4AF37]" />
                <h3 className="font-serif font-black text-lg text-white">Secure Customer Payment Integration</h3>
              </div>
              <button 
                onClick={() => setIsCheckoutOpen(false)}
                className="p-1.5 bg-white/10 hover:bg-white/20 rounded-full transition-colors cursor-pointer text-white"
                id="btn-close-checkout"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* STEP 1: FORM INPUTS */}
            {paymentStep === 'form' && (
              <form onSubmit={handlePlaceOrder} className="p-6 space-y-4">
                
                <div className="bg-amber-50 p-4 rounded-xl border border-amber-200/40 text-[11px] text-stone-500 leading-relaxed flex items-start gap-2">
                  <LockBadge className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <strong className="text-[#3E2723]">End-to-End Secure Processing Sandbox</strong>
                    <p className="mt-0.5">Mock integration mimicking live secure card payments and GCash APIs. No real funds will be deducted.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name */}
                  <div>
                    <label className="block text-[10px] font-bold text-stone-600 uppercase tracking-wide mb-1">
                      Customer Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={checkoutName}
                      onChange={(e) => setCheckoutName(e.target.value)}
                      placeholder="e.g. Maria de Guzman"
                      className="w-full px-3 py-2 bg-[#FDFBF7] border border-stone-200 rounded-lg text-xs focus:outline-none focus:border-[#3E2723]"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-[10px] font-bold text-stone-600 uppercase tracking-wide mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={checkoutEmail}
                      onChange={(e) => setCheckoutEmail(e.target.value)}
                      placeholder="e.g. maria@gmail.com"
                      className="w-full px-3 py-2 bg-[#FDFBF7] border border-stone-200 rounded-lg text-xs focus:outline-none focus:border-[#3E2723]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Phone */}
                  <div>
                    <label className="block text-[10px] font-bold text-stone-600 uppercase tracking-wide mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="text"
                      required
                      value={checkoutPhone}
                      onChange={(e) => setCheckoutPhone(e.target.value)}
                      placeholder="e.g. +63 917 555 1234"
                      className="w-full px-3 py-2 bg-[#FDFBF7] border border-stone-200 rounded-lg text-xs focus:outline-none focus:border-[#3E2723]"
                    />
                  </div>

                  {/* Order Type */}
                  <div>
                    <label className="block text-[10px] font-bold text-stone-600 uppercase tracking-wide mb-1">
                      Delivery / Fulfillment Type *
                    </label>
                    <select
                      value={checkoutDelivery}
                      onChange={(e) => setCheckoutDelivery(e.target.value as any)}
                      className="w-full px-3 py-2 bg-[#FDFBF7] border border-stone-200 rounded-lg text-xs focus:outline-none focus:border-[#3E2723]"
                    >
                      <option value="Pickup">Flagship Coffee House Pickup</option>
                      <option value="Delivery">Home Delivery Partner</option>
                    </select>
                  </div>
                </div>

                {/* Delivery Address */}
                {checkoutDelivery === 'Delivery' && (
                  <div className="animate-fade-in">
                    <label className="block text-[10px] font-bold text-stone-600 uppercase tracking-wide mb-1">
                      Delivery Address *
                    </label>
                    <textarea
                      required
                      rows={2}
                      value={checkoutAddress}
                      onChange={(e) => setCheckoutAddress(e.target.value)}
                      placeholder="Floor/Room, Building, Street, Barangay, City, Metro Manila..."
                      className="w-full px-3 py-2 bg-[#FDFBF7] border border-stone-200 rounded-lg text-xs focus:outline-none focus:border-[#3E2723] resize-none"
                    />
                  </div>
                )}

                {/* Payment gateway selection */}
                <div>
                  <span className="block text-[10px] font-bold text-stone-600 uppercase tracking-wide mb-2">
                    Select Secure Payment Gateway Integration
                  </span>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'gcash', label: 'GCash e-Wallet', desc: 'Instant connection' },
                      { id: 'card', label: 'Credit Card', desc: 'Visa / Mastercard' },
                      { id: 'cash', label: 'Pay at Counter', desc: 'Cash / Card on pickup' },
                    ].map(pm => (
                      <button
                        key={pm.id}
                        type="button"
                        onClick={() => setCheckoutPayment(pm.id as any)}
                        className={`p-3 text-center rounded-xl border cursor-pointer transition-all ${
                          checkoutPayment === pm.id
                            ? 'bg-emerald-50 border-emerald-600 ring-2 ring-emerald-600/20'
                            : 'bg-[#FDFBF7] text-stone-600 border-stone-200 hover:bg-stone-50'
                        }`}
                        id={`btn-payment-method-${pm.id}`}
                      >
                        <span className="block text-xs font-bold text-[#3E2723]">{pm.label}</span>
                        <span className="block text-[9px] text-stone-400 mt-0.5">{pm.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-[10px] font-bold text-stone-600 uppercase tracking-wide mb-1">
                    Special Brewing / Packing Instructions
                  </label>
                  <input
                    type="text"
                    value={checkoutNotes}
                    onChange={(e) => setCheckoutNotes(e.target.value)}
                    placeholder="e.g. Pack pastry separately, extra ice in cold foam..."
                    className="w-full px-3 py-2 bg-[#FDFBF7] border border-stone-200 rounded-lg text-xs focus:outline-none focus:border-[#3E2723]"
                  />
                </div>

                <div className="pt-4 border-t border-stone-150 flex items-center justify-between">
                  <div className="text-left">
                    <span className="text-[10px] text-stone-400 block uppercase">Total Payable</span>
                    <strong className="text-base text-[#3E2723] font-black">₱{cartTotal}</strong>
                  </div>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                    id="btn-submit-payment"
                  >
                    <LockBadge className="w-3.5 h-3.5" />
                    <span>Authorize Secure Transaction</span>
                  </button>
                </div>

              </form>
            )}

            {/* STEP 2: PROCESSING TRANSACTION */}
            {paymentStep === 'processing' && (
              <div className="p-12 text-center flex flex-col items-center justify-center space-y-4">
                <div className="w-16 h-16 rounded-full border-4 border-stone-100 border-t-emerald-600 animate-spin" />
                <h4 className="font-serif font-extrabold text-base text-[#3E2723]">Processing Secure Transaction</h4>
                <p className="text-xs text-stone-500 max-w-sm">
                  Connecting to secure e-wallet routing systems... verifying balance and authorizing Kahayag order. Please do not close this modal.
                </p>
              </div>
            )}

            {/* STEP 3: TRANSACTION SUCCESS & ACTIVE TRACKER */}
            {paymentStep === 'success' && placedOrder && (
              <div className="p-8 text-center space-y-6">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                  <Check className="w-8 h-8" />
                </div>
                
                <div>
                  <h4 className="font-serif font-black text-xl text-[#3E2723]">Order Placed Successfully!</h4>
                  <p className="text-xs text-stone-500 mt-1">Transaction Ref: <strong>{placedOrder.id}</strong></p>
                </div>

                {/* Order specs overview */}
                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 text-left space-y-2.5 max-w-md mx-auto">
                  <div className="flex justify-between text-xs pb-1.5 border-b border-stone-200/50">
                    <span className="text-stone-400">Customer:</span>
                    <strong className="text-[#3E2723]">{placedOrder.customerName}</strong>
                  </div>
                  <div className="flex justify-between text-xs pb-1.5 border-b border-stone-200/50">
                    <span className="text-stone-400">Payment status:</span>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {placedOrder.paymentStatus} via {placedOrder.paymentMethod.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs pb-1.5 border-b border-stone-200/50">
                    <span className="text-stone-400">Delivery mode:</span>
                    <strong className="text-[#3E2723]">{placedOrder.deliveryType}</strong>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-stone-400">Current Barista Status:</span>
                    <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full animate-pulse uppercase">
                      {placedOrder.status}
                    </span>
                  </div>
                </div>

                {googleToken && spreadsheetUrl ? (
                  <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 text-[11px] flex items-center justify-center gap-2 max-w-md mx-auto">
                    <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>
                      Order successfully logged to Google Sheets!{' '}
                      <a 
                        href={spreadsheetUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="underline font-bold text-emerald-950 hover:text-black inline-flex items-center gap-0.5"
                      >
                        Open Spreadsheet
                        <svg className="w-3 h-3 text-emerald-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    </span>
                  </div>
                ) : (
                  <div className="p-3 bg-stone-50 text-stone-500 rounded-xl border border-stone-200/65 text-[10px] max-w-md mx-auto">
                    Order is stored locally. Connect your Google account below to enable live Google Sheets backups.
                  </div>
                )}

                <div className="bg-amber-50 p-4 rounded-xl border border-amber-200/40 text-[10px] text-stone-500 max-w-md mx-auto text-center leading-relaxed">
                  Our baristas are preparing your batch now. Your 5-minute cancellation safety timer has started. Head over to the FAQs if you have questions!
                </div>

                <div className="flex justify-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCheckoutOpen(false);
                      setPlacedOrder(null);
                    }}
                    className="px-6 py-2.5 bg-[#3E2723] hover:bg-[#5D4037] text-white font-bold rounded-xl text-xs uppercase tracking-wider"
                    id="btn-finish-checkout"
                  >
                    Back to Coffee Shop
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* GOOGLE SHEETS & CLOUD SYNC HUB SECTION */}
      <section className="bg-amber-50 border-t-2 border-amber-200/50 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-amber-200 mb-8">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-100 p-2.5 rounded-xl text-emerald-950">
                <svg className="w-5 h-5 text-emerald-700" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-serif font-black text-xl text-[#3E2723]">Kahayag Brew Data Hub</h3>
                <p className="text-stone-500 text-xs mt-0.5">Live Google Sheets & Cloud Synchronization Console.</p>
              </div>
            </div>
          </div>

          {/* GOOGLE SHEETS INTEGRATION CARD */}
          <div className="bg-white p-6 rounded-3xl border border-amber-200/60 shadow-sm mb-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="bg-emerald-50 text-emerald-700 p-3 rounded-2xl shrink-0">
                  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM6 6h5v4H6V6zm5 12H6v-4h5v4zm0-5H6V9h5v4zm7 5h-5v-4h5v4zm0-5h-5V9h5v4zm0-5h-5V6h5v4z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-serif font-bold text-lg text-[#3E2723] flex items-center gap-2">
                    <span>Google Sheets & Drive Integration</span>
                    {googleToken ? (
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Connected
                      </span>
                    ) : (
                      <span className="bg-stone-100 text-stone-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Disconnected
                      </span>
                    )}
                  </h4>
                  <p className="text-stone-500 text-xs mt-1 max-w-2xl">
                    Automatically store every checkout order and contact message directly in your secure Google Spreadsheet. No manual data transfer needed!
                  </p>
                  {spreadsheetUrl && (
                    <div className="mt-3 flex items-center gap-2 text-xs">
                      <span className="text-stone-400 font-medium">Spreadsheet Link:</span>
                      <a 
                        href={spreadsheetUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-emerald-700 hover:text-emerald-800 font-semibold underline flex items-center gap-1"
                      >
                        Kahayag Brew Data
                        <svg className="w-3.5 h-3.5 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto shrink-0 justify-end">
                {googleInitLoading ? (
                  <div className="flex items-center gap-2 text-stone-400 text-xs py-2 px-4">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Checking Google session...</span>
                  </div>
                ) : !googleToken ? (
                  <button
                    type="button"
                    onClick={handleGoogleConnect}
                    disabled={isConnectingGoogle}
                    className="w-full md:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold rounded-2xl text-xs uppercase shadow-sm transition-all"
                  >
                    {isConnectingGoogle ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Connecting...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M21.35 11.1H12v2.7h5.38c-.24 1.28-.96 2.37-2.03 3.09v2.56h3.28c1.92-1.77 3.02-4.38 3.02-7.47 0-.61-.05-1.2-.15-1.78z" fill="#4285F4"/>
                          <path d="M12 21c2.43 0 4.47-.8 5.96-2.18l-3.28-2.56c-.9.6-2.06.96-3.68.96-2.83 0-5.22-1.92-6.08-4.5H1.58v2.66C3.07 18.52 7.23 21 12 21z" fill="#34A853"/>
                          <path d="M5.92 12.72c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V5.88H1.58C.57 7.9 0 10.15 0 12.5s.57 4.6 1.58 6.62l4.34-3.4z" fill="#FBBC05"/>
                          <path d="M12 4.08c1.63 0 3.1.56 4.25 1.66l3.19-3.19C17.47 1.13 14.43.5 12.01.5 7.23.5 3.07 2.98 1.58 6.88l4.34 3.4c.86-2.58 3.25-4.5 6.08-4.5z" fill="#EA4335"/>
                        </svg>
                        <span>Connect Google Sheets</span>
                      </>
                    )}
                  </button>
                ) : (
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={handleSyncAllPastRecords}
                      disabled={isSyncingAll}
                      className="flex items-center justify-center gap-1.5 px-4 py-2 bg-amber-700 hover:bg-amber-800 disabled:opacity-50 text-white font-bold rounded-xl text-xs uppercase"
                    >
                      {isSyncingAll ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Syncing...</span>
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Sync Past Data</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={handleGoogleDisconnect}
                      className="px-4 py-2 border border-stone-200 hover:bg-stone-50 text-stone-600 font-semibold rounded-xl text-xs uppercase"
                    >
                      Disconnect
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}

// Minimalist icon helper component for Locks
function LockBadge({ className = '' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  );
}
