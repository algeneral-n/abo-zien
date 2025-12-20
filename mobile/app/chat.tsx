/**
 * RARE 4N - Chat Screen
 * ???????? ?????????????? - GPT Realtime Streaming
 * ??? Cognitive Loop ??? Kernel ??? AI Agent
 */

import { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { RAREKernel } from '../core/RAREKernel';
import { useTheme } from '../hooks/useTheme';
import Icon from '../components/Icon';
import RARECharacter from '../components/RARECharacter';
import NamesTunnel from '../components/NamesTunnel';
export default function Chat() {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [inputText, setInputText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);
  
  const { theme, colors } = useTheme();
  const kernel = RAREKernel.getInstance();

  useEffect(() => {
    // ??? ???????????????? ???????????? CognitiveLoop ??? CommunicationAgent
    const unsubscribeResponse = kernel.on('agent:communication:response', (event) => {
      if (event.data.message || event.data.reply) {
        const assistantMessage = event.data.message || event.data.reply;
        setMessages(prev => [...prev, { role: 'assistant', content: assistantMessage }]);
        setStreamingText('');
        setIsStreaming(false);
      }
    });

    // ??? ???????????????? ???? streaming tokens (?????? ?????? ?????? Agent ???????? streaming)
    const unsubscribeStream = kernel.on('agent:communication:stream', (event) => {
      if (event.data.token) {
        setStreamingText(prev => prev + event.data.token);
        setIsStreaming(true);
      }
    });

    // ??? ???????????????? ??????????????
    const unsubscribeError = kernel.on('agent:communication:error', (event) => {
      console.error('Chat error:', event.data.error);
      setIsStreaming(false);
      setStreamingText('');
    });

    return () => {
      unsubscribeResponse();
      unsubscribeStream();
      unsubscribeError();
    };
  }, []);

  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [messages, streamingText]);

  const handleSend = () => {
    if (!inputText.trim() || isStreaming) return;

    const userMessage = inputText.trim();
    setInputText('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsStreaming(true);
    setStreamingText('');

    // ??? ?????????? ?????? Kernel ??? CognitiveLoop ??? CommunicationAgent (???? WebSocket ??????????)
    kernel.emit({
      type: 'user:input',
      data: {
        text: userMessage,
        type: 'chat',
      },
      source: 'ui',
    });
  };

  return (
    <LinearGradient
      colors={theme.background as [string, string, ...string[]]}
      style={styles.container}
    >
      <NamesTunnel />
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Icon name="arrow-back" size={20} color={colors.primary} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.primary }]}>??????????????</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
        keyboardVerticalOffset={90}
      >
        <View style={styles.charREMOVED}>
          <RARECharacter size={100} animation="speaking" />
        </View>
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((msg, index) => (
            <View
              key={index}
              style={[
                styles.messageBubble,
                msg.role === 'user' ? styles.userBubble : styles.assistantBubble,
                {
                  bREMOVED: msg.role === 'user' ? colors.primary : `${colors.primary}20`,
                  borderColor: colors.primary,
                },
              ]}
            >
              <Text style={[styles.messageText, { color: msg.role === 'user' ? '#000' : colors.text }]}>
                {msg.content}
              </Text>
            </View>
          ))}

          {isStreaming && streamingText && (
            <View
              style={[
                styles.messageBubble,
                styles.assistantBubble,
                {
                  bREMOVED: `${colors.primary}20`,
                  borderColor: colors.primary,
                },
              ]}
            >
              <Text style={[styles.messageText, { color: colors.text }]}>
                {streamingText}
                <Text style={styles.cursor}>|</Text>
              </Text>
            </View>
          )}
        </ScrollView>

        <View style={[styles.inputContainer, { borderColor: colors.primary }]}>
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder="???????? ????????????..."
            plREMOVED={colors.primary + '50'}
            value={inputText}
            onChangeText={setInputText}
            multiline
            onSubmitEditing={handleSend}
            editable={!isStreaming}
          />
          <Pressable
            style={[styles.sendButton, { bREMOVED: colors.primary }]}
            onPress={handleSend}
            disabled={!inputText.trim() || isStreaming}
          >
            <Icon name="send" size={20} color="#000" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
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
  charREMOVED: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  keyboardView: {
    flex: 1,
  },
  messagesContainer: {
    padding: 20,
    paddingBottom: 10,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    maxWidth: '80%',
  },
  userBubble: {
    alignSelf: 'flex-end',
  },
  assistantBubble: {
    alignSelf: 'flex-start',
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  cursor: {
    opacity: 0.5,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 15,
    borderTopWidth: 1,
    gap: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    borderWidth: 1,
    fontSize: 14,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
});



