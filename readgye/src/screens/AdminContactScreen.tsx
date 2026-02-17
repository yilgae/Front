import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Colors, FontSize } from '../constants/theme';
import { API_BASE_URL, useAuth } from '../context/AuthContext';

type Props = { navigation: any };

type Inquiry = {
  id: string;
  user_name: string;
  user_email: string;
  category: string;
  category_label: string;
  title: string;
  content: string;
  status: string;
  created_at: string;
};

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: '대기', color: '#B45309', bg: '#FEF3C7' },
  replied: { label: '답변완료', color: '#047857', bg: '#D1FAE5' },
  closed: { label: '종료', color: '#6B7280', bg: '#F3F4F6' },
};

const CATEGORY_MAP: Record<string, string> = {
  service: '서비스 이용',
  account: '계정 문제',
  payment: '결제/환불',
  bug: '오류 신고',
  etc: '제안/기타',
};

function formatDate(iso: string): string {
  const d = new Date(iso.endsWith('Z') ? iso : `${iso}Z`);
  if (isNaN(d.getTime())) return '';
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export default function AdminContactScreen({ navigation }: Props) {
  const { token } = useAuth();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchInquiries = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const url = filter
        ? `${API_BASE_URL}/api/contact/admin?status=${filter}`
        : `${API_BASE_URL}/api/contact/admin`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setInquiries(data);
    } catch {
      setInquiries([]);
    } finally {
      setLoading(false);
    }
  }, [token, filter]);

  useFocusEffect(
    useCallback(() => {
      fetchInquiries();
    }, [fetchInquiries]),
  );

  const updateStatus = async (id: string, status: string) => {
    if (!token) return;
    await fetch(`${API_BASE_URL}/api/contact/admin/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });
    fetchInquiries();
  };

  const filters = [
    { key: null, label: '전체' },
    { key: 'pending', label: '대기' },
    { key: 'replied', label: '답변완료' },
    { key: 'closed', label: '종료' },
  ];

  const renderItem = ({ item }: { item: Inquiry }) => {
    const s = STATUS_MAP[item.status] || STATUS_MAP.pending;
    const expanded = expandedId === item.id;

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.7}
        onPress={() => setExpandedId(expanded ? null : item.id)}
      >
        <View style={styles.cardTop}>
          <View style={[styles.badge, { backgroundColor: s.bg }]}>
            <Text style={[styles.badgeText, { color: s.color }]}>{s.label}</Text>
          </View>
          <Text style={styles.cardCategory}>
            {CATEGORY_MAP[item.category] || item.category_label}
          </Text>
          <Text style={styles.cardDate}>{formatDate(item.created_at)}</Text>
        </View>
        <Text style={styles.cardTitle} numberOfLines={expanded ? undefined : 1}>
          {item.title}
        </Text>
        <Text style={styles.cardUser}>{item.user_name} ({item.user_email})</Text>

        {expanded && (
          <View style={styles.expandedArea}>
            <Text style={styles.cardContent}>{item.content}</Text>
            <View style={styles.actionRow}>
              {item.status !== 'replied' && (
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: '#D1FAE5' }]}
                  onPress={() => updateStatus(item.id, 'replied')}
                >
                  <Text style={[styles.actionText, { color: '#047857' }]}>답변완료</Text>
                </TouchableOpacity>
              )}
              {item.status !== 'closed' && (
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: '#F3F4F6' }]}
                  onPress={() => updateStatus(item.id, 'closed')}
                >
                  <Text style={[styles.actionText, { color: '#6B7280' }]}>종료</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.stone900} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>문의 관리</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.filterRow}>
        {filters.map((f) => (
          <TouchableOpacity
            key={String(f.key)}
            style={[styles.filterChip, filter === f.key && styles.filterChipActive]}
            onPress={() => setFilter(f.key)}
          >
            <Text style={[styles.filterText, filter === f.key && styles.filterTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={Colors.primaryDark} />
      ) : inquiries.length === 0 ? (
        <View style={styles.emptyWrap}>
          <MaterialIcons name="inbox" size={48} color={Colors.stone300} />
          <Text style={styles.emptyText}>문의가 없습니다</Text>
        </View>
      ) : (
        <FlatList
          data={inquiries}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={fetchInquiries} />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.backgroundLight },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 8,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.stone900 },
  filterRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 8 },
  filterChip: {
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20,
    backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.stone200,
  },
  filterChipActive: { backgroundColor: Colors.primaryDark, borderColor: Colors.primaryDark },
  filterText: { fontSize: 13, fontWeight: '600', color: Colors.stone500 },
  filterTextActive: { color: Colors.white },
  list: { paddingHorizontal: 16, paddingBottom: 20 },
  card: {
    backgroundColor: Colors.white, borderRadius: 14, padding: 14,
    marginBottom: 10, borderWidth: 1, borderColor: Colors.stone100,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  cardCategory: { fontSize: 12, color: Colors.stone400 },
  cardDate: { fontSize: 11, color: Colors.stone400, marginLeft: 'auto' },
  cardTitle: { fontSize: 15, fontWeight: '600', color: Colors.stone800, marginBottom: 4 },
  cardUser: { fontSize: 12, color: Colors.stone400 },
  expandedArea: { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: Colors.stone100 },
  cardContent: { fontSize: 14, color: Colors.stone600, lineHeight: 20, marginBottom: 10 },
  actionRow: { flexDirection: 'row', gap: 8 },
  actionBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8 },
  actionText: { fontSize: 13, fontWeight: '600' },
  emptyWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  emptyText: { fontSize: 14, color: Colors.stone400 },
});
