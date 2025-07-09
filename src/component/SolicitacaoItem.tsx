import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

// Reutilize as interfaces de tipagem da PostData
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
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(item.id)}
      activeOpacity={0.8}
    >
      <View style={styles.tagBadge}>
        
        <Text style={styles.tagText}>{item.category?.name || 'Tipo Desconhecido'}</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  userText: {
    marginLeft: 8,
    fontSize: 13,
    color: '#291F75',
    fontFamily: 'Nunito-Bold',
    flex: 1,
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
    fontSize: 11,
    color: '#291F75',
    fontFamily: 'Nunito-Bold',
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