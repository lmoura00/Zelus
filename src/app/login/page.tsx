import React, { use, useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Alert,
  Image
} from 'react-native'
import { useRouter } from 'expo-router'
import { Feather, FontAwesome } from '@expo/vector-icons'
import {useAuth} from '@/hooks/use-user'

const { width, height } = Dimensions.get('window')
const CARD_WIDTH = width * 0.85       
const CARD_PADDING = 24               

export default function LoginPage() {
  const {login} = useAuth()
  const router = useRouter()           
  const [email, setEmail] = useState('emilys')
  const [password, setPassword] = useState('emilyspass')
  const [loading, setLoading] = useState(false)

 
  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Erro', 'Preencha email e senha.')
      return
    }
    console.log('Tentando login com email:', email)
    console.log('Tentando login com senha:', password)
    setLoading(true)
    try {
      await login(email, password)
      setLoading(false)
      router.replace('/(protected)/home/page')
    } catch (error) {
      setLoading(false)
      Alert.alert('Erro', 'Email ou senha inválidos.')
      console.error('Login error:', error)
    }
  }

  return (
    <View style={styles.container}>

      <Image source={require('@/assets/background.png')} style={styles.background} />

   
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Feather name="arrow-left" size={20} color="#44399D" />
        <Text style={styles.backText}>Voltar</Text>
      </TouchableOpacity>


      <View style={styles.header}>
        <Text style={styles.title}>Zelus</Text>
        <Text style={styles.subtitle}>Exemplo de{`\n`}subtítulo</Text>
      </View>


      <View style={styles.card}>
        <Text style={styles.cardTitle}>Entrar</Text>


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

        <Text style={styles.label}>Senha</Text>
        <TextInput
          style={styles.input}
          placeholder="Digite sua Senha..."
          placeholderTextColor="#918CBC"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

  
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.primaryButtonText}>Entrar</Text>
          )}
        </TouchableOpacity>

        <View style={styles.separatorRow}>
          <View style={styles.separatorLine} />
          <Text style={styles.separatorText}>Conecte-se</Text>
          <View style={styles.separatorLine} />
        </View>

        {/* Botões para login social (Google/FB) */}
        <TouchableOpacity style={[styles.socialButton, styles.googleButton]}>
          <FontAwesome name="google" size={20} color="#FFFFFF" />
          <Text style={styles.socialText}>Conecte-se com Google</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.socialButton, styles.facebookButton]}>
          <FontAwesome name="facebook" size={20} color="#FFFFFF" />
          <Text style={styles.socialText}>Conecte-se com Facebook</Text>
        </TouchableOpacity>


      </View>
    </View>
  )
}


const styles = StyleSheet.create({
  container: { flex: 1 },
  background: { position: 'absolute', width, height, backgroundColor: '#EFAE0C' },

  // Botão voltar
  backButton: {
    position: 'absolute',
    top: 70,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  backText: {
    fontFamily: 'Nunito-Bold',
    fontSize: 14,
    color: '#44399D',
    marginLeft: 6,
  },
  header: {
    position: 'absolute',
    top: 120,
    left: 30,
  },
  title: {
    fontFamily: 'Nunito-Bold',
    fontSize: 32,
    color: '#FFFFFF',
  },
  subtitle: {
    fontFamily: 'Nunito-Bold',
    fontSize: 24,
    color: '#FFFFFF',
    marginTop: 4,
  },

  // Card de login
  card: {
    position: 'absolute',
    top: height * 0.28,
    alignSelf: 'center',
    width: CARD_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: CARD_PADDING,
    elevation: 6,
  },
  cardTitle: {
    fontFamily: 'Nunito-Bold',
    fontSize: 24,
    color: '#44399D',
    textAlign: 'center',
    marginBottom: 16,
  },

  // Labels e inputs
  label: {
    fontFamily: 'Nunito-Bold',
    fontSize: 14,
    color: '#44399D',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#44399D',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 12,
  },

  // Botão principal
  primaryButton: {
    backgroundColor: '#44399D',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  primaryButtonText: {
    fontFamily: 'Nunito-Bold',
    fontSize: 18,
    color: '#FFFFFF',
  },

  // Separador
  separatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#C0BBEA',
  },
  separatorText: {
    fontFamily: 'Nunito-Bold',
    fontSize: 14,
    color: '#C0BBEA',
    marginHorizontal: 8,
  },

  // Botões sociais
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  googleButton: { backgroundColor: '#44399D' },
  facebookButton: { backgroundColor: '#44399D' },
  socialText: {
    fontFamily: 'Nunito-Bold',
    fontSize: 16,
    marginLeft: 8,
    color: '#FFFFFF',
  },
})
