/**
 * RARE 4N - Home Screen
 * ???????????? ???????????????? - 3 ?????????? ???? ????????????
 * ??? Cognitive Loop ??? Kernel ??? Agents
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
import NamesTunnel from '../components/NamesTunnel';
import RARECharacter from '../components/RARECharacter';
import Icon from '../components/Icon';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { debugLog } from '../utils/debugLog';

export default function Home() {
  const [showServicesMenu, setShowServicesMenu] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  
  const { theme, colors } = useTheme();
  
  const kernel = RAREKernel.getInstance();

  useEffect(() => {
    // #region agent log
    debugLog('home.tsx:32', 'Home screen mounted', { timestamp: Date.now() }, 'F');
    // #endregion
    checkAuth();
    checkVoiceStatus();
    subscribeToKernelEvents();
  }, []);

  const checkAuth = async () => {
    try {
      // #region agent log
      debugLog('home.tsx:38', 'Checking authentication', { timestamp: Date.now() }, 'F');
      // #endregion
      const token = await AsyncStorage.getItem('authToken');
      // #region agent log
      debugLog('home.tsx:42', 'Auth token check result', { hasToken: !!token }, 'F');
      // #endregion
      if (!token) {
        router.replace('/boot');
      }
    } catch (error) {
      // #region agent log
      debugLog('home.tsx:47', 'Auth check error', { error: error?.toString() }, 'F');
      // #endregion
      console.error('Auth check error:', error);
    }
  };

  const checkVoiceStatus = async () => {
    try {
      const enabled = await AsyncStorage.getItem('voiceEnabled');
      setVoiceEnabled(enabled === 'true');
    } catch (error) {
      console.error('Error checking voice status:', error);
    }
  };

  const subscribeToKernelEvents = () => {
    const unsubscribe = kernel.on('voice:listening', (event) => {
      setVoiceEnabled(true);
    });

    return () => {
      unsubscribe();
    };
  };

  const handleToggleVoice = async () => {
    try {
      // #region agent log
      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/app/home.tsx:handleToggleVoice',message:'Voice toggle initiated',data:{currentStatus:voiceEnabled},timestamp:Date.now(),sessionId:'home-ui-session',runId:'run1',hypothesisId:'VOICE_TOGGLE_START'})}).catch(()=>{});
      }
      // #endregion

      const newStatus = !voiceEnabled;
      await AsyncStorage.setItem('voiceEnabled', newStatus.toString());
      setVoiceEnabled(newStatus);

      // ??? ?????????? ?????? Kernel ??? CognitiveLoop ??? VoiceAgent
      kernel.emit({
        type: 'user:input',
        data: {
          text: newStatus ? 'enable voice' : 'disable voice',
          type: 'voice',
          enabled: newStatus,
        },
        source: 'ui',
      });

      // #region agent log
      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/app/home.tsx:handleToggleVoice',message:'Voice toggle emitted to Kernel',data:{newStatus},timestamp:Date.now(),sessionId:'home-ui-session',runId:'run1',hypothesisId:'VOICE_TOGGLE_EMITTED'})}).catch(()=>{});
      }
      // #endregion
    } catch (error: any) {
      // #region agent log
      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/app/home.tsx:handleToggleVoice',message:'Voice toggle error',data:{error:error.message,stack:error.stack},timestamp:Date.now(),sessionId:'home-ui-session',runId:'run1',hypothesisId:'VOICE_TOGGLE_ERROR'})}).catch(()=>{});
      }
      // #endregion
      console.error('Voice toggle error:', error);
      Alert.alert('??????', error.message || '?????? ??????????/?????????? ??????????');
    }
  };

  const serviceGroups = [
    {
      id: 'core',
      name: '?????????????? ????????????????',
      services: [
        { id: 'chat', title: '??????????????', iconName: 'chat', route: '/chat' },
        { id: 'council', title: '????????????', iconName: 'voice-chat', route: '/council' },
        { id: 'loyalty', title: '????????????', iconName: 'star', route: '/loyalty' },
        { id: 'vault', title: '??????????', iconName: 'archive', route: '/vault' },
      ],
    },
    {
      id: 'builder',
      name: '?????????? ????????????',
      services: [
        { id: 'app-builder', title: '???????? ??????????????????', iconName: 'apps', route: '/app-builder' },
        { id: 'code', title: '???????? ??????????', iconName: 'task', route: '/code' },
      ],
    },
    {
      id: 'storage',
      name: '?????????? ??????????????',
      services: [
        { id: 'files', title: '??????????????', iconName: 'folder', route: '/files' },
      ],
    },
    {
      id: 'maps',
      name: '?????????????? ????????????????',
      services: [
        { id: 'maps', title: '??????????????', iconName: 'apps', route: '/maps' },
        { id: 'weather', title: '??????????', iconName: 'apps', route: '/weather' },
      ],
    },
    {
      id: 'security',
      name: '?????????? ????????????',
      services: [
        { id: 'secure', title: '????????????', iconName: 'secure', route: '/secure' },
        { id: 'sos', title: '??????????????', iconName: 'emergency', route: '/sos' },
        { id: 'supreme-access', title: 'Supreme Access', iconName: 'shield', route: '/supreme-access' },
        { id: 'control-room', title: 'Control Room', iconName: 'settings', route: '/control-room' },
      ],
    },
  ];

  return (
    <LinearGradient
      colors={theme.background as [string, string, ...string[]]}
      style={styles.container}
    >
      <NamesTunnel />

      <View style={styles.header}>
        <Pressable
          style={[styles.headerButton, { borderColor: colors.primary }]}
          onPress={() => setShowServicesMenu(!showServicesMenu)}
        >
          <Icon name="apps" size={20} color={colors.primary} />
        </Pressable>

        <Pressable
          style={[
            styles.headerButton,
            { 
              borderColor: colors.primary,
              bREMOVED: voiceEnabled ? colors.primary : `${colors.primary}10`,
            },
          ]}
          onPress={handleToggleVoice}
        >
          <Icon 
            name={voiceEnabled ? 'voice-chat' : 'record-voice'} 
            size={20} 
            color={voiceEnabled ? '#000' : colors.primary} 
          />
        </Pressable>

        <Pressable
          style={[styles.headerButton, { borderColor: colors.primary }]}
          onPress={() => router.push('/settings')}
        >
          <Icon name="settings" size={20} color={colors.primary} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.charREMOVED}>
          <RARECharacter size={180} animation="idle" />
        </View>

        {showServicesMenu && (
          <View style={[styles.servicesMenu, { borderColor: colors.primary, bREMOVED: `${colors.primary}05` }]}>
            {serviceGroups.map((group) => (
              <View key={group.id} style={styles.serviceGroup}>
                <Text style={[styles.serviceGroupTitle, { color: colors.primary }]}>
                  {group.name}
                </Text>
                <View style={styles.servicesList}>
                  {group.services.map((service) => (
                    <Pressable
                      key={service.id}
                      style={[styles.serviceItem, { borderColor: colors.primary }]}
                      onPress={() => {
                        setShowServicesMenu(false);
                        router.push(service.route as any);
                      }}
                    >
                      <Icon name={service.iconName} size={18} color={colors.primary} />
                      <Text style={[styles.serviceItemText, { color: colors.text }]}>
                        {service.title}
                      </Text>
                    </Pressable>
                  ))}
                </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 15,
    zIndex: 10,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 20,
    paddingTop: 20,
  },
  charREMOVED: {
    alignItems: 'center',
    marginBottom: 30,
  },
  servicesMenu: {
    borderRadius: 20,
    borderWidth: 2,
    padding: 15,
    marginTop: 20,
  },
  serviceGroup: {
    marginBottom: 20,
  },
  serviceGroupTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
    textAlign: 'right',
  },
  servicesList: {
    gap: 8,
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 12,
    borderWidth: 1,
    bREMOVED: 'rgba(255,255,255,0.03)',
    gap: 12,
  },
  serviceItemText: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
});



