## 1. Criar Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com) e faça login
2. Clique em "New Project"
3. Escolha sua organização
4. Preencha:
   - **Name**: DCA Bitcoin
   - **Database Password**: Crie uma senha forte
   - **Region**: South America (São Paulo) - sa-east-1
5. Clique em "Create new project"

### 2. Configurar Autenticação Google

1. No painel do Supabase, vá para **Authentication > Providers**
2. Encontre "Google" e clique em "Configure"
3. Ative o toggle "Enable sign in with Google"
4. Você precisará das credenciais do Google OAuth (próximo passo)

### 3. Obter Credenciais do Supabase

1. Vá para **Settings > API**
2. Copie as seguintes informações:
   - **Project URL**
   - **anon public key**
   - **service_role key** (mantenha em segredo)

## Configuração do Google OAuth

### 1. Criar Projeto no Google Cloud Console

1. Acesse [console.cloud.google.com](https://console.cloud.google.com)
2. Crie um novo projeto ou selecione um existente
3. Ative a **Google+ API**

### 2. Configurar OAuth 2.0

1. Vá para **APIs & Services > Credentials**
2. Clique em "Create Credentials" > "OAuth 2.0 Client IDs"
3. Configure:
   - **Application type**: Web application
   - **Name**: DCA Bitcoin
   - **Authorized JavaScript origins**: 
     - `http://localhost:3000` (desenvolvimento)
     - Sua URL de produção (quando deployar)
   - **Authorized redirect URIs**:
     - `http://localhost:3000/auth/callback`
     - `https://[SEU-PROJETO].supabase.co/auth/v1/callback`
4. Copie o **Client ID** e **Client Secret**

### 3. Configurar no Supabase

1. Volte ao Supabase > **Authentication > Providers > Google**
2. Cole o **Client ID** e **Client Secret** do Google
3. Salve as configurações

## Configuração do Banco de Dados

### 1. Obter String de Conexão

1. No Supabase, vá para **Settings > Database**
2. Copie a **Connection string** na seção "Connection pooling"
3. Substitua `[YOUR-PASSWORD]` pela senha do banco

### 2. Configurar Variáveis de Ambiente

Crie o arquivo `.env.local` na raiz do projeto com:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://[SEU-PROJETO].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[SUA-ANON-KEY]
SUPABASE_SERVICE_ROLE_KEY=[SUA-SERVICE-ROLE-KEY]

# Database Configuration (PostgreSQL via Supabase)
DATABASE_URL="postgresql://postgres.jkdtvacjiikypyphqrzd:[SUA-SENHA]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.jkdtvacjiikypyphqrzd:[SUA-SENHA]@aws-0-sa-east-1.pooler.supabase.com:5432/postgres"

# Google OAuth Configuration
GOOGLE_CLIENT_ID=[SEU-GOOGLE-CLIENT-ID]
GOOGLE_CLIENT_SECRET=[SEU-GOOGLE-CLIENT-SECRET]
```

**⚠️ IMPORTANTE**: Substitua todos os valores entre colchetes pelas suas credenciais reais.

## Configuração do Prisma

### 1. Gerar Cliente Prisma

```bash
npx prisma generate
```

### 2. Executar Migrações

```bash
npx prisma migrate dev --name init
```

### 3. (Opcional) Visualizar Banco de Dados

```bash
npx prisma studio
```

## Instalação e Execução

### 1. Instalar Dependências

```bash
npm install
```

### 2. Executar em Desenvolvimento

```bash
npm run dev
```

### 3. Acessar Aplicação

Abra [http://localhost:3000](http://localhost:3000) no navegador.

## Funcionalidades Implementadas

### ✅ Autenticação
- Login com Google via Supabase
- Middleware de proteção de rotas
- Logout automático
- Redirecionamento baseado no estado de autenticação

### ✅ Persistência de Dados
- Banco PostgreSQL via Supabase
- ORM Prisma para gerenciamento de dados
- API Routes do Next.js para CRUD
- Relacionamento entre usuários e contribuições

### ✅ Interface
- Página de login responsiva
- Dashboard principal com resumo
- Página de detalhes por criptomoeda
- Tema dark consistente
- Componentes reutilizáveis

### ✅ Funcionalidades de Negócio
- Adicionar aportes de Bitcoin e Ethereum
- Cálculo automático de lucro/prejuízo
- Histórico detalhado de investimentos
- Navegação entre páginas de detalhes

## Estrutura do Projeto

```
src/
├── app/
│   ├── api/
│   │   ├── contributions/     # API para contribuições
│   │   └── user/             # API para usuários
│   ├── auth/
│   │   ├── callback/         # Callback OAuth
│   │   └── auth-code-error/  # Página de erro
│   ├── crypto/[id]/          # Páginas de detalhes
│   ├── login/                # Página de login
│   ├── globals.css           # Estilos globais
│   ├── layout.js             # Layout principal
│   └── page.js               # Página inicial
├── components/
│   ├── ui/                   # Componentes base
│   └── AddContributionModal.js
├── lib/
│   ├── prisma.js             # Cliente Prisma
│   ├── supabase.js           # Cliente Supabase (client)
│   └── supabase-server.js    # Cliente Supabase (server)
└── middleware.js             # Middleware de autenticação
```

## Troubleshooting

### Erro de Conexão com Banco
- Verifique se a senha no `DATABASE_URL` está correta
- Confirme se o projeto Supabase está ativo

### Erro de Autenticação Google
- Verifique se as URLs de callback estão corretas
- Confirme se o Client ID e Secret estão corretos
- Verifique se a Google+ API está ativada

### Erro de Prisma
- Execute `npx prisma generate` após mudanças no schema
- Execute `npx prisma migrate dev` para aplicar migrações

### Erro de CORS
- Verifique se as URLs estão configuradas corretamente no Google Console
- Confirme se o middleware está funcionando

## Próximos Passos

1. **Deploy em Produção**: Configure as variáveis de ambiente para produção
2. **APIs de Preços Reais**: Integre com CoinGecko ou similar
3. **Notificações**: Implemente alertas de preço
4. **Gráficos**: Adicione visualizações de performance
5. **Backup**: Configure backup automático dos dados

