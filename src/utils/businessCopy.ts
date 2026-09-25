import { BusinessProfile } from '../types';

export function getBusinessCopy(profile: Pick<BusinessProfile, 'businessType'>) {
  switch (profile.businessType) {
    case 'school':
      return {
        customerLabel: 'Parent / Student',
        incomeLabel: 'School Fees / Other Income',
        expenseLabel: 'School Expense',
        periodLabel: 'Academic Term / Session',
        staffLabel: 'Teachers & Staff',
        payerPlaceholder: 'e.g. Student or parent name',
        incomeTitle: 'School Fee Payment',
        invoiceItem: 'School fees or learning service',
        receiptTitle: 'Payment received for school services',
      };
    case 'shop':
      return {
        customerLabel: 'Customer',
        incomeLabel: 'Sale / Other Income',
        expenseLabel: 'Stock or Shop Expense',
        periodLabel: 'Sales Period',
        staffLabel: 'Shop Staff',
        payerPlaceholder: 'e.g. Customer name or walk-in sale',
        incomeTitle: 'Shop Sale',
        invoiceItem: 'Product or shop item',
        receiptTitle: 'Payment received for goods',
      };
    case 'services':
      return {
        customerLabel: 'Client',
        incomeLabel: 'Service Income',
        expenseLabel: 'Operating Expense',
        periodLabel: 'Service Period',
        staffLabel: 'Team Members',
        payerPlaceholder: 'e.g. Client name',
        incomeTitle: 'Service Payment',
        invoiceItem: 'Professional service',
        receiptTitle: 'Payment received for services',
      };
    default:
      return {
        customerLabel: 'Customer',
        incomeLabel: 'Income',
        expenseLabel: 'Business Expense',
        periodLabel: 'Business Period',
        staffLabel: 'Staff',
        payerPlaceholder: 'e.g. Customer or payer name',
        incomeTitle: 'Business Income',
        invoiceItem: 'Product or service',
        receiptTitle: 'Payment received',
      };
  }
}
