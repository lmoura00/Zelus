import React, { useContext, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Tabs, useRouter } from 'expo-router';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { AuthContext } from '@/context/user-context';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function ProtectedLayout() {
  const router = useRouter();
  const { user, isLoading } = useContext(AuthContext);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!user && !isLoading) {
      router.replace('/login/page');
    }
  }, [user, isLoading, router]);

  if (!user && !isLoading) {
    return null;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: [styles.tabBar, { height: 75 + insets.bottom }],
        contentStyle: { paddingBottom: 75 + insets.bottom }, // Adiciona padding para o conteúdo
      }}
      sceneContainerStyle={{ paddingBottom: 75 + insets.bottom }} // Garante que as cenas tenham espaço
      tabBar={({ state, descriptors, navigation }) => (
        <View style={[styles.tabBarContainer, { paddingBottom: insets.bottom }]}>
          {state.routes.map((route, index) => {
            const isFocused = state.index === index;
            let iconName = 'help-circle';
            let tabLabel = '';

            switch (route.name) {
              case 'home/page':
                iconName = 'home';
                tabLabel = 'Início';
                break;
              case 'solicitacoes/page':
                iconName = 'clipboard-list-outline';
                tabLabel = 'Solicitações';
                break;
              case 'conta/page':
                iconName = 'account-outline';
                tabLabel = 'Conta';
                break;
              default:
                iconName = 'help-circle';
                tabLabel = route.name;
                break;
            }

            const iconColor = isFocused ? '#FFFFFF' : '#B0A8E8';
            const textColor = isFocused ? '#FFFFFF' : '#B0A8E8';
            const tabItemStyle = isFocused ? styles.tabActive : styles.tab;

            const onPress = () => {
              if (!isFocused) {
                navigation.navigate(route.name);
              }
            };

            return (
              <TouchableOpacity
                key={route.key}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                onPress={onPress}
                style={tabItemStyle}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons name={iconName} size={28} color={iconColor} />
                <Text style={[styles.tabLabel, { color: textColor }]}>{tabLabel}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    >
      <Tabs.Screen 
        name="home" 
        options={{
          contentStyle: { paddingBottom: 75 + insets.bottom },
        }}
      />
      <Tabs.Screen 
        name="solicitacoes" 
        options={{
          contentStyle: { paddingBottom: 75 + insets.bottom },
        }}
      />
      <Tabs.Screen 
        name="conta" 
        options={{
          contentStyle: { paddingBottom: 75 + insets.bottom },
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    flexDirection: 'row',
    backgroundColor: '#291F75',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    overflow: 'hidden',
    height: 75,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 2,
    borderTopColor: '#3E2A9E',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#291F75',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    overflow: 'hidden',
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 2,
    borderTopColor: '#3E2A9E',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    backgroundColor: 'transparent',
  },
  tabActive: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    backgroundColor: 'rgba(62, 42, 158, 0.3)',
    borderRadius: 15,
    marginHorizontal: 5,
    transform: [{ scale: 1.05 }],
  },
  tabLabel: {
    marginTop: 4,
    fontSize: 13,
    fontFamily: 'System',
    fontWeight: '600',
  },
});