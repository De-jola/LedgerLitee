import { BusinessProfile, TransactionType } from '../types';

export interface CategoryOption {
  value: string;
  label: string;
}

const categoriesByType: Record<BusinessProfile['businessType'], Record<TransactionType, CategoryOption[]>> = {
  school: {
    income: [
      { value: 'tuition_fees', label: 'Tuition & Term Fees' },
      { value: 'registration_admission', label: 'Admission & Registration' },
      { value: 'books_uniforms', label: 'Books, Uniforms & Badges' },
      { value: 'pta_levy', label: 'PTA Levy / Development' },
      { value: 'exam_fees', label: 'Examination / Test Fees' },
      { value: 'lesson_extra', label: 'Extra-mural Lessons' },
      { value: 'donation_grant', label: 'Donations & Community Grants' },
      { value: 'other_income', label: 'Other Income' },
    ],
    expense: [
      { value: 'teacher_salaries', label: 'Teacher & Headmistress Salaries' },
      { value: 'support_staff_wages', label: 'Security & Support Wages' },
      { value: 'stationery_chalk', label: 'Classroom Chalk & Exam Stationery' },
      { value: 'fuel_electricity', label: 'Generator Fuel & Utilities' },
      { value: 'repairs_maintenance', label: 'Desk Repairs & Facility Maintenance' },
      { value: 'water_sanitation', label: 'Water Borehole & Sanitation' },
      { value: 'food_nutrition', label: 'Student Feeding & Refreshments' },
      { value: 'inspection_levies', label: 'Government Levies & Inspection Dues' },
      { value: 'emergency_other', label: 'Emergency / Other Expense' },
    ],
  },
  shop: {
    income: [
      { value: 'general_sales', label: 'Product Sales' },
      { value: 'service_fee', label: 'Delivery / Service Charges' },
      { value: 'donation_grant', label: 'Other Business Income' },
      { value: 'other_income', label: 'Other Income' },
    ],
    expense: [
      { value: 'inventory_stock', label: 'Stock Purchases' },
      { value: 'support_staff_wages', label: 'Staff Wages' },
      { value: 'fuel_electricity', label: 'Power, Fuel & Utilities' },
      { value: 'repairs_maintenance', label: 'Shop Repairs & Maintenance' },
      { value: 'emergency_other', label: 'Emergency / Other Expense' },
    ],
  },
  services: {
    income: [
      { value: 'service_fee', label: 'Service Fees' },
      { value: 'general_sales', label: 'Product or Materials Sales' },
      { value: 'donation_grant', label: 'Retainer / Contract Income' },
      { value: 'other_income', label: 'Other Income' },
    ],
    expense: [
      { value: 'support_staff_wages', label: 'Team Wages & Contractor Fees' },
      { value: 'inventory_stock', label: 'Materials & Supplies' },
      { value: 'fuel_electricity', label: 'Power, Fuel & Utilities' },
      { value: 'repairs_maintenance', label: 'Tools & Equipment Maintenance' },
      { value: 'emergency_other', label: 'Emergency / Other Expense' },
    ],
  },
  general: {
    income: [
      { value: 'general_sales', label: 'Sales Income' },
      { value: 'service_fee', label: 'Service Income' },
      { value: 'donation_grant', label: 'Other Business Income' },
      { value: 'other_income', label: 'Other Income' },
    ],
    expense: [
      { value: 'inventory_stock', label: 'Stock & Supplies' },
      { value: 'support_staff_wages', label: 'Staff Wages' },
      { value: 'fuel_electricity', label: 'Power, Fuel & Utilities' },
      { value: 'repairs_maintenance', label: 'Repairs & Maintenance' },
      { value: 'emergency_other', label: 'Emergency / Other Expense' },
    ],
  },
};

export function getCategoryOptions(
  profile: Pick<BusinessProfile, 'businessType'>,
  type: TransactionType
): CategoryOption[] {
  return categoriesByType[profile.businessType || 'general'][type];
}
