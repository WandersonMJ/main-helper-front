# Main Helper Front

Uma aplicação Next.js moderna estruturada com **Atomic Design** e **Feature-based Architecture**, utilizando as melhores práticas de desenvolvimento React.

## 📋 Índice

- [Criação do Projeto](#criação-do-projeto)
- [Arquitetura](#arquitetura)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Estrutura de Pastas](#estrutura-de-pastas)
- [Configuração](#configuração)
- [Desenvolvimento](#desenvolvimento)
- [Features](#features)
- [Componentes](#componentes)
- [Gerenciamento de Estado](#gerenciamento-de-estado)
- [Requisições HTTP](#requisições-http)
- [Exemplos de Uso](#exemplos-de-uso)

## 🚀 Criação do Projeto

### Passo a Passo da Criação

```bash
# 1. Criar o projeto Next.js com configurações completas
npx create-next-app@latest main-helper-front --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

# 2. Entrar no diretório
cd main-helper-front

# 3. Instalar dependências adicionais
npm install @tanstack/react-query @tanstack/react-query-devtools zustand axios

# 4. Instalar ferramentas de desenvolvimento
npm install -D prettier eslint-config-prettier eslint-plugin-prettier @typescript-eslint/eslint-plugin @typescript-eslint/parser
```

### Configurações Iniciais

1. **Prettier** (`.prettierrc`):
```json
{
  "semi": false,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "endOfLine": "lf"
}
```

2. **ESLint** com Prettier integrado
3. **Tailwind CSS** com tema personalizado
4. **TypeScript** configurado

## 🏗️ Arquitetura

Este projeto utiliza uma arquitetura híbrida combinando:

### Atomic Design para Componentes
- **Atoms**: Componentes básicos (Button, Input, etc.)
- **Molecules**: Combinações de atoms (SearchBox, etc.)
- **Organisms**: Seções complexas (Header, ProductList, etc.)
- **Templates**: Layout structures
- **Pages**: Páginas completas

### Feature-based Architecture
Cada feature é autocontida com:
- **Components**: Componentes específicos da feature
- **Hooks**: Lógica de estado e efeitos
- **Services**: Chamadas de API
- **Stores**: Estado local da feature (se necessário)
- **Types**: Tipos TypeScript específicos

## 🛠️ Tecnologias Utilizadas

- **Next.js 15** - Framework React
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **React Query (@tanstack/react-query)** - Gerenciamento de estado servidor
- **Zustand** - Gerenciamento de estado global
- **Axios** - Cliente HTTP
- **ESLint + Prettier** - Linting e formatação

## 📁 Estrutura de Pastas

```
src/
├── app/                          # App Router (Next.js 13+)
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx
│   └── profile/
│       └── page.tsx
├── components/                   # Atomic Design
│   ├── atoms/
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   │   └── index.ts
│   │   └── Input/
│   ├── molecules/
│   ├── organisms/
│   └── templates/
├── features/                     # Feature-based modules
│   ├── auth/
│   │   ├── components/
│   │   ├── hooks/
│   │   │   └── use-auth.ts
│   │   ├── services/
│   │   │   └── auth-service.ts
│   │   ├── stores/
│   │   └── types/
│   └── user-profile/
│       ├── components/
│       ├── hooks/
│       │   └── use-user-profile.ts
│       ├── services/
│       ├── stores/
│       └── types/
└── shared/                       # Recursos compartilhados
    ├── hooks/
    ├── services/
    │   ├── http-client.ts
    │   └── query-client.ts
    ├── stores/
    │   └── auth-store.ts
    ├── providers/
    │   ├── app-provider.tsx
    │   ├── theme-provider.tsx
    │   └── index.tsx
    ├── utils/
    │   └── index.ts
    ├── types/
    │   └── index.ts
    └── constants/
        └── index.ts
```

## ⚙️ Configuração

### 1. Variáveis de Ambiente

Crie um arquivo `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### 2. HTTP Client com No-Cache

O projeto está configurado para adicionar automaticamente o header `Cache-Control: no-cache` em todas as requisições GET:

```typescript
// src/shared/services/http-client.ts
private setupInterceptors() {
  this.client.interceptors.request.use(
    (config) => {
      if (config.method === 'get') {
        config.headers['Cache-Control'] = 'no-cache'
      }
      // ...
    }
  )
}
```

## 🚀 Desenvolvimento

```bash
# Iniciar servidor de desenvolvimento
npm run dev

# Build para produção
npm run build

# Iniciar servidor de produção
npm start

# Linting
npm run lint

# Formatação de código
npx prettier --write .
```

## 🎯 Features

### Feature de Autenticação

**Localização**: `src/features/auth/`

**Hook principal**: `use-auth.ts`
```typescript
const { 
  user, 
  isAuthenticated, 
  login, 
  register, 
  logout,
  isLoadingLogin,
  loginError 
} = useAuth()
```

**Funcionalidades**:
- Login/Register com React Query
- Logout com limpeza de cache
- Gerenciamento de token
- Estados de loading e erro
- Integração com Zustand store

### Feature de Perfil de Usuário

**Localização**: `src/features/user-profile/`

**Hook principal**: `use-user-profile.ts`
```typescript
const { 
  userProfile, 
  updateProfile, 
  uploadAvatar,
  isUpdatingProfile 
} = useUserProfile()
```

**Reutilização de Features**:
```typescript
// Exemplo de como uma feature reutiliza outra
import { useAuth } from '@/features/auth/hooks/use-auth'

export const useUserProfile = () => {
  const { user, isAuthenticated, updateUser } = useAuth() // Reutilização!
  
  // Lógica específica do perfil...
}
```

## 🧩 Componentes (Atomic Design)

### Atoms

**Button**:
```typescript
import { Button } from '@/components/atoms/Button'

<Button 
  variant="primary" 
  size="lg" 
  isLoading={isLoading}
  onClick={handleClick}
>
  Clique aqui
</Button>
```

Variantes disponíveis:
- `primary`, `secondary`, `outline`, `ghost`, `danger`
- Tamanhos: `sm`, `md`, `lg`
- Estado de loading integrado

## 💾 Gerenciamento de Estado

### Zustand para Estado Global

```typescript
// src/shared/stores/auth-store.ts
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      
      login: (user: User, token: string) => {
        localStorage.setItem('auth-token', token)
        set({ user, token, isAuthenticated: true })
      },
      
      logout: () => {
        localStorage.removeItem('auth-token')
        set({ user: null, token: null, isAuthenticated: false })
      }
    }),
    { name: 'auth-storage' }
  )
)
```

### React Query para Estado do Servidor

```typescript
const { data, isLoading, error } = useQuery({
  queryKey: ['user', 'profile'],
  queryFn: authService.getProfile,
  enabled: isAuthenticated,
  staleTime: 1000 * 60 * 5, // 5 minutos
})
```

## 🌐 Requisições HTTP

### Cliente HTTP Configurado

```typescript
// Todas as requisições GET recebem automaticamente Cache-Control: no-cache
const response = await httpClient.get<UserData>('/users/profile')

// Interceptors automáticos para:
// - Headers de autenticação
// - Headers de no-cache para GET
// - Redirecionamento em caso de 401
```

### Uso com React Query

```typescript
const loginMutation = useMutation({
  mutationFn: authService.login,
  onSuccess: (data) => {
    loginStore(data.user, data.token)
    queryClient.invalidateQueries({ queryKey: ['user'] })
  },
})
```

## 📋 Exemplos de Uso

### 1. Criando uma Nova Feature

```bash
# Estrutura de uma nova feature
src/features/products/
├── components/
│   ├── ProductCard.tsx
│   └── ProductList.tsx
├── hooks/
│   ├── use-products.ts
│   └── use-product-detail.ts
├── services/
│   └── products-service.ts
└── types/
    └── product.types.ts
```

### 2. Hook de Feature Reutilizável

```typescript
// src/features/products/hooks/use-products.ts
export const useProducts = () => {
  const { isAuthenticated } = useAuth() // Reutilizando auth!
  
  const { data: products, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: productsService.getProducts,
    enabled: isAuthenticated, // Só busca se autenticado
  })
  
  return { products, isLoading }
}
```

### 3. Componente de Feature

```typescript
// src/features/products/components/ProductList.tsx
export const ProductList = () => {
  const { products, isLoading } = useProducts()
  const { user } = useAuth() // Reutilização de feature
  
  if (isLoading) return <LoadingSpinner />
  
  return (
    <div className="grid grid-cols-3 gap-4">
      {products?.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
```

### 4. Página Usando Features

```typescript
// src/app/products/page.tsx
'use client'
import { ProductList } from '@/features/products/components/ProductList'
import { useAuth } from '@/features/auth/hooks/use-auth'

export default function ProductsPage() {
  const { isAuthenticated } = useAuth()
  
  if (!isAuthenticated) {
    return <LoginRequired />
  }
  
  return (
    <div>
      <h1>Produtos</h1>
      <ProductList />
    </div>
  )
}
```

## 🔧 Comandos Úteis

```bash
# Desenvolvimento
npm run dev

# Type checking
npm run type-check

# Build
npm run build

# Análise de bundle
npm run analyze

# Testes (adicionar conforme necessário)
npm test
```

## 📝 Padrões de Código

1. **Imports**: Use absolute imports com `@/`
2. **Naming**: PascalCase para componentes, camelCase para funções
3. **Files**: PascalCase para componentes, kebab-case para outros
4. **Exports**: Use named exports quando possível
5. **Types**: Defina interfaces específicas por feature

## 🚀 Próximos Passos

- [ ] Implementar testes unitários
- [ ] Adicionar Storybook para componentes
- [ ] Implementar PWA
- [ ] Adicionar autenticação social
- [ ] Implementar internacionalização (i18n)

---

**Desenvolvido com ❤️ usando as melhores práticas do ecossistema React**