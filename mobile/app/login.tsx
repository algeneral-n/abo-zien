/**
 * RARE 4N - Login Screen
 * صفحة تسجيل الدخول - قائمة Google + تفعيل الصوت + رير + Names Tunnel
 * ✅ Cognitive Loop → Kernel → Auth Agent
 */

import { useEffect, useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Animated,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { RAREKernel } from '../core/RAREKernel';
import { useTheme } from '../hooks/useTheme';
import NamesTunnel from '../components/NamesTunnel';
import RARECharacter from '../components/RARECharacter';
import Icon from '../components/Icon';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LoginTracker } from '../core/services/LoginTracker';
import * as LocalAuthentication from 'expo-local-authentication';
import { TextInput } from 'react-native';

// All requests go through Kernel → Cognitive Loop

const FAMILY_PASSWORD = 'رير من عائلتي';

export default function Login() {
  const [showGoogleMenu, setShowGoogleMenu] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{text: string; from: 'user' | 'rare'}>>([
    { text: 'مرحباً! أنا رير. اكتب كلمة المرور أو استخدم Face ID للدخول.', from: 'rare' }
  ]);
  
  const { theme, colors } = useTheme();
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    startAnimations();
    checkVoiceStatus();
    
    // ✅ الاستماع لنتائج CognitiveLoop → Agent → Response
    const kernel = RAREKernel.getInstance();
    
    // استمع لنتائج authentication
    const unsubscribeAuth = kernel.on('agent:auth:response', (event) => {
      if (event.data.success && event.data.token) {
        AsyncStorage.setItem('authToken', event.data.token).then(() => {
          router.replace('/home');
        });
      } else {
        setIsLoading(false);
      }
    });
    
    return () => {
      unsubscribeAuth();
    };
  }, []);

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

  const checkVoiceStatus = async () => {
    try {
      const enabled = await AsyncStorage.getItem('voiceEnabled');
      setVoiceEnabled(enabled === 'true');
    } catch (error) {
      console.error('Error checking voice status:', error);
    }
  };

  const handleGoogleLogin = async (provider: string) => {
    try {
      setIsLoading(true);
      
      const kernel = RAREKernel.getInstance();

      // Send to Kernel → Cognitive Loop processes automatically
      kernel.emit({
        type: 'user:input',
        data: {
          text: `login with ${provider}`,
          type: 'auth',
        },
      });

      // ✅ Cognitive Loop سيعالج ويقرر
      // لا fetch مباشر - كل شيء عبر Kernel → CognitiveLoop
    } catch (error) {
      console.error('Google login error:', error);
    } finally {
      setIsLoading(false);
      setShowGoogleMenu(false);
    }
  };

  const handleToggleVoice = async () => {
    try {
      const newStatus = !voiceEnabled;
      await AsyncStorage.setItem('voiceEnabled', newStatus.toString());
      setVoiceEnabled(newStatus);

      const kernel = RAREKernel.getInstance();

      // Send to Kernel → Cognitive Loop processes automatically
      kernel.emit({
        type: 'user:input',
        data: {
          text: newStatus ? 'enable voice' : 'disable voice',
          type: 'voice',
        },
      });
    } catch (error) {
      console.error('Voice toggle error:', error);
    }
  };

  const handleFaceAuth = async () => {
    try {
      setIsLoading(true);
      const loginTracker = LoginTracker.getInstance();
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'المصادقة بالوجه',
        fallbackLabel: 'استخدام كلمة المرور',
        disableDeviceFallback: false,
      });

      if (result.success) {
        // Track successful Face ID login
        await loginTracker.trackLoginAttempt('faceid', true, 'user_1');
        
        const kernel = RAREKernel.getInstance();
        kernel.emit({
          type: 'user:input',
          data: {
            text: 'authenticate with faceid',
            type: 'auth',
            method: 'faceid',
          },
          source: 'ui',
        });
        setChatMessages(prev => [...prev, 
          { text: 'تم التحقق بنجاح!', from: 'rare' }
        ]);
      } else {
        // Track failed Face ID login
        await loginTracker.trackLoginAttempt('faceid', false, undefined, 'Face ID authentication failed');
      }
    } catch (error) {
      const loginTracker = LoginTracker.getInstance();
      await loginTracker.trackLoginAttempt('faceid', false, undefined, error?.toString() || 'Unknown error');
      console.error('Face auth error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!chatMessage.trim()) return;

    const message = chatMessage.trim();
    setChatMessages(prev => [...prev, { text: message, from: 'user' }]);
    setChatMessage('');

    // Check if it's the password
    if (message === FAMILY_PASSWORD) {
      const kernel = RAREKernel.getInstance();
      const loginTracker = LoginTracker.getInstance();
      
      // Track successful login
      await loginTracker.trackLoginAttempt('password', true, 'user_1');
      
      kernel.emit({
        type: 'user:input',
        data: {
          text: 'authenticate with password',
          type: 'auth',
          method: 'password',
          password: message,
        },
        source: 'ui',
      });
      setChatMessages(prev => [...prev, 
        { text: 'تم التحقق بنجاح! جاري تسجيل الدخول...', from: 'rare' }
      ]);
    } else {
      const loginTracker = LoginTracker.getInstance();
      
      // Track failed login
      await loginTracker.trackLoginAttempt('password', false, undefined, 'Invalid password');
      
      setChatMessages(prev => [...prev, 
        { text: 'كلمة المرور غير صحيحة. حاول مرة أخرى أو استخدم Face ID.', from: 'rare' }
      ]);
    }
  };

  const googleProviders = [
    { id: 'google', name: 'Google', nameAr: 'جوجل' },
    { id: 'apple', name: 'Apple', nameAr: 'أبل' },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={theme.background || ['#000408', '#001820', '#000408']}
        style={styles.background}
      >
        <NamesTunnel />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.content}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Animated.View
              style={[
                styles.mainContent,
                {
                  opacity: fadeAnim,
                  transform: [{ scale: scaleAnim }],
                },
              ]}
            >
              <View style={styles.characterContainer}>
                <RARECharacter size={200} animation="idle" />
              </View>

              {/* Chat Container */}
              <View style={[styles.chatContainer, { borderColor: colors.primary, backgroundColor: `${colors.primary}05` }]}>
                <ScrollView 
                  style={styles.chatMessages}
                  contentContainerStyle={styles.chatMessagesContent}
                >
                  {chatMessages.map((msg, index) => (
                    <View
                      key={index}
                      style={[
                        styles.chatMessage,
                        msg.from === 'user' ? styles.chatMessageUser : styles.chatMessageRare,
                      ]}
                    >
                      <Text style={[styles.chatMessageText, { color: colors.text }]}>
                        {msg.text}
                      </Text>
                    </View>
                  ))}
                </ScrollView>
                <View style={styles.chatInputContainer}>
                  <TextInput
                    style={[
                      styles.chatInput,
                      { borderColor: colors.primary, color: colors.text },
                    ]}
                    placeholder="اكتب كلمة المرور أو استخدم Face ID..."
                    placeholderTextColor={colors.primary + '50'}
                    value={chatMessage}
                    onChangeText={setChatMessage}
                    onSubmitEditing={handleSendMessage}
                    secureTextEntry={chatMessage === FAMILY_PASSWORD || chatMessage.includes('رير')}
                  />
                  <TouchableOpacity
                    style={[styles.chatSendButton, { backgroundColor: colors.primary }]}
                    onPress={handleSendMessage}
                  >
                    <Icon name="send" size={18} color="#000" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.faceIdButton, { borderColor: colors.primary }]}
                    onPress={handleFaceAuth}
                    disabled={isLoading}
                  >
                    <Icon name="phone" size={18} color={colors.primary} />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.buttonsContainer}>
                <TouchableOpacity
                  style={[
                    styles.googleButton,
                    { borderColor: colors.primary, backgroundColor: `${colors.primary}10` },
                  ]}
                  onPress={() => setShowGoogleMenu(!showGoogleMenu)}
                >
                  <Icon name="apps" size={20} color={colors.primary} />
                  <Text style={[styles.googleButtonText, { color: colors.primary }]}>
                    تسجيل الدخول
                  </Text>
                </TouchableOpacity>

                {showGoogleMenu && (
                  <View style={[styles.googleMenu, { borderColor: colors.primary, backgroundColor: `${colors.primary}05` }]}>
                    {googleProviders.map((provider) => (
                      <TouchableOpacity
                        key={provider.id}
                        style={[
                          styles.googleMenuItem,
                          { borderColor: colors.primary },
                        ]}
                        onPress={() => handleGoogleLogin(provider.id)}
                        disabled={isLoading}
                      >
                        <Text style={[styles.googleMenuItemText, { color: colors.text }]}>
                          {provider.nameAr}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                <TouchableOpacity
                  style={[
                    styles.voiceButton,
                    { 
                      borderColor: colors.primary, 
                      backgroundColor: voiceEnabled ? colors.primary : `${colors.primary}10`,
                    },
                  ]}
                  onPress={handleToggleVoice}
                >
                  <Icon 
                    name={voiceEnabled ? 'voice-chat' : 'record-voice'} 
                    size={20} 
                    color={voiceEnabled ? '#000' : colors.primary} 
                  />
                  <Text style={[
                    styles.voiceButtonText, 
                    { color: voiceEnabled ? '#000' : colors.primary }
                  ]}>
                    {voiceEnabled ? 'إيقاف الصوت' : 'تفعيل الصوت'}
                  </Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </ScrollView>
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
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  mainContent: {
    alignItems: 'center',
  },
  characterContainer: {
    marginBottom: 40,
  },
  buttonsContainer: {
    width: '100%',
    maxWidth: 400,
    gap: 15,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: 25,
    borderWidth: 2,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  googleMenu: {
    borderRadius: 20,
    borderWidth: 2,
    padding: 15,
    marginTop: 10,
  },
  googleMenuItem: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  googleMenuItemText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  voiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: 25,
    borderWidth: 2,
  },
  voiceButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  chatContainer: {
    width: '100%',
    maxWidth: 400,
    height: 300,
    borderRadius: 20,
    borderWidth: 2,
    marginBottom: 20,
    overflow: 'hidden',
  },
  chatMessages: {
    flex: 1,
  },
  chatMessagesContent: {
    padding: 15,
    gap: 10,
  },
  chatMessage: {
    padding: 12,
    borderRadius: 12,
    maxWidth: '80%',
  },
  chatMessageUser: {
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(0, 234, 255, 0.2)',
  },
  chatMessageRare: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  chatMessageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  chatInputContainer: {
    flexDirection: 'row',
    padding: 10,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 234, 255, 0.2)',
  },
  chatInput: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    borderWidth: 1,
    fontSize: 14,
    textAlign: 'right',
  },
  chatSendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  faceIdButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});


