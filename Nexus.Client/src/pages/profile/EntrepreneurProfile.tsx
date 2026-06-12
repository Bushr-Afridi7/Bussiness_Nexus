import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Building2, Mail, MapPin, Calendar, Users, ArrowLeft } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import { ScheduleMeetingModal } from '../meetings/ScheduleMeetingModal';
import api from '../../api/api';

type BackendUser = {
  id: number;
  fullName: string;
  email: string;
  role: string;
  bio?: string | null;
  location?: string | null;
  createdAt?: string;
};

export const EntrepreneurProfile: React.FC = () => {
  const { id } = useParams();
  const [entrepreneur, setEntrepreneur] = useState<BackendUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);

  useEffect(() => {
    fetchEntrepreneur();
  }, [id]);

  const fetchEntrepreneur = async () => {
    try {
      setIsLoading(true);

      const response = await api.get(`/Users/${id}`);
      const user: BackendUser = response.data.user;

      if (user.role !== 'Entrepreneur') {
        setEntrepreneur(null);
        return;
      }

      setEntrepreneur(user);
    } catch (error) {
      console.error('Failed to fetch entrepreneur:', error);
      setEntrepreneur(null);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <p className="text-gray-600">Loading startup profile...</p>
      </div>
    );
  }

  if (!entrepreneur) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Startup not found
        </h1>
        <p className="text-gray-600 mb-6">
          The startup profile you&apos;re looking for doesn&apos;t exist or has been removed.
        </p>
        <Link to="/dashboard/entrepreneur">
          <Button variant="outline">Back to Dashboard</Button>
        </Link>
      </div>
    );
  }

  const startupName = `${entrepreneur.fullName.split(' ')[0]} Startup`;

  return (
    <div className="space-y-6 animate-fade-in">
      <Link
        to="/entrepreneurs"
        className="inline-flex items-center text-sm text-primary-600 hover:text-primary-700"
      >
        <ArrowLeft size={16} className="mr-2" />
        Back to Startups
      </Link>

      <Card>
        <CardBody>
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <Avatar
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                entrepreneur.fullName
              )}&background=random`}
              alt={entrepreneur.fullName}
              size="xl"
            />

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-bold text-gray-900">
                  {entrepreneur.fullName}
                </h1>
                <Badge variant="success">Entrepreneur</Badge>
              </div>

              <p className="text-gray-600 mt-2">Founder at {startupName}</p>

              <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <Mail size={16} className="mr-2" />
                  {entrepreneur.email}
                </div>

                <div className="flex items-center">
                  <MapPin size={16} className="mr-2" />
                  {entrepreneur.location || 'Location not added'}
                </div>

                <div className="flex items-center">
                  <Calendar size={16} className="mr-2" />
                  Founded 2024
                </div>

                <div className="flex items-center">
                  <Users size={16} className="mr-2" />
                  5 team members
                </div>
              </div>
            </div>

            <Button onClick={() => setIsMeetingModalOpen(true)}>
              Schedule Meeting
            </Button>
          </div>
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <h2 className="text-lg font-medium text-gray-900">About Startup</h2>
          </CardHeader>
          <CardBody>
            <p className="text-gray-700">
              {entrepreneur.bio ||
                'This entrepreneur is building an innovative startup and looking for investment opportunities.'}
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-medium text-gray-900">Funding</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Current Round</p>
              <p className="text-2xl font-bold text-gray-900">$500K</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Industry</p>
              <Badge variant="primary" className="mt-2">
                Technology
              </Badge>
            </div>

            <div>
              <p className="text-sm text-gray-500">Startup Name</p>
              <p className="font-medium text-gray-900 mt-1">{startupName}</p>
            </div>
          </CardBody>
        </Card>
      </div>

      <ScheduleMeetingModal
        isOpen={isMeetingModalOpen}
        onClose={() => setIsMeetingModalOpen(false)}
        receiverUserId={entrepreneur.id}
        receiverName={entrepreneur.fullName}
      />
    </div>
  );
};