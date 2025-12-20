/**
 * RARE 4N - Files Screen
 * ???????? ?????????????? - ???????? ???????????? ?????????????? ???????????? ??????????
 * ??? Cognitive Loop ??? Kernel ??? Filing Agent
 */

import { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Modal,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { RAREKernel } from '../core/RAREKernel';
import { useTheme } from '../hooks/useTheme';
import Icon from '../components/Icon';
import { fileManager, FILE_CATEGORIES, FileItem } from '../services/fileManager';
import { useKernelAgent } from '../hooks/useKernelAgent';
import * as FileSystem from 'expo-file-system';

export default function Files() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  
  const { theme, colors } = useTheme();
  const kernel = RAREKernel.getInstance();
  const { executeAction, listenForEvents } = useKernelAgent('filing');
  const { executeAction: executeBuilderAction } = useKernelAgent('builder');

  useEffect(() => {
    // Initialize file manager
    fileManager.init().then(() => {
      loadFiles();
    });

    // ??? ???????????????? ???????????? CognitiveLoop ??? FilingAgent ??? Response
    const unsubscribeResponse = listenForEvents('agent:filing:response', async (data) => {
      if (data.files) {
        // Save files to file manager (use Promise.all instead of forEach)
        const addFilePromises = data.files.map(async (file: any) => {
          const category = detectCategory(file.type || file.name);
          return fileManager.addFile({
            name: file.name,
            type: file.type || 'application/octet-stream',
            size: file.size || 0,
            uri: file.uri || file.id,
            category,
            tags: [],
          });
        });
        await Promise.all(addFilePromises);
        loadFiles();
      } else if (data.file) {
        // ?????? ?????? ???????? ???????? ??????????????
        const category = detectCategory(data.file.type || data.file.name);
        fileManager.addFile({
          name: data.file.name,
          type: data.file.type || 'application/octet-stream',
          size: data.file.size || 0,
          uri: data.file.uri || data.file.id,
          category,
          tags: [],
        }).then(() => loadFiles());
      } else if (data.ocr) {
        // ?????????? OCR
        alert(data.ocr || '???? ??????????????');
      }
    });
    
    const unsubscribeError = listenForEvents('agent:filing:error', (data) => {
      alert(data.error || '?????? ??????');
    });
    
    fetchFiles();
    
    return () => {
      unsubscribeResponse();
      unsubscribeError();
    };
  }, []);

  useEffect(() => {
    loadFiles();
  }, [selectedCategory, searchQuery, showHistory]);

  const detectCategory = (typeOrName: string): string => {
    const lower = typeOrName.toLowerCase();
    if (lower.includes('image') || /\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i.test(lower)) return 'image';
    if (lower.includes('video') || /\.(mp4|mov|avi|webm|mkv)$/i.test(lower)) return 'video';
    if (lower.includes('audio') || /\.(mp3|wav|aac|ogg|m4a)$/i.test(lower)) return 'audio';
    if (/\.(pdf|doc|docx|xls|xlsx|ppt|pptx|txt|md)$/i.test(lower)) return 'document';
    if (/\.(zip|rar|7z|tar|gz)$/i.test(lower)) return 'archive';
    if (/\.(js|ts|jsx|tsx|py|java|cpp|c|html|css|json|xml|yaml|yml|sh|bat|ps1)$/i.test(lower)) return 'code';
    return 'other';
  };

  const loadFiles = () => {
    try {
      let loadedFiles: FileItem[] = [];
      
      if (showHistory) {
        loadedFiles = fileManager.getFileHistory(50);
      } else if (searchQuery && searchQuery.trim()) {
        loadedFiles = fileManager.searchFiles(searchQuery);
      } else {
        loadedFiles = fileManager.getFilesByCategory(selectedCategory || 'all');
      }
      
      setFiles(loadedFiles);
    } catch (error) {
      console.error('Load files error:', error);
      setFiles([]);
    }
  };

  const fetchFiles = async () => {
    try {
      // ??? ?????????? ?????? Kernel ??? CognitiveLoop ??? FilingAgent
      await executeAction('list_files', {});
    } catch (error) {
      console.error('List files error:', error);
    }
  };

  const handleUploadFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCREMOVED: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        
        // Validate file size (max 50MB)
        if (asset.size && asset.size > 50 * 1024 * 1024) {
          alert('?????? ?????????? ???????? ????????. ???????? ???????????? 50 ????????????????');
          return;
        }

        const base64 = await FileSystem.readAsStringAsync(asset.uri, { 
          encoding: FileSystem.EncodingType.Base64 
        });

        // ??? ?????????? ?????? Kernel ??? CognitiveLoop ??? FilingAgent
        await executeAction('upload_file', {
          file: {
            name: asset.name || 'untitled',
            data: base64,
            type: asset.mimeType || 'application/octet-stream',
            folder: 'default',
          },
        });

        // ?????????????? ?????????? ?????? listenForEvents ?????????? ?????????????? fetchFiles ????????????????
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      alert(error?.message || '?????? ?????? ??????????');
    }
  };

  const handleAnalyze = async (fileId: string) => {
    try {
      // ??? ?????????? ?????? Kernel ??? CognitiveLoop ??? FilingAgent
      await executeAction('ocr_scan', { imageUri: fileId });
      // ?????????????? ?????????? ?????? listenForEvents
    } catch (error) {
      console.error('OCR error', error);
      alert('?????? ??????????????');
    }
  };

  const handleGenerate = async (fileId: string) => {
    try {
      // ??? ?????????? ?????? Kernel ??? CognitiveLoop ??? BuilderAgent
      await executeBuilderAction('generate_code', {
        prompt: `Generate code based on file ${fileId}`,
        extension: 'ts',
        language: 'TypeScript',
      });
    } catch (error) {
      console.error('Generate error:', error);
      alert('?????? ??????????????');
    }
  };

  const handleDownload = async (fileId: string) => {
    try {
      // ??? ?????????? ?????? Kernel ??? CognitiveLoop ??? FilingAgent
      await executeAction('download_file', { fileId });
      alert('???? ?????? ??????????????');
    } catch (error) {
      console.error('Download error:', error);
      alert('?????? ??????????????');
    }
  };

  const handlePreview = (file: FileItem) => {
    setPreviewFile(file);
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setShowHistory(false);
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
        <Text style={[styles.headerTitle, { color: colors.primary }]}>??????????????</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Search Bar */}
        <View style={[styles.searchContainer, { borderColor: colors.primary }]}>
          <Icon name="search" size={20} color={colors.primary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="???????? ???? ??????..."
            plREMOVED={colors.textSecondary}
            value={searchQuery}
            onChangeText={(text) => {
              setSearchQuery(text);
              setShowHistory(false);
            }}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')}>
              <Icon name="close" size={18} color={colors.textSecondary} />
            </Pressable>
          )}
        </View>

        {/* Categories */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
          <Pressable
            style={[
              styles.categoryChip,
              selectedCategory === 'all' && { bREMOVED: colors.primary },
            ]}
            onPress={() => handleCategorySelect('all')}
          >
            <Text style={[styles.categoryText, selectedCategory === 'all' && { color: '#000' }]}>
              ???????? ??????????????
            </Text>
          </Pressable>
          {FILE_CATEGORIES.filter(cat => cat.id !== 'all').map((category) => (
            <Pressable
              key={category.id}
              style={[
                styles.categoryChip,
                selectedCategory === category.id && { bREMOVED: colors.primary },
              ]}
              onPress={() => handleCategorySelect(category.id)}
            >
              <Text style={[styles.categoryText, selectedCategory === category.id && { color: '#000' }]}>
                {category.nameAr}
              </Text>
            </Pressable>
          ))}
          <Pressable
            style={[
              styles.categoryChip,
              showHistory && { bREMOVED: colors.primary },
            ]}
            onPress={() => {
              setShowHistory(true);
              setSelectedCategory('all');
            }}
          >
            <Text style={[styles.categoryText, showHistory && { color: '#000' }]}>
              ??????????????
            </Text>
          </Pressable>
        </ScrollView>

        <Pressable
          style={[styles.uploadButton, { bREMOVED: colors.primary }]}
          onPress={handleUploadFile}
        >
          <Icon name="upload" size={20} color="#000" />
          <Text style={styles.uploadButtonText}>?????? ??????</Text>
        </Pressable>

        <View style={styles.filesList}>
          {files.length === 0 ? (
            <View style={styles.emptyState}>
              <Icon name="folder" size={48} color={colors.textSecondary} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                {searchQuery ? '???? ???????? ??????????' : '???? ???????? ??????????'}
              </Text>
            </View>
          ) : (
            files.map((file) => (
              <View
                key={file.id}
                style={[styles.fileCard, { borderColor: colors.primary }]}
              >
                <View style={styles.fileInfo}>
                  <Icon name={fileManager.getCategory(file.category)?.icon || 'file'} size={24} color={colors.primary} />
                  <View style={styles.fileDetails}>
                    <Text style={[styles.fileName, { color: colors.text }]}>{file.name}</Text>
                    <Text style={[styles.fileMeta, { color: colors.textSecondary }]}>
                      {file.type} ??? {(file.size / 1024).toFixed(2)} KB
                    </Text>
                  </View>
                </View>
                <View style={styles.fileActions}>
                  <Pressable
                    style={[styles.REMOVED, { borderColor: colors.primary }]}
                    onPress={() => handlePreview(file)}
                  >
                    <Icon name="eye" size={18} color={colors.primary} />
                  </Pressable>
                  <Pressable
                    style={[styles.REMOVED, { borderColor: colors.primary }]}
                    onPress={() => handleAnalyze(file.id)}
                  >
                    <Icon name="analytics" size={18} color={colors.primary} />
                  </Pressable>
                  <Pressable
                    style={[styles.REMOVED, { borderColor: colors.primary }]}
                    onPress={() => handleGenerate(file.id)}
                  >
                    <Icon name="create" size={18} color={colors.primary} />
                  </Pressable>
                  <Pressable
                    style={[styles.REMOVED, { borderColor: colors.primary }]}
                    onPress={() => handleDownload(file.id)}
                  >
                    <Icon name="download" size={18} color={colors.primary} />
                  </Pressable>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Preview Modal */}
      <Modal
        visible={previewFile !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setPreviewFile(null)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setPreviewFile(null)}
        >
          <View style={[styles.modalContent, { bREMOVED: colors.background }]}>
            {previewFile && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, { color: colors.text }]}>{previewFile.name}</Text>
                  <Pressable onPress={() => setPreviewFile(null)}>
                    <Icon name="close" size={24} color={colors.text} />
                  </Pressable>
                </View>
                {previewFile.type.startsWith('image/') && (
                  <Image
                    source={{ uri: previewFile.uri }}
                    style={styles.previewImage}
                    resizeMode="contain"
                  />
                )}
                {previewFile.type.startsWith('video/') && (
                  <View style={styles.previewVideo}>
                    <Text style={[styles.previewText, { color: colors.text }]}>
                      ??????????: {previewFile.name}
                    </Text>
                  </View>
                )}
                {!previewFile.type.startsWith('image/') && !previewFile.type.startsWith('video/') && (
                  <View style={styles.previewTextContainer}>
                    <Text style={[styles.previewText, { color: colors.text }]}>
                      ?????? ??????????: {previewFile.type}
                    </Text>
                    <Text style={[styles.previewText, { color: colors.text }]}>
                      ??????????: {(previewFile.size / 1024).toFixed(2)} KB
                    </Text>
                  </View>
                )}
              </>
            )}
          </View>
        </Pressable>
      </Modal>
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
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    marginBottom: 20,
  },
  uploadButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
  filesList: {
    gap: 12,
  },
  fileCard: {
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    bREMOVED: 'rgba(255,255,255,0.03)',
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  fileDetails: {
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
    textAlign: 'right',
  },
  fileMeta: {
    fontSize: 12,
    textAlign: 'right',
  },
  fileActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  REMOVED: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    textAlign: 'right',
  },
  categoriesContainer: {
    marginBottom: 16,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    bREMOVED: 'rgba(255,255,255,0.05)',
  },
  categoryText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 12,
  },
  modalOverlay: {
    flex: 1,
    bREMOVED: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 16,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  previewImage: {
    width: '100%',
    height: 400,
    borderRadius: 12,
  },
  previewVideo: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    bREMOVED: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewTextContainer: {
    padding: 20,
  },
  previewText: {
    fontSize: 14,
    marginBottom: 8,
  },
});










