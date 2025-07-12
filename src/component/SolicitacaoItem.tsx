import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

interface UserData {
  id: number;
  name: string;
  email: string;
  cpf: string;
  createdAt?: string;
  updatedAt?: string;
  restores?: any[];
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

  const getStatusBadgeProps = (status: string) => {
    switch (status) {
      case 'PENDENTE': return { text: 'Pendente', color: '#FFB800', backgroundColor: '#FFF6E3' };
      case 'EM ANDAMENTO': return { text: 'Em Andamento', color: '#3B73C4', backgroundColor: '#E3EDF9' };
      case 'CONCLUIDO': return { text: 'Concluído', color: '#5cb85c', backgroundColor: '#E6FAEC' };
      case 'RECUSADO': return { text: 'Recusado', color: '#D25A5A', backgroundColor: '#FBE6E6' };
      default: return { text: 'Desconhecido', color: '#999', backgroundColor: '#F0F0F0' };
    }
  };

  const statusProps = getStatusBadgeProps(item.status);

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
        <Feather name="user" size={16} color="#291F75" />
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
        <TouchableOpacity style={styles.botaoDenunciar} onPress={(e) => { e.stopPropagation(); onDenounce(item); }}>
          <Feather name="flag" size={14} color="#D25A5A" style={{ marginRight: 4 }} />
          <Text style={styles.botaoDenunciarText}>Denunciar</Text>
        </TouchableOpacity>
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
  },
  enderecoText: {
    marginLeft: 6,
    fontSize: 13,
    color: '#291F75',
    fontFamily: 'Nunito-SemiBold',
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