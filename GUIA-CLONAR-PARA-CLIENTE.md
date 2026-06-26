# Guia para Clonar para uma Imobiliária Cliente

## 1. Duplicar com segurança
1. Importe a v72 como novo workflow.
2. Renomeie para `Cliente — Automação Imobiliária — Produção`.
3. Mantenha a v71 como backup histórico.
4. Não troque paths de webhook sem atualizar o site e os provedores.

## 2. Trocar identidade da imobiliária
Altere via variáveis de ambiente ou no node `05.01 Carregar Configuração da Imobiliária`:
- `BUSINESS_NAME`
- `BUSINESS_CITY`
- `BUSINESS_ADDRESS`
- `BUSINESS_PHONE`
- `BUSINESS_WHATSAPP`
- `BUSINESS_INSTAGRAM`
- `BUSINESS_SITE`
- `BUSINESS_OWNER`
- `BUSINESS_TENANT_ID`

## 3. Trocar operação
- Corretores e telefones em `SellerPool`.
- Horários em `OpenMin`, `CloseMin`, `BusinessHoursText`.
- Regras comerciais, documentação, garantias, pet e proposta.
- Responsáveis por compra, locação, investimento e captação.

## 4. Trocar catálogo
Substitua o catálogo demo por:
- Supabase,
- CRM externo,
- planilha controlada,
- ou API da imobiliária.

Cada imóvel deve ter código, título, finalidade, categoria, bairro, cidade, valor, status, corretor responsável e política de disponibilidade.

## 5. Virar produção
Defina:
- `PRODUCT_MODE=production`
- `DEMO_MODE=false`
- `BROKER_NOTIFICATION_TEST_MODE=false`
- `BOOKING_LOCK_FALLBACK=false` depois de criar lock persistente.

Antes de ativar, confirme `product_health.production_ready=true`.
