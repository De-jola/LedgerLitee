import { Transaction, TeacherStaff, BudgetSuggestion, BusinessProfile } from '../types';

export interface CashFlowSummary {
  totalIncome: number;
  totalExpenses: number;
  netCashFlow: number;
  cashIncome: number;
  posIncome: number;
  transferIncome: number;
  salaryExpenses: number;
  operationalExpenses: number;
  fadedReceiptsArchived: number;
}

export function calculateCashFlow(transactions: Transaction[]): CashFlowSummary {
  let totalIncome = 0;
  let totalExpenses = 0;
  let cashIncome = 0;
  let posIncome = 0;
  let transferIncome = 0;
  let salaryExpenses = 0;
  let operationalExpenses = 0;
  let fadedReceiptsArchived = 0;

  for (const t of transactions) {
    if (t.type === 'income') {
      totalIncome += t.amount;
      if (t.paymentMethod === 'cash') cashIncome += t.amount;
      else if (t.paymentMethod === 'pos_agent') posIncome += t.amount;
      else transferIncome += t.amount;
    } else {
      totalExpenses += t.amount;
      if (t.category === 'teacher_salaries' || t.category === 'support_staff_wages') {
        salaryExpenses += t.amount;
      } else {
        operationalExpenses += t.amount;
      }
    }

    if (t.receiptPhotoUrl || t.barcodeOrQrCode) {
      fadedReceiptsArchived += 1;
    }
  }

  return {
    totalIncome,
    totalExpenses,
    netCashFlow: totalIncome - totalExpenses,
    cashIncome,
    posIncome,
    transferIncome,
    salaryExpenses,
    operationalExpenses,
    fadedReceiptsArchived,
  };
}

