import React, { useState, useContext, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import SolicitacaoItem from "@/component/SolicitacaoItem";
import { useRouter } from "expo-router";
import { AuthContext } from "@/context/user-context";
import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";

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
  user?: UserDataWithoutPosts;
  department?: DepartmentData;
}

interface UserDataWithoutPosts {
  id: number;
  name: string;
  email: string;
  cpf: string;
  createdAt: string;
  updatedAt: string;
  restores: any[];
}

interface UserDataResponse extends UserDataWithoutPosts {
  posts: Omit<PostData, "user" | "department">[];
}

const windowWidth = Dimensions.get("window").width;

const SolicitacoesPage = () => {
  const router = useRouter();
  const {
    user,
    token,
    authenticatedRequest,
    isLoading: isAuthLoading,
    error: authError,
  } = useContext(AuthContext);

  const [search, setSearch] = useState("");
  const [filterDepartmentId, setFilterDepartmentId] = useState<number | null>(
    null
  );
  const [showFilter, setShowFilter] = useState(false);

  const formatTimeAgo = useCallback((dateString: string) => {
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
  }, []);

  const handleViewPostDetails = useCallback(
    (postId: number) => {
      router.push(`/SolicitacaoItem/${postId}`);
    },
    [router]
  );

  const handleDenounce = useCallback((item: PostData) => {
    Alert.alert("Denunciar", `Deseja denunciar a solicitação "${item.title}"?`);
  }, []);

  const fetchDepartmentsQueryFn = useCallback(async () => {
    if (!token) throw new Error("Token para departamentos não disponível.");
    const response = await authenticatedRequest<DepartmentData[]>(
      "GET",
      "/departments"
    );
    return response.data;
  }, [token, authenticatedRequest]);

  const {
    data: departments,
    isLoading: isDepartmentsLoading,
    isError: isDepartmentsError,
    refetch: refetchDepartments,
  } = useQuery<DepartmentData[], AxiosError>({
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

  const fetchUserPostsQueryFn = useCallback(async () => {
    if (!token) throw new Error("Token de autenticação não disponível.");
    if (!user?.id) throw new Error("ID do usuário não disponível.");
    if (!departments) throw new Error("Dados de departamento não carregados.");

    const response = await authenticatedRequest<UserDataResponse>(
      "GET",
      `/user/${user.id}`
    );

    const postUser: UserDataWithoutPosts = {
      id: response.data.id,
      name: response.data.name,
      email: response.data.email,
      cpf: response.data.cpf,
      createdAt: response.data.createdAt,
      updatedAt: response.data.updatedAt,
      restores: response.data.restores,
    };

    const postsWithDetails: PostData[] = response.data.posts.map((post) => {
      const fullDepartment = departments.find(
        (dep) => dep.id === post.departmentId
      );

      return {
        ...post,
        department: fullDepartment || {
          id: post.departmentId,
          name: "Desconhecido",
          createdAt: "",
          updatedAt: "",
          admins: [],
        },
        user: postUser,
      };
    });

    return postsWithDetails;
  }, [token, user?.id, authenticatedRequest, departments]);

  const {
    data: userPosts,
    isLoading: isUserPostsLoading,
    isFetching: isUserPostsFetching,
    error: userPostsError,
    refetch: refetchUserPosts,
    isError: hasUserPostsError,
  } = useQuery<PostData[], AxiosError>({
    queryKey: ["userPosts", user?.id, token, departments],
    queryFn: fetchUserPostsQueryFn,
    enabled: !!token && !!user?.id && !!departments,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    retry: 1,
    onError: (err) => {
      Alert.alert(
        "Erro ao carregar minhas solicitações",
        err.message || "Erro desconhecido ao carregar."
      );
    },
  });

  useEffect(() => {
    if (!user && !isAuthLoading && !token) {
      router.replace("/Login/page");
    }
    if (authError) {
      Alert.alert("Erro de Autenticação", authError);
    }
  }, [user, isAuthLoading, authError, router, token]);

  const filteredUserPosts = (userPosts || []).filter((item: PostData) => {
    const lowerCaseSearch = search.toLowerCase();
    const matchesSearch =
      item.title.toLowerCase().includes(lowerCaseSearch) ||
      item.description.toLowerCase().includes(lowerCaseSearch) ||
      item.user?.name?.toLowerCase().includes(lowerCaseSearch);

    const matchesDepartment =
      filterDepartmentId === null || item.departmentId === filterDepartmentId;

    return matchesSearch && matchesDepartment;
  });

  const handleCreateNewRequest = useCallback(() => {
    router.push("/AddRequest/page");
  }, [router]);

  if (isAuthLoading || isDepartmentsLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#291F75" />
        <Text style={styles.loadingText}>Carregando dados iniciais...</Text>
      </View>
    );
  }

  if (!user && !isAuthLoading) {
    return null;
  }

  if (isDepartmentsError) {
    return (
      <View style={styles.errorListContainer}>
        <Text style={styles.errorText}>
          Erro ao carregar dados essenciais (departamentos).
        </Text>
        <TouchableOpacity
          onPress={() => {
            refetchDepartments();
          }}
        >
          <Text style={styles.retryButton}>Tentar Novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header estilizado */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Minhas Solicitações</Text>
        <TouchableOpacity
          style={styles.headerIcon}
          onPress={() => router.push("/(protected)/Notification/page")}
        >
          <Ionicons name="notifications-outline" size={26} color="#291f75" />
        </TouchableOpacity>
      </View>

      {/* Barra de busca com sombra */}
      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Buscar minhas solicitações..."
          placeholderTextColor="#918CBC"
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
        />
        <TouchableOpacity style={styles.searchButton}>
          <Feather name="search" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Filtro e título */}
      <View style={styles.filterContainer}>
        <Text style={styles.sectionTitle}>Últimas solicitações</Text>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilter((prev) => !prev)}
        >
          <MaterialCommunityIcons
            name="filter-outline"
            size={22}
            color="#FFFFFF"
          />
          <Text style={styles.filterText}>Filtrar</Text>
        </TouchableOpacity>
      </View>

      {/* Filtro de departamentos com efeito cartão */}
      {showFilter && (
        <View style={styles.filterCard}>
          <TouchableOpacity
            style={[
              styles.filterOption,
              filterDepartmentId === null && styles.filterOptionSelected,
            ]}
            onPress={() => setFilterDepartmentId(null)}
          >
            <Text
              style={{
                color: filterDepartmentId === null ? "#291F75" : "#918CBC",
                fontWeight: filterDepartmentId === null ? "bold" : "normal",
              }}
            >
              Todos os departamentos
            </Text>
          </TouchableOpacity>
          {departments?.map((dep) => (
            <TouchableOpacity
              key={dep.id}
              style={[
                styles.filterOption,
                filterDepartmentId === dep.id && styles.filterOptionSelected,
              ]}
              onPress={() => setFilterDepartmentId(dep.id)}
            >
              <Text
                style={{
                  color: filterDepartmentId === dep.id ? "#291F75" : "#918CBC",
                  fontWeight: filterDepartmentId === dep.id ? "bold" : "normal",
                }}
              >
                {dep.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Lista de solicitações */}
      {isUserPostsLoading && !isUserPostsFetching ? (
        <View style={styles.loadingListContainer}>
          <ActivityIndicator size="large" color="#291F75" />
          <Text style={styles.loadingText}>
            Carregando minhas solicitações...
          </Text>
        </View>
      ) : hasUserPostsError ? (
        <View style={styles.errorListContainer}>
          <Text style={styles.errorText}>
            {userPostsError?.message ||
              "Erro desconhecido ao carregar minhas solicitações."}
          </Text>
          <TouchableOpacity onPress={() => refetchUserPosts()}>
            <Text style={styles.retryButton}>Tentar Novamente</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList<PostData>
          data={filteredUserPosts}
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
          refreshControl={
            <RefreshControl
              refreshing={isUserPostsFetching}
              onRefresh={() => {
                refetchUserPosts();
              }}
              colors={["#291F75"]}
              tintColor={"#291F75"}
            />
          }
          ListEmptyComponent={() => (
            <View style={styles.emptyListContainer}>
              <MaterialCommunityIcons
                name="file-document-outline"
                size={48}
                color="#EFAE0C"
                style={{ marginBottom: 12 }}
              />
              <Text style={styles.emptyText}>
                Nenhuma solicitação encontrada.
              </Text>
              <TouchableOpacity
                onPress={handleCreateNewRequest}
                style={styles.addFirstButton}
              >
                <Text style={styles.addFirstButtonText}>
                  Adicionar primeira solicitação
                </Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}

      {/* Botão flutuante para adicionar */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={handleCreateNewRequest}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={32} color="#291f75" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F8F9",
    paddingBottom: 120,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 18,
    backgroundColor: "#291F75",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 4,
    shadowColor: "#291F75",
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: "Nunito-Bold",
    color: "#fff",
    letterSpacing: 0.5,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#EFAE0C",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  searchContainer: {
    flexDirection: "row",
    marginTop: -14,
    paddingHorizontal: 20,
    marginBottom: 18,
    zIndex: 2,
  },
  searchInput: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#291f75",
    borderWidth: 1,
    borderColor: "#e8e1fa",
    marginRight: 10,
    elevation: 2,
    shadowColor: "#291F75",
    shadowOpacity: 0.06,
    shadowRadius: 2,
  },
  searchButton: {
    backgroundColor: "#291f75",
    paddingHorizontal: 18,
    justifyContent: "center",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    height: 48,
    alignItems: "center",
  },
  filterContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 10,
    marginTop: 0,
  },
  sectionTitle: {
    fontFamily: "Nunito-Bold",
    fontSize: 18,
    color: "#291f75",
    letterSpacing: 0.2,
  },
  filterButton: {
    flexDirection: "row",
    backgroundColor: "#291f75",
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  filterText: {
    color: "#FFFFFF",
    marginLeft: 8,
    fontSize: 15,
    fontFamily: "Nunito-SemiBold",
  },
  filterCard: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    elevation: 3,
    shadowColor: "#291F75",
    shadowOpacity: 0.07,
    shadowRadius: 6,
  },
  filterOption: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: "#F8F7FF",
    marginBottom: 6,
  },
  filterOptionSelected: {
    backgroundColor: "#E8E1FA",
    borderColor: "#291F75",
    borderWidth: 1,
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
    color: "#291f75",
  },
  loadingListContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  errorListContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
    paddingVertical: 40,
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
    color: "#291f75",
    textDecorationLine: "underline",
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
    paddingTop: 40,
  },
  emptyText: {
    textAlign: "center",
    color: "#918CBC",
    marginTop: 10,
    fontSize: 16,
    fontFamily: "Nunito-Regular",
    marginBottom: 20,
  },
  addFirstButton: {
    backgroundColor: "#291f75",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  addFirstButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Nunito-SemiBold",
  },
  flatListContent: {
    flexGrow: 1,
    paddingBottom: 100,
    paddingTop: 0,
  },
  addButton: {
    backgroundColor: "#EFAE0C",
    width: 60,
    height: 60,
    borderRadius: 30,
    position: "absolute",
    bottom: 150,
    right: 25,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
});

export default SolicitacoesPage;
