// tive que instalar o npm install react-native-swipe-list-view para da o feito de deslizar 



import React, { useState, useEffect, useRef } from 'react';
import {View,Text,StyleSheet,TouchableOpacity,ActivityIndicator,Animated,} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { SwipeListView } from 'react-native-swipe-list-view';

type Notification = {
  id: string;
  title: string;
  time: string;
  isRead: boolean;
};

const NOTIFICACOES_INICIAIS: Notification[] = [
  { id: '1', title: 'Status atualizado da sua solicitação de "Buraco na rua"', time: 'há 7h', isRead: false },
  { id: '2', title: 'Sua solicitação de "Poste sem luz" foi recebida e está em análise.', time: 'há 12h', isRead: false },
  { id: '3', title: 'Solicitação aceita.', time: 'há 2d', isRead: true },
  { id: '4', title: 'Solicitação enviada', time: 'há 4d', isRead: true },
];

export default function PaginaDeNotificacoes() {
  const [activeTab, setActiveTab] = useState<'Tudo' | 'Não Lidas'>('Tudo');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const globalDataRef = useRef<Notification[]>(NOTIFICACOES_INICIAIS);

  useEffect(() => {
    setNotifications(globalDataRef.current);
    setLoading(false);
  }, []);

  const marcarComoLida = (id: string) => {
    globalDataRef.current = globalDataRef.current.map(n =>
      n.id === id ? { ...n, isRead: true } : n
    );
    setNotifications(globalDataRef.current);
  };

  const handleDelete = (id: string) => {
    globalDataRef.current = globalDataRef.current.filter(n => n.id !== id);
    setNotifications(globalDataRef.current);
  };

  const filteredNotificacoes =
    activeTab === 'Tudo'
      ? notifications.filter(n => n.isRead)
      : notifications.filter(n => !n.isRead);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={18} color="#291F75" />
          <Text style={styles.backText}>Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Minhas Notificações</Text>
      </View>

      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'Tudo' && styles.activeTab]}
          onPress={() => setActiveTab('Tudo')}
        >
          <Text style={[styles.tabText, activeTab === 'Tudo' && styles.activeTabText]}>Tudo</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'Não Lidas' && styles.activeTab]}
          onPress={() => setActiveTab('Não Lidas')}
        >
          <Text style={[styles.tabText, activeTab === 'Não Lidas' && styles.activeTabText]}>Não Lidas</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#4639AA" />
      ) : (
        <SwipeListView
          data={filteredNotificacoes}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Animated.View style={styles.rowFront}>
              <TouchableOpacity
                onPress={() => marcarComoLida(item.id)}
                activeOpacity={0.8}
              >
                <View style={styles.notificationItem}>
                  <View
                    style={[
                      styles.dot,
                      {
                        backgroundColor: !item.isRead ? '#4639AA' : '#ACA4EB',
                      },
                    ]}
                  />
                  <Text style={styles.notificationText}>{item.title}</Text>
                  <Text style={styles.notificationTime}>{item.time}</Text>
                </View>
              </TouchableOpacity>
            </Animated.View>
          )}
          renderHiddenItem={({ item }) => (
            <View style={styles.rowBack}>
              <TouchableOpacity
                onPress={() => handleDelete(item.id)}
                style={styles.deleteBox}
              >
                <Ionicons name="trash-outline" size={20} color="white" />
                <Text style={styles.deleteText}>Excluir</Text>
              </TouchableOpacity>
            </View>
          )}
          rightOpenValue={-100}
          rightActivationValue={-100}
          rightActionValue={-100}
          stopRightSwipe={-100}
          swipeToOpenPercent={50}
          swipeToClosePercent={30}
          disableRightSwipe
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          friction={8}
          tension={40}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  header: {
    marginBottom: 20,
  },
  backButton: {
    marginTop:30,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F7FF',
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
  },
  backText: {
    color: '#291F75',
    fontWeight: '600',
    marginLeft: 6,
    fontSize: 14,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#291F75',
    textAlign: 'center',
    marginTop: 12,
  },
  tabsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginRight: 10,
    backgroundColor: '#F8F7FF',
    borderWidth: 1.5, 
    borderColor: '#6F67AD',

 
  },
  activeTab: {
    backgroundColor: '#4639AA',
    
  },
  tabText: {
    color: '#4639AA',
    fontWeight: '600',
    
  },
  activeTabText: {
    color: '#FFFFFF',
    
  },
  listContainer: {
    paddingBottom: 20,
  },
  rowFront: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  notificationItem: {
    backgroundColor: '#F8F7FF',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
  },
  notificationText: {
    flex: 1,
    color: '#291F75',
    fontSize: 15,
    lineHeight: 22,
  },
  notificationTime: {
    color: '#ACA4EB',
    fontSize: 13,
    fontWeight: '500',
    marginLeft: 8,
  },
  rowBack: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    flexDirection: 'row',
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  deleteBox: {
    backgroundColor: '#FF3B30',
    width: 100,
    height: '99%',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  deleteText: {
    color: 'white',
    marginLeft: 5,
    fontWeight: 'bold',
  },
});
