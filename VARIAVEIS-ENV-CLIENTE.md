# Variáveis por Cliente — v72

## Identidade
- `PRODUCT_MODE=demo|production`
- `DEMO_MODE=true|false`
- `BUSINESS_TENANT_ID`
- `BUSINESS_NAME`
- `BUSINESS_CITY`
- `BUSINESS_ADDRESS`
- `BUSINESS_PHONE`
- `BUSINESS_WHATSAPP`
- `BUSINESS_INSTAGRAM`
- `BUSINESS_SITE`
- `BUSINESS_OWNER`

## WhatsApp / envio
- `WA_SEND_URL`
- `WA_SEND_API_KEY`
- `WA_DOWNLOAD_URL`
- `WA_DOWNLOAD_TOKEN`
- `ADMIN_PHONE`
- `BROKER_PHONE`
- `BROKER_NOTIFICATION_TEST_MODE=true|false`

## IA
- `GROQ_API_KEY`
- `GROQ_TOKEN`
- `GROQ_MODEL`
- `GROQ_API_URL`
- `GROQ_AUDIO_TRANSCRIPTIONS_URL`
- `GROQ_AUDIO_MODEL`

## Banco / CRM
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_RPC_BASE_URL`
- `CRM_PROVIDER`
- `CRM_API_BASE_URL`
- `CRM_API_TOKEN`
- `BOOKING_LOCK_FALLBACK=true|false`

## Agenda
- `GOOGLE_CALENDAR_ID`
- `BUSINESS_UTC_OFFSET=-03:00`

## Site
- `IMOB_N8N_SITE_WEBHOOK_URL` no `window` ou `localStorage` do navegador.
- Caminho esperado preservado: `lais-imob-site-lead`.

## Observação de segurança
Credenciais foram preservadas no workflow conforme solicitado, mas para cliente real recomenda-se migrar tudo para variáveis/credenciais do n8n antes de compartilhar o JSON.
