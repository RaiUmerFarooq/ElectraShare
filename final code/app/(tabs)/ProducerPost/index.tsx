import React from 'react';
import { View, ScrollView, Text } from 'react-native';
import { useProducerPosts } from './hooks/useProducerPosts';
import PostItem from './components/PostItem';
import Loading from './components/Loading';
import styles from './styles';
import AuthCheck from '@/app/validations/AuthCheck';

const ProducerPost: React.FC = () => {
  const { posts, loading, error } = useProducerPosts();

  return (
    <AuthCheck>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>All Producer Posts</Text>
        {loading ? (
          <Loading />
        ) : error ? (
          <Text style={styles.error}>{error}</Text>
        ) : posts.length > 0 ? (
          posts.map((post) => <PostItem key={post.id} post={post} />)
        ) : (
          <Text style={styles.error}>No posts available.</Text>
        )}
      </ScrollView>
    </AuthCheck>
  );
};

export default ProducerPost;