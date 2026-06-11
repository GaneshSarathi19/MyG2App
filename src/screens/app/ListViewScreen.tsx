import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';

interface Post {
  id: number;
  title: string;
  body: string;
}

const ListViewScreen = () => {
  const [posts, setPosts] = useState<Post[]>([]);
const [loading, setLoading] = useState(true);
 useEffect(() => {
  fetch('https://jsonplaceholder.typicode.com/posts')
    .then(response => response.json())
    .then((data: Post[]) => {
      setPosts(data.slice(0, 10));
    })
    .catch(error => {
      console.log('API Error:', error);
    })
    .finally(() => {
      setLoading(false);
    });
}, []);
if (loading) {
  return (
    <View style={styles.loaderContainer}>
      <ActivityIndicator
        size="large"
        color="#1976D2"
      />

      <Text style={styles.loadingText}>
        Loading posts...
      </Text>
    </View>
  );
}
  return (
    <FlatList<Post>
      ListHeaderComponent={
        <>
          <Text style={styles.heading}>
            API Data (JSONPlaceholder Posts)
          </Text>
        </>
      }
      data={posts}
      
      keyExtractor={item => item.id.toString()}
      renderItem={({item}) => (
        <View style={styles.card}>
          <Text style={styles.title}>
            {item.title}
          </Text>

          <Text style={styles.body}>
            {item.body}
          </Text>
        </View>
      )}
    />
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
loaderContainer: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
},

loadingText: {
  marginTop: 15,
  fontSize: 16,
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