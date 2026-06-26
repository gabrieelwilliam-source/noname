# Changelog da Refatoração — v72/vFinal

## Segurança de versão
- Gerada nova versão `v72` sem sobrescrever a v71.
- Removido `id` de workflow do JSON exportado para reduzir risco de importação por cima.
- `active=false` no arquivo final para teste antes de ativar.

## Workflow n8n
- Mantidos paths, webhookIds, URLs, telefones, tokens, nomes de instância, credenciais e integrações existentes.
- Node `05.04 Validar Configuração Obrigatória` refeito para retornar `product_health` com:
  - `production_ready`
  - `blocking`
  - `warnings`
  - `commercial_warnings`
  - `credential_warnings`
  - `active_listings`
  - `seller_count`
  - `sellers_with_phone`
  - `demo_mode`
  - `checked_at`
- Modo demo não bloqueia por falta de itens de produção.
- Produção passa a separar bloqueios de credenciais, catálogo, telefone/corretor, Supabase, WhatsApp, IA e agenda.
- Normalização de site reforçada para preservar título do imóvel e tipo de interesse.
- Deduplicação local mantida com sinalização de estratégia persistente em Supabase.
- Adicionada nota visual v72 dentro do workflow.

## Site/pacote comercial
- `lead_schema_version` atualizado para `site_lead_v72`.
- Formulário mantém payload compatível com `lais-imob-site-lead`.
- Fallback para WhatsApp mantido quando webhook não estiver configurado ou falhar.
- Documentação final adicionada ao pacote.
- Payloads de aceite adicionados em JSON.

## Validação
- JSON do workflow validado como JSON válido.
- JavaScript dos nodes Code validado com `node --check`.
- JavaScript do site validado com `node --check`.
