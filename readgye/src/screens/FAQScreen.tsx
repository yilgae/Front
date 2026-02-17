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

type FAQItem = {
  question: string;
  answer: string;
  category: string;
};

const faqData: FAQItem[] = [
  {
    category: '서비스 이용',
    question: '읽계는 어떤 서비스인가요?',
    answer:
      '읽계는 AI 기반 계약서 분석 서비스입니다. PDF 형태의 계약서를 업로드하면 AI가 자동으로 조항을 분석하고, 위험 요소를 식별하며, 핵심 내용을 요약해 드립니다.',
  },
  {
    category: '서비스 이용',
    question: '어떤 종류의 계약서를 분석할 수 있나요?',
    answer:
      '근로계약서, 임대차계약서, 매매계약서, 용역계약서, 프리랜서 계약서 등 다양한 유형의 계약서를 분석할 수 있습니다. PDF 형식으로 업로드해 주세요.',
  },
  {
    category: '서비스 이용',
    question: '분석에는 얼마나 시간이 걸리나요?',
    answer:
      '일반적으로 1~3분 정도 소요됩니다. 계약서의 분량이나 복잡도에 따라 시간이 달라질 수 있습니다. 분석이 완료되면 알림으로 안내해 드립니다.',
  },
  {
    category: '계정',
    question: '비밀번호를 잊어버렸어요.',
    answer:
      '로그인 화면에서 "비밀번호 찾기"를 통해 이메일로 임시 비밀번호를 받을 수 있습니다. 임시 비밀번호로 로그인 후 설정에서 비밀번호를 변경해 주세요.',
  },
  {
    category: '계정',
    question: '계정을 탈퇴하고 싶어요.',
    answer:
      '설정 > 문의하기를 통해 탈퇴 요청을 해주시면 확인 후 처리해 드립니다.',
  },
  {
    category: '보안',
    question: '업로드한 계약서의 보안은 안전한가요?',
    answer:
      "저희는 'Zero-Retention (데이터 무저장) 원칙'을 철저히 준수합니다. 사용자가 업로드한 계약서 파일은 AI 분석이 완료되는 즉시 서버에서 영구적으로 삭제됩니다. 저희 서비스는 개인정보 보호를 위해 다음과 같은 3중 보안 시스템을 운영하고 있습니다.\n\n1. 즉시 파기 (Auto-Destruction):\n분석이 끝난 직후, 시스템 내부의 'Kill Switch'가 작동하여 원본 파일을 복구 불가능한 상태로 즉시 삭제합니다.\n\n2. 데이터 학습 방지:\n저희가 사용하는 OpenAI API 정책에 따라, 귀하의 데이터는 AI 모델 학습에 절대 사용되지 않습니다.\n\n3. 이중 삭제 검증:\nAI 분석 엔진과 API 전송 서버 양쪽에서 삭제 로직이 이중으로 작동하여, 데이터 잔존 가능성을 원천 차단했습니다.",
  },
  {
    category: '보안',
    question: '분석 결과는 어디에 저장되나요?',
    answer:
      "'계약서 원본'은 즉시 삭제되며, '분석 리포트'만 회원님의 계정에 안전하게 저장됩니다.\n\n1. 원본 파일 (PDF/이미지):\n개인정보가 가장 많이 포함된 계약서 원본 파일은 분석 즉시 영구 삭제되어 어디에도 남지 않습니다.\n\n2. 분석 리포트 (텍스트):\nAI가 추출한 독소 조항, 위험도 점수, 법률적 조언 데이터는 회원님의 계정에 저장됩니다.\n\n저장된 리포트는 회원님 계정의 '보관함'에서 언제든지 다시 열람하실 수 있으며, 본인 인증 절차를 거친 제3자는 내용을 볼 수 없도록 철저하게 권한이 통제됩니다.",
  },
  {
    category: '요금',
    question: '무료로 사용할 수 있나요?',
    answer:
      '기본적인 분석 기능은 무료로 제공됩니다. 더 정밀한 분석이나 추가 기능은 프리미엄 플랜에서 이용하실 수 있습니다.',
  },
];

function FAQItemCard({
  item,
  isOpen,
  onToggle,
}: {
  item: FAQItem;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <TouchableOpacity
      style={styles.faqItem}
      activeOpacity={0.7}
      onPress={onToggle}
    >
      <View style={styles.questionRow}>
        <Text style={styles.questionText}>{item.question}</Text>
        <MaterialIcons
          name={isOpen ? 'expand-less' : 'expand-more'}
          size={24}
          color={Colors.stone400}
        />
      </View>
      {isOpen && (
        <View style={styles.answerWrap}>
          <Text style={styles.answerText}>{item.answer}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function FAQScreen({ navigation }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const categories = [...new Set(faqData.map((f) => f.category))];

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
        <Text style={styles.headerTitle}>자주 묻는 질문</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {categories.map((cat) => (
          <View key={cat} style={styles.section}>
            <Text style={styles.sectionTitle}>{cat}</Text>
            <View style={styles.groupCard}>
              {faqData
                .map((item, idx) => ({ item, idx }))
                .filter(({ item }) => item.category === cat)
                .map(({ item, idx }, i, arr) => (
                  <React.Fragment key={idx}>
                    <FAQItemCard
                      item={item}
                      isOpen={openIndex === idx}
                      onToggle={() =>
                        setOpenIndex(openIndex === idx ? null : idx)
                      }
                    />
                    {i < arr.length - 1 && <View style={styles.divider} />}
                  </React.Fragment>
                ))}
            </View>
          </View>
        ))}

        <View style={styles.contactCard}>
          <MaterialIcons name="help-outline" size={22} color={Colors.primaryDark} />
          <View style={styles.contactTextWrap}>
            <Text style={styles.contactTitle}>원하는 답변을 찾지 못하셨나요?</Text>
            <Text style={styles.contactSubtitle}>문의하기를 통해 질문해 주세요.</Text>
          </View>
          <TouchableOpacity
            style={styles.contactButton}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('Contact')}
          >
            <Text style={styles.contactButtonText}>문의하기</Text>
          </TouchableOpacity>
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
  section: {
    marginBottom: 20,
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
  faqItem: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  questionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  questionText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: Colors.stone900,
    marginRight: 8,
  },
  answerWrap: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.stone100,
  },
  answerText: {
    fontSize: FontSize.md,
    color: Colors.stone600,
    lineHeight: 22,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.stone100,
    marginLeft: 16,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.stone100,
    gap: 12,
  },
  contactTextWrap: {
    flex: 1,
  },
  contactTitle: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.stone900,
  },
  contactSubtitle: {
    fontSize: FontSize.xs,
    color: Colors.stone500,
    marginTop: 2,
  },
  contactButton: {
    backgroundColor: Colors.primaryDark,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  contactButtonText: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.white,
  },
});
