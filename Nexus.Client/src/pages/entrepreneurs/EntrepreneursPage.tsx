import React, { useEffect, useState } from 'react';
import { Search, Filter, MapPin } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { EntrepreneurCard } from '../../components/entrepreneur/EntrepreneurCard';
import { Entrepreneur } from '../../types';
import api from '../../api/api';

type BackendEntrepreneur = {
  id: number;
  fullName: string;
  email: string;
  role: string;
  bio?: string | null;
  location?: string | null;
  createdAt?: string;
};

export const EntrepreneursPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [selectedFundingRange, setSelectedFundingRange] = useState<string[]>([]);
  const [entrepreneurs, setEntrepreneurs] = useState<Entrepreneur[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fundingRanges = ['< $500K', '$500K - $1M', '$1M - $5M', '> $5M'];

  useEffect(() => {
    fetchEntrepreneurs();
  }, []);

  const mapBackendEntrepreneur = (
    backendEntrepreneur: BackendEntrepreneur
  ): Entrepreneur => {
    return {
      id: backendEntrepreneur.id.toString(),
      name: backendEntrepreneur.fullName,
      email: backendEntrepreneur.email,
      role: 'entrepreneur',
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(
        backendEntrepreneur.fullName
      )}&background=random`,
      bio:
        backendEntrepreneur.bio ||
        'Entrepreneur building an innovative startup and looking for investment opportunities.',
      isOnline: true,
      createdAt: backendEntrepreneur.createdAt || new Date().toISOString(),

      startupName: `${backendEntrepreneur.fullName.split(' ')[0]} Startup`,
      pitchSummary:
        backendEntrepreneur.bio ||
        'A promising startup looking for strategic investors and growth opportunities.',
      fundingNeeded: '$500K',
      industry: 'Technology',
      location: backendEntrepreneur.location || 'Pakistan',
      foundedYear: 2024,
      teamSize: 5,
    };
  };

  const fetchEntrepreneurs = async () => {
    try {
      setIsLoading(true);

      const response = await api.get('/Users/entrepreneurs');

      const backendEntrepreneurs: BackendEntrepreneur[] =
        response.data.users || [];

      const mappedEntrepreneurs =
        backendEntrepreneurs.map(mapBackendEntrepreneur);

      setEntrepreneurs(mappedEntrepreneurs);
    } catch (error) {
      console.error('Failed to fetch entrepreneurs:', error);
      setEntrepreneurs([]);
    } finally {
      setIsLoading(false);
    }
  };

  const allIndustries = Array.from(
    new Set(entrepreneurs.map((entrepreneur) => entrepreneur.industry))
  );

  const filteredEntrepreneurs = entrepreneurs.filter((entrepreneur) => {
    const matchesSearch =
      searchQuery === '' ||
      entrepreneur.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entrepreneur.startupName
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      entrepreneur.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entrepreneur.pitchSummary
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    const matchesIndustry =
      selectedIndustries.length === 0 ||
      selectedIndustries.includes(entrepreneur.industry);

    const matchesFunding =
      selectedFundingRange.length === 0 ||
      selectedFundingRange.some((range) => {
        const amount = parseInt(
          entrepreneur.fundingNeeded.replace(/[^0-9]/g, '')
        );

        switch (range) {
          case '< $500K':
            return amount < 500;
          case '$500K - $1M':
            return amount >= 500 && amount <= 1000;
          case '$1M - $5M':
            return amount > 1000 && amount <= 5000;
          case '> $5M':
            return amount > 5000;
          default:
            return true;
        }
      });

    return matchesSearch && matchesIndustry && matchesFunding;
  });

  const toggleIndustry = (industry: string) => {
    setSelectedIndustries((prev) =>
      prev.includes(industry)
        ? prev.filter((item) => item !== industry)
        : [...prev, industry]
    );
  };

  const toggleFundingRange = (range: string) => {
    setSelectedFundingRange((prev) =>
      prev.includes(range)
        ? prev.filter((item) => item !== range)
        : [...prev, range]
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Find Startups</h1>
        <p className="text-gray-600">
          Discover promising startups looking for investment
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
                  Industry
                </h3>

                <div className="space-y-2">
                  {allIndustries.map((industry) => (
                    <button
                      key={industry}
                      type="button"
                      onClick={() => toggleIndustry(industry)}
                      className={`block w-full text-left px-3 py-2 rounded-md text-sm ${
                        selectedIndustries.includes(industry)
                          ? 'bg-primary-50 text-primary-700'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {industry}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">
                  Funding Range
                </h3>

                <div className="space-y-2">
                  {fundingRanges.map((range) => (
                    <button
                      key={range}
                      type="button"
                      onClick={() => toggleFundingRange(range)}
                      className={`block w-full text-left px-3 py-2 rounded-md text-sm ${
                        selectedFundingRange.includes(range)
                          ? 'bg-primary-50 text-primary-700'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {range}
                    </button>
                  ))}
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
              placeholder="Search startups by name, industry, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              startAdornment={<Search size={18} />}
              fullWidth
            />

            <div className="flex items-center gap-2">
              <Filter size={18} className="text-gray-500" />
              <span className="text-sm text-gray-600">
                {filteredEntrepreneurs.length} results
              </span>
            </div>
          </div>

          {isLoading ? (
            <Card>
              <CardBody>
                <p className="text-gray-600">Loading startups...</p>
              </CardBody>
            </Card>
          ) : filteredEntrepreneurs.length === 0 ? (
            <Card>
              <CardBody>
                <p className="text-gray-600">
                  No startups found. Please register an entrepreneur account
                  first.
                </p>
              </CardBody>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredEntrepreneurs.map((entrepreneur) => (
                <EntrepreneurCard
                  key={entrepreneur.id}
                  entrepreneur={entrepreneur}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};