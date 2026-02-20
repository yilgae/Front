import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, FontSize } from '../constants/theme';
import { useAuth, API_BASE_URL } from '../context/AuthContext';
import * as WebBrowser from 'expo-web-browser';

type Props = {
  navigation: any;
};

type PlanFeature = {
  label: string;
  free: boolean | string;
  premium: boolean | string;
};

const planFeatures: PlanFeature[] = [
  { label: '월 분석 횟수', free: '3회', premium: '무제한' },
  { label: '기본 조항 분석', free: true, premium: true },
  { label: '위험 조항 상세 해설', free: false, premium: true },
  { label: '법률 용어 해석', free: false, premium: true },
  { label: 'AI 법률 상담', free: false, premium: true },
  { label: '분석 리포트 PDF 저장', free: false, premium: true },
  { label: '우선 분석 처리', free: false, premium: true },
  { label: '광고 제거', free: false, premium: true },
];

export default function MembershipScreen({ navigation }: Props) {
  // 1. 에러를 내던 fetchUserInfo 제거
  const { user, token } = useAuth(); 
  
  // 2. [치트키] 화면 즉각 업데이트를 위한 로컬 상태 추가
  const [localPremium, setLocalPremium] = useState(false);
  
  // 3. (user as any)를 써서 강제로 타입 에러를 우회하고, 로컬 상태를 결합
  const currentPlan = ((user as any)?.is_premium || localPremium) ? 'premium' : 'free';

  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly');
  const [isLoading, setIsLoading] = useState(false); // 로딩 상태 추가

  const prices = {
    monthly: { price: '9,900', period: '월' },
    yearly: { price: '6,600', period: '월', total: '79,200', save: '33%' },
  };

  // 👇 결제 로직 교체
  const handleSubscribe = async () => {
    if (!token) {
      Alert.alert('알림', '로그인이 필요합니다.');
      return;
    }

    try {
      setIsLoading(true);
      
      // 1. 백엔드에 결제창 URL 요청
      const res = await fetch(`${API_BASE_URL}/api/users/polar/checkout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!res.ok) throw new Error('결제창을 생성하지 못했습니다.');
      
      const data = await res.json();
      
      // 2. 앱 내에서 Polar 결제 웹페이지 띄우기
      await WebBrowser.openBrowserAsync(data.checkout_url);
      
      // 3. 브라우저가 닫히면, 해커톤용 강제 업그레이드 API 호출!
      await fetch(`${API_BASE_URL}/api/users/polar/upgrade-demo`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });

      // 4. [치트키 발동] 에러를 내던 fetchUserInfo() 대신 로컬 상태를 True로 변경!
      // 이렇게 하면 앱을 껐다 켜지 않아도 UI가 프리미엄으로 즉시 바뀝니다.
      setLocalPremium(true); 
      
      Alert.alert('성공', '프리미엄 플랜이 활성화되었습니다! 🎉');

    } catch (error) {
      console.error(error);
      Alert.alert('오류', '결제 진행 중 문제가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleManagePayment = () => {
    // TODO: 결제 수단 관리 페이지로 이동
    navigation.navigate('PaymentMethod');
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
        <Text style={styles.headerTitle}>멤버십</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.demoNoticeCard}>
          <MaterialIcons name="campaign" size={18} color={Colors.primaryDark} />
          <Text style={styles.demoNoticeText}>
            현재는 데모라서 작동하지 않는 페이지입니다.
          </Text>
        </View>

        {/* 현재 플랜 카드 */}
        <View style={styles.currentPlanCard}>
          <View style={styles.currentPlanTop}>
            <View style={styles.planBadge}>
              <MaterialIcons
                name={currentPlan === 'premium' ? 'workspace-premium' : 'person-outline'}
                size={18}
                color={currentPlan === 'premium' ? Colors.primaryDark : Colors.stone500}
              />
              <Text
                style={[
                  styles.planBadgeText,
                  currentPlan === 'premium' && styles.planBadgePremium,
                ]}
              >
                {currentPlan === 'premium' ? '프리미엄' : '무료 플랜'}
              </Text>
            </View>
            {currentPlan === 'premium' && (
              <Text style={styles.renewalText}>다음 결제일: 2025.03.15</Text>
            )}
          </View>
          <Text style={styles.currentPlanDesc}>
            {currentPlan === 'premium'
              ? '프리미엄 플랜을 이용 중입니다. 모든 기능을 무제한으로 사용할 수 있습니다.'
              : '무료 플랜을 이용 중입니다. 프리미엄으로 업그레이드하여 더 많은 기능을 사용해 보세요.'}
          </Text>
          {currentPlan === 'free' && (
            <View style={styles.usageBar}>
              <View style={styles.usageBarTrack}>
                <View style={[styles.usageBarFill, { width: '66%' }]} />
              </View>
              <Text style={styles.usageText}>이번 달 분석 2/3회 사용</Text>
            </View>
          )}
        </View>

        {/* 플랜 선택 (무료 사용자만) */}
        {currentPlan === 'free' && (
          <>
            <Text style={styles.sectionTitle}>프리미엄 플랜 선택</Text>
            <View style={styles.planSelectRow}>
              {/* 월간 */}
              <TouchableOpacity
                style={[
                  styles.planOption,
                  selectedPlan === 'monthly' && styles.planOptionActive,
                ]}
                activeOpacity={0.7}
                onPress={() => setSelectedPlan('monthly')}
              >
                <View style={styles.planOptionHeader}>
                  <Text
                    style={[
                      styles.planOptionTitle,
                      selectedPlan === 'monthly' && styles.planOptionTitleActive,
                    ]}
                  >
                    월간
                  </Text>
                </View>
                <Text
                  style={[
                    styles.planPrice,
                    selectedPlan === 'monthly' && styles.planPriceActive,
                  ]}
                >
                  ₩{prices.monthly.price}
                </Text>
                <Text style={styles.planPeriod}>/ 월</Text>
              </TouchableOpacity>

              {/* 연간 */}
              <TouchableOpacity
                style={[
                  styles.planOption,
                  selectedPlan === 'yearly' && styles.planOptionActive,
                ]}
                activeOpacity={0.7}
                onPress={() => setSelectedPlan('yearly')}
              >
                <View style={styles.planOptionHeader}>
                  <Text
                    style={[
                      styles.planOptionTitle,
                      selectedPlan === 'yearly' && styles.planOptionTitleActive,
                    ]}
                  >
                    연간
                  </Text>
                  <View style={styles.saveBadge}>
                    <Text style={styles.saveBadgeText}>{prices.yearly.save} 할인</Text>
                  </View>
                </View>
                <Text
                  style={[
                    styles.planPrice,
                    selectedPlan === 'yearly' && styles.planPriceActive,
                  ]}
                >
                  ₩{prices.yearly.price}
                </Text>
                <Text style={styles.planPeriod}>/ 월 (연 ₩{prices.yearly.total})</Text>
              </TouchableOpacity>
            </View>

            {/* 구독 버튼 */}
            <TouchableOpacity
              style={styles.subscribeButton}
              activeOpacity={0.8}
              onPress={handleSubscribe}
              disabled={isLoading} // 로딩 중일 때는 버튼 터치 막기
            >
              {isLoading ? (
                <ActivityIndicator color={Colors.white} /> // 빙글빙글 아이콘
              ) : (
                <>
                  <MaterialIcons name="workspace-premium" size={20} color={Colors.white} />
                  <Text style={styles.subscribeText}>프리미엄 시작하기</Text>
                </>
              )}
            </TouchableOpacity>
          </>
        )}

        {/* 기능 비교 */}
        <Text style={styles.sectionTitle}>플랜 비교</Text>
        <View style={styles.compareCard}>
          {/* 헤더 */}
          <View style={styles.compareHeader}>
            <Text style={styles.compareHeaderLabel}>기능</Text>
            <Text style={styles.compareHeaderPlan}>무료</Text>
            <Text style={[styles.compareHeaderPlan, styles.compareHeaderPremium]}>프리미엄</Text>
          </View>
          <View style={styles.compareDivider} />

          {/* 기능 행들 */}
          {planFeatures.map((feature, idx) => (
            <React.Fragment key={idx}>
              <View style={styles.compareRow}>
                <Text style={styles.compareLabel}>{feature.label}</Text>
                <View style={styles.compareValue}>
                  {typeof feature.free === 'string' ? (
                    <Text style={styles.compareValueText}>{feature.free}</Text>
                  ) : feature.free ? (
                    <MaterialIcons name="check-circle" size={20} color={Colors.green500} />
                  ) : (
                    <MaterialIcons name="cancel" size={20} color={Colors.stone300} />
                  )}
                </View>
                <View style={styles.compareValue}>
                  {typeof feature.premium === 'string' ? (
                    <Text style={[styles.compareValueText, styles.compareValuePremium]}>
                      {feature.premium}
                    </Text>
                  ) : feature.premium ? (
                    <MaterialIcons name="check-circle" size={20} color={Colors.green500} />
                  ) : (
                    <MaterialIcons name="cancel" size={20} color={Colors.stone300} />
                  )}
                </View>
              </View>
              {idx < planFeatures.length - 1 && <View style={styles.compareDividerLight} />}
            </React.Fragment>
          ))}
        </View>

        {/* 결제 수단 관리 */}
        <Text style={styles.sectionTitle}>결제 관리</Text>
        <View style={styles.groupCard}>
          <TouchableOpacity style={styles.menuRow} activeOpacity={0.7} onPress={handleManagePayment}>
            <View style={styles.menuRowLeft}>
              <MaterialIcons name="credit-card" size={22} color={Colors.primaryDark} />
              <View style={styles.menuTextWrap}>
                <Text style={styles.menuLabel}>결제 수단 관리</Text>
                <Text style={styles.menuSub}>등록된 카드 및 결제 수단</Text>
              </View>
            </View>
            <MaterialIcons name="chevron-right" size={22} color={Colors.stone300} />
          </TouchableOpacity>
          <View style={styles.menuDivider} />
          <TouchableOpacity style={styles.menuRow} activeOpacity={0.7}>
            <View style={styles.menuRowLeft}>
              <MaterialIcons name="receipt-long" size={22} color={Colors.primaryDark} />
              <View style={styles.menuTextWrap}>
                <Text style={styles.menuLabel}>결제 내역</Text>
                <Text style={styles.menuSub}>이전 결제 기록 확인</Text>
              </View>
            </View>
            <MaterialIcons name="chevron-right" size={22} color={Colors.stone300} />
          </TouchableOpacity>
          {currentPlan === 'premium' && (
            <>
              <View style={styles.menuDivider} />
              <TouchableOpacity style={styles.menuRow} activeOpacity={0.7}>
                <View style={styles.menuRowLeft}>
                  <MaterialIcons name="cancel" size={22} color={Colors.red500} />
                  <View style={styles.menuTextWrap}>
                    <Text style={[styles.menuLabel, { color: Colors.red500 }]}>구독 해지</Text>
                    <Text style={styles.menuSub}>다음 결제일부터 무료 플랜으로 전환</Text>
                  </View>
                </View>
                <MaterialIcons name="chevron-right" size={22} color={Colors.stone300} />
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* 안내 */}
        <View style={styles.infoCard}>
          <MaterialIcons name="info-outline" size={18} color={Colors.primaryDark} />
          <Text style={styles.infoText}>
            결제는 등록된 결제 수단으로 자동 청구됩니다. 구독 해지 시 남은 기간 동안 프리미엄 기능을 계속 이용할 수 있습니다.
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
  demoNoticeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.yellow50,
    borderWidth: 1,
    borderColor: Colors.yellow100,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  demoNoticeText: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.stone600,
    fontWeight: '600',
  },

  // 현재 플랜
  currentPlanCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.stone100,
    marginBottom: 24,
  },
  currentPlanTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  planBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.yellow50,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  planBadgeText: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.stone500,
  },
  planBadgePremium: {
    color: Colors.primaryDark,
  },
  renewalText: {
    fontSize: FontSize.xs,
    color: Colors.stone400,
  },
  currentPlanDesc: {
    fontSize: FontSize.sm,
    color: Colors.stone600,
    lineHeight: 20,
  },
  usageBar: {
    marginTop: 14,
  },
  usageBarTrack: {
    height: 6,
    backgroundColor: Colors.stone100,
    borderRadius: 3,
    overflow: 'hidden',
  },
  usageBarFill: {
    height: '100%',
    backgroundColor: Colors.primaryDark,
    borderRadius: 3,
  },
  usageText: {
    fontSize: FontSize.xs,
    color: Colors.stone500,
    marginTop: 6,
  },

  // 섹션
  sectionTitle: {
    fontSize: FontSize.xs,
    color: Colors.stone500,
    fontWeight: '600',
    marginBottom: 8,
    paddingHorizontal: 4,
  },

  // 플랜 선택
  planSelectRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  planOption: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: Colors.stone100,
    alignItems: 'center',
  },
  planOptionActive: {
    borderColor: Colors.primaryDark,
    backgroundColor: Colors.yellow50,
  },
  planOptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  planOptionTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.stone500,
  },
  planOptionTitleActive: {
    color: Colors.primaryDark,
  },
  saveBadge: {
    backgroundColor: Colors.red500,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  saveBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.white,
  },
  planPrice: {
    fontSize: FontSize['2xl'],
    fontWeight: '800',
    color: Colors.stone900,
  },
  planPriceActive: {
    color: Colors.primaryDark,
  },
  planPeriod: {
    fontSize: FontSize.xs,
    color: Colors.stone500,
    marginTop: 2,
  },

  // 구독 버튼
  subscribeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primaryDark,
    borderRadius: 14,
    paddingVertical: 15,
    marginBottom: 24,
  },
  subscribeText: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.white,
  },

  // 기능 비교
  compareCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.stone100,
    overflow: 'hidden',
    marginBottom: 24,
  },
  compareHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.stone50,
  },
  compareHeaderLabel: {
    flex: 1,
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.stone600,
  },
  compareHeaderPlan: {
    width: 60,
    textAlign: 'center',
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Colors.stone500,
  },
  compareHeaderPremium: {
    color: Colors.primaryDark,
  },
  compareDivider: {
    height: 1,
    backgroundColor: Colors.stone100,
  },
  compareDividerLight: {
    height: 1,
    backgroundColor: Colors.stone50,
    marginLeft: 16,
  },
  compareRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  compareLabel: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.stone900,
  },
  compareValue: {
    width: 60,
    alignItems: 'center',
  },
  compareValueText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.stone500,
  },
  compareValuePremium: {
    color: Colors.primaryDark,
  },

  // 결제 관리 메뉴
  groupCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.stone100,
    overflow: 'hidden',
    marginBottom: 20,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  menuRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  menuTextWrap: {
    flex: 1,
  },
  menuLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.stone900,
  },
  menuSub: {
    fontSize: FontSize.xs,
    color: Colors.stone500,
    marginTop: 2,
  },
  menuDivider: {
    height: 1,
    backgroundColor: Colors.stone100,
    marginLeft: 48,
  },

  // 안내
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
  },
  infoText: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.stone600,
    lineHeight: 18,
  },
});
