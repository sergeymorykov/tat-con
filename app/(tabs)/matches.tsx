import React from 'react';
import { View, Text, StyleSheet, Image, FlatList, TouchableOpacity } from 'react-native';
import { MessageCircle as MessageIcon } from 'lucide-react-native';

interface Match {
  id: string;
  name: string;
  lastMessage: string;
  image: string;
  matchDate: string;
}

const DUMMY_MATCHES: Match[] = [
  {
    id: '1',
    name: 'Emma Wilson',
    lastMessage: 'Hey! Want to join the study group?',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
    matchDate: '2 days ago',
  },
  {
    id: '2',
    name: 'Michael Chen',
    lastMessage: 'The hackathon was amazing!',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400',
    matchDate: '1 week ago',
  },
];

export default function MatchesScreen() {
  const renderMatch = ({ item }: { item: Match }) => (
    <TouchableOpacity style={styles.matchCard}>
      <Image source={{ uri: item.image }} style={styles.avatar} />
      <View style={styles.matchInfo}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.lastMessage} numberOfLines={1}>
          {item.lastMessage}
        </Text>
      </View>
      <View style={styles.rightContent}>
        <Text style={styles.matchDate}>{item.matchDate}</Text>
        <MessageIcon size={20} color="#6366f1" style={styles.messageIcon} />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Matches</Text>
      <FlatList
        data={DUMMY_MATCHES}
        renderItem={renderMatch}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    padding: 20,
    backgroundColor: 'white',
  },
  listContainer: {
    padding: 16,
  },
  matchCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  matchInfo: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  lastMessage: {
    fontSize: 14,
    color: '#666',
  },
  rightContent: {
    alignItems: 'flex-end',
  },
  matchDate: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  messageIcon: {
    marginTop: 4,
  },
});