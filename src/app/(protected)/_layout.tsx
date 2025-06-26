
import React, { useContext, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Tabs, useRouter, useSegments } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AuthContext } from '@/context/user-context'; 

const { width, height } = Dimensions.get('window');

export default function ProtectedLayout() {
  const router = useRouter();
  const segments = useSegments();
  const { user, isLoading } = useContext(AuthContext); 
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
        tabBarStyle: styles.tabBar,
      }}
      tabBar={({ state, descriptors, navigation }) => {
        return (
          <View style={styles.tabBar}>
            {state.routes.map((route, index) => {
              const { options } = descriptors[route.key];
              const label =
                options.tabBarLabel !== undefined
                  ? options.tabBarLabel
                  : options.title !== undefined
                  ? options.title
                  : route.name;

              const isFocused = state.index === index;

              const onPress = () => {
                const event = navigation.emit({
                  type: 'tabPress',
                  target: route.key,
                  canPreventDefault: true,
                });

                if (!isFocused && !event.defaultPrevented) {
                  if (route.name === 'home') {
                    router.replace('/(protected)/home/page'); 
                  } else if (route.name === 'Solicitacoes') { // Use o nome da rota (pasta)
                    router.push('/(protected)/solicitacoes/page'); // Exemplo: push para solicitações
                  } else if (route.name === 'Conta') { // Use o nome da rota (pasta)
                    router.push('/(protected)/conta/page'); // Exemplo: push para conta
                  } else {
                    router.push(`/${route.name}`); // Default para outras rotas se houver
                  }
                }
              };

              // Determina o ícone e a cor com base na rota e no foco
              let iconName: keyof typeof MaterialCommunityIcons.glyphMap = 'help-circle'; // Fallback icon
              let tabLabel = '';

              switch (route.name) {
                case 'home': // Corresponde ao nome da pasta 'home'
                  iconName = 'home';
                  tabLabel = 'Início';
                  break;
                case 'Solicitacoes': // Corresponde ao nome da pasta 'Solicitacoes'
                  iconName = 'clipboard-list-outline';
                  tabLabel = 'Solicitações';
                  break;
                case 'Conta': // Corresponde ao nome da pasta 'Conta'
                  iconName = 'account-outline';
                  tabLabel = 'Conta';
                  break;
                // Adicione outros casos conforme suas rotas
              }

              const iconColor = isFocused ? '#291F75' : '#FFFFFF';
              const textColor = isFocused ? styles.tabActiveText.color : styles.tabInactiveText.color;
              const tabItemStyle = isFocused ? styles.activeTabItem : {};

              return (
                <TouchableOpacity
                  key={route.key}
                  accessibilityRole="button"
                  accessibilityState={isFocused ? { selected: true } : {}}
                  accessibilityLabel={options.tabBarAccessibilityLabel}
                  onPress={onPress}
                  style={[styles.tabItem, tabItemStyle]}
                >
                  <MaterialCommunityIcons name={iconName} size={24} color={iconColor} />
                  <Text style={[styles.tabText, { color: textColor }]}>
                    {tabLabel}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        );
      }}
    >
      {/* Defina suas abas aqui. O `name` DEVE corresponder ao nome da pasta ou arquivo da rota. */}
      <Tabs.Screen name="home" /> {/* Corresponde a src/app/(protected)/home/page.tsx */}
      <Tabs.Screen name="Solicitacoes" /> {/* Corresponde a src/app/(protected)/Solicitacoes/page.tsx */}
      <Tabs.Screen name="Conta" /> {/* Corresponde a src/app/(protected)/Conta/page.tsx */}
      {/* Se você tiver outras rotas dentro de (protected), adicione-as aqui */}
      {/* Exemplo: <Tabs.Screen name="settings" /> */}
    </Tabs>
  );
}

const styles = StyleSheet.create({

  tabBar: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    flexDirection: 'row',
    backgroundColor: '#291F75',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingVertical: 12,
    justifyContent: 'space-around',
    elevation: 8, // Sombra para Android
    shadowColor: '#000', // Sombra para iOS
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tabItem: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  activeTabItem: {
    backgroundColor: '#FFF',
  },
  tabText: {
    fontFamily: 'Nunito-Bold',
    fontSize: 12,
    marginTop: 4,
  },
  tabActiveText: {
    color: '#291F75',
  },
  tabInactiveText: {
    color: '#FFFFFF',
  },
});