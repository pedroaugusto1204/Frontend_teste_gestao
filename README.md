# 🏗️ Gestão de Contratos & Controle de Obras — Frontend

Este repositório contém a aplicação **Frontend** do sistema de **Controle de Contratos & Gestão Orçamentária de Obras**, uma plataforma SaaS de alta performance com suporte nativo a multi-tenancy e gerenciamento centralizado de projetos. 

Desenvolvida com as práticas mais modernas do ecossistema React, a interface oferece painéis interativos de tomada de decisão, gestão ágil de contratos, simulação de assinaturas eletrônicas e relatórios financeiros detalhados de obras em tempo real.

---

## 🎨 Principais Funcionalidades

- **📊 Dashboard Consolidado:** Indicadores financeiros (KPIs) com gráficos ricos e dinâmicos (`Recharts`) para análise ágil de faturamento, custos de obras e quantidade de contratos ativos.
- **📄 Gestão Inteligente de Contratos:** Listagem estruturada com busca, filtros de status, e fluxo completo de criação. Possui cálculo dinâmico de vigência e alertas para contratos prestes a vencer.
- **✒️ Fluxo de Assinaturas Eletrônicas:** Integração visual de assinaturas eletrônicas simuladas, permitindo enviar links de assinatura e assinar digitalmente através do sistema.
- **🚧 Acompanhamento de Obras & Orçamentos:** Acompanhamento visual de 21 etapas críticas de obras, lançamentos de custos integrados e controle de saldo/estouro orçamentário.
- **🛍️ Pedidos de Compra (OC):** Geração e formatação de Ordens de Compra automáticas (`OC-ANO-SEQUENCIAL`), listagem de itens unitários e aprovação direta no painel.
- **🔐 Autenticação & Multi-Tenant:** Sistema completo de Login e Logout, com token JWT e refresh token, garantindo isolamento absoluto de dados entre diferentes empresas registradas.

---

## 🛠️ Stack Tecnológica

O frontend foi projetado visando excelente experiência do usuário, tipagem estrita e alto desempenho:

- **Core:** [React 19](https://react.dev) + [Vite](https://vite.dev) (Fast Refresh para desenvolvimento extremamente ágil)
- **Linguagem:** [TypeScript](https://www.typescriptlang.org) (Tipagem estrita e segurança em tempo de desenvolvimento)
- **Gerenciamento de Estado:** [Zustand](https://github.com/pmndrs/zustand) (Armazenamento global leve, altamente escalável e sem boilerplates complexos)
- **Comunicação API:** [Axios](https://axios-http.com) (Cliente HTTP robusto com interceptores de segurança e tratamento de retornos)
- **Estilização:** [Tailwind CSS v4](https://tailwindcss.com) (Estilização utilitária moderna de altíssima performance)
- **Animações:** [Motion / Framer Motion](https://motion.dev) (Micro-animações elegantes e fluidas para menus e modais)
- **Formulários:** [React Hook Form](https://react-hook-form.com) + [Zod](https://zod.dev) (Validação de schemas em tempo real e ótima performance de input)
- **Gráficos:** [Recharts](https://recharts.org) (Visualizações ricas, responsivas e interativas)
- **Ícones:** [Lucide React](https://lucide.dev) (Biblioteca moderna de ícones vetoriais)

---

## 🔌 Integração e Arquitetura da API

Para evitar retrabalho e garantir excelente organização, toda a comunicação com a API backend está estruturada em duas camadas principais:

### 1. Cliente Axios Centralizado (`src/services/api.ts`)
Toda chamada utiliza um cliente Axios customizado que lida de forma transparente com a infraestrutura de rede:
* **Request Interceptor:** Lê o token de autenticação diretamente do estado global do Zustand e o insere automaticamente no cabeçalho `Authorization: Bearer <token>` em todas as chamadas necessárias.
* **Response Interceptor:** 
  - Desembrulha automaticamente o padrão de resposta da API backend, entregando diretamente o objeto `data` aos métodos chamadores.
  - Captura erros `401 Unauthorized` de token expirado e executa silenciosamente o fluxo de logout, limpando a sessão local e redirecionando o usuário para a página de login por segurança.

### 2. Ponte de Estado (`src/store/index.ts`)
Toda a lógica de negócios e as rotinas assíncronas do Zustand realizam chamadas à API em tempo real. Ao fazer login, a função `fetchInitialData()` realiza o download sincronizado e paralelo dos dados essenciais do usuário logado (Contratos, Obras, Ordens de Compra, etc.), preenchendo dinamicamente todos os dashboards de forma imediata.

---

## 🚀 Instalação e Execução Local

Siga os passos simples abaixo para rodar o frontend em sua máquina local:

### 1. Pré-requisitos
Certifique-se de possuir instalado em sua máquina:
* [Node.js](https://nodejs.org) (Recomendado v18 ou superior)
* [npm](https://www.npmjs.com) (Gerenciador de pacotes padrão)

---

### 2. Configurando o Projeto

1. Abra o terminal na raiz da pasta do frontend (`Frontend_gestao_contratos`):
   ```bash
   npm install
   ```

2. Duplique o arquivo `.env.example` e crie o `.env` de configuração local:
   * **No Windows (PowerShell):**
     ```powershell
     Copy-Item .env.example .env
     ```
   * **No Linux / macOS (Terminal):**
     ```bash
     cp .env.example .env
     ```

3. Abra o arquivo `.env` gerado e certifique-se de que a variável aponta para o endereço local de desenvolvimento do seu backend:
   ```env
   VITE_API_URL="http://localhost:3001/api"
   VITE_APP_URL="http://localhost:3000"
   ```

---

### 3. Rodando em Desenvolvimento

Após concluir a configuração do backend e subir o banco de dados, execute o comando abaixo para iniciar o servidor de desenvolvimento do Vite:
```bash
npm run dev
```

* O frontend será executado e estará disponível em: **`http://localhost:3000`**
* Caso precise rodar a validação estática de tipos do TypeScript, use:
  ```bash
  npm run lint
  ```

---

### 4. Build de Produção

Caso queira gerar a versão otimizada e minificada para deploy de produção:
```bash
npm run build
```
Os arquivos gerados serão salvos na pasta `/dist`, prontos para serem servidos por qualquer servidor estático (como Nginx, Vercel ou Netlify).
