import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Constants from "expo-constants";
export default function TelaSeguranca() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Botão Voltar */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.push("/(protected)/Conta/page")}>
        <Ionicons name="arrow-back" size={18} color="#291f75" />
        <Text style={styles.backText}>Voltar</Text>
      </TouchableOpacity>

      {/* Título */}
      <Text style={styles.title}>Segurança</Text>

      {/* Opções */}
      <View style={styles.optionContainer}>
        <TouchableOpacity
          style={styles.option}
          onPress={() => router.push("./ModificarSenha.tsx")}
        >
          <View style={styles.row}>
            <Ionicons name="key-outline" size={20} color="#291f75" />
            <Text style={styles.optionText}>Modificar Senha</Text>
          </View>
          <Ionicons name="chevron-forward-outline" size={20} color="#291f75" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.option}
          onPress={() =>
            router.push("./ModificarEmail.tsx")
          } /* Modificar para o caminho da página de alterar o E-mail, assim como no de SeNha*/
        >
          <View style={styles.row}>
            <Ionicons name="mail-outline" size={20} color="#291f75" />
            <Text style={styles.optionText}>Modificar Email</Text>
          </View>
          <Ionicons name="chevron-forward-outline" size={20} color="#291f75" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 20,
    paddingTop: Constants.statusBarHeight,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E5E5F7",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  backText: {
    color: "#291f75",
    marginLeft: 6,
    fontWeight: "500",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#291f75",
    marginTop: 24,
    marginBottom: 16,
  },
  optionContainer: {
    borderTopWidth: 1,
    borderTopColor: "#291f75",
  },
  option: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#291f75",
  },
  optionText: {
    marginLeft: 10,
    fontSize: 16,
    color: "#291f75",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
});
