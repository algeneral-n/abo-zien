/**
 * RARE 4N - Supreme Access Screen
 * ???????? ???????????? ???????????? - Ultimate Assistant
 * ??? ???????????? ?????????????????????? ???????????????? ?????? Multi-Tenant
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
import NamesTunnel from '../components/NamesTunnel';
import RARECharacter from '../components/RARECharacter';
import { LoginTracker } from '../core/services/LoginTracker';

export default function SupremeAccess() {
  const [supremeAccess, setSupremeAccess] = useState<any>(null);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [securityAlerts, setSecurityAlerts] = useState<any[]>([]);
  const [loginStats, setLoginStats] = useState<any>(null);
  const [loginAttempts, setLoginAttempts] = useState<any[]>([]);
  
  const { theme, colors } = useTheme();
  const kernel = RAREKernel.getInstance();
  const loginTracker = LoginTracker.getInstance();

  useEffect(() => {
    loadSupremeAccessData();
    loadLoginTracking();
    
    // Listen for Ultimate Assistant events
    const unsubscribe = kernel.on('ultimate:security_alert', (event) => {
      setSecurityAlerts(prev => [event.data, ...prev].slice(0, 50));
    });
    
    return () => {
      unsubscribe();
    };
  }, []);

  const loadSupremeAccessData = async () => {
    try {
      // Get Ultimate Assistant instance
      // This would be accessed through Kernel in production
      // For now, we'll use mock data
      setSupremeAccess({
        enabled: true,
        bypassSubscription: true,
        bypassTenantIsolation: true,
        crossTenantAccess: true,
        fullSystemAccess: true,
      });

      setSubscriptions([
        {
          tenantId: 'tenant_1',
          subscriptionTier: 'enterprise',
          status: 'active',
          expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
        },
      ]);

      setSecurityAlerts([
        {
          id: 'alert_1',
          type: 'anomaly',
          severity: 'low',
          message: 'Unusual access pattern detected',
          timestamp: Date.now(),
        },
      ]);
    } catch (error) {
      console.error('Error loading Supreme Access data:', error);
    }
  };

  const loadLoginTracking = () => {
    try {
      const stats = loginTracker.getLoginStatistics();
      const attempts = loginTracker.getLoginAttempts(50);
      
      setLoginStats(stats);
      setLoginAttempts(attempts);
    } catch (error) {
      console.error('Error loading login tracking:', error);
    }
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
        <Text style={[styles.headerTitle, { color: colors.primary }]}>
          Supreme Access
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.charREMOVED}>
          <RARECharacter size={150} animation="idle" />
          <Text style={[styles.characterTitle, { color: colors.primary }]}>
            Ultimate Assistant
          </Text>
        </View>

        {/* Supreme Access Status */}
        {supremeAccess && (
          <View style={[styles.statusCard, { borderColor: colors.primary }]}>
            <Text style={[styles.cardTitle, { color: colors.primary }]}>
              Supreme Access Status
            </Text>
            <View style={styles.statusRow}>
              <Text style={[styles.statusLabel, { color: colors.text }]}>Enabled:</Text>
              <Text style={[styles.statusValue, { color: supremeAccess.enabled ? '#00ff00' : '#ff0000' }]}>
                {supremeAccess.enabled ? '??? Yes' : '??? No'}
              </Text>
            </View>
            <View style={styles.statusRow}>
              <Text style={[styles.statusLabel, { color: colors.text }]}>Bypass Subscription:</Text>
              <Text style={[styles.statusValue, { color: supremeAccess.bypassSubscription ? '#00ff00' : '#ff0000' }]}>
                {supremeAccess.bypassSubscription ? '???' : '???'}
              </Text>
            </View>
            <View style={styles.statusRow}>
              <Text style={[styles.statusLabel, { color: colors.text }]}>Cross-Tenant Access:</Text>
              <Text style={[styles.statusValue, { color: supremeAccess.crossTenantAccess ? '#00ff00' : '#ff0000' }]}>
                {supremeAccess.crossTenantAccess ? '???' : '???'}
              </Text>
            </View>
          </View>
        )}

        {/* Subscriptions Monitor */}
        <View style={[styles.card, { borderColor: colors.primary }]}>
          <Text style={[styles.cardTitle, { color: colors.primary }]}>
            Subscriptions Monitor ({subscriptions.length})
          </Text>
          {subscriptions.map((sub, index) => (
            <View key={index} style={[styles.subscriptionItem, { borderColor: colors.primary }]}>
              <Text style={[styles.subscriptionTier, { color: colors.text }]}>
                {sub.subscriptionTier.toUpperCase()}
              </Text>
              <Text style={[styles.subscriptionStatus, { color: colors.textSecondary }]}>
                {sub.status} - Tenant: {sub.tenantId}
              </Text>
              <Text style={[styles.subscriptionExpiry, { color: colors.textSecondary }]}>
                Expires: {new Date(sub.expiresAt).toLocaleDateString()}
              </Text>
            </View>
          ))}
        </View>

        {/* Login Tracking */}
        {loginStats && (
          <View style={[styles.card, { borderColor: colors.primary }]}>
            <Text style={[styles.cardTitle, { color: colors.primary }]}>
              Login Tracking
            </Text>
            <View style={styles.statsRow}>
              <Text style={[styles.statsLabel, { color: colors.text }]}>Total Attempts:</Text>
              <Text style={[styles.statsValue, { color: colors.primary }]}>
                {loginStats.totalAttempts}
              </Text>
            </View>
            <View style={styles.statsRow}>
              <Text style={[styles.statsLabel, { color: colors.text }]}>Successful:</Text>
              <Text style={[styles.statsValue, { color: '#00ff00' }]}>
                {loginStats.successfulAttempts} ({loginStats.successRate.toFixed(1)}%)
              </Text>
            </View>
            <View style={styles.statsRow}>
              <Text style={[styles.statsLabel, { color: colors.text }]}>Failed:</Text>
              <Text style={[styles.statsValue, { color: '#ff0000' }]}>
                {loginStats.failedAttempts}
              </Text>
            </View>
            <View style={styles.methodsContainer}>
              <Text style={[styles.methodsTitle, { color: colors.primary }]}>By Method:</Text>
              {Object.entries(loginStats.attemptsByMethod).map(([method, count]) => (
                <View key={method} style={styles.methodRow}>
                  <Text style={[styles.methodName, { color: colors.text }]}>
                    {method.toUpperCase()}
                  </Text>
                  <Text style={[styles.methodCount, { color: colors.primary }]}>
                    {count as number}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Recent Login Attempts */}
        {loginAttempts.length > 0 && (
          <View style={[styles.card, { borderColor: colors.primary }]}>
            <Text style={[styles.cardTitle, { color: colors.primary }]}>
              Recent Login Attempts ({loginAttempts.length})
            </Text>
            {loginAttempts.slice(-10).reverse().map((attempt, index) => (
              <View key={attempt.id || index} style={[styles.attemptItem, { borderColor: colors.primary }]}>
                <View style={styles.attemptHeader}>
                  <Text style={[styles.attemptMethod, { color: colors.primary }]}>
                    {attempt.method.toUpperCase()}
                  </Text>
                  <Text style={[
                    styles.attemptStatus,
                    { color: attempt.success ? '#00ff00' : '#ff0000' }
                  ]}>
                    {attempt.success ? '??? Success' : '??? Failed'}
                  </Text>
                </View>
                <Text style={[styles.attemptTime, { color: colors.textSecondary }]}>
                  {new Date(attempt.timestamp).toLocaleString()}
                </Text>
                {attempt.error && (
                  <Text style={[styles.attemptError, { color: '#ff0000' }]}>
                    Error: {attempt.error}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Security Alerts */}
        <View style={[styles.card, { borderColor: colors.primary }]}>
          <Text style={[styles.cardTitle, { color: colors.primary }]}>
            Security Alerts ({securityAlerts.length})
          </Text>
          {securityAlerts.map((alert, index) => (
            <View key={alert.id || index} style={[styles.alertItem, { borderColor: colors.primary }]}>
              <View style={styles.alertHeader}>
                <Text style={[styles.alertType, { color: colors.primary }]}>
                  {alert.type.toUpperCase()}
                </Text>
                <Text style={[
                  styles.alertSeverity,
                  { color: alert.severity === 'critical' ? '#ff0000' : alert.severity === 'high' ? '#ff8800' : colors.text }
                ]}>
                  {alert.severity}
                </Text>
              </View>
              <Text style={[styles.alertMessage, { color: colors.text }]}>
                {alert.message}
              </Text>
              <Text style={[styles.alertTime, { color: colors.textSecondary }]}>
                {new Date(alert.timestamp).toLocaleString()}
              </Text>
            </View>
          ))}
        </View>
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
    zIndex: 10,
  },
  backButton: {
    padding: 8,
    minWidth: 40,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  scrollContent: {
    padding: 20,
  },
  charREMOVED: {
    alignItems: 'center',
    marginBottom: 30,
  },
  characterTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 15,
  },
  statusCard: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 20,
    bREMOVED: 'rgba(255,255,255,0.03)',
  },
  card: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 20,
    bREMOVED: 'rgba(255,255,255,0.03)',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    textAlign: 'right',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  statusLabel: {
    fontSize: 14,
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  subscriptionItem: {
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 10,
    bREMOVED: 'rgba(255,255,255,0.02)',
  },
  subscriptionTier: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  subscriptionStatus: {
    fontSize: 12,
    marginBottom: 3,
  },
  subscriptionExpiry: {
    fontSize: 12,
  },
  alertItem: {
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 10,
    bREMOVED: 'rgba(255,255,255,0.02)',
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  alertType: {
    fontSize: 12,
    fontWeight: '600',
  },
  alertSeverity: {
    fontSize: 12,
    fontWeight: '600',
  },
  alertMessage: {
    fontSize: 14,
    marginBottom: 5,
    textAlign: 'right',
  },
  alertTime: {
    fontSize: 11,
    textAlign: 'right',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  statsLabel: {
    fontSize: 14,
  },
  statsValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  methodsContainer: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 234, 255, 0.2)',
  },
  methodsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
    textAlign: 'right',
  },
  methodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  methodName: {
    fontSize: 12,
  },
  methodCount: {
    fontSize: 12,
    fontWeight: '600',
  },
  attemptItem: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 10,
    bREMOVED: 'rgba(255,255,255,0.02)',
  },
  attemptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  attemptMethod: {
    fontSize: 12,
    fontWeight: '600',
  },
  attemptStatus: {
    fontSize: 12,
    fontWeight: '600',
  },
  attemptTime: {
    fontSize: 11,
    marginBottom: 3,
  },
  attemptError: {
    fontSize: 10,
    marginTop: 5,
  },
});


