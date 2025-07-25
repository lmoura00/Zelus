import React, { useState, useContext, useEffect, useCallback } from "react";
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
  ImageBackground,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather, Ionicons } from "@expo/vector-icons"; // ADDED Ionicons
import { AuthContext } from "@/context/user-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import Constants from "expo-constants";
import DropDownPicker from "react-native-dropdown-picker";
import SolicitacaoItem from "@/component/SolicitacaoItem";
import { PostData, BannerData } from "@/types/app";

import backgroundBannerImage from "@/assets/Component 1.png";

const { width, height } = Dimensions.get("window");

const CARD_MARGIN = 16;
const BANNER_WIDTH = width - CARD_MARGIN * 2;
const BANNER_HEIGHT = BANNER_WIDTH * 0.45;

const HomePage = () => {
  const router = useRouter();
  const {
    user,
    isLoading: isAuthLoading,
    error: authError,
    token,
    authenticatedRequest,
  } = useContext(AuthContext);
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState<PostData | null>(null);
  const [bannerIndex, setBannerIndex] = useState(0);

  const [openStatusFilter, setOpenStatusFilter] = useState(false);
  const [statusFilter, setStatusFilter] = useState("TODOS");
  const [statusFilterItems, setStatusFilterItems] = useState([
    { label: "Todos (Andamento/Concluídas)", value: "TODOS" },
    { label: "Em Andamento", value: "EM ANDAMENTO" },
    { label: "Resolvido", value: "RESOLVIDO" },
  ]);

  const fetchPostsQueryFn = useCallback(async () => {
    if (!token) {
      throw new Error(
        "Token de autenticação não disponível. Redirecionando para o login."
      );
    }
    const response = await authenticatedRequest<PostData[]>("GET", "/posts");
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
    queryKey: ["posts", token],
    queryFn: fetchPostsQueryFn,
    enabled: !!token,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    retry: 1,
    onError: (err) => {
      Alert.alert(
        "Erro ao carregar solicitações",
        err.message || "Erro desconhecido ao carregar."
      );
    },
  });

  const fetchBannersQueryFn = useCallback(async () => {
    if (!token) throw new Error("Token de autenticação não disponível.");
    const response = await authenticatedRequest<BannerData[]>(
      "GET",
      "/banners"
    );
    return response.data;
  }, [token, authenticatedRequest]);

  const {
    data: bannersData,
    isLoading: isBannersLoading,
    isError: isBannersError,
    refetch: refetchBanners,
  } = useQuery<BannerData[], AxiosError>({
    queryKey: ["banners", token],
    queryFn: fetchBannersQueryFn,
    enabled: !!token,
    staleTime: Infinity,
    onError: (err) => {
      Alert.alert(
        "Erro",
        `Não foi possível carregar banners: ${
          err.message || "Erro desconhecido"
        }`
      );
    },
  });

  const denouncePostMutation = useMutation<any, AxiosError, number>({
    mutationFn: async (postIdToDenounce) => {
      if (!token) throw new Error("Token de autenticação não disponível.");
      const response = await authenticatedRequest(
        "PATCH",
        `/post/complait/${postIdToDenounce}`
      );
      return response.data;
    },
    onSuccess: () => {
      Alert.alert("Sucesso", "Solicitação denunciada com sucesso!");
      setModalVisible(false);
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: (error) => {
      const apiError = error.response?.data as { message?: string };
      Alert.alert(
        "Erro",
        `Falha ao denunciar solicitação: ${
          apiError?.message || error.message
        }`
      );
    },
  });

  useEffect(() => {
    if (hasPostsError && postsError) {
      Alert.alert(
        "Erro ao carregar solicitações",
        postsError.message || "Erro desconhecido ao carregar."
      );
    }
  }, [hasPostsError, postsError]);

  useEffect(() => {
    if (!user && !isAuthLoading && !token) {
      router.replace("/Login/page");
    }
    if (authError) {
      Alert.alert("Erro de Autenticação", authError.message);
    }
  }, [user, isAuthLoading, authError, router, token]);

  const filteredRequests = (requestsData || []).filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase()) ||
      item.category.name.toLowerCase().includes(search.toLowerCase()) ||
      item.user.name.toLowerCase().includes(search.toLowerCase());

    const isAllowedBaseStatus =
      item.status === "EM ANDAMENTO" || item.status === "RESOLVIDO";

    let matchesStatusFilter = true;
    if (statusFilter !== "TODOS") {
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

  const renderListHeader = () => (
    <View style={styles.headerContainer}>
      {/* UPDATED HEADER STRUCTURE */}
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <View style={styles.logoContainer}>
            <Image
              source={require("@/assets/images/logo.png")}
              style={styles.logoImage}
            />
          </View>
          <Text style={styles.headerTitle}>Zelus</Text>
        </View>
        <TouchableOpacity
          style={styles.headerIcon}
          onPress={() => router.push("/(protected)/Notification/page")}
        >
          {/* UPDATED ICON */}
          <Ionicons name="notifications-outline" size={24} color="#291F75" />
        </TouchableOpacity>
      </View>

      {user && <Text style={styles.welcomeText}>Bem-vindo, {user.name}!</Text>}

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
        onMomentumScrollEnd={(e) => {
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
          <ImageBackground
            source={backgroundBannerImage}
            style={styles.bannerCard}
            imageStyle={styles.bannerImageBackgroundStyle}
            resizeMode="cover"
          >
            <ActivityIndicator size="large" color="#291F75" />
          </ImageBackground>
        ) : isBannersError || !bannersData || bannersData.length === 0 ? (
          <ImageBackground
            source={backgroundBannerImage}
            style={styles.bannerCard}
            imageStyle={styles.bannerImageBackgroundStyle}
            resizeMode="cover"
          >
            <Text style={styles.fallbackBannerText}>Zelus</Text>
          </ImageBackground>
        ) : (
          bannersData.map((banner) => (
            <ImageBackground
              key={banner.id}
              source={backgroundBannerImage}
              style={styles.bannerCard}
              imageStyle={styles.bannerImageBackgroundStyle}
              resizeMode="cover"
            >
              <TouchableOpacity
                style={styles.bannerImageOverlay}
                onPress={() => Linking.openURL(banner.linkTo)}
                activeOpacity={0.8}
              >
                <Image
                  source={{ uri: banner.imageUrl }}
                  style={styles.bannerImage}
                />
              </TouchableOpacity>
            </ImageBackground>
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
  );

  return (
    <View style={styles.container}>
      {isPostsLoading && !requestsData ? (
        <View style={styles.loadingRequestsContainer}>
          <ActivityIndicator size="large" color="#291F75" />
          <Text style={styles.loadingText}>Carregando solicitações...</Text>
        </View>
      ) : hasPostsError ? (
        <View style={styles.errorFullContainer}>
          <Text style={styles.errorText}>
            {postsError?.message || "Erro desconhecido"}
          </Text>
          <TouchableOpacity onPress={() => refetch()}>
            <Text style={styles.retryButton}>Tentar Novamente</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredRequests}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <SolicitacaoItem
              item={item}
              onPress={handleViewPostDetails}
              onDenounce={handleDenounce}
              formatTimeAgo={formatTimeAgo}
            />
          )}
          contentContainerStyle={styles.flatListContent}
          ListHeaderComponent={renderListHeader}
          ListEmptyComponent={() => (
            <View style={styles.emptyListContainer}>
              <Text style={styles.emptyListText}>
                Nenhuma solicitação encontrada.
              </Text>
            </View>
          )}
          refreshControl={
            <RefreshControl
              refreshing={isPostsFetching}
              onRefresh={() => {
                refetch();
                refetchBanners();
              }}
              colors={["#291F75"]}
              tintColor={"#291F75"}
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
              <Text style={styles.modalBold}>{selectedPost?.user?.name}</Text>{" "}
              pelo post{" "}
              <Text style={styles.modalBold}>"{selectedPost?.title}"</Text>?
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancel}
                onPress={() => setModalVisible(false)}
              >
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
    backgroundColor: "#F7F8F9",
    paddingTop: Constants.statusBarHeight,
  },
  headerContainer: {
    backgroundColor: "#F7F8F9",
    paddingBottom: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F7F8F9",
  },
  loadingRequestsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    fontFamily: "Nunito-SemiBold",
    fontSize: 16,
    color: "#291F75",
    marginTop: 10,
  },
  errorFullContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    backgroundColor: "#F7F8F9",
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
  // RENAMED from headerRow and standardized
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  // NEW/COPIED Styles for consistency
  headerTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  logoContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#E8E1FA",
    justifyContent: "center",
    alignItems: "center",
  },
  logoImage: {
    width: "70%",
    height: "70%",
    resizeMode: "contain",
  },
  headerTitle: {
    fontFamily: "Nunito-Bold",
    fontSize: 24,
    color: "#291F75",
  },
  // Standardized Style
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
  welcomeText: {
    fontFamily: "Nunito-SemiBold",
    fontSize: 16,
    color: "#291F75",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  searchRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    height: 50,
    borderRadius: 10,
    backgroundColor: "#E8E1FA",
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#291F75",
    borderWidth: 1,
    borderColor: "#D8D0ED",
    marginRight: 10,
  },
  searchBtn: {
    backgroundColor: "#291F75",
    paddingHorizontal: 18,
    justifyContent: "center",
    borderRadius: 10,
    shadowColor: "#000",
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
    width: BANNER_WIDTH,
    height: BANNER_HEIGHT,
    borderRadius: 12,
    marginRight: CARD_MARGIN,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    backgroundColor: "transparent",
  },
  bannerImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  fallbackBannerText: {
    fontFamily: "Nunito-Bold",
    fontSize: 40,
    color: "#FFF",
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  bannerImageBackgroundStyle: {
    borderRadius: 12,
    resizeMode: "cover",
  },
  bannerImageOverlay: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  bannerDotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  bannerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#AD8B00",
    marginHorizontal: 5,
  },
  bannerDotActive: {
    backgroundColor: "#291F75",
  },
  sectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 16,
    zIndex: 2000,
  },
  sectionTitle: {
    fontFamily: "Nunito-Bold",
    fontSize: 18,
    color: "#291F75",
  },
  filterDropdownWrapper: {
    width: 150,
  },
  dropdown: {
    borderColor: "#D8D0ED",
    borderRadius: 10,
    backgroundColor: "#E8E1FA",
    minHeight: 40,
  },
  dropdownContainer: {
    borderColor: "#D8D0ED",
    borderRadius: 10,
    backgroundColor: "#F8F7FF",
    maxHeight: 200,
  },
  dropdownText: {
    fontFamily: "Nunito-SemiBold",
    fontSize: 14,
    color: "#291F75",
  },
  dropdownLabel: {
    fontFamily: "Nunito-SemiBold",
    color: "#291F75",
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: width * 0.9,
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontFamily: "Nunito-Bold",
    fontSize: 18,
    color: "#291F75",
  },
  modalText: {
    fontFamily: "Nunito-SemiBold",
    fontSize: 15,
    color: "#291F75",
    marginBottom: 20,
    lineHeight: 22,
  },
  modalBold: {
    fontWeight: "bold",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  modalCancel: {
    flex: 1,
    marginRight: 10,
    backgroundColor: "#EFEFEF",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  modalCancelText: {
    fontFamily: "Nunito-Bold",
    color: "#584CAF",
  },
  modalConfirm: {
    flex: 1,
    marginLeft: 10,
    backgroundColor: "#D25A5A",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  modalConfirmText: {
    fontFamily: "Nunito-Bold",
    fontSize: 15,
    color: "#FFF",
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyListText: {
    fontFamily: "Nunito-SemiBold",
    fontSize: 16,
    color: "#918CBC",
  },
  
});
export default HomePage;