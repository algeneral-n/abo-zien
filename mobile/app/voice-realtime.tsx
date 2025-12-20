/**
 * RARE 4N - Voice Realtime Screen
 * ???????? ?????????? ?????????? ???????? - Full-duplex Voice-to-Voice
 * ??? Cognitive Loop ??? Kernel ??? Voice Agent
 */

import { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
  REMOVED,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { RAREKernel } from '../core/RAREKernel';
import { useTheme } from '../hooks/useTheme';
import Icon from '../components/Icon';
import io from 'socket.io-client';
import { API_URL } from '../services/config';

const WS_BASE = API_URL || 'http://localhost:5000';

export default function VoiceRealtime() {
  const [isRecording, setIsRecording] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [assistantResponse, setAssistantResponse] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [socket, setSocket] = useState<any>(null);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  
  const { theme, colors } = useTheme();
  const kernel = RAREKernel.getInstance();

  useEffect(() => {
    // ??? ???????????????? ???????????? Kernel ?????? - ???? ?????????? ????????????
    const unsubscribeVoice = kernel.on('voice:enabled', (event) => {
      if (event.data.enabled && !socket) {
        // Connect to WebSocket only when voice is enabled via Kernel
        const newSocket = io(`${WS_BASE}/voice/realtime`, {
          transports: ['websocket'],
        });

        newSocket.on('connect', () => {
          console.log('Connected to voice stream');
        });

        newSocket.on('transcription', (data: { text: string }) => {
          setTranscription(data.text);
          // ??? ?????????? ???????? ?????? Kernel ??? CognitiveLoop
          kernel.emit({
            type: 'user:input',
            data: {
              text: data.text,
              type: 'voice',
            },
            source: 'voice',
          });
        });

        newSocket.on('assistant-response-text', (data: { text: string }) => {
          setAssistantResponse(data.text);
        });

        newSocket.on('assistant-audio', async (data: { audio: string }) => {
          // Play audio response
          try {
            const { sound } = await Audio.Sound.createAsync(
              { uri: `data:audio/mp3;base64,${data.audio}` },
              { shouldPlay: true }
            );
            soundRef.current = sound;
            setIsPlaying(true);
            await sound.playAsync();
            setIsPlaying(false);
          } catch (error) {
            console.error('Audio playback error:', error);
          }
        });

        newSocket.on('error', (error: any) => {
          console.error('Voice stream error:', error);
        });

        setSocket(newSocket);
      }
    });

    // ??? ???????????????? ???????????? CognitiveLoop ??? Voice Agent
    const unsubscribeVoiceCommand = kernel.on('agent:voice:execute', (event) => {
      if (event.data.action === 'start-recording' && socket) {
        startRecording();
      } else if (event.data.action === 'stop-recording' && socket) {
        stopRecording();
      }
    });

    return () => {
      unsubscribeVoice();
      unsubscribeVoiceCommand();
      if (socket) {
        socket.disconnect();
      }
      if (recordingRef.current) {
        recordingRef.current.stopAndUnloadAsync();
      }
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, [socket]);

  const startRecording = async () => {
    try {
      // ??? ???? ???????? ???????????????? ???????????????? - ???????????? ?????? ?????? ????????????
      // Check permission first
      const { status } = await Audio.getPermissionsAsync();
      
      if (status !== 'granted') {
        // ??? ?????????? ?????? Kernel ??? Cognitive Loop ?????????? ?????? ??????????
        const kernel = RAREKernel.getInstance();
        kernel.emit({
          type: 'user:input',
          data: {
            text: 'request audio permission',
            type: 'permission',
            permission: 'audio',
          },
          source: 'voice-realtime',
        });
        
        // ??? ???????????????? ???????????? ?????? ??????????
        const unsubscribe = kernel.on('permission:result', (event) => {
          if (event.data.permission === 'audio' && event.data.granted) {
            // Retry recording after permission granted
            startRecording();
          }
          unsubscribe();
        });
        
        return;
      }
      
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      recordingRef.current = recording;
      setIsRecording(true);
      setIsListening(true);

      // ???? ?????????? ?????????? ?????????????? ?????????????? ?????????? ?????????? ?????? ??????????????
    } catch (error) {
      console.error('Recording error:', error);
    }
  };

  const stopRecording = async () => {
    try {
      if (recordingRef.current) {
        await recordingRef.current.stopAndUnloadAsync();
        const uri = recordingRef.current.getURI();
        setIsRecording(false);
        setIsListening(false);

        // ?????????? ?????????? ?????????????? ?????? ??????????????
        if (uri && socket) {
          try {
            const base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
            socket.emit('audio-input', {
              audio: base64,
              language: 'ar',
            });
          } catch (err) {
            console.error('Audio read/send error:', err);
          }
        }
      }
    } catch (error) {
      console.error('Stop recording error:', error);
    }
  };

  const handleToggleVoice = () => {
    // ??? ?????????? ?????? Kernel ??? CognitiveLoop (???? ?????????? ??????????)
    kernel.emit({
      type: 'user:input',
      data: {
        text: isRecording ? 'stop voice recording' : 'start voice recording',
        type: 'voice',
      },
      source: 'ui',
    });
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
        <Text style={[styles.headerTitle, { color: colors.primary }]}>?????????? ?????????? ????????</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <View style={[styles.statusCard, { borderColor: colors.primary }]}>
          <Text style={[styles.statusTitle, { color: colors.primary }]}>????????????</Text>
          <Text style={[styles.statusText, { color: colors.text }]}>
            {isRecording ? '???????? ??????????????...' : isListening ? '???????? ????????????????...' : socket ? '????????' : '?????? ????????'}
          </Text>
        </View>

        <Pressable
          style={[
            styles.voiceButton,
            {
              bREMOVED: isRecording ? '#ff0000' : socket ? colors.primary : '#666',
              borderColor: colors.primary,
            },
          ]}
          onPress={handleToggleVoice}
          disabled={!socket}
        >
          {isRecording ? (
            <REMOVED color="#fff" />
          ) : (
            <Icon name="mic" size={48} color="#fff" />
          )}
        </Pressable>

        {transcription && (
          <View style={[styles.transcriptionCard, { borderColor: colors.primary }]}>
            <Text style={[styles.cardTitle, { color: colors.primary }]}>????????</Text>
            <Text style={[styles.transcriptionText, { color: colors.text }]}>
              {transcription}
            </Text>
          </View>
        )}

        {assistantResponse && (
          <View style={[styles.responseCard, { borderColor: colors.primary }]}>
            <Text style={[styles.cardTitle, { color: colors.primary }]}>????????</Text>
            <Text style={[styles.responseText, { color: colors.text }]}>
              {assistantResponse}
            </Text>
            {isPlaying && (
              <REMOVED size="small" color={colors.primary} style={styles.playingIndicator} />
            )}
          </View>
        )}
      </View>
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
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  statusCard: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 30,
    bREMOVED: 'rgba(255,255,255,0.03)',
    minWidth: '80%',
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'right',
  },
  statusText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  voiceButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  transcriptionCard: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 20,
    bREMOVED: 'rgba(255,255,255,0.03)',
    minWidth: '90%',
  },
  responseCard: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    bREMOVED: 'rgba(255,255,255,0.03)',
    minWidth: '90%',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'right',
  },
  transcriptionText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'right',
  },
  responseText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'right',
  },
  playingIndicator: {
    marginTop: 12,
  },
});


