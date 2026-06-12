import React, { useState } from 'react';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/api';

interface ScheduleMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  receiverUserId: number;
  receiverName: string;
}

export const ScheduleMeetingModal: React.FC<ScheduleMeetingModalProps> = ({
  isOpen,
  onClose,
  receiverUserId,
  receiverName,
}) => {
  const [title, setTitle] = useState('Startup Investment Discussion');
  const [description, setDescription] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [meetingLink, setMeetingLink] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (title.trim() === '') {
      toast.error('Please enter meeting title');
      return;
    }

    if (scheduledAt === '') {
      toast.error('Please select date and time');
      return;
    }

    try {
      setIsSubmitting(true);

      await api.post('/Meetings/schedule', {
        receiverUserId,
        title,
        description,
        scheduledAt,
        durationMinutes,
        meetingLink,
      });

      toast.success('Meeting scheduled successfully');

      setTitle('Startup Investment Discussion');
      setDescription('');
      setScheduledAt('');
      setDurationMinutes(30);
      setMeetingLink('');

      onClose();
    } catch (error: any) {
      console.error('Schedule meeting error:', error);

      const message =
        error.response?.data?.message || 'Failed to schedule meeting';

      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 px-4">
      <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Schedule Meeting
            </h2>
            <p className="text-sm text-gray-500">
              Set a meeting with {receiverName}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close schedule meeting modal"
            title="Close"
            className="rounded-full p-2 text-gray-500 hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          <div>
            <label
              htmlFor="meeting-title"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Meeting Title
            </label>

            <input
              id="meeting-title"
              name="meetingTitle"
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
              placeholder="Startup Investment Discussion"
            />
          </div>

          <div>
            <label
              htmlFor="meeting-description"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Description
            </label>

            <textarea
              id="meeting-description"
              name="meetingDescription"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
              placeholder="Write a short meeting purpose..."
            />
          </div>

          <div>
            <label
              htmlFor="meeting-date-time"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Date & Time
            </label>

            <input
              id="meeting-date-time"
              name="meetingDateTime"
              type="datetime-local"
              value={scheduledAt}
              onChange={(event) => setScheduledAt(event.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="meeting-duration"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Duration
            </label>

            <select
              id="meeting-duration"
              name="meetingDuration"
              value={durationMinutes}
              onChange={(event) =>
                setDurationMinutes(Number(event.target.value))
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
            >
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={45}>45 minutes</option>
              <option value={60}>60 minutes</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="meeting-link"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Meeting Link
            </label>

            <input
              id="meeting-link"
              name="meetingLink"
              type="text"
              value={meetingLink}
              onChange={(event) => setMeetingLink(event.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
              placeholder="https://meet.google.com/demo-link"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-60"
            >
              {isSubmitting ? 'Scheduling...' : 'Schedule Meeting'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};