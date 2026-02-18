import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { API_BASE_URL, useAuth } from '../context/AuthContext';
import { BorderRadius, Colors, FontSize } from '../constants/theme';

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  document_id?: string | null;
};

function formatNotificationTime(createdAt: string) {
  const d = new Date(createdAt);
  if (Number.isNaN(d.getTime())) {
    return '-';
  }
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const hour = d.getHours().toString().padStart(2, '0');
  const minute = d.getMinutes().toString().padStart(2, '0');
  return `${month}월 ${day}일 ${hour}:${minute}`;
}

export default function NotificationListScreen() {
  const navigation = useNavigation<any>();
  const { token } = useAuth();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadNotifications = useCallback(async (withSpinner = false) => {
    if (!token) {
      setItems([]);
      setIsLoading(false);
      return;
    }

    if (withSpinner) {
      setIsLoading(true);
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        setItems([]);
        return;
      }
      const data: NotificationItem[] = await res.json();
      setItems(data);
    } catch {
      setItems([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [token]);

  const markOneAsRead = useCallback(
    async (notificationId: string) => {
      if (!token) {
        return;
      }
      await fetch(`${API_BASE_URL}/api/notifications/${notificationId}/read`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    [token]
  );

  const markAllAsRead = useCallback(async () => {
    if (!token) {
      return;
    }
    try {
      await fetch(`${API_BASE_URL}/api/notifications/read-all`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      setItems((prev) => prev.map((item) => ({ ...item, is_read: true })));
    } catch {
      // noop
    }
  }, [token]);

  const onPressItem = useCallback(
    async (item: NotificationItem) => {
      if (!item.is_read) {
        await markOneAsRead(item.id);
        setItems((prev) =>
          prev.map((x) => (x.id === item.id ? { ...x, is_read: true } : x))
        );
      }

      if (item.document_id) {
        navigation.navigate('Archive', {
          screen: 'ArchiveDetail',
          params: { documentId: item.document_id, title: '분석 결과' },
          initial: false,
        });
      }
    },
    [markOneAsRead, navigation]
  );

  useEffect(() => {
    loadNotifications(true);
  }, [loadNotifications]);

  useFocusEffect(
    useCallback(() => {
      loadNotifications(false);
    }, [loadNotifications])
  );

  const unreadCount = useMemo(
    () => items.filter((item) => !item.is_read).length,
    [items]
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <MaterialIcons name="arrow-back" size={24} color={Colors.stone800} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>알림</Text>
        <TouchableOpacity
          style={styles.readAllButton}
          onPress={markAllAsRead}
          disabled={unreadCount === 0}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.readAllText,
              unreadCount === 0 ? styles.readAllDisabled : null,
            ]}
          >
            모두 읽음
          </Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="small" color={Colors.primaryDark} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => {
                setIsRefreshing(true);
                loadNotifications(false);
              }}
              tintColor={Colors.primaryDark}
            />
          }
        >
          {items.length === 0 ? (
            <View style={styles.emptyWrap}>
              <MaterialIcons
                name="notifications-none"
                size={30}
                color={Colors.stone400}
              />
              <Text style={styles.emptyText}>표시할 알림이 없습니다.</Text>
            </View>
          ) : (
            items.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.itemCard,
                  !item.is_read ? styles.itemUnread : null,
                ]}
                activeOpacity={0.85}
                onPress={() => onPressItem(item)}
              >
                <View style={styles.itemHeader}>
                  <Text style={styles.itemTitle}>{item.title}</Text>
                  {!item.is_read ? <View style={styles.unreadDot} /> : null}
                </View>
                <Text style={styles.itemMessage}>{item.message}</Text>
                <Text style={styles.itemDate}>
                  {formatNotificationTime(item.created_at)}
                </Text>
              </TouchableOpacity>
            ))
          )}
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
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.stone900,
  },
  readAllButton: {
    minWidth: 72,
    alignItems: 'flex-end',
  },
  readAllText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.primaryDark,
  },
  readAllDisabled: {
    color: Colors.stone400,
  },
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 10,
  },
  emptyWrap: {
    marginTop: 80,
    alignItems: 'center',
    gap: 10,
  },
  emptyText: {
    fontSize: FontSize.sm,
    color: Colors.stone500,
  },
  itemCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.stone100,
    padding: 14,
  },
  itemUnread: {
    borderColor: Colors.yellow100,
    backgroundColor: Colors.secondary,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  itemTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.stone900,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.red500,
  },
  itemMessage: {
    fontSize: FontSize.sm,
    color: Colors.stone600,
    lineHeight: 18,
  },
  itemDate: {
    marginTop: 8,
    fontSize: FontSize.xs,
    color: Colors.stone400,
  },
});
