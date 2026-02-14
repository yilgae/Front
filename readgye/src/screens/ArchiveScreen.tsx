import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, FontSize } from '../constants/theme';

type DocumentStatus = 'safe' | 'danger' | 'review';
type FilterKey = 'all' | 'done' | 'review';

type DocumentItem = {
  id: string;
  title: string;
  date: string;
  status: DocumentStatus;
};

const DOCUMENTS: DocumentItem[] = [
  {
    id: '1',
    title: '프리랜서 용역 계약서 (2023.11.01)',
    date: '2023.11.01',
    status: 'safe',
  },
  {
    id: '2',
    title: '임대차 계약서 (2023.10.15)',
    date: '2023.10.15',
    status: 'danger',
  },
  {
    id: '3',
    title: '비밀유지 계약서 (2023.10.01)',
    date: '2023.10.01',
    status: 'safe',
  },
  {
    id: '4',
    title: '물품 공급 계약서 (2023.09.20)',
    date: '2023.09.20',
    status: 'review',
  },
];

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
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<FilterKey>('all');

  const filteredDocuments = useMemo(() => {
    const searched = DOCUMENTS.filter((doc) =>
      doc.title.toLowerCase().includes(query.trim().toLowerCase())
    );

    if (filter === 'done') {
      return searched.filter((doc) => doc.status === 'safe');
    }

    if (filter === 'review') {
      return searched.filter((doc) => doc.status === 'review' || doc.status === 'danger');
    }

    return searched;
  }, [filter, query]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} activeOpacity={0.8}>
          <MaterialIcons name="search" size={24} color={Colors.primaryDark} />
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
            <Text style={[styles.filterText, filter === 'done' && styles.filterTextActive]}>
              분석 완료
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterTab, styles.filterTabDivider, filter === 'review' && styles.filterTabActive]}
            activeOpacity={0.8}
            onPress={() => setFilter('review')}
          >
            <Text style={[styles.filterText, filter === 'review' && styles.filterTextActive]}>
              검토 필요
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.list}>
          {filteredDocuments.map((doc) => (
            <View key={doc.id} style={styles.card}>
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
                  <TouchableOpacity style={styles.actionButton} activeOpacity={0.75}>
                    <MaterialIcons name="share" size={18} color={Colors.primaryDark} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionButton} activeOpacity={0.75}>
                    <MaterialIcons name="delete-outline" size={18} color={Colors.primaryDark} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
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
  },
  actionButton: {
    padding: 4,
  },
});

