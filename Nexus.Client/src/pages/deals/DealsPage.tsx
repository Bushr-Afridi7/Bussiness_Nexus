import React, { useEffect, useState } from 'react';
import {
  CreditCard,
  RefreshCw,
  CheckCircle,
  XCircle,
  RotateCcw,
  DollarSign,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import api from '../../api/api';

type Payment = {
  id: number;
  amount: number;
  currency: string;
  purpose: string;
  paymentMethod: string;
  status: string;
  transactionReference: string;
  createdByUserId: number;
  createdAt: string;
  completedAt?: string | null;
  investorId: number;
  investorName: string;
  entrepreneurId: number;
  entrepreneurName: string;
};

export const DealsPage: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  const [receiverUserId, setReceiverUserId] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [purpose, setPurpose] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Mock Stripe');

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setIsLoading(true);

      const response = await api.get('/Payments/my-payments');

      setPayments(response.data.payments || []);
    } catch (error: any) {
      console.error('Fetch payments error:', error);

      const message =
        error.response?.data?.message || 'Failed to load payments';

      toast.error(message);
      setPayments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const createPayment = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (receiverUserId.trim() === '') {
      toast.error('Please enter receiver user ID');
      return;
    }

    if (amount.trim() === '' || Number(amount) <= 0) {
      toast.error('Please enter valid amount');
      return;
    }

    if (purpose.trim() === '') {
      toast.error('Please enter payment purpose');
      return;
    }

    try {
      setIsCreating(true);

      await api.post('/Payments/create', {
        receiverUserId: Number(receiverUserId),
        amount: Number(amount),
        currency,
        purpose,
        paymentMethod,
      });

      toast.success('Mock payment created successfully');

      setReceiverUserId('');
      setAmount('');
      setCurrency('USD');
      setPurpose('');
      setPaymentMethod('Mock Stripe');

      await fetchPayments();
    } catch (error: any) {
      console.error('Create payment error:', error);

      const message =
        error.response?.data?.message || 'Failed to create payment';

      toast.error(message);
    } finally {
      setIsCreating(false);
    }
  };

  const handlePaymentAction = async (
    paymentId: number,
    action: 'complete' | 'fail' | 'refund'
  ) => {
    try {
      setActionLoadingId(paymentId);

      const response = await api.put(`/Payments/${paymentId}/${action}`);

      toast.success(response.data.message || `Payment ${action} successful`);

      await fetchPayments();
    } catch (error: any) {
      console.error(`Payment ${action} error:`, error);

      const message =
        error.response?.data?.message || `Failed to ${action} payment`;

      toast.error(message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const getStatusClass = (status: string) => {
    if (status === 'Completed') {
      return 'bg-green-100 text-green-700';
    }

    if (status === 'Failed') {
      return 'bg-red-100 text-red-700';
    }

    if (status === 'Refunded') {
      return 'bg-purple-100 text-purple-700';
    }

    return 'bg-yellow-100 text-yellow-700';
  };

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Deals & Payments</h1>
          <p className="text-gray-600">
            Create mock payments and manage investment deal transactions
          </p>
        </div>

        <button
          type="button"
          onClick={fetchPayments}
          className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CreditCard size={20} className="text-primary-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Create Mock Payment
            </h2>
          </div>
        </CardHeader>

        <CardBody>
          <form
            onSubmit={createPayment}
            className="grid grid-cols-1 gap-4 md:grid-cols-5"
          >
            <div>
              <label
                htmlFor="receiver-user-id"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Receiver User ID
              </label>

              <input
                id="receiver-user-id"
                type="number"
                value={receiverUserId}
                onChange={(event) => setReceiverUserId(event.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
                placeholder="e.g. 2"
              />
            </div>

            <div>
              <label
                htmlFor="payment-amount"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Amount
              </label>

              <input
                id="payment-amount"
                type="number"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
                placeholder="5000"
              />
            </div>

            <div>
              <label
                htmlFor="payment-currency"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Currency
              </label>

              <select
                id="payment-currency"
                value={currency}
                onChange={(event) => setCurrency(event.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
              >
                <option value="USD">USD</option>
                <option value="PKR">PKR</option>
                <option value="EUR">EUR</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="payment-method"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Method
              </label>

              <select
                id="payment-method"
                value={paymentMethod}
                onChange={(event) => setPaymentMethod(event.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
              >
                <option value="Mock Stripe">Mock Stripe</option>
                <option value="Mock PayPal">Mock PayPal</option>
                <option value="Mock Bank Transfer">Mock Bank Transfer</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={isCreating}
                className="w-full rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isCreating ? 'Creating...' : 'Create Payment'}
              </button>
            </div>

            <div className="md:col-span-5">
              <label
                htmlFor="payment-purpose"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Purpose
              </label>

              <textarea
                id="payment-purpose"
                value={purpose}
                onChange={(event) => setPurpose(event.target.value)}
                rows={3}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
                placeholder="Seed funding for startup prototype"
              />
            </div>
          </form>

          <p className="mt-3 text-xs text-gray-500">
            Receiver User ID must be the opposite role user. Investor should
            enter Entrepreneur ID, and Entrepreneur should enter Investor ID.
          </p>
        </CardBody>
      </Card>

      {isLoading ? (
        <Card>
          <CardBody>
            <p className="text-gray-600">Loading payments...</p>
          </CardBody>
        </Card>
      ) : payments.length === 0 ? (
        <Card>
          <CardBody>
            <div className="py-10 text-center">
              <DollarSign size={44} className="mx-auto mb-3 text-gray-400" />

              <h2 className="text-lg font-semibold text-gray-900">
                No payments found
              </h2>

              <p className="mt-1 text-gray-600">
                Created mock payments will appear here.
              </p>
            </div>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-4">
          {payments.map((payment) => (
            <Card key={payment.id}>
              <CardBody>
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="flex gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                      <CreditCard size={24} />
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-lg font-semibold text-gray-900">
                          {payment.currency} {payment.amount}
                        </h2>

                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getStatusClass(
                            payment.status
                          )}`}
                        >
                          {payment.status}
                        </span>
                      </div>

                      <p className="mt-1 text-sm text-gray-700">
                        {payment.purpose}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        Investor: {payment.investorName} • Entrepreneur:{' '}
                        {payment.entrepreneurName}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        Method: {payment.paymentMethod} • Ref:{' '}
                        {payment.transactionReference}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        Created at: {formatDateTime(payment.createdAt)}
                      </p>

                      {payment.completedAt && (
                        <p className="mt-1 text-xs text-green-600">
                          Completed at: {formatDateTime(payment.completedAt)}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {payment.status === 'Pending' && (
                      <>
                        <button
                          type="button"
                          disabled={actionLoadingId === payment.id}
                          onClick={() =>
                            handlePaymentAction(payment.id, 'complete')
                          }
                          className="flex items-center gap-1 rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-60"
                        >
                          <CheckCircle size={15} />
                          Complete
                        </button>

                        <button
                          type="button"
                          disabled={actionLoadingId === payment.id}
                          onClick={() =>
                            handlePaymentAction(payment.id, 'fail')
                          }
                          className="flex items-center gap-1 rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
                        >
                          <XCircle size={15} />
                          Fail
                        </button>
                      </>
                    )}

                    {payment.status === 'Completed' && (
                      <button
                        type="button"
                        disabled={actionLoadingId === payment.id}
                        onClick={() =>
                          handlePaymentAction(payment.id, 'refund')
                        }
                        className="flex items-center gap-1 rounded-lg border border-purple-300 px-3 py-2 text-sm font-medium text-purple-700 hover:bg-purple-50 disabled:opacity-60"
                      >
                        <RotateCcw size={15} />
                        Refund
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