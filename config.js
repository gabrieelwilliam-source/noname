// Configurações principais do site e da demonstração comercial.
// Mantenha as credenciais/URLs do seu ambiente e troque apenas quando implantar em uma imobiliária cliente.
window.SITE_CONFIG = {
  businessName: 'Horizonte Prime Imóveis',
  businessShortName: 'Horizonte Prime',
  city: 'Joinville',
  state: 'SC',
  whatsappNumber: '5547999762742',
  email: 'atendimento@horizonteprime.com.br',
  address: 'Joinville - SC',
  openingHours: 'Segunda a sábado, das 8h às 19h',

  // Integração com n8n: quando preencher uma URL pública aqui, o site envia o lead por POST.
  // O fluxo n8n já espera o path: /webhook/lais-imob-site-lead
  useWebhook: false,
  webhookUrl: '',
  n8nSiteWebhookPath: 'lais-imob-site-lead',
  leadDestinationLabel: 'Automação n8n + WhatsApp comercial',

  // Mantém a demonstração segura quando ainda não houver URL pública do webhook no front.
  demoMode: true,
  demoResultTitle: 'Lead recebido pela automação',
  salesWhatsappMessage: 'Olá, vi a demonstração da automação para imobiliárias e quero entender como isso funcionaria na minha imobiliária.'
};
