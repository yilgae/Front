import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { Colors, FontSize, BorderRadius } from '../constants/theme';
import { API_BASE_URL, useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 24 * 2 - 16) / 2;
const WEEKDAYS_KO = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
const CONTRACT_TIPS = [
  '계약 기간 시작일과 종료일을 정확히 확인하고 자동 연장 조건을 체크하세요.',
  '위약금 조항은 금액뿐 아니라 산정 방식까지 확인해야 분쟁을 줄일 수 있습니다.',
  '구두 합의 내용은 효력이 약하므로 중요한 사항은 반드시 계약서에 명시하세요.',
  '해지 사유와 해지 절차가 구체적일수록 불리한 일방 해지를 막을 수 있습니다.',
  '손해배상 책임 범위가 과도하지 않은지, 상한선이 있는지 확인하세요.',
  '지급 조건은 날짜, 방식, 지연 시 이자까지 포함해 명확히 적어두는 것이 좋습니다.',
  '업무 범위(Scope)가 모호하면 추가 요구가 생기기 쉬우니 세부 항목을 구체화하세요.',
  '지식재산권 귀속 조항은 결과물 소유권과 사용권을 나눠서 검토하세요.',
  '비밀유지 조항의 기간과 예외 사유를 확인해 과도한 제한을 피하세요.',
  '관할 법원 및 준거법 조항은 분쟁 발생 시 비용과 시간에 큰 영향을 줍니다.',
  '검수 기준과 승인 기한을 정해두면 완료 여부를 명확히 판단할 수 있습니다.',
  '재위탁(하도급) 허용 여부를 확인해 예상치 못한 제3자 개입을 방지하세요.',
  '면책 조항이 상대방에만 유리하게 구성되지 않았는지 꼭 확인하세요.',
  '변경 계약(추가 합의)은 서면으로 남기고 원계약과의 우선순위를 정해두세요.',
  '계약서에 첨부 문서가 있다면 본문과 충돌 여부를 함께 검토하세요.',
] as const;

type ApiDocument = {
  id: string;
  filename: string;
  status: string;
  created_at: string;
  risk_count: number;
};

