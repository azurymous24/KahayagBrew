/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  User,
  signOut
} from 'firebase/auth';
import { Order, ContactMessage } from '../types';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Configure Google OAuth provider with required scopes
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('https://www.googleapis.com/auth/spreadsheets');
googleProvider.addScope('https://www.googleapis.com/auth/drive.file');

let isSigningIn = false;
let cachedAccessToken: string | null = null;

// Initialize auth listener
export const initAuth = (
  onAuthSuccess: (user: User, token: string) => void,
  onAuthFailure: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        // Clear if not in the middle of active popups
        cachedAccessToken = null;
        onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      onAuthFailure();
    }
  });
};

// Sign in via Google popup and fetch access token
export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, googleProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to obtain Google access token from Firebase Auth credential');
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error) {
    console.error('Google Sign-In failed:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

// Log out and wipe memory cache
export const googleSignOut = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};

export const getAccessToken = () => cachedAccessToken;

// -------------------------------------------------------------------------
// GOOGLE SHEETS & DRIVE API ACTIONS
// -------------------------------------------------------------------------

const HARDCODED_SPREADSHEET_ID = '1K89QaqCxdAjkFooZkwnTMmY7kWKG9Qg5XANjShMw_Xg';
const SPREADSHEET_URL = `https://docs.google.com/spreadsheets/d/${HARDCODED_SPREADSHEET_ID}/edit`;

/**
 * Connects to the user's specific Google Spreadsheet.
 * Automatically checks for 'Orders' and 'Contact Messages' tabs, creating and initializing them if they are missing.
 */
export const findOrCreateSpreadsheet = async (accessToken: string): Promise<{ id: string; url: string }> => {
  try {
    // 1. Fetch spreadsheet metadata to check existing tabs
    const metadataUrl = `https://sheets.googleapis.com/v4/spreadsheets/${HARDCODED_SPREADSHEET_ID}`;
    const response = await fetch(metadataUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Failed to access the specified Google Sheet: ${errText}`);
    }

    const data = await response.json();
    const existingSheets: string[] = (data.sheets || []).map((s: any) => s.properties?.title || '');

    const requests = [];
    const initializeOrdersHeader = !existingSheets.includes('Orders');
    const initializeContactHeader = !existingSheets.includes('Contact Messages');

    if (initializeOrdersHeader) {
      requests.push({
        addSheet: {
          properties: {
            title: 'Orders',
            gridProperties: {
              frozenRowCount: 1,
            },
          },
        },
      });
    }

    if (initializeContactHeader) {
      requests.push({
        addSheet: {
          properties: {
            title: 'Contact Messages',
            gridProperties: {
              frozenRowCount: 1,
            },
          },
        },
      });
    }

    // 2. Perform batchUpdate if we need to add any sheets
    if (requests.length > 0) {
      const batchUrl = `https://sheets.googleapis.com/v4/spreadsheets/${HARDCODED_SPREADSHEET_ID}:batchUpdate`;
      const batchResponse = await fetch(batchUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ requests }),
      });

      if (!batchResponse.ok) {
        const errText = await batchResponse.text();
        throw new Error(`Failed to create necessary sheet tabs inside spreadsheet: ${errText}`);
      }
    }

    // 3. Initialize headers for Orders sheet if we just created it
    if (initializeOrdersHeader) {
      const ordersHeaders = [
        'Order ID',
        'Timestamp',
        'Customer Name',
        'Email',
        'Phone',
        'Delivery Type',
        'Address',
        'Items Summary',
        'Subtotal (₱)',
        'Tax (₱)',
        'Total (₱)',
        'Payment Method',
        'Payment Status',
        'Order Status',
        'Notes'
      ];
      await appendRow(HARDCODED_SPREADSHEET_ID, 'Orders!A1', ordersHeaders, accessToken);
    }

    // 4. Initialize headers for Contact Messages sheet if we just created it
    if (initializeContactHeader) {
      const contactHeaders = [
        'Message ID',
        'Timestamp',
        'Name',
        'Email',
        'Phone',
        'Subject',
        'Message',
        'Is Catering?',
        'Event Date',
        'Guest Count',
        'Status'
      ];
      await appendRow(HARDCODED_SPREADSHEET_ID, 'Contact Messages!A1', contactHeaders, accessToken);
    }

    return { id: HARDCODED_SPREADSHEET_ID, url: SPREADSHEET_URL };
  } catch (error) {
    console.error('Error in findOrCreateSpreadsheet:', error);
    throw error;
  }
};

/**
 * Appends a row of data values into a spreadsheet under specified sheet/range.
 */
export const appendRow = async (
  spreadsheetId: string,
  range: string,
  values: (string | number | boolean)[],
  accessToken: string
) => {
  const appendUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(
    range
  )}:append?valueInputOption=RAW`;

  const body = {
    values: [values],
  };

  const response = await fetch(appendUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Append failed on range ${range}: ${errText}`);
  }

  return response.json();
};

/**
 * Helper to translate Order item lists into a clean readable string.
 */
export const formatOrderItems = (order: Order): string => {
  return order.items
    .map(
      (item) =>
        `${item.quantity}x ${item.menuItem.name} (${item.size}, ${
          item.milk === 'None' ? 'No Milk' : `${item.milk} Milk`
        }, ${item.sweetness} Sweetness)`
    )
    .join('; ');
};

/**
 * Push an Order to Google Sheets
 */
export const syncOrderToSheets = async (
  spreadsheetId: string,
  order: Order,
  accessToken: string
) => {
  const values = [
    order.id,
    new Date(order.createdAt).toLocaleString(),
    order.customerName,
    order.email,
    order.phone,
    order.deliveryType,
    order.address || 'N/A',
    formatOrderItems(order),
    order.subtotal,
    order.tax,
    order.total,
    order.paymentMethod.toUpperCase(),
    order.paymentStatus,
    order.status,
    order.notes || ''
  ];

  return appendRow(spreadsheetId, 'Orders!A1', values, accessToken);
};

/**
 * Push a ContactMessage to Google Sheets
 */
export const syncMessageToSheets = async (
  spreadsheetId: string,
  message: ContactMessage,
  accessToken: string
) => {
  const values = [
    message.id,
    new Date(message.createdAt).toLocaleString(),
    message.name,
    message.email,
    message.phone || 'N/A',
    message.subject.toUpperCase(),
    message.message,
    message.isCatering ? 'Yes' : 'No',
    message.eventDate || 'N/A',
    message.guestCount || 'N/A',
    message.status
  ];

  return appendRow(spreadsheetId, 'Contact Messages!A1', values, accessToken);
};

/**
 * Sends order or inquiry data directly to the user's deployed Google Apps Script Web App.
 * This does not require OAuth sign-in and works completely automatically in the background.
 */
export const syncToAppsScript = async (
  type: 'order' | 'message',
  data: any
): Promise<boolean> => {
  const deploymentId = 'AKfycbypFaIpTzrIb9Jb-iz59JrGSuBsDEYYVfnrBYSv9ESDhvJHMDIs5F80_bJlx0WPv5sWbw';
  const scriptUrl = `https://script.google.com/macros/s/${deploymentId}/exec`;

  try {
    const response = await fetch(scriptUrl, {
      method: 'POST',
      mode: 'no-cors', // Essential for handling Google Apps Script redirection without CORS issues
      headers: {
        'Content-Type': 'text/plain',
      },
      body: JSON.stringify({
        type,
        data,
        timestamp: new Date().toISOString()
      }),
    });
    return true;
  } catch (error) {
    console.error('Apps Script Sync Error:', error);
    return false;
  }
};

