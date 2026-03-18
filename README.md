#  Nexus Wallet API

API REST para gerenciamento de carteira de criptomoedas com suporte a depósitos, saques e swap entre moedas.

**Teste Técnico - Desenvolvedor Backend**  
Candidato: Michel Gargel

---

##  Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Funcionalidades](#funcionalidades)
- [Melhorias Implementadas](#melhorias-implementadas)
- [Pré-requisitos](#pré-requisitos)
- [Instalação no Windows](#instalação-no-windows)
- [Configuração](#configuração)
- [Como Rodar o Projeto](#como-rodar-o-projeto)
- [Endpoints da API](#endpoints-da-api)
- [Estrutura de Pastas](#estrutura-de-pastas)
- [Testes](#testes)
- [Melhorias Futuras](#melhorias-futuras)

---

##  Sobre o Projeto

Este projeto é uma **API REST** completa para gerenciamento de carteiras de criptomoedas, desenvolvida como teste técnico para a empresa **Nexus**. 

A aplicação permite que usuários:
- Criem conta e façam login (autenticação JWT)
- Consultem saldo de suas carteiras
- Recebam depósitos via webhook
- Realizem saques
- Troquem criptomoedas (swap) usando cotações em tempo real

Todos os movimentos financeiros são registrados em um **sistema de ledger** (livro-razão) para auditoria completa.

---

## Notas sobre o desenvolvimento

- Alguns commits intermediários foram agrupados por otimização de tempo durante o desenvolvimento.
- O controller de autenticação foi adicionado posteriormente para completar o fluxo.
- Todo o projeto 100% finalizado



##  Tecnologias Utilizadas

### Obrigatórias (Requisitos do Teste)
- **Node.js** v18+ - Runtime JavaScript
- **TypeScript** - Superset tipado do JavaScript
- **NestJS** - Framework backend progressivo
- **PostgreSQL** - Banco de dados relacional
- **Prisma ORM** - Object-Relational Mapping moderno

### Extras (Melhorias Implementadas)
- **Docker & Docker Compose** - Containerização e orquestração
- **JWT (JSON Web Tokens)** - Autenticação segura
- **bcrypt** - Criptografia de senhas
- **class-validator** - Validação de DTOs
- **Swagger/OpenAPI** - Documentação automática da API
- **Winston** - Logs estruturados
- **Helmet** - Segurança HTTP
- **Throttler** - Rate limiting (proteção contra abuso)
- **Axios** - Cliente HTTP para integração com APIs externas
- **CoinGecko API** - Cotações de criptomoedas em tempo real

---

##  Funcionalidades

###  Autenticação
- **POST /api/auth/register** - Registro de novo usuário
- **POST /api/auth/login** - Login (retorna access token e refresh token)
- **POST /api/auth/refresh** - Renovar access token expirado

###  Carteira
- **GET /api/wallet/balance** - Consultar saldo de todas as carteiras
- **POST /api/wallet/withdraw** - Realizar saque

###  Swap (Troca de Criptomoedas)
- **POST /api/swap** - Realizar swap entre duas moedas (taxa de 1,5%)
- **POST /api/swap/preview** - Simular swap sem executar
- **GET /api/swap/currencies** - Listar moedas suportadas

###  Webhook (Depósitos)
- **POST /api/webhook/deposit** - Receber depósito via webhook (com idempotência)

###  Sistema de Ledger
- Todas as movimentações são registradas automaticamente
- Rastreamento completo para auditoria
- Saldo antes e depois de cada operação

---

##  Melhorias Implementadas

Além dos requisitos obrigatórios, implementei as seguintes melhorias:

### ✅ Infraestrutura
- ✅ **Docker Compose** completo (PostgreSQL + Redis)
- ✅ **Variáveis de ambiente** (.env) bem documentadas
- ✅ **Scripts npm** facilitados (docker:up, prisma:migrate, etc.)

### ✅ Segurança
- ✅ **Helmet** - Headers de segurança HTTP
- ✅ **Rate Limiting** - Proteção contra abuso (100 req/min)
- ✅ **Validações robustas** - class-validator em todos os DTOs
- ✅ **Senhas criptografadas** - bcrypt com 10 rounds
- ✅ **JWT com refresh token** - Access token (15min) + Refresh token (7 dias)

### ✅ Código
- ✅ **Arquitetura modular** - Separação clara de responsabilidades
- ✅ **Comentários detalhados** - TODO o código está comentado em português
- ✅ **Tratamento de erros global** - Respostas padronizadas
- ✅ **Logs estruturados** - Winston com logs em arquivo e console
- ✅ **Transações atômicas** - Prisma transactions para operações críticas

### ✅ Documentação
- ✅ **Swagger/OpenAPI** - Documentação interativa em `/api/docs`
- ✅ **README completo** - Este arquivo
- ✅ **COMMITS_SUGERIDOS.md** - Roteiro de commits graduais
- ✅ **.env.example** - Exemplo de configuração

### ✅ Funcionalidades Extras
- ✅ **Idempotência** - Webhook não processa mesmo depósito 2x
- ✅ **Preview de Swap** - Simulação antes de executar
- ✅ **Múltiplas moedas** - Suporte a 12+ criptomoedas
- ✅ **Integração CoinGecko** - Cotações reais em tempo real

---

##  Pré-requisitos

Antes de começar, certifique-se de ter instalado:

### No Windows:
1. **Node.js v18+** - [Download](https://nodejs.org/)
2. **Docker Desktop** - [Download](https://www.docker.com/products/docker-desktop/)
3. **Git** - [Download](https://git-scm.com/downloads)
4. **Editor de código** - VS Code recomendado

### Verificar instalações:
```bash
# Abra o PowerShell ou CMD e execute:
node --version    # Deve mostrar v18.x.x ou superior
npm --version     # Deve mostrar 9.x.x ou superior
docker --version  # Deve mostrar Docker version 20.x.x ou superior
git --version     # Deve mostrar git version 2.x.x
```

---

## Instalação no Windows

### Passo 1: Clonar o repositório
```bash
# Abra o PowerShell ou CMD
# Navegue até a pasta onde quer salvar o projeto
cd C:\Users\SeuUsuario\Documents

# Clone o repositório (ajuste a URL conforme necessário)
git clone <url-do-repositorio>
cd nexus-backend
```

### Passo 2: Instalar dependências
```bash
# Instala todas as dependências do projeto
npm install
```

### Passo 3: Configurar variáveis de ambiente
```bash
# Copie o arquivo de exemplo
copy .env.example .env

# Edite o .env com seu editor preferido
# No VS Code:
code .env

# OU no Bloco de Notas:
notepad .env
```

**IMPORTANTE:** Altere as seguintes variáveis no `.env`:
```env
# Altere os secrets para valores aleatórios e seguros!
JWT_SECRET="seu-secret-super-secreto-mude-isso"
JWT_REFRESH_SECRET="seu-refresh-secret-super-secreto-mude-isso"
```

### Passo 4: Iniciar o Docker
```bash
# Inicia os containers do PostgreSQL e Redis
npm run docker:up

# Aguarde alguns segundos para os containers iniciarem
# Você verá logs indicando que os serviços estão rodando
```

### Passo 5: Configurar o banco de dados
```bash
# Gera o Prisma Client
npm run prisma:generate

# Executa as migrations (cria as tabelas)
npm run prisma:migrate

# (Opcional) Abrir Prisma Studio para visualizar o banco
npm run prisma:studio
```

### Passo 6: Rodar a aplicação
```bash
# Modo desenvolvimento (com hot-reload)
npm run start:dev

# A aplicação estará disponível em:
# http://localhost:3000
# Documentação Swagger em:
# http://localhost:3000/api/docs
```

---

## Configuração

### Variáveis de Ambiente (.env)

```env
# Banco de Dados
DATABASE_URL="postgresql://nexus:nexus123@localhost:5432/nexus_wallet?schema=public"

# JWT (ALTERE EM PRODUÇÃO!)
JWT_SECRET="seu-secret-super-secreto-aqui"
JWT_REFRESH_SECRET="seu-refresh-secret-super-secreto-aqui"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# Aplicação
PORT=3000
NODE_ENV="development"

# Redis (opcional - para rate limiting avançado)
REDIS_HOST="localhost"
REDIS_PORT=6379

# CoinGecko API
COINGECKO_API_URL="https://api.coingecko.com/api/v3"

# Swap
SWAP_FEE_PERCENTAGE=1.5

# Rate Limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=100
```

---

## Como Rodar o Projeto

### Desenvolvimento
```bash
# Inicia containers
npm run docker:up

# Inicia a aplicação em modo dev (com hot-reload)
npm run start:dev
```

### Produção
```bash
# Build da aplicação
npm run build

# Inicia em modo produção
npm run start:prod
```

### Scripts Úteis
```bash
# Docker
npm run docker:up       # Inicia containers
npm run docker:down     # Para containers
npm run docker:logs     # Visualiza logs

# Prisma
npm run prisma:generate # Gera Prisma Client
npm run prisma:migrate  # Executa migrations
npm run prisma:studio   # Interface visual do banco

# Código
npm run format          # Formata código com Prettier
npm run lint            # Verifica erros com ESLint
npm run test            # Executa testes
```

---

## Endpoints da API

### Documentação Interativa
Acesse a documentação completa e interativa (Swagger) em:
```
http://localhost:3000/api/docs
```

### Exemplos de Requisições

#### 1. Registrar Usuário
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "João Silva",
  "email": "joao@example.com",
  "password": "Senha@123"
}
```

#### 2. Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "joao@example.com",
  "password": "Senha@123"
}

# Resposta:
{
  "message": "Login realizado com sucesso",
  "user": {
    "id": "uuid",
    "name": "João Silva",
    "email": "joao@example.com"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### 3. Consultar Saldo (requer autenticação)
```http
GET /api/wallet/balance
Authorization: Bearer SEU_ACCESS_TOKEN

# Resposta:
{
  "wallets": [
    {
      "currency": "BTC",
      "balance": "0.5",
      "updatedAt": "2024-01-01T12:00:00.000Z"
    }
  ],
  "total": 1
}
```

#### 4. Depósito via Webhook
```http
POST /api/webhook/deposit
Content-Type: application/json

{
  "userEmail": "joao@example.com",
  "currency": "BTC",
  "amount": 1.5,
  "externalId": "ext-deposit-123456"
}
```

#### 5. Saque (requer autenticação)
```http
POST /api/wallet/withdraw
Authorization: Bearer SEU_ACCESS_TOKEN
Content-Type: application/json

{
  "currency": "BTC",
  "amount": 0.5,
  "address": "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"
}
```

#### 6. Swap (requer autenticação)
```http
POST /api/swap
Authorization: Bearer SEU_ACCESS_TOKEN
Content-Type: application/json

{
  "fromCurrency": "BTC",
  "toCurrency": "ETH",
  "amount": 0.1
}
```

#### 7. Preview de Swap (requer autenticação)
```http
POST /api/swap/preview
Authorization: Bearer SEU_ACCESS_TOKEN
Content-Type: application/json

{
  "fromCurrency": "BTC",
  "toCurrency": "ETH",
  "amount": 0.1
}
```

---

## Estrutura de Pastas

```
nexus-backend/
├── prisma/                      # Configuração do Prisma ORM
│   └── schema.prisma           # Schema do banco (modelos/tabelas)
│
├── src/                        # Código-fonte da aplicação
│   ├── auth/                   # Módulo de autenticação
│   │   ├── decorators/         # Decorators customizados (@CurrentUser, @Public)
│   │   ├── dto/                # DTOs (RegisterDto, LoginDto, RefreshTokenDto)
│   │   ├── guards/             # Guards (JwtAuthGuard)
│   │   ├── strategies/         # Estratégias Passport (JwtStrategy)
│   │   ├── auth.controller.ts  # Controller (rotas)
│   │   ├── auth.module.ts      # Módulo NestJS
│   │   └── auth.service.ts     # Lógica de negócio
│   │
│   ├── wallet/                 # Módulo de carteira
│   │   ├── dto/                # DTOs (WithdrawDto)
│   │   ├── wallet.controller.ts
│   │   ├── wallet.module.ts
│   │   └── wallet.service.ts   # Gerenciamento de saldos
│   │
│   ├── ledger/                 # Módulo de ledger (livro-razão)
│   │   ├── ledger.module.ts
│   │   └── ledger.service.ts   # Registro de movimentações
│   │
│   ├── swap/                   # Módulo de swap
│   │   ├── dto/                # DTOs (SwapDto)
│   │   ├── coingecko.service.ts # Integração com CoinGecko API
│   │   ├── swap.controller.ts
│   │   ├── swap.module.ts
│   │   └── swap.service.ts     # Lógica de swap
│   │
│   ├── webhook/                # Módulo de webhook
│   │   ├── dto/                # DTOs (DepositDto)
│   │   ├── webhook.controller.ts
│   │   ├── webhook.module.ts
│   │   └── webhook.service.ts  # Processamento de depósitos
│   │
│   ├── prisma/                 # Módulo do Prisma
│   │   ├── prisma.module.ts
│   │   └── prisma.service.ts   # Conexão com banco
│   │
│   ├── common/                 # Código compartilhado
│   │   └── filters/
│   │       └── all-exceptions.filter.ts # Tratamento global de erros
│   │
│   ├── app.module.ts           # Módulo raiz da aplicação
│   └── main.ts                 # Ponto de entrada (bootstrap)
│
├── logs/                       # Logs da aplicação (gerado automaticamente)
├── .env                        # Variáveis de ambiente (não versionado)
├── .env.example                # Exemplo de .env
├── docker-compose.yml          # Configuração Docker
├── package.json                # Dependências e scripts
├── tsconfig.json               # Configuração TypeScript
├── nest-cli.json               # Configuração NestJS CLI
├── README.md                   # Este arquivo
└── COMMITS_SUGERIDOS.md        # Roteiro de commits graduais
```

---
##  Testes

```bash
# Executar testes unitários
npm run test

# Executar testes com coverage
npm run test:cov

# Executar testes e2e
npm run test:e2e
```

**Nota:** Testes básicos podem ser implementados futuramente. A arquitetura modular facilita a criação de testes.
---

## Melhorias Futuras

Ideias para evolução do projeto:

### Funcionalidades
- [ ] Histórico completo de transações por usuário
- [ ] Paginação nos endpoints de histórico
- [ ] Filtros avançados (por data, tipo, moeda)
- [ ] Exportação de extratos (PDF/CSV)
- [ ] Notificações por email em transações
- [ ] 2FA (autenticação de dois fatores)
- [ ] Limites diários de saque/swap
- [ ] KYC (Know Your Customer) básico

### Técnicas
- [ ] Testes unitários completos (Jest)
- [ ] Testes de integração (Supertest)
- [ ] CI/CD com GitHub Actions
- [ ] Deploy em produção (AWS/Heroku)
- [ ] Monitoramento (Sentry, DataDog)
- [ ] Cache com Redis
- [ ] Filas de processamento (Bull)
- [ ] GraphQL como alternativa ao REST
- [ ] Websockets para atualizações em tempo real

---

## Licença

Este projeto foi desenvolvido como teste técnico para a empresa Nexus.

---

## Autor

**Michel Gargel**  
Desenvolvedor Backend  
[LinkedIn](www.linkedin.com/in/michelgargel-cloud) | [GitHub](https://github.com/GargelMichel/nexus-wallet-api)

---

## Agradecimentos

Agradeço à equipe da Nexus pela oportunidade de participar deste processo seletivo e demonstrar minhas habilidades através deste projeto.

---


