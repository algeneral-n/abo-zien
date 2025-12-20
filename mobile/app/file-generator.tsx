/**
 * RARE 4N - File Generator Screen
 * مولد الملفات - HTML, PowerPoint, Word, Excel, PDF
 * ✅ Cognitive Loop → Kernel → File Generator Agent
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
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { RAREKernel } from '../core/RAREKernel';
import { useTheme } from '../hooks/useTheme';
import Icon from '../components/Icon';

const FILE_TYPES = [
  { id: 'html', name: 'HTML', icon: 'file', description: 'صفحة ويب' },
  { id: 'pptx', name: 'PowerPoint', icon: 'file', description: 'عرض تقديمي' },
  { id: 'docx', name: 'Word', icon: 'file', description: 'مستند نصي' },
  { id: 'xlsx', name: 'Excel', icon: 'file', description: 'جدول بيانات' },
  { id: 'pdf', name: 'PDF', icon: 'file', description: 'مستند PDF' },
  { id: 'txt', name: 'Text', icon: 'file', description: 'ملف نصي' },
  { id: 'csv', name: 'CSV', icon: 'file', description: 'بيانات منفصلة' },
  { id: 'json', name: 'JSON', icon: 'file', description: 'بيانات JSON' },
];

export default function FileGenerator() {
  const [fileType, setFileType] = useState('html');
  const [fileContent, setFileContent] = useState('');
  const [fileName, setFileName] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedFileUri, setGeneratedFileUri] = useState<string | null>(null);
  
  const { theme, colors } = useTheme();
  const kernel = RAREKernel.getInstance();

  useEffect(() => {
    // ✅ الاستماع لنتائج CognitiveLoop → Agent → Response
    const unsubscribeFile = kernel.on('agent:file:response', (event) => {
      if (event.data.fileUri) {
        setGeneratedFileUri(event.data.fileUri);
        setFileContent(event.data.content || '');
      }
      setIsGenerating(false);
    });
    
    const unsubscribeError = kernel.on('agent:file:error', (event) => {
      Alert.alert('خطأ', event.data.error || 'فشل توليد الملف');
      setIsGenerating(false);
    });
    
    return () => {
      unsubscribeFile();
      unsubscribeError();
    };
  }, []);

  const handleGenerate = () => {
    if (!fileContent.trim()) {
      Alert.alert('خطأ', 'يرجى إدخال محتوى الملف');
      return;
    }

    setIsGenerating(true);

    // ✅ إرسال إلى Kernel → CognitiveLoop
    kernel.emit({
      type: 'user:input',
      data: {
        text: `generate ${fileType} file`,
        type: 'file_generation',
        fileType,
        content: fileContent,
        fileName: fileName || `generated.${fileType}`,
      },
      source: 'ui',
    });
  };

  const handleDownload = async () => {
    if (!generatedFileUri) {
      Alert.alert('خطأ', 'لا يوجد ملف للتحميل');
      return;
    }

    try {
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(generatedFileUri);
      } else {
        Alert.alert('نجح', 'تم حفظ الملف');
      }
    } catch (error) {
      Alert.alert('خطأ', 'فشل تحميل الملف');
    }
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
        <Text style={[styles.headerTitle, { color: colors.primary }]}>مولد الملفات</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.section, { borderColor: colors.primary }]}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>نوع الملف</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typesScroll}>
            {FILE_TYPES.map((type) => (
              <Pressable
                key={type.id}
                style={[
                  styles.typeButton,
                  {
                    backgroundColor: fileType === type.id ? colors.primary : `${colors.primary}20`,
                    borderColor: colors.primary,
                  },
                ]}
                onPress={() => setFileType(type.id)}
              >
                <Text style={[
                  styles.typeText,
                  { color: fileType === type.id ? '#000' : colors.text }
                ]}>
                  {type.name}
                </Text>
                <Text style={[
                  styles.typeDescription,
                  { color: fileType === type.id ? '#000' : colors.textSecondary }
                ]}>
                  {type.description}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <View style={[styles.section, { borderColor: colors.primary }]}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>اسم الملف</Text>
          <TextInput
            style={[styles.input, { borderColor: colors.primary, color: colors.text }]}
            placeholder="مثال: document"
            placeholderTextColor={colors.primary + '50'}
            value={fileName}
            onChangeText={setFileName}
          />
        </View>

        <View style={[styles.section, { borderColor: colors.primary }]}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>محتوى الملف</Text>
          <TextInput
            style={[styles.textArea, { borderColor: colors.primary, color: colors.text }]}
            placeholder="أدخل محتوى الملف..."
            placeholderTextColor={colors.primary + '50'}
            value={fileContent}
            onChangeText={setFileContent}
            multiline
            numberOfLines={10}
          />
          <Pressable
            style={[styles.generateButton, { backgroundColor: colors.primary }]}
            onPress={handleGenerate}
            disabled={isGenerating}
          >
            <Text style={styles.generateButtonText}>
              {isGenerating ? 'جاري التوليد...' : 'توليد الملف'}
            </Text>
          </Pressable>
        </View>

        {generatedFileUri && (
          <View style={[styles.section, { borderColor: colors.primary }]}>
            <Text style={[styles.sectionTitle, { color: colors.primary }]}>الملف المولد</Text>
            <Pressable
              style={[styles.downloadButton, { backgroundColor: colors.primary }]}
              onPress={handleDownload}
            >
              <Icon name="download" size={20} color="#000" />
              <Text style={styles.downloadButtonText}>تحميل الملف</Text>
            </Pressable>
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
  typesScroll: {
    marginBottom: 10,
  },
  typeButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  typeText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  typeDescription: {
    fontSize: 10,
  },
  input: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 10,
    borderWidth: 1,
    fontSize: 14,
    textAlign: 'right',
    marginBottom: 15,
  },
  textArea: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 10,
    borderWidth: 1,
    fontSize: 14,
    textAlign: 'right',
    minHeight: 200,
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
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 10,
  },
  downloadButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
});









