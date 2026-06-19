# Site demonstrativo — Imobiliária + Supabase + n8n

Site estático criado com HTML, CSS e JavaScript puro.

## Estrutura

- `index.html`: página inicial e catálogo.
- `imovel.html`: página individual do imóvel.
- `styles.css`: todo o visual responsivo.
- `site.js`: integração com Supabase, formulário e utilitários.
- `home.js`: filtros e catálogo da página inicial.
- `property.js`: carregamento da página individual.
- `config.js`: URL/chave pública do Supabase, webhook do n8n e dados da empresa.
- `demo-data.js`: fallback local para abrir o site sem Supabase.
- `demo/imoveis`: imagens locais de demonstração.

## 1. Configurar o Supabase

Abra `config.js` e preencha:

```js
SUPABASE_URL: "https://SEU-PROJETO.supabase.co",
SUPABASE_ANON_KEY: "SUA_CHAVE_ANON_PUBLICA"
```

Use somente a chave `anon public`. Nunca coloque a chave `service_role` no site.

O site chama estas RPCs:

- `imobagent_20260504_ready_public_search_properties`
- `imobagent_20260504_ready_public_get_property`
- `imobagent_20260504_ready_submit_site_lead`

## 2. Configurar o n8n

Ainda em `config.js`, informe o webhook de produção:

```js
N8N_WEBHOOK_URL: "https://SEU-N8N/webhook/lais-imob-site-lead"
```

Ao cadastrar o lead, o site:

1. Grava o lead no Supabase.
2. Recebe o contrato normalizado da RPC.
3. Envia esse contrato ao webhook do n8n.
4. Acrescenta os marcadores:
   - `__entry_source: "lais-imob-site-lead"`
   - `provider_hint: "site_form"`

### CORS no n8n

O domínio do site precisa ter permissão para chamar o webhook. Em produção, uma rota backend/proxy é mais segura do que expor o webhook diretamente no navegador.

## 3. Número do WhatsApp

Em `config.js`:

```js
WHATSAPP_NUMBER: "5547999999999"
```

Use somente números, incluindo DDI 55 e DDD.

## 4. Rodar localmente

Não abra apenas clicando no arquivo, porque alguns navegadores limitam recursos no protocolo `file://`.

No terminal, dentro da pasta:

```bash
python -m http.server 8080
```

Depois acesse:

```text
http://localhost:8080
```

Outra opção é usar a extensão **Live Server** do VS Code.

## 5. Publicar gratuitamente

A pasta pode ser publicada na:

- Vercel
- Netlify
- Cloudflare Pages
- GitHub Pages

Como o projeto é estático, não precisa de build.

## 6. Modos de dados

No `config.js`:

```js
DATA_MODE: "auto"
```

- `auto`: usa Supabase quando configurado; caso contrário, usa os dados locais.
- `supabase`: exige o Supabase funcionando.
- `demo`: usa somente `demo-data.js`.

## Segurança

- Não coloque `service_role`, senha ou token do n8n em arquivos públicos.
- O webhook direto é adequado para demonstração. Para produção, use uma API intermediária com CAPTCHA e rate limit.
- Os imóveis e contatos incluídos são fictícios.
