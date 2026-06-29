# Nota v100

Esta pasta foi consolidada como pacote final comercial v100. O workflow final é `Lais-Imob-Produto-Comercial-Final-v100.json` e foi exportado como novo workflow (`active:false`) preservando credenciais, URLs e paths.

---

# README de Implantação — Automação Imobiliária v100

## O que é este pacote
Esta entrega transforma a demonstração em uma central comercial de pré-atendimento imobiliário. O fluxo recebe leads do site, WhatsApp e Instagram, normaliza o contato, identifica imóvel ou intenção, qualifica com IA, registra histórico, aciona corretor, agenda visitas, faz follow-up e entrega visão operacional para gestor.

## Importante sobre a v100
- A versão anterior original não deve ser sobrescrita.
- O JSON da v100 foi exportado sem `id` de workflow para importar como novo workflow no n8n.
- IDs de nós, `webhookId`, caminhos, endpoints, URLs, telefones, tokens e credenciais internas foram preservados.
- A versão v100 inicia desativada (`active: false`) para teste controlado.

## Ordem recomendada
1. Importe o workflow `Automação Imobiliária Produto Comercial v100 - Cópia Segura Final.json` como novo workflow.
2. Confira se o caminho `/webhook/lais-imob-site-lead` permanece ativo no n8n.
3. Publique o site/pacote estático desta pasta.
4. Configure `window.IMOB_N8N_SITE_WEBHOOK_URL` ou `localStorage.IMOB_N8N_SITE_WEBHOOK_URL` com a URL pública do webhook do n8n, quando quiser POST direto pelo site.
5. Execute os payloads de `TESTES-PAYLOADS.json`.
6. Só ative produção depois de revisar `product_health.production_ready`.

## Modo DEMO x PRODUÇÃO
**DEMO:** usa catálogo fictício/local, número de teste, BrokerNotificationTestMode e materiais comerciais. Serve para vender e demonstrar.

**PRODUÇÃO:** deve usar tenant, catálogo, corretores, calendário, CRM e variáveis reais da imobiliária cliente.

## Onde ajustar por cliente
Veja `VARIAVEIS-ENV-CLIENTE.md` e `GUIA-CLONAR-PARA-CLIENTE.md`.
