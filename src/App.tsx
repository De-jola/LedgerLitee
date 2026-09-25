import React, { useState, useEffect, useMemo } from 'react';
import { Header, AppTab } from './components/Header';
import { LandingPage } from './components/LandingPage';
import { DashboardOverview } from './components/DashboardOverview';
import { TransactionList } from './components/TransactionList';
import { CustomerDebtsView } from './components/CustomerDebtsView';
import { SimpleReportsView } from './components/SimpleReportsView';
import { BudgetSuggestions } from './components/BudgetSuggestions';
import { TeacherPayroll } from './components/TeacherPayroll';
import { ScannerModal } from './components/ScannerModal';
import { TransactionFormModal } from './components/TransactionFormModal';
import { ReceiptDetailModal } from './components/ReceiptDetailModal';
import { ReceiptGeneratorModal } from './components/ReceiptGeneratorModal';
import { InvoiceGeneratorModal } from './components/InvoiceGeneratorModal';
import { InvoiceDetailModal } from './components/InvoiceDetailModal';
import { ReceiptIssueModal } from './components/ReceiptIssueModal';
import { IssuedReceiptViewModal } from './components/IssuedReceiptViewModal';
import { ManualReceiptLoggerModal } from './components/ManualReceiptLoggerModal';
import { InvoicesAndReceiptsView } from './components/InvoicesAndReceiptsView';
import { SettingsModal } from './components/SettingsModal';
import { OnboardingModal } from './components/OnboardingModal';
import { AccountModal } from './components/AccountModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { storage } from './utils/storage';
import { calculateCashFlow, generateBudgetSuggestions } from './utils/budgetEngine';
import { auth, signInWithGoogle, logOutFromFirebase } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { firebaseService } from './utils/firebaseService';
import { canAccessTab, canRecordTransactions, canManageStaff, roleTabs } from './utils/permissions';
import {
  Transaction,
  TeacherStaff,
  BusinessProfile,
  ScannedReceiptData,
  BudgetSuggestion,
  TransactionType,
  Invoice,
  IssuedReceipt,
  UserRole,
  UserAccount,
} from './types';
import {
  QrCode,
  PlusCircle,
  Sparkles,
  Users,
  FileCheck,
  ShieldCheck,
  FileText,
  Receipt,
  ShieldAlert,
} from 'lucide-react';
import { Analytics } from '@vercel/analytics/react';

