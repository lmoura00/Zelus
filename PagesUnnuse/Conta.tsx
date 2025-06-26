// todas as ocorrências de "#3E136D", "#F3F0FF", "#5A3EB5", "#E5E0FF" foram ajustadas para manter consistência com #291f75

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons";

const { width } = Dimensions.get("window");
const TAB_WIDTH = width / 3;

export default function Conta() {
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Zelus</Text>
        <TouchableOpacity style={styles.headerIcon}>
          <Ionicons name="notifications-outline" size={24} color="#291f75" />
        </TouchableOpacity>
      </View>

      {/* Perfil */}
      <View style={styles.profile}>
        <View style={styles.avatarWrapper}>
          <Ionicons name="person-circle" size={80} color="#291f75" />
          <View style={styles.addIcon}>
            <Ionicons name="add-circle" size={24} color="#FFFFFF" />
          </View>
        </View>
        <Text style={styles.profileName}>Miquéias Veloso Chaves Bezerra</Text>
      </View>

      {/* Menu */}
      <View style={styles.menu}>
        <MenuItem
          icon={
            <Ionicons name="notifications-outline" size={20} color="#291f75" />
          }
          label="Notificação"
        />
        <MenuItem
          icon={
            <MaterialCommunityIcons
              name="shield-check-outline"
              size={20}
              color="#291f75"
            />
          }
          label="Segurança"
        />
        <MenuItem
          icon={<Feather name="help-circle" size={20} color="#291f75" />}
          label="Ajuda"
        />
        <MenuItem
          icon={<Ionicons name="log-out-outline" size={20} color="#291f75" />}
          label="Sair da Conta"
        />
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.tab}>
          <Ionicons name="home-outline" size={24} color="#B0A8E8" />
          <Text style={styles.tabLabel}>Início</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab}>
          <MaterialCommunityIcons
            name="file-document-outline"
            size={24}
            color="#B0A8E8"
          />
          <Text style={styles.tabLabel}>Solicitações</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabActive}>
          <Ionicons name="person-outline" size={24} color="#FFFFFF" />
          <Text style={[styles.tabLabel, { color: "#FFFFFF" }]}>Conta</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function MenuItem({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <TouchableOpacity style={styles.menuItem}>
      <View style={styles.menuIcon}>{icon}</View>
      <Text style={styles.menuLabel}>{label}</Text>
      <Ionicons name="chevron-forward" size={20} color="#291f75" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: "bold",
    color: "#291f75",
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#EDEBFB", // tom suave relacionado a #291f75
    alignItems: "center",
    justifyContent: "center",
  },
  profile: {
    alignItems: "center",
    marginTop: 8,
    marginBottom: 24,
  },
  avatarWrapper: {
    position: "relative",
  },
  addIcon: {
    position: "absolute",
    right: -4,
    bottom: -4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#291f75",
    alignItems: "center",
    justifyContent: "center",
  },
  profileName: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: "600",
    color: "#291f75",
  },
  menu: {
    flex: 1,
    paddingHorizontal: 20,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#EDEBFB",
  },
  menuIcon: {
    width: 28,
    alignItems: "center",
  },
  menuLabel: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: "#291f75",
  },
  bottomNav: {
    flexDirection: "row",
    backgroundColor: "#291f75",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: "hidden",
  },
  tab: {
    width: TAB_WIDTH,
    alignItems: "center",
    paddingVertical: 10,
  },
  tabActive: {
    width: TAB_WIDTH,
    alignItems: "center",
    paddingVertical: 10,
    backgroundColor: "#1E1654", // variante escura de #291f75
  },
  tabLabel: {
    marginTop: 4,
    fontSize: 12,
    color: "#B0A8E8",
  },
});
