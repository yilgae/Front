import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Colors, FontSize } from '../constants/theme';
import { API_BASE_URL, useAuth } from '../context/AuthContext';

type DocumentStatus = 'safe' | 'danger' | 'review';
type FilterKey = 'all' | 'done' | 'review';

type ArchiveStackParamList = {
  ArchiveMain: undefined;
  ArchiveDetail: { documentId: string; title: string };
};

type ApiDocument = {
  id: string;
  filename: string;
  status: string;
  created_at: string;
  risk_count: number;
};

type ArchiveItem = {
  id: string;
  title: string;
  date: string;
  status: DocumentStatus;
  riskCount: number;
};

function formatDate(dateString: string) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return '-';
  }
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(
    date.getDate()
  ).padStart(2, '0')}`;
}

function mapStatus(item: ApiDocument): DocumentStatus {
  if (item.status !== 'done') {
    return 'review';
  }
  if (item.risk_count > 0) {
    return 'danger';
  }
  return 'safe';
}

function StatusBadge({ status }: { status: DocumentStatus }) {
  if (status === 'safe') {
    return (
      <View style={[styles.badge, styles.badgeSafe]}>
        <Text style={styles.badgeText}>안전</Text>
      </View>
    );
  }

  if (status === 'danger') {
    return (
      <View style={[styles.badge, styles.badgeDanger]}>
        <Text style={styles.badgeText}>위험</Text>
      </View>
    );
  }

  return (
    <View style={[styles.badge, styles.badgeReview]}>
      <Text style={styles.badgeText}>검토 필요</Text>
    </View>
  );
}

export default function ArchiveScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ArchiveStackParamList, 'ArchiveMain'>>();
  const { token } = useAuth();
  const isFocused = useIsFocused();

  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<FilterKey>('all');
  const [documents, setDocuments] = useState<ArchiveItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDocuments = useCallback(async () => {
    if (!token) {
      setDocuments([]);
      setError('로그인 후 보관함을 확인할 수 있습니다.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/analyze`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.detail || '보관함 데이터를 불러오지 못했습니다.');
      }

      const data: ApiDocument[] = await res.json();
      const mapped: ArchiveItem[] = data.map((item) => ({
        id: item.id,
        title: item.filename,
        date: formatDate(item.created_at),
        status: mapStatus(item),
        riskCount: item.risk_count,
      }));
      setDocuments(mapped);
    } catch (e) {
      const message = e instanceof Error ? e.message : '보관함 데이터를 불러오지 못했습니다.';
      setError(message);
      setDocuments([]);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  const handleDelete = useCallback(
    (docId: string, docTitle: string) => {
      const doDelete = async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/api/analyze/${docId}`, {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (!res.ok) {
            const err = await res.json().catch(() => null);
            throw new Error(err?.detail || '문서를 삭제하지 못했습니다.');
          }

          setDocuments((prev) => prev.filter((doc) => doc.id !== docId));
        } catch (e) {
          const message = e instanceof Error ? e.message : '문서를 삭제하지 못했습니다.';
          if (Platform.OS === 'web') {
            window.alert(`삭제 실패\n\n${message}`);
          } else {
            Alert.alert('삭제 실패', message);
          }
        }
      };

      if (Platform.OS === 'web') {
        if (window.confirm(`"${docTitle}" 문서를 삭제하시겠습니까?\n\n삭제된 문서는 복구할 수 없습니다.`)) {
          doDelete();
        }
      } else {
        Alert.alert(
          '문서 삭제',
          `"${docTitle}" 문서를 삭제하시겠습니까?\n삭제된 문서는 복구할 수 없습니다.`,
          [
            { text: '취소', style: 'cancel' },
            { text: '삭제', style: 'destructive', onPress: doDelete },
          ],
        );
      }
    },
    [token],
  );

  useEffect(() => {
    if (isFocused) {
      fetchDocuments();
    }
  }, [fetchDocuments, isFocused]);

  const filteredDocuments = useMemo(() => {
    const searched = documents.filter((doc) =>
      doc.title.toLowerCase().includes(query.trim().toLowerCase())
    );

    if (filter === 'done') {
      return searched.filter((doc) => doc.status === 'safe');
    }

    if (filter === 'review') {
      return searched.filter((doc) => doc.status === 'review' || doc.status === 'danger');
    }

    return searched;
  }, [documents, filter, query]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} activeOpacity={0.8} onPress={fetchDocuments}>
          <MaterialIcons name="refresh" size={24} color={Colors.primaryDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>내 법률 보관함</Text>
        <TouchableOpacity style={styles.iconButton} activeOpacity={0.8}>
          <MaterialIcons name="filter-list" size={24} color={Colors.primaryDark} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={fetchDocuments} />}
      >
        <View style={styles.searchWrap}>
          <MaterialIcons name="search" size={20} color={Colors.stone400} style={styles.searchIcon} />
          <TextInput
            placeholder="계약서 검색"
            placeholderTextColor={Colors.stone400}
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
          />
        </View>

        <View style={styles.filterTabs}>
          <TouchableOpacity
            style={[styles.filterTab, filter === 'all' && styles.filterTabActive]}
            activeOpacity={0.8}
            onPress={() => setFilter('all')}
          >
            <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>전체</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterTab, styles.filterTabDivider, filter === 'done' && styles.filterTabActive]}
            activeOpacity={0.8}
            onPress={() => setFilter('done')}
          >
            <Text style={[styles.filterText, filter === 'done' && styles.filterTextActive]}>안전한 계약서</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterTab, styles.filterTabDivider, filter === 'review' && styles.filterTabActive]}
            activeOpacity={0.8}
            onPress={() => setFilter('review')}
          >
            <Text style={[styles.filterText, filter === 'review' && styles.filterTextActive]}>검토 필요</Text>
          </TouchableOpacity>
        </View>

        {isLoading && documents.length === 0 ? (
          <View style={styles.emptyWrap}>
            <ActivityIndicator color={Colors.primaryDark} />
            <Text style={styles.emptyText}>보관함을 불러오는 중입니다.</Text>
          </View>
        ) : error ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : filteredDocuments.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyText}>저장된 분석 보고서가 없습니다.</Text>
          </View>
        ) : (
          <View style={styles.list}>
            {filteredDocuments.map((doc) => (
              <TouchableOpacity
                key={doc.id}
                style={styles.card}
                activeOpacity={0.85}
                onPress={() => navigation.navigate('ArchiveDetail', { documentId: doc.id, title: doc.title })}
              >
                <View style={styles.cardTop}>
                  <Text style={styles.cardTitle}>{doc.title}</Text>
                  <StatusBadge status={doc.status} />
                </View>

                <View style={styles.cardBottom}>
                  <View style={styles.dateWrap}>
                    <MaterialIcons name="description" size={14} color={Colors.stone400} />
                    <Text style={styles.dateText}>{doc.date}</Text>
                  </View>

                  <View style={styles.cardActions}>
                    <Text style={styles.riskText}>위험 {doc.riskCount}건</Text>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      activeOpacity={0.7}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      onPress={() => handleDelete(doc.id, doc.title)}
                    >
                      <MaterialIcons name="delete-outline" size={18} color={Colors.red500} />
                    </TouchableOpacity>
                    <MaterialIcons name="chevron-right" size={18} color={Colors.stone400} />
                  </View>
                </View>
              </TouchableOpacity>
            ))}
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
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
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
  searchWrap: {
    marginTop: 2,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 10,
    backgroundColor: Colors.white,
    paddingLeft: 12,
    paddingRight: 8,
    height: 46,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    color: Colors.stone900,
    fontSize: FontSize.sm,
  },
  filterTabs: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 18,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: Colors.backgroundLight,
  },
  filterTabDivider: {
    borderLeftWidth: 1,
    borderLeftColor: Colors.primary,
  },
  filterTabActive: {
    backgroundColor: Colors.primary,
  },
  filterText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.stone900,
  },
  filterTextActive: {
    fontWeight: '700',
  },
  list: {
    gap: 14,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.primary,
    padding: 14,
    shadowColor: Colors.primaryDark,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 0,
    elevation: 3,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 8,
  },
  cardTitle: {
    flex: 1,
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.stone900,
    lineHeight: 20,
  },
  badge: {
    borderRadius: 9999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeSafe: {
    backgroundColor: Colors.green500,
  },
  badgeDanger: {
    backgroundColor: Colors.red500,
  },
  badgeReview: {
    backgroundColor: Colors.primaryDark,
  },
  badgeText: {
    color: Colors.white,
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateText: {
    fontSize: FontSize.xs,
    color: Colors.stone500,
    fontWeight: '600',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  riskText: {
    fontSize: FontSize.xs,
    color: Colors.stone500,
    fontWeight: '700',
  },
  deleteButton: {
    padding: 4,
  },
  emptyWrap: {
    paddingVertical: 32,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyText: {
    fontSize: FontSize.sm,
    color: Colors.stone500,
  },
  errorText: {
    fontSize: FontSize.sm,
    color: Colors.red500,
    textAlign: 'center',
  },
});
