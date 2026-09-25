import { Transaction, TeacherStaff, BusinessProfile, Invoice, IssuedReceipt, UserAccount } from '../types';

const DB_NAME = 'LedgerLiteDB';
const DB_VERSION = 2;
const STORE_TRANSACTIONS = 'transactions';
const STORE_PHOTOS = 'receipt_photos';
const STORE_INVOICES = 'invoices';
const STORE_ISSUED_RECEIPTS = 'issued_receipts';

const DEFAULT_PROFILE: BusinessProfile = {
  businessName: '',
  ownerName: '',
  businessType: 'general',
  tagline: '',
  communityLocation: '',
  currency: 'NGN',
  currencySymbol: '₦',
  termOrPeriod: '',
  defaultPosAgent: '',
  phone: '',
  email: '',
  bankAccountDetails: '',
  openingCash: 0,
};

const DEFAULT_ACCOUNT: UserAccount = {
  id: 'acc-owner-1',
  fullName: 'Business Owner',
  emailOrPhone: '',
  role: 'owner',
  pin: '1234',
  businessName: '',
  createdAt: Date.now(),
  lastLoginAt: Date.now(),
};

const DEFAULT_STAFF: TeacherStaff[] = [];

const SEED_TRANSACTIONS: Transaction[] = [];

const SEED_INVOICES: Invoice[] = [];

const SEED_ISSUED_RECEIPTS: IssuedReceipt[] = [];


