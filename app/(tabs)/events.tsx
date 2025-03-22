import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { Calendar as CalendarIcon, MapPin as LocationIcon, Users as AttendeesIcon, ChevronUp as VoteIcon } from 'lucide-react-native';

interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
  attendees: number;
  votes: number;
  image: string;
  tags: string[];
}

const DUMMY_EVENTS: Event[] = [
  {
    id: '1',
    title: 'Web Development Workshop',
    date: '2024-02-15',
    location: 'Tech Lab 101',
    attendees: 24,
    votes: 45,
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400',
    tags: ['Programming', 'Web Dev'],
  },
  {
    id: '2',
    title: 'Photography Walk',
    date: '2024-02-18',
    location: 'Campus Garden',
    attendees: 12,
    votes: 32,
    image: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=400',
    tags: ['Photography', 'Art'],
  },
];

export default function EventsScreen() {
  const renderEvent = ({ item }: { item: Event }) => (
    <TouchableOpacity style={styles.eventCard}>
      <Image source={{ uri: item.image }} style={styles.eventImage} />
      <View style={styles.eventContent}>
        <Text style={styles.eventTitle}>{item.title}</Text>
        
        <View style={styles.eventDetail}>
          <CalendarIcon size={16} color="#666" />
          <Text style={styles.eventDetailText}>{item.date}</Text>
        </View>
        
        <View style={styles.eventDetail}>
          <LocationIcon size={16} color="#666" />
          <Text style={styles.eventDetailText}>{item.location}</Text>
        </View>
        
        <View style={styles.eventFooter}>
          <View style={styles.eventStat}>
            <AttendeesIcon size={14} color="#6366f1" />
            <Text style={styles.eventStatText}>{item.attendees}</Text>
          </View>
          
          <View style={styles.eventStat}>
            <VoteIcon size={14} color="#6366f1" />
            <Text style={styles.eventStatText}>{item.votes}</Text>
          </View>
          
          <View style={styles.tagContainer}>
            {item.tags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Upcoming Events</Text>
        <TouchableOpacity style={styles.createButton}>
          <Text style={styles.createButtonText}>Create Event</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={DUMMY_EVENTS}
        renderItem={renderEvent}
        keyExtractor={item => item.id}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  createButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  createButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
  },
  eventCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  eventImage: {
    width: '100%',
    height: 200,
  },
  eventContent: {
    padding: 16,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  eventDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventDetailText: {
    marginLeft: 8,
    color: '#666',
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eventStat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventStatText: {
    marginLeft: 8,
    color: '#6366f1',
    fontWeight: '600',
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    color: '#4b5563',
    fontSize: 14,
  },
});