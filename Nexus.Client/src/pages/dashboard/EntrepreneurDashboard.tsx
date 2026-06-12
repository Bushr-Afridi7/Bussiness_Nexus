import React, { useEffect, useState } from 'react';
import {
  Bell,
  Calendar,
  CheckCircle,
  CreditCard,
  FileText,
  MessageCircle,
  RefreshCw,
  Users,
  Phone,
  Video,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Card, CardBody } from '../../components/ui/Card';
import api from '../../api/api';

type DashboardStats = {
  totalMeetings: number;
  pendingMeetings: number;
  acceptedMeetings: number;
  totalDocuments: number;
  signedDocuments: number;
  totalPayments: number;
  completedPayments: number;
  pendingPayments: number;
  totalChats: number;
  unreadMessages: number;
  unreadNotifications: number;
  totalCalls: number;
  audioCalls: number;
  videoCalls: number;
  endedCalls: number;
  totalInvestors: number;
  totalEntrepreneurs: number;
};

type DashboardUser = {
  id: number;
  fullName: string;
  email: string;
  role: string;
};

export const EntrepreneurDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [user, setUser] = useState<DashboardUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setIsLoading(true);

      const response = await api.get('/Dashboard/stats');

      setStats(response.data.stats);
      setUser(response.data.user);
    } catch (error: any) {
      console.error('Dashboard stats error:', error);

      const message =
        error.response?.data?.message || 'Failed to load dashboard stats';

      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Meetings',
      value: stats?.totalMeetings || 0,
      subtitle: `${stats?.pendingMeetings || 0} pending • ${
        stats?.acceptedMeetings || 0
      } accepted`,
      icon: Calendar,
      cardClass: 'from-blue-50 to-white border-blue-100',
      iconClass: 'bg-blue-100 text-blue-700',
    },
    {
      title: 'Documents',
      value: stats?.totalDocuments || 0,
      subtitle: `${stats?.signedDocuments || 0} signed documents`,
      icon: FileText,
      cardClass: 'from-emerald-50 to-white border-emerald-100',
      iconClass: 'bg-emerald-100 text-emerald-700',
    },
    {
      title: 'Payments',
      value: stats?.totalPayments || 0,
      subtitle: `${stats?.completedPayments || 0} completed • ${
        stats?.pendingPayments || 0
      } pending`,
      icon: CreditCard,
      cardClass: 'from-amber-50 to-white border-amber-100',
      iconClass: 'bg-amber-100 text-amber-700',
    },
    {
      title: 'Chats',
      value: stats?.totalChats || 0,
      subtitle: `${stats?.unreadMessages || 0} unread messages`,
      icon: MessageCircle,
      cardClass: 'from-purple-50 to-white border-purple-100',
      iconClass: 'bg-purple-100 text-purple-700',
    },
    {
      title: 'Notifications',
      value: stats?.unreadNotifications || 0,
      subtitle: 'Unread platform alerts',
      icon: Bell,
      cardClass: 'from-rose-50 to-white border-rose-100',
      iconClass: 'bg-rose-100 text-rose-700',
    },
    {
      title: 'Total Calls',
      value: stats?.totalCalls || 0,
      subtitle: `${stats?.endedCalls || 0} ended call sessions`,
      icon: Phone,
      cardClass: 'from-cyan-50 to-white border-cyan-100',
      iconClass: 'bg-cyan-100 text-cyan-700',
    },
    {
      title: 'Audio Calls',
      value: stats?.audioCalls || 0,
      subtitle: 'Simple voice call records',
      icon: Phone,
      cardClass: 'from-green-50 to-white border-green-100',
      iconClass: 'bg-green-100 text-green-700',
    },
    {
      title: 'Video Calls',
      value: stats?.videoCalls || 0,
      subtitle: 'Video meeting room records',
      icon: Video,
      cardClass: 'from-indigo-50 to-white border-indigo-100',
      iconClass: 'bg-indigo-100 text-indigo-700',
    },
    {
      title: 'Investors',
      value: stats?.totalInvestors || 0,
      subtitle: 'Registered investor users',
      icon: Users,
      cardClass: 'from-slate-50 to-white border-slate-100',
      iconClass: 'bg-slate-100 text-slate-700',
    },
    {
      title: 'Entrepreneurs',
      value: stats?.totalEntrepreneurs || 0,
      subtitle: 'Registered startup users',
      icon: Users,
      cardClass: 'from-teal-50 to-white border-teal-100',
      iconClass: 'bg-teal-100 text-teal-700',
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Entrepreneur Dashboard
          </h1>

          <p className="text-gray-600">
            Welcome back, {user?.fullName || 'Entrepreneur'}.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchDashboardStats}
          className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <RefreshCw size={16} />
          Refresh Stats
        </button>
      </div>

      <div className="overflow-hidden rounded-3xl bg-gradient-to-r from-primary-600 via-blue-600 to-indigo-700 p-6 text-white shadow-lg">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-white/80">
              Nexus Platform Overview
            </p>

            <h2 className="mt-2 text-2xl font-bold">
              Track your startup meetings, calls, documents and deals
            </h2>

            <p className="mt-2 max-w-2xl text-sm text-white/80">
              These dashboard statistics are loaded from the real backend
              database and update according to your platform activity.
            </p>
          </div>

          <div className="w-fit rounded-2xl bg-white/15 px-5 py-4 backdrop-blur">
            <p className="text-xs uppercase tracking-wide text-white/70">
              Logged in as
            </p>
            <p className="mt-1 text-lg font-bold">
              {user?.role || 'Entrepreneur'}
            </p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <Card>
          <CardBody>
            <p className="text-gray-600">Loading dashboard statistics...</p>
          </CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          {statCards.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className={`group relative overflow-hidden rounded-2xl border bg-gradient-to-br p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${item.cardClass}`}
              >
                <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/60 blur-2xl transition-all duration-300 group-hover:scale-125" />

                <div className="relative flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                      {item.title}
                    </p>

                    <h2 className="mt-3 text-4xl font-extrabold text-gray-900">
                      {item.value}
                    </h2>

                    <p className="mt-2 text-sm font-medium text-gray-600">
                      {item.subtitle}
                    </p>
                  </div>

                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-sm ${item.iconClass}`}
                  >
                    <Icon size={24} />
                  </div>
                </div>

                <div className="relative mt-5 h-1.5 overflow-hidden rounded-full bg-gray-200/70">
                  <div className="h-full w-2/3 rounded-full bg-gray-900/20 transition-all duration-300 group-hover:w-full" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};