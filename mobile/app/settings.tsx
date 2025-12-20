/**
 * RARE 4N - Settings Screen
 * شاشة الإعدادات - الثيم، اللغة، المزاج، الصوت، كلمة السر، تسجيل الخروج
 * ✅ Cognitive Loop → Kernel → Settings Agent
 */

import { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { RAREKernel } from '../core/RAREKernel';
import { useTheme } from '../hooks/useTheme';
import { THEMES } from '../config/themes';
import Icon from '../components/Icon';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LANGUAGES = [
  { id: 'ar', name: 'العربية' },
  { id: 'en', name: 'English' },
  { id: 'fr', name: 'Français' },
  { id: 'de', name: 'Deutsch' },
  { id: 'es', name: 'Español' },
  { id: 'it', name: 'Italiano' },
  { id: 'pt', name: 'Português' },
  { id: 'ru', name: 'Русский' },
  { id: 'zh', name: '中文' },
  { id: 'ja', name: '日本語' },
  { id: 'ko', name: '한국어' },
  { id: 'tr', name: 'Türkçe' },
];

const MOODS = [
  { id: 'helpful', name: 'مساعد' },
  { id: 'professional', name: 'احترافي' },
  { id: 'friendly', name: 'ودود' },
];

const VOICES = [
  { id: '9401kb2n0gf5e2wtp4sfs8chdmk1', name: 'Voice 1 (System)' },
  { id: '6ZVgc4q9LWAloWbuwjuu', name: 'Voice 2' },
  { id: '4wf10lgibMnboGJGCLrP', name: 'Voice 3' },
  { id: 'IES4nrmZdUBHByLBde0P', name: 'Voice 4' },
  { id: 'LjKPkQHpXCsWoy7Pjq4U', name: 'Voice 5' },
  { id: 'WkVhWA2EqSfUAWAZG7La', name: 'Voice 6' },
];

export default function Settings() {
  const { theme, colors, updateTheme } = useTheme();
  const [selectedLanguage, setSelectedLanguage] = useState('ar');
  const [selectedMood, setSelectedMood] = useState('helpful');
  const [selectedVoice, setSelectedVoice] = useState('rachel');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const kernel = RAREKernel.getInstance();

  useEffect(() => {
    loadSettings();
    
    // ✅ الاستماع لنتائج CognitiveLoop → Agent → Response
    const unsubscribePassword = kernel.on('agent:auth:response', (event) => {
      if (event.data.action === 'change-password') {
        if (event.data.success) {
          Alert.alert('نجح', 'تم تغيير كلمة المرور بنجاح');
          setNewPassword('');
          setConfirmPassword('');
        } else {
          Alert.alert('خطأ', event.data.error || 'فشل تغيير كلمة المرور');
        }
      }
    });
    
    return () => {
      unsubscribePassword();
    };
  }, []);

  const loadSettings = async () => {
    try {
      const language = await AsyncStorage.getItem('language') || 'ar';
      const mood = await AsyncStorage.getItem('mood') || 'helpful';
      const voice = await AsyncStorage.getItem('voice') || 'rachel';
      
      setSelectedLanguage(language);
      setSelectedMood(mood);
      setSelectedVoice(voice);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleThemeChange = async (newTheme: typeof THEMES[0]) => {
    await updateTheme(newTheme);

    // Send to Kernel → Cognitive Loop processes automatically
    kernel.emit({
      type: 'user:input',
      data: {
        text: `change theme to ${newTheme.id}`,
        type: 'settings',
      },
    });
  };

  const handleLanguageChange = async (language: string) => {
    setSelectedLanguage(language);
    await AsyncStorage.setItem('language', language);

    // ✅ إرسال إلى Kernel → CognitiveLoop (نظام الترجمات العصبي المتعلم)
    kernel.emit({
      type: 'user:input',
      data: {
        text: `change language to ${language}`,
        type: 'settings',
        language,
        action: 'update_translation_system',
      },
      source: 'ui',
    });
  };

  const handleMoodChange = async (mood: string) => {
    setSelectedMood(mood);
    await AsyncStorage.setItem('mood', mood);

    // Send to Kernel → Cognitive Loop processes automatically
    kernel.emit({
      type: 'user:input',
      data: {
        text: `change mood to ${mood}`,
        type: 'settings',
      },
    });
  };

  const handleVoiceChange = async (voice: string) => {
    setSelectedVoice(voice);
    await AsyncStorage.setItem('voice', voice);

    // Send to Kernel → Cognitive Loop processes automatically
    kernel.emit({
      type: 'user:input',
      data: {
        text: `change voice to ${voice}`,
        type: 'settings',
      },
    });
  };

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      Alert.alert('خطأ', 'كلمات المرور غير متطابقة');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('خطأ', 'كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }

    try {
      // ✅ إرسال إلى Kernel → CognitiveLoop (لا fetch مباشر)
      kernel.emit({
        type: 'user:input',
        data: {
          text: 'change password',
          type: 'auth',
          newPassword,
        },
        source: 'ui',
      });
    } catch (error) {
      Alert.alert('خطأ', 'حدث خطأ في الاتصال');
      console.error('Password change error:', error);
    }
  };

  const handleLogout = async () => {
    try {
      // ✅ إرسال إلى Kernel → CognitiveLoop (لا fetch مباشر)
      kernel.emit({
        type: 'user:input',
        data: {
          text: 'logout',
          type: 'auth',
        },
        source: 'ui',
      });

      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('voiceEnabled');
      router.replace('/boot');
    } catch (error) {
      console.error('Logout error:', error);
      router.replace('/boot');
    }
  };

  return (
    <LinearGradient
      colors={theme.background as [string, string, ...string[]]}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Icon name="arrow-back" size={20} color={colors.primary} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.primary }]}>الإعدادات</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>الثيم</Text>
          <View style={styles.optionsGrid}>
            {THEMES.map((themeOption) => (
              <Pressable
                key={themeOption.id}
                style={[
                  styles.optionCard,
                  {
                    borderColor: colors.primary,
                    backgroundColor: theme.id === themeOption.id ? colors.primary : `${colors.primary}10`,
                  },
                ]}
                onPress={() => handleThemeChange(themeOption)}
              >
                <View style={[styles.colorPreview, { backgroundColor: themeOption.primary }]} />
                <Text style={[
                  styles.optionText,
                  { color: theme.id === themeOption.id ? '#000' : colors.text }
                ]}>
                  {themeOption.nameAr}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>اللغة</Text>
          <View style={styles.optionsList}>
            {LANGUAGES.map((lang) => (
              <Pressable
                key={lang.id}
                style={[
                  styles.optionItem,
                  {
                    borderColor: colors.primary,
                    backgroundColor: selectedLanguage === lang.id ? colors.primary : `${colors.primary}10`,
                  },
                ]}
                onPress={() => handleLanguageChange(lang.id)}
              >
                <Text style={[
                  styles.optionText,
                  { color: selectedLanguage === lang.id ? '#000' : colors.text }
                ]}>
                  {lang.name}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>المزاج</Text>
          <View style={styles.optionsList}>
            {MOODS.map((mood) => (
              <Pressable
                key={mood.id}
                style={[
                  styles.optionItem,
                  {
                    borderColor: colors.primary,
                    backgroundColor: selectedMood === mood.id ? colors.primary : `${colors.primary}10`,
                  },
                ]}
                onPress={() => handleMoodChange(mood.id)}
              >
                <Text style={[
                  styles.optionText,
                  { color: selectedMood === mood.id ? '#000' : colors.text }
                ]}>
                  {mood.name}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>الصوت</Text>
          <View style={styles.optionsList}>
            {VOICES.map((voice) => (
              <Pressable
                key={voice.id}
                style={[
                  styles.optionItem,
                  {
                    borderColor: colors.primary,
                    backgroundColor: selectedVoice === voice.id ? colors.primary : `${colors.primary}10`,
                  },
                ]}
                onPress={() => handleVoiceChange(voice.id)}
              >
                <Text style={[
                  styles.optionText,
                  { color: selectedVoice === voice.id ? '#000' : colors.text }
                ]}>
                  {voice.name}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>تغيير كلمة المرور</Text>
          <TextInput
            style={[styles.passwordInput, { borderColor: colors.primary, color: colors.text }]}
            placeholder="كلمة المرور الجديدة"
            placeholderTextColor={colors.primary + '50'}
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
          />
          <TextInput
            style={[styles.passwordInput, { borderColor: colors.primary, color: colors.text }]}
            placeholder="تأكيد كلمة المرور"
            placeholderTextColor={colors.primary + '50'}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
          <Pressable
            style={[styles.saveButton, { backgroundColor: colors.primary }]}
            onPress={handlePasswordChange}
          >
            <Text style={styles.saveButtonText}>حفظ</Text>
          </Pressable>
        </View>

        <View style={styles.section}>
          <Pressable
            style={[styles.logoutButton, { borderColor: '#ff4444' }]}
            onPress={handleLogout}
          >
            <Text style={[styles.logoutButtonText, { color: '#ff4444' }]}>تسجيل الخروج</Text>
          </Pressable>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    textAlign: 'right',
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  optionCard: {
    width: '30%',
    padding: 15,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    gap: 8,
  },
  colorPreview: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  optionsList: {
    gap: 10,
  },
  optionItem: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'right',
  },
  passwordInput: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
    fontSize: 14,
    textAlign: 'right',
    marginBottom: 12,
  },
  saveButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});


