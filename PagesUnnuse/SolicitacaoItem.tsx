import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface SolicitacaoItemProps {
  usuario: string;
  tempo: string;
  tipo: string;
  titulo: string;
  descricao: string;
  endereco: string;
  imagem: string;
  onEditar?: () => void;
  onDeletar?: () => void;
}

export default function SolicitacaoItem({
  usuario,
  tempo,
  tipo,
  titulo,
  descricao,
  endereco,
  imagem,
  onEditar,
  onDeletar,
}: SolicitacaoItemProps) {
  return (
    <View style={styles.container}>
      {/* Cabeçalho */}
      <View style={styles.header}>
        <Ionicons name="person-circle" size={20} color="#291f75" />
        <Text style={styles.userText}>
          {usuario} • {tempo}
        </Text>
        <View style={styles.tipoTag}>
          <Text style={styles.tipoText}>{tipo}</Text>
        </View>
      </View>

      {/* Corpo com imagem e descrição */}
      <View style={styles.body}>
        <Image source={{ uri: imagem }} style={styles.image} />
        <View style={{ flex: 1 }}>
          <Text style={styles.titulo}>{titulo}</Text>
          <Text style={styles.descricao} numberOfLines={2}>
            Descrição: {descricao}
          </Text>
        </View>
      </View>

      {/* Endereço + botões */}
      <View style={styles.footer}>
        <View style={styles.endereco}>
          <Ionicons name="location-outline" size={16} color="#291f75" />
          <Text style={styles.enderecoText}>{endereco}</Text>
        </View>
        <View style={styles.botoes}>
          <TouchableOpacity style={styles.botaoEditar} onPress={onEditar}>
            <Text style={styles.botaoEditarText}>Editar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.botaoExcluir} onPress={onDeletar}>
            <Text style={styles.botaoExcluirText}>Deletar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    marginHorizontal: 20,
    borderColor: "#E0D8F8",
    borderWidth: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  userText: {
    marginLeft: 4,
    fontSize: 14,
    color: "#291f75",
    flex: 1,
  },
  tipoTag: {
    backgroundColor: "#f1effd",
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  tipoText: {
    fontSize: 12,
    color: "#291f75",
    fontWeight: "bold",
  },
  body: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 8,
  },
  image: {
    width: 64,
    height: 64,
    borderRadius: 8,
  },
  titulo: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#291f75",
  },
  descricao: {
    fontSize: 13,
    color: "#333",
  },
  footer: {
    flexDirection: "column",
  },
  endereco: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  enderecoText: {
    marginLeft: 4,
    fontSize: 13,
    color: "#291f75",
  },
  botoes: {
    flexDirection: "row",
    gap: 8,
  },
  botaoEditar: {
    borderColor: "#3b73c4",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  botaoEditarText: {
    color: "#3b73c4",
    fontWeight: "500",
  },
  botaoExcluir: {
    borderColor: "#ff5e5e",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  botaoExcluirText: {
    color: "#ff5e5e",
    fontWeight: "500",
  },
});
