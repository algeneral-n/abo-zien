/**
 * RARE 4N - SOS Screen
 * شاشة الطوارئ - Emergency SOS
 * ✅ Cognitive Loop → Kernel → SOS Agent
 */

import { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { RAREKernel } from '../core/RAREKernel';
import { useTheme } from '../hooks/useTheme';
import Icon from '../components/Icon';

export default function SOS() {
  const [isActive, setIsActive] = useState(false);
  const [countdown, setCountdown] = useState(5);
  
  const { theme, colors } = useTheme();
  const kernel = RAREKernel.getInstance();

  useEffect(() => {
    // ✅ الاستماع لنتائج CognitiveLoop → Agent → Response
    const unsubscribeSOS = kernel.on('agent:sos:response', (event) => {
      if (event.data.active !== undefined) {
        setIsActive(event.data.active);
      }
      if (event.data.countdown !== undefined) {
        setCountdown(event.data.countdown);
      }
    });
    
    return () => {
      unsubscribeSOS();
    };
  }, []);

  const handleActivateSOS = () => {
    Alert.alert('تفعيل الطوارئ', 'هل تريد تفعيل نظام الطوارئ؟', [
      { text: 'إلغاء', style: 'cancel' },
      {
        text: 'تفعيل',
        style: 'destructive',
        onPress: () => {
          // ✅ إرسال إلى Kernel → CognitiveLoop
          kernel.emit({
            type: 'user:input',
            data: {
              text: 'activate sos',
              type: 'sos',
            },
            source: 'ui',
          });
        },
      },
    ]);
  };

  const handleDeactivateSOS = () => {
    // ✅ إرسال إلى Kernel → CognitiveLoop
    kernel.emit({
      type: 'user:input',
      data: {
        text: 'deactivate sos',
        type: 'sos',
      },
      source: 'ui',
    });
  };

  return (
    <LinearGradient
      colors={theme.background as [string, string, ...string[]]}
      style={styles.container}
    >
      <View style={styles.header}>
        <Pressable 
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace('/home');
            }
          }} 
          style={styles.backButton}
        >
          <Text style={[styles.backButtonText, { color: colors.primary }]}>←</Text>
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.primary }]}>الطوارئ</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <View style={[styles.sosButtonContainer, { borderColor: isActive ? '#ff0000' : colors.primary }]}>
          {!isActive ? (
            <Pressable
              style={[styles.sosButton, { backgroundColor: '#ff0000' }]}
              onPress={handleActivateSOS}
            >
              <Icon name="emergency" size={48} color="#fff" />
              <Text style={styles.sosButtonText}>تفعيل الطوارئ</Text>
            </Pressable>
          ) : (
            <View style={styles.activeContainer}>
              <Text style={[styles.countdownText, { color: '#ff0000' }]}>{countdown}</Text>
              <Text style={[styles.activeText, { color: colors.text }]}>نظام الطوارئ مفعل</Text>
              <Pressable
                style={[styles.deactivateButton, { borderColor: '#ff0000' }]}
                onPress={handleDeactivateSOS}
              >
                <Text style={[styles.deactivateButtonText, { color: '#ff0000' }]}>إلغاء التفعيل</Text>
              </Pressable>
            </View>
          )}
        </View>

        <View style={[styles.infoCard, { borderColor: colors.primary }]}>
          <Text style={[styles.infoTitle, { color: colors.primary }]}>معلومات الطوارئ</Text>
          <Text style={[styles.infoText, { color: colors.text }]}>
            عند تفعيل نظام الطوارئ، سيتم إرسال إشارة للمساعدة مع موقعك الحالي.
          </Text>
        </View>
      </View>
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
    minWidth: 40,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  sosButtonContainer: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  sosButton: {
    width: 180,
    height: 180,
    borderRadius: 90,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  sosButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  activeContainer: {
    alignItems: 'center',
    gap: 12,
  },
  countdownText: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  activeText: {
    fontSize: 16,
    fontWeight: '600',
  },
  deactivateButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 2,
  },
  deactivateButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  infoCard: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    backgroundColor: 'rgba(255,255,255,0.03)',
    maxWidth: '90%',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'right',
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'right',
  },
});


