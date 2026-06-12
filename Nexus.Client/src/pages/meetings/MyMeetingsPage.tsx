import React, { useEffect, useState } from 'react';
import { Calendar, Clock, Link as LinkIcon, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import api from '../../api/api';

type Meeting = {
  id: number;
  title: string;
  description?: string | null;
  scheduledAt: string;
  durationMinutes: number;
  meetingLink?: string | null;
  status: string;
  createdByUserId: number;
  createdAt: string;
  investorId: number;
  investorName: string;
  entrepreneurId: number;
  entrepreneurName: string;
};

const MyMeetingsPage: React.FC = () => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    try {
      setIsLoading(true);

      const response = await api.get('/Meetings/my-meetings');

      setMeetings(response.data.meetings || []);
    } catch (error: any) {
      console.error('Fetch meetings error:', error);

      const message =
        error.response?.data?.message || 'Failed to load meetings';

      toast.error(message);
      setMeetings([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMeetingAction = async (
    meetingId: number,
    action: 'accept' | 'reject' | 'cancel'
  ) => {
    try {
      setActionLoadingId(meetingId);

      const response = await api.put(`/Meetings/${meetingId}/${action}`);

      toast.success(response.data.message || `Meeting ${action} successfully`);

      await fetchMeetings();
    } catch (error: any) {
      console.error(`Meeting ${action} error:`, error);

      const message =
        error.response?.data?.message || `Failed to ${action} meeting`;

      toast.error(message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const getStatusClass = (status: string) => {
    if (status === 'Accepted') {
      return 'bg-green-100 text-green-700';
    }

    if (status === 'Rejected') {
      return 'bg-red-100 text-red-700';
    }

    if (status === 'Canceled') {
      return 'bg-gray-100 text-gray-700';
    }

    return 'bg-yellow-100 text-yellow-700';
  };

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Meetings</h1>
          <p className="text-gray-600">
            View, accept, reject, or cancel your scheduled meetings
          </p>
        </div>

        <button
          type="button"
          onClick={fetchMeetings}
          className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {isLoading ? (
        <Card>
          <CardBody>
            <p className="text-gray-600">Loading meetings...</p>
          </CardBody>
        </Card>
      ) : meetings.length === 0 ? (
        <Card>
          <CardBody>
            <div className="py-10 text-center">
              <Calendar size={44} className="mx-auto mb-3 text-gray-400" />

              <h2 className="text-lg font-semibold text-gray-900">
                No meetings found
              </h2>

              <p className="mt-1 text-gray-600">
                Your scheduled meetings will appear here.
              </p>
            </div>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-4">
          {meetings.map((meeting) => (
            <Card key={meeting.id}>
              <CardHeader>
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {meeting.title}
                    </h2>

                    <p className="mt-1 text-sm text-gray-600">
                      Investor: {meeting.investorName} • Entrepreneur:{' '}
                      {meeting.entrepreneurName}
                    </p>
                  </div>

                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getStatusClass(
                      meeting.status
                    )}`}
                  >
                    {meeting.status}
                  </span>
                </div>
              </CardHeader>

              <CardBody>
                <div className="space-y-4">
                  {meeting.description && (
                    <p className="text-sm text-gray-700">
                      {meeting.description}
                    </p>
                  )}

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar size={16} className="mr-2 text-primary-600" />
                      {formatDateTime(meeting.scheduledAt)}
                    </div>

                    <div className="flex items-center text-sm text-gray-600">
                      <Clock size={16} className="mr-2 text-primary-600" />
                      {meeting.durationMinutes} minutes
                    </div>

                    <div className="flex items-center text-sm text-gray-600">
                      <LinkIcon size={16} className="mr-2 text-primary-600" />

                      {meeting.meetingLink ? (
                        <a
                          href={meeting.meetingLink}
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary-600 hover:underline"
                        >
                          Open Meeting Link
                        </a>
                      ) : (
                        <span>No link added</span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 border-t border-gray-100 pt-4">
                    {meeting.status === 'Pending' && (
                      <>
                        <button
                          type="button"
                          disabled={actionLoadingId === meeting.id}
                          onClick={() =>
                            handleMeetingAction(meeting.id, 'accept')
                          }
                          className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-60"
                        >
                          Accept
                        </button>

                        <button
                          type="button"
                          disabled={actionLoadingId === meeting.id}
                          onClick={() =>
                            handleMeetingAction(meeting.id, 'reject')
                          }
                          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
                        >
                          Reject
                        </button>
                      </>
                    )}

                    {meeting.status !== 'Canceled' &&
                      meeting.status !== 'Rejected' && (
                        <button
                          type="button"
                          disabled={actionLoadingId === meeting.id}
                          onClick={() =>
                            handleMeetingAction(meeting.id, 'cancel')
                          }
                          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
                        >
                          Cancel
                        </button>
                      )}
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyMeetingsPage;