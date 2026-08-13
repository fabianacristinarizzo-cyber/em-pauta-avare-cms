# Em Pauta Avaré — CMS Editorial

Portal jornalístico mobile-first com identidade visual definitiva do **Em Pauta**, painel editorial protegido, banco Postgres e suporte a vídeos verticais.

## Identidade oficial
- Azul-marinho `#0B2A52`
- Rosé `#C57482`
- Rosa-claro `#F2D7DD`
- Dourado `#D49A23`
- Títulos: Playfair Display
- Textos e interface: Poppins
- Assinatura: “Histórias que aproximam. Pessoas que transformam.”

## Editorias
Comunidade, Mulheres que Inspiram, Voluntariado, Histórias Reais e Agenda Positiva.

## Produção
Copie `.env.example` para as variáveis de ambiente da hospedagem. **Nunca grave credenciais reais no GitHub.**

Variáveis necessárias:
- `DATABASE_URL`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `SESSION_SECRET`
- `NEXT_PUBLIC_SITE_URL`
- `BLOB_READ_WRITE_TOKEN` para uploads persistentes

## Fluxo editorial
Pauta recebida → triagem → checagem → rascunho → revisão humana → publicação.

Conteúdo enviado por leitores nunca é publicado automaticamente.
