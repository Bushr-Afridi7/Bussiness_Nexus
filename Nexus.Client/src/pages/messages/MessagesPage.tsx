import React, { useEffect, useState } from 'react';
import { MessageCircle, RefreshCw, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Card, CardBody } from '../../components/ui/Card';
import api from '../../api/api';

type ChatUser = {
  userId: number;
  fullName: string;
  email: string;
  role: string;
  lastMessage: string;
  lastMessageAt?: string | null;
  unreadCount: number;
};

export const MessagesPage: React.FC = () => {
  const navigate = useNavigate();

  const [chats, setChats] = useState<ChatUser[]>([]);
  const [filteredChats, setFilteredChats] = useState<ChatUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchChats();
  }, []);

  useEffect(() => {
    const query = searchQuery.toLowerCase();

    const result = chats.filter(
      (chat) =>
        chat.fullName.toLowerCase().includes(query) ||
        chat.email.toLowerCase().includes(query) ||
        chat.role.toLowerCase().includes(query) ||
        chat.lastMessage.toLowerCase().includes(query)
    );

    setFilteredChats(result);
  }, [searchQuery, chats]);

  const fetchChats = async () => {
    try {
      setIsLoading(true);

      const response = await api.get('/Messages/my-chats');

      setChats(response.data.chats || []);
      setFilteredChats(response.data.chats || []);
    } catch (error: any) {
      console.error('Fetch chats error:', error);

      const message = error.response?.data?.message || 'Failed to load chats';
      toast.error(message);

      setChats([]);
      setFilteredChats([]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDateTime = (dateTime?: string | null) => {
    if (!dateTime) {
      return '';
    }

    return new Date(dateTime).toLocaleString();
  };

  const openChat = (userId: number) => {
    navigate(`/chat/${userId}`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
          <p className="text-gray-600">
            View your conversations with investors and entrepreneurs
          </p>
        </div>

        <button
          type="button"
          onClick={fetchChats}
          className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      <Card>
        <CardBody>
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-2.5 text-gray-400"
            />

            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search conversations..."
              className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-3 text-sm focus:border-primary-500 focus:outline-none"
            />
          </div>
        </CardBody>
      </Card>

      {isLoading ? (
        <Card>
          <CardBody>
            <p className="text-gray-600">Loading chats...</p>
          </CardBody>
        </Card>
      ) : filteredChats.length === 0 ? (
        <Card>
          <CardBody>
            <div className="py-10 text-center">
              <MessageCircle size={44} className="mx-auto mb-3 text-gray-400" />

              <h2 className="text-lg font-semibold text-gray-900">
                No chats found
              </h2>

              <p className="mt-1 text-gray-600">
                Start a chat from an investor or startup profile.
              </p>
            </div>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredChats.map((chat) => (
            <button
              key={chat.userId}
              type="button"
              onClick={() => openChat(chat.userId)}
              className="w-full text-left"
            >
              <Card hoverable>
                <CardBody>
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700">
                      {chat.fullName
                        .split(' ')
                        .map((part) => part[0])
                        .join('')
                        .substring(0, 2)
                        .toUpperCase()}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <h2 className="truncate text-base font-semibold text-gray-900">
                          {chat.fullName}
                        </h2>

                        <span className="text-xs text-gray-500">
                          {formatDateTime(chat.lastMessageAt)}
                        </span>
                      </div>

                      <p className="mt-1 text-xs font-medium capitalize text-primary-600">
                        {chat.role}
                      </p>

                      <p className="mt-1 truncate text-sm text-gray-600">
                        {chat.lastMessage || 'No message preview'}
                      </p>
                    </div>

                    {chat.unreadCount > 0 && (
                      <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-primary-600 px-2 text-xs font-semibold text-white">
                        {chat.unreadCount}
                      </span>
                    )}
                  </div>
                </CardBody>
              </Card>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};