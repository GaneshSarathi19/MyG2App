import React, {useEffect, useState, useCallback} from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import ErrorView from '../../components/ErrorView';

interface Post {
  id: number;
  title: string;
  body: string;
}

const API = 'https://jsonplaceholder.typicode.com/posts';

const ListViewScreen = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [elapsedMs, setElapsedMs] = useState<number | null>(null);
  const LIMIT = 10;

  const load = useCallback(async (pageToLoad = 0, replace = false) => {
    setError(null);
    setLoading(true);
    const start = Date.now();
    try {
      const res = await fetch(`${API}?_start=${pageToLoad * LIMIT}&_limit=${LIMIT}`);
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const data: Post[] = await res.json();
      setElapsedMs(Date.now() - start);
      setPosts(prev => (replace ? data : [...prev, ...data]));
      setPage(pageToLoad + 1);
    } catch (e: any) {
      setError(e.message || 'Unknown error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load(0, true);
  }, [load]);

  const onRefresh = () => {
    setRefreshing(true);
    load(0, true);
  };

  const onEndReached = () => {
    if (loading || refreshing) return;
    load(page, false);
  };

  if (error) return <ErrorView message={error} onRetry={() => load(page > 0 ? page - 1 : 0, page === 0)} />;

  return (
    <View style={{ flex: 1 }}>
      <FlatList<Post>
        data={posts}
        ListHeaderComponent={
          <>
            <Text style={styles.heading}>API Data (JSONPlaceholder Posts)</Text>
            {elapsedMs != null && <Text style={styles.sub}>Last fetch: {elapsedMs} ms</Text>}
          </>
        }
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.body}>{item.body}</Text>
          </View>
        )}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.5}
        ListFooterComponent={loading ? <ActivityIndicator style={{ margin: 12 }} /> : null}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    marginHorizontal: 15,
  },

  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 15,
    marginVertical: 8,
    padding: 15,
    borderRadius: 10,
    elevation: 3,
  },

  employeeName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },

  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },

  body: {
    fontSize: 14,
    color: '#555',
  },
});

export default ListViewScreen;