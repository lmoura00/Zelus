import React, { useState, useContext, useCallback, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons, Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AuthContext } from "@/context/user-context";
import { AxiosError } from "axios";
import Constants from "expo-constants";


interface UserData {
  id: number;
  name: string;
  email: string;
  cpf: string; 
  avatarUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

const EditProfilePage = () => {
  const router = useRouter();
  const { user, authenticatedRequest, isLoading: isAuthLoading } = useContext(AuthContext);
  const queryClient = useQueryClient();

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [cpf, setCpf] = useState(user?.cpf || "");
  const [profileImageUri, setProfileImageUri] = useState(user?.avatarUrl || null);
  const [imageFile, setImageFile] = useState(null); 

  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [cpfError, setCpfError] = useState("");

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setCpf(user.cpf);
      setProfileImageUri(user.avatarUrl || null);
    }
  }, [user]);

  const validateName = (value) => {
    if (!value.trim()) {
      setNameError("Nome é obrigatório.");
    } else {
      setNameError("");
    }
  };

  const validateEmail = (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value.trim())) {
      setEmailError("Email inválido.");
    } else {
      setEmailError("");
    }
  };

  const validateCpf = (value) => {
    const apenasNumeros = value.replace(/\D/g, "");
    if (apenasNumeros.length !== 11 || /^(\d)\1+$/.test(apenasNumeros)) {
      setCpfError("CPF inválido.");
    } else {
      setCpfError("");
    }
  };

  const pickImage = useCallback(async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      setProfileImageUri(uri);
      const fileExtension = uri.split(".").pop();
      const fileName = `profile_photo.${fileExtension}`;
      const type = `image/${fileExtension}`;
      setImageFile({ uri, name: fileName, type });
    }
  }, []);

  const updateProfileMutation = useMutation<UserData, AxiosError, FormData>({
    mutationFn: async (formData: FormData) => {
      if (!user?.id) {
        throw new Error("ID do usuário não disponível.");
      }
      const response = await authenticatedRequest("PATCH", `/user`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    },
    onSuccess: (data) => {
      Alert.alert("Sucesso", "Perfil atualizado com sucesso!");
      queryClient.invalidateQueries(['user']); 
      
      router.back();
    },
    onError: (error) => {
      console.error("Erro ao atualizar perfil:", error.response?.data || error.message);
      Alert.alert(
        "Erro",
        `Falha ao atualizar perfil: ${error.response?.data?.message || error.message}`
      );
    },
  });

  const handleSubmit = useCallback(() => {
    validateName(name);
    validateEmail(email);
    validateCpf(cpf);

    if (nameError || emailError || cpfError || !name.trim() || !email.trim() || !cpf.trim()) {
      Alert.alert("Erro de Validação", "Por favor, corrija os erros nos campos.");
      return;
    }

    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("email", email.trim());
    formData.append("cpf", cpf.replace(/\D/g, ""));

    if (imageFile) {
      formData.append("image", imageFile);
    }

    updateProfileMutation.mutate(formData);
  }, [name, email, cpf, imageFile, nameError, emailError, cpfError, updateProfileMutation]);

  if (isAuthLoading || updateProfileMutation.isPending) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#291F75" />
        <Text style={styles.loadingText}>
          {updateProfileMutation.isPending ? "Salvando alterações..." : "Carregando dados do perfil..."}
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={20} color="#291F75" />
        <Text style={styles.backButtonText}>Voltar</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <Text style={styles.header}>Editar Perfil</Text>

        <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
          {profileImageUri ? (
            <Image source={{ uri: profileImageUri }} style={styles.pickedImage} />
          ) : (
            <Ionicons name="person-circle-outline" size={80} color="#5D559C" />
          )}
          <View style={styles.addIcon}>
            <Ionicons name="camera" size={18} color="#FFFFFF" />
          </View>
        </TouchableOpacity>

        <Text style={styles.label}>Nome:</Text>
        <TextInput
          placeholder="Seu nome completo"
          placeholderTextColor="#918CBC"
          style={styles.input}
          value={name}
          onChangeText={(value) => {
            setName(value);
            validateName(value);
          }}
          onBlur={() => validateName(name)}
        />
        {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}

        <Text style={styles.label}>Email:</Text>
        <TextInput
          placeholder="seu.email@example.com"
          placeholderTextColor="#918CBC"
          style={styles.input}
          value={email}
          onChangeText={(value) => {
            setEmail(value);
            validateEmail(value);
          }}
          onBlur={() => validateEmail(email)}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

        <Text style={styles.label}>CPF:</Text>
        <TextInput
          placeholder="000.000.000-00"
          placeholderTextColor="#918CBC"
          style={styles.input}
          value={cpf}
          onChangeText={(value) => {
            setCpf(value);
            validateCpf(value);
          }}
          onBlur={() => validateCpf(cpf)}
          keyboardType="numeric"
          maxLength={11}
        />
        {cpfError ? <Text style={styles.errorText}>{cpfError}</Text> : null}

        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={updateProfileMutation.isPending}
        >
          {updateProfileMutation.isPending ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.submitButtonText}>Salvar Alterações</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

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
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8E1FA",
    borderRadius: 18,
    marginVertical: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignSelf: "flex-start",
    marginLeft: 20,
  },
  backButtonText: {
    color: "#291F75",
    fontSize: 16,
    marginLeft: 8,
    fontFamily: "Nunito-SemiBold",
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 40,
    alignItems: "center",
  },
  header: {
    fontSize: 26,
    fontFamily: "Nunito-Bold",
    color: "#291F75",
    textAlign: "center",
    marginBottom: 30,
    marginTop: 20,
  },
  imagePicker: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: "#5D559C",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
    overflow: "hidden",
    backgroundColor: "#E8E1FA",
  },
  pickedImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  addIcon: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#291F75",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFF",
  },
  label: {
    fontSize: 16,
    color: "#291F75",
    fontFamily: "Nunito-SemiBold",
    marginBottom: 8,
    marginTop: 10,
    alignSelf: "flex-start",
  },
  input: {
    borderWidth: 1,
    borderColor: "#D8D0ED",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: "Nunito-Regular",
    color: "#291F75",
    marginBottom: 0, // Ajustado para não ter margem extra antes do erro
    width: "100%",
    backgroundColor: "#F8F7FF",
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginBottom: 10,
    marginTop: 4,
    alignSelf: "flex-start",
  },
  submitButton: {
    backgroundColor: "#291F75",
    paddingVertical: 16,
    borderRadius: 10,
    marginTop: 30,
    width: "100%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 8,
  },
  submitButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontFamily: "Nunito-Bold",
    textAlign: "center",
  },
});

export default EditProfilePage;