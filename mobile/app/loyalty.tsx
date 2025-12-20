/**
 * RARE 4N - Loyalty Screen
 * شاشة نظام الولاء - النقاط، المستوى، المكافآت
 * ✅ Cognitive Loop → Kernel → Loyalty Agent
 */

import { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { RAREKernel } from '../core/RAREKernel';
import { useTheme } from '../hooks/useTheme';
import { useKernelAgent } from '../hooks/useKernelAgent';
import Icon from '../components/Icon';

interface LoyaltyPoints {
  total: number;
  level: number;
  nextLevel: number;
  progress: number;
}

interface LoyaltyReward {
  id: string;
  type: string;
  points: number;
  description: string;
  timestamp: number;
}

export default function Loyalty() {
  const [points, setPoints] = useState<LoyaltyPoints>({
    total: 0,
    level: 1,
    nextLevel: 100,
    progress: 0,
  });
  const [rewards, setRewards] = useState<LoyaltyReward[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { theme, colors } = useTheme();
  const kernel = RAREKernel.getInstance();
  const { executeAction: executeLoyaltyAction } = useKernelAgent('loyalty');

  useEffect(() => {
    try {
      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/app/loyalty.tsx:useEffect',message:'Loyalty screen mounted',data:{timestamp:Date.now()},timestamp:Date.now(),sessionId:'loyalty-ui-session',runId:'run1',hypothesisId:'LOYALTY_UI_MOUNT'})}).catch(()=>{});
      }

      const unsubscribeLoyalty = kernel.on('agent:loyalty:response', (event) => {
        if (__DEV__) {
          fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/app/loyalty.tsx:useEffect',message:'LoyaltyAgent response received',data:{hasPoints:!!event.data.points,hasRewards:!!event.data.rewards},timestamp:Date.now(),sessionId:'loyalty-ui-session',runId:'run1',hypothesisId:'LOYALTY_UI_RESPONSE'})}).catch(()=>{});
        }
        try {
          if (event.data.points) setPoints(event.data.points);
          if (event.data.rewards) setRewards(event.data.rewards);
          setLoading(false);
        } catch (updateError: any) {
          console.error('LoyaltyAgent response update error:', updateError);
        }
      });

      const unsubscribeLoyaltyError = kernel.on('agent:loyalty:error', (event) => {
        if (__DEV__) {
          fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/app/loyalty.tsx:useEffect',message:'LoyaltyAgent error received',data:{error:event.data.error},timestamp:Date.now(),sessionId:'loyalty-ui-session',runId:'run1',hypothesisId:'LOYALTY_UI_ERROR'})}).catch(()=>{});
        }
        setError(event.data.error || 'حدث خطأ');
        setLoading(false);
        Alert.alert('خطأ', event.data.error || 'حدث خطأ');
      });

      const unsubscribePointsAdded = kernel.on('loyalty:points_added', (event) => {
        if (__DEV__) {
          fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/app/loyalty.tsx:useEffect',message:'Loyalty points added',data:{points:event.data.points},timestamp:Date.now(),sessionId:'loyalty-ui-session',runId:'run1',hypothesisId:'LOYALTY_POINTS_ADDED'})}).catch(()=>{});
        }
        if (event.data.points) setPoints(event.data.points);
        if (event.data.reward) setRewards(prev => [event.data.reward, ...prev]);
      });

      const unsubscribeLevelUp = kernel.on('loyalty:level_up', (event) => {
        if (__DEV__) {
          fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/app/loyalty.tsx:useEffect',message:'Loyalty level up',data:{level:event.data.level},timestamp:Date.now(),sessionId:'loyalty-ui-session',runId:'run1',hypothesisId:'LOYALTY_LEVEL_UP'})}).catch(()=>{});
        }
        Alert.alert('تهانينا! 🎉', `لقد وصلت إلى المستوى ${event.data.level}!`);
        loadLoyaltyStatus();
      });

      loadLoyaltyStatus();

      return () => {
        unsubscribeLoyalty();
        unsubscribeLoyaltyError();
        unsubscribePointsAdded();
        unsubscribeLevelUp();
      };
    } catch (error: any) {
      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/app/loyalty.tsx:useEffect',message:'Loyalty useEffect error',data:{error:error.message},timestamp:Date.now(),sessionId:'loyalty-ui-session',runId:'run1',hypothesisId:'LOYALTY_UI_EFFECT_ERROR'})}).catch(()=>{});
      }
      console.error('Loyalty useEffect error:', error);
      setError(error.message || 'حدث خطأ');
      setLoading(false);
    }
  }, []);

  const loadLoyaltyStatus = async () => {
    try {
      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/app/loyalty.tsx:loadLoyaltyStatus',message:'Loading loyalty status',data:{timestamp:Date.now()},timestamp:Date.now(),sessionId:'loyalty-ui-session',runId:'run1',hypothesisId:'LOYALTY_LOAD_STATUS'})}).catch(()=>{});
      }
      setLoading(true);
      setError(null);
      await executeLoyaltyAction('loyalty_check', {});
      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/app/loyalty.tsx:loadLoyaltyStatus',message:'Loyalty check action executed',data:{timestamp:Date.now()},timestamp:Date.now(),sessionId:'loyalty-ui-session',runId:'run1',hypothesisId:'LOYALTY_CHECK_EXECUTED'})}).catch(()=>{});
      }
    } catch (error: any) {
      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/app/loyalty.tsx:loadLoyaltyStatus',message:'Load loyalty status error',data:{error:error.message},timestamp:Date.now(),sessionId:'loyalty-ui-session',runId:'run1',hypothesisId:'LOYALTY_LOAD_ERROR'})}).catch(()=>{});
      }
      console.error('Load loyalty status error:', error);
      setError(error.message || 'فشل تحميل حالة الولاء');
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={theme.background as [string, string, ...string[]]} style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Icon name="arrow-back" size={20} color={colors.primary} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.primary }]}>نظام الولاء</Text>
        <View style={{ width: 40 }} />
      </View>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>جاري التحميل...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Icon name="error" size={48} color="#ff4444" />
          <Text style={[styles.errorText, { color: colors.text }]}>{error}</Text>
          <Pressable style={[styles.retryButton, { backgroundColor: colors.primary }]} onPress={loadLoyaltyStatus}>
            <Text style={styles.retryButtonText}>إعادة المحاولة</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={[styles.pointsCard, { borderColor: colors.primary }]}>
            <View style={styles.pointsHeader}>
              <Icon name="star" size={32} color={colors.primary} />
              <View style={styles.pointsInfo}>
                <Text style={[styles.pointsTotal, { color: colors.primary }]}>{points.total.toLocaleString()}</Text>
                <Text style={[styles.pointsLabel, { color: colors.textSecondary }]}>نقطة</Text>
              </View>
            </View>
            <View style={styles.levelInfo}>
              <Text style={[styles.levelText, { color: colors.text }]}>المستوى {points.level}</Text>
              <Text style={[styles.nextLevelText, { color: colors.textSecondary }]}>المستوى التالي: {points.nextLevel} نقطة</Text>
            </View>
            <View style={[styles.progressBar, { backgroundColor: `${colors.primary}20` }]}>
              <View style={[styles.progressFill, { width: `${points.progress * 100}%`, backgroundColor: colors.primary }]} />
            </View>
          </View>
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.primary }]}>المكافآت الأخيرة</Text>
            {rewards.length === 0 ? (
              <View style={[styles.emptyCard, { borderColor: colors.primary }]}>
                <Icon name="gift" size={32} color={colors.textSecondary} />
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>لا توجد مكافآت بعد</Text>
              </View>
            ) : (
              rewards.slice(0, 10).map((reward) => (
                <View key={reward.id} style={[styles.rewardCard, { borderColor: colors.primary }]}>
                  <View style={styles.rewardHeader}>
                    <Icon name="gift" size={20} color={colors.primary} />
                    <Text style={[styles.rewardPoints, { color: colors.primary }]}>+{reward.points}</Text>
                  </View>
                  <Text style={[styles.rewardDescription, { color: colors.text }]}>{reward.description}</Text>
                  <Text style={[styles.rewardDate, { color: colors.textSecondary }]}>{new Date(reward.timestamp).toLocaleDateString('ar-SA')}</Text>
                </View>
              ))
            )}
          </View>
          <View style={styles.actions}>
            <Pressable style={[styles.actionButton, { backgroundColor: colors.primary }]} onPress={loadLoyaltyStatus}>
              <Icon name="refresh" size={20} color="#000" />
              <Text style={styles.actionButtonText}>تحديث</Text>
            </Pressable>
          </View>
        </ScrollView>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20 },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 20 },
  loadingText: { fontSize: 16 },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, gap: 20 },
  errorText: { fontSize: 16, textAlign: 'center' },
  retryButton: { paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8 },
  retryButtonText: { color: '#000', fontSize: 16, fontWeight: '600' },
  scrollContent: { padding: 20 },
  pointsCard: { padding: 20, borderRadius: 16, borderWidth: 2, marginBottom: 20, backgroundColor: 'rgba(255,255,255,0.03)' },
  pointsHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 15 },
  pointsInfo: { flex: 1 },
  pointsTotal: { fontSize: 36, fontWeight: 'bold' },
  pointsLabel: { fontSize: 14 },
  levelInfo: { marginBottom: 15 },
  levelText: { fontSize: 18, fontWeight: '600', marginBottom: 5 },
  nextLevelText: { fontSize: 14 },
  progressBar: { height: 8, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  emptyCard: { padding: 40, borderRadius: 12, borderWidth: 2, alignItems: 'center', justifyContent: 'center', gap: 10 },
  emptyText: { fontSize: 14 },
  rewardCard: { padding: 15, borderRadius: 12, borderWidth: 2, marginBottom: 10, backgroundColor: 'rgba(255,255,255,0.03)' },
  rewardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 10 },
  rewardPoints: { fontSize: 16, fontWeight: '600' },
  rewardDescription: { fontSize: 14, marginBottom: 5 },
  rewardDate: { fontSize: 12 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 20 },
  actionButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 10, gap: 8 },
  actionButtonText: { color: '#000', fontSize: 14, fontWeight: '600' },
});
