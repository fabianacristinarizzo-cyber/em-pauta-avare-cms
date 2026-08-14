# Checklist de publicação — Em Pauta Avaré

## 1. Projeto

- Subir esta pasta para um repositório Git.
- Importar o repositório na Vercel.
- Associar o domínio `empautaavare.com.br` ao projeto.

## 2. Variáveis obrigatórias

Definir em Production, Preview e Development conforme necessário:

- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `SESSION_SECRET`
- `NEXT_PUBLIC_SITE_URL`
- `DATABASE_URL`

Para mídia, conectar um Vercel Blob store público ao projeto. Dependendo da configuração do store, a autenticação pode ser via OIDC ou token provisionado pela Vercel.

## 3. Banco

Conectar Neon Postgres e copiar a connection string para `DATABASE_URL`.

Não é necessário rodar migração manual na versão inicial: o CMS cria as tabelas automaticamente na primeira operação.

## 4. Blob

Criar um Blob store público para fotos e vídeos. O upload de produção é feito diretamente do browser para o Blob, evitando o limite de payload das funções.

## 5. Segurança antes de liberar `/admin`

- Trocar a senha de teste.
- Usar `SESSION_SECRET` aleatório e longo.
- Não compartilhar as variáveis de ambiente.
- Manter HTTPS.
- Revisar quem possui acesso ao projeto Vercel e ao banco.

## 6. Teste editorial obrigatório

Antes de apontar o domínio:

1. Entrar no `/admin`.
2. Criar uma matéria como rascunho.
3. Editar o rascunho.
4. Enviar uma imagem.
5. Enviar um vídeo vertical.
6. Publicar.
7. Confirmar que aparece na home.
8. Confirmar que o Reel aparece em `/reels`.
9. Testar WhatsApp, compartilhar e copiar link.
10. Enviar uma pauta pelo formulário público.
11. Confirmar que a pauta aparece somente na fila da redação.
12. Marcar uma matéria como Plantão e verificar a faixa “AGORA”.

## 7. SEO e indexação

Após colocar o domínio em produção:

- cadastrar o domínio no Google Search Console;
- enviar `/sitemap.xml`;
- testar algumas URLs no Rich Results Test;
- conferir títulos, descrição, imagem de compartilhamento e datas.

## 8. Regra editorial

Nenhuma pauta enviada por leitor deve ser publicada automaticamente. O painel foi desenhado para manter recebimento, checagem, rascunho e publicação como etapas distintas.
