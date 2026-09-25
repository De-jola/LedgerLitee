import {
  collection,
  doc,
  setDoc,
  getDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { Transaction, Invoice, IssuedReceipt, BusinessProfile, TeacherStaff, AppUser } from '../types';

export const firebaseService = {
  // --- USERS DIRECTORY & AUTH ---
  async saveUser(user: AppUser): Promise<void> {
    const path = `users/${user.id}`;
    try {
      const payload: Record<string, unknown> = {
        ...user,
        lastLoginAt: Date.now(),
      };
      Object.keys(payload).forEach((key) => {
        if (payload[key] === undefined) {
          delete payload[key];
        }
      });
      await setDoc(doc(db, 'users', user.id), payload, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async getUser(userId: string): Promise<AppUser | null> {
    const path = `users/${userId}`;
    try {
      const docSnap = await getDoc(doc(db, 'users', userId));
      if (docSnap.exists()) {
        return docSnap.data() as AppUser;
      }
      return null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
    }
  },

  subscribeAllUsers(callback: (users: AppUser[]) => void): () => void {
    const colRef = collection(db, 'users');
    return onSnapshot(
      colRef,
      (snapshot) => {
        const users: AppUser[] = [];
        snapshot.forEach((docSnap) => {
          users.push({ ...(docSnap.data() as AppUser), id: docSnap.id });
        });
        users.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        callback(users);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'users');
      }
    );
  },

  async getAllUsers(): Promise<AppUser[]> {
    const path = 'users';
    try {
      const snapshot = await getDocs(collection(db, 'users'));
      const users: AppUser[] = [];
      snapshot.forEach((docSnap) => {
        users.push({ ...(docSnap.data() as AppUser), id: docSnap.id });
      });
      users.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      return users;
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  },

  // --- TRANSACTIONS ---
  subscribeTransactions(
    userId: string,
    callback: (txs: Transaction[]) => void
  ): () => void {
    const colRef = collection(db, 'transactions');
    const q = query(colRef, where('userId', '==', userId));

    return onSnapshot(
      q,
      (snapshot) => {
        const txs: Transaction[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as Transaction;
          txs.push({ ...data, id: docSnap.id });
        });
        // Sort descending by date & createdAt
        txs.sort((a, b) => b.createdAt - a.createdAt);
        callback(txs);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'transactions');
      }
    );
  },

  async saveTransaction(tx: Transaction, userId: string): Promise<void> {
    const path = `transactions/${tx.id}`;
    try {
      const payload: Record<string, unknown> = {
        ...tx,
        userId,
      };
      // Clean up undefined properties to avoid Firestore serialization errors
      Object.keys(payload).forEach((key) => {
        if (payload[key] === undefined) {
          delete payload[key];
        }
      });
      await setDoc(doc(db, 'transactions', tx.id), payload);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async deleteTransaction(txId: string): Promise<void> {
    const path = `transactions/${txId}`;
    try {
      await deleteDoc(doc(db, 'transactions', txId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  // --- INVOICES ---
  subscribeInvoices(
    userId: string,
    callback: (invoices: Invoice[]) => void
  ): () => void {
    const colRef = collection(db, 'invoices');
    const q = query(colRef, where('userId', '==', userId));

    return onSnapshot(
      q,
      (snapshot) => {
        const invoices: Invoice[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as Invoice;
          invoices.push({ ...data, id: docSnap.id });
        });
        invoices.sort((a, b) => b.createdAt - a.createdAt);
        callback(invoices);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'invoices');
      }
    );
  },

  async saveInvoice(invoice: Invoice, userId: string): Promise<void> {
    const path = `invoices/${invoice.id}`;
    try {
      const payload: Record<string, unknown> = {
        ...invoice,
        userId,
      };
      Object.keys(payload).forEach((key) => {
        if (payload[key] === undefined) {
          delete payload[key];
        }
      });
      await setDoc(doc(db, 'invoices', invoice.id), payload);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async deleteInvoice(invoiceId: string): Promise<void> {
    const path = `invoices/${invoiceId}`;
    try {
      await deleteDoc(doc(db, 'invoices', invoiceId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  // --- ISSUED RECEIPTS ---
  subscribeIssuedReceipts(
    userId: string,
    callback: (receipts: IssuedReceipt[]) => void
  ): () => void {
    const colRef = collection(db, 'issued_receipts');
    const q = query(colRef, where('userId', '==', userId));

    return onSnapshot(
      q,
      (snapshot) => {
        const receipts: IssuedReceipt[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as IssuedReceipt;
          receipts.push({ ...data, id: docSnap.id });
        });
        receipts.sort((a, b) => b.createdAt - a.createdAt);
        callback(receipts);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'issued_receipts');
      }
    );
  },

  async saveIssuedReceipt(receipt: IssuedReceipt, userId: string): Promise<void> {
    const path = `issued_receipts/${receipt.id}`;
    try {
      const payload: Record<string, unknown> = {
        ...receipt,
        userId,
      };
      Object.keys(payload).forEach((key) => {
        if (payload[key] === undefined) {
          delete payload[key];
        }
      });
      await setDoc(doc(db, 'issued_receipts', receipt.id), payload);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async deleteIssuedReceipt(receiptId: string): Promise<void> {
    const path = `issued_receipts/${receiptId}`;
    try {
      await deleteDoc(doc(db, 'issued_receipts', receiptId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  // --- BUSINESS PROFILE ---
  subscribeBusinessProfile(
    userId: string,
    callback: (profile: BusinessProfile | null) => void
  ): () => void {
    const docRef = doc(db, 'business_profiles', userId);

    return onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          callback(docSnap.data() as BusinessProfile);
        } else {
          callback(null);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, `business_profiles/${userId}`);
      }
    );
  },

  async saveBusinessProfile(profile: BusinessProfile, userId: string): Promise<void> {
    const path = `business_profiles/${userId}`;
    try {
      const payload: Record<string, unknown> = {
        ...profile,
        userId,
        updatedAt: Date.now(),
      };
      Object.keys(payload).forEach((key) => {
        if (payload[key] === undefined) {
          delete payload[key];
        }
      });
      await setDoc(doc(db, 'business_profiles', userId), payload);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  // --- STAFF ---
  subscribeStaff(
    userId: string,
    callback: (staff: TeacherStaff[]) => void
  ): () => void {
    const colRef = collection(db, 'staff');
    const q = query(colRef, where('userId', '==', userId));

    return onSnapshot(
      q,
      (snapshot) => {
        const staff: TeacherStaff[] = [];
        snapshot.forEach((docSnap) => {
          staff.push({ ...(docSnap.data() as TeacherStaff), id: docSnap.id });
        });
        callback(staff);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'staff');
      }
    );
  },

  async saveStaffMember(staff: TeacherStaff, userId: string): Promise<void> {
    const path = `staff/${staff.id}`;
    try {
      const payload: Record<string, unknown> = {
        ...staff,
        userId,
      };
      Object.keys(payload).forEach((key) => {
        if (payload[key] === undefined) {
          delete payload[key];
        }
      });
      await setDoc(doc(db, 'staff', staff.id), payload);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async deleteStaffMember(staffId: string): Promise<void> {
    const path = `staff/${staffId}`;
    try {
      await deleteDoc(doc(db, 'staff', staffId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  // Sync / Migrate all local data to Firestore for a signed in user
  async syncLocalToCloud(
    userId: string,
    data: {
      profile: BusinessProfile;
      transactions: Transaction[];
      invoices: Invoice[];
      issuedReceipts: IssuedReceipt[];
      staffList: TeacherStaff[];
    }
  ): Promise<{ txCount: number; invCount: number; recCount: number }> {
    // Save profile
    await this.saveBusinessProfile(data.profile, userId);

    // Save transactions
    for (const tx of data.transactions) {
      await this.saveTransaction(tx, userId);
    }

    // Save invoices
    for (const inv of data.invoices) {
      await this.saveInvoice(inv, userId);
    }

    // Save receipts
    for (const rec of data.issuedReceipts) {
      await this.saveIssuedReceipt(rec, userId);
    }

    // Save staff
    for (const staff of data.staffList) {
      await this.saveStaffMember(staff, userId);
    }

    return {
      txCount: data.transactions.length,
      invCount: data.invoices.length,
      recCount: data.issuedReceipts.length,
    };
  },
};
