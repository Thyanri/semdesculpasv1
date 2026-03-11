<div align="center">

# ⚔️ Sem Desculpas

**Pare de enrolar. Comece em 2 minutos.**

Um app de produtividade radical que transforma suas tarefas em casos de um tribunal — onde cada adiamento vira um julgamento e cada entrega vira uma vitória.

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-12-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com/)

</div>

---

## 🧠 Conceito

**Sem Desculpas** é construído em cima de uma filosofia simples: *a ação mata a ansiedade*.

Cada tarefa que você cria vira um **caso** no seu tribunal pessoal. Se você não agir em 2 minutos, enfrenta o **Tribunal** — um julgamento onde você precisa justificar o adiamento. Não há como fugir: ou você faz, ou enfrenta a verdade de por que não fez.

### Mecânicas Principais

- **⏱️ Timer de 2 minutos** — Comece qualquer tarefa agora. Só 2 minutos. Sem desculpa.
- **⚖️ Tribunal** — Adiou? Julgue-se. Encare o motivo real e decida o próximo passo.
- **🔥 Modos de jogo** — Padrão, No Escape (sem fechar o timer) e Chain (3 tarefas seguidas).
- **📊 Relatórios** — Streak, sessões deep focus, adiamentos enfrentados, progresso diário.
- **🏆 Gamificação** — Leaderboards, ligas, conquistas e sistema +1 para micro-celebrações.
- **👥 Social** — Perfil, amigos, salas co-op e comunidade.
- **💸 Dívidas** — Rastreie compromissos pendentes que custam sessões para quitar.
- **⌨️ Command Line** — Interface via comandos para power users (`Ctrl+K`).
- **🎨 Temas** — Sistema de temas customizável com variáveis CSS.

## 🚀 Como Rodar

### Pré-requisitos

- [Node.js](https://nodejs.org/) (v18+)
- Conta no [Firebase](https://firebase.google.com/) (para auth e Firestore)
- Chave da [Gemini API](https://ai.google.dev/) (opcional, para funcionalidades de IA)

### Setup

```bash
# 1. Clone o repositório
git clone https://github.com/Thyanri/semdesculpas.git
cd semdesculpas

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com suas credenciais Firebase e Gemini API Key

# 4. Rode o app
npm run dev
```

O app estará disponível em `http://localhost:3000`.

### Variáveis de Ambiente

Veja `.env.example` para a lista completa. As principais são:

| Variável | Descrição |
|---|---|
| `GEMINI_API_KEY` | Chave da API Gemini (funcionalidades de IA) |
| `VITE_FIREBASE_API_KEY` | API Key do projeto Firebase |
| `VITE_FIREBASE_PROJECT_ID` | ID do projeto Firebase |
| `VITE_FIREBASE_APP_ID` | App ID do Firebase |
| `VITE_FIREBASE_AUTH_DOMAIN` | Domínio de autenticação |
| `VITE_FIREBASE_FIRESTORE_DATABASE_ID` | ID do banco Firestore |
| `VITE_FIREBASE_STORAGE_BUCKET` | Bucket de storage |

## 🏗️ Stack

| Tecnologia | Uso |
|---|---|
| **React 19** | UI e componentes |
| **TypeScript** | Tipagem estática |
| **Vite** | Build e dev server |
| **Tailwind CSS 4** | Estilização |
| **Firebase** | Auth, Firestore, Storage |
| **Framer Motion** | Animações |
| **Lucide React** | Ícones |
| **IndexedDB** | Armazenamento local offline |

## 📁 Estrutura do Projeto

```
src/
├── components/        # Componentes React
│   ├── overlays/      # Modais e overlays (Tribunal, Timer, Settings, etc.)
│   ├── Arena.tsx       # Tela principal com os casos
│   ├── TopBar.tsx      # Barra superior
│   └── PillNav.tsx     # Navegação inferior
├── data/              # Repositórios (Local + Mock + Sync)
├── domain/            # Modelos, ações e lógica de negócio
├── hooks/             # Custom hooks (tema, keybinds)
├── services/          # Serviços (sync com Firestore)
├── utils/             # Utilitários
├── App.tsx            # Componente principal
└── firebase.ts        # Configuração Firebase
```

## ⌨️ Atalhos

| Tecla | Ação |
|---|---|
| `Ctrl+K` | Command Line |
| `N` | Criar caso |
| `Enter` | Iniciar timer |
| `D` | Abrir Tribunal |
| `M` | Trocar modo |
| `R` | Relatórios |
| `T` | Temas |
| `?` | Ver todos os atalhos |

## 📝 Licença

Este projeto é de código aberto. Sinta-se livre para usar, modificar e distribuir.

---

<div align="center">

**Pare de pensar. Comece a fazer.** ⚔️

</div>
