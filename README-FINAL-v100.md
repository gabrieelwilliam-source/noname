# Lais Imob — Produto Comercial Final v100

Pacote final para demonstrar, anunciar, vender e implantar uma automação imobiliária completa.

## Entregáveis do pacote

- `Lais-Imob-Produto-Comercial-Final-v100.json`: workflow n8n importável.
- Site/vitrine demonstrativa com imóveis, páginas comerciais, painel e roteiro.
- Documentos comerciais e técnicos para implantação.
- Payloads de teste ponta a ponta.
- Checklist de troca de variáveis por imobiliária.

## O que a automação resolve para uma imobiliária

A automação recebe leads do site, WhatsApp e Instagram, entende o interesse, identifica imóvel específico, qualifica compra/locação/investimento/captação, registra contexto, aciona corretor, agenda visita, confirma horários, faz follow-up e entrega visão operacional para gestor.

## O que foi preservado

Por solicitação, a versão final preserva:

- URLs atuais;
- caminhos de webhook;
- IDs de credenciais do n8n;
- tokens/chaves já presentes no fluxo;
- materiais comerciais já existentes no pacote.

## Como usar em demonstração

1. Importe o workflow no n8n.
2. Ele está `active:false` para não conflitar com o fluxo atual.
3. Ative somente após conferir webhooks e credenciais.
4. Publique o site ou abra localmente.
5. Configure `window.IMOB_N8N_SITE_WEBHOOK_URL` ou `localStorage.IMOB_N8N_SITE_WEBHOOK_URL` com a URL pública do webhook `/webhook/lais-imob-site-lead`, quando quiser POST direto.
6. Rode os cenários do arquivo `TESTES-PAYLOADS.json`.

## Como implantar em cliente real

Trocar por imobiliária:

- `BUSINESS_NAME`, cidade, endereço, WhatsApp, Instagram e site;
- `BUSINESS_TENANT_ID`;
- catálogo real;
- `SellerPool`/corretores;
- Google Calendar;
- CRM externo, se houver;
- políticas de atendimento, locação, financiamento, visitas e LGPD.

## Alerta de segurança

As credenciais foram preservadas porque isso foi solicitado. Para vender ou entregar a terceiros, o recomendado é migrar chaves e tokens para variáveis de ambiente/credenciais do n8n antes de compartilhar o pacote.
