import React, { useState, useContext, useCallback, useEffect } from 'react';
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
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import DropDownPicker from 'react-native-dropdown-picker';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as ImagePicker from 'expo-image-picker';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AuthContext } from '@/context/user-context';
import { AxiosError } from 'axios';
import Constants from 'expo-constants';

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
  admins?: any[];
}

interface DropdownItem {
  label: string;
  value: string;
}

interface UserData {
  id: number;
  name: string;
  email: string;
  cpf: string;
  createdAt?: string;
  updatedAt?: string;
  restores?: any[];
}

interface CategoryData {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

interface DepartmentData {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
  admins?: any[];
}

interface PostData {
  id: number;
  title: string;
  description: string;
  status: string;
  address: string;
  cep: string;
  neighborhood: string;
  publicId?: string;
  publicUrl?: string;
  latitude: string | null;
  longitude: string | null;
  dateInit: string | null;
  dateEnd: string | null;
  comment: string | null;
  number?: number;
  categoryId: number;
  userId: number;
  departmentId: number;
  createdAt: string;
  updatedAt: string;
  category: CategoryData;
  department: DepartmentData;
  user: UserData;
}

const EditRequestScreen = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const postId = typeof id === 'string' ? parseInt(id, 10) : undefined;

  const { authenticatedRequest, token } = useContext(AuthContext);
  const queryClient = useQueryClient();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [cep, setCep] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null); // Uri da imagem selecionada ou original
  const [imageFile, setImageFile] = useState<File | null>(null); // File object para upload (só se nova imagem for selecionada)

  const [openCategory, setOpenCategory] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categoryDropdownItems, setCategoryDropdownItems] = useState<DropdownItem[]>([]);

  const [openDepartment, setOpenDepartment] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [departmentDropdownItems, setDepartmentDropdownItems] = useState<DropdownItem[]>([]);

  const fetchCategoriesQueryFn = useCallback(async () => {
    if (!token) throw new Error("Token de autenticação não disponível.");
    const response = await authenticatedRequest<CategoryApiData[]>("GET", "/categories");
    return response.data;
  }, [token, authenticatedRequest]);

  const {
    data: categories,
    isLoading: isCategoriesLoading,
    isError: isCategoriesError,
    error: categoriesError,
  } = useQuery<CategoryApiData[], AxiosError>({
    queryKey: ['categories', token],
    queryFn: fetchCategoriesQueryFn,
    enabled: !!token,
    staleTime: Infinity,
    onError: (err) => {
      Alert.alert('Erro', `Não foi possível carregar categorias: ${err.message || 'Erro desconhecido'}`);
    },
  });

  const fetchDepartmentsQueryFn = useCallback(async () => {
    if (!token) throw new Error("Token de autenticação não disponível.");
    const response = await authenticatedRequest<DepartmentApiData[]>("GET", "/departments");
    return response.data;
  }, [token, authenticatedRequest]);

  const {
    data: departments,
    isLoading: isDepartmentsLoading,
    isError: isDepartmentsError,
    error: departmentsError,
  } = useQuery<DepartmentApiData[], AxiosError>({
    queryKey: ['departments', token],
    queryFn: fetchDepartmentsQueryFn,
    enabled: !!token,
    staleTime: Infinity,
    onError: (err) => {
      Alert.alert('Erro', `Não foi possível carregar departamentos: ${err.message || 'Erro desconhecido'}`);
    },
  });

  const fetchPostDetailsQueryFn = useCallback(async () => {
    if (!token) throw new Error("Token de autenticação não disponível.");
    if (postId === undefined) throw new Error("ID do post não fornecido.");
    const response = await authenticatedRequest<PostData>('GET', `/post/${postId}`);
    return response.data;
  }, [token, authenticatedRequest, postId]);

  const {
    data: postDetails,
    isLoading: isPostDetailsLoading,
    isError: isPostDetailsError,
    error: postDetailsError,
    refetch: refetchPostDetails,
  } = useQuery<PostData, AxiosError>({
    queryKey: ['postDetails', postId, token],
    queryFn: fetchPostDetailsQueryFn,
    enabled: !!token && postId !== undefined,
    staleTime: 0, // Sempre re-validar os detalhes do post para edição
    onError: (err) => {
      Alert.alert('Erro', `Não foi possível carregar detalhes do post: ${err.message || 'Erro desconhecido'}`);
    },
  });

  useEffect(() => {
    if (categories) {
      const mappedCategories = categories.map(cat => ({
        label: cat.name,
        value: cat.id.toString(),
      }));
      setCategoryDropdownItems(mappedCategories);
    }
  }, [categories]);

  useEffect(() => {
    if (departments) {
      const mappedDepartments = departments.map(dep => ({
        label: dep.name,
        value: dep.id.toString(),
      }));
      setDepartmentDropdownItems(mappedDepartments);
    }
  }, [departments]);

  useEffect(() => {
    if (postDetails) {
      setTitle(postDetails.title);
      setDescription(postDetails.description);
      setAddress(postDetails.address);
      setCep(postDetails.cep);
      setNeighborhood(postDetails.neighborhood);
      setLatitude(postDetails.latitude !== null ? parseFloat(postDetails.latitude) : null);
      setLongitude(postDetails.longitude !== null ? parseFloat(postDetails.longitude) : null);
      setSelectedCategory(postDetails.categoryId.toString());
      setSelectedDepartment(postDetails.departmentId.toString());
      if (postDetails.publicUrl) {
        setImageUri(postDetails.publicUrl);
        setImageFile(null); // Não há file object para uma imagem existente
      }
    }
  }, [postDetails]);

  const updatePostMutation = useMutation<any, AxiosError, FormData>({
    mutationFn: async (formData: FormData) => {
      if (!token) {
        throw new Error("Token de autenticação não disponível.");
      }
      if (postId === undefined) {
        throw new Error("ID do post não definido para atualização.");
      }
      const response = await authenticatedRequest("PUT", `/post/${postId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    },
    onSuccess: () => {
      Alert.alert("Sucesso", "Solicitação atualizada com sucesso!");
      queryClient.invalidateQueries(['posts']);
      queryClient.invalidateQueries(['userPosts']);
      queryClient.invalidateQueries(['postDetails', postId]);
      router.back();
    },
    onError: (error) => {
      Alert.alert(
        "Erro",
        `Falha ao atualizar solicitação: ${
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
    const { latitude: newLat, longitude: newLon } = event.nativeEvent.coordinate;
    setLatitude(newLat);
    setLongitude(newLon);
  };

  const handleSubmit = useCallback(() => {
    if (
      !title ||
      !description ||
      !address ||
      !cep ||
      !neighborhood ||
      !selectedCategory ||
      !selectedDepartment ||
      (!imageUri && !imageFile) // Pelo menos uma imagem deve existir (original ou nova)
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
    if (imageFile) { // Só anexa o 'file' se uma nova imagem foi selecionada
      formData.append("file", imageFile);
    }

    updatePostMutation.mutate(formData);
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
    imageFile, // Depende de imageFile para saber se um novo arquivo foi selecionado
    imageUri, // Depende de imageUri para checar se existe alguma imagem (mesmo que seja a antiga)
    updatePostMutation,
  ]);

  if (isCategoriesLoading || isDepartmentsLoading || isPostDetailsLoading || isPostDetailsError) {
    return (
      <View style={styles.fullscreenLoadingContainer}>
        <ActivityIndicator size="large" color="#291F75" />
        <Text style={styles.loadingText}>
          {isPostDetailsLoading ? 'Carregando detalhes do post...' : 'Carregando opções...'}
        </Text>
        {isPostDetailsError && (
          <TouchableOpacity onPress={() => refetchPostDetails()}>
            <Text style={styles.retryButton}>Tentar Novamente</Text>
          </TouchableOpacity>
        )}
        {(isCategoriesError || isDepartmentsError) && (
          <TouchableOpacity onPress={() => { router.reload(); }}>
            <Text style={styles.retryButton}>Recarregar Página</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  if (!postDetails) {
    return (
      <View style={styles.fullscreenErrorContainer}>
        <Text style={styles.errorText}>Postagem não encontrada ou inacessível.</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.retryButton}>Voltar</Text>
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

      <Text style={styles.header}>Editar Solicitação</Text>

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
          initialRegion={{
            latitude: latitude || -5.0881,
            longitude: longitude || -42.8361,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
          onPress={handleMapPress}
          provider={PROVIDER_GOOGLE}
        >
          {latitude !== null && longitude !== null && (
            <Marker coordinate={{ latitude, longitude }} />
          )}
        </MapView>
      </View>

      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleSubmit}
        disabled={updatePostMutation.isPending}
      >
        {updatePostMutation.isPending ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={styles.submitButtonText}>Salvar Alterações</Text>
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
    paddingBottom: 40,
  },
  fullscreenLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  fullscreenErrorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFF',
  },
  loadingText: {
    marginTop: 10,
    fontFamily: 'Nunito-SemiBold',
    fontSize: 16,
    color: '#291F75',
  },
  errorText: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 16,
    color: '#D25A5A',
    textAlign: 'center',
    marginBottom: 10,
  },
  retryButton: {
    fontFamily: 'Nunito-Bold',
    fontSize: 14,
    color: '#291F75',
    textDecorationLine: 'underline',
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
    resizeMode: "cover",
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
});

export default EditRequestScreen;