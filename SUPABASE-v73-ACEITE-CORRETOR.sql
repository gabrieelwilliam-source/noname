-- v73 — Estrutura sugerida para produção avançada.
-- Não é obrigatória para importar o workflow. Use quando quiser persistir aceite, SLA e redistribuição automática.

create table if not exists public.imob_broker_acceptance_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id text not null,
  lead_key text,
  customer_phone text,
  listing_code text,
  assigned_seller_phone text,
  command text not null,
  status text not null default 'received',
  commercial_score numeric,
  funnel_stage text,
  raw_text text,
  created_at timestamptz not null default now()
);

create index if not exists imob_broker_acceptance_events_tenant_created_idx
on public.imob_broker_acceptance_events (tenant_id, created_at desc);

-- RPC sugerida: retornar leads quentes sem aceite para o alerta v73.
-- Ajuste os nomes das tabelas conforme seu CRM real.
-- Deve retornar colunas como: customer_name, phone_e164, listing_code, commercial_score, lead_score.
