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
  category?: CategoryData;
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
  posts: Omit<PostData, "category" | "user" | "department">[];
}



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

  const fetchCategoriesQueryFn = useCallback(async () => {
    if (!token) throw new Error("Token para categorias não disponível.");
    const response = await authenticatedRequest<CategoryData[]>(
      "GET",
      "/categories"
    );
    return response.data;
  }, [token, authenticatedRequest]);

  const {
    data: categories,
    isLoading: isCategoriesLoading,
    isError: isCategoriesError,
  } = useQuery<CategoryData[], AxiosError>({
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
    if (!categories || !departments)
      throw new Error("Dados de categoria/departamento não carregados.");

    const response = await authenticatedRequest<UserDataResponse>(
      "GET",
      `/user/${user.id}`
    );

    const postsWithDetails: PostData[] = response.data.posts.map((post) => {
      const fullCategory = categories.find((cat) => cat.id === post.categoryId);
      const fullDepartment = departments.find(
        (dep) => dep.id === post.departmentId
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

      return {
        ...post,
        category: fullCategory || {
          id: post.categoryId,
          name: "Desconhecida",
          createdAt: "",
          updatedAt: "",
        },
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
  }, [
    token,
    user?.id,
    user?.name,
    user?.email,
    authenticatedRequest,
    categories,
    departments,
  ]);

  const {
    data: userPosts,
    isLoading: isUserPostsLoading,
    isFetching: isUserPostsFetching,
    error: userPostsError,
    refetch: refetchUserPosts,
    isError: hasUserPostsError,
  } = useQuery<PostData[], AxiosError>({
    queryKey: ["userPosts", user?.id, token, categories, departments], 
    queryFn: fetchUserPostsQueryFn,
    enabled: !!token && !!user?.id && !!categories && !!departments,
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
    return (
      item.title.toLowerCase().includes(lowerCaseSearch) ||
      item.description.toLowerCase().includes(lowerCaseSearch) ||
      item.category?.name?.toLowerCase().includes(lowerCaseSearch) ||
      item.user?.name?.toLowerCase().includes(lowerCaseSearch)
    );
  });

  const handleCreateNewRequest = useCallback(() => {
    router.push("/AddRequest/page");
  }, [router]);

  if (isAuthLoading || isCategoriesLoading || isDepartmentsLoading) {
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

  if (isCategoriesError || isDepartmentsError) {
    function refetchCategories() {
      throw new Error("Function not implemented.");
    }

    function refetchDepartments() {
      throw new Error("Function not implemented.");
    }

    return (
      <View style={styles.errorListContainer}>
        <Text style={styles.errorText}>
          Erro ao carregar dados essenciais (categorias/departamentos).
        </Text>
        <TouchableOpacity
          onPress={() => {
            refetchCategories();
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
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Minhas Solicitações</Text>
        <TouchableOpacity style={styles.headerIcon}>
          <Ionicons name="notifications-outline" size={24} color="#291f75" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Buscar minhas solicitações..."
          placeholderTextColor="#918CBC"
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
        />
        <TouchableOpacity style={styles.searchButton}>
          <Feather name="search" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.filterContainer}>
        <Text style={styles.sectionTitle}>Últimas solicitações:</Text>
        <TouchableOpacity style={styles.filterButton}>
          <MaterialCommunityIcons
            name="filter-outline"
            size={20}
            color="#FFFFFF"
          />
          <Text style={styles.filterText}>Filtrar</Text>
        </TouchableOpacity>
      </View>

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
      ) : filteredUserPosts.length === 0 ? (
        <View style={styles.emptyListContainer}>
          <Text style={styles.emptyText}>Nenhuma solicitação encontrada.</Text>
          <TouchableOpacity
            onPress={handleCreateNewRequest}
            style={styles.addFirstButton}
          >
            <Text style={styles.addFirstButtonText}>
              Adicionar primeira solicitação
            </Text>
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
        />
      )}

      <TouchableOpacity
        style={styles.addButton}
        onPress={handleCreateNewRequest}
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
    marginBottom: 0,
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: "Nunito-Bold",
    color: "#291f75",
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#e8e1fa",
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
    marginTop: 10,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    height: 50,
    borderRadius: 10,
    backgroundColor: "#e8e1fa",
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#291f75",
    borderWidth: 1,
    borderColor: "#d8d0ed",
    marginRight: 10,
  },
  searchButton: {
    backgroundColor: "#291f75",
    paddingHorizontal: 18,
    justifyContent: "center",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  filterContainer: {
    marginTop: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: "Nunito-Bold",
    fontSize: 18,
    color: "#291f75",
  },
  filterButton: {
    flexDirection: "row",
    backgroundColor: "#291f75",
    paddingVertical: 8,
    paddingHorizontal: 16,
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
  emptyListContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  emptyText: {
    textAlign: "center",
    color: "#918CBC",
    marginTop: 20,
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
