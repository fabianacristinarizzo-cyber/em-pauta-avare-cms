# Em Pauta Avaré — CMS Editorial 2.0

Versão operacional do portal **Em Pauta Avaré**, criada em Next.js com foco em jornalismo local, mobile first, vídeo vertical e fluxo editorial com revisão humana.

## O que já está pronto

- Portal público responsivo, pensado primeiro para celular.
- Home dinâmica alimentada pelo CMS.
- Destaque principal e faixa de **Plantão / AGORA**.
- Editorias e busca instantânea na home.
- Matérias individuais com URL própria.
- SEO básico e JSON-LD `NewsArticle`.
- **Em Pauta Reels** com feed vertical 9:16, autoplay por tela, som, compartilhamento e botão para matéria completa.
- Botões de compartilhamento, WhatsApp e copiar link.
- Formulário **Envie sua pauta**, separado editorialmente das publicações.
- PWA: manifesto, ícones e service worker.
- Painel `/admin` protegido por login.
- Criação e edição de matéria.
- Rascunho x publicado.
- Marcação de **Destaque** e **Plantão**.
- Upload de imagem e vídeo.
- Fila de pautas: Nova, Em checagem e Arquivada.
- Banco local para desenvolvimento.
- Neon Postgres para persistência em produção.
- Vercel Blob para mídia em produção, incluindo upload direto do navegador para vídeos grandes.

## Testar localmente

O projeto precisa de Node.js 20+.

```bash
npm install
npm run dev
```

Abra:

- Portal: `http://localhost:3000`
- Painel: `http://localhost:3000/admin`

No modo de desenvolvimento, sem `.env.local`, existem credenciais somente para teste:

- E-mail: `admin@empautaavare.com.br`
- Senha: `empauta-demo-2026`

**Essas credenciais não funcionam em produção.**

## Configurar credenciais reais

Copie `.env.example` para `.env.local` e altere os valores:

```env
ADMIN_EMAIL=seu-email
ADMIN_PASSWORD=uma-senha-forte
SESSION_SECRET=uma-chave-aleatoria-longa
NEXT_PUBLIC_SITE_URL=https://empautaavare.com.br
```

Para gerar uma chave de sessão:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

## Produção: banco de dados

Para publicar e editar conteúdo em produção, configure `DATABASE_URL` de um Postgres compatível. O projeto foi preparado para **Neon Postgres**.

Ao encontrar `DATABASE_URL`, o CMS cria automaticamente as tabelas `articles` e `submissions` no primeiro acesso e insere os conteúdos de demonstração se a tabela estiver vazia.

Sem `DATABASE_URL` em produção, o portal ainda consegue mostrar o conteúdo inicial de demonstração, porém gravações do CMS ficam bloqueadas por segurança.

## Produção: imagens e vídeos

O painel suporta duas formas:

1. Colar uma URL já existente.
2. Enviar um arquivo pelo painel.

Em produção, o upload usa **Vercel Blob** diretamente do navegador, adequado para vídeos maiores que o limite de requisição das Functions. Crie um Blob store **público** conectado ao projeto Vercel. Versões atuais do Blob podem usar autenticação OIDC automaticamente quando o projeto está corretamente conectado ao store.

Em desenvolvimento local, o upload é salvo em `public/uploads/` apenas para teste.

## Fluxo editorial

```text
LEITOR / FONTE
      ↓
ENVIA PAUTA
      ↓
FILA DA REDAÇÃO
      ↓
CHECAGEM HUMANA
      ↓
CRIAÇÃO DA MATÉRIA
      ↓
RASCUNHO
      ↓
REVISÃO HUMANA
      ↓
PUBLICADO
      ↓
HOME / REELS / MATÉRIA / BUSCA
```

Pautas recebidas **não viram notícia automaticamente**.

## Estrutura principal

```text
app/
  admin/                 painel editorial
  api/                   login, matérias, pautas e upload
  materia/[slug]/        página individual
  reels/                 player vertical
components/
  AdminDashboard.tsx
  HomeClient.tsx
  LoginForm.tsx
  ReelsClient.tsx
  ShareButtons.tsx
lib/
  auth.ts                sessão administrativa
  store.ts               persistência local / Neon
  types.ts
public/
  assets/                 identidade, vídeos demo e ícones
  manifest.webmanifest
  sw.js
```

## Próximas integrações recomendadas

A base está preparada para evoluir com analytics, newsletter, notificações push, permissões de múltiplos usuários, histórico de versões e armazenamento de documentos de pauta. Essas integrações devem ser adicionadas somente quando houver necessidade operacional clara.
