// Configurações principais do site — integração com a Iana V8.2.
// O formulário envia o contexto diretamente ao webhook da Iana e usa o WhatsApp como fallback em falha de rede.
window.SITE_CONFIG = {
  businessName: 'Horizonte Prime Imóveis',
  businessShortName: 'Horizonte Prime',
  city: 'Joinville',
  state: 'SC',
  whatsappNumber: '5547999762742',
  email: 'atendimento@horizonteprime.com.br',
  address: 'Joinville - SC',
  openingHours: 'Segunda a sábado, das 8h às 19h',

  // Integração com a entrada Site/Formulário da Iana.
  // A URL pode ser sobrescrita por window.IMOB_N8N_SITE_WEBHOOK_URL ou localStorage.
  useWebhook: true,
  webhookUrl: (window.IMOB_N8N_SITE_WEBHOOK_URL || (window.localStorage && localStorage.getItem('IMOB_N8N_SITE_WEBHOOK_URL')) || 'https://app.vps7376.panel.icontainer.cloud/webhook/iana-imob-site-lead'),
  n8nSiteWebhookPath: 'iana-imob-site-lead',
  webhookTransport: 'json',
  fallbackToWhatsapp: true,
  leadDestinationLabel: 'Iana',
  resultTitle: 'Atendimento iniciado',
  salesWhatsappMessage: 'Olá, quero atendimento imobiliário.',

  // Campos comerciais usados no payload do lead.
  tenantId: 'horizonte-prime',
  leadSchemaVersion: 'site_lead_v82',
  privacyUrl: 'privacidade.html',
  termsUrl: 'termos.html',

  // Recursos visuais. O comparador é real; percentuais heurísticos de “match” ficam desligados.
  enableCompare: true,
  enableFavorites: true,
  enableMatchScore: false
};
