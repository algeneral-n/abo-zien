/**
 * RARE 4N - Council Screen
 * شاشة المجلس - برئاسة رير
 * ✅ Cognitive Loop → Kernel → Council Agent
 */

import { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { RAREKernel } from '../core/RAREKernel';
import { useTheme } from '../hooks/useTheme';
import Icon from '../components/Icon';
import RARECharacter from '../components/RARECharacter';
import NamesTunnel from '../components/NamesTunnel';

export default function Council() {
  const [discussions, setDiscussions] = useState<Array<{ id: string; topic: string; status: 'active' | 'resolved'; participants: string[] }>>([]);
  const [isDebating, setIsDebating] = useState(false);
  
  const { theme, colors } = useTheme();
  const kernel = RAREKernel.getInstance();

  useEffect(() => {
    // ✅ الاستماع لنتائج CognitiveLoop → Agent → Response
    const unsubscribeCouncil = kernel.on('agent:council:response', (event) => {
      if (event.data.discussions) {
        setDiscussions(event.data.discussions);
      }
      if (event.data.status) {
        setIsDebating(event.data.status === 'debating');
      }
    });
    
    return () => {
      unsubscribeCouncil();
    };
  }, []);

  const handleStartDebate = () => {
    // ✅ إرسال إلى Kernel → CognitiveLoop
    kernel.emit({
      type: 'user:input',
      data: {
        text: 'start council debate',
        type: 'council',
      },
      source: 'ui',
    });
  };

  return (
    <LinearGradient
      colors={theme.background as [string, string, ...string[]]}
      style={styles.container}
    >
      <NamesTunnel />
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Icon name="arrow-back" size={20} color={colors.primary} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.primary }]}>المجلس</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.characterContainer}>
          <RARECharacter size={120} animation="speaking" />
          <Text style={[styles.characterTitle, { color: colors.primary }]}>رير - رئيس المجلس</Text>
        </View>

        <View style={[styles.statusCard, { borderColor: colors.primary }]}>
          <Text style={[styles.statusTitle, { color: colors.primary }]}>حالة المجلس</Text>
          <Text style={[styles.statusText, { color: colors.text }]}>
            {isDebating ? 'نقاش نشط' : 'في انتظار النقاش'}
          </Text>
        </View>

        <Pressable
          style={[styles.startButton, { backgroundColor: colors.primary }]}
          onPress={handleStartDebate}
        >
          <Text style={styles.startButtonText}>بدء النقاش</Text>
        </Pressable>

        {discussions.length > 0 && (
          <View style={styles.discussionsContainer}>
            <Text style={[styles.sectionTitle, { color: colors.primary }]}>النقاشات</Text>
            {discussions.map((discussion) => (
              <View
                key={discussion.id}
                style={[styles.discussionCard, { borderColor: colors.primary }]}
              >
                <Text style={[styles.discussionTopic, { color: colors.text }]}>
                  {discussion.topic}
                </Text>
                <Text style={[styles.discussionStatus, { color: colors.textSecondary }]}>
                  {discussion.status === 'active' ? 'نشط' : 'محلول'}
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  scrollContent: {
    padding: 20,
  },
  characterContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  characterTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 10,
  },
  statusCard: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 20,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'right',
  },
  statusText: {
    fontSize: 14,
    textAlign: 'right',
  },
  startButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 30,
  },
  startButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
  discussionsContainer: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    textAlign: 'right',
  },
  discussionCard: {
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  discussionTopic: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    textAlign: 'right',
  },
  discussionStatus: {
    fontSize: 12,
    textAlign: 'right',
  },
});









