import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Briefcase, Mail, MapPin, Calendar, ArrowLeft } from 'lucide-react';
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

export const InvestorProfile: React.FC = () => {
  const { id } = useParams();
  const [investor, setInvestor] = useState<BackendUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);

  useEffect(() => {
    fetchInvestor();
  }, [id]);

  const fetchInvestor = async () => {
    try {
      setIsLoading(true);

      const response = await api.get(`/Users/${id}`);
      const user: BackendUser = response.data.user;

      if (user.role !== 'Investor') {
        setInvestor(null);
        return;
      }

      setInvestor(user);
    } catch (error) {
      console.error('Failed to fetch investor:', error);
      setInvestor(null);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <p className="text-gray-600">Loading investor profile...</p>
      </div>
    );
  }

  if (!investor) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Investor not found
        </h1>
        <p className="text-gray-600 mb-6">
          The investor profile you&apos;re looking for doesn&apos;t exist or has been removed.
        </p>
        <Link to="/dashboard/investor">
          <Button variant="outline">Back to Dashboard</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <Link
        to="/investors"
        className="inline-flex items-center text-sm text-primary-600 hover:text-primary-700"
      >
        <ArrowLeft size={16} className="mr-2" />
        Back to Investors
      </Link>

      <Card>
        <CardBody>
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <Avatar
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                investor.fullName
              )}&background=random`}
              alt={investor.fullName}
              size="xl"
            />

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-bold text-gray-900">
                  {investor.fullName}
                </h1>
                <Badge variant="primary">Investor</Badge>
              </div>

              <p className="text-gray-600 mt-2">
                {investor.bio || 'Investor interested in startup opportunities.'}
              </p>

              <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <Mail size={16} className="mr-2" />
                  {investor.email}
                </div>

                <div className="flex items-center">
                  <MapPin size={16} className="mr-2" />
                  {investor.location || 'Location not added'}
                </div>

                <div className="flex items-center">
                  <Calendar size={16} className="mr-2" />
                  Joined{' '}
                  {investor.createdAt
                    ? new Date(investor.createdAt).getFullYear()
                    : '2026'}
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
            <h2 className="text-lg font-medium text-gray-900">About Investor</h2>
          </CardHeader>
          <CardBody>
            <p className="text-gray-700">
              {investor.bio ||
                'This investor is looking for innovative startups and promising business opportunities.'}
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-medium text-gray-900">
              Investment Info
            </h2>
          </CardHeader>

          <CardBody className="space-y-4">
            <div className="flex items-center">
              <Briefcase size={18} className="mr-2 text-primary-600" />
              <span className="text-gray-700">Interested in startups</span>
            </div>

            <div>
              <p className="text-sm text-gray-500">Investment Stages</p>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant="primary">Seed</Badge>
                <Badge variant="primary">Series A</Badge>
                <Badge variant="primary">Series B</Badge>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-500">Investment Interests</p>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant="gray">FinTech</Badge>
                <Badge variant="gray">SaaS</Badge>
                <Badge variant="gray">AI/ML</Badge>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      <ScheduleMeetingModal
        isOpen={isMeetingModalOpen}
        onClose={() => setIsMeetingModalOpen(false)}
        receiverUserId={investor.id}
        receiverName={investor.fullName}
      />
    </div>
  );
};