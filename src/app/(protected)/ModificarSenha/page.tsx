import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const { width } = Dimensions.get("window");

export default function ModificarSenhaPage() {
  const router = useRouter();
  const [email, setEmail] = useState("KallineSilva@gmail.com");
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [showSenhaAtual, setShowSenhaAtual] = useState(false);
  const [showNovaSenha, setShowNovaSenha] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      {/* Botão Voltar */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={20} color="#291f75" />
        <Text style={styles.backLabel}>Voltar</Text>
      </TouchableOpacity>

      <View style={styles.inner}>
        {/* Modificar Senha */}
        <Text style={[styles.sectionTitle, { marginTop: 32 }]}>
          Modificar Senha
        </Text>
        <Text style={styles.inputLabel}>Senha atual</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            value={senhaAtual}
            onChangeText={setSenhaAtual}
            placeholder="Digite sua senha..."
            placeholderTextColor="#aaa"
            secureTextEntry={!showSenhaAtual}
            style={styles.input}
          />
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => setShowSenhaAtual((v) => !v)}
          >
            <Ionicons
              name={showSenhaAtual ? "eye-off-outline" : "eye-outline"}
              size={18}
              color="#291f75"
            />
          </TouchableOpacity>
        </View>

        <Text style={styles.inputLabel}>Nova Senha</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            value={novaSenha}
            onChangeText={setNovaSenha}
            placeholder="Digite sua nova senha..."
            placeholderTextColor="#aaa"
            secureTextEntry={!showNovaSenha}
            style={styles.input}
          />
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => setShowNovaSenha((v) => !v)}
          >
            <Ionicons
              name={showNovaSenha ? "eye-off-outline" : "eye-outline"}
              size={18}
              color="#291f75"
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionLabel}>Modificar a Senha</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const HORIZONTAL_PADDING = 20;
const BUTTON_HEIGHT = 48;
const INPUT_HEIGHT = 48;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    margin: HORIZONTAL_PADDING,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: "#EDEBFB",
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  backLabel: {
    marginLeft: 6,
    color: "#291f75",
    fontSize: 16,
  },
  inner: {
    flex: 1,
    paddingHorizontal: HORIZONTAL_PADDING,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#291f75",
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 14,
    color: "#291f75",
    marginBottom: 4,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#291f75",
    borderRadius: 8,
    height: INPUT_HEIGHT,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    height: "100%",
    fontSize: 14,
    color: "#291f75",
  },
  iconButton: {
    marginLeft: 8,
  },
  actionButton: {
    backgroundColor: "#291f75",
    height: BUTTON_HEIGHT,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  actionLabel: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
  },
});
