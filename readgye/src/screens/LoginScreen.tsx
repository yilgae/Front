import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
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
  navigation?: any;
};

export default function LoginScreen({ navigation }: Props) {
  const { signInWithGoogle, signInWithEmail, signInAsGuest, isGoogleSignInAvailable } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
    } catch (e: any) {
      setError(e?.message || 'Google 로그인에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async () => {
    setError(null);
    if (!email.trim()) {
      setError('이메일을 입력해주세요.');
      return;
    }
    if (!password) {
      setError('비밀번호를 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      const result = await signInWithEmail(email.trim(), password);
      if (!result.success) {
        setError(result.error || '로그인에 실패했습니다.');
      }
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
          {/* Logo */}
          <View style={styles.logoArea}>
            <Image
              source={require('../../assets/favicon.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.appName}>읽계</Text>
            <Text style={styles.appDesc}>계약서 읽어주는 AI</Text>
          </View>

          {/* 로그인 폼 */}
          <View style={styles.formArea}>
            {/* 에러 메시지 */}
            {error && (
              <View style={styles.errorBanner}>
                <MaterialIcons name="error-outline" size={16} color={Colors.red600} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* 이메일 입력 */}
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

            {/* 비밀번호 입력 */}
            <View style={styles.inputWrap}>
              <MaterialIcons name="lock-outline" size={20} color={Colors.stone400} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="비밀번호"
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

            {/* 로그인 버튼 */}
            <TouchableOpacity
              style={[styles.loginButton, loading && styles.loginButtonDisabled]}
              activeOpacity={0.85}
              onPress={handleEmailLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <Text style={styles.loginButtonText}>로그인</Text>
              )}
            </TouchableOpacity>

            {/* 구분선 */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>또는</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Google 로그인 */}
            <TouchableOpacity
              style={[styles.googleButton, (!isGoogleSignInAvailable || loading) && styles.googleButtonDisabled]}
              activeOpacity={0.8}
              onPress={handleGoogleLogin}
              disabled={!isGoogleSignInAvailable || loading}
            >
              <Image
                source={{ uri: 'https://developers.google.com/identity/images/g-logo.png' }}
                style={styles.googleIcon}
              />
              <Text style={styles.googleButtonText}>Google로 계속하기</Text>
            </TouchableOpacity>
            {!isGoogleSignInAvailable && (
              <Text style={styles.googleDisabledHint}>
                Expo Go에서는 Google 로그인을 사용할 수 없습니다. 게스트/이메일 로그인을 사용해주세요.
              </Text>
            )}

            {/* 게스트 로그인 */}
            <TouchableOpacity
              style={styles.guestButton}
              activeOpacity={0.8}
              onPress={signInAsGuest}
              disabled={loading}
            >
              <Text style={styles.guestButtonText}>게스트로 시작하기</Text>
            </TouchableOpacity>
          </View>

          {/* 하단: 회원가입 전환 + 약관 */}
          <View style={styles.bottomArea}>
            <TouchableOpacity
              style={styles.signupRow}
              activeOpacity={0.7}
              onPress={() => navigation?.navigate('SignUp')}
            >
              <Text style={styles.signupHint}>아직 계정이 없으신가요?</Text>
              <Text style={styles.signupLink}> 회원가입</Text>
            </TouchableOpacity>

            <Text style={styles.terms}>
              계속 진행하면{' '}
              <Text style={styles.termsLink}>이용약관</Text> 및{' '}
              <Text style={styles.termsLink}>개인정보처리방침</Text>에{'\n'}
              동의하는 것으로 간주됩니다.
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
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 28,
    paddingTop: 40,
    paddingBottom: 32,
  },

  // Logo
  logoArea: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 32,
  },
  logo: {
    width: 88,
    height: 88,
    marginBottom: 16,
  },
  appName: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.stone900,
    marginBottom: 4,
  },
  appDesc: {
    fontSize: FontSize.md,
    color: Colors.stone500,
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

  // Login Button
  loginButton: {
    backgroundColor: Colors.primaryDark,
    borderRadius: BorderRadius.lg,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 4,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.white,
  },

  // Divider
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.stone100,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: FontSize.sm,
    color: Colors.stone400,
    fontWeight: '500',
  },

  // Google
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.stone300,
    borderRadius: BorderRadius.lg,
    paddingVertical: 14,
    gap: 12,
  },
  googleButtonDisabled: {
    opacity: 0.5,
  },
  googleIcon: {
    width: 20,
    height: 20,
  },
  googleButtonText: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.stone900,
  },
  googleDisabledHint: {
    fontSize: FontSize.xs,
    color: Colors.stone500,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: -2,
  },

  // Guest
  guestButton: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  guestButtonText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.stone500,
    textDecorationLine: 'underline',
  },

  // Bottom
  bottomArea: {
    alignItems: 'center',
    marginTop: 20,
  },
  signupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  signupHint: {
    fontSize: FontSize.md,
    color: Colors.stone500,
  },
  signupLink: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.primaryDark,
  },
  terms: {
    fontSize: FontSize.xs,
    color: Colors.stone400,
    textAlign: 'center',
    lineHeight: 18,
  },
  termsLink: {
    color: Colors.primaryDark,
    fontWeight: '500',
  },
});
