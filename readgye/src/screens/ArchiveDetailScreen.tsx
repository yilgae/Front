import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';

import { Colors, FontSize } from '../constants/theme';
import { API_BASE_URL, useAuth } from '../context/AuthContext';

type ArchiveStackParamList = {
  ArchiveMain: undefined;
  ArchiveDetail: { documentId: string; title: string };
};

type AnalysisItem = {
  clause_number: string;
  title: string;
  risk_level: 'HIGH' | 'MEDIUM' | 'LOW' | 'UNKNOWN';
  summary: string;
  suggestion: string;
};

type AnalysisResult = {
  filename: string;
  analysis: AnalysisItem[];
};

type LegacyPayload = {
  clauses?: Array<{
    clause_number?: string;
    article_number?: string;
    title?: string;
    risk_level?: string;
    summary?: string;
    analysis?: string;
    suggestion?: string;
    original_text?: string;
  }>;
};

function normalizeRiskLevel(level?: string): AnalysisItem['risk_level'] {
  if (level === 'HIGH' || level === 'MEDIUM' || level === 'LOW') {
    return level;
  }
  return 'UNKNOWN';
}

function toText(value: unknown) {
  return typeof value === 'string' ? value : '';
}

function parseLegacyPayload(rawText: string): LegacyPayload | null {
  const text = rawText.trim();
  if (!text || !text.startsWith('{')) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    // 과거 저장 데이터 중 Python dict 문자열 형태를 최대한 복원한다.
    const normalized = text
      .replace(/\bTrue\b/g, 'true')
      .replace(/\bFalse\b/g, 'false')
      .replace(/\bNone\b/g, 'null')
      .replace(/'/g, '"');

    try {
      return JSON.parse(normalized);
    } catch {
      return null;
    }
  }
}

function mapLegacyClauses(payload: LegacyPayload): AnalysisItem[] {
  if (!Array.isArray(payload.clauses)) {
    return [];
  }

  return payload.clauses.map((clause, index) => ({
    clause_number: toText(clause.clause_number || clause.article_number) || `조항 ${index + 1}`,
    title: toText(clause.title) || '제목 없음',
    risk_level: normalizeRiskLevel(clause.risk_level),
    summary: toText(clause.summary || clause.analysis || clause.original_text),
    suggestion: toText(clause.suggestion),
  }));
}

function normalizeAnalysis(items: AnalysisItem[]): AnalysisItem[] {
  const normalized: AnalysisItem[] = [];

  for (const item of items) {
    const legacyFromSummary = parseLegacyPayload(item.summary);
    if (legacyFromSummary) {
      const parsed = mapLegacyClauses(legacyFromSummary);
      if (parsed.length > 0) {
        normalized.push(...parsed);
        continue;
      }
    }

    const legacyFromSuggestion = parseLegacyPayload(item.suggestion);
    if (legacyFromSuggestion) {
      const parsed = mapLegacyClauses(legacyFromSuggestion);
      if (parsed.length > 0) {
        normalized.push(...parsed);
        continue;
      }
    }

    normalized.push({
      ...item,
      risk_level: normalizeRiskLevel(item.risk_level),
    });
  }

  return normalized;
}

function riskLabel(level: AnalysisItem['risk_level']) {
  if (level === 'HIGH') return '높음';
  if (level === 'MEDIUM') return '중간';
  if (level === 'LOW') return '낮음';
  return '미분류';
}

function riskBadgeStyle(level: AnalysisItem['risk_level']) {
  if (level === 'HIGH') return styles.badgeHigh;
  if (level === 'MEDIUM') return styles.badgeMedium;
  if (level === 'LOW') return styles.badgeLow;
  return styles.badgeUnknown;
}

export default function ArchiveDetailScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ArchiveStackParamList, 'ArchiveDetail'>>();
  const route = useRoute<RouteProp<ArchiveStackParamList, 'ArchiveDetail'>>();
  const { token } = useAuth();

  const [data, setData] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDetail = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/analyze/${route.params.documentId}/result`, {
        headers: token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : undefined,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.detail || '상세 결과를 불러오지 못했습니다.');
      }

      const json = (await res.json()) as AnalysisResult;
      setData({
        ...json,
        analysis: normalizeAnalysis(json.analysis || []),
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : '상세 결과를 불러오지 못했습니다.');
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [route.params.documentId, token]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <MaterialIcons name="chevron-left" size={26} color={Colors.stone900} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {route.params.title}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <View style={styles.centerWrap}>
            <ActivityIndicator color={Colors.primaryDark} />
            <Text style={styles.centerText}>상세 결과를 불러오는 중입니다.</Text>
          </View>
        ) : error ? (
          <View style={styles.centerWrap}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : data && data.analysis.length > 0 ? (
          <View style={styles.list}>
            {data.analysis.map((item, idx) => (
              <View key={`${item.clause_number}-${idx}`} style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>
                    {item.clause_number} {item.title}
                  </Text>
                  <View style={[styles.badge, riskBadgeStyle(item.risk_level)]}>
                    <Text style={styles.badgeText}>{riskLabel(item.risk_level)}</Text>
                  </View>
                </View>
                <Text style={styles.sectionLabel}>요약</Text>
                <Text style={styles.sectionText}>{item.summary || '-'}</Text>
                <Text style={styles.sectionLabel}>수정 제안</Text>
                <Text style={styles.sectionText}>{item.suggestion || '-'}</Text>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.centerWrap}>
            <Text style={styles.centerText}>분석 상세 결과가 없습니다.</Text>
          </View>
        )}
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
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.stone900,
    marginHorizontal: 8,
  },
  headerSpacer: {
    width: 36,
    height: 36,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  list: {
    gap: 12,
  },
  card: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.stone100,
    borderRadius: 12,
    padding: 14,
    gap: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  cardTitle: {
    flex: 1,
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.stone900,
    lineHeight: 20,
  },
  badge: {
    borderRadius: 9999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeHigh: {
    backgroundColor: Colors.red500,
  },
  badgeMedium: {
    backgroundColor: Colors.primaryDark,
  },
  badgeLow: {
    backgroundColor: Colors.green500,
  },
  badgeUnknown: {
    backgroundColor: Colors.stone400,
  },
  badgeText: {
    color: Colors.white,
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
  sectionLabel: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.stone600,
    marginTop: 2,
  },
  sectionText: {
    fontSize: FontSize.sm,
    color: Colors.stone900,
    lineHeight: 20,
  },
  centerWrap: {
    paddingVertical: 48,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  centerText: {
    fontSize: FontSize.sm,
    color: Colors.stone500,
  },
  errorText: {
    fontSize: FontSize.sm,
    color: Colors.red500,
    textAlign: 'center',
  },
});
