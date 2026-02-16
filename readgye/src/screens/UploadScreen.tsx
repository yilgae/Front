import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  Modal,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { Colors, FontSize, BorderRadius } from '../constants/theme';
import { useAuth, API_BASE_URL } from '../context/AuthContext';

type Props = {
  navigation: any;
};

type PickedFile = {
  uri: string;
  name: string;
  size?: number;
  mimeType?: string;
};

type ContractCategory = {
  key: string;
  label: string;
  description: string;
  endpoint: string;
  icon: keyof typeof MaterialIcons.glyphMap;
};

const CONTRACT_CATEGORIES: ContractCategory[] = [
  {
    key: 'WORK',
    label: '일터 계약',
    description: '근로계약서, 프리랜서 용역 계약서',
    endpoint: '/api/general/work',
    icon: 'work',
  },
  {
    key: 'CONSUMER',
    label: '소비자 계약',
    description: '헬스장, 예식장, 필라테스 등 서비스 계약',
    endpoint: '/api/general/consumer',
    icon: 'shopping-cart',
  },
  {
    key: 'NDA',
    label: '비밀유지서약 계약',
    description: '비밀유지서약서(NDA), 전직금지 약정',
    endpoint: '/api/general/nda',
    icon: 'lock',
  },
  {
    key: 'GENERAL',
    label: '기타 계약',
    description: '동업계약서, 차용증, 각서 등',
    endpoint: '/api/general/other',
    icon: 'description',
  },
];

