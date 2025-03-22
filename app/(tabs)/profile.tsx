import { EditIcon, SettingsIcon } from 'lucide-react-native';
import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';

const DUMMY_USER = {
  name: 'Alex Thompson',
  major: 'Computer Science',
  year: 'Junior',
  image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2',
  interests: ['Programming', 'Music', 'Photography', 'AI', 'Gaming'],
  connections: 45,
  eventsAttended: 12,
  coffeeChats: 8,
};

const INTEREST_STATS = [
  { name: 'Tech', percent: 40, color: '#6366f1' },
  { name: 'Arts', percent: 25, color: '#8b5cf6' },
  { name: 'Sports', percent: 20, color: '#d946ef' },
  { name: 'Other', percent: 15, color: '#f43f5e' },
];

const CONNECTIONS_DATA = [
  { week: 1, count: 5 },
  { week: 2, count: 12 },
  { week: 3, count: 25 },
  { week: 4, count: 35 },
  { week: 5, count: 45 },
];

export default function ProfileScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.settingsButton}>
          <SettingsIcon size={24} color="#666" />
        </TouchableOpacity>
        <View style={styles.profileHeader}>
          <Image source={{ uri: DUMMY_USER.image }} style={styles.profileImage} />
          <TouchableOpacity style={styles.editButton}>
            <EditIcon size={16} color="white" />
          </TouchableOpacity>
        </View>
        <Text style={styles.name}>{DUMMY_USER.name}</Text>
        <Text style={styles.major}>{DUMMY_USER.major} • {DUMMY_USER.year}</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{DUMMY_USER.connections}</Text>
          <Text style={styles.statLabel}>Connections</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{DUMMY_USER.eventsAttended}</Text>
          <Text style={styles.statLabel}>Events</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{DUMMY_USER.coffeeChats}</Text>
          <Text style={styles.statLabel}>Coffee Chats</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Interests</Text>
        <View style={styles.interests}>
          {DUMMY_USER.interests.map((interest, index) => (
            <View key={index} style={styles.interestTag}>
              <Text style={styles.interestText}>{interest}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Interest Distribution</Text>
        <View style={styles.pieChartContainer}>
          {INTEREST_STATS.map((stat, index) => (
            <View key={index} style={styles.pieChartItem}>
              <View style={[styles.pieChartBar, { width: `${stat.percent}%`, backgroundColor: stat.color }]} />
              <Text style={styles.pieChartLabel}>{stat.name}: {stat.percent}%</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Connection Growth</Text>
        <View style={styles.graphContainer}>
          {CONNECTIONS_DATA.map((data, index) => (
            <View key={index} style={styles.graphItem}>
              <View style={[styles.graphBar, { height: data.count * 2 }]} />
              <Text style={styles.graphLabel}>Week {data.week}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    paddingTop: 40,
    alignItems: 'center',
  },
  settingsButton: {
    position: 'absolute',
    top: 40,
    right: 20,
  },
  profileHeader: {
    position: 'relative',
    marginBottom: 16,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  editButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#6366f1',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  major: {
    fontSize: 16,
    color: '#666',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: 'white',
    marginTop: 1,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6366f1',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  section: {
    backgroundColor: 'white',
    padding: 20,
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  interests: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  interestTag: {
    backgroundColor: '#e0e7ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  interestText: {
    color: '#6366f1',
    fontSize: 14,
  },
  pieChartContainer: {
    marginTop: 10,
  },
  pieChartItem: {
    marginBottom: 10,
  },
  pieChartBar: {
    height: 20,
    borderRadius: 10,
  },
  pieChartLabel: {
    marginTop: 5,
    fontSize: 12,
    color: '#666',
  },
  graphContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 200,
    marginTop: 16,
  },
  graphItem: {
    alignItems: 'center',
    flex: 1,
  },
  graphBar: {
    width: 20,
    backgroundColor: '#6366f1',
    borderRadius: 10,
  },
  graphLabel: {
    marginTop: 5,
    fontSize: 12,
    color: '#666',
  },
});