/**
 * VoiceAgent - وكيل الصوت
 * يدير Voice Realtime، Whisper، ElevenLabs، Voice-to-Voice
 */

import { BaseAgent } from './BaseAgent';
import io from 'socket.io-client';
import { Audio } from 'expo-av';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';

export class VoiceAgent extends BaseAgent {
  private socket: any;
  private recording: Audio.Recording | null = null;
  private sound: Audio.Sound | null = null;
  private isRecording: boolean = false;

  constructor() {
    super({
      id: 'voice',
      name: 'Voice Agent',
      description: 'Voice Realtime, Whisper, ElevenLabs',
      capabilities: [
        'start_recording',
        'stop_recording',
        'transcribe',
        'synthesize_speech',
        'voice_to_voice',
      ],
    });
  }

  protected async onInit(): Promise<void> {
    try {
      // #region agent log
      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/agents/VoiceAgent.ts:onInit',message:'onInit started',data:{apiUrl:API_URL},timestamp:Date.now(),sessionId:'voice-session',runId:'run1',hypothesisId:'VOICE_INIT_START'})}).catch(()=>{});
      }
      // #endregion
      
      // ✅ لا نطلب الأذونات تلقائياً - نطلبها فقط عند الحاجة عبر Cognitive Loop
      // الأذونات ستُطلب عند استدعاء startRecording()
      console.log('[VoiceAgent] Initialized (permissions will be requested when needed)');

      // Connect to voice-realtime namespace
      this.socket = io(`${API_URL}/voice/realtime`, {
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 20000,
      });

      this.socket.on('connect', () => {
        // #region agent log
        if (__DEV__) {
          fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/agents/VoiceAgent.ts:onInit',message:'Socket connected',data:{socketId:this.socket?.id},timestamp:Date.now(),sessionId:'voice-session',runId:'run1',hypothesisId:'VOICE_SOCKET_CONNECTED'})}).catch(()=>{});
        }
        // #endregion
        console.log('[VoiceAgent] Connected to backend ✅');
      });

      this.socket.on('transcription', (data: any) => {
        try {
          // ✅ Safety check: Validate data
          if (!data || typeof data !== 'object') {
            console.warn('[VoiceAgent] Invalid transcription data');
            return;
          }
          this.emit({ type: 'voice:transcription', data });
        } catch (error: any) {
          // #region agent log
          if (__DEV__) {
            fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/agents/VoiceAgent.ts:transcription',message:'Error handling transcription',data:{error:error?.message || error?.toString()},timestamp:Date.now(),sessionId:'voice-session',runId:'run1',hypothesisId:'TRANSCRIPTION_ERROR'})}).catch(()=>{});
          }
          // #endregion
          console.error('[VoiceAgent] Error handling transcription:', error);
        }
      });

      this.socket.on('response', (data: any) => {
        try {
          // ✅ Safety check: Validate data
          if (!data || typeof data !== 'object') {
            console.warn('[VoiceAgent] Invalid response data');
            return;
          }
          this.emit({ type: 'voice:response', data });
          if (data.audioUrl) {
            this.playAudio(data.audioUrl).catch((error: any) => {
              // #region agent log
              if (__DEV__) {
                fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/agents/VoiceAgent.ts:response',message:'Error playing audio',data:{error:error?.message || error?.toString()},timestamp:Date.now(),sessionId:'voice-session',runId:'run1',hypothesisId:'PLAY_AUDIO_ERROR'})}).catch(()=>{});
              }
              // #endregion
              console.error('[VoiceAgent] Error playing audio:', error);
            });
          }
        } catch (error: any) {
          // #region agent log
          if (__DEV__) {
            fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/agents/VoiceAgent.ts:response',message:'Error handling response',data:{error:error?.message || error?.toString()},timestamp:Date.now(),sessionId:'voice-session',runId:'run1',hypothesisId:'RESPONSE_ERROR'})}).catch(()=>{});
          }
          // #endregion
          console.error('[VoiceAgent] Error handling response:', error);
        }
      });

      this.socket.on('error', (error: any) => {
        // #region agent log
        if (__DEV__) {
          fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/agents/VoiceAgent.ts:socket:error',message:'Socket error',data:{error:error?.message || error?.toString()},timestamp:Date.now(),sessionId:'voice-session',runId:'run1',hypothesisId:'SOCKET_ERROR'})}).catch(()=>{});
        }
        // #endregion
        console.error('[VoiceAgent] Error:', error);
        this.emit({ type: 'voice:error', data: error });
      });
      
      // #region agent log
      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/agents/VoiceAgent.ts:onInit',message:'onInit completed',data:{},timestamp:Date.now(),sessionId:'voice-session',runId:'run1',hypothesisId:'VOICE_INIT_SUCCESS'})}).catch(()=>{});
      }
      // #endregion
    } catch (error: any) {
      // #region agent log
      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/agents/VoiceAgent.ts:onInit',message:'onInit failed',data:{error:error?.message || error?.toString()},timestamp:Date.now(),sessionId:'voice-session',runId:'run1',hypothesisId:'VOICE_INIT_ERROR'})}).catch(()=>{});
      }
      // #endregion
      console.error('[VoiceAgent] Socket connection error:', error);
      // لا نرمي الخطأ - نستمر
    }
  }

  protected async onStart(): Promise<void> {
    // Agent is ready
  }

  protected async onStop(): Promise<void> {
    if (this.recording) {
      await this.stopRecording();
    }
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  protected async onExecuteAction(action: string, parameters: any): Promise<any> {
    // #region agent log
    if (__DEV__) {
      fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/agents/VoiceAgent.ts:onExecuteAction',message:'Action execution started',data:{action,hasParameters:!!parameters},timestamp:Date.now(),sessionId:'voice-session',runId:'run1',hypothesisId:'VOICE_ACTION_START'})}).catch(()=>{});
    }
    // #endregion
    
    try {
      // ✅ Safety check: Validate action
      if (!action || typeof action !== 'string') {
        // #region agent log
        if (__DEV__) {
          fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/agents/VoiceAgent.ts:onExecuteAction',message:'Invalid action',data:{action},timestamp:Date.now(),sessionId:'voice-session',runId:'run1',hypothesisId:'INVALID_ACTION'})}).catch(()=>{});
        }
        // #endregion
        throw new Error('Invalid action');
      }
      
      let result: any;
      
      switch (action) {
        case 'enable_voice':
          // ✅ تفعيل الصوت Real-Time
          if (__DEV__) {
            fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/agents/VoiceAgent.ts:enable_voice',message:'Enabling voice',data:{},timestamp:Date.now(),sessionId:'voice-session',runId:'run1',hypothesisId:'VOICE_ENABLE'})}).catch(()=>{});
          }
          this.emit({ type: 'voice:enabled', data: { enabled: true } });
          result = { success: true, enabled: true };
          break;

        case 'disable_voice':
          // ✅ إيقاف الصوت Real-Time
          if (__DEV__) {
            fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/agents/VoiceAgent.ts:disable_voice',message:'Disabling voice',data:{},timestamp:Date.now(),sessionId:'voice-session',runId:'run1',hypothesisId:'VOICE_DISABLE'})}).catch(()=>{});
          }
          if (this.recording) {
            await this.stopRecording();
          }
          this.emit({ type: 'voice:enabled', data: { enabled: false } });
          result = { success: true, enabled: false };
          break;

        case 'start_recording':
          result = await this.startRecording();
          break;

        case 'stop_recording':
          result = await this.stopRecording();
          break;

        case 'transcribe':
          // ✅ Safety check: Validate parameters
          if (!parameters || !parameters.audioUri) {
            throw new Error('audioUri is required');
          }
          result = await this.transcribe(parameters.audioUri);
          break;

        case 'synthesize_speech':
          // ✅ Safety check: Validate parameters
          if (!parameters || !parameters.text) {
            throw new Error('text is required');
          }
          result = await this.synthesizeSpeech(parameters.text);
          break;

        case 'voice_to_voice':
          // ✅ Safety check: Validate parameters
          if (!parameters || !parameters.audioUri) {
            throw new Error('audioUri is required');
          }
          result = await this.voiceToVoice(parameters.audioUri);
          break;

        default:
          // #region agent log
          if (__DEV__) {
            fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/agents/VoiceAgent.ts:onExecuteAction',message:'Unknown action',data:{action},timestamp:Date.now(),sessionId:'voice-session',runId:'run1',hypothesisId:'UNKNOWN_ACTION'})}).catch(()=>{});
          }
          // #endregion
          throw new Error(`Unknown action: ${action}`);
      }
      
      // #region agent log
      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/agents/VoiceAgent.ts:onExecuteAction',message:'Action execution completed',data:{action,hasResult:!!result},timestamp:Date.now(),sessionId:'voice-session',runId:'run1',hypothesisId:'VOICE_ACTION_SUCCESS'})}).catch(()=>{});
      }
      // #endregion
      
      return result;
    } catch (error: any) {
      // #region agent log
      if (__DEV__) {
        fetch('http://127.0.0.1:7243/ingest/3e7bba4a-de65-453d-8490-c9342404637d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'mobile/core/agents/VoiceAgent.ts:onExecuteAction',message:'Action execution failed',data:{action,error:error?.message || error?.toString()},timestamp:Date.now(),sessionId:'voice-session',runId:'run1',hypothesisId:'VOICE_ACTION_ERROR'})}).catch(()=>{});
      }
      // #endregion
      console.error(`[VoiceAgent] Action ${action} failed:`, error);
      throw error;
    }
  }

  /**
   * Start recording
   */
  private async startRecording(): Promise<void> {
    try {
      // ✅ طلب إذن الصوت هنا فقط عند الحاجة
      const { status } = await Audio.getPermissionsAsync();
      if (status !== 'granted') {
        const { status: newStatus } = await Audio.requestPermissionsAsync();
        if (newStatus !== 'granted') {
          throw new Error('Audio permission not granted');
        }
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      this.recording = new Audio.Recording();
      await this.recording.prepareToRecordAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      await this.recording.startAsync();
      this.isRecording = true;
      this.emit({ type: 'voice:recording:started', data: {} });
    } catch (error) {
      console.error('Failed to start recording:', error);
      throw error;
    }
  }

  /**
   * Stop recording
   */
  private async stopRecording(): Promise<string> {
    try {
      if (!this.recording) {
        throw new Error('No recording in progress');
      }

      await this.recording.stopAndUnloadAsync();
      const uri = this.recording.getURI();
      this.recording = null;
      this.isRecording = false;

      this.emit({ type: 'voice:recording:stopped', data: { uri } });
      return uri || '';
    } catch (error) {
      console.error('Failed to stop recording:', error);
      throw error;
    }
  }

  /**
   * Transcribe audio
   */
  private async transcribe(audioUri: string): Promise<string> {
    const formData = new FormData();
    formData.append('audio', {
      uri: audioUri,
      type: 'audio/m4a',
      name: 'recording.m4a',
    } as any);

    const response = await fetch(`${API_URL}/api/voice/transcribe`, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    return data.text;
  }

  /**
   * Synthesize speech
   */
  private async synthesizeSpeech(text: string): Promise<string> {
    const response = await fetch(`${API_URL}/api/voice/synthesize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });

    const data = await response.json();
    return data.audioUrl;
  }

  /**
   * Voice to Voice
   */
  private async voiceToVoice(audioUri: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append('audio', {
        uri: audioUri,
        type: 'audio/m4a',
        name: 'recording.m4a',
      } as any);

      this.socket.emit('voice:realtime', formData);

      this.socket.once('response', (data: any) => {
        resolve(data);
      });

      this.socket.once('error', (error: any) => {
        reject(error);
      });
    });
  }

  /**
   * Play audio
   */
  private async playAudio(audioUrl: string): Promise<void> {
    try {
      if (this.sound) {
        await this.sound.unloadAsync();
      }

      const { sound } = await Audio.Sound.createAsync({ uri: audioUrl });
      this.sound = sound;
      await sound.playAsync();

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          this.emit({ type: 'voice:playback:finished', data: {} });
        }
      });
    } catch (error) {
      console.error('Failed to play audio:', error);
      throw error;
    }
  }
}

