import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import DropDownPicker from 'react-native-dropdown-picker';

export default function CreateRequestScreen() {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [items, setItems] = useState([
    { label: 'Iluminação', value: 'iluminacao' },
    { label: 'Pavimentação', value: 'pavimentacao' },
    { label: 'Árvores', value: 'arvores' },
    { label: 'Sinalização', value: 'sinalizacao' },
  ]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={20} color="#291F75" />
        <Text style={styles.backButtonText}>Voltar</Text>
      </TouchableOpacity>

      <Text style={styles.header}>Criar Solicitação</Text>

      <TouchableOpacity style={styles.imagePicker}>
        <Ionicons name="add" size={36} color="#5D559C" />
      </TouchableOpacity>

      <Text style={styles.label}>Título da Solicitação:</Text>
      <TextInput
        placeholder="Ex: Poste queimado"
        placeholderTextColor="#918CBC"
        style={styles.input}
      />

      <Text style={styles.label}>Descrição:</Text>
      <TextInput
        placeholder="Ex: Poste com problema na iluminação há mais de uma semana..."
        placeholderTextColor="#918CBC"
        style={[styles.input, styles.textarea]}
        multiline
      />

      <Text style={styles.label}>Tipo de Solicitação:</Text>
      <View style={[styles.dropdownWrapper, Platform.OS !== 'android' && { zIndex: 1000 }]}>
        <DropDownPicker
          listMode="SCROLLVIEW"
          open={open}
          value={selectedType}
          items={items}
          setOpen={setOpen}
          setValue={setSelectedType}
          setItems={setItems}
          placeholder="Selecione o tipo..."
          style={styles.dropdown}
          dropDownContainerStyle={styles.dropdownContainer}
          dropDownDirection="BOTTOM"
        />
      </View>

      <Text style={styles.label}>Local:</Text>
      <View style={styles.mapPlaceholder}>
        <Text style={{ color: '#5D559C' }}> Mapinha aqui</Text>
      </View>
      <TextInput
        placeholder="Ex: Av. Luís Firmino de Sousa, 3907 - Timon..."
        placeholderTextColor="#918CBC"
        style={styles.input}
      />

      <TouchableOpacity style={styles.submitButton}>
        <Text style={styles.submitButtonText}>Criar sua Solicitação</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#FFF' },
  backButton: {
    flexDirection: 'row',
    backgroundColor: '#F8F7FF',
    borderRadius: 18,
    marginVertical: 30,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
  },
  backButtonText: { color: '#291F75', fontSize: 16, marginLeft: 8, fontWeight: '500' },
  header: {
    fontSize: 22,
    fontWeight: '600',
    color: '#291F75',
    textAlign: 'center',
    marginBottom: 32,
  },
  imagePicker: {
    width: 120,
    height: 120,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#5D559C',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 32,
  },
  label: { fontSize: 16, color: '#291F75', fontWeight: '500', marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: '#5D559C',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#291F75',
    marginBottom: 24,
  },
  textarea: { height: 100, textAlignVertical: 'top' },
  dropdownWrapper: { marginBottom: 24 },
  dropdown: { borderColor: '#5D559C' },
  dropdownContainer: { borderColor: '#5D559C' },
  mapPlaceholder: {
    height: 120,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#5D559C',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  submitButton: {
    backgroundColor: '#291F75',
    paddingVertical: 16,
    borderRadius: 8,
    marginBottom: 40,
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
