# 🎵 LofiVora - Your Personal Lo-fi Focus Space

> **Acesse em:** [lofivora.space](https://lofivora.space)

Uma aplicação web imersiva que cria o ambiente perfeito para foco e produtividade, combinando música lo-fi relaxante com ferramentas de gerenciamento de tarefas e técnica Pomodoro.

## ✨ Características Principais

### 🎶 **Experiência Musical Lo-fi**
- Playlists cuidadosamente selecionadas do YouTube
- Áudio persistente que continua mesmo após reload da página
- Controle de volume inteligente
- Modo vídeo e modo imagem com cenários relaxantes

### 🧘 **Ambiente Imersivo**
- Efeito de chuva animado em tempo real
- Gradientes suaves inspirados na noite
- Transições fluidas com Framer Motion
- Design responsivo para desktop e mobile

### ⚡ **Ferramentas de Produtividade**
- **Timer Pomodoro** com sessões de trabalho, pausa curta e pausa longa
- **Gerenciador de Tarefas** com criação, edição e conclusão
- **Contador de Pomodoros** por tarefa
- **Status de Tarefa Ativa** sempre visível

### 💰 **Monetização Integrada**
- Google AdSense configurado discretamente
- Anúncios responsivos que não interferem na experiência
- Posicionamento sutil em sidebar e banners

## 🛠️ Tecnologias Utilizadas

- **Framework:** Next.js 15.4.1 com App Router
- **UI Library:** Material-UI (MUI) v7.2.0
- **Animações:** Framer Motion v11.18.2
- **Player de Vídeo:** React YouTube v10.1.0
- **Linguagem:** JavaScript/React 19.1.0
- **Estilos:** CSS-in-JS com MUI System

## 🚀 Como Executar Localmente

### 1. Pré-requisitos
- Node.js 18+ instalado
- NPM ou Yarn

### 2. Instalação
```bash
# Clone o repositório
git clone https://github.com/Advansoftware/flowvora.git
cd flowvora

# Instale as dependências
npm install
# ou
yarn install
```

### 3. Desenvolvimento
```bash
# Execute o servidor de desenvolvimento
npm run dev
# ou
yarn dev

# Acesse em http://localhost:3000
```

### 4. Build para Produção
```bash
# Gere o build otimizado
npm run build
npm run start
# ou
yarn build
yarn start
```

## 📁 Estrutura do Projeto

```
src/
├── app/                    # App Router do Next.js
│   ├── layout.js          # Layout raiz com ThemeProvider
│   └── page.js            # Página principal
├── components/            # Componentes reutilizáveis
│   ├── widgets/           # Widgets (Pomodoro, Tasks)
│   ├── AdSenseComponent.jsx
│   ├── VisualFrame.js     # Player de vídeo/imagem
│   ├── RainEffect.jsx     # Efeito de chuva animado
│   └── WelcomeModal.jsx   # Modal de boas-vindas
├── contexts/              # Context APIs
│   └── PlayerContext.js   # Estado global do player
├── hooks/                 # Custom hooks
│   ├── usePersistentAudio.js
│   └── usePlayer.js
├── data/                  # Dados estáticos
│   ├── playlists.json     # Configuração das playlists
│   ├── quotes.js          # Frases inspiradoras
│   └── scenes.json        # Cenários visuais
└── config/                # Configurações
    └── adsense.js         # Configuração do Google AdSense
```

## 🎯 Funcionalidades Detalhadas

### Player de Música
- **Múltiplas Playlists:** Jazz lo-fi, Chill hop, Study beats, Nature sounds
- **Persistência:** Estado salvo no localStorage
- **Autoplay Inteligente:** Respeitando políticas dos navegadores
- **Controles Discretos:** Volume, play/pause, troca de playlist

### Sistema de Tarefas
- **CRUD Completo:** Criar, editar, marcar como concluída, excluir
- **Integração Pomodoro:** Contador de sessões por tarefa
- **Status Visual:** Indicador da tarefa ativa sempre visível
- **Ordenação Inteligente:** Ativas primeiro, depois por data de criação

### Timer Pomodoro
- **Três Modos:** Trabalho (25min), Pausa Curta (5min), Pausa Longa (15min)
- **Controles Globais:** Integração com sistema de tarefas
- **Visual Atrativo:** Interface circular com gradientes

### Sistema de Tema
- **Lo-fi Aesthetic:** Cores escuras com acentos violeta/azul
- **Efeitos Glassmorphism:** Transparências e blur effects
- **Responsivo:** Adaptação perfeita para mobile e desktop

## 🔧 Configuração do AdSense

Para monetizar com Google AdSense, siga as instruções em `ADSENSE_SETUP.md`:

1. **Criar conta no AdSense** e obter aprovação
2. **Configurar unidades de anúncio:**
   - Sidebar Desktop (160x600)
   - Banner Mobile (Responsivo)
   - Banner Inferior (728x90)
3. **Atualizar `src/config/adsense.js`** com seus IDs
4. **Deploy e teste** em produção

## 🌐 Deploy

### Vercel (Recomendado)
```bash
# Deploy automático conectando ao GitHub
# Acesse: https://vercel.com/new
```

### Outros Provedores
```bash
# Build estático
npm run build

# Servir arquivos da pasta .next
```

## 📱 Responsividade

- **Mobile First:** Layout otimizado para celulares
- **Breakpoints:** sm (600px), md (900px), lg (1200px), xl (1536px)
- **Layouts Adaptativos:** Stack vertical no mobile, grid no desktop
- **Controles Touch:** Gestos otimizados para touch devices

## 🤝 Contribuindo

1. Fork o projeto
2. Crie sua branch de feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🏃‍♂️ Próximos Passos

- [ ] Implementar sistema de usuários
- [ ] Adicionar mais opções de customização visual
- [ ] Integrar com APIs de música (Spotify, Apple Music)
- [ ] Sistema de conquistas e gamificação
- [ ] PWA para instalação no dispositivo
- [ ] Sincronização entre dispositivos

## 📞 Suporte

- **Website:** [lofivora.space](https://lofivora.space)
- **Issues:** [GitHub Issues](https://github.com/Advansoftware/flowvora/issues)
- **Email:** suporte@lofivora.space

---

Feito com 💜 pela equipe LofiVora
