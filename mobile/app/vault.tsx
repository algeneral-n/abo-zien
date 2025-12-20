/**
 * RARE 4N - Vault Screen
 * ???????? ?????????? ???????????? - ???????? ???????????? ???????? ?????????????? ????????
 * ??? Cognitive Loop ??? Kernel ??? Vault Agent
 * ??? Debug Logging ????????
 * ??? Error Handling ????????
 * ??? ?????????????? ???? ????????????????
 */

import { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
  Image,
  Modal,
  REMOVED,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { RAREKernel } from '../core/RAREKernel';
import { useTheme } from '../hooks/useTheme';
import { useKernelAgent } from '../hooks/useKernelAgent';
import Icon from '../components/Icon';

export default function Vault() {
  const [files, setFiles] = useState<Array<{ id: string; name: string; type: string; size: number; encrypted: boolean; createdAt?: string }>>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [previewFile, setPreviewFile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { theme, colors } = useTheme();
  const kernel = RAREKernel.getInstance();
  const { executeAction, listenForEvents } = useKernelAgent('vault');

  useEffect(() => {
    // #region agent log
    if (__DEV__) {
      fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/app/vault.tsx:useEffect',message:'Vault screen mounted',data:{},timestamp:Date.now(),sessionId:'vault-ui-session',runId:'run1',hypothesisId:'VAULT_UI_MOUNT'})}).catch(()=>{});
    }
    // #endregion

    try {
      // Load vault items on mount
      loadVaultItems();

      // ??? ???????????????? ???????????? CognitiveLoop ??? Agent ??? Response
      const unsubscribeVault = listenForEvents('agent:vault:response', (data) => {
        // #region agent log
        if (__DEV__) {
          fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/app/vault.tsx:useEffect',message:'Vault response received',data:{hasFiles:!!data.files,hasFile:!!data.file,hasAuthenticated:data.authenticated !== undefined},timestamp:Date.now(),sessionId:'vault-ui-session',runId:'run1',hypothesisId:'VAULT_UI_RESPONSE'})}).catch(()=>{});
        }
        // #endregion

        try {
          if (data.items || data.files) {
            const items = data.items || data.files || [];
            setFiles(items);
            setIsLoading(false);
          }
          if (data.authenticated !== undefined) {
            setIsAuthenticated(data.authenticated);
          }
          if (data.file) {
            setSelectedFile(data.file);
          }
          if (data.preview) {
            setPreviewFile(data.preview);
          }
          if (data.scan) {
            Alert.alert('?????????? ??????????', data.scan.text || JSON.stringify(data.scan));
          }
          setError(null);
        } catch (updateError: any) {
          // #region agent log
          if (__DEV__) {
            fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/app/vault.tsx:useEffect',message:'Vault response update error',data:{error:updateError.message},timestamp:Date.now(),sessionId:'vault-ui-session',runId:'run1',hypothesisId:'VAULT_UI_UPDATE_ERROR'})}).catch(()=>{});
          }
          // #endregion
          console.error('Vault response update error:', updateError);
          setError('?????? ?????????? ????????????????');
        }
      });

      const unsubscribeError = listenForEvents('agent:vault:error', (data) => {
        // #region agent log
        if (__DEV__) {
          fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/app/vault.tsx:useEffect',message:'Vault error received',data:{error:data.error},timestamp:Date.now(),sessionId:'vault-ui-session',runId:'run1',hypothesisId:'VAULT_UI_ERROR'})}).catch(()=>{});
        }
        // #endregion
        setError(data.error || '?????? ??????');
        setIsLoading(false);
        Alert.alert('??????', data.error || '?????? ??????');
      });

      const unsubscribeUploaded = listenForEvents('vault:uploaded', (data) => {
        // #region agent log
        if (__DEV__) {
          fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/app/vault.tsx:useEffect',message:'Vault file uploaded',data:{fileId:data.fileId},timestamp:Date.now(),sessionId:'vault-ui-session',runId:'run1',hypothesisId:'VAULT_UI_UPLOADED'})}).catch(()=>{});
        }
        // #endregion
        loadVaultItems();
        Alert.alert('??????', '???? ?????? ?????????? ??????????');
      });

      const unsubscribeDeleted = listenForEvents('vault:deleted', (data) => {
        // #region agent log
        if (__DEV__) {
          fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/app/vault.tsx:useEffect',message:'Vault file deleted',data:{fileId:data.fileId},timestamp:Date.now(),sessionId:'vault-ui-session',runId:'run1',hypothesisId:'VAULT_UI_DELETED'})}).catch(()=>{});
        }
        // #endregion
        loadVaultItems();
        Alert.alert('??????', '???? ?????? ?????????? ??????????');
      });
    
      return () => {
        unsubscribeVault();
        unsubscribeError();
        unsubscribeUploaded();
        unsubscribeDeleted();
      };
    } catch (error: any) {
      // #region agent log
      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/app/vault.tsx:useEffect',message:'Vault useEffect error',data:{error:error.message,stack:error.stack},timestamp:Date.now(),sessionId:'vault-ui-session',runId:'run1',hypothesisId:'VAULT_UI_EFFECT_ERROR'})}).catch(()=>{});
      }
      // #endregion
      console.error('Vault useEffect error:', error);
      setError('?????? ?????????? ????????????????');
    }
  }, []);

  const loadVaultItems = async () => {
    try {
      // #region agent log
      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/app/vault.tsx:loadVaultItems',message:'Load vault items started',data:{},timestamp:Date.now(),sessionId:'vault-ui-session',runId:'run1',hypothesisId:'VAULT_UI_LOAD_START'})}).catch(()=>{});
      }
      // #endregion

      setIsLoading(true);
      setError(null);

      const result = await executeAction('list_vault_items', {});

      if (result && result.items) {
        setFiles(result.items);
        // #region agent log
        if (__DEV__) {
          fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/app/vault.tsx:loadVaultItems',message:'Load vault items success',data:{itemCount:result.items.length},timestamp:Date.now(),sessionId:'vault-ui-session',runId:'run1',hypothesisId:'VAULT_UI_LOAD_SUCCESS'})}).catch(()=>{});
        }
        // #endregion
      }
      setIsLoading(false);
    } catch (error: any) {
      // #region agent log
      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/app/vault.tsx:loadVaultItems',message:'Load vault items error',data:{error:error.message,stack:error.stack},timestamp:Date.now(),sessionId:'vault-ui-session',runId:'run1',hypothesisId:'VAULT_UI_LOAD_ERROR'})}).catch(()=>{});
      }
      // #endregion
      console.error('Load vault items error:', error);
      setError('?????? ?????????? ??????????????');
      setIsLoading(false);
      Alert.alert('??????', '?????? ?????????? ??????????????');
    }
  };

  const handleUploadFile = async () => {
    try {
      // #region agent log
      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/app/vault.tsx:handleUploadFile',message:'Upload file started',data:{},timestamp:Date.now(),sessionId:'vault-ui-session',runId:'run1',hypothesisId:'VAULT_UI_UPLOAD_START'})}).catch(()=>{});
      }
      // #endregion

      setIsLoading(true);
      setError(null);

      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCREMOVED: true,
      });

      if (result.canceled) {
        setIsLoading(false);
        return;
      }

      if (!result.assets || result.assets.length === 0) {
        throw new Error('No file selected');
      }

      const asset = result.assets[0];
      if (!asset.uri || !asset.name) {
        throw new Error('Invalid file data');
      }

      // ??? ?????????????? VaultAgent ????????????
      await executeAction('upload_file', {
        fileUri: asset.uri,
        name: asset.name,
        type: asset.mimeType || 'application/octet-stream',
      });

      // #region agent log
      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/app/vault.tsx:handleUploadFile',message:'Upload file success',data:{fileName:asset.name,fileSize:asset.size},timestamp:Date.now(),sessionId:'vault-ui-session',runId:'run1',hypothesisId:'VAULT_UI_UPLOAD_SUCCESS'})}).catch(()=>{});
      }
      // #endregion

      setIsLoading(false);
      await loadVaultItems();
    } catch (error: any) {
      // #region agent log
      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/app/vault.tsx:handleUploadFile',message:'Upload file error',data:{error:error.message,stack:error.stack},timestamp:Date.now(),sessionId:'vault-ui-session',runId:'run1',hypothesisId:'VAULT_UI_UPLOAD_ERROR'})}).catch(()=>{});
      }
      // #endregion
      console.error('Upload error:', error);
      setError('?????? ?????? ??????????');
      setIsLoading(false);
      Alert.alert('??????', error.message || '?????? ?????? ??????????');
    }
  };

  const handleUploadImage = async () => {
    try {
      // #region agent log
      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/app/vault.tsx:handleUploadImage',message:'Upload image started',data:{},timestamp:Date.now(),sessionId:'vault-ui-session',runId:'run1',hypothesisId:'VAULT_UI_UPLOAD_IMAGE_START'})}).catch(()=>{});
      }
      // #endregion

      setIsLoading(true);
      setError(null);

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (result.canceled) {
        setIsLoading(false);
        return;
      }

      if (!result.assets || result.assets.length === 0) {
        throw new Error('No image selected');
      }

      const asset = result.assets[0];
      if (!asset.uri) {
        throw new Error('Invalid image data');
      }

      const fileName = asset.uri.split('/').pop() || `image_${Date.now()}.jpg`;

      // ??? ?????????????? VaultAgent ????????????
      await executeAction('upload_file', {
        fileUri: asset.uri,
        name: fileName,
        type: asset.type || 'image/jpeg',
      });

      // #region agent log
      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/app/vault.tsx:handleUploadImage',message:'Upload image success',data:{fileName,fileSize:asset.fileSize || 0},timestamp:Date.now(),sessionId:'vault-ui-session',runId:'run1',hypothesisId:'VAULT_UI_UPLOAD_IMAGE_SUCCESS'})}).catch(()=>{});
      }
      // #endregion

      setIsLoading(false);
      await loadVaultItems();
    } catch (error: any) {
      // #region agent log
      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/app/vault.tsx:handleUploadImage',message:'Upload image error',data:{error:error.message,stack:error.stack},timestamp:Date.now(),sessionId:'vault-ui-session',runId:'run1',hypothesisId:'VAULT_UI_UPLOAD_IMAGE_ERROR'})}).catch(()=>{});
      }
      // #endregion
      console.error('Upload image error:', error);
      setError('?????? ?????? ????????????');
      setIsLoading(false);
      Alert.alert('??????', error.message || '?????? ?????? ????????????');
    }
  };

  const handleDownload = async (fileId: string) => {
    try {
      // #region agent log
      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/app/vault.tsx:handleDownload',message:'Download file started',data:{fileId},timestamp:Date.now(),sessionId:'vault-ui-session',runId:'run1',hypothesisId:'VAULT_UI_DOWNLOAD_START'})}).catch(()=>{});
      }
      // #endregion

      if (!fileId || typeof fileId !== 'string') {
        throw new Error('Invalid file ID');
      }

      setIsLoading(true);
      setError(null);

      // ??? ?????????????? VaultAgent ????????????
      const result = await executeAction('download_file', { fileId });

      // #region agent log
      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/app/vault.tsx:handleDownload',message:'Download file success',data:{fileId,hasBlob:!!result.blob},timestamp:Date.now(),sessionId:'vault-ui-session',runId:'run1',hypothesisId:'VAULT_UI_DOWNLOAD_SUCCESS'})}).catch(()=>{});
      }
      // #endregion

      setIsLoading(false);
      Alert.alert('??????', '???? ?????????? ?????????? ??????????');
    } catch (error: any) {
      // #region agent log
      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/app/vault.tsx:handleDownload',message:'Download file error',data:{error:error.message,stack:error.stack,fileId},timestamp:Date.now(),sessionId:'vault-ui-session',runId:'run1',hypothesisId:'VAULT_UI_DOWNLOAD_ERROR'})}).catch(()=>{});
      }
      // #endregion
      console.error('Download error:', error);
      setError('?????? ?????????? ??????????');
      setIsLoading(false);
      Alert.alert('??????', error.message || '?????? ?????????? ??????????');
    }
  };

  const handlePreview = async (fileId: string) => {
    try {
      // #region agent log
      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/app/vault.tsx:handlePreview',message:'Preview file started',data:{fileId},timestamp:Date.now(),sessionId:'vault-ui-session',runId:'run1',hypothesisId:'VAULT_UI_PREVIEW_START'})}).catch(()=>{});
      }
      // #endregion

      if (!fileId || typeof fileId !== 'string') {
        throw new Error('Invalid file ID');
      }

      setIsLoading(true);
      setError(null);

      // ??? ?????????????? VaultAgent ????????????
      const preview = await executeAction('preview_file', { fileId });

      // #region agent log
      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/app/vault.tsx:handlePreview',message:'Preview file success',data:{fileId,previewType:preview?.type},timestamp:Date.now(),sessionId:'vault-ui-session',runId:'run1',hypothesisId:'VAULT_UI_PREVIEW_SUCCESS'})}).catch(()=>{});
      }
      // #endregion

      setPreviewFile(preview);
      setIsLoading(false);
    } catch (error: any) {
      // #region agent log
      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/app/vault.tsx:handlePreview',message:'Preview file error',data:{error:error.message,stack:error.stack,fileId},timestamp:Date.now(),sessionId:'vault-ui-session',runId:'run1',hypothesisId:'VAULT_UI_PREVIEW_ERROR'})}).catch(()=>{});
      }
      // #endregion
      console.error('Preview error:', error);
      setError('?????? ???????????? ??????????');
      setIsLoading(false);
      Alert.alert('??????', error.message || '?????? ???????????? ??????????');
    }
  };

  const handleScan = async (fileId: string) => {
    try {
      // #region agent log
      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/app/vault.tsx:handleScan',message:'Scan file started',data:{fileId},timestamp:Date.now(),sessionId:'vault-ui-session',runId:'run1',hypothesisId:'VAULT_UI_SCAN_START'})}).catch(()=>{});
      }
      // #endregion

      if (!fileId || typeof fileId !== 'string') {
        throw new Error('Invalid file ID');
      }

      setIsLoading(true);
      setError(null);

      // ??? ?????????????? VaultAgent ????????????
      const scanResult = await executeAction('scan_file', { fileId });

      // #region agent log
      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/app/vault.tsx:handleScan',message:'Scan file success',data:{fileId,scanType:scanResult?.type},timestamp:Date.now(),sessionId:'vault-ui-session',runId:'run1',hypothesisId:'VAULT_UI_SCAN_SUCCESS'})}).catch(()=>{});
      }
      // #endregion

      setIsLoading(false);
      Alert.alert('?????????? ??????????', scanResult?.text || JSON.stringify(scanResult));
    } catch (error: any) {
      // #region agent log
      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/app/vault.tsx:handleScan',message:'Scan file error',data:{error:error.message,stack:error.stack,fileId},timestamp:Date.now(),sessionId:'vault-ui-session',runId:'run1',hypothesisId:'VAULT_UI_SCAN_ERROR'})}).catch(()=>{});
      }
      // #endregion
      console.error('Scan error:', error);
      setError('?????? ?????? ??????????');
      setIsLoading(false);
      Alert.alert('??????', error.message || '?????? ?????? ??????????');
    }
  };

  const handleDelete = async (fileId: string) => {
    try {
      // #region agent log
      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/app/vault.tsx:handleDelete',message:'Delete file started',data:{fileId},timestamp:Date.now(),sessionId:'vault-ui-session',runId:'run1',hypothesisId:'VAULT_UI_DELETE_START'})}).catch(()=>{});
      }
      // #endregion

      if (!fileId || typeof fileId !== 'string') {
        throw new Error('Invalid file ID');
      }

      Alert.alert(
        '?????????? ??????????',
        '???? ?????? ?????????? ???? ?????? ?????? ????????????',
        [
          { text: '??????????', style: 'cancel' },
          {
            text: '??????',
            style: 'destructive',
            onPress: async () => {
              try {
                setIsLoading(true);
                setError(null);

                // ??? ?????????????? VaultAgent ???????????? (?????? ???? Backend)
                // Note: VaultAgent doesn't have delete action, so we'll use kernel emit
                kernel.emit({
                  type: 'user:input',
                  data: {
                    text: 'delete file from vault',
                    type: 'vault',
                    action: 'delete',
                    fileId,
                  },
                  source: 'ui',
                });

                // #region agent log
                if (__DEV__) {
                  fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/app/vault.tsx:handleDelete',message:'Delete file success',data:{fileId},timestamp:Date.now(),sessionId:'vault-ui-session',runId:'run1',hypothesisId:'VAULT_UI_DELETE_SUCCESS'})}).catch(()=>{});
                }
                // #endregion

                setIsLoading(false);
                await loadVaultItems();
              } catch (deleteError: any) {
                // #region agent log
                if (__DEV__) {
                  fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/app/vault.tsx:handleDelete',message:'Delete file error',data:{error:deleteError.message,stack:deleteError.stack,fileId},timestamp:Date.now(),sessionId:'vault-ui-session',runId:'run1',hypothesisId:'VAULT_UI_DELETE_ERROR'})}).catch(()=>{});
                }
                // #endregion
                console.error('Delete error:', deleteError);
                setError('?????? ?????? ??????????');
                setIsLoading(false);
                Alert.alert('??????', deleteError.message || '?????? ?????? ??????????');
              }
            },
          },
        ]
      );
    } catch (error: any) {
      // #region agent log
      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/app/vault.tsx:handleDelete',message:'Delete file validation error',data:{error:error.message,fileId},timestamp:Date.now(),sessionId:'vault-ui-session',runId:'run1',hypothesisId:'VAULT_UI_DELETE_VALIDATION_ERROR'})}).catch(()=>{});
      }
      // #endregion
      console.error('Delete validation error:', error);
      Alert.alert('??????', error.message || '???????? ?????? ?????? ????????');
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
        <Text style={[styles.headerTitle, { color: colors.primary }]}>?????????? ????????????</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {error && (
          <View style={[styles.errorContainer, { bREMOVED: colors.error + '20', borderColor: colors.error }]}>
            <Icon name="error" size={20} color={colors.error} />
            <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
          </View>
        )}

        <View style={[styles.uploadSection, { borderColor: colors.primary }]}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>?????? ??????????</Text>
          <View style={styles.uploadButtons}>
            <Pressable
              style={[styles.uploadButton, { bREMOVED: colors.primary, opacity: isLoading ? 0.5 : 1 }]}
              onPress={handleUploadFile}
              disabled={isLoading}
            >
              <Icon name="folder" size={20} color="#000" />
              <Text style={styles.uploadButtonText}>?????? ??????</Text>
            </Pressable>
            <Pressable
              style={[styles.uploadButton, { bREMOVED: colors.primary, opacity: isLoading ? 0.5 : 1 }]}
              onPress={handleUploadImage}
              disabled={isLoading}
            >
              <Icon name="image" size={20} color="#000" />
              <Text style={styles.uploadButtonText}>?????? ????????</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.filesSection}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.primary }]}>?????????????? ({files.length})</Text>
            {isLoading && <REMOVED size="small" color={colors.primary} />}
          </View>
          {files.length === 0 && !isLoading ? (
            <View style={styles.emptyContainer}>
              <Icon name="folder-open" size={48} color={colors.textSecondary} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>???? ???????? ??????????</Text>
            </View>
          ) : (
            files.map((file) => (
              <View
                key={file.id}
                style={[styles.fileCard, { borderColor: colors.primary }]}
              >
                <View style={styles.fileInfo}>
                  <Icon name="file" size={24} color={colors.primary} />
                  <View style={styles.fileDetails}>
                    <Text style={[styles.fileName, { color: colors.text }]}>{file.name}</Text>
                    <Text style={[styles.fileMeta, { color: colors.textSecondary }]}>
                      {file.type} ??? {file.size ? `${(file.size / 1024).toFixed(2)} KB` : '?????? ??????????'}
                    </Text>
                  </View>
                </View>
                <View style={styles.fileActions}>
                  <Pressable
                    style={[styles.REMOVED, { borderColor: colors.primary }]}
                    onPress={() => handleDownload(file.id)}
                    disabled={isLoading}
                  >
                    <Icon name="download" size={18} color={colors.primary} />
                  </Pressable>
                  <Pressable
                    style={[styles.REMOVED, { borderColor: colors.primary }]}
                    onPress={() => handlePreview(file.id)}
                    disabled={isLoading}
                  >
                    <Icon name="eye" size={18} color={colors.primary} />
                  </Pressable>
                  <Pressable
                    style={[styles.REMOVED, { borderColor: colors.primary }]}
                    onPress={() => handleScan(file.id)}
                    disabled={isLoading}
                  >
                    <Icon name="scan" size={18} color={colors.primary} />
                  </Pressable>
                  <Pressable
                    style={[styles.REMOVED, { borderColor: colors.error }]}
                    onPress={() => handleDelete(file.id)}
                    disabled={isLoading}
                  >
                    <Icon name="delete" size={18} color={colors.error} />
                  </Pressable>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Preview Modal */}
      <Modal
        visible={!!previewFile}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setPreviewFile(null)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { bREMOVED: colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.primary }]}>???????????? ??????????</Text>
              <Pressable onPress={() => setPreviewFile(null)}>
                <Icon name="close" size={24} color={colors.text} />
              </Pressable>
            </View>
            <ScrollView style={styles.modalBody}>
              {previewFile?.isImage && previewFile?.data ? (
                <Image
                  source={{ uri: `data:${previewFile.type};base64,${previewFile.data}` }}
                  style={styles.previewImage}
                  resizeMode="contain"
                />
              ) : previewFile?.isText && previewFile?.data ? (
                <Text style={[styles.previewText, { color: colors.text }]}>{previewFile.data}</Text>
              ) : (
                <Text style={[styles.previewText, { color: colors.textSecondary }]}>
                  ???? ???????? ???????????? ?????? ?????????? ???? ??????????????
                </Text>
              )}
            </ScrollView>
          </View>
        </View>
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
  uploadSection: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 30,
    bREMOVED: 'rgba(255,255,255,0.03)',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    textAlign: 'right',
  },
  uploadButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  uploadButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
  },
  uploadButtonText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '600',
  },
  filesSection: {
    marginTop: 20,
  },
  fileCard: {
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
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
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 20,
    gap: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    textAlign: 'right',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 12,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    bREMOVED: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 12,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalBody: {
    maxHeight: 500,
  },
  previewImage: {
    width: '100%',
    height: 400,
    borderRadius: 8,
  },
  previewText: {
    fontSize: 14,
    lineHeight: 24,
    textAlign: 'right',
  },
});



