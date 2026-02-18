import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { Colors, FontSize, BorderRadius } from '../constants/theme';

type Props = {
  navigation: any;
};

export default function SignUpScreen({ navigation }: Props) {
  const { signUpWithEmail } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleSignUp = async () => {
    setError(null);

    if (!name.trim()) {
      setError('이름을 입력해주세요.');
      return;
    }
    if (!email.trim()) {
      setError('이메일을 입력해주세요.');
      return;
    }
    if (!password) {
      setError('비밀번호를 입력해주세요.');
      return;
    }
    if (password.length < 6) {
      setError('비밀번호는 6자 이상이어야 합니다.');
      return;
    }
    if (password !== passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    setLoading(true);
    try {
      const result = await signUpWithEmail(email.trim(), password, name.trim());
      if (!result.success) {
        setError(result.error || '회원가입에 실패했습니다.');
      }
      // 성공 시 AuthContext에서 user가 세팅되므로 자동으로 홈 화면으로 전환됨
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* 헤더 */}
          <View>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
            >
              <MaterialIcons name="arrow-back" size={24} color={Colors.stone900} />
            </TouchableOpacity>

            <Text style={styles.title}>회원가입</Text>
            <Text style={styles.subtitle}>똑똑에 가입하고 계약서를 분석해보세요.</Text>
          </View>

          {/* 폼 */}
          <View style={styles.formArea}>
            {/* 에러 */}
            {error && (
              <View style={styles.errorBanner}>
                <MaterialIcons name="error-outline" size={16} color={Colors.red600} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* 이름 */}
            <View style={styles.inputWrap}>
              <MaterialIcons name="person-outline" size={20} color={Colors.stone400} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="이름"
                placeholderTextColor={Colors.stone400}
                autoCapitalize="words"
                value={name}
                onChangeText={setName}
                editable={!loading}
              />
            </View>

            {/* 이메일 */}
            <View style={styles.inputWrap}>
              <MaterialIcons name="mail-outline" size={20} color={Colors.stone400} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="이메일"
                placeholderTextColor={Colors.stone400}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={email}
                onChangeText={setEmail}
                editable={!loading}
              />
            </View>

            {/* 비밀번호 */}
            <View style={styles.inputWrap}>
              <MaterialIcons name="lock-outline" size={20} color={Colors.stone400} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="비밀번호 (6자 이상)"
                placeholderTextColor={Colors.stone400}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                editable={!loading}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
                <MaterialIcons
                  name={showPassword ? 'visibility' : 'visibility-off'}
                  size={20}
                  color={Colors.stone400}
                />
              </TouchableOpacity>
            </View>

            {/* 비밀번호 확인 */}
            <View style={styles.inputWrap}>
              <MaterialIcons name="lock-outline" size={20} color={Colors.stone400} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="비밀번호 확인"
                placeholderTextColor={Colors.stone400}
                secureTextEntry={!showPassword}
                value={passwordConfirm}
                onChangeText={setPasswordConfirm}
                editable={!loading}
              />
            </View>

            {/* 가입 버튼 */}
            <TouchableOpacity
              style={[styles.signupButton, loading && styles.signupButtonDisabled]}
              activeOpacity={0.85}
              onPress={handleSignUp}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <Text style={styles.signupButtonText}>가입하기</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* 하단: 로그인 전환 */}
          <View style={styles.bottomArea}>
            <TouchableOpacity
              style={styles.loginRow}
              activeOpacity={0.7}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.loginHint}>이미 계정이 있으신가요?</Text>
              <Text style={styles.loginLink}> 로그인</Text>
            </TouchableOpacity>
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
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 28,
    paddingTop: 16,
    paddingBottom: 32,
  },

  // Header
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    marginBottom: 16,
  },
  title: {
    fontSize: FontSize['2xl'],
    fontWeight: '700',
    color: Colors.stone900,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: FontSize.md,
    color: Colors.stone500,
    marginBottom: 28,
  },

  // Form
  formArea: {
    gap: 12,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.red50,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: Colors.red100,
  },
  errorText: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.red600,
    fontWeight: '600',
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.stone100,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: 14,
    height: 52,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: FontSize.md,
    color: Colors.stone900,
    height: '100%',
  },
  eyeButton: {
    padding: 6,
  },

  // Sign Up Button
  signupButton: {
    backgroundColor: Colors.primaryDark,
    borderRadius: BorderRadius.lg,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 8,
  },
  signupButtonDisabled: {
    opacity: 0.6,
  },
  signupButtonText: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.white,
  },

  // Bottom
  bottomArea: {
    alignItems: 'center',
    marginTop: 24,
  },
  loginRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loginHint: {
    fontSize: FontSize.md,
    color: Colors.stone500,
  },
  loginLink: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.primaryDark,
  },
});
