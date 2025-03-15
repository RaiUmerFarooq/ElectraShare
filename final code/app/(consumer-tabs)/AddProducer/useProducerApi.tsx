import { useState, useEffect } from 'react';
import apiClient from '@/app/api-component/apiClient';

type Producer = {
  id: string;
  username: string;
  description: string;
  status: string;
};

type RequestStatus = 'idle' | 'loading' | 'pending' | 'accepted' | 'rejected';

export const useProducerApi = () => {
  const [foundProducer, setFoundProducer] = useState<Producer | null>(null);
  const [acceptedProducers, setAcceptedProducers] = useState<Producer[]>([]);
  const [loading, setLoading] = useState(false);
  const [acceptedLoading, setAcceptedLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [requestStatus, setRequestStatus] = useState<RequestStatus>('idle');

  const fetchAcceptedProducers = async () => {
    setAcceptedLoading(true);
    setError('');
    try {
      const response = await apiClient.get('/accepted-producers/');
      const producers = response.data.map((producer: any) => ({
        id: producer.id.toString(),
        username: producer.username,
        description: producer.description || 'No description provided.',
        status: 'accepted',
      }));
      setAcceptedProducers(producers);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch accepted producers.';
      setError(errorMessage);
    } finally {
      setAcceptedLoading(false);
    }
  };

  const searchProducer = async (username: string) => {
    setLoading(true);
    setFoundProducer(null);
    setError('');
    setRequestStatus('idle');
    try {
      const response = await apiClient.post('/users/find/', { username });
      const producer: Producer = {
        id: response.data.id.toString(),
        username: response.data.username,
        description: response.data.description || 'No description provided.',
        status: response.data.status || 'not connected',
      };
      setFoundProducer(producer);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Producer not found.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const sendFriendRequest = async (producerId: string) => {
    setRequestStatus('loading');
    try {
      const response = await apiClient.post('/friend-request/send/', { producer_id: producerId });
      if (response.status === 201) {
        setRequestStatus('pending');
        setFoundProducer((prev) => (prev ? { ...prev, status: 'pending' } : null));
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to send friend request.';
      setRequestStatus('rejected');
      setFoundProducer((prev) => (prev ? { ...prev, status: 'rejected' } : null));
      setError(errorMessage);
    }
  };

  useEffect(() => {
    fetchAcceptedProducers();
  }, []);

  return {
    foundProducer,
    acceptedProducers,
    loading,
    acceptedLoading,
    error,
    requestStatus,
    searchProducer,
    sendFriendRequest,
  };
};