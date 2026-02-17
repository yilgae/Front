import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, FontSize } from '../constants/theme';
import { API_BASE_URL, useAuth } from '../context/AuthContext';

type Props = {
  navigation: any;
};

const categories = [
  { label: '서비스 이용', value: 'service' },
  { label: '계정 문제', value: 'account' },
  { label: '결제/환불', value: 'payment' },
  { label: '오류 신고', value: 'bug' },
  { label: '제안/기타', value: 'etc' },
];

export default function ContactScreen({ navigation }: Props) {
  const { user, token } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!selectedCategory) {
      const msg = '문의 유형을 선택해 주세요.';
      Platform.OS === 'web' ? window.alert(msg) : Alert.alert('알림', msg);
      return;
    }
    if (!title.trim()) {
      const msg = '제목을 입력해 주세요.';
      Platform.OS === 'web' ? window.alert(msg) : Alert.alert('알림', msg);
      return;
    }
    if (!content.trim()) {
      const msg = '내용을 입력해 주세요.';
      Platform.OS === 'web' ? window.alert(msg) : Alert.alert('알림', msg);
      return;
    }

    setIsSubmitting(true);
    try {
      if (!token) {
        throw new Error('로그인이 필요합니다.');
      }

      const res = await fetch(`${API_BASE_URL}/api/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          category: selectedCategory,
          title: title.trim(),
          content: content.trim(),
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.detail || '문의 접수에 실패했습니다.');
      }

      setSubmitted(true);
    } catch (e) {
      const message = e instanceof Error ? e.message : '문의 접수에 실패했습니다.';
      Platform.OS === 'web' ? window.alert(message) : Alert.alert('오류', message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <MaterialIcons name="arrow-back" size={24} color={Colors.stone900} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>문의하기</Text>
          <View style={styles.headerRight} />
        </View>

        <View style={styles.successContainer}>
          <View style={styles.successIconCircle}>
            <MaterialIcons name="check" size={48} color={Colors.white} />
          </View>
          <Text style={styles.successTitle}>문의가 접수되었습니다</Text>
          <Text style={styles.successSubtitle}>
            확인 후 등록된 이메일로 답변 드리겠습니다.{'\n'}
            평균 1~2 영업일 내 답변됩니다.
          </Text>
          <TouchableOpacity
            style={styles.successButton}
            activeOpacity={0.8}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.successButtonText}>돌아가기</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <MaterialIcons name="arrow-back" size={24} color={Colors.stone900} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>문의하기</Text>
        <View style={styles.headerRight} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* 문의 유형 */}
          <Text style={styles.sectionTitle}>문의 유형</Text>
          <View style={styles.categoryWrap}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.value}
                style={[
                  styles.categoryChip,
                  selectedCategory === cat.value && styles.categoryChipActive,
                ]}
                activeOpacity={0.7}
                onPress={() => setSelectedCategory(cat.value)}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    selectedCategory === cat.value && styles.categoryChipTextActive,
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* 제목 */}
          <Text style={styles.sectionTitle}>제목</Text>
          <View style={styles.inputCard}>
            <TextInput
              style={styles.titleInput}
              placeholder="문의 제목을 입력해 주세요"
              placeholderTextColor={Colors.stone400}
              value={title}
              onChangeText={setTitle}
              maxLength={100}
            />
          </View>

          {/* 내용 */}
          <Text style={styles.sectionTitle}>내용</Text>
          <View style={styles.inputCard}>
            <TextInput
              style={styles.contentInput}
              placeholder="문의 내용을 상세히 작성해 주세요"
              placeholderTextColor={Colors.stone400}
              value={content}
              onChangeText={setContent}
              multiline
              textAlignVertical="top"
              maxLength={1000}
            />
            <Text style={styles.charCount}>{content.length}/1000</Text>
          </View>

          {/* 답변 안내 */}
          <View style={styles.infoCard}>
            <MaterialIcons name="mail-outline" size={18} color={Colors.primaryDark} />
            <Text style={styles.infoText}>
              답변은 {user?.email || '가입된 이메일'}로 발송됩니다.
            </Text>
          </View>

          {/* 제출 버튼 */}
          <TouchableOpacity
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
            activeOpacity={0.8}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <Text style={styles.submitText}>
              {isSubmitting ? '접수 중...' : '문의 접수'}
            </Text>
          </TouchableOpacity>

          {/* 기타 연락 수단 */}
          <View style={styles.altContactCard}>
            <Text style={styles.altContactTitle}>다른 방법으로 문의하기</Text>
            <View style={styles.altRow}>
              <MaterialIcons name="mail-outline" size={18} color={Colors.stone500} />
              <Text style={styles.altText}>support@readgye.com</Text>
            </View>
            <View style={styles.altRow}>
              <MaterialIcons name="schedule" size={18} color={Colors.stone500} />
              <Text style={styles.altText}>평일 09:00 ~ 18:00 (공휴일 제외)</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundLight,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  headerTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.stone900,
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  sectionTitle: {
    fontSize: FontSize.xs,
    color: Colors.stone500,
    fontWeight: '600',
    marginBottom: 8,
    paddingHorizontal: 4,
    marginTop: 4,
  },
  categoryWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.stone300,
  },
  categoryChipActive: {
    backgroundColor: Colors.primaryDark,
    borderColor: Colors.primaryDark,
  },
  categoryChipText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.stone600,
  },
  categoryChipTextActive: {
    color: Colors.white,
  },
  inputCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.stone100,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 20,
  },
  titleInput: {
    fontSize: FontSize.md,
    color: Colors.stone900,
    height: 40,
  },
  contentInput: {
    fontSize: FontSize.md,
    color: Colors.stone900,
    minHeight: 140,
  },
  charCount: {
    fontSize: FontSize.xs,
    color: Colors.stone400,
    textAlign: 'right',
    marginTop: 4,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.yellow50,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.yellow100,
  },
  infoText: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.stone600,
  },
  submitButton: {
    backgroundColor: Colors.primaryDark,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 20,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitText: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.white,
  },
  altContactCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.stone100,
  },
  altContactTitle: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.stone900,
    marginBottom: 12,
  },
  altRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  altText: {
    fontSize: FontSize.sm,
    color: Colors.stone500,
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  successIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.green500,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  successTitle: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.stone900,
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: FontSize.md,
    color: Colors.stone500,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  successButton: {
    backgroundColor: Colors.primaryDark,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 40,
  },
  successButtonText: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.white,
  },
});
