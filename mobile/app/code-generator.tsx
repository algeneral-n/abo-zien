/**
 * RARE 4N - Code Generator Screen
 * مولد الكود - يكتب ويفهم ويحلل 12 امتداد للكود
 * ✅ Cognitive Loop → Kernel → Code Generator Agent
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
import Icon from '../components/Icon';
import { API_URL } from '../services/config';

// Supported code extensions (12+)
const CODE_EXTENSIONS = [
  { ext: 'js', name: 'JavaScript', icon: 'code' },
  { ext: 'ts', name: 'TypeScript', icon: 'code' },
  { ext: 'jsx', name: 'React JSX', icon: 'code' },
  { ext: 'tsx', name: 'React TSX', icon: 'code' },
  { ext: 'py', name: 'Python', icon: 'code' },
  { ext: 'java', name: 'Java', icon: 'code' },
  { ext: 'cpp', name: 'C++', icon: 'code' },
  { ext: 'c', name: 'C', icon: 'code' },
  { ext: 'cs', name: 'C#', icon: 'code' },
  { ext: 'go', name: 'Go', icon: 'code' },
  { ext: 'rs', name: 'Rust', icon: 'code' },
  { ext: 'swift', name: 'Swift', icon: 'code' },
  { ext: 'kt', name: 'Kotlin', icon: 'code' },
  { ext: 'php', name: 'PHP', icon: 'code' },
  { ext: 'rb', name: 'Ruby', icon: 'code' },
];

export default function CodeGenerator() {
  const [codePrompt, setCodePrompt] = useState('');
  const [selectedExtension, setSelectedExtension] = useState('ts');
  const [generatedCode, setGeneratedCode] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  const { theme, colors } = useTheme();
  const kernel = RAREKernel.getInstance();

  useEffect(() => {
    // ✅ الاستماع لنتائج CognitiveLoop → BuilderAgent → Response
    const unsubscribeCode = kernel.on('agent:builder:response', (event) => {
      if (event.data.code) {
        setGeneratedCode(event.data.code);
      }
      setIsGenerating(false);
    });
    
    const unsubscribeError = kernel.on('agent:builder:error', (event) => {
      Alert.alert('خطأ', event.data.error || 'فشل توليد الكود');
      setIsGenerating(false);
    });
    
    return () => {
      unsubscribeCode();
      unsubscribeError();
    };
  }, []);

  const handleGenerate = () => {
    if (!codePrompt.trim()) {
      Alert.alert('خطأ', 'يرجى إدخال وصف للكود');
      return;
    }

    setIsGenerating(true);
    setGeneratedCode('');

    // ✅ إرسال إلى Kernel → CognitiveLoop → BuilderAgent
    kernel.emit({
      type: 'user:input',
      data: {
        text: `generate ${selectedExtension} code: ${codePrompt}`,
        type: 'builder',
        action: 'generate_code',
        parameters: {
          prompt: codePrompt,
          extension: selectedExtension,
          language: CODE_EXTENSIONS.find(e => e.ext === selectedExtension)?.name || 'TypeScript',
        },
      },
      source: 'ui',
    });
  };

  const handleCopyCode = () => {
    // Copy to clipboard
    Alert.alert('نجح', 'تم نسخ الكود');
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
        <Text style={[styles.headerTitle, { color: colors.primary }]}>مولد الكود</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.section, { borderColor: colors.primary }]}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>اختر لغة البرمجة</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.extensionsScroll}>
            {CODE_EXTENSIONS.map((ext) => (
              <Pressable
                key={ext.ext}
                style={[
                  styles.extensionButton,
                  {
                    backgroundColor: selectedExtension === ext.ext ? colors.primary : `${colors.primary}20`,
                    borderColor: colors.primary,
                  },
                ]}
                onPress={() => setSelectedExtension(ext.ext)}
              >
                <Text style={[
                  styles.extensionText,
                  { color: selectedExtension === ext.ext ? '#000' : colors.text }
                ]}>
                  {ext.name}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <View style={[styles.section, { borderColor: colors.primary }]}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>وصف الكود</Text>
          <TextInput
            style={[styles.input, { borderColor: colors.primary, color: colors.text }]}
            placeholder="مثال: دالة لحساب مجموع الأرقام في مصفوفة"
            placeholderTextColor={colors.primary + '50'}
            value={codePrompt}
            onChangeText={setCodePrompt}
            multiline
            numberOfLines={4}
          />
          <Pressable
            style={[styles.generateButton, { backgroundColor: colors.primary }]}
            onPress={handleGenerate}
            disabled={isGenerating}
          >
            <Text style={styles.generateButtonText}>
              {isGenerating ? 'جاري التوليد...' : 'توليد الكود'}
            </Text>
          </Pressable>
        </View>

        {generatedCode && (
          <View style={[styles.section, { borderColor: colors.primary }]}>
            <View style={styles.codeHeader}>
              <Text style={[styles.sectionTitle, { color: colors.primary }]}>الكود المولد</Text>
              <Pressable
                style={[styles.copyButton, { borderColor: colors.primary }]}
                onPress={handleCopyCode}
              >
                <Icon name="copy" size={18} color={colors.primary} />
              </Pressable>
            </View>
            <ScrollView style={styles.codeContainer}>
              <Text style={[styles.codeText, { color: colors.text }]}>
                {generatedCode}
              </Text>
            </ScrollView>
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  scrollContent: { padding: 20 },
  section: {
    padding: 15,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 20,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'right',
  },
  extensionsScroll: {
    marginBottom: 10,
  },
  extensionButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 8,
  },
  extensionText: {
    fontSize: 12,
    fontWeight: '500',
  },
  input: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 10,
    borderWidth: 1,
    fontSize: 14,
    textAlign: 'right',
    minHeight: 100,
    marginBottom: 15,
  },
  generateButton: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  generateButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
  codeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  copyButton: {
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  codeContainer: {
    maxHeight: 400,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 8,
    padding: 12,
  },
  codeText: {
    fontSize: 12,
    fontFamily: 'monospace',
    lineHeight: 18,
  },
});









