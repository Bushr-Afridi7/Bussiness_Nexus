import React, { useEffect, useState } from 'react';
import {
  Bell,
  CheckCheck,
  Trash2,
  RefreshCw,
  CheckCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import api from '../../api/api';

type AppNotification = {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
};

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [isMarkingAll, setIsMarkingAll] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);

      const response = await api.get('/Notifications/my-notifications');

      setNotifications(response.data.notifications || []);
      setUnreadCount(response.data.unreadCount || 0);
    } catch (error: any) {
      console.error('Fetch notifications error:', error);

      const message =
        error.response?.data?.message || 'Failed to load notifications';

      toast.error(message);
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (notificationId: number) => {
    try {
      setActionLoadingId(notificationId);

      const response = await api.put(`/Notifications/${notificationId}/read`);

      toast.success(response.data.message || 'Notification marked as read');

      await fetchNotifications();
    } catch (error: any) {
      console.error('Mark notification read error:', error);

      const message =
        error.response?.data?.message || 'Failed to mark notification as read';

      toast.error(message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const markAllAsRead = async () => {
    try {
      setIsMarkingAll(true);

      const response = await api.put('/Notifications/read-all');

      toast.success(response.data.message || 'All notifications marked as read');

      await fetchNotifications();
    } catch (error: any) {
      console.error('Mark all notifications read error:', error);

      const message =
        error.response?.data?.message || 'Failed to mark all notifications as read';

      toast.error(message);
    } finally {
      setIsMarkingAll(false);
    }
  };

  const deleteNotification = async (notificationId: number) => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this notification?'
    );

    if (!confirmDelete) {
      return;
    }

    try {
      setActionLoadingId(notificationId);

      const response = await api.delete(`/Notifications/${notificationId}`);

      toast.success(response.data.message || 'Notification deleted successfully');

      await fetchNotifications();
    } catch (error: any) {
      console.error('Delete notification error:', error);

      const message =
        error.response?.data?.message || 'Failed to delete notification';

      toast.error(message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString();
  };

  const getTypeClass = (type: string) => {
    const lowerType = type.toLowerCase();

    if (lowerType.includes('meeting')) {
      return 'bg-blue-100 text-blue-700';
    }

    if (lowerType.includes('message')) {
      return 'bg-purple-100 text-purple-700';
    }

    if (lowerType.includes('document')) {
      return 'bg-green-100 text-green-700';
    }

    if (lowerType.includes('payment')) {
      return 'bg-yellow-100 text-yellow-700';
    }

    return 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600">
            View and manage your latest platform notifications
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={fetchNotifications}
            className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <RefreshCw size={16} />
            Refresh
          </button>

          <button
            type="button"
            disabled={isMarkingAll || unreadCount === 0}
            onClick={markAllAsRead}
            className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <CheckCheck size={16} />
            Mark All Read
          </button>
        </div>
      </div>

      <Card>
        <CardBody>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-primary-700">
                <Bell size={22} />
              </div>

              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Notification Center
                </h2>
                <p className="text-sm text-gray-600">
                  You have {unreadCount} unread notification
                  {unreadCount === 1 ? '' : 's'}.
                </p>
              </div>
            </div>

            <span className="inline-flex w-fit rounded-full bg-primary-50 px-3 py-1 text-sm font-medium text-primary-700">
              Total: {notifications.length}
            </span>
          </div>
        </CardBody>
      </Card>

      {isLoading ? (
        <Card>
          <CardBody>
            <p className="text-gray-600">Loading notifications...</p>
          </CardBody>
        </Card>
      ) : notifications.length === 0 ? (
        <Card>
          <CardBody>
            <div className="py-10 text-center">
              <Bell size={44} className="mx-auto mb-3 text-gray-400" />

              <h2 className="text-lg font-semibold text-gray-900">
                No notifications found
              </h2>

              <p className="mt-1 text-gray-600">
                Your notifications will appear here.
              </p>
            </div>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <Card key={notification.id}>
              <CardHeader>
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="flex gap-3">
                    <div
                      className={`mt-1 flex h-10 w-10 items-center justify-center rounded-full ${
                        notification.isRead
                          ? 'bg-gray-100 text-gray-500'
                          : 'bg-primary-100 text-primary-700'
                      }`}
                    >
                      {notification.isRead ? (
                        <CheckCircle size={20} />
                      ) : (
                        <Bell size={20} />
                      )}
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-lg font-semibold text-gray-900">
                          {notification.title}
                        </h2>

                        {!notification.isRead && (
                          <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                            New
                          </span>
                        )}

                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${getTypeClass(
                            notification.type
                          )}`}
                        >
                          {notification.type}
                        </span>
                      </div>

                      <p className="mt-1 text-sm text-gray-700">
                        {notification.message}
                      </p>

                      <p className="mt-2 text-xs text-gray-500">
                        {formatDateTime(notification.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {!notification.isRead && (
                      <button
                        type="button"
                        disabled={actionLoadingId === notification.id}
                        onClick={() => markAsRead(notification.id)}
                        className="flex items-center gap-1 rounded-lg border border-green-300 px-3 py-2 text-sm font-medium text-green-700 hover:bg-green-50 disabled:opacity-60"
                      >
                        <CheckCheck size={15} />
                        Mark Read
                      </button>
                    )}

                    <button
                      type="button"
                      disabled={actionLoadingId === notification.id}
                      onClick={() => deleteNotification(notification.id)}
                      className="flex items-center gap-1 rounded-lg border border-red-300 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
                    >
                      <Trash2 size={15} />
                      Delete
                    </button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};