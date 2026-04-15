import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerTitleAlign: 'center',
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarIcon: ({ color, size }) => {
          const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
            index: 'home-outline',
            search: 'search-outline',
            library: 'book-outline',
            more: 'menu-outline',
          };

          return <Ionicons name={icons[route.name] ?? 'ellipse-outline'} size={size} color={color} />;
        },
      })}
    >
      <Tabs.Screen name="index" options={{ title: '홈', headerTitle: '보고팡' }} />
      <Tabs.Screen name="search" options={{ title: '검색', headerTitle: '도서 검색' }} />
      <Tabs.Screen name="library" options={{ title: '내서재', headerTitle: '읽기 목록' }} />
      <Tabs.Screen name="more" options={{ title: '더보기', headerTitle: '보호자용' }} />
    </Tabs>
  );
}
