import React, { useState, useContext, useEffect } from 'react'
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
  Alert, // Importar Alert para exibir mensagens de erro do login
} from 'react-native'
import { useRouter, useSegments } from 'expo-router'
import { Feather, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons'
import { AuthContext } from '@/context/user-context' // Importar AuthContext

// Obtém largura e altura da tela
const { width, height } = Dimensions.get('window')

// Margem lateral e dimensões do banner
const CARD_MARGIN = 16
const BANNER_WIDTH = width - CARD_MARGIN * 2
const BANNER_HEIGHT = BANNER_WIDTH * 0.6
const BANNERS = [0, 1, 2, 3] // IDs fictícios para 4 banners de exemplo

// Dados de exemplo para a lista de solicitações
const DATA = [
  {
    id: '1',
    user: 'Kalline Ferreira',
    time: 'há 1d',
    title: 'Rua com buraco',
    description: 'Rua com buraco, toda ferrada, tadinha da rua coitada BUAAH!',
    tag: 'Pavimentação',
    address: 'Vila do bec, Nº292',
    //image: require('../assets/images/adaptive-icon.png'), // Comentado pois o asset não foi fornecido
  },
  {
    id: '2',
    user: 'João Silva',
    time: 'há 2h',
    title: 'Lixo acumulado',
    description: 'Muito lixo na rua, atraindo insetos e mau cheiro.',
    tag: 'Limpeza Urbana',
    address: 'Rua das Flores, Nº100',
  },
  {
    id: '3',
    user: 'Maria Souza',
    time: 'há 5d',
    title: 'Iluminação Pública',
    description: 'Poste com lâmpada queimada na esquina, muito escuro à noite.',
    tag: 'Iluminação',
    address: 'Avenida Principal, Nº500',
  },
  {
    id: '4',
    user: 'Pedro Lima',
    time: 'há 1 semana',
    title: 'Árvore caindo',
    description: 'Árvore antiga com galhos grandes e secos, risco de queda.',
    tag: 'Poda de Árvores',
    address: 'Travessa da Paz, Nº15',
  },
]

const HomePage = () => {
  // Hooks para navegação e rota atual
  const router = useRouter()
  const segments = useSegments()
  const { user, logout, isLoading, error } = useContext(AuthContext) // Usar o AuthContext
//console.log(user.user.name)

  // Estados locais
  const [search, setSearch] = useState('')            // texto de busca
  const [modalVisible, setModalVisible] = useState(false) // controla modal de denúncia
  const [selectedPost, setSelectedPost] = useState<any>(null) // post selecionado para denunciar
  const [bannerIndex, setBannerIndex] = useState(0)      // índice do banner ativo

  // Redireciona para login se não houver usuário autenticado
  useEffect(() => {
    if (!user && !isLoading) { // isLoading para evitar redirecionar antes do contexto carregar
      // Alert.alert('Sessão expirada', 'Faça login novamente.'); // Opcional: avisar o usuário
      router.replace('/login/page') // Redireciona para a tela de login
    }
    if (error) {
        Alert.alert("Erro de autenticação", error);
    }
  }, [user, isLoading, error, router]);

  // Filtra dados pela busca
  const filtered = DATA.filter(item =>
    item.title.toLowerCase().includes(search.toLowerCase())
  )

  // Abre modal de denúncia para um post específico
  const handleDenounce = (item: any) => {
    setSelectedPost(item)
    setModalVisible(true)
  }

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>Zelus</Text>
        <TouchableOpacity onPress={() => {/* abrir notificações */ }}>
          <Feather name="bell" size={24} color="#291F75" />
        </TouchableOpacity>
      </View>

      {/* Exemplo de uso do nome do usuário logado (opcional) */}
      {user && (
        <Text style={styles.welcomeText}>Bem-vindo, {user.user.name}!</Text>
      )}

      {/* SEARCH BAR */}
      <View style={styles.searchRow}>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Buscar solicitações..."
          placeholderTextColor="#918CBC"
          style={styles.searchInput}
        />
        <TouchableOpacity style={styles.searchBtn} onPress={() => {/* executar busca */ }}>
          <Feather name="search" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* BANNER CAROUSEL */}
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        snapToInterval={BANNER_WIDTH + CARD_MARGIN}
        decelerationRate="fast"
        onMomentumScrollEnd={e => {
          // Atualiza índice do banner quando usuário solta o scroll
          const idx = Math.round(
            e.nativeEvent.contentOffset.x / (BANNER_WIDTH + CARD_MARGIN)
          )
          setBannerIndex(idx)
        }}
        contentContainerStyle={{ paddingHorizontal: CARD_MARGIN }}
      >
        {BANNERS.map((_, i) => (
          <View key={i} style={styles.bannerCard}>
            {/* Conteúdo interno do banner */}
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

      {/* BANNER INDICATORS */}
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

      {/* SECTION HEADER */}
      <View style={styles.sectionRow}>
        <Text style={styles.sectionTitle}>Últimas solicitações:</Text>
        <TouchableOpacity style={styles.filterButton} onPress={() => {/* abrir filtro */ }}>
          <MaterialIcons name="filter-list" size={18} color="#FFF" />
          <Text style={styles.filterButtonText}>Filtrar</Text>
        </TouchableOpacity>
      </View>

      {/* REQUESTS LIST */}
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            {/* Tag do card */}
            <View style={styles.tagBadge}>
              <Text style={styles.tagText}>{item.tag}</Text>
            </View>
            {/* Cabeçalho do card com usuário e hora */}
            <View style={styles.cardHeader}>
              <Feather name="user" size={16} color="#291F75" />
              <Text style={styles.cardUser}>{item.user} • {item.time}</Text>
            </View>
            {/* Conteúdo: imagem e textos */}
            <View style={styles.cardContent}>
              {/* <Image source={item.image} style={styles.cardImage} /> */}
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
              </View>
            </View>
            {/* Rodapé: endereço e botão denunciar */}
            <View style={styles.cardFooter}>
              <View style={styles.addressRow}>
                <Feather name="map-pin" size={14} color="#291F75" />
                <Text style={styles.cardAddress}>{item.address}</Text>
              </View>
              <TouchableOpacity style={styles.reportButton} onPress={() => handleDenounce(item)}>
                <Feather name="flag" size={14} color="#D25A5A" style={{ marginRight: 4 }} />
                <Text style={styles.reportText}>Denunciar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: height * 0.15 }}
      />

      {/* DENOUNCE MODAL */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Cabeçalho do modal */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Denunciar</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Feather name="x" size={20} color="#291F75" />
              </TouchableOpacity>
            </View>
            {/* Texto de confirmação */}
            <Text style={styles.modalText}>
              Você deseja denunciar o Usuário {' '}
              <Text style={styles.modalBold}>{selectedPost?.user}</Text> pelo post {' '}
              <Text style={styles.modalBold}>"{selectedPost?.title}"</Text>?
            </Text>
            {/* Ações do modal */}
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setModalVisible(false)}>
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirm} onPress={() => {/* confirmar denúncia */ }}>
                <Text style={styles.modalConfirmText}>Denunciar Post</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>


    </View>
  )
}

