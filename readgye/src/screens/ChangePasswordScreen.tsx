import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, FontSize } from '../constants/theme';
import { API_BASE_URL, useAuth } from '../context/AuthContext';

type Props = {
  navigation: any;
};

export default function ChangePasswordScreen({ navigation }: Props) {
  const { token } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const validate = (): string | null => {
    if (!currentPassword.trim()) return '현재 비밀번호를 입력해 주세요.';
    if (!newPassword.trim()) return '새 비밀번호를 입력해 주세요.';
    if (newPassword.length < 6) return '새 비밀번호는 6자 이상이어야 합니다.';
    if (newPassword !== confirmPassword) return '새 비밀번호가 일치하지 않습니다.';
    if (currentPassword === newPassword) return '현재 비밀번호와 다른 비밀번호를 입력해 주세요.';
    return null;
  };

  const handleSubmit = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.detail || '비밀번호 변경에 실패했습니다.');
      }

      setSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      const msg = '비밀번호가 성공적으로 변경되었습니다.';
      if (Platform.OS === 'web') {
        window.alert(msg);
      } else {
        Alert.alert('완료', msg);
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : '비밀번호 변경에 실패했습니다.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

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
        <Text style={styles.headerTitle}>비밀번호 변경</Text>
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
          {error && (
            <View style={styles.errorBanner}>
              <MaterialIcons name="error-outline" size={18} color={Colors.red500} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {success && (
            <View style={styles.successBanner}>
              <MaterialIcons name="check-circle" size={18} color={Colors.green600} />
              <Text style={styles.successText}>비밀번호가 변경되었습니다.</Text>
            </View>
          )}

          <View style={styles.formCard}>
            <Text style={styles.inputLabel}>현재 비밀번호</Text>
            <View style={styles.inputWrap}>
              <TextInput
                style={styles.input}
                placeholder="현재 비밀번호 입력"
                placeholderTextColor={Colors.stone400}
                secureTextEntry={!showCurrent}
                value={currentPassword}
                onChangeText={(t) => { setCurrentPassword(t); setError(null); setSuccess(false); }}
              />
              <TouchableOpacity onPress={() => setShowCurrent(!showCurrent)} activeOpacity={0.7}>
                <MaterialIcons
                  name={showCurrent ? 'visibility' : 'visibility-off'}
                  size={22}
                  color={Colors.stone400}
                />
              </TouchableOpacity>
            </View>

            <Text style={[styles.inputLabel, { marginTop: 18 }]}>새 비밀번호</Text>
            <View style={styles.inputWrap}>
              <TextInput
                style={styles.input}
                placeholder="새 비밀번호 입력 (6자 이상)"
                placeholderTextColor={Colors.stone400}
                secureTextEntry={!showNew}
                value={newPassword}
                onChangeText={(t) => { setNewPassword(t); setError(null); setSuccess(false); }}
              />
              <TouchableOpacity onPress={() => setShowNew(!showNew)} activeOpacity={0.7}>
                <MaterialIcons
                  name={showNew ? 'visibility' : 'visibility-off'}
                  size={22}
                  color={Colors.stone400}
                />
              </TouchableOpacity>
            </View>

            <Text style={[styles.inputLabel, { marginTop: 18 }]}>새 비밀번호 확인</Text>
            <View style={styles.inputWrap}>
              <TextInput
                style={styles.input}
                placeholder="새 비밀번호 다시 입력"
                placeholderTextColor={Colors.stone400}
                secureTextEntry={!showConfirm}
                value={confirmPassword}
                onChangeText={(t) => { setConfirmPassword(t); setError(null); setSuccess(false); }}
              />
              <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)} activeOpacity={0.7}>
                <MaterialIcons
                  name={showConfirm ? 'visibility' : 'visibility-off'}
                  size={22}
                  color={Colors.stone400}
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
            activeOpacity={0.8}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <Text style={styles.submitText}>
              {isSubmitting ? '변경 중...' : '비밀번호 변경'}
            </Text>
          </TouchableOpacity>

          <View style={styles.tipCard}>
            <MaterialIcons name="lightbulb-outline" size={18} color={Colors.primaryDark} />
            <Text style={styles.tipText}>
              안전한 비밀번호를 위해 영문, 숫자, 특수문자를 조합해 주세요.
            </Text>
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
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.red50,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.red100,
  },
  errorText: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.red500,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.green50,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.green100,
  },
  successText: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.green600,
  },
  formCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.stone100,
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.stone500,
    marginBottom: 8,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.stone300,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    backgroundColor: Colors.stone50,
  },
  input: {
    flex: 1,
    fontSize: FontSize.md,
    color: Colors.stone900,
    height: '100%',
  },
  submitButton: {
    backgroundColor: Colors.primaryDark,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitText: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.white,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: Colors.yellow50,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.yellow100,
  },
  tipText: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.stone600,
    lineHeight: 18,
  },
});
