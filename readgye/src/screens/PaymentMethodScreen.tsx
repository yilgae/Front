import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, FontSize } from '../constants/theme';

type Props = {
  navigation: any;
};

type PaymentCard = {
  id: string;
  type: 'visa' | 'mastercard' | 'kakao' | 'toss';
  label: string;
  last4: string;
  isDefault: boolean;
};

// 더미 데이터 — 추후 결제 API 연동 시 교체
const dummyCards: PaymentCard[] = [];

export default function PaymentMethodScreen({ navigation }: Props) {
  const [cards, setCards] = useState<PaymentCard[]>(dummyCards);

  const getCardIcon = (type: PaymentCard['type']): keyof typeof MaterialIcons.glyphMap => {
    switch (type) {
      case 'visa':
      case 'mastercard':
        return 'credit-card';
      case 'kakao':
        return 'chat';
      case 'toss':
        return 'account-balance-wallet';
      default:
        return 'credit-card';
    }
  };

  const getCardColor = (type: PaymentCard['type']): string => {
    switch (type) {
      case 'visa':
        return '#1A1F71';
      case 'mastercard':
        return '#EB001B';
      case 'kakao':
        return '#FEE500';
      case 'toss':
        return '#0064FF';
      default:
        return Colors.stone500;
    }
  };

  const handleAddCard = () => {
    // TODO: 결제 API SDK 연동 (토스페이먼츠, 카카오페이 등)
    const msg = '결제 수단 등록 기능은 결제 API 연동 후 사용 가능합니다.';
    if (Platform.OS === 'web') {
      window.alert(msg);
    } else {
      Alert.alert('안내', msg);
    }
  };

  const handleSetDefault = (id: string) => {
    setCards((prev) =>
      prev.map((c) => ({ ...c, isDefault: c.id === id }))
    );
  };

  const handleRemoveCard = (id: string) => {
    const doRemove = () => {
      setCards((prev) => prev.filter((c) => c.id !== id));
    };

    if (Platform.OS === 'web') {
      if (window.confirm('이 결제 수단을 삭제하시겠습니까?')) {
        doRemove();
      }
    } else {
      Alert.alert('삭제 확인', '이 결제 수단을 삭제하시겠습니까?', [
        { text: '취소', style: 'cancel' },
        { text: '삭제', style: 'destructive', onPress: doRemove },
      ]);
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
        <Text style={styles.headerTitle}>결제 수단 관리</Text>
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

        {cards.length === 0 ? (
          /* 등록된 카드 없음 */
          <View style={styles.emptyCard}>
            <View style={styles.emptyIconCircle}>
              <MaterialIcons name="credit-card-off" size={40} color={Colors.stone400} />
            </View>
            <Text style={styles.emptyTitle}>등록된 결제 수단이 없습니다</Text>
            <Text style={styles.emptySubtitle}>
              프리미엄 구독을 위해 결제 수단을 등록해 주세요.
            </Text>
          </View>
        ) : (
          /* 카드 목록 */
          <View style={styles.groupCard}>
            {cards.map((card, idx) => (
              <React.Fragment key={card.id}>
                <View style={styles.cardRow}>
                  <View style={styles.cardLeft}>
                    <View style={[styles.cardIconCircle, { backgroundColor: getCardColor(card.type) + '18' }]}>
                      <MaterialIcons
                        name={getCardIcon(card.type)}
                        size={22}
                        color={getCardColor(card.type)}
                      />
                    </View>
                    <View style={styles.cardTextWrap}>
                      <View style={styles.cardLabelRow}>
                        <Text style={styles.cardLabel}>{card.label}</Text>
                        {card.isDefault && (
                          <View style={styles.defaultBadge}>
                            <Text style={styles.defaultBadgeText}>기본</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.cardNumber}>•••• {card.last4}</Text>
                    </View>
                  </View>
                  <View style={styles.cardActions}>
                    {!card.isDefault && (
                      <TouchableOpacity
                        style={styles.setDefaultBtn}
                        activeOpacity={0.7}
                        onPress={() => handleSetDefault(card.id)}
                      >
                        <Text style={styles.setDefaultText}>기본 설정</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => handleRemoveCard(card.id)}
                    >
                      <MaterialIcons name="delete-outline" size={22} color={Colors.red500} />
                    </TouchableOpacity>
                  </View>
                </View>
                {idx < cards.length - 1 && <View style={styles.divider} />}
              </React.Fragment>
            ))}
          </View>
        )}

        {/* 결제 수단 추가 버튼 */}
        <TouchableOpacity
          style={styles.addButton}
          activeOpacity={0.8}
          onPress={handleAddCard}
        >
          <MaterialIcons name="add-circle-outline" size={22} color={Colors.white} />
          <Text style={styles.addButtonText}>결제 수단 추가</Text>
        </TouchableOpacity>

        {/* 지원 결제 수단 */}
        <Text style={styles.sectionTitle}>지원 결제 수단</Text>
        <View style={styles.groupCard}>
          <View style={styles.supportRow}>
            <MaterialIcons name="credit-card" size={20} color="#1A1F71" />
            <Text style={styles.supportText}>신용카드 / 체크카드</Text>
          </View>
          <View style={styles.supportDivider} />
          <View style={styles.supportRow}>
            <MaterialIcons name="chat" size={20} color="#FEE500" />
            <Text style={styles.supportText}>카카오페이</Text>
          </View>
          <View style={styles.supportDivider} />
          <View style={styles.supportRow}>
            <MaterialIcons name="account-balance-wallet" size={20} color="#0064FF" />
            <Text style={styles.supportText}>토스페이</Text>
          </View>
          <View style={styles.supportDivider} />
          <View style={styles.supportRow}>
            <MaterialIcons name="phone-android" size={20} color="#03C75A" />
            <Text style={styles.supportText}>네이버페이</Text>
          </View>
        </View>

        {/* 안내 */}
        <View style={styles.infoCard}>
          <MaterialIcons name="lock" size={18} color={Colors.primaryDark} />
          <Text style={styles.infoText}>
            모든 결제 정보는 PCI DSS 기준에 따라 안전하게 암호화되어 처리됩니다. 읽계는 카드 정보를 직접 저장하지 않습니다.
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

  // 빈 상태
  emptyCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 32,
    borderWidth: 1,
    borderColor: Colors.stone100,
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.stone50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.stone900,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: FontSize.sm,
    color: Colors.stone500,
    textAlign: 'center',
  },

  // 카드 목록
  groupCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.stone100,
    overflow: 'hidden',
    marginBottom: 20,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  cardIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTextWrap: {
    flex: 1,
  },
  cardLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.stone900,
  },
  defaultBadge: {
    backgroundColor: Colors.primaryDark,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  defaultBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.white,
  },
  cardNumber: {
    fontSize: FontSize.xs,
    color: Colors.stone500,
    marginTop: 2,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  setDefaultBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: Colors.yellow50,
  },
  setDefaultText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Colors.primaryDark,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.stone100,
    marginLeft: 66,
  },

  // 추가 버튼
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primaryDark,
    borderRadius: 14,
    paddingVertical: 14,
    marginBottom: 24,
  },
  addButtonText: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.white,
  },

  // 섹션
  sectionTitle: {
    fontSize: FontSize.xs,
    color: Colors.stone500,
    fontWeight: '600',
    marginBottom: 8,
    paddingHorizontal: 4,
  },

  // 지원 결제 수단
  supportRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  supportText: {
    fontSize: FontSize.md,
    color: Colors.stone900,
  },
  supportDivider: {
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
    marginTop: 4,
  },
  infoText: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.stone600,
    lineHeight: 18,
  },
});
