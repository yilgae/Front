import React, { useState } from 'react';
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

type Props = {
  navigation: any;
};

type PolicyItem = {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  version: string;
  date: string;
  content: string;
};

const policies: PolicyItem[] = [
  {
    icon: 'description',
    title: '서비스 이용약관',
    version: 'v2.1',
    date: '2025.01.15',
    content:
      '읽계 서비스(이하 "서비스")를 이용해 주셔서 감사합니다. 본 약관은 읽계 서비스의 이용 조건 및 절차, 회사와 이용자의 권리, 의무 및 책임사항 등을 규정합니다.\n\n제1조 (목적)\n본 약관은 읽계가 제공하는 AI 기반 계약서 분석 서비스의 이용과 관련하여 회사와 이용자 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.\n\n제2조 (정의)\n1. "서비스"란 회사가 제공하는 AI 계약서 분석 및 관련 부가 서비스를 말합니다.\n2. "이용자"란 본 약관에 따라 서비스를 이용하는 회원을 말합니다.\n3. "콘텐츠"란 이용자가 업로드한 계약서 및 분석 결과물을 말합니다.',
  },
  {
    icon: 'security',
    title: '개인정보 처리방침',
    version: 'v1.8',
    date: '2025.01.15',
    content:
      '읽계(이하 "회사")는 이용자의 개인정보를 중요시하며, 「개인정보 보호법」을 준수합니다.\n\n1. 수집하는 개인정보 항목\n- 필수항목: 이메일 주소, 이름(닉네임)\n- 선택항목: 프로필 이미지\n- 자동수집: 접속 로그, 서비스 이용 기록\n\n2. 개인정보의 처리 목적\n- 회원 가입 및 관리\n- 서비스 제공 및 계약서 분석\n- 서비스 개선 및 신규 기능 개발\n\n3. 개인정보의 보유 및 이용기간\n- 회원 탈퇴 후 30일간 보관 후 파기\n- 관련 법령에 따라 보존이 필요한 경우 해당 기간까지 보관',
  },
  {
    icon: 'cookie',
    title: '쿠키 정책',
    version: 'v1.0',
    date: '2024.12.01',
    content:
      '읽계는 이용자에게 최적화된 서비스를 제공하기 위해 쿠키를 사용합니다.\n\n1. 쿠키의 사용 목적\n- 로그인 상태 유지\n- 서비스 이용 환경 설정 저장\n- 서비스 개선을 위한 통계 분석\n\n2. 쿠키의 관리\n이용자는 브라우저 설정을 통해 쿠키 수집을 거부할 수 있습니다. 다만, 쿠키를 차단할 경우 일부 서비스 이용에 제한이 있을 수 있습니다.',
  },
];

export default function TermsScreen({ navigation }: Props) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

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
        <Text style={styles.headerTitle}>약관 및 정책</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {policies.map((policy, idx) => (
          <TouchableOpacity
            key={idx}
            style={styles.policyCard}
            activeOpacity={0.7}
            onPress={() =>
              setExpandedIndex(expandedIndex === idx ? null : idx)
            }
          >
            <View style={styles.policyHeader}>
              <View style={styles.policyLeft}>
                <View style={styles.iconCircle}>
                  <MaterialIcons name={policy.icon} size={22} color={Colors.primaryDark} />
                </View>
                <View style={styles.policyTextWrap}>
                  <Text style={styles.policyTitle}>{policy.title}</Text>
                  <Text style={styles.policyMeta}>
                    {policy.version} · 시행일 {policy.date}
                  </Text>
                </View>
              </View>
              <MaterialIcons
                name={expandedIndex === idx ? 'expand-less' : 'expand-more'}
                size={24}
                color={Colors.stone400}
              />
            </View>

            {expandedIndex === idx && (
              <View style={styles.policyContent}>
                <Text style={styles.policyContentText}>{policy.content}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}

        <View style={styles.infoCard}>
          <MaterialIcons name="info-outline" size={18} color={Colors.primaryDark} />
          <Text style={styles.infoText}>
            약관 및 정책은 서비스 개선에 따라 변경될 수 있으며, 변경 시 공지사항을 통해 안내드립니다.
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
  policyCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.stone100,
    marginBottom: 12,
    overflow: 'hidden',
  },
  policyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  policyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.yellow50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  policyTextWrap: {
    flex: 1,
  },
  policyTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.stone900,
  },
  policyMeta: {
    fontSize: FontSize.xs,
    color: Colors.stone500,
    marginTop: 2,
  },
  policyContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.stone100,
    paddingTop: 14,
  },
  policyContentText: {
    fontSize: FontSize.sm,
    color: Colors.stone600,
    lineHeight: 20,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: Colors.yellow50,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.yellow100,
    marginTop: 4,
  },
  infoText: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.stone600,
    lineHeight: 18,
  },
});
