import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { ThumbsUp as LikeIcon, ThumbsDown as DislikeIcon } from 'lucide-react-native';
import Animated, { 
  useAnimatedStyle, 
  withSpring,
  useSharedValue,
  withSequence 
} from 'react-native-reanimated';

interface Profile {
  id: string;
  name: string;
  age: number;
  major: string;
  interests: string[];
  image: string;
}

const DUMMY_PROFILE: Profile = {
  id: '1',
  name: 'Sarah Johnson',
  age: 20,
  major: 'Computer Science',
  interests: ['Programming', 'Music', 'Photography'],
  image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400'
};

export default function DiscoverScreen() {
  const [currentProfile] = useState(DUMMY_PROFILE);
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  const handleLike = () => {
    scale.value = withSequence(
      withSpring(1.1),
      withSpring(1)
    );
    // Handle like logic
  };

  const handleDislike = () => {
    scale.value = withSequence(
      withSpring(0.9),
      withSpring(1)
    );
    // Handle dislike logic
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.card, animatedStyle]}>
        <Image source={{ uri: currentProfile.image }} style={styles.image} />
        <View style={styles.info}>
          <Text style={styles.name}>{currentProfile.name}, {currentProfile.age}</Text>
          <Text style={styles.major}>{currentProfile.major}</Text>
          <View style={styles.interests}>
            {currentProfile.interests.map((interest, index) => (
              <View key={index} style={styles.interestTag}>
                <Text style={styles.interestText}>{interest}</Text>
              </View>
            ))}
          </View>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.dislikeButton]} 
            onPress={handleDislike}
          >
            <DislikeIcon size={24} color="#ef4444" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionButton, styles.likeButton]} 
            onPress={handleLike}
          >
            <LikeIcon size={24} color="#10b981" />
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    padding: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
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
  image: {
    width: '100%',
    height: 400,
  },
  info: {
    padding: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  major: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
  },
  interests: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  interestTag: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  interestText: {
    color: '#4b5563',
    fontSize: 14,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
  },
  actionButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
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
  likeButton: {
    backgroundColor: '#dcfce7',
  },
  dislikeButton: {
    backgroundColor: '#fee2e2',
  },
});