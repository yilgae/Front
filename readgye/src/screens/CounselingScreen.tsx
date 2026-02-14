import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  FlatList,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  Clipboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, FontSize } from '../constants/theme';
import { useAuth, API_BASE_URL } from '../context/AuthContext';

// ─── 타입 정의 ───
type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
};

// ─── 추천 질문 목록 ───
const SUGGESTED_QUESTIONS = [
  '위험한 조항을 요약해줘',
  '계약서 전체를 쉽게 설명해줘',
  '수정이 필요한 부분이 있어?',
  '이 계약서에서 주의할 점은?',
];

// ─── 시간 포맷 ───
function formatTime(iso: string): string {
  const d = new Date(iso);
  const h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, '0');
  return `${h >= 12 ? '오후' : '오전'} ${h > 12 ? h - 12 : h || 12}:${m}`;
}

// ─── 메인 컴포넌트 ───
export default function CounselingScreen() {
  const { token } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);

  // ─── 메시지 전송 ───
  const sendMessage = useCallback(
    async (text?: string) => {
      const messageText = (text || inputText).trim();
      if (!messageText || isLoading) return;

      setError(null);
      setInputText('');

      // 사용자 메시지 즉시 표시
      const userMsg: Message = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: messageText,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setIsLoading(true);

      try {
        const res = await fetch(`${API_BASE_URL}/api/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            message: messageText,
            session_id: sessionId,
          }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => null);
          throw new Error(errData?.detail || `서버 오류 (${res.status})`);
        }

        const data = await res.json();
        setSessionId(data.session_id);

        const aiMsg: Message = {
          id: data.message.id,
          role: 'assistant',
          content: data.message.content,
          created_at: data.message.created_at,
        };
        setMessages((prev) => [...prev, aiMsg]);
      } catch (e: any) {
        setError(e.message || '응답을 받지 못했습니다.');
        setMessages((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            role: 'assistant',
            content: '죄송합니다, 응답을 받지 못했습니다. 다시 시도해주세요.',
            created_at: new Date().toISOString(),
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [inputText, isLoading, sessionId, token],
  );

  // ─── 새 대화 시작 ───
  const startNewChat = useCallback(() => {
    setMessages([]);
    setSessionId(null);
    setError(null);
    setInputText('');
  }, []);

  // ─── 클립보드 복사 ───
  const copyToClipboard = useCallback((text: string) => {
    Clipboard.setString(text);
    if (Platform.OS === 'web') {
      window.alert('복사되었습니다!');
    }
  }, []);

  // ─── AI 메시지 렌더링 ───
  const renderAIMessage = useCallback(
    (item: Message) => (
      <View style={styles.aiRow}>
        <View style={styles.avatarWrap}>
          <Image
            source={require('../../assets/favicon.png')}
            style={styles.avatar}
            resizeMode="cover"
          />
        </View>
        <View style={styles.aiMessageArea}>
          <Text style={styles.sender}>읽계 AI</Text>
          <View style={styles.aiBubble}>
            <Text style={styles.aiText}>{item.content}</Text>
          </View>
          <View style={styles.messageActions}>
            <Text style={styles.messageTime}>{formatTime(item.created_at)}</Text>
            <TouchableOpacity
              onPress={() => copyToClipboard(item.content)}
              style={styles.copySmallBtn}
              activeOpacity={0.7}
            >
              <MaterialIcons name="content-copy" size={12} color={Colors.stone400} />
              <Text style={styles.copySmallText}>복사</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    ),
    [copyToClipboard],
  );

  // ─── 사용자 메시지 렌더링 ───
  const renderUserMessage = useCallback((item: Message) => (
    <View style={styles.userRow}>
      <View style={styles.userMessageArea}>
        <View style={styles.userBubble}>
          <Text style={styles.userText}>{item.content}</Text>
        </View>
        <Text style={styles.userTime}>{formatTime(item.created_at)}</Text>
      </View>
    </View>
  ), []);

  // ─── 메시지 아이템 렌더링 ───
  const renderItem = useCallback(
    ({ item }: { item: Message }) => {
      if (item.role === 'user') return renderUserMessage(item);
      return renderAIMessage(item);
    },
    [renderAIMessage, renderUserMessage],
  );

  // ─── 빈 상태 (추천 질문) ───
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconWrap}>
        <MaterialIcons name="chat-bubble-outline" size={48} color={Colors.stone300} />
      </View>
      <Text style={styles.emptyTitle}>AI 법률 상담</Text>
      <Text style={styles.emptyDesc}>
        업로드한 계약서를 바탕으로{'\n'}궁금한 점을 물어보세요
      </Text>
      <View style={styles.suggestionsWrap}>
        {SUGGESTED_QUESTIONS.map((q, i) => (
          <TouchableOpacity
            key={i}
            style={styles.suggestionChip}
            activeOpacity={0.7}
            onPress={() => sendMessage(q)}
          >
            <MaterialIcons name="lightbulb-outline" size={14} color="#0f49bd" />
            <Text style={styles.suggestionChipText}>{q}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  // ─── 타이핑 인디케이터 ───
  const renderTypingIndicator = () => (
    <View style={styles.aiRow}>
      <View style={styles.avatarWrap}>
        <Image
          source={require('../../assets/favicon.png')}
          style={styles.avatar}
          resizeMode="cover"
        />
      </View>
      <View style={styles.aiMessageArea}>
        <Text style={styles.sender}>읽계 AI</Text>
        <View style={styles.typingBubble}>
          <ActivityIndicator size="small" color="#0f49bd" />
          <Text style={styles.typingText}>답변을 생성하고 있어요...</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* ─── 헤더 ─── */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          activeOpacity={0.8}
          onPress={startNewChat}
        >
          <MaterialIcons name="add" size={24} color={Colors.stone600} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI 법률 상담</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* ─── 면책 안내 ─── */}
      <View style={styles.disclaimerWrap}>
        <MaterialIcons name="info-outline" size={16} color="#0f49bd" />
        <Text style={styles.disclaimerText}>
          읽계 AI의 분석 결과는 법적 효력이 없으며, 참고용으로만 활용해 주세요.
          정확한 판단은 변호사와의 상담을 권장합니다.
        </Text>
      </View>

      {/* ─── 에러 배너 ─── */}
      {error && (
        <View style={styles.errorBanner}>
          <MaterialIcons name="error-outline" size={14} color={Colors.red600} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* ─── 채팅 영역 ─── */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        {messages.length === 0 ? (
          renderEmptyState()
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.chatContent}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({ animated: true })
            }
            ListFooterComponent={isLoading ? renderTypingIndicator : null}
          />
        )}

        {/* ─── 입력 바 ─── */}
        <View style={styles.inputBar}>
          <View style={styles.inputWrap}>
            <TextInput
              value={inputText}
              onChangeText={setInputText}
              placeholder="계약서에 대해 궁금한 점을 물어보세요"
              placeholderTextColor={Colors.stone400}
              style={styles.input}
              multiline
              editable={!isLoading}
              onSubmitEditing={() => sendMessage()}
              blurOnSubmit={false}
            />
          </View>
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!inputText.trim() || isLoading) && styles.sendButtonDisabled,
            ]}
            activeOpacity={0.85}
            onPress={() => sendMessage()}
            disabled={!inputText.trim() || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={Colors.white} />
            ) : (
              <MaterialIcons name="send" size={20} color={Colors.white} />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── 스타일 ───
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundLight,
  },
  // 헤더
  header: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.stone900,
  },
  headerSpacer: {
    width: 40,
    height: 40,
  },
  // 면책
  disclaimerWrap: {
    marginHorizontal: 20,
    marginBottom: 8,
    backgroundColor: '#EBF1FF',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    gap: 8,
  },
  disclaimerText: {
    flex: 1,
    fontSize: 12,
    color: Colors.stone500,
    lineHeight: 18,
  },
  // 에러
  errorBanner: {
    marginHorizontal: 20,
    marginBottom: 8,
    backgroundColor: Colors.red50,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  errorText: {
    flex: 1,
    fontSize: 12,
    color: Colors.red600,
  },
  // 채팅
  chatContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 14,
    gap: 16,
  },
  // AI 메시지
  aiRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  avatarWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.stone100,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  aiMessageArea: {
    flex: 1,
    gap: 4,
  },
  sender: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.stone500,
    marginLeft: 2,
  },
  aiBubble: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderTopLeftRadius: 4,
    borderWidth: 1,
    borderColor: Colors.stone100,
    padding: 14,
  },
  aiText: {
    fontSize: 15,
    color: Colors.stone600,
    lineHeight: 22,
  },
  messageActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: 2,
  },
  messageTime: {
    fontSize: 10,
    color: Colors.stone400,
  },
  copySmallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  copySmallText: {
    fontSize: 10,
    color: Colors.stone400,
  },
  // 사용자 메시지
  userRow: {
    alignItems: 'flex-end',
  },
  userMessageArea: {
    maxWidth: '85%',
    alignItems: 'flex-end',
    gap: 4,
  },
  userBubble: {
    backgroundColor: '#FFF8E1',
    borderRadius: 16,
    borderTopRightRadius: 4,
    borderWidth: 1,
    borderColor: '#FDE68A',
    padding: 14,
  },
  userText: {
    fontSize: 15,
    lineHeight: 22,
    color: Colors.stone800,
  },
  userTime: {
    fontSize: 10,
    color: Colors.stone400,
    marginRight: 2,
  },
  // 타이핑 인디케이터
  typingBubble: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderTopLeftRadius: 4,
    borderWidth: 1,
    borderColor: Colors.stone100,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  typingText: {
    fontSize: 13,
    color: Colors.stone400,
  },
  // 빈 상태
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingBottom: 40,
  },
  emptyIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.stone100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.stone900,
    marginBottom: 8,
  },
  emptyDesc: {
    fontSize: 14,
    color: Colors.stone500,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  suggestionsWrap: {
    width: '100%',
    gap: 8,
  },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F4F8FF',
    borderWidth: 1,
    borderColor: '#c8d8fb',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  suggestionChipText: {
    fontSize: 14,
    color: '#0f49bd',
    fontWeight: '600',
  },
  // 입력 바
  inputBar: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.stone100,
    backgroundColor: Colors.backgroundLight,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  inputWrap: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.stone100,
    backgroundColor: Colors.white,
    paddingHorizontal: 14,
    justifyContent: 'center',
  },
  input: {
    fontSize: 14,
    color: Colors.stone900,
    paddingVertical: 10,
    maxHeight: 96,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0f49bd',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 1,
  },
  sendButtonDisabled: {
    backgroundColor: '#a0b8e8',
  },
});
