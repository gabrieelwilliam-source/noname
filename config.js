window.IMOB_CONFIG = {
  // Cole aqui os dados do seu projeto Supabase.
  // Settings > API > Project URL e anon public key.
  SUPABASE_URL: "COLE_AQUI_A_URL_DO_SUPABASE",
  SUPABASE_ANON_KEY: "COLE_AQUI_A_CHAVE_ANON_DO_SUPABASE",

  // O fluxo e o SQL complementar usam "default".
  TENANT_ID: "default",

  // Webhook de produção do n8n.
  // Exemplo: https://seu-n8n.com/webhook/lais-imob-site-lead
  // Deixe vazio enquanto ainda não quiser disparar o fluxo.
  N8N_WEBHOOK_URL: "",

  // Número comercial usado no botão direto de WhatsApp.
  // Apenas números, com DDI e DDD.
  WHATSAPP_NUMBER: "5547990000000",

  BUSINESS_NAME: "Horizonte Prime Imóveis",
  BUSINESS_CITY: "Joinville",
  BUSINESS_STATE: "SC",

  // "auto": usa Supabase se estiver configurado; caso contrário, usa dados de demonstração.
  // "supabase": exige Supabase configurado.
  // "demo": usa somente dados locais.
  DATA_MODE: "auto"
};
