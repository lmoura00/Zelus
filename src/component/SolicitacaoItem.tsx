import React, { useContext, useCallback } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Feather, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { AuthContext } from '@/context/user-context';
import { AxiosError } from 'axios';

interface UserData {
    id: number;
    name: string;
    email: string;
    cpf: string;
    createdAt?: string;
    updatedAt?: string;
    restores?: any[];
    profileImage?: string;
    avatarUrl?: string;
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
    category?: CategoryData;
    user?: UserData;
    department?: DepartmentData;
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

interface SolicitacaoItemProps {
    item: PostData;
    onPress: (postId: number) => void;
    onDenounce: (item: PostData) => void;
    formatTimeAgo: (dateString: string) => string;
}

export default function SolicitacaoItem({
    item,
    onPress,
    onDenounce,
    formatTimeAgo,
}: SolicitacaoItemProps) {
    const { token, authenticatedRequest } = useContext(AuthContext);

    const getStatusBadgeProps = (status: string) => {
        switch (status) {
            case 'PENDENTE': return { text: 'Pendente', color: '#FFB800', backgroundColor: '#FFF6E3' };
            case 'EM ANDAMENTO': return { text: 'Em Andamento', color: '#3B73C4', backgroundColor: '#E3EDF9' };
            case 'RESOLVIDO': return { text: 'Resolvido', color: '#5cb85c', backgroundColor: '#E6FAEC' };
            case 'RECUSADO': return { text: 'Recusado', color: '#D25A5A', backgroundColor: '#FBE6E6' };
            default: return { text: 'Desconhecido', color: '#999', backgroundColor: '#F0F0F0' };
        }
    };

    const statusProps = getStatusBadgeProps(item.status);

    const fetchCommentsCountQueryFn = useCallback(async () => {
        if (!token || item.id === undefined) return { comments: [] };
        try {
            const response = await authenticatedRequest<{ comments: CommentData[] }>('GET', `/comments/${item.id}`);
            return response.data;
        } catch (err: any) {
            if (err instanceof AxiosError && err.response && err.response.status === 404 && err.response.data?.message === "Nenhum comentário encontrado para este post.") {
                return { comments: [] };
            }
            throw err;
        }
    }, [token, authenticatedRequest, item.id]);

    const {
        data: commentsData,
        isLoading: isCommentsLoading,
        isError: isCommentsError,
    } = useQuery<{ comments: CommentData[] }, AxiosError>({
        queryKey: ['postCommentsCount', item.id],
        queryFn: fetchCommentsCountQueryFn,
        enabled: !!token && item.id !== undefined,
        staleTime: 1000 * 60,
        cacheTime: 1000 * 60 * 5,
        onError: (err) => {
            console.error(`Error fetching comments for post ${item.id}:`, err.message);
        },
    });

    const commentCount = commentsData?.comments?.length || 0;

    return (
        <TouchableOpacity
            style={styles.container}
            onPress={() => onPress(item.id)}
            activeOpacity={0.8}
        >
            <View style={styles.headerTopRight}>
                <View style={styles.tagBadge}>
                    <Text style={styles.tagText}>{item.category?.name || 'Tipo Desconhecido'}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: statusProps.backgroundColor, borderColor: statusProps.color }]}>
                    <Text style={[styles.statusText, { color: statusProps.color }]}>{statusProps.text}</Text>
                </View>
            </View>

            <View style={styles.header}>
                <Image
                    source={{ uri: item.user?.avatarUrl || 'https://via.placeholder.com/150' }}
                    style={{ width: 25, height: 25, borderRadius: 12.5 }}
                />
                <Text style={styles.userText}>
                    {item.user?.name || 'Usuário Desconhecido'} • {formatTimeAgo(item.createdAt)}
                </Text>
            </View>

            <View style={styles.body}>
                {item.publicUrl ? (
                    <Image source={{ uri: item.publicUrl }} style={styles.image} />
                ) : (
                    <MaterialCommunityIcons name="image-off" size={48} color="#CCCCCC" style={styles.imagePlaceholder} />
                )}
                <View style={{ flex: 1 }}>
                    <Text style={styles.titulo} numberOfLines={1}>{item.title}</Text>
                    <Text style={styles.descricao} numberOfLines={2}>
                        {item.description}
                    </Text>
                </View>
            </View>

            <View style={styles.footer}>
                <View style={styles.endereco}>
                    <Feather name="map-pin" size={14} color="#291F75" />
                    <Text style={styles.enderecoText}>{item.address}</Text>
                </View>
                <View style={styles.footerActions}>
                    {isCommentsLoading ? (
                        <ActivityIndicator size="small" color="#291F75" style={styles.commentsLoadingIndicator} />
                    ) : isCommentsError ? (
                        <Text style={styles.commentsErrorTextSmall}>Erro</Text>
                    ) : (
                        <TouchableOpacity onPress={() => onPress(item.id)} style={styles.commentsButton}>
                            <Ionicons name="chatbubble-outline" size={18} color="#291F75" />
                            <Text style={styles.commentsCountText}>{commentCount}</Text>
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity style={styles.botaoDenunciar} onPress={(e) => { e.stopPropagation(); onDenounce(item); }}>
                        <Feather name="flag" size={14} color="#D25A5A" style={{ marginRight: 4 }} />
                        <Text style={styles.botaoDenunciarText}>Denunciar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        marginHorizontal: 16,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    headerTopRight: {
        flexDirection: 'row',
        position: 'absolute',
        top: 16,
        right: 16,
        zIndex: 1,
    },
    tagBadge: {
        backgroundColor: '#EAEAEA',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#918CBC',
        marginRight: 8,
    },
    tagText: {
        fontSize: 11,
        color: '#291F75',
        fontFamily: 'Nunito-Bold',
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
        borderWidth: 1,
    },
    statusText: {
        fontSize: 11,
        fontFamily: 'Nunito-Bold',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        marginTop: 25,
    },
    userText: {
        marginLeft: 8,
        fontSize: 13,
        color: '#291F75',
        fontFamily: 'Nunito-Bold',
        flex: 1,
    },
    body: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    image: {
        width: 60,
        height: 60,
        borderRadius: 10,
        marginRight: 16,
        resizeMode: 'cover',
    },
    imagePlaceholder: {
        width: 60,
        height: 60,
        borderRadius: 10,
        marginRight: 16,
        backgroundColor: '#E0E0E0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    titulo: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#291F75',
        fontFamily: 'Nunito-Bold',
        marginBottom: 4,
    },
    descricao: {
        fontSize: 13,
        color: '#584CAF',
        fontFamily: 'Nunito-Regular',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
    },
    endereco: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    enderecoText: {
        marginLeft: 6,
        fontSize: 13,
        color: '#291F75',
        fontFamily: 'Nunito-SemiBold',
    },
    footerActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    commentsButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E8E1FA',
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 8,
        marginRight: 10,
    },
    commentsCountText: {
        marginLeft: 4,
        fontSize: 13,
        color: '#291F75',
        fontFamily: 'Nunito-SemiBold',
    },
    commentsLoadingIndicator: {
        marginRight: 10,
    },
    commentsErrorTextSmall: {
        fontSize: 11,
        color: '#D25A5A',
        fontFamily: 'Nunito-Regular',
        marginRight: 10,
    },
    botaoDenunciar: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#D25A5A',
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 8,
    },
    botaoDenunciarText: {
        fontSize: 13,
        color: '#D25A5A',
        fontFamily: 'Nunito-Bold',
    },
});