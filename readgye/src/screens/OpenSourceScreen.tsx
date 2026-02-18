import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, FontSize } from '../constants/theme';

type Props = {
  navigation: any;
};

type LibraryItem = {
  name: string;
  version: string;
  license: string;
  url: string;
};

const libraries: LibraryItem[] = [
  {
    name: 'React Native',
    version: '0.76.9',
    license: 'MIT',
    url: 'https://github.com/facebook/react-native',
  },
  {
    name: 'Expo',
    version: '~52.0.46',
    license: 'MIT',
    url: 'https://github.com/expo/expo',
  },
  {
    name: 'React Navigation',
    version: '^7.x',
    license: 'MIT',
    url: 'https://github.com/react-navigation/react-navigation',
  },
  {
    name: '@expo/vector-icons',
    version: '^14.0.4',
    license: 'MIT',
    url: 'https://github.com/expo/vector-icons',
  },
  {
    name: 'expo-auth-session',
    version: '~6.0.3',
    license: 'MIT',
    url: 'https://github.com/expo/expo/tree/main/packages/expo-auth-session',
  },
  {
    name: 'expo-document-picker',
    version: '~13.0.2',
    license: 'MIT',
    url: 'https://github.com/expo/expo/tree/main/packages/expo-document-picker',
  },
  {
    name: '@react-native-async-storage/async-storage',
    version: '2.1.2',
    license: 'MIT',
    url: 'https://github.com/react-native-async-storage/async-storage',
  },
  {
    name: 'react-native-safe-area-context',
    version: '5.4.0',
    license: 'MIT',
    url: 'https://github.com/th3rdwave/react-native-safe-area-context',
  },
  {
    name: 'react-native-screens',
    version: '~4.10.0',
    license: 'MIT',
    url: 'https://github.com/software-mansion/react-native-screens',
  },
  {
    name: 'expo-web-browser',
    version: '~14.0.2',
    license: 'MIT',
    url: 'https://github.com/expo/expo/tree/main/packages/expo-web-browser',
  },
  {
    name: 'expo-crypto',
    version: '~14.0.2',
    license: 'MIT',
    url: 'https://github.com/expo/expo/tree/main/packages/expo-crypto',
  },
];

function LibraryRow({ item, showDivider }: { item: LibraryItem; showDivider: boolean }) {
  return (
    <>
      <TouchableOpacity
        style={styles.libRow}
        activeOpacity={0.7}
        onPress={() => Linking.openURL(item.url)}
      >
        <View style={styles.libTextWrap}>
          <Text style={styles.libName}>{item.name}</Text>
          <Text style={styles.libMeta}>
            {item.version} · {item.license}
          </Text>
        </View>
        <MaterialIcons name="open-in-new" size={18} color={Colors.stone400} />
      </TouchableOpacity>
      {showDivider && <View style={styles.divider} />}
    </>
  );
}

export default function OpenSourceScreen({ navigation }: Props) {
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
        <Text style={styles.headerTitle}>오픈소스 라이선스</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.descCard}>
          <MaterialIcons name="code" size={18} color={Colors.primaryDark} />
          <Text style={styles.descText}>
            똑똑은 아래의 오픈소스 라이브러리를 사용하고 있습니다. 각 라이브러리의 라이선스를 확인하려면 해당 항목을 탭하세요.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>
          사용 중인 라이브러리 ({libraries.length}개)
        </Text>
        <View style={styles.groupCard}>
          {libraries.map((lib, idx) => (
            <LibraryRow
              key={lib.name}
              item={lib}
              showDivider={idx < libraries.length - 1}
            />
          ))}
        </View>

        <View style={styles.footerCard}>
          <Text style={styles.footerText}>
            본 앱에 사용된 모든 오픈소스 소프트웨어는 각각의 라이선스 조건에 따라 사용되고 있습니다.
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
  descCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: Colors.yellow50,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.yellow100,
  },
  descText: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.stone600,
    lineHeight: 18,
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
    marginBottom: 16,
  },
  libRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  libTextWrap: {
    flex: 1,
    marginRight: 8,
  },
  libName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.stone900,
  },
  libMeta: {
    fontSize: FontSize.xs,
    color: Colors.stone500,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.stone100,
    marginLeft: 16,
  },
  footerCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.stone100,
  },
  footerText: {
    fontSize: FontSize.xs,
    color: Colors.stone500,
    lineHeight: 18,
    textAlign: 'center',
  },
});
