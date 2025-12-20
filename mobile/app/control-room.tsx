/**
 * RARE 4N - Control Room
 * صفحة التخصيص الكامل للتطبيق
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Image,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RAREKernel } from '../core/RAREKernel';
import { useTheme } from '../hooks/useTheme';
import Icon from '../components/Icon';
import { ALL_THEMES } from '../config/themesComplete';
import { GOOGLE_ICONS } from '../assets/icons/google';
import { API_URL } from '../services/config';

const kernel = RAREKernel.getInstance();

// Service Status Types
type ServiceStatus = 'running' | 'stopped' | 'starting' | 'stopping' | 'error' | 'unknown';

interface ServiceState {
  status: ServiceStatus;
  lastCheck: number;
  url?: string;
  error?: string;
}

export default function ControlRoom() {
  const router = useRouter();
  const { theme, updateTheme, colors } = useTheme();
  const [selectedTheme, setSelectedTheme] = useState(theme);
  const [selectedIcon, setSelectedIcon] = useState('chat');
  const [iconSize, setIconSize] = useState(24);
  const [fontFamily, setFontFamily] = useState('System');
  const [fontSize, setFontSize] = useState(14);
  
  // Service States
  const [backendState, setBackendState] = useState<ServiceState>({
    status: 'unknown',
    lastCheck: 0,
  });
  const [cloudflareState, setCloudflareState] = useState<ServiceState>({
    status: 'unknown',
    lastCheck: 0,
  });
  const [widgetState, setWidgetState] = useState<ServiceState>({
    status: 'unknown',
    lastCheck: 0,
  });

  // ✅ 50+ Themes from themesComplete
  const themes = ALL_THEMES;

  // App Icons
  const appIcons = [
    { id: 'default', name: 'افتراضي', preview: require('../assets/icon.png') },
  ];

  // Fonts
  const fonts = ['System', 'SF Pro', 'Helvetica', 'Arial'];

  // ✅ 6,900+ Icons from Google Material Symbols
  const availableIcons = Object.keys(GOOGLE_ICONS);

  // Check Service Status
  const checkServiceStatus = async (service: 'backend' | 'cloudflare' | 'widget') => {
    try {
      // #region agent log
      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/app/control-room.tsx:checkServiceStatus',message:'Checking service status',data:{service},timestamp:Date.now(),sessionId:'control-room-session',runId:'run1',hypothesisId:'CHECK_SERVICE_STATUS'})}).catch(()=>{});
      }
      // #endregion

      if (service === 'backend') {
        try {
          const response = await fetch(`${API_URL}/api/boot`, {
            method: 'GET',
            timeout: 5000,
          } as any);
          if (response.ok) {
            setBackendState({
              status: 'running',
              lastCheck: Date.now(),
              url: API_URL,
            });
          } else {
            setBackendState({
              status: 'error',
              lastCheck: Date.now(),
              error: `HTTP ${response.status}`,
            });
          }
        } catch (error: any) {
          setBackendState({
            status: 'stopped',
            lastCheck: Date.now(),
            error: error.message || 'Connection failed',
          });
        }
      } else if (service === 'cloudflare') {
        // Check Cloudflare tunnel status
        try {
          const response = await fetch(`${API_URL}/api/health`, {
            method: 'GET',
            timeout: 5000,
          } as any);
          if (response.ok) {
            const data = await response.json();
            setCloudflareState({
              status: data.cloudflare?.tunnel === 'active' ? 'running' : 'stopped',
              lastCheck: Date.now(),
              url: data.cloudflare?.url,
            });
          } else {
            setCloudflareState({
              status: 'stopped',
              lastCheck: Date.now(),
              error: 'Tunnel not active',
            });
          }
        } catch (error: any) {
          setCloudflareState({
            status: 'stopped',
            lastCheck: Date.now(),
            error: error.message || 'Tunnel check failed',
          });
        }
      } else if (service === 'widget') {
        // Check Widget status (Client Portal)
        try {
          const response = await fetch(`${API_URL}/api/client-portal/status`, {
            method: 'GET',
            timeout: 5000,
          } as any);
          if (response.ok) {
            setWidgetState({
              status: 'running',
              lastCheck: Date.now(),
            });
          } else {
            setWidgetState({
              status: 'stopped',
              lastCheck: Date.now(),
              error: 'Widget not available',
            });
          }
        } catch (error: any) {
          setWidgetState({
            status: 'stopped',
            lastCheck: Date.now(),
            error: error.message || 'Widget check failed',
          });
        }
      }
    } catch (error: any) {
      // #region agent log
      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/app/control-room.tsx:checkServiceStatus',message:'Service status check error',data:{service,error:error.message},timestamp:Date.now(),sessionId:'control-room-session',runId:'run1',hypothesisId:'CHECK_SERVICE_ERROR'})}).catch(()=>{});
      }
      // #endregion
      console.error(`Check ${service} status error:`, error);
    }
  };

  // Control Service
  const controlService = async (service: 'backend' | 'cloudflare' | 'widget', action: 'start' | 'stop' | 'restart') => {
    try {
      // #region agent log
      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/app/control-room.tsx:controlService',message:'Controlling service',data:{service,action},timestamp:Date.now(),sessionId:'control-room-session',runId:'run1',hypothesisId:'CONTROL_SERVICE'})}).catch(()=>{});
      }
      // #endregion

      // ✅ إرسال إلى Kernel → CognitiveLoop → Service Agent
      kernel.emit({
        type: 'user:input',
        data: {
          text: `${action} ${service}`,
          type: 'service-control',
          service,
          action,
        },
        source: 'ui',
      });

      // Update state immediately
      if (service === 'backend') {
        setBackendState(prev => ({ ...prev, status: action === 'start' ? 'starting' : action === 'stop' ? 'stopping' : 'starting' }));
      } else if (service === 'cloudflare') {
        setCloudflareState(prev => ({ ...prev, status: action === 'start' ? 'starting' : action === 'stop' ? 'stopping' : 'starting' }));
      } else if (service === 'widget') {
        setWidgetState(prev => ({ ...prev, status: action === 'start' ? 'starting' : action === 'stop' ? 'stopping' : 'starting' }));
      }

      // Check status after delay
      setTimeout(() => {
        checkServiceStatus(service);
      }, 2000);

      Alert.alert('نجاح', `تم ${action === 'start' ? 'تشغيل' : action === 'stop' ? 'إيقاف' : 'إعادة تشغيل'} ${service}`);
    } catch (error: any) {
      // #region agent log
      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/app/control-room.tsx:controlService',message:'Control service error',data:{service,action,error:error.message},timestamp:Date.now(),sessionId:'control-room-session',runId:'run1',hypothesisId:'CONTROL_SERVICE_ERROR'})}).catch(()=>{});
      }
      // #endregion
      console.error(`Control ${service} error:`, error);
      Alert.alert('خطأ', `فشل ${action === 'start' ? 'تشغيل' : action === 'stop' ? 'إيقاف' : 'إعادة تشغيل'} ${service}`);
    }
  };

  // Check all services on mount
  useEffect(() => {
    checkServiceStatus('backend');
    checkServiceStatus('cloudflare');
    checkServiceStatus('widget');

    // Check every 30 seconds
    const interval = setInterval(() => {
      checkServiceStatus('backend');
      checkServiceStatus('cloudflare');
      checkServiceStatus('widget');
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleThemeChange = async (newTheme: any) => {
    try {
      const themeToApply = {
        id: newTheme.id,
        name: newTheme.name,
        primary: newTheme.primary,
        secondary: newTheme.secondary,
        accent: newTheme.primary,
        background: [newTheme.background, newTheme.background, newTheme.background],
        surface: newTheme.background,
        text: '#ffffff',
        textSecondary: '#cccccc',
        border: newTheme.primary,
        cardStyle: 'solid' as const,
        buttonStyle: 'flat' as const,
        borderGlow: true,
        blur: 0,
        iconStyle: 'filled' as const,
        iconColor: newTheme.primary,
        fontFamily: 'System',
        fontSize: {
          xs: 10,
          sm: 12,
          base: 14,
          md: 16,
          lg: 18,
          xl: 20,
          '2xl': 24,
          '3xl': 32,
        },
      };
      
      setSelectedTheme(themeToApply);
      await updateTheme(themeToApply);
      
      kernel.emit({
        type: 'theme:changed',
        data: { theme: themeToApply },
      });
      
      Alert.alert('نجح', 'تم تغيير الثيم بنجاح');
    } catch (error) {
      console.error('Theme change error:', error);
      Alert.alert('خطأ', 'فشل تغيير الثيم');
    }
  };

  const handleIconChange = async (iconName: string) => {
    try {
      setSelectedIcon(iconName);
      await AsyncStorage.setItem('appIcon', iconName);
      
      kernel.emit({
        type: 'icon:changed',
        data: { icon: iconName },
      });
      
      Alert.alert('نجح', 'تم تغيير الأيقونة بنجاح');
    } catch (error) {
      console.error('Icon change error:', error);
    }
  };

  const handleFontChange = async (font: string) => {
    try {
      setFontFamily(font);
      await AsyncStorage.setItem('appFont', font);
      
      kernel.emit({
        type: 'font:changed',
        data: { font },
      });
    } catch (error) {
      console.error('Font change error:', error);
    }
  };

  const handleAppIconChange = async (iconId: string) => {
    Alert.alert(
      'ملاحظة',
      'تغيير أيقونة التطبيق يحتاج إعادة بناء التطبيق. سيتم حفظ الاختيار.',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'حفظ',
          onPress: async () => {
            try {
              await AsyncStorage.setItem('appIconId', iconId);
              Alert.alert('نجح', 'تم حفظ الاختيار. سيتم تطبيقه في البناء القادم.');
            } catch (error) {
              console.error('App icon save error:', error);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Control Room</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Services Status Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>حالة الخدمات</Text>
          
          {/* Backend Status */}
          <View style={[styles.serviceCard, { borderColor: colors.primary }]}>
            <View style={styles.serviceHeader}>
              <Icon name="server" size={24} color={colors.primary} />
              <Text style={[styles.serviceName, { color: colors.text }]}>Backend Server</Text>
              <View style={[styles.statusBadge, { backgroundColor: backendState.status === 'running' ? '#00ff00' : backendState.status === 'error' ? '#ff0000' : '#ffaa00' }]}>
                <Text style={styles.statusText}>
                  {backendState.status === 'running' ? '●' : backendState.status === 'error' ? '●' : '○'}
                </Text>
              </View>
            </View>
            <Text style={[styles.serviceStatus, { color: colors.textSecondary }]}>
              {backendState.status === 'running' ? 'يعمل' : backendState.status === 'stopped' ? 'متوقف' : backendState.status === 'starting' ? 'جاري التشغيل...' : backendState.status === 'stopping' ? 'جاري الإيقاف...' : backendState.status === 'error' ? `خطأ: ${backendState.error}` : 'غير معروف'}
            </Text>
            {backendState.url && (
              <Text style={[styles.serviceUrl, { color: colors.textSecondary }]}>{backendState.url}</Text>
            )}
            <View style={styles.serviceActions}>
              <TouchableOpacity
                style={[styles.serviceButton, { backgroundColor: colors.primary }]}
                onPress={() => controlService('backend', 'start')}
                disabled={backendState.status === 'running' || backendState.status === 'starting'}
              >
                <Icon name="play-arrow" size={16} color="#000" />
                <Text style={styles.serviceButtonText}>تشغيل</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.serviceButton, { backgroundColor: '#ff4444' }]}
                onPress={() => controlService('backend', 'stop')}
                disabled={backendState.status === 'stopped' || backendState.status === 'stopping'}
              >
                <Icon name="stop" size={16} color="#fff" />
                <Text style={[styles.serviceButtonText, { color: '#fff' }]}>إيقاف</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.serviceButton, { backgroundColor: colors.primary }]}
                onPress={() => controlService('backend', 'restart')}
                disabled={backendState.status === 'starting' || backendState.status === 'stopping'}
              >
                <Icon name="refresh" size={16} color="#000" />
                <Text style={styles.serviceButtonText}>إعادة تشغيل</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.serviceButton, { backgroundColor: colors.primary }]}
                onPress={() => checkServiceStatus('backend')}
              >
                <Icon name="refresh" size={16} color="#000" />
                <Text style={styles.serviceButtonText}>فحص</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Cloudflare Status */}
          <View style={[styles.serviceCard, { borderColor: colors.primary }]}>
            <View style={styles.serviceHeader}>
              <Icon name="cloud" size={24} color={colors.primary} />
              <Text style={[styles.serviceName, { color: colors.text }]}>Cloudflare Tunnel</Text>
              <View style={[styles.statusBadge, { backgroundColor: cloudflareState.status === 'running' ? '#00ff00' : cloudflareState.status === 'error' ? '#ff0000' : '#ffaa00' }]}>
                <Text style={styles.statusText}>
                  {cloudflareState.status === 'running' ? '●' : cloudflareState.status === 'error' ? '●' : '○'}
                </Text>
              </View>
            </View>
            <Text style={[styles.serviceStatus, { color: colors.textSecondary }]}>
              {cloudflareState.status === 'running' ? 'يعمل' : cloudflareState.status === 'stopped' ? 'متوقف' : cloudflareState.status === 'starting' ? 'جاري التشغيل...' : cloudflareState.status === 'stopping' ? 'جاري الإيقاف...' : cloudflareState.status === 'error' ? `خطأ: ${cloudflareState.error}` : 'غير معروف'}
            </Text>
            {cloudflareState.url && (
              <Text style={[styles.serviceUrl, { color: colors.textSecondary }]}>{cloudflareState.url}</Text>
            )}
            <View style={styles.serviceActions}>
              <TouchableOpacity
                style={[styles.serviceButton, { backgroundColor: colors.primary }]}
                onPress={() => controlService('cloudflare', 'start')}
                disabled={cloudflareState.status === 'running' || cloudflareState.status === 'starting'}
              >
                <Icon name="play-arrow" size={16} color="#000" />
                <Text style={styles.serviceButtonText}>تشغيل</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.serviceButton, { backgroundColor: '#ff4444' }]}
                onPress={() => controlService('cloudflare', 'stop')}
                disabled={cloudflareState.status === 'stopped' || cloudflareState.status === 'stopping'}
              >
                <Icon name="stop" size={16} color="#fff" />
                <Text style={[styles.serviceButtonText, { color: '#fff' }]}>إيقاف</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.serviceButton, { backgroundColor: colors.primary }]}
                onPress={() => controlService('cloudflare', 'restart')}
                disabled={cloudflareState.status === 'starting' || cloudflareState.status === 'stopping'}
              >
                <Icon name="refresh" size={16} color="#000" />
                <Text style={styles.serviceButtonText}>إعادة تشغيل</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.serviceButton, { backgroundColor: colors.primary }]}
                onPress={() => checkServiceStatus('cloudflare')}
              >
                <Icon name="refresh" size={16} color="#000" />
                <Text style={styles.serviceButtonText}>فحص</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Widget Status */}
          <View style={[styles.serviceCard, { borderColor: colors.primary }]}>
            <View style={styles.serviceHeader}>
              <Icon name="widgets" size={24} color={colors.primary} />
              <Text style={[styles.serviceName, { color: colors.text }]}>Client Portal Widget</Text>
              <View style={[styles.statusBadge, { backgroundColor: widgetState.status === 'running' ? '#00ff00' : widgetState.status === 'error' ? '#ff0000' : '#ffaa00' }]}>
                <Text style={styles.statusText}>
                  {widgetState.status === 'running' ? '●' : widgetState.status === 'error' ? '●' : '○'}
                </Text>
              </View>
            </View>
            <Text style={[styles.serviceStatus, { color: colors.textSecondary }]}>
              {widgetState.status === 'running' ? 'يعمل' : widgetState.status === 'stopped' ? 'متوقف' : widgetState.status === 'starting' ? 'جاري التشغيل...' : widgetState.status === 'stopping' ? 'جاري الإيقاف...' : widgetState.status === 'error' ? `خطأ: ${widgetState.error}` : 'غير معروف'}
            </Text>
            <View style={styles.serviceActions}>
              <TouchableOpacity
                style={[styles.serviceButton, { backgroundColor: colors.primary }]}
                onPress={() => controlService('widget', 'start')}
                disabled={widgetState.status === 'running' || widgetState.status === 'starting'}
              >
                <Icon name="play-arrow" size={16} color="#000" />
                <Text style={styles.serviceButtonText}>تشغيل</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.serviceButton, { backgroundColor: '#ff4444' }]}
                onPress={() => controlService('widget', 'stop')}
                disabled={widgetState.status === 'stopped' || widgetState.status === 'stopping'}
              >
                <Icon name="stop" size={16} color="#fff" />
                <Text style={[styles.serviceButtonText, { color: '#fff' }]}>إيقاف</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.serviceButton, { backgroundColor: colors.primary }]}
                onPress={() => controlService('widget', 'restart')}
                disabled={widgetState.status === 'starting' || widgetState.status === 'stopping'}
              >
                <Icon name="refresh" size={16} color="#000" />
                <Text style={styles.serviceButtonText}>إعادة تشغيل</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.serviceButton, { backgroundColor: colors.primary }]}
                onPress={() => checkServiceStatus('widget')}
              >
                <Icon name="refresh" size={16} color="#000" />
                <Text style={styles.serviceButtonText}>فحص</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Theme Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>الثيمات</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
            {themes.map((t) => (
              <TouchableOpacity
                key={t.id}
                style={[
                  styles.themeCard,
                  selectedTheme.id === t.id && { borderColor: colors.primary, borderWidth: 2 },
                ]}
                onPress={() => handleThemeChange(t)}
              >
                <View style={[styles.themePreview, { backgroundColor: t.primary }]} />
                <Text style={[styles.themeName, { color: colors.text }]}>{t.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Icon Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>الأيقونات</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
            {availableIcons.slice(0, 20).map((icon) => (
              <TouchableOpacity
                key={icon}
                style={[
                  styles.iconCard,
                  selectedIcon === icon && { borderColor: colors.primary, borderWidth: 2 },
                ]}
                onPress={() => handleIconChange(icon)}
              >
                <Icon name={icon} size={32} color={colors.primary} />
                <Text style={[styles.iconName, { color: colors.text }]} numberOfLines={1}>
                  {icon}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Font Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>الخطوط</Text>
          <View style={styles.fontContainer}>
            {fonts.map((font) => (
              <TouchableOpacity
                key={font}
                style={[
                  styles.fontOption,
                  fontFamily === font && { backgroundColor: colors.primary },
                ]}
                onPress={() => handleFontChange(font)}
              >
                <Text
                  style={[
                    styles.fontText,
                    { fontFamily: font },
                    fontFamily === font && { color: '#000408' },
                    fontFamily !== font && { color: colors.text },
                  ]}
                >
                  {font}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* App Icon Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>أيقونة التطبيق</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
            {appIcons.map((icon) => (
              <TouchableOpacity
                key={icon.id}
                style={styles.iconCard}
                onPress={() => handleAppIconChange(icon.id)}
              >
                <Image source={icon.preview} style={styles.appIconPreview} />
                <Text style={[styles.iconName, { color: colors.text }]}>{icon.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </View>
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
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  horizontalScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  themeCard: {
    width: 120,
    marginRight: 15,
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    backgroundColor: '#1a1a1a',
  },
  themePreview: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginBottom: 8,
  },
  themeName: {
    fontSize: 12,
    textAlign: 'center',
  },
  iconCard: {
    width: 80,
    marginRight: 15,
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    backgroundColor: '#1a1a1a',
  },
  iconName: {
    fontSize: 10,
    marginTop: 5,
    textAlign: 'center',
  },
  fontContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  fontOption: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#1a1a1a',
    marginRight: 10,
    marginBottom: 10,
  },
  fontText: {
    fontSize: 14,
  },
  appIconPreview: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginBottom: 5,
  },
  sectionDescription: {
    fontSize: 12,
    marginBottom: 15,
    marginTop: -5,
  },
  layoutContainer: {
    marginBottom: 20,
  },
  layoutLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
  },
  layoutList: {
    gap: 8,
  },
  layoutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 12,
  },
  layoutItemText: {
    flex: 1,
    fontSize: 14,
  },
  layoutItemIndex: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  sizeControls: {
    gap: 15,
  },
  sizeControl: {
    marginBottom: 10,
  },
  sizeLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  sizeSlider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sizeButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sizeButtonText: {
    color: '#000408',
    fontSize: 18,
    fontWeight: 'bold',
  },
  sizeValue: {
    fontSize: 14,
    minWidth: 40,
    textAlign: 'center',
  },
  saveButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: '#000408',
    fontSize: 16,
    fontWeight: 'bold',
  },
  colorContainer: {
    gap: 15,
  },
  colorControl: {
    marginBottom: 10,
  },
  colorLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  colorPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  colorInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  serviceCard: {
    padding: 15,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 15,
    backgroundColor: '#1a1a1a',
  },
  serviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },
  serviceName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  statusBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    color: '#000',
    fontWeight: 'bold',
  },
  serviceStatus: {
    fontSize: 14,
    marginBottom: 5,
  },
  serviceUrl: {
    fontSize: 12,
    marginBottom: 10,
  },
  serviceActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  serviceButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 5,
  },
  serviceButtonText: {
    color: '#000',
    fontSize: 12,
    fontWeight: '600',
  },
});

