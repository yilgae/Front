import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, FontSize, BorderRadius } from '../constants/theme';
import { useAuth, API_BASE_URL } from '../context/AuthContext';

type Props = {
  route: any;
  navigation: any;
};

type ClauseResult = {
  clause_number: string;
  title: string;
  original_text?: string;
  risk_level: 'HIGH' | 'MEDIUM' | 'LOW' | string;
  summary: string;
  suggestion: string;
};

export default function AnalysisResultScreen({ route, navigation }: Props) {
  const { token } = useAuth();
  const { documentId, filename, riskCount } = route.params;

  const [clauses, setClauses] = useState<ClauseResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchResult();
  }, []);

  // GET /api/analyze/{document_id}/result
  const fetchResult = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/analyze/${documentId}/result`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!res.ok) {
        throw new Error(`서버 오류 (${res.status})`);
      }

      const data = await res.json();
      // data = { filename, analysis: [...] }
      setClauses(data.analysis || []);
    } catch (e: any) {
      console.log('결과 조회 실패:', e);
      setError(e.message || '결과를 불러오는 데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 위험도별 카운트
  const highCount = clauses.filter((c) => c.risk_level === 'HIGH').length;
  const mediumCount = clauses.filter((c) => c.risk_level === 'MEDIUM').length;
  const lowCount = clauses.filter((c) => c.risk_level === 'LOW').length;

  // 위험도 색상
  const getRiskColor = (level: string) => {
    switch (level) {
      case 'HIGH':
        return { bg: Colors.red50, border: Colors.red100, text: Colors.red600, icon: Colors.red500 };
      case 'MEDIUM':
        return { bg: Colors.yellow50, border: Colors.yellow100, text: Colors.primaryDark, icon: Colors.accent };
      default:
        return { bg: Colors.green50, border: Colors.green100, text: Colors.green600, icon: Colors.green500 };
    }
  };

  const getRiskLabel = (level: string) => {
    switch (level) {
      case 'HIGH':
        return '위험';
      case 'MEDIUM':
        return '주의';
      default:
        return '안전';
    }
  };

  const getRiskIcon = (level: string): keyof typeof MaterialIcons.glyphMap => {
    switch (level) {
      case 'HIGH':
        return 'error';
      case 'MEDIUM':
        return 'warning';
      default:
        return 'check-circle';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.popToTop()}
          activeOpacity={0.7}
        >
          <MaterialIcons name="arrow-back" size={24} color={Colors.stone900} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>분석 결과</Text>
        <View style={styles.headerRight} />
      </View>

      {isLoading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={Colors.primaryDark} />
          <Text style={styles.loadingText}>분석 결과를 불러오는 중...</Text>
        </View>
      ) : error ? (
        <View style={styles.loadingWrap}>
          <MaterialIcons name="error-outline" size={48} color={Colors.red500} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchResult}>
            <Text style={styles.retryText}>다시 시도</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* 파일명 */}
          <View style={styles.filenameCard}>
            <MaterialIcons name="description" size={22} color={Colors.primaryDark} />
            <Text style={styles.filenameText} numberOfLines={1}>
              {filename}
            </Text>
          </View>

          {/* 요약 카드 */}
          <View style={styles.summaryRow}>
            <View style={[styles.summaryCard, { backgroundColor: Colors.red50 }]}>
              <MaterialIcons name="error" size={20} color={Colors.red500} />
              <Text style={[styles.summaryCount, { color: Colors.red600 }]}>{highCount}</Text>
              <Text style={styles.summaryLabel}>위험</Text>
            </View>
            <View style={[styles.summaryCard, { backgroundColor: Colors.yellow50 }]}>
              <MaterialIcons name="warning" size={20} color={Colors.accent} />
              <Text style={[styles.summaryCount, { color: Colors.primaryDark }]}>{mediumCount}</Text>
              <Text style={styles.summaryLabel}>주의</Text>
            </View>
            <View style={[styles.summaryCard, { backgroundColor: Colors.green50 }]}>
              <MaterialIcons name="check-circle" size={20} color={Colors.green500} />
              <Text style={[styles.summaryCount, { color: Colors.green600 }]}>{lowCount}</Text>
              <Text style={styles.summaryLabel}>안전</Text>
            </View>
          </View>

          {/* 조항별 결과 */}
          <Text style={styles.sectionTitle}>조항별 분석 ({clauses.length}건)</Text>

          {clauses.map((clause, index) => {
            const color = getRiskColor(clause.risk_level);
            return (
              <View
                key={index}
                style={[styles.clauseCard, { borderLeftColor: color.icon, borderLeftWidth: 4 }]}
              >
                {/* 조항 헤더 */}
                <View style={styles.clauseHeader}>
                  <View style={styles.clauseTitleRow}>
                    <MaterialIcons name={getRiskIcon(clause.risk_level)} size={18} color={color.icon} />
                    <Text style={styles.clauseNumber}>{clause.clause_number}</Text>
                    <Text style={styles.clauseTitle} numberOfLines={1}>
                      {clause.title}
                    </Text>
                  </View>
                  <View style={[styles.riskBadge, { backgroundColor: color.bg }]}>
                    <Text style={[styles.riskBadgeText, { color: color.text }]}>
                      {getRiskLabel(clause.risk_level)}
                    </Text>
                  </View>
                </View>

                {/* 원문 */}
                {clause.original_text ? (
                  <View style={[styles.clauseSection, styles.originalTextSection]}>
                    <Text style={styles.clauseSectionLabel}>계약서 원문</Text>
                    <Text style={styles.originalText}>{clause.original_text}</Text>
                  </View>
                ) : null}

                {/* 위험 요약 */}
                {clause.summary ? (
                  <View style={styles.clauseSection}>
                    <Text style={styles.clauseSectionLabel}>분석 요약</Text>
                    <Text style={styles.clauseSectionText}>{clause.summary}</Text>
                  </View>
                ) : null}

                {/* 수정 제안 */}
                {clause.suggestion ? (
                  <View style={[styles.clauseSection, styles.suggestionSection]}>
                    <Text style={styles.clauseSectionLabel}>수정 제안</Text>
                    <Text style={styles.clauseSectionText}>{clause.suggestion}</Text>
                  </View>
                ) : null}
              </View>
            );
          })}

          {clauses.length === 0 && (
            <View style={styles.emptyWrap}>
              <MaterialIcons name="search-off" size={48} color={Colors.stone300} />
              <Text style={styles.emptyText}>분석된 조항이 없습니다</Text>
            </View>
          )}

          {/* 홈으로 돌아가기 */}
          <TouchableOpacity
            style={styles.homeButton}
            activeOpacity={0.85}
            onPress={() => navigation.popToTop()}
          >
            <MaterialIcons name="home" size={20} color={Colors.white} />
            <Text style={styles.homeButtonText}>홈으로 돌아가기</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
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

  // Loading
  loadingWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: FontSize.sm,
    color: Colors.stone500,
  },
  errorText: {
    fontSize: FontSize.md,
    color: Colors.red500,
    fontWeight: '600',
  },
  retryButton: {
    marginTop: 8,
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: Colors.primaryDark,
    borderRadius: 10,
  },
  retryText: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.white,
  },

  // Scroll
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  // Filename
  filenameCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.stone100,
    marginBottom: 16,
  },
  filenameText: {
    flex: 1,
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.stone900,
  },

  // Summary
  summaryRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  summaryCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 4,
  },
  summaryCount: {
    fontSize: FontSize['2xl'],
    fontWeight: '800',
  },
  summaryLabel: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Colors.stone500,
  },

  // Section title
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.stone900,
    marginBottom: 14,
  },

  // Clause card
  clauseCard: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.stone100,
  },
  clauseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  clauseTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    marginRight: 8,
  },
  clauseNumber: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.stone900,
  },
  clauseTitle: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.stone600,
    flex: 1,
  },
  riskBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  riskBadgeText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
  clauseSection: {
    marginBottom: 8,
  },
  originalTextSection: {
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: Colors.stone200,
  },
  originalText: {
    fontSize: FontSize.xs,
    color: Colors.stone500,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  suggestionSection: {
    backgroundColor: Colors.stone50,
    borderRadius: 10,
    padding: 12,
    marginBottom: 0,
  },
  clauseSectionLabel: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.stone400,
    marginBottom: 4,
  },
  clauseSectionText: {
    fontSize: FontSize.sm,
    color: Colors.stone800,
    lineHeight: 20,
  },

  // Empty
  emptyWrap: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 8,
  },
  emptyText: {
    fontSize: FontSize.md,
    color: Colors.stone400,
  },

  // Home button
  homeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primaryDark,
    borderRadius: 14,
    paddingVertical: 14,
    marginTop: 12,
  },
  homeButtonText: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.white,
  },
});
