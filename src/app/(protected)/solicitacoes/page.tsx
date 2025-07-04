import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import SolicitacaoItem from "@/component/SolicitacaoItem"; 
import { useRouter, useSegments } from "expo-router";

const { width } = Dimensions.get("window");
const TAB_WIDTH = width / 3;

interface Solicitacao {
  id: string;
  usuario: string;
  tempo: string;
  tipo: string;
  titulo: string;
  descricao: string;
  endereco: string;
  imagem: string;
}

const SolicitacoesPage = () => {
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);

  const adicionarSolicitacao = () => {
    const novaSolicitacao = {
      id: Date.now().toString(),
      usuario: "Kalline Ferreira",
      tempo: "há 1d",
      tipo: "Pavimentação",
      titulo: "Rua com buraco",
      descricao: "rua com buraco, toda ferrada, tadinha da rua coitada...",
      endereco: "Vila do bec, N°292, bairro...",
      imagem: "https://via.placeholder.com/64x64.png?text=Buraco",
    };
    setSolicitacoes([novaSolicitacao, ...solicitacoes]);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Cabeçalho */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Zelus</Text>
        <TouchableOpacity style={styles.headerIcon}>
          <Ionicons name="notifications-outline" size={24} color="#291f75" />
        </TouchableOpacity>
      </View>

      {/* Campo de busca */}
      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Buscar minhas solicitações..."
          placeholderTextColor="#999"
          style={styles.searchInput}
        />
        <TouchableOpacity style={styles.searchButton}>
          <Ionicons name="search" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Título e filtro */}
      <View style={styles.filterContainer}>
        <Text style={styles.sectionTitle}>Minhas Solicitações:</Text>
        <TouchableOpacity style={styles.filterButton}>
          <Feather name="filter" size={18} color="#FFFFFF" />
          <Text style={styles.filterText}>Filtrar</Text>
        </TouchableOpacity>
      </View>

      {/* Lista de solicitações ou texto vazio */}
      {solicitacoes.length === 0 ? (
        <View style={{ flex: 1 }}>
          <Text style={styles.emptyText}>Nenhuma solicitação encontrada.</Text>
        </View>
      ) : (
        <FlatList
          data={solicitacoes}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <SolicitacaoItem
              usuario={item.usuario}
              tempo={item.tempo}
              tipo={item.tipo}
              titulo={item.titulo}
              descricao={item.descricao}
              endereco={item.endereco}
              imagem={item.imagem}
              onEditar={() => {}}
              onDeletar={() => {}}
            />
          )}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}

      {/* Botão flutuante */}
      <TouchableOpacity style={styles.addButton} onPress={adicionarSolicitacao}>
        <Ionicons name="add" size={32} color="#291f75" />
      </TouchableOpacity>

    
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: "bold",
    color: "#291f75",
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#f1effd",
    alignItems: "center",
    justifyContent: "center",
  },
  searchContainer: {
    flexDirection: "row",
    marginTop: 20,
    paddingHorizontal: 20,
  },
  searchInput: {
    flex: 1,
    height: 42,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    backgroundColor: "#f1effd",
    paddingHorizontal: 12,
    fontSize: 14,
  },
  searchButton: {
    backgroundColor: "#291f75",
    paddingHorizontal: 14,
    justifyContent: "center",
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
  filterContainer: {
    marginTop: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#291f75",
  },
  filterButton: {
    flexDirection: "row",
    backgroundColor: "#291f75",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  filterText: {
    color: "#FFFFFF",
    marginLeft: 6,
    fontSize: 14,
  },
  emptyText: {
    textAlign: "center",
    color: "#999",
    marginTop: 40,
  },
  addButton: {
    backgroundColor: "#EFAE0C",
    width: 56,
    height: 56,
    borderRadius: 28,
    position: "absolute",
    bottom: 80,
    right: 24,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  bottomNav: {
    flexDirection: "row",
    backgroundColor: "#291f75",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: "hidden",
  },
  tab: {
    width: TAB_WIDTH,
    alignItems: "center",
    paddingVertical: 10,
  },
  tabActive: {
    width: TAB_WIDTH,
    alignItems: "center",
    paddingVertical: 10,
    backgroundColor: "#3E2A9E",
  },
  tabLabel: {
    marginTop: 4,
    fontSize: 12,
    color: "#B0A8E8",
  },
});

export default SolicitacoesPage;