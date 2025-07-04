import { AuthProvider } from '@/context/user-context' 
import { Slot } from 'expo-router'

export default function RootLayout() {
  return (
    <AuthProvider>
      <Slot /> 
    </AuthProvider>
  )
}