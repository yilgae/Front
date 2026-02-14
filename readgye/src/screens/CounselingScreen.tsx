import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, FontSize } from '../constants/theme';

export default function CounselingScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} activeOpacity={0.8}>
          <MaterialIcons name="chevron-left" size={30} color={Colors.stone600} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI 법률 상담</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.disclaimerWrap}>
        <MaterialIcons name="info-outline" size={16} color="#0f49bd" />
        <Text style={styles.disclaimerText}>
          읽계 AI의 분석 결과는 법적 효력이 없으며, 참고용으로만 활용해 주세요.
          정확한 판단은 변호사와의 상담을 권장합니다.
        </Text>
      </View>

      <ScrollView
        style={styles.chatScroll}
        contentContainerStyle={styles.chatContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.timestampWrap}>
          <Text style={styles.timestamp}>오늘 오후 2:30</Text>
        </View>

        <View style={styles.aiRow}>
          <View style={styles.avatarWrap}>
            <Image
              source={require('../../assets/favicon.png')}
              style={styles.avatar}
              resizeMode="cover"
            />
          </View>
          <View style={styles.aiMessageArea}>
            <Text style={styles.sender}>읽계 AI</Text>
            <View style={styles.aiBubble}>
              <Text style={styles.aiText}>
                안녕하세요. <Text style={styles.primaryStrong}>프리랜서 용역 계약서</Text>를 분석해드릴게요.
              </Text>
              <Text style={[styles.aiText, styles.mt8]}>
                업로드하신 계약서의 <Text style={styles.strong}>제 3조 &apos;지적재산권 귀속&apos;</Text> 조항을
                중점적으로 검토했습니다. 해당 조항의 내용이 궁금하신가요?
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.userRow}>
          <View style={styles.userMessageArea}>
            <View style={styles.userBubble}>
              <Text style={styles.userText}>
                네, 이 조항이 저한테 불리한가요? 혹시 수정해야 할 부분이 있을까요?
              </Text>
            </View>
            <Text style={styles.userTime}>오후 2:32</Text>
          </View>
        </View>

        <View style={styles.aiRow}>
          <View style={styles.avatarWrap}>
            <Image
              source={require('../../assets/favicon.png')}
              style={styles.avatar}
              resizeMode="cover"
            />
          </View>
          <View style={styles.aiMessageArea}>
            <Text style={styles.sender}>읽계 AI</Text>
            <View style={styles.aiBubbleLarge}>
              <Text style={styles.aiText}>
                네, 현재 <Text style={styles.strong}>제 3조</Text>는 프리랜서님께 다소
                <Text style={styles.dangerStrong}> 불리한 조항</Text>으로 보입니다.
              </Text>

              <View style={styles.quoteBox}>
                <Text style={styles.quoteText}>
                  &quot;모든 작업물의 저작권은 용역비 지급과 동시에 발주처에 귀속된다.&quot;
                </Text>
              </View>

              <Text style={styles.aiText}>
                일반적으로 포트폴리오 사용권이나 2차 저작물 작성권은 작업자에게 남겨두는 경우가 많습니다.
                다음과 같이 수정을 제안해 보세요:
              </Text>

              <View style={styles.suggestionBox}>
                <View style={styles.suggestionHeader}>
                  <MaterialIcons name="edit-note" size={16} color="#0f49bd" />
                  <Text style={styles.suggestionTitle}>수정 제안</Text>
                </View>
                <Text style={styles.suggestionText}>
                  &quot;저작권은 양도하되, 작업자는 해당 결과물을 포트폴리오 목적으로 사용할 수 있다.&quot;
                </Text>
              </View>

              <TouchableOpacity style={styles.copyButton} activeOpacity={0.85}>
                <Text style={styles.copyButtonText}>수정안 복사하기</Text>
                <MaterialIcons name="content-copy" size={16} color="#0f49bd" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.inputBar}>
        <TouchableOpacity style={styles.inputIconBtn} activeOpacity={0.8}>
          <MaterialIcons name="add-circle-outline" size={24} color={Colors.stone400} />
        </TouchableOpacity>
        <View style={styles.inputWrap}>
          <TextInput
            placeholder="계약서에 대해 궁금한 점을 물어보세요"
            placeholderTextColor={Colors.stone400}
            style={styles.input}
            multiline
          />
        </View>
        <TouchableOpacity style={styles.sendButton} activeOpacity={0.85}>
          <MaterialIcons name="send" size={20} color={Colors.white} />
        </TouchableOpacity>
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
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.stone900,
  },
  headerSpacer: {
    width: 40,
    height: 40,
  },
  disclaimerWrap: {
    marginHorizontal: 20,
    marginBottom: 8,
    backgroundColor: '#EBF1FF',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    gap: 8,
  },
  disclaimerText: {
    flex: 1,
    fontSize: 12,
    color: Colors.stone500,
    lineHeight: 18,
  },
  chatScroll: {
    flex: 1,
  },
  chatContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 14,
    gap: 16,
  },
  timestampWrap: {
    alignItems: 'center',
  },
  timestamp: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.stone400,
    backgroundColor: Colors.stone100,
    borderRadius: 9999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  aiRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  avatarWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.stone100,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  aiMessageArea: {
    flex: 1,
    gap: 4,
  },
  sender: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.stone500,
    marginLeft: 2,
  },
  aiBubble: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderTopLeftRadius: 4,
    borderWidth: 1,
    borderColor: Colors.stone100,
    padding: 14,
  },
  aiBubbleLarge: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderTopLeftRadius: 4,
    borderWidth: 1,
    borderColor: Colors.stone100,
    padding: 14,
    gap: 10,
  },
  aiText: {
    fontSize: 15,
    color: Colors.stone600,
    lineHeight: 22,
  },
  strong: {
    fontWeight: '700',
    color: Colors.stone900,
  },
  primaryStrong: {
    color: '#0f49bd',
    fontWeight: '700',
  },
  dangerStrong: {
    color: Colors.red500,
    fontWeight: '700',
  },
  mt8: {
    marginTop: 8,
  },
  userRow: {
    alignItems: 'flex-end',
  },
  userMessageArea: {
    maxWidth: '85%',
    alignItems: 'flex-end',
    gap: 4,
  },
  userBubble: {
    backgroundColor: '#FFF8E1',
    borderRadius: 16,
    borderTopRightRadius: 4,
    borderWidth: 1,
    borderColor: '#FDE68A',
    padding: 14,
  },
  userText: {
    fontSize: 15,
    lineHeight: 22,
    color: Colors.stone800,
  },
  userTime: {
    fontSize: 10,
    color: Colors.stone400,
    marginRight: 2,
  },
  quoteBox: {
    borderLeftWidth: 2,
    borderLeftColor: '#8FB0F5',
    paddingLeft: 10,
    paddingVertical: 2,
  },
  quoteText: {
    fontSize: 13,
    color: Colors.stone500,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  suggestionBox: {
    backgroundColor: '#EBF1FF',
    borderRadius: 10,
    padding: 10,
    gap: 6,
  },
  suggestionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  suggestionTitle: {
    color: '#0f49bd',
    fontSize: 11,
    fontWeight: '700',
  },
  suggestionText: {
    color: Colors.stone900,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 20,
  },
  copyButton: {
    marginTop: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#c8d8fb',
    backgroundColor: '#F4F8FF',
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  copyButtonText: {
    color: '#0f49bd',
    fontSize: 13,
    fontWeight: '700',
  },
  inputBar: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.stone100,
    backgroundColor: Colors.backgroundLight,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  inputIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputWrap: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.stone100,
    backgroundColor: Colors.white,
    paddingHorizontal: 14,
    justifyContent: 'center',
  },
  input: {
    fontSize: 14,
    color: Colors.stone900,
    paddingVertical: 10,
    maxHeight: 96,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0f49bd',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 1,
  },
});
