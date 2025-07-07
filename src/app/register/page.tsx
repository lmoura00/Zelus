import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import axios from "axios";
import { api } from "@/api";

const { width, height } = Dimensions.get("window");
const CARD_WIDTH = width * 0.85;
const CARD_PADDING = 24;

export default function RegisterPage() {
  const router = useRouter();

  const [cpf, setCpf] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [name, setName] = useState("");

  const [cpfError, setCpfError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmError, setConfirmError] = useState("");
  const [nameError, setNameError] = useState("");

  const validateCpf = (value: string) => {
    const apenasNumeros = value.replace(/\D/g, "");
    if (apenasNumeros.length !== 11 || /^(\d)\1+$/.test(apenasNumeros)) {
      setCpfError("CPF inválido.");
    } else {
      setCpfError("");
    }
  };

  const validateEmail = (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value.trim())) {
      setEmailError("Email inválido.");
    } else {
      setEmailError("");
    }
  };

  const validatePassword = (value: string) => {
    if (value.length < 6) {
      setPasswordError("A senha deve ter no mínimo 6 caracteres.");
    } else {
      setPasswordError("");
    }
  };

  const validateConfirm = (value: string) => {
    if (value !== password) {
      setConfirmError("As senhas não coincidem.");
    } else {
      setConfirmError("");
    }
  };

  const validateName = (value: string) => {
    if (!value.trim()) {
      setNameError("Nome é obrigatório.");
    } else {
      setNameError("");
    }
  };

  const handleRegister = async () => {
    validateCpf(cpf);
    validateEmail(email);
    validatePassword(password);
    validateConfirm(confirm);
    validateName(name);

    if (
      cpfError ||
      emailError ||
      passwordError ||
      confirmError ||
      nameError ||
      !cpf ||
      !email ||
      !password ||
      !confirm ||
      !name
    ) {
      return;
    }

    if (!accepted) {
      alert("Você precisa aceitar os termos de uso.");
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post(`${api}/user`, {
        name: name.trim(),
        cpf: cpf.replace(/\D/g, ""),
        email: email.trim(),
        password,
      });
      console.log("Response:", response.status, response.data);
      if (response.status !== 201) {
        alert("Erro ao cadastrar usuário. Tente novamente.");
        return;
      }
      setLoading(false);
      alert("Usuário cadastrado com sucesso!");
      router.replace("/Login/page");
    } catch (error: any) {
      setLoading(false);
      if (error.response) {
        if (error.response.status === 500) {
          alert("Usuário já cadastrado.");
        } else if (error.response.status === 422) {
          alert("CPF inválido.");
        } else {
          alert("Erro ao cadastrar usuário. Tente novamente.");
        }
      } else {
        alert("Erro ao cadastrar usuário. Tente novamente.");
      }
      console.error("Error during registration:", error);
      console.log("Error response:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require("@/assets/background.png")}
        style={styles.background}
      />

      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Feather name="arrow-left" size={20} color="#291F75" />
        <Text style={styles.backText}>Voltar</Text>
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.title}>Zelus</Text>
        <Text style={styles.subtitle}>Exemplo de{`\n`}subtítulo</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Cadastre-se</Text>

        {/* Campo Nome */}
        <Text style={styles.label}>Nome</Text>
        <TextInput
          style={styles.input}
          placeholder="Digite seu nome..."
          placeholderTextColor="#918CBC"
          value={name}
          onChangeText={(value) => {
            setName(value);
            validateName(value);
          }}
          onBlur={() => validateName(name)}
        />
        {nameError ? <Text style={{ color: "red" }}>{nameError}</Text> : null}

        {/* CPF */}
        <Text style={styles.label}>CPF</Text>
        <TextInput
          style={styles.input}
          placeholder="Digite seu CPF..."
          placeholderTextColor="#918CBC"
          keyboardType="numeric"
          value={cpf}
          maxLength={11}
          onChangeText={(value) => {
            setCpf(value);
            validateCpf(value);
          }}
          onBlur={() => validateCpf(cpf)}
        />
        {cpfError ? <Text style={{ color: "red" }}>{cpfError}</Text> : null}

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="Digite seu Email..."
          placeholderTextColor="#918CBC"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={(value) => {
            setEmail(value);
            validateEmail(value);
          }}
          onBlur={() => validateEmail(email)}
        />
        {emailError ? <Text style={{ color: "red" }}>{emailError}</Text> : null}

        <Text style={styles.label}>Senha</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.inputWithIcon}
            placeholder="Digite sua Senha..."
            placeholderTextColor="#918CBC"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={(value) => {
              setPassword(value);
              validatePassword(value);
              validateConfirm(confirm);
            }}
            onBlur={() => validatePassword(password)}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Feather
              name={showPassword ? "eye-off" : "eye"}
              size={20}
              color="#291F75"
            />
          </TouchableOpacity>
        </View>
        {passwordError ? (
          <Text style={{ color: "red" }}>{passwordError}</Text>
        ) : null}

        <Text style={styles.label}>Confirmar Senha</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.inputWithIcon}
            placeholder="Digite sua Senha Novamente..."
            placeholderTextColor="#918CBC"
            secureTextEntry={!showConfirm}
            value={confirm}
            onChangeText={(value) => {
              setConfirm(value);
              validateConfirm(value);
            }}
            onBlur={() => validateConfirm(confirm)}
          />
          <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
            <Feather
              name={showConfirm ? "eye-off" : "eye"}
              size={20}
              color="#291F75"
            />
          </TouchableOpacity>
        </View>
        {confirmError ? (
          <Text style={{ color: "red" }}>{confirmError}</Text>
        ) : null}

        <View style={styles.termsRow}>
          <TouchableOpacity
            style={[styles.checkbox, accepted && styles.checkboxChecked]}
            onPress={() => setAccepted(!accepted)}
          >
            {accepted && <Text style={styles.checkmark}>✓</Text>}
          </TouchableOpacity>
          <Text style={styles.termsText}>
            Confirmo que li e aceito os{" "}
            <Text style={styles.linkText}>termos de uso</Text>
          </Text>
        </View>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.primaryButtonText}>Cadastrar</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  background: {
    position: "absolute",
    width,
    height,
    backgroundColor: "#EFAE0C",
    resizeMode: "cover",
  },
  backButton: {
    position: "absolute",
    top: 70,
    left: 20,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  backText: {
    fontFamily: "Nunito-Bold",
    fontSize: 14,
    color: "#291F75",
    marginLeft: 6,
  },
  header: {
    position: "absolute",
    top: 120,
    left: 30,
  },
  title: {
    fontFamily: "Nunito-Bold",
    fontSize: 32,
    color: "#FFFFFF",
  },
  subtitle: {
    fontFamily: "Nunito-Bold",
    fontSize: 24,
    color: "#FFFFFF",
    marginTop: 4,
  },
  card: {
    position: "absolute",
    top: height * 0.28,
    alignSelf: "center",
    width: CARD_WIDTH,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: CARD_PADDING,
    elevation: 6,
  },
  cardTitle: {
    fontFamily: "Nunito-Bold",
    fontSize: 24,
    color: "#291F75",
    textAlign: "center",
    marginBottom: 16,
  },
  label: {
    fontFamily: "Nunito-Bold",
    fontSize: 14,
    color: "#44399D",
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#44399D",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 12,
    fontFamily: "Nunito-Bold",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#44399D",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
    height: 43.5,
  },
  inputWithIcon: {
    flex: 1,
    fontFamily: "Nunito-Bold",
    fontSize: 14,
  },
  termsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 1,
    flexWrap: "wrap",
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: "#44399D",
    marginRight: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: { backgroundColor: "#44399D" },
  checkmark: { color: "#FFFFFF", fontFamily: "Nunito-Bold", fontSize: 14 },
  termsText: { fontFamily: "Nunito-Bold", fontSize: 14, color: "#44399D" },
  linkText: { color: "#4AA3ED", fontFamily: "Nunito-Bold" },
  primaryButton: {
    backgroundColor: "#44399D",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 12,
  },
  primaryButtonText: {
    fontFamily: "Nunito-Bold",
    fontSize: 18,
    color: "#FFFFFF",
  },
});
