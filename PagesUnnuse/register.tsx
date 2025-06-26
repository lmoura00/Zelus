import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from 'react-native'
import { useRouter } from 'expo-router'
import { Feather } from '@expo/vector-icons'

// Obtém dimensões da tela para centralizar o card
const { width, height } = Dimensions.get('window')
const CARD_WIDTH = width * 0.85    // largura do card = 85% da tela
const CARD_PADDING = 24            // padding interno do card

export default function Register() {
  const router = useRouter()       
  
  // Estados dos campos
  const [cpf, setCpf] = useState('')           
  const [email, setEmail] = useState('')        
  const [password, setPassword] = useState('') 
  const [confirm, setConfirm] = useState('')
  const [accepted, setAccepted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  // Função chamada ao clicar em "Cadastrar"
  const handleRegister = () => {
    // Remove caracteres não numéricos do CPF
    const apenasNumeros = cpf.replace(/\D/g, '')
    // Valida se tem 11 dígitos
    if (apenasNumeros.length !== 11) {
      alert('CPF inválido.')
      return
    }
    // Verifica campos obrigatórios e termos aceitos
    if (!cpf || !email.trim() || !password || password !== confirm || !accepted) {
      alert('Confira seus dados e aceite os termos.')
      return
    }
    // Simula requisição
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      router.replace('/login') // Navega para tela de login
    }, 800)
  }

  return (
    <View style={styles.container}>
      {/* Fundo amarelo */}
      <View style={styles.background} />

      {/* Botão voltar */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Feather name="arrow-left" size={20} color="#291F75" />
        <Text style={styles.backText}>Voltar</Text>
      </TouchableOpacity>

      {/* Cabeçalho com título e subtítulo */}
      <View style={styles.header}>
        <Text style={styles.title}>Zelus</Text>
        <Text style={styles.subtitle}>Exemplo de{`\n`}subtítulo</Text>
      </View>

      {/* Card central com formulário */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Cadastre-se</Text>

        {/* Campo CPF */}
        <Text style={styles.label}>CPF</Text>
        <TextInput
          style={styles.input}
          placeholder="Digite seu CPF..."
          placeholderTextColor="#918CBC"
          keyboardType="numeric"
          value={cpf}
          onChangeText={setCpf}
        />

        {/* Campo Email */}
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="Digite seu Email..."
          placeholderTextColor="#918CBC"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        {/* Campo Senha com botão de mostrar/esconder */}
        <Text style={styles.label}>Senha</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.inputWithIcon}
            placeholder="Digite sua Senha..."
            placeholderTextColor="#918CBC"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Feather name={showPassword ? 'eye-off' : 'eye'} size={20} color="#291F75" />
          </TouchableOpacity>
        </View>

        {/* Confirmar Senha com mesmo comportamento */}
        <Text style={styles.label}>Confirmar Senha</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.inputWithIcon}
            placeholder="Digite sua Senha Novamente..."
            placeholderTextColor="#918CBC"
            secureTextEntry={!showConfirm}
            value={confirm}
            onChangeText={setConfirm}
          />
          <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
            <Feather name={showConfirm ? 'eye-off' : 'eye'} size={20} color="#291F75" />
          </TouchableOpacity>
        </View>

        {/* Checkbox e link de termos de uso */}
        <View style={styles.termsRow}>
          <TouchableOpacity
            style={[styles.checkbox, accepted && styles.checkboxChecked]}
            onPress={() => setAccepted(!accepted)}
          >
            {accepted && <Text style={styles.checkmark}>✓</Text>}
          </TouchableOpacity>
          <Text style={styles.termsText}>
            Confirmo que li e aceito os{' '}
            <Text style={styles.linkText}>termos de uso</Text>
          </Text>
        </View>

        {/* Botão Cadastrar ou indicador de loading */}
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
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  background: { position: 'absolute', width, height, backgroundColor: '#EFAE0C' },
  backButton: {
    position: 'absolute', top: 40, left: 20,
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFFFFF', paddingHorizontal: 12,
    paddingVertical: 6, borderRadius: 20,
  },
  backText: { fontFamily: 'Nunito-Bold', fontSize: 14, color: '#291F75', marginLeft: 6 },
  header: { position: 'absolute', top: 80, left: 30 },
  title: { fontFamily: 'Nunito-Bold', fontSize: 32, color: '#FFFFFF' },
  subtitle: { fontFamily: 'Nunito-Bold', fontSize: 24, color: '#FFFFFF', marginTop: 4 },
  card: {
    position: 'absolute', top: height * 0.28, alignSelf: 'center',
    width: CARD_WIDTH, backgroundColor: '#FFFFFF',
    borderRadius: 20, padding: CARD_PADDING, elevation: 6,
  },
  cardTitle: { fontFamily: 'Nunito-Bold', fontSize: 24, color: '#291F75', textAlign: 'center', marginBottom: 16 },
  label: { fontFamily: 'Nunito-Bold', fontSize: 14, color: '#291F75', marginBottom: 4 },
  input: {
    borderWidth: 1, borderColor: '#291F75', borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 12, marginBottom: 12,
    fontFamily: 'Nunito-Bold',
  },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: '#291F75', borderRadius: 8,
    paddingHorizontal: 12, marginBottom: 12,
    height: 43.5,
  },
  inputWithIcon: {
    flex: 1,
    fontFamily: 'Nunito-Bold',
    fontSize: 14,
  },
  termsRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 1, flexWrap: 'wrap' },
  checkbox: { width: 20, height: 20, borderWidth: 1, borderColor: '#291F75', marginRight: 8, alignItems: 'center', justifyContent: 'center' },
  checkboxChecked: { backgroundColor: '#291F75' },
  checkmark: { color: '#FFFFFF', fontFamily: 'Nunito-Bold', fontSize: 14 },
  termsText: { fontFamily: 'Nunito-Bold', fontSize: 14, color: '#291F75' },
  linkText: { color: '#4AA3ED', fontFamily: 'Nunito-Bold' },
  primaryButton: { backgroundColor: '#44399D', borderRadius: 8, paddingVertical: 14, alignItems: 'center', marginTop: 12},
  primaryButtonText: { fontFamily: 'Nunito-Bold', fontSize: 18, color: '#FFFFFF' },
})
