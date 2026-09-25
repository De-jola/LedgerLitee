import React from 'react';
import {
  Sparkles,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  GraduationCap,
  Fuel,
  BookOpen,
  Wrench,
  DollarSign,
  ShieldAlert,
} from 'lucide-react';
import { BudgetSuggestion, BusinessProfile, TeacherStaff, Transaction } from '../types';
import { CashFlowSummary } from '../utils/budgetEngine';

interface BudgetSuggestionsProps {
  suggestions: BudgetSuggestion[];
  summary: CashFlowSummary;
  profile: BusinessProfile;
  staffList: TeacherStaff[];
  onApplySuggestion: (suggestion: BudgetSuggestion) => void;
  onOpenPayroll: () => void;
}

export const BudgetSuggestions: React.FC<BudgetSuggestionsProps> = ({
  suggestions,
  summary,
  profile,
  staffList,
  onApplySuggestion,
  onOpenPayroll,
}) => {
  const sym = profile.currencySymbol || '₦';

  // Calculate percentage of income allocated to salaries
  const totalPayroll = staffList.reduce((acc, s) => acc + s.monthlySalary, 0);
  const payrollCoverageRatio =
    summary.totalIncome > 0
      ? Math.round((summary.totalIncome / Math.max(1, totalPayroll)) * 100)
      : 0;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'teacher_salaries':
      case 'support_staff_wages':
        return <GraduationCap className="w-5 h-5 text-teal-600" />;
      case 'fuel_electricity':
        return <Fuel className="w-5 h-5 text-amber-600" />;
      case 'stationery_chalk':
        return <BookOpen className="w-5 h-5 text-blue-600" />;
      case 'repairs_maintenance':
        return <Wrench className="w-5 h-5 text-purple-600" />;
      default:
        return <DollarSign className="w-5 h-5 text-emerald-600" />;
    }
  };

  const getPriorityBadge = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high':
        return (
          <span className="rounded-full bg-rose-100 text-rose-800 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
            Urgent Priority
          </span>
        );
      case 'medium':
        return (
          <span className="rounded-full bg-amber-100 text-amber-800 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
            Recommended
          </span>
        );
      case 'low':
        return (
          <span className="rounded-full bg-blue-100 text-blue-800 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
            Discretionary
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Introduction */}
      <div className="rounded-2xl border border-teal-200 bg-gradient-to-r from-teal-50 to-emerald-50 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-800 uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-amber-500" /> Cash Flow Intelligence Engine
            </div>
            <h2 className="text-xl font-black text-slate-900">
              Smart Expense & Payroll Guidance
            </h2>
            <p className="text-xs md:text-sm text-slate-600 max-w-2xl leading-relaxed">
              In rural schools, timely teacher pay and essential supplies depend strictly on actual cash collected. Our engine analyzes your real-time collections ({sym}{summary.totalIncome.toLocaleString()}) to calculate safe operational disbursements.
            </p>
          </div>

          <div className="rounded-xl bg-white p-3.5 border border-teal-100 shadow-xs shrink-0 text-center">
            <span className="text-[11px] font-bold text-slate-500 uppercase">
              Monthly Payroll Coverage
            </span>
            <div className="text-2xl font-black text-teal-800 mt-0.5">
              {payrollCoverageRatio}%
            </div>
            <span className="text-[11px] text-slate-500 block">
              {sym}{summary.totalIncome.toLocaleString()} / {sym}{totalPayroll.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Suggested Actions List */}
      <div className="space-y-3.5">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <span>Actionable Budget Allocations</span>
          <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-bold text-slate-700">
            {suggestions.length}
          </span>
        </h3>

        {suggestions.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p className="font-bold text-slate-800">All Expenses & Salaries Balanced</p>
            <p className="text-xs mt-1">
              No outstanding urgent allocations needed right now. Record more school fee payments to unlock additional budget recommendations.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {suggestions.map((suggestion) => (
              <div
                key={suggestion.id}
                className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-teal-400 hover:shadow-md transition"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl bg-slate-100 p-2.5">
                        {getCategoryIcon(suggestion.category)}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">
                          {suggestion.title}
                        </h4>
                        <span className="text-xs font-semibold text-slate-500 capitalize">
                          {suggestion.category.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>
                    {getPriorityBadge(suggestion.priority)}
                  </div>

                  <p className="mt-3 text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                    {suggestion.explanation}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                      Suggested Amount
                    </span>
                    <div className="text-base font-black text-slate-900">
                      {sym}{suggestion.suggestedAmount.toLocaleString()}
                    </div>
                  </div>

                  <button
                    onClick={() => onApplySuggestion(suggestion)}
                    className="flex items-center gap-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold px-4 py-2 text-xs shadow-sm transition active:scale-95"
                  >
                    <span>{suggestion.actionText}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Rural School Best Practices Note */}
      <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4 text-xs text-amber-900 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-amber-950">Rural School Cash Flow Best Practices:</p>
          <p className="text-amber-800 leading-relaxed">
            1. Whenever parents bring POS agent slips, scan the QR code immediately before the thermal paper fades.<br />
            2. Never disburse more than 70% of available cash on a single vendor so you retain reserves for exam papers and teachers.<br />
            3. Use the Teacher Payroll tab to track individual teacher disbursements and avoid double payments.
          </p>
        </div>
      </div>
    </div>
  );
};
