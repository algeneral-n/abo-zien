/**
 * RARE 4N - Voice Realtime Routes
 * WebSocket endpoint للصوت الريل تايم
 */

import { transcribeWithWhisper } from '../services/whisperService.js';
import { textToSpeech } from '../services/elevenlabsService.js';

/**
 * Initialize Voice Realtime WebSocket
 */
export function initializeVoiceRealtime(io) {
  const voiceNamespace = io.of('/voice/realtime');

  voiceNamespace.on('connection', (socket) => {
    console.log('✅ Voice Realtime client connected:', socket.id);

    socket.on('audio-input', async (data) => {
      try {
        const { audio, language = 'ar' } = data || {};

        if (!audio) {
          socket.emit('error', { error: 'Missing audio data' });
          return;
        }

        // 1. Transcribe with Whisper
        const transcription = await transcribeWithWhisper(audio, language);

        // Emit transcription
        socket.emit('transcription', { text: transcription });

        // 2. Process with Cognitive Loop (conceptual)
        // In production, this would go through RAREKernel
        const response = await generateResponse(transcription);

        // Emit text response
        socket.emit('assistant-response-text', { text: response });

        // 3. Generate speech with ElevenLabs
        const audioResponse = await textToSpeech(response, undefined, language);

        // Emit audio response
        socket.emit('assistant-audio', { audio: audioResponse });
      } catch (error) {
        console.error('Voice Realtime error:', error);
        socket.emit('error', { error: error.message });
      }
    });

    socket.on('disconnect', () => {
      console.log('❌ Voice Realtime client disconnected:', socket.id);
    });
  });
}


/**
 * Generate response using AI (GPT-4/Claude)
 * ✅ Uses AI service for intelligent responses
 */
async function generateResponse(text) {
  try {
    const OPENAI_KEY=REPLACE_ME
    const ANTHROPIC_KEY=REPLACE_ME
    
    // Use OpenAI GPT-4 by default, fallback to Claude
    const apiKey = OPENAI_KEY=REPLACE_ME
    if (!apiKey) {
      throw new Error('No AI API key configured');
    }

    // Use OpenAI if available
    if (OPENAI_KEY=REPLACE_ME
      const axios = (await import('axios')).default;
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: 'You are RARE, an intelligent AI assistant. Respond naturally and helpfully in Arabic or the user\'s language.',
            },
            {
              role: 'user',
              content: text,
            },
          ],
          temperature: 0.7,
          max_tokens: 500,
        },
        {
          headers: {
            'Authorization': `Bearer ${OPENAI_KEY=REPLACE_ME
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data.choices[0].message.content;
    }

    // Fallback to Claude
    if (ANTHROPIC_KEY=REPLACE_ME
      const axios = (await import('axios')).default;
      const response = await axios.post(
        'https://api.anthropic.com/v1/messages',
        {
          model: 'claude-3-opus-20240229',
          max_tokens: 500,
          messages: [
            {
              role: 'user',
              content: text,
            },
          ],
        },
        {
          headers: {
            'x-api-key': ANTHROPIC_KEY=REPLACE_ME
            'anthropic-version': '2023-06-01',
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data.content[0].text;
    }

    throw new Error('No AI service available');
  } catch (error) {
    console.error('Response generation error:', error);
    // Fallback response
    return `تم استقبال: ${text}. كيف يمكنني مساعدتك؟`;
  }
}

