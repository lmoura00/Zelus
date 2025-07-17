import React, { useState, useContext, useCallback, useEffect } from "react";
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
import * as ImagePicker from "expo-image-picker";
import Constants from "expo-constants";
import { api } from "@/api";

const { width } = Dimensions.get("window");

const ContaPage = () => {
  const { user, isLoading, logout, authenticatedRequest, refetchUser } = useContext(AuthContext);
  const router = useRouter();

  const [profileImageUri, setProfileImageUri] = useState(
    user?.avatarUrl || null
  );
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (user?.avatarUrl) {
      setProfileImageUri(user.avatarUrl);
    }
  }, [user?.avatarUrl]);

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
            router.replace("/Login/page");
          },
          style: "destructive",
        },
      ],
      { cancelable: false }
    );
  }, [logout, router]);

  const uploadImage = useCallback(
    async (uri, fileName, type) => {
      if (!user) {
        Alert.alert("Erro", "Dados do usuário não disponíveis.");
        return;
      }

      setIsUploading(true);
      const formData = new FormData();
      formData.append("image", {
        uri,
        name: fileName,
        type,
      });

      try {
        const response = await authenticatedRequest("PATCH", "/user", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        if (response.data && response.data.avatarUrl) {
          setProfileImageUri(response.data.avatarUrl);
          Alert.alert("Sucesso", "Foto de perfil atualizada!");
          refetchUser(); // Força a atualização do usuário no AuthContext
        } else {
          Alert.alert("Erro", "Resposta inesperada do servidor ao atualizar a foto.");
        }
      } catch (error) {
        console.error("Erro completo ao fazer upload da imagem:", error.response?.data || error.message);
        Alert.alert(
          "Erro ao atualizar",
          `Falha ao atualizar foto: ${error.response?.data?.message || error.message}`
        );
      } finally {
        setIsUploading(false);
      }
    },
    [user, authenticatedRequest, refetchUser]
  );

  const pickImage = useCallback(async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        const fileExtension = uri.split(".").pop();
        const fileName = `profile_photo.${fileExtension}`;
        const type = `image/${fileExtension}`;

        setProfileImageUri(uri);
        await uploadImage(uri, fileName, type);
      }
    } catch (error) {
      Alert.alert("Erro", "Falha ao selecionar imagem.");
    }
  }, [uploadImage]);

  const navigateToNotifications = useCallback(() => {
    router.push("/Notification/page");
  }, [router]);

  const navigateToSecurity = useCallback(() => {
    router.push("/Seguranca/page");
  }, [router]);

  const navigateToHelp = useCallback(() => {
    router.push("/Help/page");
  }, [router]);

  const navigateToEditProfile = useCallback(() => {
    router.push("/EditProfile/page"); // Nova rota
  }, [router]);

  if (isLoading || isUploading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#291F75" />
        <Text style={styles.loadingText}>
          {isUploading ? "Atualizando foto..." : "Carregando perfil..."}
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Zelus</Text>
        <TouchableOpacity style={styles.headerIcon} onPress={navigateToNotifications}>
          <Ionicons name="notifications-outline" size={24} color="#291f75" />
        </TouchableOpacity>
      </View>

      <View style={styles.profile}>
        <TouchableOpacity
          onPress={pickImage}
          style={styles.avatarWrapper}
          disabled={isUploading}
        >
          {profileImageUri ? (
            <Image source={{ uri: profileImageUri }} style={styles.avatar} />
          ) : (
            <Ionicons name="person-circle" size={80} color="#291f75" />
          )}
          <View style={styles.addIcon}>
            <Ionicons name="camera" size={18} color="#FFFFFF" />
          </View>
        </TouchableOpacity>
        <Text style={styles.profileName}>{user?.name || "Carregando..."}</Text>
        {user?.email && <Text style={styles.profileEmail}>{user.email}</Text>}
      </View>

      <View style={styles.menu}>
        <MenuItem
          icon={
            <Ionicons name="person-outline" size={20} color="#291f75" /> // Ícone para editar perfil
          }
          label="Editar Perfil"
          onPress={navigateToEditProfile} // Navega para a nova página
        />
        <MenuItem
          icon={
            <Ionicons name="notifications-outline" size={20} color="#291f75" />
          }
          label="Notificação"
          onPress={navigateToNotifications}
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
          onPress={navigateToSecurity}
        />
        <MenuItem
          icon={<Feather name="help-circle" size={20} color="#291f75" />}
          label="Ajuda"
          onPress={navigateToHelp}
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
};

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  isDestructive?: boolean;
}

function MenuItem({
  icon,
  label,
  onPress,
  isDestructive = false,
}: MenuItemProps) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuIcon}>{icon}</View>
      <Text
        style={[styles.menuLabel, isDestructive && styles.menuLabelDestructive]}
      >
        {label}
      </Text>
      <Ionicons
        name="chevron-forward"
        size={20}
        color={isDestructive ? "#D25A5A" : "#291f75"}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F8F9",
    paddingTop: Constants.statusBarHeight,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F7F8F9",
  },
  loadingText: {
    marginTop: 10,
    fontFamily: "Nunito-SemiBold",
    fontSize: 16,
    color: "#291F75",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 0,
    marginTop: -33,
    paddingBottom: 25,
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
    backgroundColor: "#E8E1FA",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: 40,
    resizeMode: "cover",
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
    borderColor: "#FFF",
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
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginHorizontal: 20,
    paddingVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#EDEBFB",
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuIcon: {
    width: 32,
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
    color: "#D25A5A",
    fontFamily: "Nunito-SemiBold",
  },
});

export default ContaPage;