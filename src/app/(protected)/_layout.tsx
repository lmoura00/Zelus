// app/(protected)/_layout.tsx
import React, { useContext, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Tabs, useRouter } from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { AuthContext } from "@/context/user-context";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ProtectedLayout() {
  const router = useRouter();
  const { user, isLoading } = useContext(AuthContext);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!user && !isLoading) {
      router.replace("/Login/page");
    }
  }, [user, isLoading, router]);

  if (!user && !isLoading) {
    return null;
  }

  const TAB_BAR_HEIGHT = 75;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        contentStyle: { paddingBottom: TAB_BAR_HEIGHT + insets.bottom },
      }}
      sceneContainerStyle={{ paddingBottom: TAB_BAR_HEIGHT + insets.bottom }}
      tabBar={({ state, descriptors, navigation }) => (
        <View
          style={[
            styles.tabBarContainer,
            {
              bottom: 0,
              height: TAB_BAR_HEIGHT + insets.bottom,
              paddingBottom: insets.bottom,
            },
          ]}
        >
          {state.routes.map((route, index) => {
            const intendedTabs = {
              "Home/page": { icon: "home", label: "Início" },
              "Solicitacoes/page": {
                icon: "clipboard-list-outline",
                label: "Solicitações",
              },
              "Conta/page": { icon: "account-outline", label: "Conta" },
            };

            const tabInfo =
              intendedTabs[route.name as keyof typeof intendedTabs];

            if (!tabInfo) {
              return null;
            }

            const isFocused = state.index === index;
            const iconName = tabInfo.icon;
            const tabLabel = tabInfo.label;

            const iconColor = isFocused ? "#FFFFFF" : "#B0A8E8";
            const textColor = isFocused ? "#FFFFFF" : "#B0A8E8";
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
                <MaterialCommunityIcons
                  name={iconName as any}
                  size={28}
                  color={iconColor}
                />
                <Text style={[styles.tabLabel, { color: textColor }]}>
                  {tabLabel}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    >
      <Tabs.Screen
        name="Home/page"
        options={{
          contentStyle: { paddingBottom: TAB_BAR_HEIGHT + insets.bottom },
        }}
      />
      <Tabs.Screen
        name="Solicitacoes/page"
        options={{
          contentStyle: { paddingBottom: TAB_BAR_HEIGHT + insets.bottom },
        }}
      />
      <Tabs.Screen
        name="Conta/page"
        options={{
          contentStyle: { paddingBottom: TAB_BAR_HEIGHT + insets.bottom },
        }}
      />
      <Tabs.Screen
        name="SolicitacaoItem/[id]"
        options={{
          href: null,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="ModificarEmail/page"
        options={{
          href: null,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="ModificarSenha/page"
        options={{
          href: null,
          headerShown: false,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    flexDirection: "row",
    backgroundColor: "#291F75",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    overflow: "hidden",
    elevation: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    position: "absolute",
    left: 0,
    right: 0,
    borderTopWidth: 2,
    borderTopColor: "#3E2A9E",
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    backgroundColor: "transparent",
  },
  tabActive: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    backgroundColor: "rgba(62, 42, 158, 0.3)",
    borderRadius: 15,
    marginHorizontal: 5,
    transform: [{ scale: 1.05 }],
  },
  tabLabel: {
    marginTop: 4,
    fontSize: 13,
    fontFamily: "System",
    fontWeight: "600",
  },
});
