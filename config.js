// Configurações principais do site.
window.SITE_CONFIG = {
  businessName: 'Horizonte Prime Imóveis',
  businessShortName: 'Horizonte Prime',
  city: 'Joinville',
  state: 'SC',
  whatsappNumber: '5547999762742',
  email: 'atendimento@horizonteprime.com.br',
  address: 'Joinville - SC',
  openingHours: 'Segunda a sábado, das 8h às 19h',

  // Integração: quando houver uma URL pública, o formulário envia os dados por POST. Sem URL, o atendimento abre pelo WhatsApp com mensagem pronta.
  useWebhook: false,
  webhookUrl: '',
  n8nSiteWebhookPath: 'lais-imob-site-lead',
  leadDestinationLabel: 'WhatsApp comercial',
  resultTitle: 'Solicitação recebida',
  salesWhatsappMessage: 'Olá, quero entender como esse atendimento funcionaria na minha imobiliária.'
};