// 웹/네이티브 모두 동작하는 알림
const showAlert = (title: string, message: string) => {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n\n${message}`);
  } else {
    Alert.alert(title, message);
  }
};

export default function UploadScreen({ navigation }: Props) {
  const { token } = useAuth();
  const [pickedFile, setPickedFile] = useState<PickedFile | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<ContractCategory>(CONTRACT_CATEGORIES[0]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  // PDF 파일 선택
  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setPickedFile({
          uri: asset.uri,
          name: asset.name,
          size: asset.size ?? undefined,
          mimeType: asset.mimeType ?? 'application/pdf',
        });
      }
    } catch (e) {
      console.log('파일 선택 오류:', e);
      Alert.alert('오류', '파일을 선택하는 중 문제가 발생했습니다.');
    }
  };

  // 파일 크기 포맷
  const formatSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // 파일 업로드 & 분석 API 호출
  const uploadAndAnalyze = async () => {
    if (!pickedFile) return;

    setErrorMessage(null);

    if (!token) {
      setErrorMessage('백엔드 로그인이 필요합니다. 설정에서 로그인해주세요.');
      showAlert('로그인 필요', '계약서 분석을 위해 백엔드 로그인이 필요합니다.');
      return;
    }

    setIsUploading(true);
    setUploadProgress('파일 업로드 중...');

    try {
      // FormData 생성
      const formData = new FormData();

      if (Platform.OS === 'web') {
        // 웹: URI에서 Blob으로 변환하여 실제 File 객체로 append
        const response = await fetch(pickedFile.uri);
        const blob = await response.blob();
        const file = new File([blob], pickedFile.name, {
          type: pickedFile.mimeType || 'application/pdf',
        });
        formData.append('file', file);
      } else {
        // 네이티브: RN 스타일 객체로 append
        formData.append('file', {
          uri: pickedFile.uri,
          name: pickedFile.name,
          type: pickedFile.mimeType || 'application/pdf',
        } as any);
      }

      setUploadProgress(`[${selectedCategory.label}] AI가 계약서를 분석하고 있습니다...`);

      // 선택된 카테고리의 엔드포인트로 호출
      const res = await fetch(`${API_BASE_URL}${selectedCategory.endpoint}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.text();
        console.log('업로드 실패:', res.status, errorData);
        throw new Error(`서버 오류 (${res.status})`);
      }

      const data = await res.json();

      setUploadProgress('분석 완료!');

      // 결과 화면으로 이동
      navigation.replace('AnalysisResult', {
        documentId: data.id,
        filename: data.filename,
        riskCount: data.risk_count,
      });
    } catch (e: any) {
      console.log('분석 요청 실패:', e);
      setErrorMessage(e.message || '계약서 분석 중 오류가 발생했습니다.');
      showAlert('분석 실패', e.message || '계약서 분석 중 오류가 발생했습니다.');
    } finally {
      setIsUploading(false);
      setUploadProgress('');
    }
  };

  // 파일 선택 해제
  const clearFile = () => {
    setPickedFile(null);
  };

  // 카테고리 선택 항목 렌더링
  const renderCategoryItem = ({ item }: { item: ContractCategory }) => (
    <TouchableOpacity
      style={[
        styles.categoryItem,
        item.key === selectedCategory.key && styles.categoryItemSelected,
      ]}
      activeOpacity={0.7}
      onPress={() => {
        setSelectedCategory(item);
        setShowCategoryModal(false);
      }}
    >
      <View style={[
        styles.categoryIconWrap,
        item.key === selectedCategory.key && styles.categoryIconWrapSelected,
      ]}>
        <MaterialIcons
          name={item.icon}
          size={22}
          color={item.key === selectedCategory.key ? Colors.white : Colors.primaryDark}
        />
      </View>
      <View style={styles.categoryTextWrap}>
        <Text style={[
          styles.categoryLabel,
          item.key === selectedCategory.key && styles.categoryLabelSelected,
        ]}>
          {item.label}
        </Text>
        <Text style={styles.categoryDesc}>{item.description}</Text>
      </View>
      {item.key === selectedCategory.key && (
        <MaterialIcons name="check-circle" size={22} color={Colors.primaryDark} />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <MaterialIcons name="arrow-back" size={24} color={Colors.stone900} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>계약서 분석</Text>
        <View style={styles.headerRight} />
      </View>

      <View style={styles.content}>
        {/* 업로드 중일 때 */}
        {isUploading ? (
          <View style={styles.uploadingWrap}>
            <View style={styles.uploadingIconWrap}>
              <ActivityIndicator size="large" color={Colors.primaryDark} />
            </View>
            <Text style={styles.uploadingTitle}>분석 진행 중</Text>
            <Text style={styles.uploadingDesc}>{uploadProgress}</Text>
            <Text style={styles.uploadingHint}>
              계약서 분량에 따라 1~2분 정도 소요됩니다
            </Text>
          </View>
        ) : !pickedFile ? (
          /* 파일 미선택 상태 */
          <>
            <TouchableOpacity
              style={styles.dropZone}
              activeOpacity={0.8}
              onPress={pickDocument}
            >
              <View style={styles.dropIconWrap}>
                <MaterialIcons name="cloud-upload" size={48} color={Colors.primaryDark} />
              </View>
              <Text style={styles.dropTitle}>PDF 파일을 선택하세요</Text>
              <Text style={styles.dropDesc}>
                계약서, 협약서, 약관 등{'\n'}PDF 파일을 업로드하면 AI가 분석합니다
              </Text>
              <View style={styles.dropButton}>
                <MaterialIcons name="folder-open" size={18} color={Colors.white} />
                <Text style={styles.dropButtonText}>파일 선택하기</Text>
              </View>
            </TouchableOpacity>

            <View style={styles.infoCard}>
              <MaterialIcons name="info-outline" size={18} color={Colors.primaryDark} />
              <Text style={styles.infoText}>
                PDF 형식만 지원됩니다. 스캔된 이미지 PDF도 분석 가능합니다.
              </Text>
            </View>
          </>
        ) : (
          /* 파일 선택됨 */
          <>
            {/* 에러 메시지 배너 */}
            {errorMessage && (
              <View style={styles.errorBanner}>
                <MaterialIcons name="error-outline" size={18} color={Colors.red600} />
                <Text style={styles.errorBannerText}>{errorMessage}</Text>
              </View>
            )}

            <View style={styles.fileCard}>
              <View style={styles.fileIconWrap}>
                <MaterialIcons name="picture-as-pdf" size={32} color={Colors.red500} />
              </View>
              <View style={styles.fileInfo}>
                <Text style={styles.fileName} numberOfLines={2}>
                  {pickedFile.name}
                </Text>
                {pickedFile.size ? (
                  <Text style={styles.fileSize}>{formatSize(pickedFile.size)}</Text>
                ) : null}
              </View>
              <TouchableOpacity onPress={clearFile} style={styles.clearButton}>
                <MaterialIcons name="close" size={20} color={Colors.stone400} />
              </TouchableOpacity>
            </View>

            {/* 카테고리 선택 드롭다운 */}
            <Text style={styles.sectionLabel}>계약서 분류</Text>
            <TouchableOpacity
              style={styles.categorySelector}
              activeOpacity={0.7}
              onPress={() => setShowCategoryModal(true)}
            >
              <View style={styles.categorySelectorLeft}>
                <View style={styles.categorySelectorIconWrap}>
                  <MaterialIcons name={selectedCategory.icon} size={20} color={Colors.primaryDark} />
                </View>
                <View>
                  <Text style={styles.categorySelectorLabel}>{selectedCategory.label}</Text>
                  <Text style={styles.categorySelectorDesc}>{selectedCategory.description}</Text>
                </View>
              </View>
              <MaterialIcons name="keyboard-arrow-down" size={24} color={Colors.stone400} />
            </TouchableOpacity>

            {/* 카테고리 선택 모달 */}
            <Modal
              visible={showCategoryModal}
              transparent
              animationType="fade"
              onRequestClose={() => setShowCategoryModal(false)}
            >
              <TouchableOpacity
                style={styles.modalOverlay}
                activeOpacity={1}
                onPress={() => setShowCategoryModal(false)}
              >
                <View style={styles.modalContent}>
                  <View style={styles.modalHandle} />
                  <Text style={styles.modalTitle}>계약서 분류 선택</Text>
                  <Text style={styles.modalSubtitle}>
                    분류에 맞게 선택하면 더 정확한 분석 결과를 받을 수 있어요
                  </Text>
                  <FlatList
                    data={CONTRACT_CATEGORIES}
                    keyExtractor={(item) => item.key}
                    renderItem={renderCategoryItem}
                    scrollEnabled={false}
                  />
                </View>
              </TouchableOpacity>
            </Modal>

            <TouchableOpacity
              style={styles.analyzeButton}
              activeOpacity={0.85}
              onPress={uploadAndAnalyze}
            >
              <MaterialIcons name="auto-awesome" size={22} color={Colors.white} />
              <Text style={styles.analyzeButtonText}>AI 분석 시작하기</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.changeButton}
              activeOpacity={0.7}
              onPress={pickDocument}
            >
              <Text style={styles.changeButtonText}>다른 파일 선택</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },

  // 파일 미선택 - Drop Zone
  dropZone: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: Colors.stone100,
    borderStyle: 'dashed',
    paddingVertical: 40,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  dropIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.yellow50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  dropTitle: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.stone900,
    marginBottom: 8,
  },
  dropDesc: {
    fontSize: FontSize.sm,
    color: Colors.stone500,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  dropButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.primaryDark,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  dropButtonText: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.white,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
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
    color: Colors.primaryDark,
    fontWeight: '500',
  },

  // 에러 배너
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.red50,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.red100,
    marginBottom: 12,
  },
  errorBannerText: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.red600,
    fontWeight: '600',
  },

  // 파일 선택됨
  fileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.stone100,
    marginBottom: 16,
    gap: 14,
  },
  fileIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: Colors.red50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.stone900,
    marginBottom: 4,
  },
  fileSize: {
    fontSize: FontSize.sm,
    color: Colors.stone500,
  },
  clearButton: {
    padding: 8,
  },

  // 카테고리 섹션
  sectionLabel: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.stone600,
    marginBottom: 8,
    marginLeft: 4,
  },
  categorySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.stone100,
    marginBottom: 20,
  },
  categorySelectorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  categorySelectorIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: Colors.yellow50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categorySelectorLabel: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.stone900,
  },
  categorySelectorDesc: {
    fontSize: FontSize.xs,
    color: Colors.stone400,
    marginTop: 2,
  },

  // 카테고리 모달
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 12,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.stone300,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.stone900,
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: FontSize.sm,
    color: Colors.stone500,
    marginBottom: 20,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    marginBottom: 8,
    backgroundColor: Colors.stone50,
    gap: 12,
  },
  categoryItemSelected: {
    backgroundColor: Colors.yellow50,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  categoryIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryIconWrapSelected: {
    backgroundColor: Colors.primaryDark,
  },
  categoryTextWrap: {
    flex: 1,
  },
  categoryLabel: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.stone900,
  },
  categoryLabelSelected: {
    color: Colors.primaryDark,
  },
  categoryDesc: {
    fontSize: FontSize.xs,
    color: Colors.stone500,
    marginTop: 2,
  },

  // 분석 버튼
  analyzeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: Colors.primaryDark,
    borderRadius: 16,
    paddingVertical: 16,
    marginBottom: 12,
  },
  analyzeButtonText: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.white,
  },
  changeButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  changeButtonText: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.stone500,
  },

  // 업로드 중
  uploadingWrap: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  uploadingIconWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.yellow50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  uploadingTitle: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.stone900,
    marginBottom: 8,
  },
  uploadingDesc: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.primaryDark,
    marginBottom: 8,
  },
  uploadingHint: {
    fontSize: FontSize.sm,
    color: Colors.stone400,
  },
});
