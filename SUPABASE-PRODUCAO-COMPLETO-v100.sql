-- Lais Imob v100 — base mínima recomendada para produção
-- Ajuste nomes, RLS e permissões conforme seu projeto Supabase.

create table if not exists imob_inbound_events (
  id bigserial primary key,
  tenant_id text not null default 'default',
  idempotency_key text not null,
  channel text,
  contact_key text,
  message_uid text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (tenant_id, idempotency_key)
);

create table if not exists imob_leads (
  id uuid primary key default gen_random_uuid(),
  tenant_id text not null default 'default',
  contact_key text not null,
  customer_name text,
  customer_phone text,
  customer_email text,
  funnel_stage text default 'novo_lead',
  commercial_score int default 0,
  temperature text default 'frio',
  last_message text,
  selected_listing_code text,
  assigned_broker_key text,
  assigned_broker_phone text,
  broker_acceptance_required boolean default false,
  broker_accepted_at timestamptz,
  last_interaction_at timestamptz default now(),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, contact_key)
);

create table if not exists imob_followups (
  id uuid primary key default gen_random_uuid(),
  tenant_id text not null default 'default',
  lead_id uuid,
  contact_key text,
  phone_e164 text,
  due_at timestamptz not null,
  status text not null default 'pending',
  track text,
  message text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists imob_visit_locks (
  id uuid primary key default gen_random_uuid(),
  tenant_id text not null default 'default',
  listing_code text,
  start_at timestamptz not null,
  end_at timestamptz not null,
  contact_key text,
  status text default 'reserved',
  expires_at timestamptz default now() + interval '10 minutes',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz default now()
);

create or replace function imob_log_inbound(p_tenant_id text, p_idempotency_key text, p_payload jsonb)
returns jsonb language plpgsql as $$
begin
  insert into imob_inbound_events(tenant_id, idempotency_key, channel, contact_key, message_uid, payload)
  values (
    coalesce(p_tenant_id,'default'),
    p_idempotency_key,
    p_payload->>'channel',
    p_payload->>'contact_key',
    p_payload->>'message_uid',
    p_payload
  )
  on conflict (tenant_id, idempotency_key) do nothing;
  return jsonb_build_object('ok', true);
end;
$$;
