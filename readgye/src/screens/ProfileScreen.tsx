import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Colors, FontSize } from '../constants/theme';
import { useAuth } from '../context/AuthContext';

type SettingRowProps = {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  subtitle?: string;
  showDivider?: boolean;
  onPress?: () => void;
};

function SettingRow({ icon, label, subtitle, showDivider, onPress }: SettingRowProps) {
  return (
    <>
      <TouchableOpacity style={styles.row} activeOpacity={0.75} onPress={onPress}>
        <View style={styles.rowLeft}>
          <MaterialIcons name={icon} size={22} color={Colors.primaryDark} />
          <View style={styles.rowTextWrap}>
            <Text style={styles.rowLabel}>{label}</Text>
            {subtitle ? <Text style={styles.rowSubtitle}>{subtitle}</Text> : null}
          </View>
        </View>
        <MaterialIcons name="chevron-right" size={22} color={Colors.stone300} />
      </TouchableOpacity>
      {showDivider ? <View style={styles.divider} /> : null}
    </>
  );
}

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>설정</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity style={styles.profileCard} activeOpacity={0.85}>
          <View style={styles.profileLeft}>
            {user?.picture ? (
              <Image
                source={{ uri: user.picture }}
                style={styles.avatar}
                resizeMode="cover"
              />
            ) : (
              <Image
                source={require('../../assets/favicon.png')}
                style={styles.avatar}
                resizeMode="cover"
              />
            )}
            <View>
              <Text style={styles.profileName}>{user?.name ?? '사용자'}</Text>
              <Text style={styles.profileEmail}>{user?.email ?? ''}</Text>
            </View>
          </View>
        </TouchableOpacity>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>계정 설정</Text>
          <View style={styles.groupCard}>
            <SettingRow
              icon="person-outline"
              label="개인정보 수정"
              showDivider
              onPress={() => navigation.navigate('EditProfile')}
            />
            <SettingRow icon="lock-outline" label="비밀번호 변경" onPress={() => navigation.navigate('ChangePassword')} />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.groupCard}>
            <SettingRow icon="notifications-none" label="푸시 알림" onPress={() => navigation.navigate('NotificationSettings')} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>멤버십</Text>
          <View style={styles.groupCard}>
            <SettingRow
              icon="workspace-premium"
              label="현재 플랜: 프리미엄 (매월)"
              showDivider
              onPress={() => navigation.navigate('Membership')}
            />
            <SettingRow icon="credit-card" label="결제 수단 관리" onPress={() => navigation.navigate('PaymentMethod')} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>지원 및 정보</Text>
          <View style={styles.groupCard}>
            <SettingRow icon="help-outline" label="자주 묻는 질문" showDivider onPress={() => navigation.navigate('FAQ')} />
            <SettingRow icon="chat-bubble-outline" label="문의하기" showDivider onPress={() => navigation.navigate('Contact')} />
            <SettingRow icon="description" label="약관 및 정책" showDivider onPress={() => navigation.navigate('Terms')} />
            <SettingRow icon="info-outline" label="버전 1.2.0" showDivider />
            <SettingRow icon="code" label="오픈소스 라이선스" onPress={() => navigation.navigate('OpenSource')} />
          </View>
        </View>

        <TouchableOpacity style={styles.logoutButton} activeOpacity={0.8} onPress={signOut}>
          <Text style={styles.logoutText}>로그아웃</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundLight,
  },
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.stone900,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  profileCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.stone100,
    marginBottom: 24,
  },
  profileLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.yellow100,
  },
  profileName: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.stone900,
  },
  profileEmail: {
    marginTop: 2,
    fontSize: FontSize.sm,
    color: Colors.stone500,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: FontSize.xs,
    color: Colors.stone500,
    fontWeight: '600',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  groupCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.stone100,
    overflow: 'hidden',
  },
  row: {
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  rowTextWrap: {
    flex: 1,
  },
  rowLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.stone900,
  },
  rowSubtitle: {
    marginTop: 2,
    fontSize: FontSize.xs,
    color: Colors.stone500,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.stone100,
    marginLeft: 48,
  },
  logoutButton: {
    marginTop: 6,
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.stone100,
    paddingVertical: 14,
    alignItems: 'center',
  },
  logoutText: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.red500,
  },
});
