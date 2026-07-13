// Configurações principais do site — demo de atendimento consultivo.
// O visitante inicia pelo WhatsApp com o imóvel escolhido já identificado.
// O webhook direto permanece opcional para uma implantação futura.
window.SITE_CONFIG = {
  businessName: 'Horizonte Prime Imóveis',
  businessShortName: 'Horizonte Prime',
  city: 'Joinville',
  state: 'SC',
  whatsappNumber: '5547999762742',
  email: 'atendimento@horizonteprime.com.br',
  address: 'Joinville - SC',
  openingHours: 'Segunda a sábado, das 8h às 19h',

  // Integração de atendimento.
  // A demo inicia pelo WhatsApp: o site preenche a mensagem com o imóvel escolhido
  // e o workflow atende quando o visitante a envia. Não depende de webhook do site.
  useWebhook: false,
  webhookUrl: (window.IMOB_N8N_SITE_WEBHOOK_URL || (window.localStorage && localStorage.getItem('IMOB_N8N_SITE_WEBHOOK_URL')) || ''),
  n8nSiteWebhookPath: 'lais-imob-site-lead',
  leadDestinationLabel: 'equipe comercial',
  resultTitle: 'Lead estruturado recebido',
  salesWhatsappMessage: 'Olá, quero entender como essa automação pode atender, qualificar e organizar os leads da minha imobiliária.',

  // Campos comerciais usados no payload do lead.
  tenantId: 'horizonte-prime',
  leadSchemaVersion: 'site_lead_v100',
  privacyUrl: 'privacidade.html',
  termsUrl: 'termos.html'
};
