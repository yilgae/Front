import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, FontSize } from '../constants/theme';
import { API_BASE_URL, useAuth } from '../context/AuthContext';

type Props = {
  navigation: any;
};

type ToggleRowProps = {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  subtitle?: string;
  value: boolean;
  onToggle: (v: boolean) => void;
  showDivider?: boolean;
};

function ToggleRow({ icon, label, subtitle, value, onToggle, showDivider }: ToggleRowProps) {
  return (
    <>
      <View style={styles.row}>
        <View style={styles.rowLeft}>
          <MaterialIcons name={icon} size={22} color={Colors.primaryDark} />
          <View style={styles.rowTextWrap}>
            <Text style={styles.rowLabel}>{label}</Text>
            {subtitle ? <Text style={styles.rowSubtitle}>{subtitle}</Text> : null}
          </View>
        </View>
        <Switch
          value={value}
          onValueChange={onToggle}
          trackColor={{ false: Colors.stone300, true: Colors.primary }}
          thumbColor={value ? Colors.primaryDark : Colors.stone100}
          ios_backgroundColor={Colors.stone300}
        />
      </View>
      {showDivider && <View style={styles.divider} />}
    </>
  );
}

export default function NotificationSettingsScreen({ navigation }: Props) {
  const { token } = useAuth();
  const [pushEnabled, setPushEnabled] = useState(true);
  const [analysisComplete, setAnalysisComplete] = useState(true);
  const [riskAlert, setRiskAlert] = useState(true);
  const [marketingPush, setMarketingPush] = useState(false);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [emailReport, setEmailReport] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const loadSettings = useCallback(async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/notifications/settings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        return;
      }
      const data = await res.json();
      setPushEnabled(Boolean(data.push_enabled));
      setAnalysisComplete(Boolean(data.analysis_complete));
      setRiskAlert(Boolean(data.risk_alert));
      setMarketingPush(Boolean(data.marketing_push));
      setEmailEnabled(Boolean(data.email_enabled));
      setEmailReport(Boolean(data.email_report));
    } catch {
      // noop
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const saveSettings = useCallback(
    async (next: {
      pushEnabled: boolean;
      analysisComplete: boolean;
      riskAlert: boolean;
      marketingPush: boolean;
      emailEnabled: boolean;
      emailReport: boolean;
    }) => {
      if (!token) {
        return;
      }
      setIsSaving(true);
      try {
        const res = await fetch(`${API_BASE_URL}/api/notifications/settings`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            push_enabled: next.pushEnabled,
            analysis_complete: next.analysisComplete,
            risk_alert: next.riskAlert,
            marketing_push: next.marketingPush,
            email_enabled: next.emailEnabled,
            email_report: next.emailReport,
          }),
        });

        if (!res.ok) {
          throw new Error('알림 설정 저장에 실패했습니다.');
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : '알림 설정 저장에 실패했습니다.';
        if (Platform.OS === 'web') {
          window.alert(msg);
        } else {
          Alert.alert('오류', msg);
        }
      } finally {
        setIsSaving(false);
      }
    },
    [token]
  );

  const updateSetting = (
    key:
      | 'pushEnabled'
      | 'analysisComplete'
      | 'riskAlert'
      | 'marketingPush'
      | 'emailEnabled'
      | 'emailReport',
    value: boolean
  ) => {
    const next = {
      pushEnabled,
      analysisComplete,
      riskAlert,
      marketingPush,
      emailEnabled,
      emailReport,
      [key]: value,
    };

    setPushEnabled(next.pushEnabled);
    setAnalysisComplete(next.analysisComplete);
    setRiskAlert(next.riskAlert);
    setMarketingPush(next.marketingPush);
    setEmailEnabled(next.emailEnabled);
    setEmailReport(next.emailReport);

    void saveSettings(next);
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
        <Text style={styles.headerTitle}>알림 설정</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="small" color={Colors.primaryDark} />
            <Text style={styles.loadingText}>설정을 불러오는 중...</Text>
          </View>
        ) : null}

        {isSaving ? (
          <View style={styles.savingBanner}>
            <Text style={styles.savingText}>설정 저장 중...</Text>
          </View>
        ) : null}

        {/* 푸시 알림 섹션 */}
        <Text style={styles.sectionTitle}>푸시 알림</Text>
        <View style={styles.groupCard}>
          <ToggleRow
            icon="notifications-active"
            label="푸시 알림"
            subtitle="앱 알림을 받습니다"
            value={pushEnabled}
            onToggle={(v) => updateSetting('pushEnabled', v)}
            showDivider
          />
          <ToggleRow
            icon="check-circle-outline"
            label="분석 완료 알림"
            subtitle="계약서 분석이 완료되면 알림"
            value={analysisComplete}
            onToggle={(v) => updateSetting('analysisComplete', v)}
            showDivider
          />
          <ToggleRow
            icon="warning-amber"
            label="위험 조항 알림"
            subtitle="위험 조항 발견 시 즉시 알림"
            value={riskAlert}
            onToggle={(v) => updateSetting('riskAlert', v)}
            showDivider
          />
          <ToggleRow
            icon="campaign"
            label="마케팅 알림"
            subtitle="이벤트, 혜택 등 마케팅 정보"
            value={marketingPush}
            onToggle={(v) => updateSetting('marketingPush', v)}
          />
        </View>

        {/* 이메일 알림 섹션 */}
        <Text style={styles.sectionTitle}>이메일 알림</Text>
        <View style={styles.groupCard}>
          <ToggleRow
            icon="mail-outline"
            label="이메일 알림"
            subtitle="중요 알림을 이메일로 받습니다"
            value={emailEnabled}
            onToggle={(v) => updateSetting('emailEnabled', v)}
            showDivider
          />
          <ToggleRow
            icon="summarize"
            label="주간 리포트"
            subtitle="매주 분석 요약 리포트를 이메일로 수신"
            value={emailReport}
            onToggle={(v) => updateSetting('emailReport', v)}
          />
        </View>

        <View style={styles.tipCard}>
          <MaterialIcons name="lightbulb-outline" size={18} color={Colors.primaryDark} />
          <Text style={styles.tipText}>
            알림 설정은 기기에 저장되며, 기기 설정에서 앱 알림이 꺼져 있으면 푸시 알림이 전달되지 않을 수 있습니다.
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
  loadingWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  loadingText: {
    fontSize: FontSize.sm,
    color: Colors.stone500,
  },
  savingBanner: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.yellow50,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.yellow100,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 10,
  },
  savingText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Colors.primaryDark,
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
    marginBottom: 20,
  },
  row: {
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    marginRight: 12,
  },
  rowTextWrap: {
    flex: 1,
  },
  rowLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.stone900,
  },
  rowSubtitle: {
    marginTop: 2,
    fontSize: FontSize.xs,
    color: Colors.stone500,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.stone100,
    marginLeft: 48,
  },
  tipCard: {
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
  tipText: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.stone600,
    lineHeight: 18,
  },
});
