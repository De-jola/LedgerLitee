import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  ShieldCheck,
  Building2,
  Search,
  Filter,
  ArrowLeft,
  RefreshCw,
  Download,
  Mail,
  Phone,
  Calendar,
  Clock,
  ExternalLink,
  ChevronRight,
  Database,
  Store,
  GraduationCap,
  Briefcase,
  Layers,
  CheckCircle2,
  X,
} from 'lucide-react';
import { AppUser } from '../types';
import { firebaseService } from '../utils/firebaseService';

interface AdminUsersViewProps {
  onBackToDashboard: () => void;
  onBackToLanding: () => void;
  currentUserEmail?: string | null;
}

export const AdminUsersView: React.FC<AdminUsersViewProps> = ({
  onBackToDashboard,
  onBackToLanding,
  currentUserEmail,
}) => {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<AppUser | null>(null);

  // Subscribe to live users from Firestore
  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = firebaseService.subscribeAllUsers((liveUsers) => {
      setUsers(liveUsers);
      setIsLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleManualRefresh = async () => {
    setIsLoading(true);
    try {
      const freshUsers = await firebaseService.getAllUsers();
      setUsers(freshUsers);
    } catch (err) {
      console.error('Refresh error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Filtered users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        (u.fullName && u.fullName.toLowerCase().includes(q)) ||
        (u.businessName && u.businessName.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q)) ||
        (u.phone && u.phone.toLowerCase().includes(q)) ||
        (u.id && u.id.toLowerCase().includes(q));

      const matchesType =
        filterType === 'all' || (u.businessType || 'general') === filterType;

      return matchesSearch && matchesType;
    });
  }, [users, searchQuery, filterType]);

  // Aggregate stats
  const stats = useMemo(() => {
    const total = users.length;
    const schools = users.filter((u) => u.businessType === 'school').length;
    const shops = users.filter((u) => u.businessType === 'shop').length;
    const services = users.filter((u) => u.businessType === 'services').length;
    const general = users.filter(
      (u) => !u.businessType || u.businessType === 'general'
    ).length;

    return { total, schools, shops, services, general };
  }, [users]);

  // Export to CSV
  const handleExportCSV = () => {
    const headers = [
      'User ID',
      'Full Name',
      'Email',
      'Phone',
      'Business Name',
      'Business Type',
      'Location',
      'Role',
      'Registered At',
      'Last Login',
    ];
    const rows = filteredUsers.map((u) => [
      `"${u.id}"`,
      `"${u.fullName || ''}"`,
      `"${u.email || ''}"`,
      `"${u.phone || ''}"`,
      `"${u.businessName || ''}"`,
      `"${u.businessType || 'general'}"`,
      `"${u.location || ''}"`,
      `"${u.role || 'owner'}"`,
      `"${u.createdAt ? new Date(u.createdAt).toISOString() : ''}"`,
      `"${u.lastLoginAt ? new Date(u.lastLoginAt).toISOString() : ''}"`,
    ]);
    const csvContent =
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ledgerlite-registered-users-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans">
      {/* Admin Top Navigation */}
      <header className="sticky top-0 z-40 bg-slate-900 text-white border-b border-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToDashboard}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition flex items-center gap-1.5 text-xs font-bold"
              title="Return to Business Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </button>

            <div className="h-5 w-px bg-slate-800 hidden sm:block" />

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-teal-500 text-slate-950 flex items-center justify-center font-black shadow-xs">
                <ShieldCheck className="w-5 h-5 text-slate-950" />
              </div>
              <div>
                <h1 className="text-sm font-black tracking-tight text-white flex items-center gap-2">
                  <span>LedgerLite Admin Console</span>
                  <span className="text-[10px] bg-teal-900/80 text-teal-300 px-2 py-0.5 rounded-full border border-teal-700 font-mono font-bold">
                    SuperAdmin
                  </span>
                </h1>
                <p className="text-[11px] text-slate-400 font-medium">
                  Central Directory & Multi-Tenant Registry
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="hidden md:inline-flex items-center gap-1.5 text-xs text-slate-300 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700 font-mono">
              <Database className="w-3.5 h-3.5 text-teal-400" />
              <span>pocketly-1843c</span>
            </span>

            <button
              onClick={handleManualRefresh}
              disabled={isLoading}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
              title="Refresh Users List"
            >
              <RefreshCw
                className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`}
              />
            </button>

            <button
              onClick={onBackToLanding}
              className="text-xs font-bold text-slate-400 hover:text-white px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 transition"
            >
              Landing Page
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Banner with Admin Info */}
        <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200/60 uppercase tracking-wider">
              <Users className="w-3.5 h-3.5" />
              <span>Registered Business Tenants Directory</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              All LedgerLite Platform Users
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Viewing registered businesses and owner accounts stored in Firestore.
              {currentUserEmail && (
                <span className="font-semibold text-slate-700">
                  {' '}
                  Authenticated Administrator: {currentUserEmail}
                </span>
              )}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-95 text-white font-bold px-4 py-2.5 text-xs shadow-xs transition cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Aggregate Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-xs">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Total Users
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-slate-900">
                {stats.total}
              </span>
              <span className="text-xs text-teal-600 font-bold">registered</span>
            </div>
          </div>

          <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Schools
              </span>
              <GraduationCap className="w-4 h-4 text-purple-600" />
            </div>
            <div className="mt-1 text-2xl sm:text-3xl font-black text-purple-900">
              {stats.schools}
            </div>
          </div>

          <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Retail & Stores
              </span>
              <Store className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="mt-1 text-2xl sm:text-3xl font-black text-emerald-900">
              {stats.shops}
            </div>
          </div>

          <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Services
              </span>
              <Briefcase className="w-4 h-4 text-blue-600" />
            </div>
            <div className="mt-1 text-2xl sm:text-3xl font-black text-blue-900">
              {stats.services}
            </div>
          </div>

          <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-xs col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                General Business
              </span>
              <Layers className="w-4 h-4 text-slate-600" />
            </div>
            <div className="mt-1 text-2xl sm:text-3xl font-black text-slate-900">
              {stats.general}
            </div>
          </div>
        </div>

        {/* Search, Filter, and Table Container */}
        <div className="rounded-2xl bg-white border border-slate-200 shadow-xs overflow-hidden">
          {/* Controls Bar */}
          <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by owner name, business, email, phone..."
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:border-teal-600 focus:ring-1 focus:ring-teal-600 outline-hidden"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full sm:w-auto rounded-xl border border-slate-300 bg-white py-2 px-3 text-xs font-semibold text-slate-700 focus:border-teal-600 outline-hidden"
              >
                <option value="all">All Business Types</option>
                <option value="school">Schools & Academies</option>
                <option value="shop">Retail Stores & Shops</option>
                <option value="services">Services & Consulting</option>
                <option value="general">General Business</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-4">Business & Owner</th>
                  <th className="py-3.5 px-4">Category & Location</th>
                  <th className="py-3.5 px-4">Contact Info</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Registered Date</th>
                  <th className="py-3.5 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto text-teal-600 mb-2" />
                      <span>Loading registered users from Cloud Firestore...</span>
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="font-bold text-slate-700">No users found</p>
                      <p className="text-xs text-slate-500">
                        {users.length === 0
                          ? 'No users have completed onboarding yet. New users registered via the landing page will appear here.'
                          : 'No users matched your search filters.'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr
                      key={u.id}
                      className="hover:bg-teal-50/30 transition group"
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-teal-700 text-white font-black flex items-center justify-center text-xs shadow-2xs shrink-0">
                            {(u.businessName || u.fullName || 'B')
                              .charAt(0)
                              .toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block leading-tight text-xs">
                              {u.businessName || 'Unnamed Business'}
                            </span>
                            <span className="text-[11px] text-slate-500 font-medium">
                              Owner: {u.fullName || 'Owner'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 text-slate-700 px-2 py-0.5 text-[11px] font-bold capitalize">
                          {u.businessType || 'general'}
                        </span>
                        <span className="text-[11px] text-slate-500 block mt-0.5">
                          {u.location || 'Location not specified'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 space-y-0.5">
                        {u.email && (
                          <div className="flex items-center gap-1.5 text-slate-700 text-[11px]">
                            <Mail className="w-3 h-3 text-slate-400" />
                            <span>{u.email}</span>
                          </div>
                        )}
                        {u.phone && (
                          <div className="flex items-center gap-1.5 text-slate-600 text-[11px]">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{u.phone}</span>
                          </div>
                        )}
                        {!u.email && !u.phone && (
                          <span className="text-slate-400 italic text-[11px]">
                            No contact provided
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 capitalize">
                          {u.role || 'owner'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                        <div className="flex items-center gap-1 text-slate-700">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>
                            {u.createdAt
                              ? new Date(u.createdAt).toLocaleDateString()
                              : 'Recent'}
                          </span>
                        </div>
                        {u.lastLoginAt && (
                          <div className="flex items-center gap-1 text-[10px] text-slate-400">
                            <Clock className="w-2.5 h-2.5" />
                            <span>
                              Active{' '}
                              {new Date(u.lastLoginAt).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setSelectedUser(u)}
                          className="px-2.5 py-1 rounded-lg border border-slate-200 hover:border-teal-400 hover:bg-teal-50 text-slate-700 hover:text-teal-900 font-bold text-xs transition"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="p-3.5 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
            <span>
              Showing {filteredUsers.length} of {users.length} users
            </span>
            <span className="text-[11px] text-slate-400">
              Live Cloud Firestore Sync Active
            </span>
          </div>
        </div>
      </main>

      {/* User Details Modal / Drawer */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
            {/* Modal Header */}
            <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-teal-400" />
                <h3 className="font-bold text-sm tracking-tight text-white">
                  User & Tenant Profile
                </h3>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center gap-3 p-4 bg-teal-50/50 rounded-xl border border-teal-200/70">
                <div className="w-12 h-12 rounded-xl bg-teal-700 text-white font-black flex items-center justify-center text-base shadow-xs shrink-0">
                  {(selectedUser.businessName || 'B').charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="text-base font-black text-slate-900">
                    {selectedUser.businessName || 'Unnamed Business'}
                  </h4>
                  <p className="text-xs text-slate-500 font-medium">
                    Owner: {selectedUser.fullName}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">
                    Business Type
                  </span>
                  <span className="font-bold text-slate-800 capitalize">
                    {selectedUser.businessType || 'General'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">
                    Location
                  </span>
                  <span className="font-bold text-slate-800">
                    {selectedUser.location || 'N/A'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">
                    Email Address
                  </span>
                  <span className="font-bold text-slate-800 break-all">
                    {selectedUser.email || 'None'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">
                    Phone Contact
                  </span>
                  <span className="font-bold text-slate-800">
                    {selectedUser.phone || 'None'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">
                    Currency
                  </span>
                  <span className="font-bold text-slate-800">
                    {selectedUser.currency || 'NGN (₦)'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">
                    Account Role
                  </span>
                  <span className="font-bold text-purple-700 capitalize">
                    {selectedUser.role || 'owner'}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                <span className="text-slate-400 block text-[10px] font-bold uppercase">
                  User ID / Database Path
                </span>
                <code className="font-mono text-[11px] text-slate-800 select-all block bg-white p-1 rounded border border-slate-200">
                  users/{selectedUser.id}
                </code>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setSelectedUser(null)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
