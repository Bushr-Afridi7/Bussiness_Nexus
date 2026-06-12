import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  Send,
  RefreshCw,
  MessageCircle,
  Phone,
  Video,
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Card, CardBody } from '../../components/ui/Card';
import api from '../../api/api';

type ChatMessage = {
  id: number;
  senderUserId: number;
  senderName: string;
  receiverUserId: number;
  receiverName: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  isMine: boolean;
};

type OtherUser = {
  id: number;
  fullName: string;
  email: string;
  role: string;
};

type CallType = 'Audio' | 'Video';

export const ChatPage: React.FC = () => {
  const { userId } = useParams();
  const navigate = useNavigate();

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [otherUser, setOtherUser] = useState<OtherUser | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [startingCallType, setStartingCallType] = useState<CallType | null>(
    null
  );

  useEffect(() => {
    if (userId) {
      fetchConversation();
    } else {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchConversation = async () => {
    if (!userId) {
      return;
    }

    try {
      setIsLoading(true);

      const response = await api.get(`/Messages/conversation/${userId}`);

      setOtherUser(response.data.otherUser || null);
      setMessages(response.data.messages || []);
    } catch (error: any) {
      console.error('Fetch conversation error:', error);

      const message =
        error.response?.data?.message || 'Failed to load conversation';

      toast.error(message);
      setMessages([]);
      setOtherUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!userId) {
      toast.error('Please select a user first');
      return;
    }

    if (newMessage.trim() === '') {
      toast.error('Please write a message');
      return;
    }

    try {
      setIsSending(true);

      await api.post('/Messages/send', {
        receiverUserId: Number(userId),
        content: newMessage,
      });

      setNewMessage('');

      await fetchConversation();
    } catch (error: any) {
      console.error('Send message error:', error);

      const message = error.response?.data?.message || 'Failed to send message';

      toast.error(message);
    } finally {
      setIsSending(false);
    }
  };

  const startCall = async (callType: CallType) => {
    if (!userId) {
      toast.error('Please select a user first');
      return;
    }

    let callWindow: Window | null = null;

    try {
      setStartingCallType(callType);

      callWindow = window.open('', '_blank');

      const response = await api.post('/Calls/start', {
        receiverUserId: Number(userId),
        callType: callType,
      });

      const callLink = response.data.callSession?.callLink;

      toast.success(response.data.message || `${callType} call started`);

      if (callLink) {
        if (callWindow) {
          callWindow.location.href = callLink;
        } else {
          window.open(callLink, '_blank');
        }
      } else {
        callWindow?.close();
        toast.error('Call link not found');
      }
    } catch (error: any) {
      callWindow?.close();

      console.error('Start call error:', error);

      const message = error.response?.data?.message || 'Failed to start call';

      toast.error(message);
    } finally {
      setStartingCallType(null);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
    });
  };

  const formatTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!userId) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Chat</h1>
          <p className="text-gray-600">Select a conversation to start chatting</p>
        </div>

        <Card>
          <CardBody>
            <div className="py-12 text-center">
              <MessageCircle size={48} className="mx-auto mb-3 text-gray-400" />

              <h2 className="text-lg font-semibold text-gray-900">
                No conversation selected
              </h2>

              <p className="mt-1 text-gray-600">
                Go to Messages page and select a chat.
              </p>

              <button
                type="button"
                onClick={() => navigate('/messages')}
                className="mt-5 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
              >
                Open Messages
              </button>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/messages')}
          className="flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700"
        >
          <ArrowLeft size={16} />
          Back to Messages
        </button>

        <button
          type="button"
          onClick={fetchConversation}
          className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      <Card>
        <CardBody>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700">
                {otherUser?.fullName
                  ? otherUser.fullName
                      .split(' ')
                      .map((part) => part[0])
                      .join('')
                      .substring(0, 2)
                      .toUpperCase()
                  : 'U'}
              </div>

              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {otherUser?.fullName || 'Conversation'}
                </h1>

                <p className="text-sm capitalize text-gray-600">
                  {otherUser?.role || 'User'} • {otherUser?.email || ''}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={startingCallType !== null}
                onClick={() => startCall('Audio')}
                className="flex items-center gap-2 rounded-lg border border-green-300 px-4 py-2 text-sm font-medium text-green-700 hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Phone size={16} />
                {startingCallType === 'Audio' ? 'Starting...' : 'Audio Call'}
              </button>

              <button
                type="button"
                disabled={startingCallType !== null}
                onClick={() => startCall('Video')}
                className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Video size={16} />
                {startingCallType === 'Video' ? 'Starting...' : 'Video Call'}
              </button>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <div className="flex h-[430px] flex-col">
            <div className="flex-1 space-y-3 overflow-y-auto rounded-lg bg-gray-50 p-4">
              {isLoading ? (
                <p className="text-center text-gray-600">Loading messages...</p>
              ) : messages.length === 0 ? (
                <div className="flex h-full items-center justify-center text-center">
                  <div>
                    <MessageCircle
                      size={44}
                      className="mx-auto mb-3 text-gray-400"
                    />

                    <h2 className="text-lg font-semibold text-gray-900">
                      No messages yet
                    </h2>

                    <p className="mt-1 text-gray-600">
                      Send your first message.
                    </p>
                  </div>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.isMine ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                        message.isMine
                          ? 'bg-primary-600 text-white'
                          : 'bg-white text-gray-900 shadow-sm'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>

                      <p
                        className={`mt-1 text-[11px] ${
                          message.isMine ? 'text-primary-100' : 'text-gray-400'
                        }`}
                      >
                        {formatTime(message.createdAt)}
                      </p>
                    </div>
                  </div>
                ))
              )}

              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={sendMessage} className="mt-4 flex gap-3">
              <input
                type="text"
                value={newMessage}
                onChange={(event) => setNewMessage(event.target.value)}
                placeholder="Type your message..."
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-primary-500 focus:outline-none"
              />

              <button
                type="submit"
                disabled={isSending}
                className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-60"
              >
                <Send size={16} />
                {isSending ? 'Sending...' : 'Send'}
              </button>
            </form>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};