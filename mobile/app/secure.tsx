/**
 * RARE 4N - Security Screen
 * ???????? ???????????? - Security & SOS
 * ??? Cognitive Loop ??? Kernel ??? Security Agent
 */

import { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { RAREKernel } from '../core/RAREKernel';
import { useTheme } from '../hooks/useTheme';
import Icon from '../components/Icon';

export default function Secure() {
  const [securityStatus, setSecurityStatus] = useState<'secure' | 'warning' | 'danger'>('secure');
  const [threats, setThreats] = useState<Array<{ id: string; type: string; severity: string; time: string }>>([]);
  
  const { theme, colors } = useTheme();
  const kernel = RAREKernel.getInstance();

  useEffect(() => {
    // ??? ???????????????? ???????????? CognitiveLoop ??? Agent ??? Response
    const unsubscribeSecurity = kernel.on('agent:security:response', (event) => {
      if (event.data.status) {
        setSecurityStatus(event.data.status);
      }
      if (event.data.threats) {
        setThreats(event.data.threats);
      }
    });
    
    return () => {
      unsubscribeSecurity();
    };
  }, []);

  const handleScan = () => {
    // ??? ?????????? ?????? Kernel ??? CognitiveLoop
    kernel.emit({
      type: 'user:input',
      data: {
        text: 'scan security',
        type: 'security',
      },
      source: 'ui',
    });
  };

  const handleLock = () => {
    Alert.alert('?????? ????????????', '???? ???????? ?????? ??????????????', [
      { text: '??????????', style: 'cancel' },
      {
        text: '??????',
        onPress: () => {
          // ??? ?????????? ?????? Kernel ??? CognitiveLoop
          kernel.emit({
            type: 'user:input',
            data: {
              text: 'lock system',
              type: 'security',
            },
            source: 'ui',
          });
        },
      },
    ]);
  };

  return (
    <LinearGradient
      colors={theme.background as [string, string, ...string[]]}
      style={styles.container}
    >
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Icon name="arrow-back" size={20} color={colors.primary} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.primary }]}>????????????</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[
          styles.statusCard,
          {
            borderColor: securityStatus === 'secure' ? '#00ff00' : securityStatus === 'warning' ? '#ffaa00' : '#ff0000',
            bREMOVED: securityStatus === 'secure' ? 'rgba(0,255,0,0.1)' : securityStatus === 'warning' ? 'rgba(255,170,0,0.1)' : 'rgba(255,0,0,0.1)',
          },
        ]}>
          <Text style={[styles.statusTitle, { color: colors.primary }]}>???????? ????????????</Text>
          <Text style={[styles.statusText, { color: colors.text }]}>
            {securityStatus === 'secure' ? '??????' : securityStatus === 'warning' ? '??????????' : '??????'}
          </Text>
        </View>

        <Pressable
          style={[styles.scanButton, { bREMOVED: colors.primary }]}
          onPress={handleScan}
        >
          <Icon name="scan" size={20} color="#000" />
          <Text style={styles.scanButtonText}>?????? ????????????</Text>
        </Pressable>

        <Pressable
          style={[styles.lockButton, { borderColor: '#ff4444' }]}
          onPress={handleLock}
        >
          <Icon name="lock" size={20} color="#ff4444" />
          <Text style={[styles.lockButtonText, { color: '#ff4444' }]}>?????? ????????????</Text>
        </Pressable>

        {threats.length > 0 && (
          <View style={styles.threatsSection}>
            <Text style={[styles.sectionTitle, { color: colors.primary }]}>?????????????????? ({threats.length})</Text>
            {threats.map((threat) => (
              <View
                key={threat.id}
                style={[styles.threatCard, { borderColor: colors.primary }]}
              >
                <Text style={[styles.threatType, { color: colors.text }]}>{threat.type}</Text>
                <Text style={[styles.threatSeverity, { color: colors.textSecondary }]}>
                  {threat.severity} ??? {threat.time}
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
  statusCard: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 20,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'right',
  },
  statusText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    marginBottom: 12,
  },
  scanButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
  lockButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    gap: 8,
    marginBottom: 30,
  },
  lockButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  threatsSection: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    textAlign: 'right',
  },
  threatCard: {
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    bREMOVED: 'rgba(255,255,255,0.03)',
  },
  threatType: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
    textAlign: 'right',
  },
  threatSeverity: {
    fontSize: 12,
    textAlign: 'right',
  },
});










