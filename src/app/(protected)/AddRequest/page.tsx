import React, { useState, useContext, useCallback, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
  Platform,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import DropDownPicker from "react-native-dropdown-picker";
import MapView, {
  Marker,
  PROVIDER_GOOGLE,
  PROVIDER_DEFAULT,
  MapViewProps,
} from "react-native-maps";
import * as ImagePicker from "expo-image-picker";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AuthContext } from "@/context/user-context";
import { AxiosError } from "axios";
import Constants from "expo-constants";
import * as Location from "expo-location";

interface CategoryApiData {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

interface DepartmentApiData {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
  admins: any[];
}

interface DropdownItem {
  label: string;
  value: string;
}

interface ViaCepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
  erro?: boolean;
}

const CreateRequestScreen = () => {
  const router = useRouter();
  const { authenticatedRequest, token } = useContext(AuthContext);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [cep, setCep] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isCepLoading, setIsCepLoading] = useState(false);

  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  

  const [openCategory, setOpenCategory] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categoryDropdownItems, setCategoryDropdownItems] = useState<
    DropdownItem[]
  >([]);

  const [openDepartment, setOpenDepartment] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(
    null
  );
  const [departmentDropdownItems, setDepartmentDropdownItems] = useState<
    DropdownItem[]
  >([]);

  const fetchCategoriesQueryFn = useCallback(async () => {
    if (!token) throw new Error("Token de autenticação não disponível.");
    const response = await authenticatedRequest<CategoryApiData[]>(
      "GET",
      "/categories"
    );
    return response.data;
  }, [token, authenticatedRequest]);

  const {
    data: categories,
    isLoading: isCategoriesLoading,
    isError: isCategoriesError,
    error: categoriesError,
  } = useQuery<CategoryApiData[], AxiosError>({
    queryKey: ["categories", token],
    queryFn: fetchCategoriesQueryFn,
    enabled: !!token,
    staleTime: Infinity,
    onError: (err) => {
      Alert.alert(
        "Erro",
        `Não foi possível carregar categorias: ${
          err.message || "Erro desconhecido"
        }`
      );
    },
  });

  const fetchDepartmentsQueryFn = useCallback(async () => {
    if (!token) throw new Error("Token de autenticação não disponível.");
    const response = await authenticatedRequest<DepartmentApiData[]>(
      "GET",
      "/departments"
    );
    return response.data;
  }, [token, authenticatedRequest]);

  const {
    data: departments,
    isLoading: isDepartmentsLoading,
    isError: isDepartmentsError,
    error: departmentsError,
  } = useQuery<DepartmentApiData[], AxiosError>({
    queryKey: ["departments", token],
    queryFn: fetchDepartmentsQueryFn,
    enabled: !!token,
    staleTime: Infinity,
    onError: (err) => {
      Alert.alert(
        "Erro",
        `Não foi possível carregar departamentos: ${
          err.message || "Erro desconhecido"
        }`
      );
    },
  });

  useEffect(() => {
    if (categories) {
      const mappedCategories = categories.map((cat) => ({
        label: cat.name,
        value: cat.id.toString(),
      }));
      setCategoryDropdownItems(mappedCategories);
    }
  }, [categories]);

  useEffect(() => {
    if (departments) {
      const mappedDepartments = departments.map((dep) => ({
        label: dep.name,
        value: dep.id.toString(),
      }));
      setDepartmentDropdownItems(mappedDepartments);
    }
  }, [departments]);

  const createPostMutation = useMutation<any, AxiosError, FormData>({
    mutationFn: async (formData: FormData) => {
      if (!token) {
        throw new Error("Token de autenticação não disponível.");
      }
      console.log("Enviando dados:", JSON.stringify(formData, null, 2));
      const response = await authenticatedRequest("POST", "/post", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    },
    onSuccess: () => {
      Alert.alert("Sucesso", "Solicitação criada com sucesso!");
      router.back();
    },
    onError: (error) => {
      Alert.alert(
        "Erro",
        `Falha ao criar solicitação: ${
          error.response?.data?.message || error.message
        }`
      );
    },
  });

  const pickImage = useCallback(async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      setImageUri(uri);
      const fileExtension = uri.split(".").pop();
      const fileName = `photo.${fileExtension}`;
      const type = `image/${fileExtension}`;

      setImageFile({ uri, name: fileName, type } as unknown as File);
    }
  }, []);

  const handleMapPress = (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setLatitude(latitude);
    setLongitude(longitude);
  };

  const fetchAddressByCep = useCallback(async (currentCep: string) => {
    if (currentCep.length !== 8) {
      setAddress("");
      setNeighborhood("");
      return;
    }
    setIsCepLoading(true);
    try {
      const response = await fetch(
        `https://viacep.com.br/ws/${currentCep}/json/`
      );
      const data: ViaCepResponse = await response.json();

      if (data.erro) {
        Alert.alert("Erro no CEP", "CEP não encontrado ou inválido.");
        setAddress("");
        setNeighborhood("");
      } else {
        setAddress(data.logradouro);
        setNeighborhood(data.bairro);
      }
    } catch (error) {
      Alert.alert(
        "Erro",
        "Não foi possível buscar o CEP. Verifique sua conexão."
      );
      setAddress("");
      setNeighborhood("");
    } finally {
      setIsCepLoading(false);
    }
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (cep.length === 8) {
        fetchAddressByCep(cep);
      }
    }, 500);
    return () => clearTimeout(handler);
  }, [cep, fetchAddressByCep]);

  const handleSubmit = useCallback(() => {
    if (
      !title ||
      !description ||
      !address ||
      !cep ||
      !neighborhood ||
      !selectedCategory ||
      !selectedDepartment ||
      !imageFile
    ) {
      Alert.alert(
        "Erro",
        "Por favor, preencha todos os campos e adicione uma imagem."
      );
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("address", address);
    formData.append("cep", cep);
    formData.append("neighborhood", neighborhood);
    formData.append("categoryId", selectedCategory);
    formData.append("departmentId", selectedDepartment);
    if (latitude !== null && longitude !== null) {
      formData.append("latitude", latitude.toString());
      formData.append("longitude", longitude.toString());
    }
    formData.append("file", imageFile);

    createPostMutation.mutate(formData);
  }, [
    title,
    description,
    address,
    cep,
    neighborhood,
    selectedCategory,
    selectedDepartment,
    latitude,
    longitude,
    imageFile,
    createPostMutation,
  ]);

  const mapProvider =
    Platform.OS === "android" ? PROVIDER_GOOGLE : PROVIDER_DEFAULT;

  if (isCategoriesLoading || isDepartmentsLoading) {
    return (
      <View style={styles.fullscreenLoadingContainer}>
        <ActivityIndicator size="large" color="#291F75" />
        <Text style={styles.loadingText}>Carregando dados...</Text>
      </View>
    );
  }

  if (isCategoriesError || isDepartmentsError) {
    return (
      <View style={styles.fullscreenErrorContainer}>
        <Text style={styles.errorText}>
          Não foi possível carregar as opções de categoria ou departamento.
        </Text>
        <TouchableOpacity
          onPress={() => {
            router.reload();
          }}
        >
          <Text style={styles.retryButton}>Tentar Novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={20} color="#291F75" />
        <Text style={styles.backButtonText}>Voltar</Text>
      </TouchableOpacity>

      <Text style={styles.header}>Criar Solicitação</Text>

      <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.pickedImage} />
        ) : (
          <Ionicons name="camera-outline" size={36} color="#5D559C" />
        )}
      </TouchableOpacity>

      <Text style={styles.label}>Título da Solicitação:</Text>
      <TextInput
        placeholder="Ex: Poste queimado"
        placeholderTextColor="#918CBC"
        style={styles.input}
        value={title}
        onChangeText={setTitle}
      />

      <Text style={styles.label}>Descrição:</Text>
      <TextInput
        placeholder="Ex: Poste com problema na iluminação há mais de uma semana..."
        placeholderTextColor="#918CBC"
        style={[styles.input, styles.textarea]}
        multiline
        value={description}
        onChangeText={setDescription}
      />

      <Text style={styles.label}>Tipo de Solicitação:</Text>
      <View
        style={[
          styles.dropdownWrapper,
          Platform.OS !== "android" && { zIndex: 3000 },
        ]}
      >
        <DropDownPicker
          listMode="SCROLLVIEW"
          open={openCategory}
          value={selectedCategory}
          items={categoryDropdownItems}
          setOpen={setOpenCategory}
          setValue={setSelectedCategory}
          setItems={setCategoryDropdownItems}
          placeholder="Selecione o tipo..."
          style={styles.dropdown}
          dropDownContainerStyle={styles.dropdownContainer}
          zIndex={3000}
          zIndexInverse={1000}
        />
      </View>

      <Text style={styles.label}>Departamento Responsável:</Text>
      <View
        style={[
          styles.dropdownWrapper,
          Platform.OS !== "android" && { zIndex: 2000 },
        ]}
      >
        <DropDownPicker
          listMode="SCROLLVIEW"
          open={openDepartment}
          value={selectedDepartment}
          items={departmentDropdownItems}
          setOpen={setOpenDepartment}
          setValue={setSelectedDepartment}
          setItems={setDepartmentDropdownItems}
          placeholder="Selecione o departamento..."
          style={styles.dropdown}
          dropDownContainerStyle={styles.dropdownContainer}
          zIndex={2000}
          zIndexInverse={2000}
        />
      </View>

      <Text style={styles.label}>CEP:</Text>
      <TextInput
        placeholder="00000-000"
        placeholderTextColor="#918CBC"
        style={styles.input}
        value={cep}
        onChangeText={setCep}
        keyboardType="numeric"
        maxLength={8}
      />
      {isCepLoading && (
        <View style={styles.cepLoadingIndicator}>
          <ActivityIndicator size="small" color="#291F75" />
        </View>
      )}

      <Text style={styles.label}>Endereço:</Text>
      <TextInput
        placeholder="Ex: Av. Principal, 123"
        placeholderTextColor="#918CBC"
        style={styles.input}
        value={address}
        onChangeText={setAddress}
      />

      <Text style={styles.label}>Bairro:</Text>
      <TextInput
        placeholder="Ex: Centro"
        placeholderTextColor="#918CBC"
        style={styles.input}
        value={neighborhood}
        onChangeText={setNeighborhood}
      />

      <Text style={styles.label}>Local no Mapa (Toque para selecionar):</Text>
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          followsUserLocation
          initialRegion={{
            latitude: -5.0881,
            longitude: -42.8361,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
          }}
          onPress={handleMapPress}
          provider={mapProvider}
          showsUserLocation
          showsMyLocationButton
        >
          {latitude !== null && longitude !== null && (
            <Marker coordinate={{ latitude, longitude }} />
          )}
        </MapView>
      </View>

      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleSubmit}
        disabled={createPostMutation.isPending}
      >
        {createPostMutation.isPending ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={styles.submitButtonText}>Criar sua Solicitação</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#FFF",
    flexGrow: 1,
    paddingTop: Constants.statusBarHeight,
    paddingBottom: 140,
  },
  fullscreenLoadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF",
  },
  fullscreenErrorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#FFF",
  },
  loadingText: {
    marginTop: 10,
    fontFamily: "Nunito-SemiBold",
    fontSize: 16,
    color: "#291F75",
  },
  errorText: {
    fontFamily: "Nunito-SemiBold",
    fontSize: 16,
    color: "#D25A5A",
    textAlign: "center",
    marginBottom: 10,
  },
  retryButton: {
    fontFamily: "Nunito-Bold",
    fontSize: 14,
    color: "#291F75",
    textDecorationLine: "underline",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F7FF",
    borderRadius: 18,
    marginVertical: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignSelf: "flex-start",
  },
  backButtonText: {
    color: "#291F75",
    fontSize: 16,
    marginLeft: 8,
    fontFamily: "Nunito-SemiBold",
  },
  header: {
    fontSize: 26,
    fontFamily: "Nunito-Bold",
    color: "#291F75",
    textAlign: "center",
    marginBottom: 30,
  },
  imagePicker: {
    width: "100%",
    height: 180,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#5D559C",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 30,
    overflow: "hidden",
    backgroundColor: "#E8E1FA",
  },
  pickedImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  label: {
    fontSize: 16,
    color: "#291F75",
    fontFamily: "Nunito-SemiBold",
    marginBottom: 8,
    marginTop: 10,
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
    marginBottom: 20,
    backgroundColor: "#F8F7FF",
  },
  textarea: { height: 120, textAlignVertical: "top" },
  dropdownWrapper: { marginBottom: 20 },
  dropdown: {
    borderColor: "#D8D0ED",
    borderRadius: 10,
    backgroundColor: "#F8F7FF",
  },
  dropdownContainer: {
    borderColor: "#D8D0ED",
    borderRadius: 10,
    backgroundColor: "#F8F7FF",
  },
  mapContainer: {
    height: 200,
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#D8D0ED",
  },
  map: {
    width: "100%",
    height: "100%",
    flex: 1,
  },
  submitButton: {
    backgroundColor: "#291F75",
    paddingVertical: 16,
    borderRadius: 10,
    marginBottom: 40,
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
  cepLoadingIndicator: {
    position: "absolute",
    right: 30,
    top: "48%",
    transform: [{ translateY: -10 }],
  },
});

export default CreateRequestScreen;
