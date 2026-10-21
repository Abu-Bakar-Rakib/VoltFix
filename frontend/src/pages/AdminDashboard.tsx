import React, { useState, useEffect, useRef } from 'react';
import { adminService } from '../services/admin.service';
import { useAuth } from '../contexts/AuthContext';
import { User, ElectricianProfile } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { TakaIcon } from '../components/common/TakaIcon';
import {
  ShieldAlert,
  Users,
  CheckCircle2,
  XCircle,
  FileText,
  TrendingUp,
  Search,
  AlertTriangle,
  Clock,
  History,
  Camera,
  Link as LinkIcon,
  Upload,
  Check,
  X,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarSuccess, setAvatarSuccess] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [showUrlModal, setShowUrlModal] = useState(false);
  const [avatarUrlInput, setAvatarUrlInput] = useState('');

  const [activeTab, setActiveTab] = useState<'verifications' | 'users' | 'disputes' | 'logs'>('verifications');
  const [analytics, setAnalytics] = useState<any>(null);
  const [verifications, setVerifications] = useState<ElectricianProfile[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [disputes, setDisputes] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Verification modal state
  const [selectedProfile, setSelectedProfile] = useState<ElectricianProfile | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processingAction, setProcessingAction] = useState(false);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [stats, queue, userList, disputeList, logs] = await Promise.all([
        adminService.getAnalytics(),
        adminService.getVerificationQueue(),
        adminService.getUsers({ limit: 50 }),
        adminService.getDisputes(),
        adminService.getAuditLogs(1, 30),
      ]);
      setAnalytics(stats);
      setVerifications(queue);
      setUsers(userList.users);
      setDisputes(disputeList);
      setAuditLogs(logs.logs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleReviewVerification = async (status: 'APPROVED' | 'REJECTED') => {
    if (!selectedProfile) return;
    setProcessingAction(true);
    try {
      await adminService.reviewVerification(
        selectedProfile.id,
        status,
        status === 'REJECTED' ? rejectionReason : undefined
      );
      setSelectedProfile(null);
      setRejectionReason('');
      fetchAdminData();
    } catch (err) {
      console.error(err);
    } finally {
      setProcessingAction(false);
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await adminService.toggleUserStatus(userId, !currentStatus);
      fetchAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleResolveDispute = async (disputeId: string, status: 'RESOLVED' | 'REJECTED') => {
    const resolution = window.prompt('Enter resolution notes:');
    if (!resolution) return;
    try {
      await adminService.resolveDispute(disputeId, resolution, status);
      fetchAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAvatarFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    setAvatarSuccess(null);
    setAvatarError(null);
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      await adminService.updateAvatar(formData);
      await refreshUser();
      setAvatarSuccess('Profile picture updated successfully!');
      setTimeout(() => setAvatarSuccess(null), 4000);
    } catch (err: any) {
      setAvatarError(err.response?.data?.error?.message || 'Failed to upload photo.');
      setTimeout(() => setAvatarError(null), 5000);
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAvatarUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!avatarUrlInput.trim()) return;
    setUploadingAvatar(true);
    setAvatarSuccess(null);
    setAvatarError(null);
    try {
      await adminService.updateAvatar({ avatarUrl: avatarUrlInput.trim() });
      await refreshUser();
      setShowUrlModal(false);
      setAvatarUrlInput('');
      setAvatarSuccess('Profile picture updated successfully!');
      setTimeout(() => setAvatarSuccess(null), 4000);
    } catch (err: any) {
      setAvatarError(err.response?.data?.error?.message || 'Failed to update photo URL.');
      setTimeout(() => setAvatarError(null), 5000);
    } finally {
      setUploadingAvatar(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors">
        <LoadingSpinner label="Loading admin governance console..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-8 px-4 sm:px-6 lg:px-10 transition-colors">
      <div className="w-full space-y-8">
        {/* Hidden File Input for Avatar Upload */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleAvatarFileSelect}
          accept="image/*"
          className="hidden"
        />

        {/* Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-slate-200 dark:border-white/10">
          <div className="flex items-center gap-4">
            {/* Admin Avatar with Click-to-Upload */}
            <div
              className="relative group cursor-pointer shrink-0"
              onClick={() => fileInputRef.current?.click()}
              title="Click to upload your photo"
            >
              <img
                src={user?.avatarUrl && !user.avatarUrl.includes('unsplash') ? user.avatarUrl : '/avatar-rakib.png'}
                alt={user?.name || 'Admin'}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/avatar-rakib.png';
                }}
                className="w-16 h-16 rounded-2xl object-cover ring-2 ring-volt-500/50 shadow-md group-hover:opacity-90 transition-opacity bg-slate-100 dark:bg-slate-800"
              />
              <div className="absolute inset-0 bg-slate-950/70 rounded-2xl opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity text-white backdrop-blur-[2px]">
                <Camera className="w-5 h-5 text-volt-400" />
                <span className="text-[9px] font-bold mt-0.5">Upload</span>
              </div>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900 dark:text-white tracking-tight">
                  VoltFix Administration
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  {user?.name || 'Abu Bakar Rakib'}
                </span>
                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-volt-600 text-white shadow-sm">
                  ADMIN
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Administrator: <strong className="text-slate-700 dark:text-slate-200">{user?.name || 'Abu Bakar Rakib'}</strong> • Platform metrics, contractor verification & user safety
              </p>

              {/* Picture Action Buttons */}
              <div className="flex items-center gap-2 mt-2.5">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/10 transition-colors shadow-sm"
                >
                  <Camera className="w-3.5 h-3.5 text-volt-500" />
                  {uploadingAvatar ? 'Uploading...' : 'Upload Picture'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowUrlModal(true)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <LinkIcon className="w-3 h-3 text-slate-400" />
                  Paste Image URL
                </button>
              </div>
            </div>
          </div>

          {/* Segmented Control Bar */}
          <div className="flex items-center p-1 rounded-2xl bg-slate-200/70 dark:bg-slate-900/90 border border-slate-300/40 dark:border-white/10 backdrop-blur-md shadow-inner gap-1">
            {[
              { id: 'verifications', label: 'Verification Queue', count: verifications.length },
              { id: 'users', label: 'Users', count: users.length },
              { id: 'disputes', label: 'Disputes', count: disputes.length },
              { id: 'logs', label: 'Audit Trail', count: undefined },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center gap-2 ${
                    isActive
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm font-bold border border-slate-200/70 dark:border-white/10'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold leading-none ${
                        isActive
                          ? 'bg-volt-500/20 text-volt-700 dark:text-volt-300'
                          : 'bg-slate-300/60 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Status Alerts for Avatar */}
        {avatarSuccess && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs flex items-center justify-between animate-in fade-in">
            <span className="flex items-center gap-2 font-medium">
              <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              {avatarSuccess}
            </span>
            <button
              onClick={() => setAvatarSuccess(null)}
              className="p-1 rounded-lg hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {avatarError && (
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-400 text-xs flex items-center justify-between animate-in fade-in">
            <span className="flex items-center gap-2 font-medium">
              <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
              {avatarError}
            </span>
            <button
              onClick={() => setAvatarError(null)}
              className="p-1 rounded-lg hover:bg-rose-500/10 text-rose-600 dark:text-rose-400"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Analytics KPI Cards */}
        {analytics && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: GMV */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-white/10 shadow-card hover:shadow-card-hover transition-all duration-200 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Gross Merchandise Value
                </span>
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20 shrink-0">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900 dark:text-white tracking-tight">
                  ৳{analytics.gmv ? analytics.gmv.toFixed(2) : '0.00'}
                </div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
                  Total platform volume transacted
                </span>
              </div>
            </div>

            {/* Card 2: Commission */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-white/10 shadow-card hover:shadow-card-hover transition-all duration-200 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Platform Commission
                </span>
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20 shrink-0">
                  <TakaIcon size="md" />
                </div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold font-heading text-amber-600 dark:text-amber-400 tracking-tight">
                  ৳{analytics.platformRevenue ? analytics.platformRevenue.toFixed(2) : '0.00'}
                </div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
                  5% platform fee collected
                </span>
              </div>
            </div>

            {/* Card 3: Total Bookings */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-white/10 shadow-card hover:shadow-card-hover transition-all duration-200 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Total Bookings
                </span>
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-500/20 shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900 dark:text-white tracking-tight">
                    {analytics.totalBookings}
                  </span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    {analytics.completedBookings} completed
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
                  Lifetime platform jobs
                </span>
              </div>
            </div>

            {/* Card 4: Active Users */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-white/10 shadow-card hover:shadow-card-hover transition-all duration-200 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Active Users
                </span>
                <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-500/20 shrink-0">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900 dark:text-white tracking-tight">
                  {analytics.totalUsers}
                </div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
                  {analytics.totalCustomers} customers • {analytics.totalElectricians} pros
                </span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 1: Verification Queue */}
        {activeTab === 'verifications' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-bold font-heading text-slate-900 dark:text-white flex items-center gap-2">
                Electrician Verification Queue
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {verifications.length}
                </span>
              </h2>
            </div>

            <div className="space-y-3">
              {verifications.length === 0 ? (
                <div className="text-xs text-slate-500 dark:text-slate-400 py-12 text-center p-6 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-white/10 shadow-card">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                  <p className="font-semibold text-slate-700 dark:text-slate-300">All caught up!</p>
                  <p className="mt-0.5">No electrician verifications pending at this time.</p>
                </div>
              ) : (
                verifications.map((p) => (
                  <div
                    key={p.id}
                    className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 shadow-card hover:shadow-card-hover transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={p.user?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.user?.name}`}
                        alt={p.user?.name}
                        className="w-14 h-14 rounded-2xl object-cover bg-slate-100 dark:bg-slate-800 ring-1 ring-slate-200 dark:ring-white/10"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold font-heading text-slate-900 dark:text-white">{p.user?.name}</h3>
                          <StatusBadge status={p.verificationStatus} />
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {p.user?.email} • <span className="font-medium text-slate-700 dark:text-slate-300">{p.city}</span>
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium">
                          {p.experienceYears}y experience • Base: <span className="text-slate-900 dark:text-white font-semibold">৳{p.hourlyRate}/hr</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                      <button
                        onClick={() => setSelectedProfile(p)}
                        className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm group"
                      >
                        <FileText className="w-3.5 h-3.5 text-volt-500 group-hover:scale-110 transition-transform" />
                        Inspect & Review
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 2: User Management */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            <h2 className="text-base sm:text-lg font-bold font-heading text-slate-900 dark:text-white flex items-center gap-2">
              User Accounts Directory
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {users.length}
              </span>
            </h2>

            <div className="rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-white/10 shadow-card overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">User</th>
                    <th className="py-3.5 px-4">Role</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Joined</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={u.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name}`}
                            alt={u.name}
                            className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 ring-1 ring-slate-200 dark:ring-white/10"
                          />
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white">{u.name}</p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">{u.role}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                            u.isActive
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          {u.isActive ? 'ACTIVE' : 'SUSPENDED'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500 dark:text-slate-400">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {u.role !== 'ADMIN' && (
                          <button
                            onClick={() => handleToggleUserStatus(u.id, u.isActive)}
                            className={`px-3 py-1 rounded-xl text-xs font-semibold transition-colors ${
                              u.isActive
                                ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 border border-rose-500/20'
                                : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20'
                            }`}
                          >
                            {u.isActive ? 'Suspend' : 'Activate'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: Disputes */}
        {activeTab === 'disputes' && (
          <div className="space-y-4">
            <h2 className="text-base sm:text-lg font-bold font-heading text-slate-900 dark:text-white flex items-center gap-2">
              Dispute Moderation Center
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {disputes.length}
              </span>
            </h2>

            <div className="space-y-3">
              {disputes.length === 0 ? (
                <div className="text-xs text-slate-500 dark:text-slate-400 py-12 text-center p-6 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-white/10 shadow-card">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                  <p className="font-semibold text-slate-700 dark:text-slate-300">Zero disputes!</p>
                  <p className="mt-0.5">No active customer or electrician disputes filed.</p>
                </div>
              ) : (
                disputes.map((d) => (
                  <div
                    key={d.id}
                    className="p-5 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-white/10 shadow-card space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">Booking #{d.booking?.bookingNumber}</span>
                      <StatusBadge status={d.status} />
                    </div>

                    <p className="text-xs text-rose-700 dark:text-rose-300 bg-rose-500/10 p-3.5 rounded-xl border border-rose-500/20 font-medium">
                      Reason: {d.reason}
                    </p>

                    {d.resolution && (
                      <p className="text-xs text-slate-600 dark:text-slate-400 italic">
                        Resolution: {d.resolution}
                      </p>
                    )}

                    {d.status === 'OPEN' && (
                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          onClick={() => handleResolveDispute(d.id, 'REJECTED')}
                          className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-white/10"
                        >
                          Reject Dispute
                        </button>
                        <button
                          onClick={() => handleResolveDispute(d.id, 'RESOLVED')}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-500 text-xs font-bold text-slate-950 hover:bg-emerald-400 shadow-sm"
                        >
                          Resolve & Refund
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 4: Audit Trail */}
        {activeTab === 'logs' && (
          <div className="space-y-4">
            <h2 className="text-base sm:text-lg font-bold font-heading text-slate-900 dark:text-white">
              Platform Audit Log
            </h2>

            <div className="rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-white/10 shadow-card p-4 space-y-2 max-h-96 overflow-y-auto">
              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-white/5 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-volt-600 dark:text-volt-400 mr-2">{log.action}</span>
                    <span className="text-slate-700 dark:text-slate-300">
                      Entity: {log.entityType} ({log.entityId || 'N/A'})
                    </span>
                    {log.details && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {JSON.stringify(log.details)}
                      </p>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 shrink-0">
                    {new Date(log.createdAt).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Verification Inspection Modal */}
        {selectedProfile && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
            <div className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-2xl p-6 space-y-4 animate-in fade-in text-slate-900 dark:text-slate-100">
              <h3 className="text-base font-bold font-heading text-slate-900 dark:text-white">
                Review Electrician: {selectedProfile.user?.name}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                City: {selectedProfile.city} • Rate: ৳{selectedProfile.hourlyRate}/hr
              </p>

              {/* Sample Document preview */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 space-y-2">
                <span className="text-xs font-bold text-slate-900 dark:text-white block">Submitted Verification Docs</span>
                <div className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300 py-1.5 border-b border-slate-200 dark:border-white/10">
                  <span>National ID / Passport</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Attached (NID Verified)</span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300 py-1.5">
                  <span>Electrical Trade License</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Attached (TL-2024 Verified)</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Rejection Reason (if rejecting)
                </label>
                <input
                  type="text"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. Expired electrical license certificate"
                  className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-volt-500/30"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setSelectedProfile(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-white/10 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={processingAction}
                  onClick={() => handleReviewVerification('REJECTED')}
                  className="px-4 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-500"
                >
                  Reject Application
                </button>
                <button
                  type="button"
                  disabled={processingAction}
                  onClick={() => handleReviewVerification('APPROVED')}
                  className="px-5 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 shadow-sm"
                >
                  Approve Electrician
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal to paste image URL */}
        {showUrlModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-white/10 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold font-heading text-slate-900 dark:text-white flex items-center gap-2">
                  <LinkIcon className="w-4 h-4 text-volt-500" />
                  Paste Profile Picture URL
                </h3>
                <button
                  type="button"
                  onClick={() => setShowUrlModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <form onSubmit={handleAvatarUrlSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Direct Image URL (.jpg, .png, .webp)
                  </label>
                  <input
                    type="url"
                    value={avatarUrlInput}
                    onChange={(e) => setAvatarUrlInput(e.target.value)}
                    placeholder="https://example.com/my-photo.jpg"
                    required
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-volt-500/30"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Paste any public image link (Google, LinkedIn, GitHub, Unsplash, Imgur, etc.)
                  </p>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowUrlModal(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploadingAvatar}
                    className="px-4 py-2 rounded-xl bg-volt-600 text-white text-xs font-bold hover:bg-volt-500 shadow-glow-volt"
                  >
                    {uploadingAvatar ? 'Saving...' : 'Set Picture'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
