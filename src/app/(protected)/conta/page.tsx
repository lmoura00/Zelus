import React, { useState, useContext, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { AuthContext } from "@/context/user-context";
import { useRouter } from "expo-router";
import * as ImagePicker from 'expo-image-picker';

const { width } = Dimensions.get("window");

const ContaPage = () => {
  const { user, isLoading, logout } = useContext(AuthContext);
  const router = useRouter();

  const [profileImageUri, setProfileImageUri] = useState<string | null>(null);

  const handleLogout = useCallback(() => {
    Alert.alert(
      "Sair da Conta",
      "Tem certeza que deseja sair?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Sair",
          onPress: () => {
            logout();
            router.replace('/Login/page');
          },
          style: "destructive",
        },
      ],
      { cancelable: false }
    );
  }, [logout, router]);

  const pickImage = useCallback(async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setProfileImageUri(result.assets[0].uri);
      // Aqui você enviaria a imagem para o seu backend, usando authenticatedRequest
      // Exemplo: uploadProfileImage(result.assets[0].uri);
      Alert.alert("Sucesso", "Foto de perfil atualizada localmente. (Envio ao servidor pendente)");
    }
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#291F75" />
        <Text style={styles.loadingText}>Carregando perfil...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Zelus</Text>
        <TouchableOpacity style={styles.headerIcon}>
          <Ionicons name="notifications-outline" size={24} color="#291f75" />
        </TouchableOpacity>
      </View>

      <View style={styles.profile}>
        <TouchableOpacity onPress={pickImage} style={styles.avatarWrapper}>
          {profileImageUri ? (
            <Image source={{ uri: profileImageUri }} style={styles.avatar} />
          ) : (
            <Ionicons name="person-circle" size={80} color="#291f75" />
          )}
          <View style={styles.addIcon}>
            <Ionicons name="camera" size={18} color="#FFFFFF" />
          </View>
        </TouchableOpacity>
        <Text style={styles.profileName}>{user?.name || 'Carregando...'}</Text>
        {user?.email && <Text style={styles.profileEmail}>{user.email}</Text>}
      </View>

      <View style={styles.menu}>
        <MenuItem
          icon={
            <Ionicons name="notifications-outline" size={20} color="#291f75" />
          }
          label="Notificação"
          onPress={() => {}}
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
          onPress={() => {}}
        />
        <MenuItem
          icon={<Feather name="help-circle" size={20} color="#291f75" />}
          label="Ajuda"
          onPress={() => {}}
        />
        <MenuItem
          icon={<Ionicons name="log-out-outline" size={20} color="#D25A5A" />}
          label="Sair da Conta"
          onPress={handleLogout}
          isDestructive={true}
        />
      </View>
    </SafeAreaView>
  );
}

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  isDestructive?: boolean;
}

function MenuItem({ icon, label, onPress, isDestructive = false }: MenuItemProps) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuIcon}>{icon}</View>
      <Text style={[styles.menuLabel, isDestructive && styles.menuLabelDestructive]}>{label}</Text>
      <Ionicons name="chevron-forward" size={20} color={isDestructive ? "#D25A5A" : "#291f75"} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F8F9" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F7F8F9" },
  loadingText: { marginTop: 10, fontFamily: "Nunito-SemiBold", fontSize: 16, color: "#291F75" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: "Nunito-Bold",
    color: "#291F75",
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#E8E1FA",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  profile: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 32,
  },
  avatarWrapper: {
    position: "relative",
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E8E1FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
    resizeMode: 'cover',
  },
  addIcon: {
    position: "absolute",
    right: -4,
    bottom: -4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#291F75",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: '#FFF',
  },
  profileName: {
    fontSize: 20,
    fontFamily: "Nunito-Bold",
    color: "#291F75",
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    fontFamily: "Nunito-Regular",
    color: "#584CAF",
  },
  menu: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 20,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16, // Aumentado
    borderBottomWidth: 1,
    borderBottomColor: "#EDEBFB",
  },
  menuItemLast: {
    borderBottomWidth: 0, // Remover borda do último item
  },
  menuIcon: {
    width: 32, // Aumentado
    alignItems: "center",
  },
  menuLabel: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    fontFamily: "Nunito-Regular",
    color: "#291F75",
  },
  menuLabelDestructive: {
    color: "#D25A5A", // Cor vermelha para sair
    fontFamily: "Nunito-SemiBold",
  },
});

export default ContaPage;