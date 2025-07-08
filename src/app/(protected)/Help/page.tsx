import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

type FAQ = {
  id: string;
  question: string;
  description: string;
};

const faqs: FAQ[] = [
  { id: '1', question: 'Meus dados estão protegidos?', description: 'Essa é uma descrição como exemplo' },
  { id: '2', question: 'Como denunciar algo?', description: 'Essa é uma descrição como exemplo' },
  { id: '3', question: 'Posso editar meu perfil?', description: 'Essa é uma descrição como exemplo' },
];

export default function HelpScreen() {
  const router = useRouter();

  const renderItem = ({ item }: { item: FAQ }) => (
    <TouchableOpacity style={styles.faqCard} onPress={() => console.log(`Abrir FAQ ${item.id}`)}>
      <Ionicons
        name="help-circle-outline"
        size={20}
        color="#291F75"
        style={styles.faqIcon}
      />
      <View style={{ flex: 1 }}>
        <Text style={styles.question}>{item.question}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={20} color="#291F75" />
        <Text style={styles.backText}>Voltar</Text>
      </TouchableOpacity>

      <Text style={styles.header}>Como podemos ajudar?</Text>

      <FlatList
        data={faqs}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.faqList}
      />

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Não encontrou sua dúvida?{'\n'}
          Envie um email para: contaExemplo@gmail.com
        </Text>
        <TouchableOpacity
          style={styles.contactButton}
          onPress={() => console.log('Chamar ação de contato')}
        >
          <Text style={styles.contactButtonText}>Entre em Contato Conosco</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  backButton: {
    flexDirection: 'row',
    backgroundColor: '#F8F7FF',
    borderRadius: 18,
    marginVertical: 30,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
  },

  backText: {
    color: '#291F75',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  header: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 24,
    color: '#291F75',
    textAlign: 'center',
  },
  faqList: { paddingBottom: 24 },
  faqCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F8F7FF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  faqIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  question: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
    color: '#291F75',
  },
  description: {
    fontSize: 14,
    fontWeight: '500',
    color: '#5D559C',
  },
  footer: { marginTop: 'auto', alignItems: 'center', paddingVertical: 16 },
  footerText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#291F75',
    fontWeight: '700',
    marginBottom: 12,
  },
  contactButton: {
    backgroundColor: '#291F75',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  contactButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});
