import { useState, useEffect } from 'react';
import apiClient from '@/app/api-component/apiClient';

interface Post {
  id: number;
  title: string;
  price: number;
  kilowatts: number;
  start_time: string;
  end_time: string;
  created_at: string;
  producer: string;  // Added producer field
  paid: boolean;     // Added paid status
}

interface UseProducerPostsResult {
  posts: Post[];
  loading: boolean;
  error: string | null;
}

export const useProducerPosts = (): UseProducerPostsResult => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await apiClient.get('/payments/list-all-producer-posts/');
        setPosts(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch producer posts. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  return { posts, loading, error };
};