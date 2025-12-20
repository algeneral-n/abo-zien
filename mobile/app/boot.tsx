/**
 * RARE 4N - Boot Screen
 * صفحة البوت - Face ID + Password
 * ✅ Cognitive Loop → Kernel → Auth Agent
 * ❌ لا يتم تفعيل أنظمة متتالية في وقت واحد
 */

import { useEffect, useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Animated,
  Platform,
  TextInput,
  KeyboardAvoidingView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import * as LocalAuthentication from 'expo-local-authentication';
import { RAREKernel } from '../core/RAREKernel';
import { useTheme } from '../hooks/useTheme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LoginTracker } from '../core/services/LoginTracker';
import RARECharacter from '../components/RARECharacter';
import { debugLog } from '../utils/debugLog';

const FAMILY_PASSWORD = 'رير من عائلتي';
// All requests go through Kernel → Cognitive Loop

export default function Boot() {
  const [phase, setPhase] = useState<'checking' | 'auth' | 'ready'>('checking');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  
  const { theme, colors } = useTheme();
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    checkBootStatus();
    
    // ✅ الاستماع لنتائج CognitiveLoop → Agent → Response
    const kernel = RAREKernel.getInstance();
    
    // استمع لنتائج boot check
    const unsubscribeBoot = kernel.on('agent:boot:response', (event) => {
      if (event.data.authenticated) {
        setPhase('ready');
      } else {
        setPhase('auth');
      }
    });
    
    // استمع لنتائج authentication
    const unsubscribeAuth = kernel.on('agent:auth:response', (event) => {
      if (event.data.success && event.data.token) {
        AsyncStorage.setItem('authToken', event.data.token).then(() => {
          setPhase('ready');
          router.replace('/home');
        });
      } else {
        setAuthError(event.data.error || 'فشل تسجيل الدخول');
        setIsAuthenticating(false);
      }
    });
    
    return () => {
      unsubscribeBoot();
      unsubscribeAuth();
    };
  }, []);

  useEffect(() => {
    if (phase === 'auth' || phase === 'ready') {
      startAnimations();
    }
  }, [phase]);

  const startAnimations = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const checkBootStatus = async () => {
    try {
      // #region agent log
      debugLog('boot.tsx:98', 'checkBootStatus called', { timestamp: Date.now() }, 'C');
      // #endregion
      const kernel = RAREKernel.getInstance();
      // #region agent log
      debugLog('boot.tsx:100', 'Kernel obtained in boot', { kernelExists: !!kernel, state: kernel?.getState() }, 'C');
      // #endregion
      if (!kernel) {
        // #region agent log
        debugLog('boot.tsx:102', 'No kernel found, setting phase to auth', { timestamp: Date.now() }, 'C');
        // #endregion
        setPhase('auth');
        return;
      }

      // ✅ إرسال إلى Kernel → CognitiveLoop (لا fetch مباشر)
      // #region agent log
      debugLog('boot.tsx:108', 'Emitting boot check event', { timestamp: Date.now() }, 'D');
      // #endregion
      kernel.emit({
        type: 'user:input',
        data: {
          text: 'check boot status',
          type: 'system',
        },
        source: 'ui',
      });
    } catch (error) {
      // #region agent log
      debugLog('boot.tsx:118', 'Boot check error', { error: error?.toString() }, 'C');
      // #endregion
      console.error('Boot check error:', error);
      setPhase('auth');
    }
  };

  const handleFaceAuth = async () => {
    try {
      setIsAuthenticating(true);
      setAuthError('');

      const loginTracker = LoginTracker.getInstance();
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'المصادقة بالوجه',
        fallbackLabel: 'استخدام كلمة المرور',
        disableDeviceFallback: false,
      });

      if (result.success) {
        await loginTracker.trackLoginAttempt('faceid', true, 'user_1');
        await authenticateWithBackend('faceid', null, { success: true });
      } else {
        await loginTracker.trackLoginAttempt('faceid', false, undefined, 'Face ID authentication failed');
        setAuthError('فشلت المصادقة');
      }
    } catch (error: any) {
      const loginTracker = LoginTracker.getInstance();
      await loginTracker.trackLoginAttempt('faceid', false, undefined, error?.toString() || 'Unknown error');
      setAuthError('حدث خطأ في المصادقة');
      console.error('Face auth error:', error);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handlePasswordAuth = async () => {
    const loginTracker = LoginTracker.getInstance();
    
    if (password.trim() !== FAMILY_PASSWORD) {
      await loginTracker.trackLoginAttempt('password', false, undefined, 'Invalid password');
      setAuthError('كلمة المرور غير صحيحة');
      return;
    }

    await loginTracker.trackLoginAttempt('password', true, 'user_1');
    await authenticateWithBackend('password', password, null);
  };

  const authenticateWithBackend = async (method: string, password: string | null, faceIdData: any) => {
    try {
      // #region agent log
      debugLog('boot.tsx:163', 'authenticateWithBackend called', { method, hasPassword: !!password, hasFaceIdData: !!faceIdData }, 'E');
      // #endregion
      setIsAuthenticating(true);
      setAuthError('');

      const kernel = RAREKernel.getInstance();
      // #region agent log
      debugLog('boot.tsx:169', 'Kernel obtained for auth', { kernelExists: !!kernel, state: kernel?.getState() }, 'E');
      // #endregion

      // ✅ إرسال إلى Kernel → CognitiveLoop (لا fetch مباشر)
      // #region agent log
      debugLog('boot.tsx:172', 'Emitting auth event', { method }, 'D');
      // #endregion
      kernel.emit({
        type: 'user:input',
        data: {
          text: `authenticate with ${method}`,
          type: 'auth',
          method,
          password,
          faceIdData,
        },
        source: 'ui',
      });
    } catch (error: any) {
      // #region agent log
      debugLog('boot.tsx:186', 'Auth error', { error: error?.message || error?.toString() }, 'E');
      // #endregion
      setAuthError('حدث خطأ في الاتصال');
      console.error('Auth error:', error);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleEnter = () => {
    router.replace('/login');
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={theme.background || ['#000408', '#001820', '#000408']}
        style={styles.background}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.content}
        >
          <View style={styles.logoContainer}>
            <RARECharacter size={200} animation="idle" />
            <Text style={[styles.logoText, { color: colors.primary }]}>RARE 4N</Text>
            <Text style={[styles.welcomeText, { color: colors.textSecondary }]}>
              مرحباً بك في رير
            </Text>
          </View>

          {phase === 'checking' && (
            <View style={styles.checkingContainer}>
              <Text style={[styles.checkingText, { color: colors.text }]}>جاري التحقق...</Text>
            </View>
          )}

          {phase === 'auth' && (
            <Animated.View
              style={[
                styles.authContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ scale: scaleAnim }],
                },
              ]}
            >
              <Text style={[styles.authTitle, { color: colors.primary }]}>
                مرحباً بك
              </Text>
              <Text style={[styles.authSubtitle, { color: colors.textSecondary }]}>
                سجل دخولك للوصول إلى رير
              </Text>

              <TouchableOpacity
                style={[
                  styles.authButton,
                  { borderColor: colors.primary, backgroundColor: `${colors.primary}10` },
                  isAuthenticating && styles.authButtonDisabled,
                ]}
                onPress={handleFaceAuth}
                disabled={isAuthenticating}
              >
                <Text style={[styles.authButtonText, { color: colors.primary }]}>
                  Face ID
                </Text>
              </TouchableOpacity>

              <View style={styles.divider}>
                <View style={[styles.dividerLine, { backgroundColor: colors.primary }]} />
                <Text style={[styles.dividerText, { color: colors.textSecondary }]}>أو</Text>
                <View style={[styles.dividerLine, { backgroundColor: colors.primary }]} />
              </View>

              <View style={styles.passwordContainer}>
                <TextInput
                  style={[
                    styles.passwordInput,
                    { borderColor: colors.primary, color: colors.text },
                  ]}
                  placeholder="كلمة المرور"
                  placeholderTextColor={colors.primary + '50'}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    setAuthError('');
                  }}
                  secureTextEntry
                  onSubmitEditing={handlePasswordAuth}
                />
              </View>

              <TouchableOpacity
                style={[
                  styles.authButton,
                  { borderColor: colors.primary, backgroundColor: colors.primary },
                  isAuthenticating && styles.authButtonDisabled,
                ]}
                onPress={handlePasswordAuth}
                disabled={isAuthenticating}
              >
                <Text style={[styles.authButtonText, { color: '#000' }]}>
                  تسجيل الدخول
                </Text>
              </TouchableOpacity>

              {authError && (
                <Text style={[styles.errorText, { color: '#ff4444' }]}>
                  {authError}
                </Text>
              )}
            </Animated.View>
          )}

          {phase === 'ready' && (
            <Animated.View
              style={[
                styles.readyContainer,
                {
                  opacity: fadeAnim,
                },
              ]}
            >
              <Text style={[styles.readyText, { color: colors.primary }]}>
                أهلاً وسهلاً
              </Text>
              <Text style={[styles.readySubtext, { color: colors.textSecondary }]}>
                جاهز للبدء
              </Text>
              <TouchableOpacity
                style={[
                  styles.enterButton,
                  { backgroundColor: colors.primary },
                ]}
                onPress={handleEnter}
              >
                <Text style={styles.enterButtonText}>ابدأ</Text>
              </TouchableOpacity>
            </Animated.View>
          )}
        </KeyboardAvoidingView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 10,
  },
  logoText: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 16,
    fontWeight: '500',
  },
  checkingContainer: {
    alignItems: 'center',
  },
  checkingText: {
    fontSize: 16,
  },
  authContainer: {
    width: '100%',
    maxWidth: 400,
    padding: 20,
    alignItems: 'center',
  },
  authTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  authSubtitle: {
    fontSize: 16,
    marginBottom: 30,
    textAlign: 'center',
  },
  authButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 25,
    borderWidth: 2,
    marginBottom: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  authButtonDisabled: {
    opacity: 0.6,
  },
  authButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    opacity: 0.3,
  },
  dividerText: {
    marginHorizontal: 15,
    fontSize: 14,
  },
  passwordContainer: {
    width: '100%',
    marginBottom: 15,
  },
  passwordInput: {
    width: '100%',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 2,
    fontSize: 16,
    textAlign: 'right',
  },
  errorText: {
    fontSize: 14,
    marginTop: 10,
    textAlign: 'center',
  },
  readyContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 40,
  },
  readyText: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  readySubtext: {
    fontSize: 18,
    marginBottom: 30,
    textAlign: 'center',
  },
  enterButton: {
    paddingVertical: 16,
    paddingHorizontal: 60,
    borderRadius: 30,
  },
  enterButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
});


