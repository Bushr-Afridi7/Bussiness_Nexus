import React, { useMemo, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  Bell,
  Briefcase,
  CalendarCheck,
  CreditCard,
  FileText,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageCircle,
  Phone,
  Settings,
  Sparkles,
  Users,
  X,
} from 'lucide-react';

type StoredUser = {
  id?: number;
  fullName?: string;
  name?: string;
  email?: string;
  role?: string;
};

export const DashboardLayout: React.FC = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const user: StoredUser | null = useMemo(() => {
    try {
      const storedUser = localStorage.getItem('business_nexus_user');

      if (!storedUser) {
        return null;
      }

      return JSON.parse(storedUser);
    } catch {
      return null;
    }
  }, []);

  const userRole = user?.role || 'Investor';

  const dashboardPath =
    userRole === 'Entrepreneur'
      ? '/dashboard/entrepreneur'
      : '/dashboard/investor';

  const menuItems = [
    {
      name: 'Dashboard',
      href: dashboardPath,
      icon: LayoutDashboard,
    },
    {
      name: 'Investors',
      href: '/investors',
      icon: Users,
    },
    {
      name: 'Entrepreneurs',
      href: '/entrepreneurs',
      icon: Briefcase,
    },
    {
      name: 'Meetings',
      href: '/meetings',
      icon: CalendarCheck,
    },
    {
      name: 'Messages',
      href: '/messages',
      icon: MessageCircle,
    },
    {
      name: 'Calls',
      href: '/calls',
      icon: Phone,
    },
    {
      name: 'Documents',
      href: '/documents',
      icon: FileText,
    },
    {
      name: 'Notifications',
      href: '/notifications',
      icon: Bell,
    },
    {
      name: 'Deals',
      href: '/deals',
      icon: CreditCard,
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings,
    },
    {
      name: 'Help',
      href: '/help',
      icon: HelpCircle,
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem('nexus_token');
    localStorage.removeItem('business_nexus_user');
    navigate('/login');
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const userInitials =
    (user?.fullName || user?.name || 'User')
      .split(' ')
      .map((part) => part[0])
      .join('')
      .substring(0, 2)
      .toUpperCase() || 'U';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Top Bar */}
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 lg:hidden">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600 text-white">
            <Sparkles size={20} />
          </div>

          <div>
            <h1 className="text-lg font-bold text-gray-900">Nexus</h1>
            <p className="text-xs text-gray-500">Business Platform</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsSidebarOpen(true)}
          className="rounded-lg border border-gray-300 p-2 text-gray-700 hover:bg-gray-100"
          aria-label="Open sidebar"
          title="Open sidebar"
        >
          <Menu size={22} />
        </button>
      </div>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar overlay"
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 h-screen w-72 transform border-r border-gray-200 bg-white transition-transform duration-300 lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex items-center justify-between border-b border-gray-200 px-5 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-600 text-white shadow-sm">
                <Sparkles size={22} />
              </div>

              <div>
                <h1 className="text-xl font-bold text-gray-900">Nexus</h1>
                <p className="text-xs text-gray-500">
                  Investor & Entrepreneur
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={closeSidebar}
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 lg:hidden"
              aria-label="Close sidebar"
              title="Close sidebar"
            >
              <X size={20} />
            </button>
          </div>

          {/* User Info */}
          <div className="border-b border-gray-200 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-700">
                {userInitials}
              </div>

              <div className="min-w-0">
                <h2 className="truncate text-sm font-semibold text-gray-900">
                  {user?.fullName || user?.name || 'Nexus User'}
                </h2>

                <p className="truncate text-xs text-gray-500">
                  {user?.email || 'user@nexus.com'}
                </p>

                <span className="mt-1 inline-flex rounded-full bg-primary-50 px-2 py-0.5 text-[11px] font-medium text-primary-700">
                  {userRole}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
            {menuItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  onClick={closeSidebar}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-primary-600 text-white shadow-sm'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }`
                  }
                >
                  <Icon size={19} />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="border-t border-gray-200 p-4">
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-600 transition-all hover:bg-red-50"
            >
              <LogOut size={19} />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="min-h-screen lg:pl-72">
        <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};