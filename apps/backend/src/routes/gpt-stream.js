/**
 * RARE 4N - GPT Realtime Streaming Routes
 * WebSocket endpoint ?????? GPT Realtime Streaming
 */

import axios from 'axios';

const OPENAI_KEY=REPLACE_ME

/**
 * Initialize GPT Streaming WebSocket
 */
export function initializeGPTStreaming(io) {
  const gptNamespace = io.of('/gpt/stream');

  gptNamespace.on('connection', (socket) => {
    console.log('??? GPT Stream client connected:', socket.id);

    socket.on('message', async (data) => {
      try {
        const { message } = data;

        if (!OPENAI_KEY=REPLACE_ME
          socket.emit('error', { error: 'OpenAI API key not configured' });
          return;
        }

        // Stream response from OpenAI
        const response = await axios.post(
          'https://api.openai.com/v1/chat/completions',
          {
            model: 'gpt-4o',
            messages: [
              {
                role: 'system',
                content: 'You are RARE, an advanced AI assistant. Respond in Arabic when the user writes in Arabic.',
              },
              {
                role: 'user',
                content: message,
              },
            ],
            stream: true,
            temperature: 0.7,
            max_tokens: 2000,
          },
          {
            headers: {
              'Authorization': `Bearer ${OPENAI_KEY=REPLACE_ME
              'Content-Type': 'application/json',
            },
            responseType: 'stream',
          }
        );

        let fullText = '';

        response.data.on('data', (chunk) => {
          const lines = chunk.toString().split('\n').filter(line => line.trim() !== '');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              
              if (data === '[DONE]') {
                socket.emit('done', { fullText });
                return;
              }

              try {
                const json = JSON.parse(data);
                const token = json.choices[0]?.delta?.content || '';
                
                if (token) {
                  fullText += token;
                  socket.emit('token', { token });
                }
              } catch (error) {
                // Skip invalid JSON
              }
            }
          }
        });

        response.data.on('end', () => {
          socket.emit('done', { fullText });
        });

        response.data.on('error', (error) => {
          console.error('GPT Stream error:', error);
          socket.emit('error', { error: error.message });
        });

      } catch (error) {
        console.error('GPT Stream error:', error);
        socket.emit('error', { error: error.message });
      }
    });

    socket.on('disconnect', () => {
      console.log('??? GPT Stream client disconnected:', socket.id);
    });
  });
}



