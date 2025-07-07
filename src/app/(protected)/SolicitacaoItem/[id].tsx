import React, { useContext, useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Alert, ActivityIndicator, TouchableOpacity, Dimensions } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { AuthContext } from '@/context/user-context';
import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import MapView, { Marker } from 'react-native-maps'; // Importar MapView e Marker

interface UserData {
  id: number;
  name: string;
  email: string;
  cpf: string;
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
  latitude: number | null;
  longitude: number | null;
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

const { width } = Dimensions.get('window');

export default function SolicitacaoItemDetails() {
  const { id } = useLocalSearchParams();
  const { token, authenticatedRequest } = useContext(AuthContext);
  const router = useRouter();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const postId = typeof id === 'string' ? parseInt(id, 10) : undefined;

  const fetchPostDetailsQueryFn = useCallback(async () => {
    if (!token) {
      throw new Error("Token de autenticação não disponível.");
    }
    if (postId === undefined) {
      throw new Error("ID do post não fornecido.");
    }
    const response = await authenticatedRequest<PostData>('GET', `/post/${postId}`);
    return response.data;
  }, [token, authenticatedRequest, postId]);

  const {
    data: postDetails,
    isLoading: isPostDetailsLoading,
    isFetching: isPostDetailsFetching,
    error: postDetailsError,
    refetch,
    isError: hasPostDetailsError,
  } = useQuery<PostData, AxiosError>({
    queryKey: ['postDetails', postId, token],
    queryFn: fetchPostDetailsQueryFn,
    enabled: !!token && postId !== undefined,
    staleTime: 1000 * 60 * 5,
    retry: 1,
    onError: (err) => {
      Alert.alert('Erro', `Não foi possível carregar os detalhes do post: ${err.message || 'Erro desconhecido'}`);
    },
  });

  const images = postDetails?.publicUrl ? [postDetails.publicUrl] : [];

  const goToPreviousImage = () => {
    setCurrentImageIndex((prevIndex) => Math.max(0, prevIndex - 1));
  };

  const goToNextImage = () => {
    setCurrentImageIndex((prevIndex) => Math.min(images.length - 1, prevIndex + 1));
  };

  const getStatusDisplay = (status: string | undefined) => {
    switch (status) {
      case 'PENDENTE': return { text: 'Pendente', icon: 'clock-time-four-outline', color: '#FFB800' };
      case 'EM_ANDAMENTO': return { text: 'Em Andamento', icon: 'refresh', color: '#3B73C4' };
      case 'CONCLUIDO': return { text: 'Concluído', icon: 'check-circle-outline', color: '#5cb85c' };
      case 'RECUSADO': return { text: 'Recusado', icon: 'close-circle-outline', color: '#D25A5A' };
      default: return { text: 'Desconhecido', icon: 'help-circle-outline', color: '#999' };
    }
  };

  if (isPostDetailsLoading || isPostDetailsFetching) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#291F75" />
        <Text style={styles.loadingText}>Carregando detalhes da solicitação...</Text>
      </View>
    );
  }

  if (hasPostDetailsError || !postDetails) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          {postDetailsError?.message || "Não foi possível carregar os detalhes da solicitação."}
        </Text>
        <TouchableOpacity onPress={() => refetch()}>
          <Text style={styles.retryButton}>Tentar Novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const statusInfo = getStatusDisplay(postDetails.status);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Feather name="arrow-left" size={20} color="#291F75" />
        <Text style={styles.backButtonText}>Voltar</Text>
      </TouchableOpacity>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.imageCarousel}>
          {images.length > 0 && images[currentImageIndex] ? (
            <>
              <Image source={{ uri: images[currentImageIndex] }} style={styles.mainImage} />
              {images.length > 1 && (
                <>
                  <TouchableOpacity style={styles.arrowButtonLeft} onPress={goToPreviousImage}>
                    <Feather name="chevron-left" size={24} color="#FFF" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.arrowButtonRight} onPress={goToNextImage}>
                    <Feather name="chevron-right" size={24} color="#FFF" />
                  </TouchableOpacity>
                </>
              )}
            </>
          ) : (
            <View style={styles.noImagePlaceholder}>
              <MaterialCommunityIcons name="image-off-outline" size={60} color="#999" />
            </View>
          )}
        </View>

        <Text style={styles.title}>{postDetails.title}</Text>

        <View style={styles.infoCard}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="text-box-outline" size={20} color="#291F75" style={styles.cardIcon} />
            <Text style={styles.cardTitle}>Descrição</Text>
          </View>
          <Text style={styles.cardText}>{postDetails.description} <Text style={styles.emoji}>👍</Text></Text>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.cardHeader}>
            <Feather name="user" size={20} color="#291F75" style={styles.cardIcon} />
            <Text style={styles.cardTitle}>Solicitante</Text>
          </View>
          <Text style={styles.cardText}>{postDetails.user.name}</Text>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.cardHeader}>
            <Feather name="map-pin" size={20} color="#291F75" style={styles.cardIcon} />
            <Text style={styles.cardTitle}>Local</Text>
          </View>
          <Text style={styles.cardText}>{postDetails.address}, {postDetails.neighborhood}</Text>
          
          {(postDetails.latitude !== null && postDetails.longitude !== null) ? (
            <View style={styles.mapContainer}>
              <MapView
                style={styles.map}
                initialRegion={{
                  latitude: postDetails.latitude,
                  longitude: postDetails.longitude,
                  latitudeDelta: 0.005,
                  longitudeDelta: 0.005,
                }}
                scrollEnabled={false}
                zoomEnabled={false}
                pitchEnabled={false}
                rotateEnabled={false}
              >
                <Marker
                  coordinate={{ latitude: postDetails.latitude, longitude: postDetails.longitude }}
                  title={postDetails.title}
                  description={postDetails.address}
                />
              </MapView>
            </View>
          ) : (
            <View style={styles.mapPlaceholder}>
              <MaterialCommunityIcons name="map-marker-off-outline" size={40} color="#999" />
              <Text style={styles.mapPlaceholderText}>Localização indisponível</Text>
            </View>
          )}
        </View>

        <View style={styles.statusContainer}>
          <View style={styles.statusHeader}>
            <MaterialCommunityIcons name="information-outline" size={20} color="#291F75" style={styles.statusIcon} />
            <Text style={styles.statusTitle}>Status</Text>
            <View style={styles.currentStatusBadge}>
                <Text style={styles.currentStatusText}>{statusInfo.text}</Text>
            </View>
          </View>
          <View style={styles.statusSteps}>
            <View style={styles.step}>
              <View style={[styles.stepCircle, styles.stepCircleActive]}>
                <Feather name="thumbs-up" size={16} color="#FFF" />
              </View>
              <Text style={[styles.stepText, styles.stepTextActive]}>Aceito</Text>
            </View>
            <View style={styles.stepLine}></View>
            <View style={styles.step}>
              <View style={[styles.stepCircle, postDetails.status === 'EM_ANDAMENTO' || postDetails.status === 'CONCLUIDO' ? styles.stepCircleActive : styles.stepCircleInactive]}>
                <MaterialCommunityIcons name="progress-check" size={16} color={postDetails.status === 'EM_ANDAMENTO' || postDetails.status === 'CONCLUIDO' ? "#FFF" : "#999"} />
              </View>
              <Text style={[styles.stepText, postDetails.status === 'EM_ANDAMENTO' || postDetails.status === 'CONCLUIDO' ? styles.stepTextActive : styles.stepTextInactive]}>Em andamento</Text>
            </View>
            <View style={styles.stepLine}></View>
            <View style={styles.step}>
              <View style={[styles.stepCircle, postDetails.status === 'CONCLUIDO' ? styles.stepCircleActive : styles.stepCircleInactive]}>
                <Feather name="check" size={16} color={postDetails.status === 'CONCLUIDO' ? "#FFF" : "#999"} />
              </View>
              <Text style={[styles.stepText, postDetails.status === 'CONCLUIDO' ? styles.stepTextActive : styles.stepTextInactive]}>Concluído</Text>
            </View>
          </View>
          <View style={styles.statusInfo}>
            <View style={[styles.radioOuter, { borderColor: statusInfo.color }]}>
              <View style={[styles.radioInner, { backgroundColor: statusInfo.color }]} />
            </View>
            <Text style={styles.statusInfoText}>Status atual: {statusInfo.text}</Text>
            {postDetails.updatedAt && (
              <Text style={styles.statusDate}>{new Date(postDetails.updatedAt).toLocaleDateString()} às {new Date(postDetails.updatedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</Text>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8F9',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    position: 'absolute',
    top: 40,
    left: 0,
    zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 8,
    margin: 10,
  },
  backButtonText: {
    marginLeft: 8,
    fontFamily: 'Nunito-SemiBold',
    fontSize: 16,
    color: '#291F75',
  },
  scrollViewContent: {
    paddingBottom: 20,
    alignItems: 'center',
  },
  imageCarousel: {
    width: '100%',
    height: 280,
    overflow: 'hidden',
    marginBottom: 0, // Ajuste para o título vir logo depois
    position: 'relative',
  },
  mainImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  noImagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#eee',
  },
  arrowButtonLeft: {
    position: 'absolute',
    top: '50%',
    left: 16,
    transform: [{ translateY: -12 }],
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowButtonRight: {
    position: 'absolute',
    top: '50%',
    right: 16,
    transform: [{ translateY: -12 }],
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontFamily: 'Nunito-Bold',
    fontSize: 28, // Aumentado para destaque
    color: '#291F75',
    marginBottom: 20,
    textAlign: 'center',
    paddingHorizontal: 20,
    marginTop: -40, // Sobrepõe a imagem para o efeito visual da imagem
    backgroundColor: 'transparent', // Garante que o texto não tenha fundo sólido aqui
    textShadowColor: 'rgba(0,0,0,0.2)', // Sombra para o texto
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12, // Mais arredondado
    padding: 20, // Aumentado
    marginBottom: 15, // Mais espaçamento entre os cards
    width: width * 0.9, // Largura mais responsiva e consistente
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 }, // Sombra mais proeminente
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12, // Mais espaçamento
    borderBottomWidth: 1, // Linha divisória
    borderBottomColor: '#EEE',
    paddingBottom: 10,
  },
  cardIcon: {
    marginRight: 10,
  },
  cardTitle: {
    fontFamily: 'Nunito-Bold',
    fontSize: 18, // Aumentado
    color: '#291F75',
  },
  cardText: {
    fontFamily: 'Nunito-Regular',
    fontSize: 16, // Aumentado
    color: '#555',
    lineHeight: 24,
    marginBottom: 5,
  },
  emoji: {
    fontSize: 16,
  },
  mapContainer: {
    width: '100%',
    height: 200, // Aumentar altura do mapa
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 15,
    borderWidth: 1, // Borda no mapa
    borderColor: '#DDD',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  mapPlaceholder: {
    width: '100%',
    height: 150,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    marginTop: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
  },
  mapPlaceholderText: {
    color: '#999',
    fontSize: 14,
    fontFamily: 'Nunito-Regular',
    marginTop: 5,
  },
  statusContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    width: width * 0.9,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    paddingBottom: 10,
  },
  statusIcon: {
    marginRight: 10,
  },
  statusTitle: {
    fontFamily: 'Nunito-Bold',
    fontSize: 18,
    color: '#291F75',
  },
  currentStatusBadge: {
    backgroundColor: '#EAEAEA',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 15,
    marginLeft: 'auto', // Empurra para a direita
  },
  currentStatusText: {
    fontFamily: 'Nunito-Bold',
    fontSize: 12,
    color: '#291F75',
  },
  statusSteps: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20, // Mais espaçamento
    paddingHorizontal: 5,
  },
  step: {
    alignItems: 'center',
    flex: 1, // Garante que ocupem espaço igual
  },
  stepCircle: {
    width: 35, // Um pouco maior
    height: 35,
    borderRadius: 17.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepCircleActive: {
    backgroundColor: '#5cb85c', // Verde
  },
  stepCircleInactive: {
    backgroundColor: '#ddd',
    borderColor: '#bbb',
    borderWidth: 1,
  },
  stepText: {
    marginTop: 6, // Mais espaçamento
    fontSize: 13,
    fontFamily: 'Nunito-Regular',
    textAlign: 'center',
  },
  stepTextActive: {
    color: '#333',
    fontFamily: 'Nunito-SemiBold',
  },
  stepTextInactive: {
    color: '#999',
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#ddd',
    marginHorizontal: -5,
  },
  statusInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F9F1', // Fundo sutil para a info de status
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
  },
  radioOuter: {
    width: 18, // Um pouco maior
    height: 18,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#5cb85c',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  radioInner: {
    width: 10, // Um pouco maior
    height: 10,
    borderRadius: 5,
    backgroundColor: '#5cb85c',
  },
  statusInfoText: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Nunito-SemiBold',
    color: '#291F75',
  },
  statusDate: {
    fontSize: 13,
    fontFamily: 'Nunito-Regular',
    color: '#777',
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  loadingText: {
    marginTop: 10,
    fontFamily: 'Nunito-SemiBold',
    fontSize: 16,
    color: '#291F75',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFF',
  },
  errorText: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 16,
    color: '#D25A5A',
    textAlign: 'center',
    marginBottom: 10,
  },
  retryButton: {
    marginTop: 10,
    fontFamily: 'Nunito-Bold',
    fontSize: 14,
    color: '#291F75',
    textDecorationLine: 'underline',
  },
});