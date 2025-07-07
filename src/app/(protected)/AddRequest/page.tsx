import React, { useState, useContext, useCallback } from 'react';
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
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import DropDownPicker from 'react-native-dropdown-picker';
import MapView, { Marker } from 'react-native-maps';
import * as ImagePicker from 'expo-image-picker';
import { useMutation } from '@tanstack/react-query';
import { AuthContext } from '@/context/user-context';
import { AxiosError } from 'axios';

interface CategoryItem {
  label: string;
  value: string;
}

interface CreatePostPayload {
  title: string;
  description: string;
  address: string;
  cep: string;
  neighborhood: string;
  latitude?: number | null;
  longitude?: number | null;
  categoryId: number;
  departmentId: number;
  file: File | null;
}

const CreateRequestScreen = ()=> {
  const router = useRouter();
  const { authenticatedRequest, token } = useContext(AuthContext);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [cep, setCep] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [open, setOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [items, setItems] = useState<CategoryItem[]>([
    { label: 'Iluminação', value: '1' },
    { label: 'Pavimentação', value: '2' },
    { label: 'Árvores', value: '3' },
    { label: 'Sinalização', value: '4' },
    // Adapte estes valores com os IDs reais das suas categorias da API
  ]);

  const [openDepartment, setOpenDepartment] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [departmentItems, setDepartmentItems] = useState([
    { label: 'Ouvidoria', value: '1' },
    { label: 'Manutenção', value: '2' },
    // Adapte estes valores com os IDs reais dos seus departamentos da API
  ]);

  const createPostMutation = useMutation<any, AxiosError, FormData>({
    mutationFn: async (formData: FormData) => {
      if (!token) {
        throw new Error("Token de autenticação não disponível.");
      }
      const response = await authenticatedRequest('POST', '/post', formData, {
        headers: {
          'Content-Type': 'multipart/form-data', // Importante para envio de arquivos
        },
      });
      return response.data;
    },
    onSuccess: () => {
      Alert.alert('Sucesso', 'Solicitação criada com sucesso!');
      router.back();
      // Opcional: Invalide queries para atualizar a lista na HomePage
      // queryClient.invalidateQueries(['posts', 'userPosts']);
    },
    onError: (error) => {
      Alert.alert('Erro', `Falha ao criar solicitação: ${error.response?.data?.message || error.message}`);
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
      const fileExtension = uri.split('.').pop();
      const fileName = `photo.${fileExtension}`;
      const type = `image/${fileExtension}`;

      // Criar um File object para FormData
      setImageFile({ uri, name: fileName, type } as unknown as File);
    }
  }, []);

  const handleMapPress = (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setLatitude(latitude);
    setLongitude(longitude);
  };

  const handleSubmit = useCallback(() => {
    if (!title || !description || !address || !cep || !neighborhood || !selectedType || !selectedDepartment || !imageFile) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos e adicione uma imagem.');
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('address', address);
    formData.append('cep', cep);
    formData.append('neighborhood', neighborhood);
    formData.append('categoryId', selectedType);
    formData.append('departmentId', selectedDepartment);
    if (latitude !== null && longitude !== null) {
      formData.append('latitude', latitude.toString());
      formData.append('longitude', longitude.toString());
    }
    formData.append('file', imageFile);

    createPostMutation.mutate(formData);
  }, [title, description, address, cep, neighborhood, selectedType, selectedDepartment, latitude, longitude, imageFile, createPostMutation]);


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
      <View style={[styles.dropdownWrapper, Platform.OS !== 'android' && { zIndex: 3000 }]}>
        <DropDownPicker
          listMode="SCROLLVIEW"
          open={open}
          value={selectedType}
          items={items}
          setOpen={setOpen}
          setValue={setSelectedType}
          setItems={setItems}
          placeholder="Selecione o tipo..."
          style={styles.dropdown}
          dropDownContainerStyle={styles.dropdownContainer}
          zIndex={3000} // Prioridade para o primeiro dropdown
          zIndexInverse={1000}
        />
      </View>

      <Text style={styles.label}>Departamento Responsável:</Text>
      <View style={[styles.dropdownWrapper, Platform.OS !== 'android' && { zIndex: 2000 }]}>
        <DropDownPicker
          listMode="SCROLLVIEW"
          open={openDepartment}
          value={selectedDepartment}
          items={departmentItems}
          setOpen={setOpenDepartment}
          setValue={setSelectedDepartment}
          setItems={setDepartmentItems}
          placeholder="Selecione o departamento..."
          style={styles.dropdown}
          dropDownContainerStyle={styles.dropdownContainer}
          zIndex={2000} // Segunda prioridade para o segundo dropdown
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
            latitude: -5.0881, // Coordenadas de Timon (exemplo)
            longitude: -42.8361,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
          onPress={handleMapPress}
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
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#FFF', flexGrow: 1 },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F7FF',
    borderRadius: 18,
    marginVertical: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
  },
  backButtonText: {
    color: '#291F75',
    fontSize: 16,
    marginLeft: 8,
    fontFamily: 'Nunito-SemiBold',
  },
  header: {
    fontSize: 26,
    fontFamily: 'Nunito-Bold',
    color: '#291F75',
    textAlign: 'center',
    marginBottom: 30,
  },
  imagePicker: {
    width: '100%',
    height: 180, // Aumenta a área do seletor de imagem
    borderRadius: 12, // Mais arredondado
    borderWidth: 2,
    borderColor: '#5D559C',
    borderStyle: 'dashed', // Borda tracejada
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 30,
    overflow: 'hidden', // Para que a imagem preencha corretamente
    backgroundColor: '#E8E1FA', // Cor de fundo suave
  },
  pickedImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  label: {
    fontSize: 16,
    color: '#291F75',
    fontFamily: 'Nunito-SemiBold',
    marginBottom: 8,
    marginTop: 10, // Espaçamento entre campos
  },
  input: {
    borderWidth: 1,
    borderColor: '#D8D0ED', // Borda mais clara
    borderRadius: 10, // Mais arredondado
    paddingHorizontal: 16, // Mais padding
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Nunito-Regular',
    color: '#291F75',
    marginBottom: 20, // Mais espaçamento
    backgroundColor: '#F8F7FF', // Fundo leve
  },
  textarea: { height: 120, textAlignVertical: 'top' },
  dropdownWrapper: { marginBottom: 20 },
  dropdown: { borderColor: '#D8D0ED', borderRadius: 10, backgroundColor: '#F8F7FF' },
  dropdownContainer: { borderColor: '#D8D0ED', borderRadius: 10, backgroundColor: '#F8F7FF' },
  mapContainer: {
    height: 200, // Altura do mapa
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#D8D0ED',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  submitButton: {
    backgroundColor: '#291F75',
    paddingVertical: 16,
    borderRadius: 10,
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 8,
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontFamily: 'Nunito-Bold',
    textAlign: 'center',
  },
});

export default CreateRequestScreen;