// Open IndexedDB instance safely with version upgrade
function openDB(): Promise<IDBDatabase | null> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      resolve(null);
      return;
    }
    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = (e: any) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(STORE_TRANSACTIONS)) {
          db.createObjectStore(STORE_TRANSACTIONS, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(STORE_PHOTOS)) {
          db.createObjectStore(STORE_PHOTOS, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(STORE_INVOICES)) {
          db.createObjectStore(STORE_INVOICES, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(STORE_ISSUED_RECEIPTS)) {
          db.createObjectStore(STORE_ISSUED_RECEIPTS, { keyPath: 'id' });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

// Storage helpers
export const storage = {
  // Profile
  getProfile(): BusinessProfile {
    try {
      const saved = localStorage.getItem('ledgerlite_profile') || localStorage.getItem('kuditrack_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_PROFILE,
          ...parsed,
          ownerName: parsed.ownerName || DEFAULT_PROFILE.ownerName,
        };
      }
    } catch (e) {
      console.warn('Failed to parse profile', e);
    }
    return DEFAULT_PROFILE;
  },

  saveProfile(profile: BusinessProfile) {
    try {
      localStorage.setItem('ledgerlite_profile', JSON.stringify(profile));
    } catch (e) {
      console.error('Failed to save profile', e);
    }
  },

  // Staff
  getStaff(): TeacherStaff[] {
    try {
      const saved = localStorage.getItem('ledgerlite_staff') || localStorage.getItem('kuditrack_staff');
      if (saved) {
        const parsed: TeacherStaff[] = JSON.parse(saved);
        return parsed.map((s) => ({
          ...s,
          roleType: s.roleType || 'cashier',
        }));
      }
    } catch (e) {
      console.warn('Failed to parse staff', e);
    }
    return DEFAULT_STAFF;
  },

  saveStaff(staff: TeacherStaff[]) {
    try {
      localStorage.setItem('ledgerlite_staff', JSON.stringify(staff));
    } catch (e) {
      console.error('Failed to save staff', e);
    }
  },

  // Accounts & Authentication
  getAccounts(): UserAccount[] {
    try {
      const saved = localStorage.getItem('ledgerlite_accounts') || localStorage.getItem('kuditrack_accounts');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse accounts', e);
    }
    return [DEFAULT_ACCOUNT];
  },

  saveAccount(account: UserAccount) {
    try {
      const accounts = this.getAccounts();
      const existingIdx = accounts.findIndex(
        (a) => a.id === account.id || (a.emailOrPhone && a.emailOrPhone === account.emailOrPhone)
      );
      let updated: UserAccount[];
      if (existingIdx >= 0) {
        updated = accounts.map((a, i) => (i === existingIdx ? account : a));
      } else {
        updated = [...accounts, account];
      }
      localStorage.setItem('ledgerlite_accounts', JSON.stringify(updated));
      localStorage.setItem('ledgerlite_current_account', JSON.stringify(account));
    } catch (e) {
      console.error('Failed to save account', e);
    }
  },

  getCurrentAccount(): UserAccount {
    try {
      const saved = localStorage.getItem('ledgerlite_current_account') || localStorage.getItem('kuditrack_current_account');
      if (saved) return JSON.parse(saved);
      const accounts = this.getAccounts();
      if (accounts.length > 0) return accounts[0];
    } catch (e) {
      console.warn('Failed to parse current account', e);
    }
    return DEFAULT_ACCOUNT;
  },

  setCurrentAccount(account: UserAccount) {
    try {
      localStorage.setItem('ledgerlite_current_account', JSON.stringify(account));
    } catch (e) {
      console.error('Failed to set current account', e);
    }
  },

  setLoggedOut(value: boolean) {
    localStorage.setItem('ledgerlite_logged_out', value ? 'true' : 'false');
  },

  isLoggedOut(): boolean {
    return localStorage.getItem('ledgerlite_logged_out') === 'true';
  },

  isOnboarded(): boolean {
    return localStorage.getItem('ledgerlite_onboarded') === 'true';
  },

  setOnboarded(value: boolean) {
    localStorage.setItem('ledgerlite_onboarded', value ? 'true' : 'false');
  },

  isRealDataMode(): boolean {
    return true;
  },

  setRealDataMode(_val: boolean) {
    localStorage.setItem('ledgerlite_is_real_data', 'true');
  },

  ensureCleanSlate(): boolean {
    const isCleaned = localStorage.getItem('ledgerlite_clean_slate_active_v4') === 'true';
    if (!isCleaned) {
      try {
        localStorage.removeItem('kuditrack_transactions');
        localStorage.removeItem('kuditrack_invoices');
        localStorage.removeItem('kuditrack_issued_receipts');
        localStorage.removeItem('kuditrack_profile');
        localStorage.removeItem('kuditrack_current_account');
        localStorage.removeItem('kuditrack_accounts');
        localStorage.removeItem('kuditrack_staff');

        const profStr = localStorage.getItem('ledgerlite_profile');
        if (profStr && (profStr.includes('Grace') || profStr.includes('Ikorodu'))) {
          localStorage.removeItem('ledgerlite_profile');
        }

        const accStr = localStorage.getItem('ledgerlite_current_account');
        if (accStr && accStr.includes('Grace')) {
          localStorage.removeItem('ledgerlite_current_account');
          localStorage.removeItem('ledgerlite_accounts');
        }

        const staffStr = localStorage.getItem('ledgerlite_staff');
        if (staffStr && (staffStr.includes('Adeleke') || staffStr.includes('Okon'))) {
          localStorage.removeItem('ledgerlite_staff');
        }

        const txStr = localStorage.getItem('ledgerlite_transactions');
        if (txStr && (txStr.includes('tx-101') || txStr.includes('Amina Bello'))) {
          localStorage.removeItem('ledgerlite_transactions');
          localStorage.removeItem('ledgerlite_tx_cache');
        }

        const invStr = localStorage.getItem('ledgerlite_invoices');
        if (invStr && (invStr.includes('inv-101') || invStr.includes('Okonkwo'))) {
          localStorage.removeItem('ledgerlite_invoices');
        }

        const recStr = localStorage.getItem('ledgerlite_issued_receipts');
        if (recStr && (recStr.includes('rec-101') || recStr.includes('Amina Bello'))) {
          localStorage.removeItem('ledgerlite_issued_receipts');
        }

        this.clearAllRecords();
      } catch (e) {
        console.warn('ensureCleanSlate error', e);
      }
      localStorage.setItem('ledgerlite_clean_slate_active_v4', 'true');
      localStorage.setItem('ledgerlite_is_real_data', 'true');
      return true;
    }
    return false;
  },

  async clearAllRecords(): Promise<void> {
    const db = await openDB();
    if (db) {
      try {
        const tx = db.transaction([STORE_TRANSACTIONS, STORE_INVOICES, STORE_ISSUED_RECEIPTS], 'readwrite');
        tx.objectStore(STORE_TRANSACTIONS).clear();
        tx.objectStore(STORE_INVOICES).clear();
        tx.objectStore(STORE_ISSUED_RECEIPTS).clear();
      } catch (e) {
        console.warn('Clear DB error', e);
      }
    }
    localStorage.removeItem('ledgerlite_transactions');
    localStorage.removeItem('ledgerlite_invoices');
    localStorage.removeItem('ledgerlite_issued_receipts');
    localStorage.removeItem('ledgerlite_tx_cache');
    localStorage.setItem('ledgerlite_is_real_data', 'true');
  },

  // Transactions (IndexedDB + LocalStorage sync)
  async getTransactions(): Promise<Transaction[]> {
    const db = await openDB();
    if (db) {
      return new Promise((resolve) => {
        try {
          const tx = db.transaction(STORE_TRANSACTIONS, 'readonly');
          const store = tx.objectStore(STORE_TRANSACTIONS);
          const request = store.getAll();
          request.onsuccess = () => {
            const list = request.result;
            if (list && list.length > 0) {
              localStorage.setItem('ledgerlite_tx_cache', JSON.stringify(list.slice(0, 30)));
              resolve(list.sort((a, b) => b.createdAt - a.createdAt));
            } else if (storage.isRealDataMode()) {
              resolve([]);
            } else {
              storage.seedInitialData().then((seeded) => resolve(seeded));
            }
          };
          request.onerror = () => {
            resolve(storage.getTransactionsFallback());
          };
        } catch {
          resolve(storage.getTransactionsFallback());
        }
      });
    }
    return storage.getTransactionsFallback();
  },

  getTransactionsFallback(): Transaction[] {
    if (storage.isRealDataMode()) return [];
    try {
      const saved = localStorage.getItem('ledgerlite_transactions') || localStorage.getItem('kuditrack_transactions');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Fallback error', e);
    }
    return SEED_TRANSACTIONS;
  },

  async saveTransaction(transaction: Transaction): Promise<void> {
    const db = await openDB();
    if (db) {
      try {
        const tx = db.transaction(STORE_TRANSACTIONS, 'readwrite');
        const store = tx.objectStore(STORE_TRANSACTIONS);
        store.put(transaction);
      } catch (err) {
        console.error('Error saving to IndexedDB', err);
      }
    }

    try {
      const current = await this.getTransactions();
      const existingIdx = current.findIndex(t => t.id === transaction.id);
      let updated: Transaction[];
      if (existingIdx >= 0) {
        updated = [...current];
        updated[existingIdx] = transaction;
      } else {
        updated = [transaction, ...current];
      }
      localStorage.setItem('ledgerlite_transactions', JSON.stringify(updated));
    } catch (e) {
      console.warn('LocalStorage save failed', e);
    }
  },

  async deleteTransaction(id: string): Promise<void> {
    const db = await openDB();
    if (db) {
      try {
        const tx = db.transaction(STORE_TRANSACTIONS, 'readwrite');
        const store = tx.objectStore(STORE_TRANSACTIONS);
        store.delete(id);
      } catch (err) {
        console.error('Error deleting from IndexedDB', err);
      }
    }

    try {
      const current = await this.getTransactions();
      const filtered = current.filter(t => t.id !== id);
      localStorage.setItem('ledgerlite_transactions', JSON.stringify(filtered));
    } catch (e) {
      console.warn('LocalStorage delete failed', e);
    }
  },

  // Save large receipt image into IndexedDB to preserve against faded ink
  async saveReceiptPhoto(id: string, photoDataUrl: string): Promise<void> {
    const db = await openDB();
    if (db) {
      try {
        const tx = db.transaction(STORE_PHOTOS, 'readwrite');
        const store = tx.objectStore(STORE_PHOTOS);
        store.put({ id, photoDataUrl, savedAt: Date.now() });
      } catch (e) {
        console.error('Failed to store receipt photo in IndexedDB', e);
      }
    }
  },

  async getReceiptPhoto(id: string): Promise<string | null> {
    const db = await openDB();
    if (db) {
      return new Promise((resolve) => {
        try {
          const tx = db.transaction(STORE_PHOTOS, 'readonly');
          const store = tx.objectStore(STORE_PHOTOS);
          const req = store.get(id);
          req.onsuccess = () => {
            resolve(req.result?.photoDataUrl || null);
          };
          req.onerror = () => resolve(null);
        } catch {
          resolve(null);
        }
      });
    }
    return null;
  },

  // ==========================================
  // INVOICES MANAGEMENT
  // ==========================================
  async getInvoices(): Promise<Invoice[]> {
    const db = await openDB();
    if (db) {
      return new Promise((resolve) => {
        try {
          const tx = db.transaction(STORE_INVOICES, 'readonly');
          const store = tx.objectStore(STORE_INVOICES);
          const request = store.getAll();
          request.onsuccess = () => {
            const list = request.result;
            if (list && list.length > 0) {
              resolve(list.sort((a, b) => b.createdAt - a.createdAt));
            } else if (storage.isRealDataMode()) {
              resolve([]);
            } else {
              storage.seedInvoices().then((seeded) => resolve(seeded));
            }
          };
          request.onerror = () => {
            resolve(storage.getInvoicesFallback());
          };
        } catch {
          resolve(storage.getInvoicesFallback());
        }
      });
    }
    return storage.getInvoicesFallback();
  },

  getInvoicesFallback(): Invoice[] {
    if (storage.isRealDataMode()) return [];
    try {
      const saved = localStorage.getItem('ledgerlite_invoices') || localStorage.getItem('kuditrack_invoices');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Invoices fallback error', e);
    }
    return SEED_INVOICES;
  },

  async saveInvoice(invoice: Invoice): Promise<void> {
    const db = await openDB();
    if (db) {
      try {
        const tx = db.transaction(STORE_INVOICES, 'readwrite');
        const store = tx.objectStore(STORE_INVOICES);
        store.put(invoice);
      } catch (e) {
        console.error('Error saving invoice to IndexedDB', e);
      }
    }
    try {
      const current = await this.getInvoices();
      const idx = current.findIndex(i => i.id === invoice.id);
      let updated: Invoice[];
      if (idx >= 0) {
        updated = [...current];
        updated[idx] = invoice;
      } else {
        updated = [invoice, ...current];
      }
      localStorage.setItem('ledgerlite_invoices', JSON.stringify(updated));
    } catch (e) {
      console.warn('LocalStorage save invoice failed', e);
    }
  },

  async deleteInvoice(id: string): Promise<void> {
    const db = await openDB();
    if (db) {
      try {
        const tx = db.transaction(STORE_INVOICES, 'readwrite');
        const store = tx.objectStore(STORE_INVOICES);
        store.delete(id);
      } catch (e) {
        console.error('Error deleting invoice from IndexedDB', e);
      }
    }
    try {
      const current = await this.getInvoices();
      const filtered = current.filter(i => i.id !== id);
      localStorage.setItem('ledgerlite_invoices', JSON.stringify(filtered));
    } catch (e) {
      console.warn('LocalStorage delete invoice failed', e);
    }
  },

  async seedInvoices(): Promise<Invoice[]> {
    return [];
  },

  // ==========================================
  // ISSUED RECEIPTS MANAGEMENT
  // ==========================================
  async getIssuedReceipts(): Promise<IssuedReceipt[]> {
    const db = await openDB();
    if (db) {
      return new Promise((resolve) => {
        try {
          const tx = db.transaction(STORE_ISSUED_RECEIPTS, 'readonly');
          const store = tx.objectStore(STORE_ISSUED_RECEIPTS);
          const request = store.getAll();
          request.onsuccess = () => {
            const list = request.result;
            if (list && list.length > 0) {
              resolve(list.sort((a, b) => b.createdAt - a.createdAt));
            } else if (storage.isRealDataMode()) {
              resolve([]);
            } else {
              storage.seedIssuedReceipts().then((seeded) => resolve(seeded));
            }
          };
          request.onerror = () => {
            resolve(storage.getIssuedReceiptsFallback());
          };
        } catch {
          resolve(storage.getIssuedReceiptsFallback());
        }
      });
    }
    return storage.getIssuedReceiptsFallback();
  },

  getIssuedReceiptsFallback(): IssuedReceipt[] {
    if (storage.isRealDataMode()) return [];
    try {
      const saved = localStorage.getItem('ledgerlite_issued_receipts') || localStorage.getItem('kuditrack_issued_receipts');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Issued receipts fallback error', e);
    }
    return SEED_ISSUED_RECEIPTS;
  },

  async saveIssuedReceipt(receipt: IssuedReceipt): Promise<void> {
    const db = await openDB();
    if (db) {
      try {
        const tx = db.transaction(STORE_ISSUED_RECEIPTS, 'readwrite');
        const store = tx.objectStore(STORE_ISSUED_RECEIPTS);
        store.put(receipt);
      } catch (e) {
        console.error('Error saving receipt to IndexedDB', e);
      }
    }
    try {
      const current = await this.getIssuedReceipts();
      const idx = current.findIndex(r => r.id === receipt.id);
      let updated: IssuedReceipt[];
      if (idx >= 0) {
        updated = [...current];
        updated[idx] = receipt;
      } else {
        updated = [receipt, ...current];
      }
      localStorage.setItem('ledgerlite_issued_receipts', JSON.stringify(updated));
    } catch (e) {
      console.warn('LocalStorage save receipt failed', e);
    }
  },

  async deleteIssuedReceipt(id: string): Promise<void> {
    const db = await openDB();
    if (db) {
      try {
        const tx = db.transaction(STORE_ISSUED_RECEIPTS, 'readwrite');
        const store = tx.objectStore(STORE_ISSUED_RECEIPTS);
        store.delete(id);
      } catch (e) {
        console.error('Error deleting receipt from IndexedDB', e);
      }
    }
    try {
      const current = await this.getIssuedReceipts();
      const filtered = current.filter(r => r.id !== id);
      localStorage.setItem('ledgerlite_issued_receipts', JSON.stringify(filtered));
    } catch (e) {
      console.warn('LocalStorage delete receipt failed', e);
    }
  },

  async seedIssuedReceipts(): Promise<IssuedReceipt[]> {
    return [];
  },

  // Seed all initial records
  async seedInitialData(): Promise<Transaction[]> {
    return [];
  },

  // Export data as JSON file for full offline backup
  exportBackupJSON(
    transactions: Transaction[],
    staff: TeacherStaff[],
    profile: BusinessProfile,
    invoices: Invoice[] = [],
    issuedReceipts: IssuedReceipt[] = []
  ) {
    const backup = {
      app: 'LedgerLite',
      version: '2.0',
      exportedAt: new Date().toISOString(),
      profile,
      staff,
      transactions,
      invoices,
      issuedReceipts,
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ledgerlite-complete-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },

  // Export transactions as CSV for board meetings and excel sheets
  exportToCSV(transactions: Transaction[], currencySymbol: string) {
    const headers = ['ID', 'Date', 'Type', 'Amount (' + currencySymbol + ')', 'Category', 'Title', 'Payer/Payee', 'Method', 'Reference', 'POS Agent', 'Verified', 'Notes'];
    const rows = transactions.map(t => [
      `"${t.id}"`,
      `"${t.date}"`,
      `"${t.type.toUpperCase()}"`,
      `"${t.amount}"`,
      `"${t.category}"`,
      `"${(t.title || '').replace(/"/g, '""')}"`,
      `"${(t.payerOrPayee || '').replace(/"/g, '""')}"`,
      `"${t.paymentMethod}"`,
      `"${(t.referenceNumber || '').replace(/"/g, '""')}"`,
      `"${(t.posAgentName || '').replace(/"/g, '""')}"`,
      `"${t.verified ? 'YES' : 'NO'}"`,
      `"${(t.notes || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cash-flow-records-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  },
};