export default function App() {
  // Main Data States
  const [profile, setProfile] = useState<BusinessProfile>(storage.getProfile());
  const [staffList, setStaffList] = useState<TeacherStaff[]>(storage.getStaff());
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [issuedReceipts, setIssuedReceipts] = useState<IssuedReceipt[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Accounts & Authentication State
  const [accounts, setAccounts] = useState<UserAccount[]>(storage.getAccounts());
  const [currentAccount, setCurrentAccount] = useState<UserAccount>(storage.getCurrentAccount());
  const [currentRole, setCurrentRole] = useState<UserRole>(storage.getCurrentAccount().role || 'owner');
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);

  // Firebase Real Cloud Backend Auth and Sync State
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Top-level View: 'landing' (dedicated public landing page) vs 'dashboard' (business financial tools)
  const [viewMode, setViewMode] = useState<'dashboard' | 'landing'>(
    storage.isOnboarded() && !storage.isLoggedOut() ? 'dashboard' : 'landing'
  );

  // Tab navigation: 'ledger' | 'debts' | 'reports' | 'invoices' | 'payroll' | 'suggestions' | 'receipts'
  const [activeTab, setActiveTab] = useState<AppTab>('ledger');

  useEffect(() => {
    if (!canAccessTab(currentRole, activeTab)) {
      setActiveTab(roleTabs[currentRole][0]);
    }
  }, [currentRole, activeTab]);

  // Modal States
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [txModalType, setTxModalType] = useState<TransactionType>('income');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [scannedData, setScannedData] = useState<ScannedReceiptData | null>(null);
  const [scannedPhotoUrl, setScannedPhotoUrl] = useState<string | null>(null);

  // Transaction Receipt detail modal (for scanned slips or ledger items)
  const [selectedTxDetail, setSelectedTxDetail] = useState<Transaction | null>(null);
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Invoicing & Receipt Generating Modal States
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [selectedInvoiceDetail, setSelectedInvoiceDetail] = useState<Invoice | null>(null);

  const [isReceiptIssueModalOpen, setIsReceiptIssueModalOpen] = useState(false);
  const [isManualReceiptLoggerOpen, setIsManualReceiptLoggerOpen] = useState(false);
  const [targetInvoiceForReceipt, setTargetInvoiceForReceipt] = useState<Invoice | null>(null);
  const [selectedIssuedReceipt, setSelectedIssuedReceipt] = useState<IssuedReceipt | null>(null);

  // If not onboarded and viewing dashboard, show onboarding wizard
  useEffect(() => {
    if (!storage.isOnboarded() && viewMode === 'dashboard') {
      setIsOnboardingOpen(true);
    }
  }, [viewMode]);

  // Load records from storage on initial mount with clean slate check
  useEffect(() => {
    let isMounted = true;
    storage.ensureCleanSlate();
    setProfile(storage.getProfile());
    setStaffList(storage.getStaff());

    Promise.all([
      storage.getTransactions(),
      storage.getInvoices(),
      storage.getIssuedReceipts(),
    ]).then(([loadedTx, loadedInv, loadedRec]) => {
      if (isMounted) {
        setTransactions(loadedTx);
        setInvoices(loadedInv);
        setIssuedReceipts(loadedRec);
        setIsLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Listen to Firebase Auth state and synchronize with live Cloud Firestore
  useEffect(() => {
    let unsubs: (() => void)[] = [];

    const authUnsub = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      unsubs.forEach((u) => u());
      unsubs = [];

      if (user) {
        // If user logged in, listen to real-time cloud data
        const unsubTx = firebaseService.subscribeTransactions(user.uid, (cloudTxs) => {
          if (cloudTxs && cloudTxs.length > 0) {
            setTransactions(cloudTxs);
          }
        });
        const unsubInv = firebaseService.subscribeInvoices(user.uid, (cloudInvs) => {
          if (cloudInvs && cloudInvs.length > 0) {
            setInvoices(cloudInvs);
          }
        });
        const unsubRec = firebaseService.subscribeIssuedReceipts(user.uid, (cloudRecs) => {
          if (cloudRecs && cloudRecs.length > 0) {
            setIssuedReceipts(cloudRecs);
          }
        });
        const unsubProfile = firebaseService.subscribeBusinessProfile(user.uid, (cloudProfile) => {
          if (cloudProfile) {
            setProfile((prev) => ({ ...prev, ...cloudProfile }));
          }
        });
        const unsubStaff = firebaseService.subscribeStaff(user.uid, (cloudStaff) => {
          if (cloudStaff && cloudStaff.length > 0) {
            setStaffList(cloudStaff);
          }
        });
        unsubs = [unsubTx, unsubInv, unsubRec, unsubProfile, unsubStaff];
      }
    });

    return () => {
      authUnsub();
      unsubs.forEach((u) => u());
    };
  }, []);

  // Compute Cash Flow Metrics
  const summary = useMemo(() => calculateCashFlow(transactions), [transactions]);

  // Compute Smart Budget & Salary Suggestions
  const suggestions = useMemo(
    () => generateBudgetSuggestions(transactions, staffList, profile),
    [transactions, staffList, profile]
  );

  // Count unpaid customer debts
  const unpaidDebtsCount = useMemo(
    () => invoices.filter((i) => i.status !== 'paid' && i.balanceDue > 0).length,
    [invoices]
  );

  // Handle scanned receipt completion
  const handleScanComplete = (data: ScannedReceiptData, photoDataUrl?: string) => {
    setIsScannerOpen(false);
    setScannedData(data);
    setScannedPhotoUrl(photoDataUrl || null);
    setEditingTransaction(null);
    setTxModalType('income');
    setIsTxModalOpen(true);
  };

  // Handle saving transaction (from manual, scan, or suggestion)
  const handleSaveTransaction = async (tx: Transaction, receiptPhotoUrl?: string) => {
    if (!canRecordTransactions(currentRole)) {
      alert('Your role has read-only access to records.');
      return;
    }
    const activeUserId = firebaseUser?.uid || currentAccount.id;
    if (receiptPhotoUrl) {
      await storage.saveReceiptPhoto(tx.id, receiptPhotoUrl);
    }
    await storage.saveTransaction(tx);
    firebaseService.saveTransaction(tx, activeUserId).catch((e) => console.warn('Cloud save tx deferred:', e));

    setTransactions((prev) => {
      const idx = prev.findIndex((t) => t.id === tx.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = tx;
        return copy;
      }
      return [tx, ...prev];
    });

    if (tx.type === 'expense' && (tx.category === 'teacher_salaries' || tx.category === 'support_staff_wages')) {
      const updatedStaff = staffList.map((st) => {
        if (tx.payerOrPayee?.toLowerCase().includes(st.name.toLowerCase())) {
          return { ...st, lastPaidDate: tx.date };
        }
        return st;
      });
      setStaffList(updatedStaff);
      storage.saveStaff(updatedStaff);
      for (const s of updatedStaff) {
        firebaseService.saveStaffMember(s, activeUserId).catch(() => {});
      }
    }
  };

  // Handle deleting transaction
  const handleDeleteTransaction = async (id: string) => {
    if (currentRole === 'cashier' || currentRole === 'viewer') {
      alert(`As a ${currentRole}, you do not have permission to delete ledger records. Switch to Owner or Manager role.`);
      return;
    }
    await storage.deleteTransaction(id);
    firebaseService.deleteTransaction(id).catch(() => {});
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  // Handle saving an Invoice
  const handleSaveInvoice = async (invoice: Invoice) => {
    const activeUserId = firebaseUser?.uid || currentAccount.id;
    await storage.saveInvoice(invoice);
    firebaseService.saveInvoice(invoice, activeUserId).catch((e) => console.warn('Cloud save inv deferred:', e));

    setInvoices((prev) => {
      const idx = prev.findIndex((i) => i.id === invoice.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = invoice;
        return copy;
      }
      return [invoice, ...prev];
    });
  };

  // Handle deleting an Invoice
  const handleDeleteInvoice = async (id: string) => {
    if (currentRole === 'cashier' || currentRole === 'viewer') {
      alert(`As a ${currentRole}, you do not have permission to delete customer invoices.`);
      return;
    }
    await storage.deleteInvoice(id);
    firebaseService.deleteInvoice(id).catch(() => {});
    setInvoices((prev) => prev.filter((i) => i.id !== id));
  };

  // Handle saving an Issued Receipt
  const handleSaveIssuedReceipt = async (receipt: IssuedReceipt, linkToLedger: boolean) => {
    const activeUserId = firebaseUser?.uid || currentAccount.id;
    await storage.saveIssuedReceipt(receipt);
    firebaseService.saveIssuedReceipt(receipt, activeUserId).catch((e) => console.warn('Cloud save rec deferred:', e));
    setIssuedReceipts((prev) => [receipt, ...prev]);

    // If receipt was linked to an existing invoice, update that invoice's amountPaid and balanceDue
    if (receipt.invoiceId) {
      const targetInv = invoices.find((inv) => inv.id === receipt.invoiceId);
      if (targetInv) {
        const newPaid = targetInv.amountPaid + receipt.amountPaid;
        const newBal = Math.max(0, targetInv.total - newPaid);
        const updatedInv: Invoice = {
          ...targetInv,
          amountPaid: newPaid,
          balanceDue: newBal,
          status: newBal === 0 ? 'paid' : newPaid > 0 ? 'partially_paid' : 'unpaid',
          updatedAt: Date.now(),
        };
        await storage.saveInvoice(updatedInv);
        firebaseService.saveInvoice(updatedInv, activeUserId).catch(() => {});
        setInvoices((prev) => prev.map((i) => (i.id === updatedInv.id ? updatedInv : i)));
      }
    }

    // Automatically synchronize as an Income transaction in the Cash Ledger if checked
    if (linkToLedger) {
      const ledgerTx: Transaction = {
        id: `tx-rec-${receipt.id}`,
        type: 'income',
        amount: receipt.amountPaid,
        date: receipt.date,
        time: receipt.time,
        title: receipt.description || `Customer Fee Payment - ${receipt.customerName}`,
        category: 'tuition_fees',
        paymentMethod: receipt.paymentMethod,
        payerOrPayee: receipt.customerName,
        referenceNumber: receipt.receiptNumber,
        posAgentName: receipt.posAgentName,
        notes: receipt.notes,
        barcodeOrQrCode: receipt.qrPayload,
        verified: true,
        createdAt: Date.now(),
      };
      await storage.saveTransaction(ledgerTx);
      firebaseService.saveTransaction(ledgerTx, activeUserId).catch(() => {});
      setTransactions((prev) => [ledgerTx, ...prev]);
    }

    // Open view modal immediately for instant printing or sharing
    setSelectedIssuedReceipt(receipt);
  };

  // Handle saving a Manually Logged Receipt via Transaction Number
  const handleSaveManualReceipt = async (
    receipt: IssuedReceipt,
    transaction: Transaction,
    linkedInvoiceId?: string
  ) => {
    const activeUserId = firebaseUser?.uid || currentAccount.id;
    await storage.saveIssuedReceipt(receipt);
    firebaseService.saveIssuedReceipt(receipt, activeUserId).catch(() => {});
    setIssuedReceipts((prev) => [receipt, ...prev]);

    await storage.saveTransaction(transaction);
    firebaseService.saveTransaction(transaction, activeUserId).catch(() => {});
    setTransactions((prev) => [transaction, ...prev]);

    // If receipt was linked to an existing invoice, update that invoice's balance
    if (linkedInvoiceId) {
      const targetInv = invoices.find((inv) => inv.id === linkedInvoiceId);
      if (targetInv) {
        const newPaid = targetInv.amountPaid + receipt.amountPaid;
        const newBal = Math.max(0, targetInv.total - newPaid);
        const updatedInv: Invoice = {
          ...targetInv,
          amountPaid: newPaid,
          balanceDue: newBal,
          status: newBal === 0 ? 'paid' : newPaid > 0 ? 'partially_paid' : 'unpaid',
          updatedAt: Date.now(),
        };
        await storage.saveInvoice(updatedInv);
        firebaseService.saveInvoice(updatedInv, activeUserId).catch(() => {});
        setInvoices((prev) => prev.map((i) => (i.id === updatedInv.id ? updatedInv : i)));
      }
    }

    // Automatically open the printable receipt slip modal so user can view/print immediately
    setSelectedIssuedReceipt(receipt);
  };

  // Handle deleting an Issued Receipt
  const handleDeleteIssuedReceipt = async (id: string) => {
    if (currentRole === 'cashier' || currentRole === 'viewer') {
      alert(`As a ${currentRole}, you do not have permission to delete issued receipts.`);
      return;
    }
    await storage.deleteIssuedReceipt(id);
    firebaseService.deleteIssuedReceipt(id).catch(() => {});
    setIssuedReceipts((prev) => prev.filter((r) => r.id !== id));
  };

  // Staff and Profile management
  const handleSaveStaffList = (newStaffList: TeacherStaff[]) => {
    if (!canManageStaff(currentRole)) {
      alert('Only owners and managers can manage staff.');
      return;
    }
    const activeUserId = firebaseUser?.uid || currentAccount.id;
    setStaffList(newStaffList);
    storage.saveStaff(newStaffList);
    for (const s of newStaffList) {
      firebaseService.saveStaffMember(s, activeUserId).catch(() => {});
    }
  };

  const handleSaveProfile = (newProfile: BusinessProfile) => {
    if (currentRole !== 'owner') {
      alert('Only the owner can change business settings.');
      return;
    }
    const activeUserId = firebaseUser?.uid || currentAccount.id;
    setProfile(newProfile);
    storage.saveProfile(newProfile);
    firebaseService.saveBusinessProfile(newProfile, activeUserId).catch(() => {});
  };

  // Google Authentication Handlers
  const handleGoogleSignIn = async () => {
    try {
      const user = await signInWithGoogle();
      if (user) {
        setFirebaseUser(user);
        const updatedAcc: UserAccount = {
          ...currentAccount,
          fullName: user.displayName || currentAccount.fullName,
          emailOrPhone: user.email || currentAccount.emailOrPhone,
        };
        setCurrentAccount(updatedAcc);
        storage.saveAccount(updatedAcc);
      }
    } catch (e) {
      console.error('Google Sign In failed', e);
    }
  };

  const handleGoogleSignOut = async () => {
    await logOutFromFirebase();
    setFirebaseUser(null);
  };

  // Sync all local records to Firestore
  const handleSyncToCloud = async () => {
    setIsSyncing(true);
    try {
      const activeUserId = firebaseUser?.uid || currentAccount.id;
      await firebaseService.syncLocalToCloud(activeUserId, {
        profile,
        transactions,
        invoices,
        issuedReceipts,
        staffList,
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleLogout = async () => {
    await logOutFromFirebase();
    storage.setLoggedOut(true);
    setFirebaseUser(null);
    setIsAccountModalOpen(false);
    setViewMode('landing');
  };

  const handleSaveAccount = (account: UserAccount) => {
    storage.saveAccount(account);
    storage.setLoggedOut(false);
    storage.setOnboarded(true);
    setCurrentAccount(account);
    setCurrentRole(account.role);
    setAccounts(storage.getAccounts());
  };

  const handleSelectAccount = (account: UserAccount) => {
    storage.setCurrentAccount(account);
    storage.setLoggedOut(false);
    setCurrentAccount(account);
    setCurrentRole(account.role);
  };

  const handlePaySalary = (staff: TeacherStaff) => {
    setEditingTransaction(null);
    setScannedData({
      amount: staff.monthlySalary,
      payerName: staff.name,
      category: 'teacher_salaries',
      notes: `Monthly wage disbursement to ${staff.name} (${staff.role})`,
      paymentMethod: 'cash',
      rawPayload: '',
    });
    setScannedPhotoUrl(null);
    setTxModalType('expense');
    setIsTxModalOpen(true);
  };

  const handleApplySuggestion = (suggestion: BudgetSuggestion) => {
    setEditingTransaction(null);
    setScannedData({
      amount: suggestion.suggestedAmount,
      category: suggestion.category,
      notes: suggestion.explanation,
      payerName:
        suggestion.relatedStaffIds && suggestion.relatedStaffIds.length > 0
          ? staffList.find((s) => s.id === suggestion.relatedStaffIds?.[0])?.name || ''
          : '',
      paymentMethod: 'cash',
      rawPayload: '',
    });
    setScannedPhotoUrl(null);
    setTxModalType('expense');
    setIsTxModalOpen(true);
  };

  const handleQuickLogFromSlip = (slipData: any) => {
    const tx: Transaction = {
      id: `tx-${Date.now()}`,
      type: 'income',
      amount: slipData.amount,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      title: `Fee Slip - ${slipData.studentName}`,
      category: 'tuition_fees',
      paymentMethod: slipData.paymentMethod,
      payerOrPayee: slipData.studentName,
      referenceNumber: slipData.receiptNumber,
      posAgentName: slipData.posAgentName,
      notes: slipData.purpose,
      barcodeOrQrCode: slipData.qrPayload,
      verified: true,
      createdAt: Date.now(),
    };
    handleSaveTransaction(tx);
  };

  const handleRestoreBackup = (imported: any) => {
    if (imported.profile) handleSaveProfile(imported.profile);
    if (imported.staff) handleSaveStaffList(imported.staff);
    if (imported.transactions && Array.isArray(imported.transactions)) {
      setTransactions(imported.transactions);
      localStorage.setItem('ledgerlite_transactions', JSON.stringify(imported.transactions));
      for (const t of imported.transactions) {
        storage.saveTransaction(t);
      }
    }
    if (imported.invoices && Array.isArray(imported.invoices)) {
      setInvoices(imported.invoices);
      localStorage.setItem('ledgerlite_invoices', JSON.stringify(imported.invoices));
      for (const i of imported.invoices) {
        storage.saveInvoice(i);
      }
    }
    if (imported.issuedReceipts && Array.isArray(imported.issuedReceipts)) {
      setIssuedReceipts(imported.issuedReceipts);
      localStorage.setItem('ledgerlite_issued_receipts', JSON.stringify(imported.issuedReceipts));
      for (const r of imported.issuedReceipts) {
        storage.saveIssuedReceipt(r);
      }
    }
  };

  // Onboarding action dispatcher
  const handleOnboardingAction = (action: 'sale' | 'expense' | 'scan' | 'invoice') => {
    if (action === 'sale') {
      setEditingTransaction(null);
      setScannedData(null);
      setScannedPhotoUrl(null);
      setTxModalType('income');
      setIsTxModalOpen(true);
    } else if (action === 'expense') {
      setEditingTransaction(null);
      setScannedData(null);
      setScannedPhotoUrl(null);
      setTxModalType('expense');
      setIsTxModalOpen(true);
    } else if (action === 'scan') {
      setIsScannerOpen(true);
    } else if (action === 'invoice') {
      setEditingInvoice(null);
      setIsInvoiceModalOpen(true);
    }
  };

  if (viewMode === 'landing') {
    return (
      <>
        <LandingPage
          onOpenDashboard={() => setViewMode('dashboard')}
          onOpenOnboarding={() => setIsOnboardingOpen(true)}
          onStartKeepingRecords={() => {
            setViewMode('dashboard');
            setEditingTransaction(null);
            setScannedData(null);
            setScannedPhotoUrl(null);
            setTxModalType('income');
            setIsTxModalOpen(true);
          }}
        />

        {/* Onboarding Wizard Modal on Landing Page */}
        <OnboardingModal
          isOpen={isOnboardingOpen}
          onClose={() => setIsOnboardingOpen(false)}
          profile={profile}
          currentAccount={currentAccount}
          onSaveProfile={handleSaveProfile}
          onSaveAccount={(acc) => {
            handleSaveAccount(acc);
            setViewMode('dashboard');
          }}
          onAddStaffMember={(newStaff) => handleSaveStaffList([...staffList, newStaff])}
          onSelectFirstAction={(action) => {
            setViewMode('dashboard');
            handleOnboardingAction(action);
          }}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-teal-500 selection:text-white pb-20">
      {/* Header Bar */}
      <Header
        profile={profile}
        activeTab={activeTab}
        onSelectTab={(tab) => {
          if (canAccessTab(currentRole, tab)) setActiveTab(tab);
        }}
        onOpenScanner={() => setIsScannerOpen(true)}
        onOpenSettings={() => {
          if (currentRole === 'owner') setIsSettingsOpen(true);
        }}
        onOpenOnboarding={() => {
          if (currentRole === 'owner') setIsOnboardingOpen(true);
        }}
        onOpenAccountModal={() => setIsAccountModalOpen(true)}
        onOpenLanding={() => setViewMode('landing')}
        currentAccount={currentAccount}
        currentRole={currentRole}
        unpaidDebtsCount={unpaidDebtsCount}
        invoiceCount={invoices.filter((i) => i.status !== 'paid').length}
      />

      {/* Role Access Banner if not Owner */}
      {currentRole !== 'owner' && (
        <div className="bg-amber-500 text-slate-950 px-4 py-2 text-xs font-bold flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
            <ShieldAlert className="w-4 h-4 shrink-0 text-slate-900" />
            <span>
              Simulating Role: <strong className="capitalize">{currentRole}</strong> • Access permissions restricted according to staff security profile.
            </span>
            <button
              onClick={() => setCurrentRole('owner')}
              className="ml-auto underline hover:text-white transition font-black"
            >
              Switch back to Owner
            </button>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* TAB 1: Ledger & Sales (Dashboard Overview + Transaction List) */}
        {activeTab === 'ledger' && canAccessTab(currentRole, 'ledger') && (
          <div className="space-y-6">
            <DashboardOverview
              summary={summary}
              profile={profile}
              transactions={transactions}
              invoices={invoices}
              onOpenScanner={() => setIsScannerOpen(true)}
              onOpenNewIncome={() => {
                setEditingTransaction(null);
                setScannedData(null);
                setScannedPhotoUrl(null);
                setTxModalType('income');
                setIsTxModalOpen(true);
              }}
              onOpenNewExpense={() => {
                setEditingTransaction(null);
                setScannedData(null);
                setScannedPhotoUrl(null);
                setTxModalType('expense');
                setIsTxModalOpen(true);
              }}
              onOpenCreateInvoice={() => {
                setEditingInvoice(null);
                setIsInvoiceModalOpen(true);
              }}
              onOpenIssueReceipt={() => {
                setTargetInvoiceForReceipt(null);
                setIsReceiptIssueModalOpen(true);
              }}
              onOpenGenerator={() => setIsGeneratorOpen(true)}
              onOpenManualReceiptLogger={() => setIsManualReceiptLoggerOpen(true)}
              onSwitchTab={setActiveTab}
            />

            <TransactionList
              transactions={transactions}
              profile={profile}
              onViewReceipt={(tx) => setSelectedTxDetail(tx)}
              onEditTransaction={(tx) => {
                setEditingTransaction(tx);
                setScannedData(null);
                setScannedPhotoUrl(tx.receiptPhotoUrl || null);
                setTxModalType(tx.type);
                setIsTxModalOpen(true);
              }}
              onDeleteTransaction={handleDeleteTransaction}
              onExportCSV={() => storage.exportToCSV(transactions, profile.currencySymbol)}
            />
          </div>
        )}

          {/* TAB 2: Customer Debts ("Know who owes your business") */}
          {activeTab === 'debts' && canAccessTab(currentRole, 'debts') && (
            <CustomerDebtsView
              invoices={invoices}
              profile={profile}
              onCreateInvoice={() => {
                setEditingInvoice(null);
                setIsInvoiceModalOpen(true);
              }}
              onRecordPayment={(inv) => {
                setTargetInvoiceForReceipt(inv);
                setIsReceiptIssueModalOpen(true);
              }}
              onViewInvoice={(inv) => setSelectedInvoiceDetail(inv)}
            />
          )}

          {/* TAB 3: Simple Reports ("Understand your business without difficult calculations") */}
          {activeTab === 'reports' && canAccessTab(currentRole, 'reports') && (
            <SimpleReportsView
              transactions={transactions}
              invoices={invoices}
              profile={profile}
              onExportCSV={() => storage.exportToCSV(transactions, profile.currencySymbol)}
            />
          )}

          {/* TAB 4: Invoices & Receipts ("Send clear invoices. Give proper receipts.") */}
          {activeTab === 'invoices' && canAccessTab(currentRole, 'invoices') && (
            <InvoicesAndReceiptsView
              invoices={invoices}
              issuedReceipts={issuedReceipts}
              profile={profile}
              onCreateInvoice={() => {
                setEditingInvoice(null);
                setIsInvoiceModalOpen(true);
              }}
              onEditInvoice={(inv) => {
                setEditingInvoice(inv);
                setIsInvoiceModalOpen(true);
              }}
              onViewInvoice={(inv) => setSelectedInvoiceDetail(inv)}
              onDeleteInvoice={handleDeleteInvoice}
              onIssueReceipt={(forInv) => {
                setTargetInvoiceForReceipt(forInv || null);
                setIsReceiptIssueModalOpen(true);
              }}
              onViewIssuedReceipt={(rec) => setSelectedIssuedReceipt(rec)}
              onDeleteIssuedReceipt={handleDeleteIssuedReceipt}
              onOpenManualReceiptLogger={() => setIsManualReceiptLoggerOpen(true)}
            />
          )}

          {/* TAB 5: Manage Staff Records & Payroll ("Let your staff help without losing control") */}
          {activeTab === 'payroll' && canAccessTab(currentRole, 'payroll') && (
            <TeacherPayroll
              staffList={staffList}
              transactions={transactions}
              profile={profile}
              currentRole={currentRole}
              onChangeActiveRole={setCurrentRole}
              onPaySalary={handlePaySalary}
              onSaveStaff={handleSaveStaffList}
            />
          )}

          {/* TAB 6: Smart Budget Suggestions */}
          {activeTab === 'suggestions' && canAccessTab(currentRole, 'suggestions') && (
            <BudgetSuggestions
              suggestions={suggestions}
              summary={summary}
              profile={profile}
              staffList={staffList}
              onApplySuggestion={handleApplySuggestion}
              onOpenPayroll={() => setActiveTab('payroll')}
            />
          )}

          {/* TAB 7: Printable School Fee Vouchers */}
          {activeTab === 'receipts' && canAccessTab(currentRole, 'receipts') && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl bg-white p-5 border border-slate-200">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    School Fee Vouchers & Printable Slips
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Generate and print payment slips with scannable QR verification codes for students.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setTargetInvoiceForReceipt(null);
                      setIsReceiptIssueModalOpen(true);
                    }}
                    className="rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition flex items-center gap-1.5"
                  >
                    <Receipt className="w-4 h-4" /> Issue Official Receipt
                  </button>
                  <button
                    onClick={() => setIsGeneratorOpen(true)}
                    className="rounded-xl bg-teal-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-teal-700 transition flex items-center gap-1.5"
                  >
                    <FileCheck className="w-4 h-4" /> Generate Fee Voucher
                  </button>
                </div>
              </div>

              {/* Show previous receipts with barcodes */}
              <TransactionList
                transactions={transactions.filter((t) => t.type === 'income')}
                profile={profile}
                onViewReceipt={(tx) => setSelectedTxDetail(tx)}
                onEditTransaction={(tx) => {
                  setEditingTransaction(tx);
                  setScannedData(null);
                  setScannedPhotoUrl(tx.receiptPhotoUrl || null);
                  setTxModalType(tx.type);
                  setIsTxModalOpen(true);
                }}
                onDeleteTransaction={handleDeleteTransaction}
                onExportCSV={() => storage.exportToCSV(transactions, profile.currencySymbol)}
              />
            </div>
          )}
      </main>

      {/* Floating Action Buttons on Mobile */}
      <div className="fixed bottom-5 right-5 z-30 md:hidden flex flex-col gap-2">
        <button
          onClick={() => {
            setEditingInvoice(null);
            setIsInvoiceModalOpen(true);
          }}
          className="rounded-full bg-slate-900 text-white p-3 shadow-lg hover:bg-slate-800 transition active:scale-95 flex items-center justify-center ring-2 ring-white"
          title="Create Invoice"
        >
          <FileText className="w-5 h-5 text-teal-300" />
        </button>
        <button
          onClick={() => setIsScannerOpen(true)}
          className="rounded-full bg-teal-600 text-white p-3.5 shadow-xl hover:bg-teal-700 transition active:scale-95 flex items-center justify-center ring-4 ring-white"
          title="Scan Receipt Barcode"
        >
          <QrCode className="w-6 h-6 text-amber-300" />
        </button>
      </div>

      {/* Offline Status Toast Indicator */}
      <OfflineIndicator />

      {/* Onboarding & Account Creation Wizard Modal */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        profile={profile}
        currentAccount={currentAccount}
        onSaveProfile={handleSaveProfile}
        onSaveAccount={handleSaveAccount}
        onAddStaffMember={(newStaff) => handleSaveStaffList([...staffList, newStaff])}
        onSelectFirstAction={handleOnboardingAction}
      />

      {/* Account & Session Security Modal */}
      <AccountModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        accounts={accounts}
        currentAccount={currentAccount}
        onSelectAccount={handleSelectAccount}
        onOpenCreateAccount={() => {
          setIsAccountModalOpen(false);
          setIsOnboardingOpen(true);
        }}
        onChangeRole={setCurrentRole}
        firebaseUser={firebaseUser}
        onGoogleSignIn={handleGoogleSignIn}
        onGoogleSignOut={handleGoogleSignOut}
        onSyncToCloud={handleSyncToCloud}
        onLogout={handleLogout}
        isSyncing={isSyncing}
      />

      {/* Camera / Barcode / Photo Scanner Modal */}
      <ScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanComplete={handleScanComplete}
      />

      {/* Transaction Log Form Modal (Income or Expense) */}
      <TransactionFormModal
        isOpen={isTxModalOpen}
        onClose={() => {
          setIsTxModalOpen(false);
          setEditingTransaction(null);
          setScannedData(null);
          setScannedPhotoUrl(null);
        }}
        onSave={handleSaveTransaction}
        initialType={txModalType}
        initialScannedData={scannedData}
        initialPhotoUrl={scannedPhotoUrl}
        staffList={staffList}
        profile={profile}
        editTransaction={editingTransaction}
      />

      {/* Transaction Receipt Detail & Printing Modal */}
      <ReceiptDetailModal
        transaction={selectedTxDetail}
        profile={profile}
        onClose={() => setSelectedTxDetail(null)}
      />

      {/* Fee Slip & QR Generator Modal */}
      <ReceiptGeneratorModal
        isOpen={isGeneratorOpen}
        onClose={() => setIsGeneratorOpen(false)}
        profile={profile}
        onQuickLog={handleQuickLogFromSlip}
      />

      {/* Invoice Generator Modal */}
      <InvoiceGeneratorModal
        isOpen={isInvoiceModalOpen}
        onClose={() => {
          setIsInvoiceModalOpen(false);
          setEditingInvoice(null);
        }}
        profile={profile}
        onSaveInvoice={handleSaveInvoice}
        editInvoice={editingInvoice}
      />

      {/* Invoice Detail / Print / Record Payment Modal */}
      <InvoiceDetailModal
        invoice={selectedInvoiceDetail}
        profile={profile}
        onClose={() => setSelectedInvoiceDetail(null)}
        onRecordPayment={(inv) => {
          setTargetInvoiceForReceipt(inv);
          setIsReceiptIssueModalOpen(true);
        }}
      />

      {/* Customer Receipt Issue Modal */}
      <ReceiptIssueModal
        isOpen={isReceiptIssueModalOpen}
        onClose={() => {
          setIsReceiptIssueModalOpen(false);
          setTargetInvoiceForReceipt(null);
        }}
        profile={profile}
        invoices={invoices}
        initialInvoice={targetInvoiceForReceipt}
        onSaveReceipt={handleSaveIssuedReceipt}
      />

      {/* Issued Receipt View & Print Modal */}
      <IssuedReceiptViewModal
        receipt={selectedIssuedReceipt}
        profile={profile}
        onClose={() => setSelectedIssuedReceipt(null)}
      />

      {/* Manual Payment Receipt Logger via Txn / Reference Number */}
      <ManualReceiptLoggerModal
        isOpen={isManualReceiptLoggerOpen}
        onClose={() => setIsManualReceiptLoggerOpen(false)}
        profile={profile}
        invoices={invoices}
        existingTransactions={transactions}
        existingReceipts={issuedReceipts}
        onSaveManualReceipt={handleSaveManualReceipt}
      />

      {/* Settings & Offline Backup Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        profile={profile}
        staffList={staffList}
        transactions={transactions}
        invoices={invoices}
        issuedReceipts={issuedReceipts}
        onSaveProfile={handleSaveProfile}
        onExportBackup={() =>
          storage.exportBackupJSON(transactions, staffList, profile, invoices, issuedReceipts)
        }
        onRestoreBackup={handleRestoreBackup}
      />

      {/* Vercel Web Analytics */}
      <Analytics />
    </div>
  );
}
