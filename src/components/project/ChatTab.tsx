import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Fonts } from '../../theme';
import { ChatMessage } from '../../api/interfaces/ProjectTypes';
import { useSocket } from '../../context/SocketContext';

interface Props {
  projectId: string;
}

const formatChatTime = (iso: string): string => {
  const d = new Date(iso);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};

const formatChatDate = (iso: string): string => {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
};

const ChatBubble: React.FC<{ message: ChatMessage }> = ({ message }) => (
  <View style={styles.bubbleContainer}>
    <View style={styles.bubbleAvatar}>
      <Text style={styles.bubbleAvatarText}>{message.senderInitials}</Text>
    </View>
    <View style={styles.bubbleContent}>
      <View style={styles.bubbleHeader}>
        <Text style={styles.bubbleSender}>{message.senderName}</Text>
        <Text style={styles.bubbleTime}>{formatChatTime(message.timestamp)}</Text>
      </View>
      <Text style={styles.bubbleMessage}>{message.message}</Text>
    </View>
  </View>
);

const ChatTab: React.FC<Props> = ({ projectId }) => {
  const [input, setInput] = React.useState('');
  const scrollRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);
  const { messages, sendMessage, status } = useSocket();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 150);
  }, [messages.length]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    sendMessage(projectId, trimmed);
    setInput('');
  };

  const grouped = messages.reduce<Record<string, ChatMessage[]>>((acc, m) => {
    if (m.projectId !== projectId) return acc;
    const key = formatChatDate(m.timestamp);
    if (!acc[key]) acc[key] = [];
    acc[key].push(m);
    return acc;
  }, {});

  const dateKeys = Object.keys(grouped);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top + 50 : 0}
    >
      <ScrollView
        ref={scrollRef}
        style={styles.chatArea}
        contentContainerStyle={styles.chatContent}
        keyboardShouldPersistTaps="handled"
      >
        {status === 'connecting' && (
          <View style={styles.connectingBar}>
            <ActivityIndicator size="small" color={Colors.primary} />
            <Text style={styles.connectingText}>Connecting to chat...</Text>
          </View>
        )}

        {dateKeys.map((dateLabel) => (
          <View key={dateLabel}>
            <View style={styles.dateSeparator}>
              <Text style={styles.dateSeparatorText}>{dateLabel}</Text>
            </View>
            {grouped[dateLabel].map((msg) => (
              <ChatBubble key={msg.id} message={msg} />
            ))}
          </View>
        ))}

        {messages.filter((m) => m.projectId === projectId).length === 0 && (
          <View style={styles.emptyChat}>
            <Text style={styles.emptyChatText}>
              No messages yet. Start the conversation.
            </Text>
          </View>
        )}
      </ScrollView>

      <View style={[styles.inputBar, { paddingBottom: insets.bottom || 10 }]}>
        <TextInput
          ref={inputRef}
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Type a message..."
          placeholderTextColor={Colors.textSecondary}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]}
          onPress={handleSend}
          disabled={!input.trim()}
        >
          <Text style={styles.sendBtnText}>{'\u2191'}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  chatArea: {
    flex: 1,
  },
  chatContent: {
    padding: 16,
    paddingBottom: 8,
  },
  connectingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    marginBottom: 8,
    gap: 8,
  },
  connectingText: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textSecondary,
  },
  dateSeparator: {
    alignItems: 'center',
    marginVertical: 12,
  },
  dateSeparatorText: {
    fontSize: Fonts.sizes.xs,
    fontWeight: '600',
    color: Colors.textSecondary,
    backgroundColor: Colors.subtle,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
    overflow: 'hidden',
  },
  bubbleContainer: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  bubbleAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    marginTop: 2,
  },
  bubbleAvatarText: {
    color: Colors.white,
    fontSize: Fonts.sizes.xs,
    fontWeight: '700',
  },
  bubbleContent: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
  },
  bubbleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  bubbleSender: {
    fontSize: Fonts.sizes.xs,
    fontWeight: '700',
    color: Colors.primary,
  },
  bubbleTime: {
    fontSize: Fonts.sizes.xs,
    color: Colors.textSecondary,
  },
  bubbleMessage: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  emptyChat: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyChatText: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textSecondary,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.white,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.subtle,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: Fonts.sizes.sm,
    color: Colors.textPrimary,
    maxHeight: 80,
    marginRight: 8,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: Colors.border,
  },
  sendBtnText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '700',
  },
});

export default ChatTab;
