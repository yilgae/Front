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
    version: 'v2.2', // 버전 업
    date: '2026.02.16', // 날짜 최신화
    content:
      "1조 (목적)\n본 약관은 '똑똑'이 제공하는 AI 기반 계약서 분석 서비스의 이용 조건을 규정합니다.\n\n제2조 (서비스의 성격 및 한계)\n1. '똑똑'은 인공지능(AI) 기술을 활용하여 계약서의 독소 조항을 탐지하고 조언을 제공하는 보조 도구입니다.\n2. 본 서비스가 제공하는 분석 결과는 '법률적 자문'이나 '유권 해석'이 아니며, 법적 효력을 갖지 않습니다.\n3. 회사는 분석 결과의 완전성, 무결성을 보장하지 않으며, 최종적인 계약 체결에 대한 책임은 이용자 본인에게 있습니다. 중요 계약은 반드시 법률 전문가의 검토를 거치시기 바랍니다.\n\n제3조 (이용자의 데이터 권리)\n이용자가 업로드한 계약서 원본 파일은 분석 즉시 파기되며, 회사는 이를 별도로 보관하거나 이용하지 않습니다.",
  },
  {
    icon: 'security',
    title: '개인정보 처리방침',
    version: 'v2.0', // 버전 업
    date: '2026.02.16', // 날짜 최신화
    content:
      "1. 수집하는 개인정보 항목\n- 필수: 이메일, 닉네임, 비밀번호(암호화 저장)\n- 생성정보: 서비스 이용 기록, 접속 로그\n\n2. 계약서 파일의 처리 (Zero-Retention 정책)\n'똑똑'은 이용자의 민감한 계약 정보를 보호하기 위해 다음과 같은 정책을 시행합니다.\n- 계약서 원본 파일: AI 분석 완료 즉시 서버 및 메모리에서 영구 삭제 (보관하지 않음)\n- 분석 리포트: 이용자 본인만 열람 가능한 형태로 DB에 저장 (계정 탈퇴 시 즉시 파기)\n\n3. 개인정보의 파기\n회사는 원칙적으로 이용자의 탈퇴 요청 시 지체 없이 개인정보를 파기합니다. 단, 관계 법령에 따라 보존이 필요한 경우 해당 기간까지 보관합니다.",
  },
  {
    icon: 'cookie',
    title: '쿠키 정책',
    version: 'v1.1', // 버전 업
    date: '2026.02.16', // 날짜 최신화
    content:
      "1. 쿠키 사용 목적\n'똑똑'는 이용자의 로그인 상태 유지 및 보안 접속을 위해 쿠키 및 로컬 스토리지 기술을 사용합니다.\n\n2. 거부권\n이용자는 브라우저 설정을 통해 쿠키 저장을 거부할 수 있습니다. 다만, 쿠키를 차단할 경우 일부 서비스 이용에 제한이 있을 수 있습니다.",
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
