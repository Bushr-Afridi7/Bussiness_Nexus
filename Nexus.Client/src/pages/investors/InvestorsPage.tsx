import React, { useEffect, useState } from 'react';
import { Search, Filter, MapPin } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { InvestorCard } from '../../components/investor/InvestorCard';
import { Investor } from '../../types';
import api from '../../api/api';

type BackendInvestor = {
  id: number;
  fullName: string;
  email: string;
  role: string;
  bio?: string | null;
  location?: string | null;
  createdAt?: string;
};

export const InvestorsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStages, setSelectedStages] = useState<string[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const defaultStages = ['Seed', 'Series A', 'Series B'];
  const defaultInterests = ['FinTech', 'SaaS', 'AI/ML', 'HealthTech', 'CleanTech'];

  useEffect(() => {
    fetchInvestors();
  }, []);

  const mapBackendInvestor = (backendInvestor: BackendInvestor): Investor => {
    return {
      id: backendInvestor.id.toString(),
      name: backendInvestor.fullName,
      email: backendInvestor.email,
      role: 'investor',
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(
        backendInvestor.fullName
      )}&background=random`,
      bio:
        backendInvestor.bio ||
        'Investor interested in promising startup opportunities.',
      investmentInterests: defaultInterests,
      investmentStage: defaultStages,
      portfolioCompanies: [],
      totalInvestments: 0,
      minimumInvestment: '$10K',
      maximumInvestment: '$100K',
      isOnline: true,
      createdAt: backendInvestor.createdAt || new Date().toISOString(),
    };
  };

  const fetchInvestors = async () => {
    try {
      setIsLoading(true);

      const response = await api.get('/Users/investors');

      const backendInvestors: BackendInvestor[] = response.data.users || [];
      const mappedInvestors = backendInvestors.map(mapBackendInvestor);

      setInvestors(mappedInvestors);
    } catch (error) {
      console.error('Failed to fetch investors:', error);
      setInvestors([]);
    } finally {
      setIsLoading(false);
    }
  };

  const allStages = Array.from(
    new Set(investors.flatMap((investor) => investor.investmentStage))
  );

  const allInterests = Array.from(
    new Set(investors.flatMap((investor) => investor.investmentInterests))
  );

  const filteredInvestors = investors.filter((investor) => {
    const matchesSearch =
      searchQuery === '' ||
      investor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      investor.bio.toLowerCase().includes(searchQuery.toLowerCase()) ||
      investor.investmentInterests.some((interest) =>
        interest.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesStages =
      selectedStages.length === 0 ||
      investor.investmentStage.some((stage) => selectedStages.includes(stage));

    const matchesInterests =
      selectedInterests.length === 0 ||
      investor.investmentInterests.some((interest) =>
        selectedInterests.includes(interest)
      );

    return matchesSearch && matchesStages && matchesInterests;
  });

  const toggleStage = (stage: string) => {
    setSelectedStages((prev) =>
      prev.includes(stage)
        ? prev.filter((item) => item !== stage)
        : [...prev, stage]
    );
  };

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((item) => item !== interest)
        : [...prev, interest]
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Find Investors</h1>
        <p className="text-gray-600">
          Connect with investors who match your startup&apos;s needs
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900">Filters</h2>
            </CardHeader>

            <CardBody className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">
                  Investment Stage
                </h3>

                <div className="space-y-2">
                  {allStages.map((stage) => (
                    <button
                      key={stage}
                      type="button"
                      onClick={() => toggleStage(stage)}
                      className={`block w-full text-left px-3 py-2 rounded-md text-sm ${
                        selectedStages.includes(stage)
                          ? 'bg-primary-50 text-primary-700'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {stage}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">
                  Investment Interests
                </h3>

                <div className="flex flex-wrap gap-2">
                  {allInterests.map((interest) => {
                    const isSelected = selectedInterests.includes(interest);

                    return (
                      <button
                        key={interest}
                        type="button"
                        onClick={() => toggleInterest(interest)}
                        className="focus:outline-none"
                      >
                        <Badge
                          variant={isSelected ? 'primary' : 'gray'}
                          className="cursor-pointer"
                        >
                          {interest}
                        </Badge>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">
                  Location
                </h3>

                <div className="space-y-2">
                  <button
                    type="button"
                    className="flex items-center w-full text-left px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <MapPin size={16} className="mr-2" />
                    Pakistan
                  </button>

                  <button
                    type="button"
                    className="flex items-center w-full text-left px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <MapPin size={16} className="mr-2" />
                    Remote
                  </button>

                  <button
                    type="button"
                    className="flex items-center w-full text-left px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <MapPin size={16} className="mr-2" />
                    Global
                  </button>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Main content */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center gap-4">
            <Input
              placeholder="Search investors by name, interests, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              startAdornment={<Search size={18} />}
              fullWidth
            />

            <div className="flex items-center gap-2">
              <Filter size={18} className="text-gray-500" />
              <span className="text-sm text-gray-600">
                {filteredInvestors.length} results
              </span>
            </div>
          </div>

          {isLoading ? (
            <Card>
              <CardBody>
                <p className="text-gray-600">Loading investors...</p>
              </CardBody>
            </Card>
          ) : filteredInvestors.length === 0 ? (
            <Card>
              <CardBody>
                <p className="text-gray-600">
                  No investors found. Please register an investor account first.
                </p>
              </CardBody>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredInvestors.map((investor) => (
                <InvestorCard key={investor.id} investor={investor} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};