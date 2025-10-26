import React, { useContext, useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Alert, ActivityIndicator, TouchableOpacity, Dimensions, Platform, TextInput } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Feather, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { AuthContext } from '@/context/user-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import MapView, { Marker, PROVIDER_DEFAULT, PROVIDER_GOOGLE } from 'react-native-maps';
import Constants from 'expo-constants';

interface UserData {
  id: number;
  name: string;
  email: string;
  cpf: string;
  createdAt?: string;
  updatedAt?: string;
  restores?: any[];
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
  userId: number;
  departmentId: number;
  createdAt: string;
  updatedAt: string;
  department: DepartmentData;
  user: UserData;
}

interface CommentData {
  id: number;
  text: string;
  userId: number;
  postId: number;
  createdAt: string;
  updatedAt: string;
  user: UserData;
  totallikes?: string;
}

const { width } = Dimensions.get('window');

export default function SolicitacaoItemDetails() {
  const { id } = useLocalSearchParams();
  const { user, token, authenticatedRequest } = useContext(AuthContext);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [newCommentText, setNewCommentText] = useState('');

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

  const fetchCommentsQueryFn = useCallback(async () => {
    if (!token || postId === undefined) return [];
    try {
      const response = await authenticatedRequest<{ comments: CommentData[] }>('GET', `/comments/${postId}`);
      return response.data.comments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (err: any) {
      if (err instanceof AxiosError && err.response && err.response.status === 404 && err.response.data?.message === "Nenhum comentário encontrado para este post.") {
        return [];
      }
      throw err;
    }
  }, [token, authenticatedRequest, postId]);

  const {
    data: comments,
    isLoading: isCommentsLoading,
    isError: isCommentsError,
    error: commentsError,
    refetch: refetchComments,
  } = useQuery<CommentData[], AxiosError>({
    queryKey: ['postComments', postId],
    queryFn: fetchCommentsQueryFn,
    enabled: !!token && postId !== undefined,
    onError: (err) => {
      const errorMessage = err.response?.data?.message || err.message;
      Alert.alert('Erro', `Não foi possível carregar os comentários: ${errorMessage}`);
    },
  });

  const createCommentMutation = useMutation<CommentData, AxiosError, string>({
    mutationFn: async (commentText: string) => {
      if (!token || postId === undefined) {
        throw new Error("Token de autenticação ou ID do post não disponível.");
      }
      const response = await authenticatedRequest('POST', `/comments/${postId}`, { text: commentText });
      return response.data;
    },
    onSuccess: () => {
      setNewCommentText('');
      queryClient.invalidateQueries(['postComments', postId]);
    },
    onError: (err) => {
      Alert.alert('Erro', `Falha ao adicionar comentário: ${err.response?.data?.message || err.message}`);
    },
  });

  const likeCommentMutation = useMutation<any, AxiosError, number>({
    mutationFn: async (commentIdToLike: number) => {
      if (!token) {
        throw new Error("Token de autenticação não disponível.");
      }
      const response = await authenticatedRequest('PUT', `/comments/like/${commentIdToLike}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['postComments', postId]);
    },
    onError: (err) => {
      Alert.alert('Erro', `Falha ao curtir comentário: ${err.response?.data?.message || err.message}`);
    },
  });

  const deletePostMutation = useMutation<any, AxiosError, number>({
    mutationFn: async (postIdToDelete: number) => {
      if (!token) {
        throw new Error("Token de autenticação não disponível.");
      }
      const response = await authenticatedRequest('DELETE', `/post/${postIdToDelete}`);
      return response.data;
    },
    onSuccess: () => {
      Alert.alert("Sucesso", "Solicitação excluída com sucesso!");
      queryClient.invalidateQueries(['posts']);
      queryClient.invalidateQueries(['userPosts']);
      router.back();
    },
    onError: (error) => {
      Alert.alert("Erro", `Falha ao excluir solicitação: ${error.response?.data?.message || error.message}`);
    },
  });

  const deleteFileMutation = useMutation<any, AxiosError, { publicId?: string }>(
    {
      mutationFn: async ({ publicId }) => {
        if (!token) throw new Error("Token de autenticação não disponível.");

        if (publicId) {
          try {
            const res = await authenticatedRequest('DELETE', `/files/${publicId}`);
            return res.data;
          } catch (err) {
            /* fallthrough para tentar outro endpoint */
          }
        }

        if (postId !== undefined) {
          const res = await authenticatedRequest('DELETE', `/post/${postId}/file`);
          return res.data;
        }

        throw new Error('Não foi possível determinar endpoint para exclusão do arquivo.');
      },
      onSuccess: () => {
        Alert.alert('Sucesso', 'Arquivo removido.');
        queryClient.invalidateQueries(['postDetails', postId]);
        queryClient.invalidateQueries(['posts']);
        queryClient.invalidateQueries(['userPosts']);
        refetch();
      },
      onError: (err) => {
        Alert.alert('Erro', `Falha ao excluir arquivo: ${err.response?.data?.message || err.message}`);
      },
    }
  );

  const handleEditPost = useCallback(() => {
    if (postDetails) {
      router.push(`/EditRequest/${postDetails.id}`);
    }
  }, [postDetails, router]);

  const handleDeletePost = useCallback(() => {
    if (!postDetails) return;

    Alert.alert(
      "Confirmar Exclusão",
      `Tem certeza que deseja excluir a solicitação "${postDetails.title}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          onPress: () => {
            if (postDetails.id) {
              deletePostMutation.mutate(postDetails.id);
            }
          },
          style: "destructive",
        },
      ]
    );
  }, [postDetails, deletePostMutation]);

  const handleDeleteFile = useCallback(() => {
    if (!postDetails) return;
    Alert.alert(
      'Remover imagem',
      'Deseja remover a imagem anexada a esta solicitação?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: () =>
            deleteFileMutation.mutate({ publicId: postDetails.publicId }),
        },
      ]
    );
  }, [postDetails, deleteFileMutation]);

  const handlePostComment = useCallback(() => {
    if (!newCommentText.trim()) {
      Alert.alert('Erro', 'O comentário não pode estar vazio.');
      return;
    }
    createCommentMutation.mutate(newCommentText);
  }, [newCommentText, createCommentMutation]);

  const handleGoToUserDetails = useCallback((userId: number) => {
    router.push(`/UserDetailsPage/${userId}`);
  }, [router]);

  const images = postDetails?.publicUrl ? [postDetails.publicUrl] : [];

  const goToPreviousImage = () => {
    setCurrentImageIndex((prevIndex) => Math.max(0, prevIndex - 1));
  };

  const goToNextImage = () => {
    setCurrentImageIndex((prevIndex) => Math.min(images.length - 1, prevIndex + 1));
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'PENDENTE': return { text: 'Pendente', icon: 'clock-time-four-outline', color: '#FFB800' };
      case 'EM ANDAMENTO': return { text: 'Em Andamento', icon: 'refresh', color: '#3B73C4' };
      case 'RESOLVIDO': return { text: 'Resolvido', icon: 'check-circle-outline', color: '#5cb85c' };
      case 'RECUSADO': return { text: 'Recusado', icon: 'close-circle-outline', color: '#D25A5A' };
      default: return { text: 'Desconhecido', icon: 'help-circle-outline', color: '#999' };
    }
  };

  if (isPostDetailsLoading || isPostDetailsFetching || deletePostMutation.isPending) {
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

  const parsedLatitude = postDetails.latitude !== null ? parseFloat(postDetails.latitude) : null;
  const parsedLongitude = postDetails.longitude !== null ? parseFloat(postDetails.longitude) : null;

  const mapLatitude = (typeof parsedLatitude === 'number' && !isNaN(parsedLatitude)) ? parsedLatitude : null;
  const mapLongitude = (typeof parsedLongitude === 'number' && !isNaN(parsedLongitude)) ? parsedLongitude : null;

  const isOwner = user && postDetails.user && user.id === postDetails.user.id;
  const mapProvider = Platform.OS === 'android' ? PROVIDER_GOOGLE : PROVIDER_DEFAULT;

  const isAccepted = ['EM ANDAMENTO', 'RESOLVIDO', 'RECUSADO'].includes(postDetails.status);
  const isInProgress = postDetails.status === 'EM ANDAMENTO';
  const isResolved = postDetails.status === 'RESOLVIDO';

  const acceptedStepCircleColor = isAccepted ? statusInfo.color : '#ddd';
  const acceptedStepTextColor = isAccepted ? statusInfo.color : '#999';

  const inProgressStepCircleColor = isInProgress || isResolved ? statusInfo.color : '#ddd';
  const inProgressTextColor = isInProgress || isResolved ? statusInfo.color : '#999';

  const resolvedStepCircleColor = isResolved ? statusInfo.color : '#ddd';
  const resolvedTextColor = isResolved ? statusInfo.color : '#999';

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
              {isOwner && postDetails?.publicUrl && (
                <TouchableOpacity style={styles.deleteImageButton} onPress={handleDeleteFile} disabled={deleteFileMutation.isLoading}>
                  <Feather name="trash-2" size={18} color="#D25A5A" />
                </TouchableOpacity>
              )}
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
              <Text style={styles.mapPlaceholderText}>Imagem indisponível</Text>
            </View>
          )}
        </View>

        <Text style={styles.title}>{postDetails.title}</Text>

        {isOwner && (
          <View style={styles.ownerActions}>
            <TouchableOpacity style={styles.editButton} onPress={handleEditPost}>
              <Feather name="edit" size={16} color="#291F75" />
              <Text style={styles.editButtonText}>Editar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteButton} onPress={handleDeletePost}>
              <Feather name="trash-2" size={16} color="#D25A5A" />
              <Text style={styles.deleteButtonText}>Excluir</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.infoCard}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="text-box-outline" size={20} color="#291F75" style={styles.cardIcon} />
            <Text style={styles.cardTitle}>Descrição</Text>
          </View>
          <Text style={styles.cardText}>{postDetails.description} </Text>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.cardHeader}>
            <Feather name="user" size={20} color="#291F75" style={styles.cardIcon} />
            <Text style={styles.cardTitle}>Solicitante</Text>
          </View>
          <TouchableOpacity onPress={() => handleGoToUserDetails(postDetails.user.id)}>
            <Text style={[styles.cardText, styles.linkText]}>Nome: {postDetails.user.name}</Text>
          </TouchableOpacity>
          <Text style={styles.cardText}>Email: {postDetails.user.email}</Text>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.cardHeader}>
            <Feather name="tag" size={20} color="#291F75" style={styles.cardIcon} />
            <Text style={styles.cardTitle}>Departamento</Text>
          </View>
          <Text style={styles.cardText}>Departamento: {postDetails.department.name}</Text>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.cardHeader}>
            <Feather name="map-pin" size={20} color="#291F75" style={styles.cardIcon} />
            <Text style={styles.cardTitle}>Local</Text>
          </View>
          <Text style={styles.cardText}>Endereço: {postDetails.address}, {postDetails.number ? `${postDetails.number}, ` : ''}{postDetails.neighborhood}, CEP: {postDetails.cep}</Text>

          {(mapLatitude !== null && mapLongitude !== null) ? (
            <View style={styles.mapContainer}>
              <MapView
                style={styles.map}
                initialRegion={{
                  latitude: mapLatitude,
                  longitude: mapLongitude,
                  latitudeDelta: 0.008,
                  longitudeDelta: 0.008,
                }}
                provider={mapProvider}
                scrollEnabled={false}
                zoomEnabled={false}
                pitchEnabled={false}
                rotateEnabled={false}
              >
                <Marker
                  coordinate={{ latitude: mapLatitude, longitude: mapLongitude }}
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
            <Text style={styles.cardTitle}>Status</Text>
            <View style={[styles.currentStatusBadge, { backgroundColor: statusInfo.color + '20' }]}>
              <Text style={[styles.currentStatusText, { color: statusInfo.color }]}>{statusInfo.text}</Text>
            </View>
          </View>
          <View style={styles.statusSteps}>
            <View style={styles.step}>
              <View style={[styles.stepCircle, { backgroundColor: acceptedStepCircleColor }]}>
                <Feather name="thumbs-up" size={16} color="#FFF" />
              </View>
              <Text style={[styles.stepText, { color: acceptedStepTextColor }]}>Aceito</Text>
            </View>
            <View style={styles.stepLine}></View>
            <View style={styles.step}>
              <View style={[styles.stepCircle, { backgroundColor: inProgressStepCircleColor }]}>
                <MaterialCommunityIcons
                  name="progress-check"
                  size={16}
                  color="#FFF"
                />
              </View>
              <Text style={[styles.stepText, { color: inProgressTextColor }]}>Em andamento</Text>
            </View>
            <View style={styles.stepLine}></View>
            <View style={styles.step}>
              <View style={[styles.stepCircle, { backgroundColor: resolvedStepCircleColor }]}>
                <Feather
                  name="check"
                  size={16}
                  color="#FFF"
                />
              </View>
              <Text style={[styles.stepText, { color: resolvedTextColor }]}>Resolvido</Text>
            </View>
          </View>
          <View style={styles.statusInfo}>
            <View style={[styles.radioOuter, { borderColor: statusInfo.color }]}>
              <View style={[styles.radioInner, { backgroundColor: statusInfo.color }]} />
            </View>
            <Text style={styles.statusInfoText}>Status atual: {statusInfo.text}</Text>
            {postDetails.updatedAt && (
              <Text style={styles.statusDate}>{new Date(postDetails.updatedAt).toLocaleDateString('pt-BR')} às {new Date(postDetails.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
            )}
          </View>
        </View>

        <View style={styles.commentsSection}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="comment-multiple-outline" size={20} color="#291F75" style={styles.cardIcon} />
            <Text style={styles.cardTitle}>Comentários ({comments?.length || 0})</Text>
            {isCommentsLoading && <ActivityIndicator size="small" color="#291F75" style={styles.commentsLoadingIndicator} />}
            {isCommentsError && <Text style={styles.commentsErrorText}>Erro ao carregar comentários</Text>}
          </View>

          {comments && comments.length > 0 ? (
            comments.map((comment) => (
              <View key={comment.id} style={styles.commentItem}>
                <View style={styles.commentHeader}>
                  <Image
                    source={{ uri: comment.user.avatarUrl || 'https://via.placeholder.com/150' }}
                    style={styles.commentAvatar}
                  />
                  <Text style={styles.commentAuthor}>{comment.user.name}</Text>
                </View>
                <Text style={styles.commentText}>{comment.text}</Text>
                <View style={styles.commentActions}>
                  <TouchableOpacity
                    onPress={() => likeCommentMutation.mutate(comment.id)}
                    style={styles.likeButton}
                    disabled={likeCommentMutation.isPending} 
                  >
                    <Ionicons
                      name="heart-outline"
                      size={18}
                      color="#D25A5A"
                    />
                    <Text style={styles.likeCount}>
                      {parseInt(comment.totallikes || '0', 10)}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.noCommentsText}>Nenhum comentário ainda.</Text>
          )}

          <View style={styles.newCommentContainer}>
            <TextInput
              style={styles.newCommentInput}
              placeholder="Adicionar um comentário..."
              placeholderTextColor="#918CBC"
              multiline
              value={newCommentText}
              onChangeText={setNewCommentText}
              editable={!createCommentMutation.isPending}
            />
            <TouchableOpacity
              style={styles.sendCommentButton}
              onPress={handlePostComment}
              disabled={createCommentMutation.isPending || !newCommentText.trim()}
            >
              {createCommentMutation.isPending ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Ionicons name="send" size={20} color="#FFF" />
              )}
            </TouchableOpacity>
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
    paddingBottom: 120,
    paddingTop: Constants.statusBarHeight,
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
  },
  imageCarousel: {
    width: '100%',
    height: 280,
    overflow: 'hidden',
    marginBottom: 40,
    position: 'relative',
  },
  mainImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
    marginBottom: 0,
  },
  noImagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#eee',
    width: '100%',
    height: '100%',
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
    fontSize: 28,
    color: '#291F75',
    marginBottom: 20,
    textAlign: 'center',
    paddingHorizontal: 20,
    marginTop: -40,
    backgroundColor: 'transparent',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  ownerActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
    gap: 10,
    width: '90%',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8E1FA',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  editButtonText: {
    marginLeft: 8,
    fontFamily: 'Nunito-SemiBold',
    color: '#291F75',
    fontSize: 15,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FBE6E6',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  deleteButtonText: {
    marginLeft: 8,
    fontFamily: 'Nunito-SemiBold',
    color: '#D25A5A',
    fontSize: 15,
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
  linkText: {
    color: '#3B73C4',
    textDecorationLine: 'underline',
  },
  emoji: {
    fontSize: 16,
  },
  mapContainer: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 15,
    borderWidth: 1,
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
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 15,
    marginLeft: 'auto',
  },
  currentStatusText: {
    fontFamily: 'Nunito-Bold',
    fontSize: 12,
  },
  statusSteps: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingHorizontal: 5,
  },
  step: {
    alignItems: 'center',
    flex: 1,
  },
  stepCircle: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepText: {
    marginTop: 6,
    fontSize: 13,
    fontFamily: 'Nunito-Regular',
    textAlign: 'center',
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
    backgroundColor: '#F1F9F1',
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
  },
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
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
  commentsSection: {
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
  commentsLoadingIndicator: {
    marginLeft: 10,
  },
  commentsErrorText: {
    marginLeft: 10,
    color: '#D25A5A',
    fontFamily: 'Nunito-Regular',
  },
  commentItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    marginBottom: 5,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 4,
    backgroundColor: '#EFAE0C',
    padding: 5,
    borderRadius: 5,
  },
  commentAuthor: {
    fontFamily: 'Nunito-Bold',
    fontSize: 14,
    color: '#291F75',
  },
  commentDate: {
    fontFamily: 'Nunito-Regular',
    fontSize: 12,
    color: '#777',
  },
  commentText: {
    fontFamily: 'Nunito-Regular',
    fontSize: 14,
    color: '#555',
  },
  commentActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 8,
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FBE6E6', 
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 15,
  },
  likeCount: {
    marginLeft: 4,
    fontFamily: 'Nunito-SemiBold',
    fontSize: 13,
    color: '#D25A5A',
  },
  noCommentsText: {
    fontFamily: 'Nunito-Regular',
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingVertical: 20,
  },
  newCommentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    paddingTop: 15,
  },
  newCommentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D8D0ED',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    fontSize: 15,
    fontFamily: 'Nunito-Regular',
    color: '#291F75',
    marginRight: 10,
    minHeight: 40,
    maxHeight: 100,
    backgroundColor: '#F8F7FF',
  },
  sendCommentButton: {
    backgroundColor: '#291F75',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  commentAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 10,
  },
  deleteImageButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(255,255,255,0.95)',
    padding: 8,
    borderRadius: 20,
    zIndex: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 6,
  },
});