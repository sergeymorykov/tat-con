import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Coffee as CoffeeIcon, Clock as ClockIcon } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { 
  useAnimatedStyle, 
  withSpring,
  useSharedValue 
} from 'react-native-reanimated';

interface MatchedUser {
  name: string;
  major: string;
  interests: string[];
  image: string;
}

export default function RandomCoffeeScreen() {
  const [isMatching, setIsMatching] = useState(false);
  const [matchedUser, setMatchedUser] = useState<MatchedUser | null>(null);
  const [timer, setTimer] = useState(900); // 15 minutes in seconds
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (matchedUser && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [matchedUser, timer]);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleStartMatching = () => {
    setIsMatching(true);
    scale.value = withSpring(1.1);
    
    // Simulate matching delay
    setTimeout(() => {
      setMatchedUser({
        name: 'Alex Thompson',
        major: 'Data Science',
        interests: ['AI', 'Coffee', 'Chess'],
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400'
      });
      setIsMatching(false);
      scale.value = withSpring(1);
    }, 2000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Random Coffee</Text>
      <Text style={styles.subtitle}>
        Get matched with a random student for a coffee chat!
      </Text>
      
      {!matchedUser ? (
        <Animated.View style={[styles.matchContainer, animatedStyle]}>
          <CoffeeIcon size={80} color="#6366f1" style={styles.coffeeIcon} />
          <TouchableOpacity 
            style={[styles.matchButton, isMatching && styles.matchingButton]}
            onPress={handleStartMatching}
            disabled={isMatching}
          >
            <Text style={styles.matchButtonText}>
              {isMatching ? 'Finding match...' : 'Find a coffee buddy'}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      ) : (
        <View style={styles.matchedContainer}>
          <Text style={styles.matchedTitle}>You've been matched!</Text>
          <Image source={{ uri: matchedUser.image }} style={styles.userImage} />
          <Text style={styles.userName}>{matchedUser.name}</Text>
          <Text style={styles.userMajor}>{matchedUser.major}</Text>
          
          <View style={styles.interestContainer}>
            {matchedUser.interests.map((interest, index) => (
              <View key={index} style={styles.interestTag}>
                <Text style={styles.interestText}>{interest}</Text>
              </View>
            ))}
          </View>
          
          <View style={styles.timerContainer}>
            <ClockIcon size={20} color="#666" />
            <Text style={styles.timerText}>
              Chat window: {formatTime(timer)}
            </Text>
          </View>
          
          <TouchableOpacity style={styles.chatButton}>
            <Text style={styles.chatButtonText}>Start Chat</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  subtitle: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  matchContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  coffeeIcon: {
    marginBottom: 20,
  },
  matchButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 25,
  },
  matchingButton: {
    backgroundColor: '#e0e7ff',
  },
  matchButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  matchedContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  matchedTitle: {
    marginBottom: 20,
    fontSize: 24,
    fontWeight: 'bold',
  },
  userImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userMajor: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  interestContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
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
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  timerText: {
    marginLeft: 8,
    fontSize: 18,
    color: '#6366f1',
    fontWeight: '600',
  },
  chatButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 25,
  },
  chatButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});