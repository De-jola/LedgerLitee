import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  CheckCircle,
  Clock,
  DollarSign,
  Phone,
  Shield,
  Trash2,
  Edit2,
  ShieldCheck,
  ShieldAlert,
  UserCheck,
  Eye,
  KeyRound,
  Lock,
} from 'lucide-react';
import { TeacherStaff, BusinessProfile, Transaction, UserRole } from '../types';

interface TeacherPayrollProps {
  staffList: TeacherStaff[];
  transactions: Transaction[];
  profile: BusinessProfile;
  currentRole: UserRole;
  onChangeActiveRole: (role: UserRole) => void;
  onPaySalary: (staff: TeacherStaff) => void;
  onSaveStaff: (staffList: TeacherStaff[]) => void;
}

export const TeacherPayroll: React.FC<TeacherPayrollProps> = ({
  staffList,
  transactions,
  profile,
  currentRole,
  onChangeActiveRole,
  onPaySalary,
  onSaveStaff,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<TeacherStaff | null>(null);
  const [name, setName] = useState('');
  const [role, setRole] = useState('Primary Class Teacher');
  const [roleType, setRoleType] = useState<UserRole>('cashier');
  const [monthlySalary, setMonthlySalary] = useState('');
  const [phone, setPhone] = useState('');

  const sym = profile.currencySymbol || '₦';
  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

  // Check which staff members have been paid this month
  const isPaidThisMonth = (staffName: string) => {
    return transactions.some(
      (t) =>
        t.type === 'expense' &&
        (t.category === 'teacher_salaries' || t.category === 'support_staff_wages') &&
        t.date.startsWith(currentMonth) &&
        t.payerOrPayee?.toLowerCase().includes(staffName.toLowerCase())
    );
  };

  const handleOpenAdd = () => {
    setEditingStaff(null);
    setName('');
    setRole('Primary Class Teacher');
    setRoleType('cashier');
    setMonthlySalary('');
    setPhone('');
    setShowAddModal(true);
  };

  const handleOpenEdit = (staff: TeacherStaff) => {
    setEditingStaff(staff);
    setName(staff.name);
    setRole(staff.role);
    setRoleType(staff.roleType || 'cashier');
    setMonthlySalary(staff.monthlySalary.toString());
    setPhone(staff.phone || '');
    setShowAddModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to remove this staff member?')) {
      const updated = staffList.filter((s) => s.id !== id);
      onSaveStaff(updated);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const sal = parseFloat(monthlySalary);
    if (!name.trim() || isNaN(sal) || sal < 0) {
      alert('Please enter a valid name and monthly salary');
      return;
    }

    if (editingStaff) {
      const updated = staffList.map((s) =>
        s.id === editingStaff.id
          ? {
              ...s,
              name: name.trim(),
              role: role.trim(),
              roleType,
              monthlySalary: sal,
              phone: phone.trim(),
            }
          : s
      );
      onSaveStaff(updated);
    } else {
      const newStaff: TeacherStaff = {
        id: `staff-${Date.now()}`,
        name: name.trim(),
        role: role.trim(),
        roleType,
        monthlySalary: sal,
        phone: phone.trim(),
        status: 'active',
      };
      onSaveStaff([...staffList, newStaff]);
    }
    setShowAddModal(false);
  };

  const totalMonthlyCommitment = staffList.reduce((acc, s) => acc + s.monthlySalary, 0);
  const paidCount = staffList.filter((s) => isPaidThisMonth(s.name)).length;

  const roleBadges: Record<UserRole, { label: string; bg: string; text: string; desc: string }> = {
    owner: {
      label: 'Owner',
      bg: 'bg-purple-100 border-purple-300',
      text: 'text-purple-800',
      desc: 'Full access to business records and settings',
    },
    manager: {
      label: 'Manager',
      bg: 'bg-blue-100 border-blue-300',
      text: 'text-blue-800',
      desc: 'Can view records, manage staff, and create invoices',
    },
    cashier: {
      label: 'Cashier',
      bg: 'bg-emerald-100 border-emerald-300',
      text: 'text-emerald-800',
      desc: 'Can record sales and issue receipts',
    },
    viewer: {
      label: 'Viewer',
      bg: 'bg-slate-100 border-slate-300',
      text: 'text-slate-800',
      desc: 'Can view selected records only',
    },
  };

  return (
    <div className="space-y-6">
      {/* Title & Description Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 rounded-2xl bg-white border border-slate-200 p-5 shadow-xs">
        <div className="space-y-1">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 text-xs font-bold border border-teal-200">
            <Users className="w-3.5 h-3.5 text-teal-600" />
            <span>Manage staff records</span>
          </span>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            Let your staff help without losing control.
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
            Add trusted staff members and choose what they can do. For example, a cashier can record sales while only the owner can see full business reports.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="text-right hidden sm:block">
            <span className="text-[10px] font-bold text-slate-400 uppercase">
              Total Monthly Payroll
            </span>
            <div className="text-base font-black text-slate-900">
              {sym}{totalMonthlyCommitment.toLocaleString()}
            </div>
            <span className="text-[11px] text-teal-700 font-semibold">
              {paidCount} of {staffList.length} staff paid this month
            </span>
          </div>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold px-3.5 py-2.5 text-xs shadow-sm transition active:scale-95 shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Staff Member</span>
          </button>
        </div>
      </div>

      {/* Role Permission Legend & Simulator */}
      <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-teal-700" />
            <span className="text-xs font-bold text-slate-800">
              Role Permission Access Controls
            </span>
          </div>

          {/* Active Role Selector for Testing */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500 font-medium">Logged in role:</span>
            <select
              value={currentRole}
              onChange={(e) => onChangeActiveRole(e.target.value as UserRole)}
              className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-bold text-teal-900 focus:outline-hidden focus:border-teal-500 shadow-2xs"
            >
              <option value="owner">Owner (Full Access)</option>
              <option value="manager">Manager (Records & Staff)</option>
              <option value="cashier">Cashier (Sales & Receipts)</option>
              <option value="viewer">Viewer (Read-only)</option>
            </select>
          </div>
        </div>

        {/* 4 Defined Roles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
          <div className="bg-white p-3 rounded-lg border border-purple-200 shadow-2xs space-y-1">
            <span className="inline-block px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 font-bold text-[10px]">
              Owner
            </span>
            <p className="text-[11px] text-slate-600 leading-snug">
              Full access to business records and settings
            </p>
          </div>

          <div className="bg-white p-3 rounded-lg border border-blue-200 shadow-2xs space-y-1">
            <span className="inline-block px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 font-bold text-[10px]">
              Manager
            </span>
            <p className="text-[11px] text-slate-600 leading-snug">
              Can view records, manage staff, and create invoices
            </p>
          </div>

          <div className="bg-white p-3 rounded-lg border border-emerald-200 shadow-2xs space-y-1">
            <span className="inline-block px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[10px]">
              Cashier
            </span>
            <p className="text-[11px] text-slate-600 leading-snug">
              Can record sales and issue receipts
            </p>
          </div>

          <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs space-y-1">
            <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 font-bold text-[10px]">
              Viewer
            </span>
            <p className="text-[11px] text-slate-600 leading-snug">
              Can view selected records only
            </p>
          </div>
        </div>
      </div>

      {/* Staff Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {staffList.map((staff) => {
          const paid = isPaidThisMonth(staff.name);
          const badge = roleBadges[staff.roleType || 'cashier'] || roleBadges.cashier;

          return (
            <div
              key={staff.id}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs flex flex-col justify-between hover:shadow-md transition"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-sm border border-teal-200">
                      {staff.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 leading-tight">
                        {staff.name}
                      </h4>
                      <p className="text-xs text-slate-500 font-medium">{staff.role}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(staff)}
                      className="p-1 text-slate-400 hover:text-slate-600 rounded"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(staff.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Role badge */}
                <div className="mt-3 flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${badge.bg} ${badge.text}`}>
                    <Shield className="w-3 h-3" />
                    <span>Role: {badge.label}</span>
                  </span>
                  <span className="text-[10px] text-slate-400 truncate">{badge.desc}</span>
                </div>

                <div className="mt-3 space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Monthly Wage:</span>
                    <span className="font-extrabold text-slate-900">
                      {sym}{staff.monthlySalary.toLocaleString()}
                    </span>
                  </div>
                  {staff.phone && (
                    <div className="flex items-center justify-between text-slate-500">
                      <span>Contact:</span>
                      <span className="font-mono text-[11px]">{staff.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                    <span>Status:</span>
                    {paid ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                        <CheckCircle className="w-3 h-3" /> Paid this Month
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                        <Clock className="w-3 h-3" /> Pending Disbursement
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100">
                <button
                  onClick={() => onPaySalary(staff)}
                  className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    paid
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                      : 'bg-teal-600 hover:bg-teal-700 text-white shadow-xs active:scale-95'
                  }`}
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>{paid ? 'Log Additional Payment' : 'Pay Salary Now'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Staff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-slate-900 mb-3">
              {editingStaff ? 'Edit Staff Member' : 'Add Staff Member'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mr. Emmanuel Okon"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs text-slate-800 focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Staff Role / Permission Level
                </label>
                <select
                  value={roleType}
                  onChange={(e) => setRoleType(e.target.value as UserRole)}
                  className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs text-slate-800 bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-200 font-bold"
                >
                  <option value="owner">Owner — Full access to records and settings</option>
                  <option value="manager">Manager — View records, manage staff, create invoices</option>
                  <option value="cashier">Cashier — Record sales and issue receipts</option>
                  <option value="viewer">Viewer — View selected records only</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Job Title / Department
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Primary 4 Class Teacher / Head Bursar / Cashier"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs text-slate-800 focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Monthly Salary ({sym})
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="45000"
                  value={monthlySalary}
                  onChange={(e) => setMonthlySalary(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs font-bold text-slate-800 focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Phone Number (Optional)
                </label>
                <input
                  type="text"
                  placeholder="0803-123-4567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs text-slate-800 focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl border border-slate-300 px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-teal-600 px-4 py-2 text-xs font-bold text-white hover:bg-teal-700 transition"
                >
                  {editingStaff ? 'Save Changes' : 'Save Staff Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
