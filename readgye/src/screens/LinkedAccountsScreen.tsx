import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, FontSize } from '../constants/theme';
import { useAuth } from '../context/AuthContext';

type Props = {
  navigation: any;
};

type AccountRowProps = {
  icon: keyof typeof MaterialIcons.glyphMap;
  name: string;
  status: 'connected' | 'disconnected';
  email?: string;
  color: string;
  showDivider?: boolean;
};

function AccountRow({ icon, name, status, email, color, showDivider }: AccountRowProps) {
  const isConnected = status === 'connected';

  return (
    <>
      <View style={styles.accountRow}>
        <View style={styles.accountLeft}>
          <View style={[styles.iconCircle, { backgroundColor: color + '18' }]}>
            <MaterialIcons name={icon} size={22} color={color} />
          </View>
          <View style={styles.accountTextWrap}>
            <Text style={styles.accountName}>{name}</Text>
            {email ? (
              <Text style={styles.accountEmail}>{email}</Text>
            ) : (
              <Text style={styles.accountStatus}>
                {isConnected ? '연동됨' : '연동 안됨'}
              </Text>
            )}
          </View>
        </View>
        <TouchableOpacity
          style={[
            styles.connectButton,
            isConnected ? styles.disconnectButton : styles.linkButton,
          ]}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.connectButtonText,
              isConnected ? styles.disconnectText : styles.linkText,
            ]}
          >
            {isConnected ? '해제' : '연동'}
          </Text>
        </TouchableOpacity>
      </View>
      {showDivider && <View style={styles.divider} />}
    </>
  );
}

export default function LinkedAccountsScreen({ navigation }: Props) {
  const { user } = useAuth();
  const isGoogleLinked = !!user?.picture;

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
        <Text style={styles.headerTitle}>연동 계정</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.descCard}>
          <MaterialIcons name="info-outline" size={18} color={Colors.primaryDark} />
          <Text style={styles.descText}>
            외부 계정을 연동하면 해당 계정으로 간편하게 로그인할 수 있습니다.
          </Text>
        </View>

        <View style={styles.groupCard}>
          <AccountRow
            icon="mail-outline"
            name="Google"
            status={isGoogleLinked ? 'connected' : 'disconnected'}
            email={isGoogleLinked ? user?.email : undefined}
            color="#EA4335"
            showDivider
          />
          <AccountRow
            icon="chat"
            name="카카오"
            status="disconnected"
            color="#FEE500"
            showDivider
          />
          <AccountRow
            icon="language"
            name="네이버"
            status="disconnected"
            color="#03C75A"
            showDivider
          />
          <AccountRow
            icon="apple"
            name="Apple"
            status="disconnected"
            color="#000000"
          />
        </View>

        <View style={styles.noticeCard}>
          <Text style={styles.noticeTitle}>유의사항</Text>
          <Text style={styles.noticeText}>
            • 연동을 해제하면 해당 계정으로 로그인할 수 없습니다.{'\n'}
            • 최소 하나의 로그인 수단은 유지되어야 합니다.{'\n'}
            • 연동 시 해당 서비스의 인증 화면으로 이동합니다.
          </Text>
        </View>
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
  descCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: Colors.yellow50,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.yellow100,
  },
  descText: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.stone600,
    lineHeight: 18,
  },
  groupCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.stone100,
    overflow: 'hidden',
    marginBottom: 20,
  },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  accountLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountTextWrap: {
    flex: 1,
  },
  accountName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.stone900,
  },
  accountEmail: {
    fontSize: FontSize.xs,
    color: Colors.stone500,
    marginTop: 2,
  },
  accountStatus: {
    fontSize: FontSize.xs,
    color: Colors.stone400,
    marginTop: 2,
  },
  connectButton: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
  },
  disconnectButton: {
    backgroundColor: Colors.red50,
  },
  linkButton: {
    backgroundColor: Colors.yellow50,
  },
  connectButtonText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  disconnectText: {
    color: Colors.red500,
  },
  linkText: {
    color: Colors.primaryDark,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.stone100,
    marginLeft: 66,
  },
  noticeCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.stone100,
  },
  noticeTitle: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.stone900,
    marginBottom: 8,
  },
  noticeText: {
    fontSize: FontSize.sm,
    color: Colors.stone500,
    lineHeight: 20,
  },
});
