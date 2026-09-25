import { UserRole } from '../types';

export type AppTab = 'ledger' | 'debts' | 'reports' | 'invoices' | 'payroll' | 'suggestions' | 'receipts';

export const roleTabs: Record<UserRole, AppTab[]> = {
  owner: ['ledger', 'debts', 'reports', 'invoices', 'payroll', 'suggestions', 'receipts'],
  manager: ['ledger', 'debts', 'reports', 'invoices', 'payroll', 'suggestions', 'receipts'],
  cashier: ['ledger', 'invoices', 'receipts'],
  viewer: ['ledger', 'debts', 'reports', 'invoices'],
};

export function canAccessTab(role: UserRole, tab: AppTab): boolean {
  return roleTabs[role].includes(tab);
}

export function canRecordTransactions(role: UserRole): boolean {
  return role === 'owner' || role === 'manager' || role === 'cashier';
}

export function canManageStaff(role: UserRole): boolean {
  return role === 'owner' || role === 'manager';
}
