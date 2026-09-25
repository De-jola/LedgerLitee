export type TransactionType = 'income' | 'expense';

export type PaymentMethod = 'cash' | 'pos_agent' | 'bank_transfer' | 'other';

export type UserRole = 'owner' | 'manager' | 'cashier' | 'viewer';

export interface UserAccount {
  id: string;
  fullName: string;
  emailOrPhone: string;
  role: UserRole;
  pin: string; // 4-digit PIN for quick local authentication
  businessName: string;
  createdAt: number;
  lastLoginAt: number;
}

export interface AppUser {
  id: string;
  uid?: string;
  fullName: string;
  email?: string;
  phone?: string;
  businessName: string;
  businessType?: 'school' | 'shop' | 'services' | 'general';
  location?: string;
  currency?: string;
  role: UserRole | 'admin';
  authProvider?: string;
  createdAt: number;
  lastLoginAt?: number;
}

export interface RolePermissionInfo {
  role: UserRole;
  title: string;
  description: string;
  badgeColor: string;
}

export type IncomeCategory = 
  | 'tuition_fees'
  | 'registration_admission'
  | 'books_uniforms'
  | 'pta_levy'
  | 'exam_fees'
  | 'lesson_extra'
  | 'donation_grant'
  | 'general_sales'
  | 'service_fee'
  | 'other_income';

export type ExpenseCategory =
  | 'teacher_salaries'
  | 'support_staff_wages'
  | 'stationery_chalk'
  | 'repairs_maintenance'
  | 'fuel_electricity'
  | 'water_sanitation'
  | 'food_nutrition'
  | 'inspection_levies'
  | 'inventory_stock'
  | 'emergency_other';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  date: string; // ISO date string YYYY-MM-DD
  time?: string; // HH:mm
  title: string; // e.g. "Term 1 School Fees - Ibrahim Musa (Primary 3)"
  category: IncomeCategory | ExpenseCategory | string;
  paymentMethod: PaymentMethod;
  payerOrPayee: string; // Student/Parent name or Teacher/Vendor name
  referenceNumber: string; // Receipt number or POS RRN / STAN
  posAgentName?: string; // e.g. "Moniepoint (Mama Chinedu Store)", "OPay Agent Baba Ali"
  notes?: string;
  receiptPhotoUrl?: string; // Base64 or Blob URL of receipt to prevent faded ink loss!
  barcodeOrQrCode?: string; // Raw scanned barcode/QR payload
  verified: boolean;
  createdAt: number;
}

export interface TeacherStaff {
  id: string;
  name: string;
  role: string; // e.g., "Primary 1 Teacher", "Sales Clerk", "Cashier"
  roleType: UserRole; // 'owner' | 'manager' | 'cashier' | 'viewer'
  monthlySalary: number;
  phone?: string;
  lastPaidDate?: string;
  status: 'active' | 'on_leave';
}

export interface BusinessProfile {
  businessName: string;
  ownerName: string; // Business owner's name
  businessType: 'school' | 'shop' | 'services' | 'general';
  tagline: string;
  communityLocation: string;
  currency: string;
  currencySymbol: string;
  termOrPeriod: string; // e.g. "First Term 2026/2027"
  defaultPosAgent: string;
  phone?: string;
  email?: string;
  bankAccountDetails?: string; // e.g. "First Bank: 1234567890 | Grace Community Academy"
}

export interface BudgetSuggestion {
  id: string;
  title: string;
  category: ExpenseCategory;
  suggestedAmount: number;
  priority: 'high' | 'medium' | 'low';
  explanation: string;
  actionText: string;
  relatedStaffIds?: string[];
}

export interface ScannedReceiptData {
  receiptNumber?: string;
  amount?: number;
  payerName?: string;
  date?: string;
  paymentMethod?: PaymentMethod;
  posAgentName?: string;
  rawPayload: string;
  barcodeType?: string;
  category?: IncomeCategory | ExpenseCategory;
  notes?: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export type InvoiceStatus = 'unpaid' | 'paid' | 'partially_paid' | 'cancelled';

export interface Invoice {
  id: string;
  invoiceNumber: string; // e.g. "INV-2026-001"
  date: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD
  customerName: string; // Parent or Customer name
  customerPhone?: string;
  customerAddress?: string; // e.g. "Primary 4 Class" or Street/Village
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  total: number;
  amountPaid: number;
  balanceDue: number;
  status: InvoiceStatus;
  notes?: string;
  paymentInstructions?: string;
  qrPayload?: string;
  createdAt: number;
  updatedAt: number;
}

export interface IssuedReceipt {
  id: string;
  receiptNumber: string; // e.g. "REC-2026-081"
  invoiceId?: string; // If paid against an invoice
  date: string; // YYYY-MM-DD
  time?: string;
  customerName: string; // Student/Parent or Customer
  customerPhone?: string;
  description: string;
  items?: InvoiceItem[];
  amountPaid: number;
  paymentMethod: PaymentMethod;
  posAgentName?: string;
  balanceRemaining?: number;
  issuedBy?: string;
  notes?: string;
  qrPayload?: string;
  createdAt: number;
}
