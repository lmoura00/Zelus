import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

type ReportModalProps = {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  username: string;
  postTitle: string;
};

export default function ReportModal({
  visible,
  onClose,
  onConfirm,
  username,
  postTitle,
}: ReportModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>

      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Denunciar</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#555" />
          </TouchableOpacity>
        </View>

        <View style={styles.separator} />

        <Text style={styles.modalMessage}>
          Você deseja denunciar o usuário <Text style={styles.bold}>{username}</Text>{' '}
          pelo post{" "}
          <Text style={styles.bold}>"{postTitle}"</Text>?
        </Text>

        <View style={styles.buttonRow}>
          <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onClose}>
            <Text style={[styles.buttonText, styles.cancelText]}>Cancelar</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button, styles.confirmButton]} onPress={onConfirm}>
            <Text style={[styles.buttonText, styles.confirmText]}>Denunciar Post</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  modalContainer: {
    position: 'absolute',
    top: '30%',
    left: '10%',
    right: '10%',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#291F75',
  },
  separator: {
    height: 2,
    backgroundColor: '#5D559C',
    width: 40,
    marginVertical: 12,
  },
  modalMessage: {
    fontSize: 16,
    color: '#291F75',
    lineHeight: 22,
    marginBottom: 20,
  },
  bold: {
    fontWeight: '600',
    color: '#291F75',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
    marginLeft: 12,
  },
  cancelButton: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#CCC',
  },
  cancelText: {
    color: '#555',
  },
  confirmButton: {
    backgroundColor: '#E74C3C',
  },
  confirmText: {
    color: '#FFF',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