// Estilos gerais do componente
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, paddingTop: 40 },
  headerTitle: { fontFamily: 'Nunito-Bold', fontSize: 28, color: '#291F75' },
  welcomeText: { fontFamily: 'Nunito-SemiBold', fontSize: 16, color: '#291F75', paddingHorizontal: 16, marginBottom: 8 }, // Novo estilo para o texto de boas-vindas
  searchRow: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 8 },
  searchInput: { flex: 1, borderWidth: 1, borderColor: '#291F75', borderTopLeftRadius: 8, borderBottomLeftRadius: 8, paddingHorizontal: 12, height: 40 },
  searchBtn: { backgroundColor: '#291F75', paddingHorizontal: 12, height: 40, borderTopRightRadius: 8, borderBottomRightRadius: 8, alignItems: 'center', justifyContent: 'center' },
  // Banner styles
  bannerCard: { width: BANNER_WIDTH, height: BANNER_HEIGHT * 0.6, backgroundColor: '#EFAE0C', borderRadius: 12, padding: 16, marginRight: CARD_MARGIN },
  bannerContent: { flex: 1, justifyContent: 'center' },
  bannerTitle: { fontFamily: 'Nunito-Bold', fontSize: 18, color: '#291F75', lineHeight: 24 },
  bannerSubtitleBox: { backgroundColor: '#FFF', alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, marginTop: 8 },
  bannerSubtitle: { fontFamily: 'Nunito-Bold', fontSize: 14, color: '#291F75' },
  bannerDotsRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 8, marginBottom: 16 },
  bannerDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#FFFFFF88', marginHorizontal: 4 },
  bannerDotActive: { backgroundColor: '#584CAF' },
  // Section header
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginBottom: 16 },
  sectionTitle: { fontFamily: 'Nunito-Bold', fontSize: 16, color: '#291F75' },
  filterButton: { flexDirection: 'row', backgroundColor: '#291F75', padding: 8, borderRadius: 8, alignItems: 'center' },
  filterButtonText: { fontFamily: 'Nunito-Bold', fontSize: 12, color: '#FFF', marginLeft: 4 },
  // Card styles (solicitações)
  card: { backgroundColor: '#FFF', marginHorizontal: 16, padding: 16, borderRadius: 12, marginBottom: 16, elevation: 2 },
  tagBadge: { position: 'absolute', top: 16, right: 16, backgroundColor: '#FFF', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: '#291F75' },
  tagText: { fontFamily: 'Nunito-Bold', fontSize: 10, color: '#291F75' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  cardUser: { fontFamily: 'Nunito-Bold', fontSize: 12, color: '#291F75', marginLeft: 6 },
  cardContent: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  cardImage: { width: 48, height: 48, borderRadius: 8, marginRight: 12 },
  cardTitle: { fontFamily: 'Nunito-Bold', fontSize: 14, color: '#291F75', marginBottom: 4 },
  cardDesc: { fontSize: 12, color: '#291F75', marginBottom: 8 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  addressRow: { flexDirection: 'row', alignItems: 'center' },
  cardAddress: { fontFamily: 'Nunito-Bold', fontSize: 12, color: '#291F75', marginLeft: 4 },
  reportButton: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#D25A5A', paddingVertical: 4, paddingHorizontal: 8, borderRadius: 6 },
  reportText: { fontFamily: 'Nunito-Bold', fontSize: 12, color: '#D25A5A' },
  // Modal styles
  modalOverlay: { flex: 1, backgroundColor: '#00000055', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: width * 0.85, backgroundColor: '#FFF', borderRadius: 12, padding: 16 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  modalTitle: { fontFamily: 'Nunito-Bold', fontSize: 16, color: '#291F75' },
  modalText: { fontFamily: 'Nunito-Bold', fontSize: 14, color: '#291F75', marginBottom: 16 },
  modalBold: { fontWeight: 'bold' },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between' },
  modalCancel: { flex: 1, marginRight: 6, backgroundColor: '#EAEAEA', padding: 10, borderRadius: 8 },
  modalCancelText: { textAlign: 'center', fontFamily: 'Nunito-Bold', color: '#291F75' },
  modalConfirm: { flex: 1, marginLeft: 6, backgroundColor: '#D25A5A', padding: 10, borderRadius: 8, alignItems: 'center' },
  modalConfirmText: { fontFamily: 'Nunito-Bold', fontSize: 14, color: '#FFF' },
  // Tab Bar
  tabBar: { position: 'absolute', bottom: 0, width: '100%', flexDirection: 'row', backgroundColor: '#291F75', borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingVertical: 12, justifyContent: 'space-around' },
  tabItem: { alignItems: 'center', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
  activeTabItem: { backgroundColor: '#FFF' },
  tabText: { fontFamily: 'Nunito-Bold', fontSize: 12, marginTop: 4 },
  tabActiveText: { color: '#291F75' },
  tabInactiveText: { color: '#FFFFFF' },
})
export default HomePage