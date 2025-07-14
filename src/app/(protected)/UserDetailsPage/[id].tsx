import React, { useContext, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator, TouchableOpacity, Dimensions, FlatList } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { AuthContext } from '@/context/user-context';
import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import Constants from 'expo-constants';

interface PostSummary {
  id: number;
  title: string;
  description: string;
  status: string;
  publicUrl?: string;
  createdAt: string;
}

interface UserDetailsData {
  id: number;
  name: string;
  email: string;
  cpf: string;
  status: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
  posts: PostSummary[];
}

const { width } = Dimensions.get('window');

const UserDetailsPage = ()=> {
  const { id } = useLocalSearchParams();
  const { token, authenticatedRequest } = useContext(AuthContext);
  const router = useRouter();

  const userId = typeof id === 'string' ? parseInt(id, 10) : undefined;

  const fetchUserDetailsQueryFn = useCallback(async () => {
    if (!token) {
      throw new Error("Token de autenticação não disponível.");
    }
    if (userId === undefined) {
      throw new Error("ID do usuário não fornecido.");
    }
    const response = await authenticatedRequest<UserDetailsData>('GET', `/user/${userId}`);
    return response.data;
  }, [token, authenticatedRequest, userId]);

  const {
    data: userDetails,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<UserDetailsData, AxiosError>({
    queryKey: ['userDetails', userId, token],
    queryFn: fetchUserDetailsQueryFn,
    enabled: !!token && userId !== undefined,
    staleTime: 1000 * 60 * 5,
    retry: 1,
    onError: (err) => {
      Alert.alert('Erro', `Não foi possível carregar os detalhes do usuário: ${err.message || 'Erro desconhecido'}`);
    },
  });

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'ATIVO': return { text: 'Ativo', color: '#5cb85c' };
      case 'INATIVO': return { text: 'Inativo', color: '#D25A5A' };
      default: return { text: 'Desconhecido', color: '#999' };
    }
  };

  const getPostStatusDisplay = (status: string) => {
    switch (status) {
      case 'PENDENTE': return { text: 'Pendente', color: '#FFB800' };
      case 'EM ANDAMENTO': return { text: 'Em Andamento', color: '#3B73C4' };
      case 'RESOLVIDO': return { text: 'Resolvido', color: '#5cb85c' };
      case 'RECUSADO': return { text: 'Recusado', color: '#D25A5A' };
      default: return { text: 'Desconhecido', color: '#999' };
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#291F75" />
        <Text style={styles.loadingText}>Carregando detalhes do usuário...</Text>
      </View>
    );
  }

  if (isError || !userDetails) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          {error?.message || "Não foi possível carregar os detalhes do usuário."}
        </Text>
        <TouchableOpacity onPress={() => refetch()}>
          <Text style={styles.retryButton}>Tentar Novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const userStatusInfo = getStatusDisplay(userDetails.status);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Feather name="arrow-left" size={20} color="#291F75" />
        <Text style={styles.backButtonText}>Voltar</Text>
      </TouchableOpacity>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.avatarContainer}>
          <Image
            source={{ uri: userDetails.avatarUrl || 'https://via.placeholder.com/100/A8A8A8/FFFFFF?text=User' }}
            style={styles.avatar}
          />
          <Text style={styles.userName}>{userDetails.name}</Text>
          <View style={[styles.userStatusBadge, { backgroundColor: userStatusInfo.color + '20' }]}>
            <Text style={[styles.userStatusText, { color: userStatusInfo.color }]}>{userStatusInfo.text}</Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.cardHeader}>
            <Feather name="info" size={20} color="#291F75" style={styles.cardIcon} />
            <Text style={styles.cardTitle}>Informações do Usuário</Text>
          </View>
          <Text style={styles.cardText}>Email: {userDetails.email}</Text>
          <Text style={styles.cardText}>Membro desde: {new Date(userDetails.createdAt).toLocaleDateString('pt-BR')}</Text>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="post-outline" size={20} color="#291F75" style={styles.cardIcon} />
            <Text style={styles.cardTitle}>Postagens Recentes ({userDetails.posts.length})</Text>
          </View>
          {userDetails.posts.length > 0 ? (
            <FlatList
              data={userDetails.posts}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
              renderItem={({ item: post }) => {
                const postStatusInfo = getPostStatusDisplay(post.status);
                return (
                  <TouchableOpacity
                    style={styles.postItem}
                    onPress={() => router.push(`/SolicitacaoItem/${post.id}`)}
                  >
                    {post.publicUrl ? (
                      <Image source={{ uri: post.publicUrl }} style={styles.postImage} />
                    ) : (
                      <View style={styles.noPostImagePlaceholder}>
                        <MaterialCommunityIcons name="image-off-outline" size={30} color="#999" />
                      </View>
                    )}
                    <View style={styles.postContent}>
                      <Text style={styles.postTitle}>{post.title}</Text>
                      <Text style={styles.postDescription} numberOfLines={2}>{post.description}</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5 }}>
                        <View style={[styles.postStatusBadge, { backgroundColor: postStatusInfo.color + '20' }]}>
                          <Text style={[styles.postStatusText, { color: postStatusInfo.color }]}>{postStatusInfo.text}</Text>
                        </View>
                        <Text style={styles.postDate}>
                          {new Date(post.createdAt).toLocaleDateString('pt-BR')} • {new Date(post.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              }}
            />
          ) : (
            <Text style={styles.noPostsText}>Este usuário não fez nenhuma postagem ainda.</Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8F9',
    paddingBottom: 80,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    position: 'absolute',
    top: Constants.statusBarHeight + 10,
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
    paddingTop: Constants.statusBarHeight + 70, 
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 25,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#291F75',
    marginBottom: 10,
  },
  userName: {
    fontFamily: 'Nunito-Bold',
    fontSize: 24,
    color: '#291F75',
    marginBottom: 5,
  },
  userStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 15,
  },
  userStatusText: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 13,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    width: width * 0.9,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    paddingBottom: 10,
  },
  cardIcon: {
    marginRight: 10,
  },
  cardTitle: {
    fontFamily: 'Nunito-Bold',
    fontSize: 18,
    color: '#291F75',
  },
  cardText: {
    fontFamily: 'Nunito-Regular',
    fontSize: 16,
    color: '#555',
    lineHeight: 24,
    marginBottom: 5,
  },
  postItem: {
    flexDirection: 'row',
    backgroundColor: '#F9F9F9',
    borderRadius: 10,
    marginBottom: 10,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
  },
  postImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 10,
    resizeMode: 'cover',
  },
  noPostImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 10,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  postContent: {
    flex: 1,
  },
  postTitle: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 16,
    color: '#291F75',
    marginBottom: 2,
  },
  postDescription: {
    fontFamily: 'Nunito-Regular',
    fontSize: 13,
    color: '#777',
  },
  postStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginRight: 8,
  },
  postStatusText: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 11,
  },
  postDate: {
    fontFamily: 'Nunito-Regular',
    fontSize: 11,
    color: '#777',
  },
  noPostsText: {
    fontFamily: 'Nunito-Regular',
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingVertical: 20,
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

export default UserDetailsPage;