export function generateBudgetSuggestions(
  transactions: Transaction[],
  staff: TeacherStaff[],
  profile: BusinessProfile
): BudgetSuggestion[] {
  const summary = calculateCashFlow(transactions);
  const netAvailable = Math.max(0, summary.netCashFlow);
  const suggestions: BudgetSuggestion[] = [];

  const sym = profile.currencySymbol || '₦';

  // 1. Staff Salary Analysis
  const activeStaff = staff.filter(s => s.status === 'active');
  const totalMonthlyPayroll = activeStaff.reduce((sum, s) => sum + s.monthlySalary, 0);

  // Check recent salary transactions this month
  const currentMonthPrefix = new Date().toISOString().slice(0, 7); // YYYY-MM
  const paidStaffIdsThisMonth = new Set<string>();

  for (const t of transactions) {
    if (t.type === 'expense' && (t.category === 'teacher_salaries' || t.category === 'support_staff_wages')) {
      if (t.date.startsWith(currentMonthPrefix)) {
        // match staff by name
        const matched = activeStaff.find(s => t.payerOrPayee?.toLowerCase().includes(s.name.toLowerCase()));
        if (matched) {
          paidStaffIdsThisMonth.add(matched.id);
        }
      }
    }
  }

  const unpaidStaff = activeStaff.filter(s => !paidStaffIdsThisMonth.has(s.id));
  const unpaidPayroll = unpaidStaff.reduce((sum, s) => sum + s.monthlySalary, 0);

  if (unpaidStaff.length > 0) {
    if (netAvailable >= unpaidPayroll) {
      suggestions.push({
        id: 'sugg-salary-full',
        title: `Clear Remaining Staff Payroll (${unpaidStaff.length} Staff)`,
        category: 'teacher_salaries',
        suggestedAmount: unpaidPayroll,
        priority: 'high',
        explanation: `Healthy surplus: Your available net income (${sym}${netAvailable.toLocaleString()}) covers 100% of outstanding monthly salaries (${sym}${unpaidPayroll.toLocaleString()}). Prompt payroll keeps teachers motivated and reduces rural turnover.`,
        actionText: 'Disburse Payroll',
        relatedStaffIds: unpaidStaff.map(s => s.id),
      });
    } else if (netAvailable > 0) {
      // Find how many teachers can be paid with ~50-60% of current available cash
      let affordableAmount = 0;
      const affordableStaff: TeacherStaff[] = [];
      const budgetCap = netAvailable * 0.7; // Don't wipe out 100% of cash

      for (const st of unpaidStaff) {
        if (affordableAmount + st.monthlySalary <= budgetCap) {
          affordableAmount += st.monthlySalary;
          affordableStaff.push(st);
        }
      }

      if (affordableStaff.length > 0) {
        suggestions.push({
          id: 'sugg-salary-partial',
          title: `Disburse Partial Payroll (${affordableStaff.length} Teachers)`,
          category: 'teacher_salaries',
          suggestedAmount: affordableAmount,
          priority: 'high',
          explanation: `Based on current collections (${sym}${summary.totalIncome.toLocaleString()}), you can safely disburse ${sym}${affordableAmount.toLocaleString()} to pay ${affordableStaff.map(s => s.name.split(' ')[0]).join(', ')} while keeping ${sym}${(netAvailable - affordableAmount).toLocaleString()} for daily running costs.`,
          actionText: 'Pay Available Staff',
          relatedStaffIds: affordableStaff.map(s => s.id),
        });
      } else {
        suggestions.push({
          id: 'sugg-fee-drive',
          title: 'Prioritize Fee Collection Drive',
          category: 'teacher_salaries',
          suggestedAmount: unpaidStaff[0]?.monthlySalary || 35000,
          priority: 'high',
          explanation: `Current net cash (${sym}${netAvailable.toLocaleString()}) is below the single teacher wage threshold. Recommend sending gentle payment reminders for pending term fees before major disbursements.`,
          actionText: 'Log Collected Fee',
        });
      }
    }
  }

  // 2. Classroom Materials & Examination Stationery (10% - 15% of income)
  if (summary.totalIncome > 0) {
    const stationeryBudget = Math.min(25000, Math.max(5000, Math.round(summary.totalIncome * 0.08)));
    suggestions.push({
      id: 'sugg-stationery',
      title: 'Classroom Supplies & Mid-Term Printouts',
      category: 'stationery_chalk',
      suggestedAmount: stationeryBudget,
      priority: 'medium',
      explanation: `Allocating ~8% (${sym}${stationeryBudget.toLocaleString()}) of income ensures adequate dustless chalk, test sheets, and register books without putting strain on the payroll reserve.`,
      actionText: 'Log Stationery Expense',
    });
  }

  // 3. Generator Fuel / Power Maintenance (Essential for rural communities)
  if (summary.totalIncome > 20000) {
    const fuelBudget = Math.min(30000, Math.max(8000, Math.round(summary.totalIncome * 0.06)));
    suggestions.push({
      id: 'sugg-fuel',
      title: 'Generator Fuel & Utility Reserve',
      category: 'fuel_electricity',
      suggestedAmount: fuelBudget,
      priority: 'medium',
      explanation: `Rural grid power is frequently erratic. Setting aside ${sym}${fuelBudget.toLocaleString()} provides backup power for computer literacy classes and school administrative printing.`,
      actionText: 'Log Fuel Expense',
    });
  }

  // 4. Emergency Buffer / Classroom Facility Repairs
  if (netAvailable > 40000) {
    const repairBudget = Math.round(netAvailable * 0.12);
    suggestions.push({
      id: 'sugg-repairs',
      title: 'Facility Maintenance & Desk Repairs',
      category: 'repairs_maintenance',
      suggestedAmount: repairBudget,
      priority: 'low',
      explanation: `Reserving 12% (${sym}${repairBudget.toLocaleString()}) for carpentry, bench repairs, and roof leakproofing before the rainy season.`,
      actionText: 'Log Maintenance',
    });
  }

  return suggestions;
}
