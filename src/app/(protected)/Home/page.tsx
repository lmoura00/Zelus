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
  ActivityIndicator,
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { AuthContext } from '@/context/user-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import Constants from 'expo-constants';
import DropDownPicker from 'react-native-dropdown-picker';
import SolicitacaoItem from '@/component/SolicitacaoItem';
import { UserData, CategoryData, DepartmentData, PostData, CommentData, BannerData } from '@/types/app';

const { width, height } = Dimensions.get('window');

const CARD_MARGIN = 16;
const BANNER_WIDTH = width - CARD_MARGIN * 2;
const BANNER_HEIGHT = BANNER_WIDTH * 0.45;

const HomePage = () => {
  const router = useRouter();
  const { user, isLoading: isAuthLoading, error: authError, token, authenticatedRequest } = useContext(AuthContext);
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState<PostData | null>(null);
  const [bannerIndex, setBannerIndex] = useState(0);

  const [openStatusFilter, setOpenStatusFilter] = useState(false);
  const [statusFilter, setStatusFilter] = useState('TODOS');
  const [statusFilterItems, setStatusFilterItems] = useState([
    { label: 'Todos (Andamento/Concluídas)', value: 'TODOS' },
    { label: 'Em Andamento', value: 'EM ANDAMENTO' },
    { label: 'Concluídas', value: 'CONCLUIDO' },
  ]);

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

  const fetchBannersQueryFn = useCallback(async () => {
    if (!token) throw new Error("Token de autenticação não disponível.");
    const response = await authenticatedRequest<BannerData[]>('GET', '/banners');
    return response.data;
  }, [token, authenticatedRequest]);

  const {
    data: bannersData,
    isLoading: isBannersLoading,
    isError: isBannersError,
    error: bannersError,
    refetch: refetchBanners,
  } = useQuery<BannerData[], AxiosError>({
    queryKey: ['banners', token],
    queryFn: fetchBannersQueryFn,
    enabled: !!token,
    staleTime: Infinity,
    onError: (err) => {
      Alert.alert('Erro', `Não foi possível carregar banners: ${err.message || 'Erro desconhecido'}`);
    },
  });

  const denouncePostMutation = useMutation<any, AxiosError, number>({
    mutationFn: async (postIdToDenounce: number) => {
      if (!token) throw new Error("Token de autenticação não disponível.");
      const response = await authenticatedRequest('PATCH', `/post/complait/${postIdToDenounce}`);
      return response.data;
    },
    onSuccess: () => {
      Alert.alert("Sucesso", "Solicitação denunciada com sucesso!");
      setModalVisible(false);
      queryClient.invalidateQueries(['posts']);
    },
    onError: (error) => {
      Alert.alert("Erro", `Falha ao denunciar solicitação: ${error.response?.data?.message || error.message}`);
    },
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

  const filteredRequests = (requestsData || []).filter((item: PostData) => {
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase()) ||
      item.category.name.toLowerCase().includes(search.toLowerCase()) ||
      item.user.name.toLowerCase().includes(search.toLowerCase());

    const isAllowedBaseStatus = item.status === 'EM ANDAMENTO' || item.status === 'CONCLUIDO';
    
    let matchesStatusFilter = true;
    if (statusFilter !== 'TODOS') {
      matchesStatusFilter = item.status === statusFilter;
    }

    return matchesSearch && isAllowedBaseStatus && matchesStatusFilter;
  });

  const handleDenounce = (item: PostData) => {
    setSelectedPost(item);
    setModalVisible(true);
  };

  const handleDenounceConfirm = useCallback(() => {
    if (selectedPost?.id) {
      denouncePostMutation.mutate(selectedPost.id);
    } else {
      Alert.alert("Erro", "ID da solicitação não disponível para denúncia.");
    }
  }, [selectedPost, denouncePostMutation]);

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
      <View style={styles.fixedHeaderArea}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Zelus</Text>
          <TouchableOpacity style={styles.headerIcon}>
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
          <TouchableOpacity style={styles.searchBtn}>
            <Feather name="search" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          snapToInterval={BANNER_WIDTH + CARD_MARGIN}
          decelerationRate="fast"
          onMomentumScrollEnd={e => {
            if (bannersData && bannersData.length > 0) {
              const idx = Math.round(
                e.nativeEvent.contentOffset.x / (BANNER_WIDTH + CARD_MARGIN)
              );
              setBannerIndex(idx);
            }
          }}
          contentContainerStyle={styles.bannerScrollViewContent}
        >
          {isBannersLoading ? (
            <View style={[styles.bannerCard, styles.bannerLoadingOrError]}>
              <ActivityIndicator size="large" color="#291F75" />
            </View>
          ) : isBannersError || !bannersData || bannersData.length === 0 ? (
            <View style={[styles.bannerCard, styles.bannerLoadingOrError, { backgroundColor: '#F0F0F0' }]}>
              <Text style={styles.bannerLoadingErrorText}>Banners indisponíveis</Text>
            </View>
          ) : (
            bannersData.map((banner, i) => (
              <TouchableOpacity
                key={banner.id}
                style={styles.bannerCard}
                onPress={() => Linking.openURL(banner.linkTo)}
                activeOpacity={0.8}
              >
                <Image source={{ uri: banner.imageUrl }} style={styles.bannerImage} />
              </TouchableOpacity>
            ))
          )}
        </ScrollView>

        <View style={styles.bannerDotsRow}>
          {(bannersData || []).map((_, i) => (
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
          <View style={styles.filterDropdownWrapper}>
            <DropDownPicker
              listMode="SCROLLVIEW"
              open={openStatusFilter}
              value={statusFilter}
              items={statusFilterItems}
              setOpen={setOpenStatusFilter}
              setValue={setStatusFilter}
              setItems={setStatusFilterItems}
              placeholder="Filtrar por status"
              style={styles.dropdown}
              dropDownContainerStyle={styles.dropdownContainer}
              textStyle={styles.dropdownText}
              labelStyle={styles.dropdownLabel}
              tickIconStyle={styles.dropdownTickIcon}
              arrowIconStyle={styles.dropdownArrowIcon}
              zIndex={3000}
              zIndexInverse={1000}
            />
          </View>
        </View>
      </View>

      {isPostsLoading && !isPostsFetching ? (
        <View style={styles.loadingRequestsContainer}>
          <ActivityIndicator size="large" color="#291F75" />
          <Text style={styles.loadingText}>Carregando solicitações...</Text>
        </View>
      ) : hasPostsError ? (
        <View style={styles.errorFullContainer}>
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
            <SolicitacaoItem
              item={item}
              onPress={handleViewPostDetails}
              onDenounce={handleDenounce}
              formatTimeAgo={formatTimeAgo}
            />
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
              Você deseja denunciar o Usuário{" "}
              <Text style={styles.modalBold}>{selectedPost?.user.name}</Text> pelo post{" "}
              <Text style={styles.modalBold}>"{selectedPost?.title}"</Text>?
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setModalVisible(false)}>
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirm}
                onPress={handleDenounceConfirm}
                disabled={denouncePostMutation.isPending}
              >
                {denouncePostMutation.isPending ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.modalConfirmText}>Denunciar Post</Text>
                )}
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
    backgroundColor: '#F7F8F9',
    paddingTop: Constants.statusBarHeight,
  },
  fixedHeaderArea: {
    backgroundColor: '#F7F8F9',
    paddingBottom: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7F8F9'
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
  errorFullContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#F7F8F9',
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontFamily: 'Nunito-Bold',
    fontSize: 24,
    color: '#291F75',
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E8E1FA',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  welcomeText: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 16,
    color: '#291F75',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  searchRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    height: 50,
    borderRadius: 10,
    backgroundColor: '#E8E1FA',
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#291F75',
    borderWidth: 1,
    borderColor: '#D8D0ED',
    marginRight: 10,
  },
  searchBtn: {
    backgroundColor: '#291F75',
    paddingHorizontal: 18,
    justifyContent: 'center',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  bannerScrollViewContent: {
    paddingHorizontal: CARD_MARGIN,
    paddingVertical: 10,
  },
  bannerCard: {
    width: BANNER_WIDTH ,
    height: BANNER_HEIGHT,
    backgroundColor: '#EFAE0C',
    borderRadius: 12,
    marginRight: CARD_MARGIN,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  bannerLoadingOrError: {
    backgroundColor: '#E8E1FA',
  },
  bannerLoadingErrorText: {
    fontFamily: 'Nunito-SemiBold',
    color: '#999',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  bannerDotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: -40,
    marginBottom: 20,
  },
  bannerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#AD8B00',
    marginHorizontal: 5,
  },
  bannerDotActive: {
    backgroundColor: '#291F75',
  },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
    marginTop: 20,
    zIndex: 2000,
  },
  sectionTitle: {
    fontFamily: 'Nunito-Bold',
    fontSize: 18,
    color: '#291F75',
  },
  filterDropdownWrapper: {
    width: 150,
  },
  dropdown: {
    borderColor: '#D8D0ED',
    borderRadius: 10,
    backgroundColor: '#E8E1FA',
    minHeight: 40,
  },
  dropdownContainer: {
    borderColor: '#D8D0ED',
    borderRadius: 10,
    backgroundColor: '#F8F7FF',
    maxHeight: 200,
  },
  dropdownText: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 14,
    color: '#291F75',
  },
  dropdownLabel: {
    fontFamily: 'Nunito-SemiBold',
    color: '#291F75',
  },
  dropdownTickIcon: {
    width: 18,
    height: 18,
  },
  dropdownArrowIcon: {
    width: 18,
    height: 18,
  },
  flatListContent: {
    paddingBottom: height * 0.15,
    paddingTop: 8,
  },
  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
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
    borderColor: '#918CBC',
  },
  tagText: {
    fontFamily: 'Nunito-Bold',
    fontSize: 11,
    color: '#291F75',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardUser: {
    fontFamily: 'Nunito-Bold',
    fontSize: 13,
    color: '#291F75',
    marginLeft: 8,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
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
    alignItems: 'center',
  },
  cardTitle: {
    fontFamily: 'Nunito-Bold',
    fontSize: 16,
    color: '#291F75',
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 13,
    color: '#584CAF',
    marginBottom: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardAddress: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 13,
    color: '#291F75',
    marginLeft: 6,
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
    color: '#D25A5A',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width * 0.9,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontFamily: 'Nunito-Bold',
    fontSize: 18,
    color: '#291F75',
  },
  modalText: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 15,
    color: '#291F75',
    marginBottom: 20,
  },
  modalBold: {
    fontWeight: 'bold',
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
    color: '#584CAF',
  },
  modalConfirm: {
    flex: 1,
    marginLeft: 10,
    backgroundColor: '#D25A5A',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalConfirmText: {
    fontFamily: 'Nunito-Bold',
    fontSize: 15,
    color: '#FFF',
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyListText: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 16,
    color: '#918CBC',
  },
});

export default HomePage;