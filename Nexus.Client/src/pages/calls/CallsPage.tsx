import React, { useEffect, useState } from 'react';
import {
  Phone,
  Video,
  RefreshCw,
  ExternalLink,
  CheckCircle,
  XCircle,
  PhoneOff,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Card, CardBody } from '../../components/ui/Card';
import api from '../../api/api';

type CallSession = {
  id: number;
  callerUserId: number;
  callerName: string;
  receiverUserId: number;
  receiverName: string;
  callType: string;
  status: string;
  roomName: string;
  callLink: string;
  startedAt: string;
  endedAt?: string | null;
};

export const CallsPage: React.FC = () => {
  const [calls, setCalls] = useState<CallSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  useEffect(() => {
    fetchCalls();
  }, []);

  const fetchCalls = async () => {
    try {
      setIsLoading(true);

      const response = await api.get('/Calls/my-calls');

      setCalls(response.data.calls || []);
    } catch (error: any) {
      console.error('Fetch calls error:', error);

      const message = error.response?.data?.message || 'Failed to load calls';
      toast.error(message);
      setCalls([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCallAction = async (
    callId: number,
    action: 'accept' | 'reject' | 'end'
  ) => {
    try {
      setActionLoadingId(callId);

      const response = await api.put(`/Calls/${callId}/${action}`);

      toast.success(response.data.message || `Call ${action} successfully`);

      await fetchCalls();
    } catch (error: any) {
      console.error(`Call ${action} error:`, error);

      const message =
        error.response?.data?.message || `Failed to ${action} call`;

      toast.error(message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const openCallLink = (callLink: string) => {
    window.open(callLink, '_blank');
  };

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString();
  };

  const getStatusClass = (status: string) => {
    if (status === 'Accepted') {
      return 'bg-green-100 text-green-700';
    }

    if (status === 'Rejected') {
      return 'bg-red-100 text-red-700';
    }

    if (status === 'Ended') {
      return 'bg-gray-100 text-gray-700';
    }

    return 'bg-yellow-100 text-yellow-700';
  };

  const getCallIcon = (callType: string) => {
    if (callType === 'Video') {
      return <Video size={24} />;
    }

    return <Phone size={24} />;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Call History</h1>
          <p className="text-gray-600">
            Manage your audio and video call sessions
          </p>
        </div>

        <button
          type="button"
          onClick={fetchCalls}
          className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {isLoading ? (
        <Card>
          <CardBody>
            <p className="text-gray-600">Loading calls...</p>
          </CardBody>
        </Card>
      ) : calls.length === 0 ? (
        <Card>
          <CardBody>
            <div className="py-10 text-center">
              <Phone size={44} className="mx-auto mb-3 text-gray-400" />

              <h2 className="text-lg font-semibold text-gray-900">
                No calls found
              </h2>

              <p className="mt-1 text-gray-600">
                Start an audio or video call from the chat page.
              </p>
            </div>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-4">
          {calls.map((call) => (
            <Card key={call.id}>
              <CardBody>
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="flex gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                      {getCallIcon(call.callType)}
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-lg font-semibold text-gray-900">
                          {call.callType} Call
                        </h2>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusClass(
                            call.status
                          )}`}
                        >
                          {call.status}
                        </span>
                      </div>

                      <p className="mt-1 text-sm text-gray-700">
                        Caller: {call.callerName} • Receiver:{' '}
                        {call.receiverName}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        Room: {call.roomName}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        Started: {formatDateTime(call.startedAt)}
                      </p>

                      {call.endedAt && (
                        <p className="mt-1 text-xs text-gray-500">
                          Ended: {formatDateTime(call.endedAt)}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => openCallLink(call.callLink)}
                      className="flex items-center gap-1 rounded-lg bg-primary-600 px-3 py-2 text-sm font-medium text-white hover:bg-primary-700"
                    >
                      <ExternalLink size={15} />
                      Join
                    </button>

                    {call.status === 'Started' && (
                      <>
                        <button
                          type="button"
                          disabled={actionLoadingId === call.id}
                          onClick={() => handleCallAction(call.id, 'accept')}
                          className="flex items-center gap-1 rounded-lg border border-green-300 px-3 py-2 text-sm font-medium text-green-700 hover:bg-green-50 disabled:opacity-60"
                        >
                          <CheckCircle size={15} />
                          Accept
                        </button>

                        <button
                          type="button"
                          disabled={actionLoadingId === call.id}
                          onClick={() => handleCallAction(call.id, 'reject')}
                          className="flex items-center gap-1 rounded-lg border border-red-300 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
                        >
                          <XCircle size={15} />
                          Reject
                        </button>
                      </>
                    )}

                    {call.status !== 'Ended' && call.status !== 'Rejected' && (
                      <button
                        type="button"
                        disabled={actionLoadingId === call.id}
                        onClick={() => handleCallAction(call.id, 'end')}
                        className="flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
                      >
                        <PhoneOff size={15} />
                        End
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