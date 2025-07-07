import React, { useState, useContext, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Dimensions,
  Modal,
  Image,
  ScrollView,
  Alert,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { AuthContext } from '@/context/user-context';
import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';

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
  categoryId: number;
  userId: number;
  departmentId: number;
  createdAt: string;
  updatedAt: string;
  category: CategoryData;
  department: DepartmentData;
  user: UserData;
}

const { width, height } = Dimensions.get('window');

const CARD_MARGIN = 16;
const BANNER_WIDTH = width - CARD_MARGIN * 2;
const BANNER_HEIGHT = BANNER_WIDTH * 0.45;
const BANNERS = [0, 1, 2, 3];

const HomePage = () => {
  const router = useRouter();
  const { user, isLoading: isAuthLoading, error: authError, token, authenticatedRequest } = useContext(AuthContext);

  const [search, setSearch] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState<PostData | null>(null);
  const [bannerIndex, setBannerIndex] = useState(0);

  const fetchPostsQueryFn = useCallback(async () => {
    if (!token) {
      throw new Error("Token de autenticação não disponível. Redirecionando para o login.");
    }
    const response = await authenticatedRequest<PostData[]>('GET', '/posts');
    return response.data;
  }, [token, authenticatedRequest]);

  const {
    data: requestsData,
    isLoading: isPostsLoading,
    isFetching: isPostsFetching,
    error: postsError,
    refetch,
    isError: hasPostsError,
  } = useQuery<PostData[], AxiosError>({
    queryKey: ['posts', token],
    queryFn: fetchPostsQueryFn,
    enabled: !!token,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    retry: 1,
    onError: (err: any) => {
        Alert.alert('Erro ao carregar solicitações', err.message || 'Erro desconhecido ao carregar.');
    }
  });

  useEffect(() => {
    if (hasPostsError && postsError) {
      Alert.alert('Erro ao carregar solicitações', postsError.message || 'Erro desconhecido ao carregar.');
    }
  }, [hasPostsError, postsError]);

  useEffect(() => {
    if (!user && !isAuthLoading && !token) { 
      router.replace('/Login/page');
    }
    if (authError) {
      Alert.alert('Erro de Autenticação', authError);
    }
  }, [user, isAuthLoading, authError, router, token]);

  const filteredRequests = (requestsData || []).filter((item: PostData) =>
    item.title.toLowerCase().includes(search.toLowerCase()) ||
    item.description.toLowerCase().includes(search.toLowerCase()) ||
    item.category.name.toLowerCase().includes(search.toLowerCase()) ||
    item.user.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleDenounce = (item: PostData) => {
    setSelectedPost(item);
    setModalVisible(true);
  };

  const handleViewPostDetails = (postId: number) => {
    router.push(`/SolicitacaoItem/${postId}`);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return `${seconds}s atrás`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m atrás`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h atrás`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d atrás`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months} meses atrás`;
    const years = Math.floor(months / 12);
    return `${years} anos atrás`;
  };

  if (isAuthLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Autenticando...</Text>
      </View>
    );
  }

  if (!user && !isAuthLoading) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>Zelus</Text>
        <TouchableOpacity onPress={() => { }}>
          <Feather name="bell" size={24} color="#291F75" />
        </TouchableOpacity>
      </View>

      {user && (
        <Text style={styles.welcomeText}>Bem-vindo, {user.name}!</Text>
      )}

      <View style={styles.searchRow}>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Buscar solicitações..."
          placeholderTextColor="#918CBC"
          style={styles.searchInput}
        />
        <TouchableOpacity style={styles.searchBtn} onPress={() => { }}>
          <Feather name="search" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        snapToInterval={BANNER_WIDTH + CARD_MARGIN}
        decelerationRate="fast"
        onMomentumScrollEnd={e => {
          const idx = Math.round(
            e.nativeEvent.contentOffset.x / (BANNER_WIDTH + CARD_MARGIN)
          );
          setBannerIndex(idx);
        }}
        contentContainerStyle={styles.bannerScrollViewContent}
      >
        {BANNERS.map((_, i) => (
          <View key={i} style={styles.bannerCard}>
            <View style={styles.bannerContent}>
              <Text style={styles.bannerTitle}>
                Ajude a prefeitura{`\n`}a te Ajudar!
              </Text>
              <View style={styles.bannerSubtitleBox}>
                <Text style={styles.bannerSubtitle}>Exemplo de texto</Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.bannerDotsRow}>
        {BANNERS.map((_, i) => (
          <View
            key={i}
            style={[
              styles.bannerDot,
              i === bannerIndex && styles.bannerDotActive,
            ]}
          />
        ))}
      </View>

      <View style={styles.sectionRow}>
        <Text style={styles.sectionTitle}>Últimas solicitações:</Text>
        <TouchableOpacity style={styles.filterButton} onPress={() => { }}>
          <MaterialIcons name="filter-list" size={18} color="#FFF" />
          <Text style={styles.filterButtonText}>Filtrar</Text>
        </TouchableOpacity>
      </View>

      {isPostsLoading && !isPostsFetching ? (
        <View style={styles.loadingRequestsContainer}>
          <Text style={styles.loadingText}>Carregando solicitações...</Text>
        </View>
      ) : hasPostsError ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{postsError?.message || 'Erro desconhecido'}</Text>
          <TouchableOpacity onPress={() => refetch()}>
            <Text style={styles.retryButton}>Tentar Novamente</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList<PostData>
          data={filteredRequests}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }: { item: PostData }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => handleViewPostDetails(item.id)}
              activeOpacity={0.8}
            >
              <View style={styles.tagBadge}>
                <Text style={styles.tagText}>{item.category.name}</Text>
              </View>
              <View style={styles.cardHeader}>
                <Feather name="user" size={16} color="#291F75" />
                <Text style={styles.cardUser}>
                  {item.user.name} • {formatTimeAgo(item.createdAt)}
                </Text>
              </View>
              <View style={styles.cardContent}>
                {item.publicUrl ? (
                  <Image source={{ uri: item.publicUrl }} style={styles.cardImage} />
                ) : (
                  <MaterialCommunityIcons name="image-off" size={48} color="#CCCCCC" style={styles.cardImagePlaceholder} />
                )}
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
                </View>
              </View>
              <View style={styles.cardFooter}>
                <View style={styles.addressRow}>
                  <Feather name="map-pin" size={14} color="#291F75" />
                  <Text style={styles.cardAddress}>{item.address}</Text>
                </View>
                <TouchableOpacity style={styles.reportButton} onPress={(e) => { e.stopPropagation(); handleDenounce(item); }}>
                  <Feather name="flag" size={14} color="#D25A5A" style={{ marginRight: 4 }} />
                  <Text style={styles.reportText}>Denunciar</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.flatListContent}
          ListEmptyComponent={() => (
            <View style={styles.emptyListContainer}>
              <Text style={styles.emptyListText}>Nenhuma solicitação encontrada.</Text>
            </View>
          )}
          refreshControl={
            <RefreshControl
              refreshing={isPostsFetching}
              onRefresh={() => refetch()}
              colors={['#291F75']}
              tintColor={'#291F75'}
            />
          }
        />
      )}

      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Denunciar</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Feather name="x" size={20} color="#291F75" />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalText}>
              Você deseja denunciar o Usuário{' '}
              <Text style={styles.modalBold}>{selectedPost?.user.name}</Text> pelo post{' '}
              <Text style={styles.modalBold}>"{selectedPost?.title}"</Text>?
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setModalVisible(false)}>
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirm} onPress={() => { }}>
                <Text style={styles.modalConfirmText}>Denunciar Post</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF'
  },
  loadingRequestsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 16,
    color: '#291F75'
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20
  },
  errorText: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 16,
    color: '#D25A5A',
    textAlign: 'center',
    marginBottom: 10
  },
  retryButton: {
    fontFamily: 'Nunito-Bold',
    fontSize: 14,
    color: '#291F75',
    textDecorationLine: 'underline'
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingBottom: 16,
  },
  headerTitle: {
    fontFamily: 'Nunito-Bold',
    fontSize: 28,
    color: '#291F75'
  },
  welcomeText: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 16,
    color: '#291F75',
    paddingHorizontal: 16,
    marginBottom: 16
  },
  searchRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 20
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#291F75',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
    fontSize: 16,
    color: '#291F75',
    marginRight: 8,
  },
  searchBtn: {
    backgroundColor: '#291F75',
    paddingHorizontal: 16,
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  bannerScrollViewContent: {
    paddingHorizontal: CARD_MARGIN,
    paddingVertical: 10,
  },
  bannerCard: {
    width: BANNER_WIDTH,
    height: BANNER_HEIGHT,
    backgroundColor: '#EFAE0C',
    borderRadius: 12,
    padding: 20,
    marginRight: CARD_MARGIN,
    justifyContent: 'center',
  },
  bannerContent: {
    flex: 1,
    justifyContent: 'center'
  },
  bannerTitle: {
    fontFamily: 'Nunito-Bold',
    fontSize: 22,
    color: '#291F75',
    lineHeight: 28
  },
  bannerSubtitleBox: {
    backgroundColor: '#FFF',
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    marginTop: 12
  },
  bannerSubtitle: {
    fontFamily: 'Nunito-Bold',
    fontSize: 16,
    color: '#291F75'
  },
  bannerDotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: -100,
    marginBottom: 20
  },
  bannerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#AD8B00',
    marginHorizontal: 5
  },
  bannerDotActive: {
    backgroundColor: '#291F75'
  },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16
  },
  sectionTitle: {
    fontFamily: 'Nunito-Bold',
    fontSize: 18,
    color: '#291F75'
  },
  filterButton: {
    flexDirection: 'row',
    backgroundColor: '#291F75',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center'
  },
  filterButtonText: {
    fontFamily: 'Nunito-Bold',
    fontSize: 13,
    color: '#FFF',
    marginLeft: 6
  },
  flatListContent: {
    paddingBottom: height * 0.15,
    paddingTop: 8,
  },
  card: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tagBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#EAEAEA',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#918CBC'
  },
  tagText: {
    fontFamily: 'Nunito-Bold',
    fontSize: 11,
    color: '#291F75'
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10
  },
  cardUser: {
    fontFamily: 'Nunito-Bold',
    fontSize: 13,
    color: '#291F75',
    marginLeft: 8
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12
  },
  cardImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
    marginRight: 16,
    resizeMode: 'cover',
  },
  cardImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 10,
    marginRight: 16,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center'
  },
  cardTitle: {
    fontFamily: 'Nunito-Bold',
    fontSize: 16,
    color: '#291F75',
    marginBottom: 4
  },
  cardDesc: {
    fontSize: 13,
    color: '#584CAF',
    marginBottom: 8
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  cardAddress: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 13,
    color: '#291F75',
    marginLeft: 6
  },
  reportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D25A5A',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  reportText: {
    fontFamily: 'Nunito-Bold',
    fontSize: 13,
    color: '#D25A5A'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalContent: {
    width: width * 0.9,
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 20
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  modalTitle: {
    fontFamily: 'Nunito-Bold',
    fontSize: 18,
    color: '#291F75'
  },
  modalText: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 15,
    color: '#291F75',
    marginBottom: 20
  },
  modalBold: {
    fontWeight: 'bold'
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  modalCancel: {
    flex: 1,
    marginRight: 10,
    backgroundColor: '#EFEFEF',
    padding: 12,
    borderRadius: 10,
  },
  modalCancelText: {
    textAlign: 'center',
    fontFamily: 'Nunito-Bold',
    color: '#584CAF'
  },
  modalConfirm: {
    flex: 1,
    marginLeft: 10,
    backgroundColor: '#D25A5A',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center'
  },
  modalConfirmText: {
    fontFamily: 'Nunito-Bold',
    fontSize: 15,
    color: '#FFF'
  },
  emptyListContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyListText: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 16,
    color: '#918CBC'
  },
});
export default HomePage;