// --- Stat Card ---
function StatCard({
  icon,
  iconBg,
  iconColor,
  label,
  value,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  iconBg: string;
  iconColor: string;
  label: string;
  value: number;
}) {
  return (
    <View style={[styles.statCard, { minWidth: CARD_WIDTH }]}> 
      <View style={styles.statHeader}>
        <View style={[styles.statIconWrap, { backgroundColor: iconBg }]}> 
          <MaterialIcons name={icon} size={16} color={iconColor} />
        </View>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

// --- Activity Item ---
type RiskStatus = 'analyzing' | 'danger' | 'safe';
type RecentActivity = {
  id: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  iconBg: string;
  iconColor: string;
  title: string;
  date: string;
  status: RiskStatus;
  statusLabel: string;
};

function ActivityItem({
  icon,
  iconBg,
  iconColor,
  title,
  date,
  status,
  statusLabel,
  onPress,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  iconBg: string;
  iconColor: string;
  title: string;
  date: string;
  status: RiskStatus;
  statusLabel: string;
  onPress?: () => void;
}) {
  const badgeStyle =
    status === 'danger'
      ? styles.badgeDanger
      : status === 'safe'
        ? styles.badgeSafe
        : styles.badgeAnalyzing;
  const badgeText =
    status === 'danger'
      ? styles.badgeDangerText
      : status === 'safe'
        ? styles.badgeSafeText
        : styles.badgeAnalyzingText;

  return (
    <TouchableOpacity
      style={styles.activityCard}
      activeOpacity={0.7}
      disabled={status === 'analyzing'}
      onPress={onPress}
    >
      <View style={styles.activityLeft}>
        <View style={[styles.activityIcon, { backgroundColor: iconBg }]}> 
          <MaterialIcons name={icon} size={20} color={iconColor} />
        </View>
        <View style={styles.activityInfo}>
          <Text style={styles.activityTitle} numberOfLines={1}>
            {title}
          </Text>
          <View style={styles.activityMeta}>
            <Text style={styles.activityDate}>{date}</Text>
            <View style={styles.dot} />
            {status === 'analyzing' ? (
              <Text style={styles.analyzingText}>{statusLabel}</Text>
            ) : (
              <View style={badgeStyle}>
                <Text style={badgeText}>{statusLabel}</Text>
              </View>
            )}
          </View>
        </View>
      </View>
      {status !== 'analyzing' && (
        <MaterialIcons name="chevron-right" size={24} color={Colors.stone300} />
      )}
    </TouchableOpacity>
  );
}

// --- Main Screen ---
export default function HomeScreen() {
  const { user, token, unreadNotificationCount } = useAuth();
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();
  const now = new Date();
  const formattedDate = `${now.getMonth() + 1}월 ${now.getDate()}일 ${WEEKDAYS_KO[now.getDay()]}`;

  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [contractTip, setContractTip] = useState<string>(() => {
    const initialIndex = Math.floor(Math.random() * CONTRACT_TIPS.length);
    return CONTRACT_TIPS[initialIndex];
  });

  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) {
      return '-';
    }
    return `${date.getMonth() + 1}월 ${date.getDate()}일`;
  }, []);

  const mapActivity = useCallback(
    (doc: ApiDocument): RecentActivity => {
      if (doc.status !== 'done') {
        return {
          id: doc.id,
          icon: 'sync',
          iconBg: Colors.yellow50,
          iconColor: Colors.primary,
          title: doc.filename,
          date: formatDate(doc.created_at),
          status: 'analyzing',
          statusLabel: '분석 중...',
        };
      }
      if (doc.risk_count > 0) {
        return {
          id: doc.id,
          icon: 'gavel',
          iconBg: Colors.red50,
          iconColor: Colors.red500,
          title: doc.filename,
          date: formatDate(doc.created_at),
          status: 'danger',
          statusLabel: `${doc.risk_count}건 위험 발견`,
        };
      }
      return {
        id: doc.id,
        icon: 'check-circle-outline',
        iconBg: Colors.green50,
        iconColor: Colors.green500,
        title: doc.filename,
        date: formatDate(doc.created_at),
        status: 'safe',
        statusLabel: '안전',
      };
    },
    [formatDate]
  );

  const loadRecentActivities = useCallback(async () => {
    if (!token) {
      setRecentActivities([]);
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/analyze`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        setRecentActivities([]);
        return;
      }
      const docs: ApiDocument[] = await res.json();
      setRecentActivities(docs.slice(0, 3).map(mapActivity));
    } catch {
      setRecentActivities([]);
    }
  }, [mapActivity, token]);

  useEffect(() => {
    if (isFocused) {
      const randomIndex = Math.floor(Math.random() * CONTRACT_TIPS.length);
      setContractTip(CONTRACT_TIPS[randomIndex]);
      loadRecentActivities();
    }
  }, [isFocused, loadRecentActivities]);

  const safeCount = useMemo(
    () => recentActivities.filter((x) => x.status === 'safe').length,
    [recentActivities]
  );
  const dangerCount = useMemo(
    () => recentActivities.filter((x) => x.status === 'danger').length,
    [recentActivities]
  );

  const handleRecentActivityPress = useCallback(
    (item: RecentActivity) => {
      if (item.status === 'analyzing') {
        return;
      }

      navigation.navigate('Archive', {
        screen: 'ArchiveDetail',
        params: { documentId: item.id, title: item.title },
        initial: false,
      });
    },
    [navigation]
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Image
              source={require('../../assets/logo_orange_strong.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
          <TouchableOpacity
            style={styles.notifBtn}
            onPress={() => navigation.navigate('NotificationList')}
          >
            <MaterialIcons name="notifications" size={24} color={Colors.stone600} />
            {unreadNotificationCount > 0 ? <View style={styles.notifDot} /> : null}
          </TouchableOpacity>
        </View>

        <View style={styles.greeting}>
          <Text style={styles.dateText}>{formattedDate}</Text>
          <Text style={styles.greetingMain}>
            안녕하세요,{"\n"}
            <Text style={styles.greetingName}>{user?.name ?? '사용자'}님!</Text>
          </Text>
        </View>

        <View style={styles.statRow}>
          <StatCard
            icon="verified-user"
            iconBg={Colors.green100}
            iconColor={Colors.green600}
            label="안전한 계약"
            value={safeCount}
          />
          <StatCard
            icon="warning"
            iconBg={Colors.red100}
            iconColor={Colors.red600}
            label="위험 요소 발견"
            value={dangerCount}
          />
        </View>

        <TouchableOpacity
          style={styles.ctaButton}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('Upload')}
        >
          <View style={styles.ctaIconBg}>
            <MaterialIcons name="add" size={28} color={Colors.white} />
          </View>
          <Text style={styles.ctaTitle}>새 계약서 분석하기</Text>
          <Text style={styles.ctaDesc}>
            PDF나 이미지를 업로드하여 독소 조항을 즉시 확인해보세요.
          </Text>
          <View style={styles.ctaBgIcon}>
            <MaterialIcons name="description" size={160} color="rgba(255,255,255,0.1)" />
          </View>
        </TouchableOpacity>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>최근 활동</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Archive')}>
            <Text style={styles.seeAll}>전체 보기</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.activityList}>
          {recentActivities.length === 0 ? (
            <View style={styles.emptyActivityCard}>
              <Text style={styles.emptyActivityText}>최근 분석 활동이 없습니다.</Text>
            </View>
          ) : (
            recentActivities.map((item) => (
              <ActivityItem
                key={item.id}
                icon={item.icon}
                iconBg={item.iconBg}
                iconColor={item.iconColor}
                title={item.title}
                date={item.date}
                status={item.status}
                statusLabel={item.statusLabel}
                onPress={() => handleRecentActivityPress(item)}
              />
            ))
          )}
        </View>

        <View style={styles.tipCard}>
          <View style={styles.tipIcon}>
            <MaterialIcons name="tips-and-updates" size={22} color={Colors.primary} />
          </View>
          <View style={styles.tipContent}>
            <Text style={styles.tipTitle}>계약 꿀팁</Text>
            <Text style={styles.tipText}>{contractTip}</Text>
          </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoImage: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.xl,
  },
  notifBtn: {
    padding: 8,
    borderRadius: BorderRadius.full,
    position: 'relative',
  },
  notifDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#EF4444',
    borderWidth: 2,
    borderColor: Colors.backgroundLight,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  greeting: {
    marginTop: 8,
    marginBottom: 28,
  },
  dateText: {
    color: Colors.stone500,
    fontWeight: '500',
    fontSize: FontSize.sm,
    marginBottom: 4,
  },
  greetingMain: {
    fontSize: FontSize['3xl'],
    fontWeight: '700',
    color: Colors.stone900,
    lineHeight: 40,
  },
  greetingName: {
    color: Colors.primaryDark,
  },
  statRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 28,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.stone100,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  statIconWrap: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statLabel: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Colors.stone500,
  },
  statValue: {
    fontSize: FontSize['2xl'],
    fontWeight: '700',
    color: Colors.stone900,
  },
  ctaButton: {
    borderRadius: BorderRadius.xl,
    padding: 24,
    marginBottom: 32,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: Colors.accent,
  },
  ctaBgIcon: {
    position: 'absolute',
    right: -20,
    top: -20,
    transform: [{ rotate: '12deg' }],
  },
  ctaIconBg: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.lg,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  ctaTitle: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 8,
  },
  ctaDesc: {
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
    paddingRight: 48,
    lineHeight: 18,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.stone900,
  },
  seeAll: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.primaryDark,
  },
  activityList: {
    gap: 12,
    marginBottom: 24,
  },
  emptyActivityCard: {
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.stone100,
  },
  emptyActivityText: {
    fontSize: FontSize.sm,
    color: Colors.stone500,
    textAlign: 'center',
  },
  activityCard: {
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.stone100,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  activityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.stone900,
    marginBottom: 2,
  },
  activityMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  activityDate: {
    fontSize: FontSize.xs,
    color: Colors.stone400,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: Colors.stone300,
  },
  analyzingText: {
    fontSize: FontSize.xs,
    fontWeight: '500',
    color: Colors.primaryDark,
  },
  badgeDanger: {
    backgroundColor: Colors.red100,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeDangerText: {
    fontSize: FontSize.xs,
    fontWeight: '500',
    color: Colors.red800,
  },
  badgeSafe: {
    backgroundColor: Colors.green100,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeSafeText: {
    fontSize: FontSize.xs,
    fontWeight: '500',
    color: Colors.green800,
  },
  badgeAnalyzing: {},
  badgeAnalyzingText: {},
  tipCard: {
    backgroundColor: Colors.secondary,
    borderRadius: BorderRadius.xl,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    borderWidth: 1,
    borderColor: Colors.yellow100,
  },
  tipIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.stone900,
    marginBottom: 4,
  },
  tipText: {
    fontSize: FontSize.xs,
    color: Colors.stone600,
    lineHeight: 18,
  },
});
