window.IMOB_CONFIG = {
  // Cole aqui os dados do seu projeto Supabase.
  // Settings > API > Project URL e anon public key.
  SUPABASE_URL: "https://abcdefghijk.supabase.com",
  SUPABASE_ANON_KEY: "sb_publishable_wY25lLeNeXn0Y2nXIvkgOA_NzxUHdCu",

  // O fluxo e o SQL complementar usam "default".
  TENANT_ID: "default",

  // Webhook de produção do n8n.
  // Exemplo: https://app.vps7376.panel.icontainer.cloud/webhook-test/lais-imob-site-lead
  // Deixe vazio enquanto ainda não quiser disparar o fluxo.
  N8N_WEBHOOK_URL: "https://app.vps7376.panel.icontainer.cloud/webhook-test/lais-imob-site-lead",

  // Número comercial usado no botão direto de WhatsApp.
  // Apenas números, com DDI e DDD.
  WHATSAPP_NUMBER: "5547999762742",

  BUSINESS_NAME: "Horizonte Prime Imóveis",
  BUSINESS_CITY: "Joinville",
  BUSINESS_STATE: "SC",

  // "auto": usa Supabase se estiver configurado; caso contrário, usa dados de demonstração.
  // "supabase": exige Supabase configurado.
  // "demo": usa somente dados locais.
  DATA_MODE: "auto"
};
