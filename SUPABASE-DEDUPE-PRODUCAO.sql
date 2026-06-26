-- Deduplicação persistente recomendada para produção.
-- Mantém o fallback local do workflow, mas cria barreira entre execuções/instâncias.

create table if not exists public.inbound_message_dedup (
  id uuid primary key default gen_random_uuid(),
  tenant_id text not null default 'default',
  idempotency_key text not null,
  channel text,
  provider text,
  contact_key text,
  message_uid text,
  trace_id text,
  created_at timestamptz not null default now(),
  payload jsonb default '{}'::jsonb,
  unique (tenant_id, idempotency_key)
);

create index if not exists inbound_message_dedup_created_at_idx
  on public.inbound_message_dedup(created_at desc);

-- Opcional: limpeza de registros antigos
-- delete from public.inbound_message_dedup where created_at < now() - interval '30 days';
