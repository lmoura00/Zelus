# Zelus - Aplicativo para Melhorias Urbanas em Timon-MA

![Zelus Banner](https://via.placeholder.com/800x200/2d3748/ffffff?text=Zelus+-+Sua+Cidade+em+Suas+Mãos)

Zelus é um aplicativo móvel desenvolvido para os cidadãos de Timon-MA reportarem e acompanharem melhorias urbanas na cidade, promovendo uma gestão pública mais participativa e eficiente.

## Tecnologias Utilizadas

**Tecnologias & Ferramentas**

<div style="display: flex; flex-wrap: wrap; gap: 10px; margin: 20px 0;">
  <img src="https://img.shields.io/badge/React_Native-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React Native">
  <img src="https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white" alt="Expo">
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/React_Query-FF4154?style=for-the-badge&logo=reactquery&logoColor=white" alt="React Query">
  <img src="https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white" alt="Axios">
  <img src="https://img.shields.io/badge/Google_Maps-4285F4?style=for-the-badge&logo=googlemaps&logoColor=white" alt="Google Maps">
</div>

### Bibliotecas Principais

- **React Native com Expo**: Framework principal com expo-router para navegação
- **TypeScript**: Linguagem para tipagem estática do código
- **TanStack Query (React Query)**: Gerenciamento de estado de dados
  ```bash
  npm install @tanstack/react-query
  # ou
  yarn add @tanstack/react-query
  ```
- **Axios**: Cliente HTTP para requisições à API
  ```bash
  npm install axios
  # ou
  yarn add axios
  ```
- **Expo Image Picker**: Seleção de imagens da galeria
  ```bash
  npx expo install expo-image-picker
  # ou
  yarn add expo-image-picker
  ```
- **React Native Maps**: Componente para mapas e geolocalização
  ```bash
  npx expo install react-native-maps
  # ou
  yarn add react-native-maps
  ```
- **React Native Dropdown Picker**: Menus suspensos interativos
  ```bash
  npm install react-native-dropdown-picker
  # ou
  yarn add react-native-dropdown-picker
  ```
- **React Native Swipe List View**: Listas com ações de arrastar
  ```bash
  npm install react-native-swipe-list-view
  # ou
  yarn add react-native-swipe-list-view
  ```

## Instalação e Configuração

### Pré-requisitos

- <img src="https://img.shields.io/badge/Node.js-339933?style=flat&logo=nodedotjs&logoColor=white" alt="Node.js"> v16.x ou superior
- npm ou <img src="https://img.shields.io/badge/Yarn-2C8EBB?style=flat&logo=yarn&logoColor=white" alt="Yarn">
- <img src="https://img.shields.io/badge/Expo_CLI-000020?style=flat&logo=expo&logoColor=white" alt="Expo CLI"> (`npm install -g expo-cli`)
- Conta no <img src="https://img.shields.io/badge/Google_Cloud-4285F4?style=flat&logo=googlecloud&logoColor=white" alt="Google Cloud"> para chave do Maps

### Passos de Instalação

1. Clone o repositório:
   ```bash
   git clone https://github.com/seu-usuario/zelus-app.git
   cd zelus-app
   ```

2. Instale as dependências:
   ```bash
   npm install
   # ou
   yarn install
   ```

3. Configure as variáveis de ambiente:
   Crie um arquivo `.env` na raiz do projeto com:
   ```
   GOOGLE_MAPS_API_KEY=sua_chave_aqui
   API_BASE_URL=https://api.zelus-timon.com.br
   ```

4. Execute o aplicativo:
   ```bash
   npx expo start
   ```
   - Pressione `a` para abrir no Android Emulator
   - Pressione `i` para abrir no iOS Simulator
   - Escaneie o QR code com o app Expo Go (dispositivo físico)

## Fluxo de Telas

### Autenticação
| Tela de Boas-Vindas | Tela de Login | Tela de Cadastro |
|---------------------|--------------|------------------|
| ![Onboarding](https://via.placeholder.com/150/4a5568/ffffff?text=+) | ![Login](https://via.placeholder.com/150/4a5568/ffffff?text=+) | ![Cadastro](https://via.placeholder.com/150/4a5568/ffffff?text=+) |

### Navegação Principal
| Tela Inicial | Solicitações | Perfil |
|--------------|--------------|--------|
| ![Home](https://via.placeholder.com/150/4a5568/ffffff?text=+) | ![Solicitações](https://via.placeholder.com/150/4a5568/ffffff?text=+) | ![Perfil](https://via.placeholder.com/150/4a5568/ffffff?text=+) |

### Funcionalidades-Chave
| Nova Solicitação | Detalhes | Mapa | Notificações |
|------------------|----------|------|--------------|
| ![Nova](https://via.placeholder.com/150/4a5568/ffffff?text=+) | ![Detalhes](https://via.placeholder.com/150/4a5568/ffffff?text=+) | ![Mapa](https://via.placeholder.com/150/4a5568/ffffff?text=+) | ![Notificações](https://via.placeholder.com/150/4a5568/ffffff?text=+) |

## Funcionalidades

- 📍 Reportar problemas urbanos com geolocalização precisa
- 📸 Anexar fotos como evidência das solicitações
- 🔔 Receber notificações em tempo real sobre atualizações
- 📊 Acompanhar histórico e status de todas suas solicitações
- 🗺️ Visualizar solicitações próximas em mapa interativo
- ⚙️ Gerenciar perfil e preferências de conta

## Contribuição

Contribuições são bem-vindas! Siga estes passos:

1. Faça um fork do projeto
2. Crie uma branch com sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Faça push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## Contato

**Prefeitura Municipal de Timon**  
Secretaria de Tecnologia e Inovação  
[tecnologia@timon.ma.gov.br](mailto:tecnologia@timon.ma.gov.br)  
(86) 3212-XXXX

---

**Zelus - Transformando Timon juntos!**  
*Sua participação faz a diferença na construção de uma cidade melhor.*